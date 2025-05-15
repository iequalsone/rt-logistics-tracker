import { useEffect, useState } from "react";
import { useLogisticsStore } from "../store/useLogisticsStore";

export function useVehicles() {
  const vehicles = useLogisticsStore((s) => s.vehicles);
  const setVehicles = useLogisticsStore((s) => s.setVehicles);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch vehicles from mock backend
    const fetchVehicles = async () => {
      try {
        const res = await fetch("http://localhost:3002/vehicles");
        if (!res.ok) throw new Error("Failed to fetch vehicles");
        const data = await res.json();
        setVehicles(data);
        setError(null);
      } catch {
        setError("Failed to fetch vehicles");
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, [setVehicles]);

  return { vehicles, loading, error };
}
