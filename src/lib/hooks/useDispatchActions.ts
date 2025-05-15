import { useState } from "react";
import { toast } from "@/components/ui/toast";
import { useLogisticsStore } from "../store/useLogisticsStore";

export function useDispatchActions() {
  const [loading, setLoading] = useState(false);
  const setOptimistic = useLogisticsStore((s) => s.setOptimistic);
  const clearOptimistic = useLogisticsStore((s) => s.clearOptimistic);
  const optimisticState = useLogisticsStore((s) => s.optimistic);

  async function assignJob(driverId: string, job: string): Promise<boolean> {
    setLoading(true);
    setOptimistic(driverId, { job, status: "Active" });
    try {
      const res = await fetch("http://localhost:3002/assign-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, job }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Job '${job}' assigned to driver.`);
      setLoading(false);
      clearOptimistic(driverId);
      return true;
    } catch {
      clearOptimistic(driverId);
      toast.error("Failed to assign job. Please try again.");
      setLoading(false);
      return false;
    }
  }

  async function reassignJob(driverId: string, job: string): Promise<boolean> {
    setLoading(true);
    setOptimistic(driverId, { job, status: "Active" });
    try {
      const res = await fetch("http://localhost:3002/assign-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, job }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Job '${job}' reassigned to driver.`);
      setLoading(false);
      clearOptimistic(driverId);
      return true;
    } catch {
      clearOptimistic(driverId);
      toast.error("Failed to reassign job. Please try again.");
      setLoading(false);
      return false;
    }
  }

  async function completeJob(driverId: string): Promise<boolean> {
    setLoading(true);
    setOptimistic(driverId, { job: undefined, status: "Idle" });
    try {
      const res = await fetch("http://localhost:3002/complete-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId }),
      });
      if (!res.ok) throw new Error();
      toast.success("Job marked as completed.");
      setLoading(false);
      clearOptimistic(driverId);
      return true;
    } catch {
      clearOptimistic(driverId);
      toast.error("Failed to complete job. Please try again.");
      setLoading(false);
      return false;
    }
  }

  async function pauseResumeDriver(
    driverId: string,
    pause: boolean
  ): Promise<boolean> {
    setLoading(true);
    setOptimistic(driverId, { status: pause ? "Offline" : "Active" });
    try {
      const res = await fetch(
        `http://localhost:3002/${pause ? "pause-driver" : "resume-driver"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ driverId }),
        }
      );
      if (!res.ok) throw new Error();
      toast.success(pause ? "Driver paused." : "Driver resumed.");
      setLoading(false);
      clearOptimistic(driverId);
      return true;
    } catch {
      clearOptimistic(driverId);
      toast.error(
        `Failed to ${pause ? "pause" : "resume"} driver. Please try again.`
      );
      setLoading(false);
      return false;
    }
  }

  return {
    assignJob,
    reassignJob,
    completeJob,
    pauseResumeDriver,
    loading,
    optimisticState,
  };
}
