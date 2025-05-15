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
        // Check for optimistic updates before applying vehicle updates
        const optimisticState = useLogisticsStore.getState().optimistic;
        const hasOptimisticUpdates = Object.keys(optimisticState).length > 0;

        // Always update local state with vehicle position updates
        setVehicles(newVehicles);

        if (hasOptimisticUpdates) {
          // If we have optimistic updates in progress, don't overwrite them with WebSocket data
          // Instead, fetch the latest drivers from the REST API which should have the correct data
          console.log(
            "Optimistic updates in progress, prioritizing REST API data"
          );
        } else {
          // No optimistic updates, safe to update from WebSocket
          setStoreVehicles(newVehicles);
        }

        // Always fetch latest drivers from backend REST API (source of truth)
        let drivers: import("@/lib/types/Driver").Driver[] = [];
        try {
          const res = await fetch("http://localhost:3002/drivers");
          if (res.ok) {
            drivers = await res.json();
            setStoreDrivers(drivers);
          }
        } catch {}
        // Only process optimistic confirmations if we're getting driver data from REST API
        if (drivers.length > 0) {
          // Compare merged drivers to previous optimistic state
          const optimistic = useLogisticsStore.getState().optimistic;
          const confirmed: {
            driverId: string;
            job?: string;
            status?: string;
          }[] = [];

          console.log(
            "Checking REST API data for optimistic update confirmation"
          );

          for (const driver of drivers) {
            const opt = optimistic[driver.id];
            if (!opt) continue;

            console.log(
              `Checking driver ${driver.name}: API status=${driver.status}, currentJob=${driver.currentJob}`
            );
            console.log(
              `Optimistic state: status=${opt.status}, job=${opt.job}`
            );

            // Only consider optimistic updates confirmed if the server returned matching values
            // For job assignments, we need to check if the job was assigned AND status was updated
            if (opt.job !== undefined && opt.status === "Active") {
              // For job assignments that also update status
              if (driver.currentJob === opt.job && driver.status === "Active") {
                console.log(
                  `✅ Confirmed job+status update for ${driver.name}`
                );
                confirmed.push({
                  driverId: driver.id,
                  job: opt.job,
                  status: opt.status,
                });
              } else {
                console.log(
                  `❌ Job+status update not yet confirmed for ${driver.name}`
                );
              }
            } else if (opt.job !== undefined && driver.currentJob === opt.job) {
              // For job updates only
              console.log(`✅ Confirmed job update for ${driver.name}`);
              confirmed.push({
                driverId: driver.id,
                job: opt.job,
              });
            } else if (
              opt.status !== undefined &&
              driver.status === opt.status
            ) {
              // For status updates only
              console.log(`✅ Confirmed status update for ${driver.name}`);
              confirmed.push({
                driverId: driver.id,
                status: opt.status,
              });
            }
          }
          if (confirmed.length > 0) {
            console.log(
              `Clearing ${confirmed.length} confirmed optimistic updates`
            );
            clearConfirmedOptimistic(confirmed);
          }
        }
      }
      setLoading(false);
    },
    [setStoreVehicles, setStoreDrivers, clearConfirmedOptimistic]
  );

  // Monitor optimistic updates and force refresh when needed
  const optimisticState = useLogisticsStore((state) => state.optimistic);

  // When we detect optimistic updates need to be synchronized with server
  useEffect(() => {
    const hasOptimistic = Object.keys(optimisticState).length > 0;

    if (hasOptimistic) {
      console.log("Detected optimistic updates, scheduling REST API check");

      // Force a REST API refetch after a short delay
      const timer = setTimeout(async () => {
        console.log(
          "Forcing REST API refetch to check for optimistic update confirmation"
        );
        try {
          const res = await fetch("http://localhost:3002/drivers");
          if (res.ok) {
            const drivers =
              (await res.json()) as import("@/lib/types/Driver").Driver[];
            setStoreDrivers(drivers);

            // Log which drivers we're checking
            drivers.forEach((driver: import("@/lib/types/Driver").Driver) => {
              const opt = optimisticState[driver.id];
              if (opt) {
                console.log(
                  `Checking driver ${driver.name}: server status=${driver.status}, job=${driver.currentJob}`
                );
              }
            });
          }
        } catch (err) {
          console.error("Error fetching driver data:", err);
        }
      }, 1000); // Slightly longer delay to ensure the server has processed our change

      return () => clearTimeout(timer);
    }
  }, [optimisticState, setStoreDrivers]);

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
