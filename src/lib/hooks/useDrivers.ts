import { useEffect, useState } from "react";
import { useLogisticsStore } from "../store/useLogisticsStore";

export function useDrivers() {
  const drivers = useLogisticsStore((s) => s.drivers);
  const setDrivers = useLogisticsStore((s) => s.setDrivers);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch drivers from mock backend
    const fetchDrivers = async () => {
      try {
        const res = await fetch("http://localhost:3002/drivers");
        if (!res.ok) throw new Error("Failed to fetch drivers");
        const data = await res.json();
        setDrivers(data);
        setError(null);
      } catch {
        setError("Failed to fetch drivers");
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, [setDrivers]);

  return { drivers, loading, error };
}
