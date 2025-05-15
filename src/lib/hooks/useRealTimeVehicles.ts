import { useCallback, useEffect, useState } from "react";
import { useWebSocket } from "./useWebSocket";
import { Vehicle } from "@/lib/types/Vehicle";
import { useLogisticsStore } from "@/lib/store/useLogisticsStore";

export function useRealTimeVehicles(url: string) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "open" | "closed" | "error"
  >("connecting");

  const setStoreVehicles = useLogisticsStore((s) => s.setVehicles);
  const setStoreDrivers = useLogisticsStore((s) => s.setDrivers);
  const clearConfirmedOptimistic = useLogisticsStore(
    (s) => s.clearConfirmedOptimistic
  );

  const handleMessage = useCallback(
    async (data: unknown) => {
      let newVehicles: Vehicle[] | undefined;
      if (Array.isArray(data)) {
        newVehicles = data as Vehicle[];
      } else if (
        data &&
        typeof data === "object" &&
        "type" in data &&
        (data as { type?: string }).type === "update" &&
        "vehicles" in data
      ) {
        newVehicles = (data as { vehicles: Vehicle[] }).vehicles;
      }
      if (newVehicles) {
        setVehicles(newVehicles);
        setStoreVehicles(newVehicles);
        // Fetch latest drivers from backend and update store
        let drivers: import("@/lib/types/Driver").Driver[] = [];
        try {
          const res = await fetch("http://localhost:3002/drivers");
          if (res.ok) {
            drivers = await res.json();
            setStoreDrivers(drivers);
          }
        } catch {}
        // Clear only confirmed optimistic state
        if (drivers.length > 0) {
          // Compare merged drivers to previous optimistic state
          const optimistic = useLogisticsStore.getState().optimistic;
          const confirmed: {
            driverId: string;
            job?: string;
            status?: string;
          }[] = [];
          for (const driver of drivers) {
            const opt = optimistic[driver.id];
            if (!opt) continue;
            // If backend driver matches optimistic job/status, consider confirmed
            if (
              (opt.job === undefined || opt.job === driver.currentJob) &&
              (opt.status === undefined || opt.status === driver.status)
            ) {
              confirmed.push({
                driverId: driver.id,
                job: driver.currentJob,
                status: driver.status,
              });
            }
          }
          if (confirmed.length > 0) clearConfirmedOptimistic(confirmed);
        }
      }
      setLoading(false);
    },
    [setStoreVehicles, setStoreDrivers, clearConfirmedOptimistic]
  );

  useWebSocket({
    url,
    onMessage: handleMessage,
    onOpen: () => setConnectionStatus("open"),
    onClose: () => setConnectionStatus("closed"),
    onError: () => setConnectionStatus("error"),
  });

  useEffect(() => {
    if (connectionStatus === "error") {
      setError("WebSocket connection error");
    } else {
      setError(null);
    }
  }, [connectionStatus]);

  return { vehicles, loading, error, connectionStatus };
}
