import React from "react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDispatchActions } from "@/lib/hooks/useDispatchActions";

const JOB_OPTIONS = ["Delivery", "Pickup", "Maintenance"];

export default function AssignJobModal({
  open,
  onOpenChange,
  driverId,
  mode = "assign",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driverId: string | null;
  mode?: "assign" | "reassign";
}) {
  const [selectedJob, setSelectedJob] = useState<string>("");
  const { assignJob, reassignJob, loading } = useDispatchActions();

  const handleAssign = async () => {
    if (driverId && selectedJob) {
      const fn = mode === "reassign" ? reassignJob : assignJob;
      const success = await fn(driverId, selectedJob);
      if (success) {
        onOpenChange(false);
        setSelectedJob("");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>
          {mode === "reassign" ? "Reassign Job" : "Assign Job"}
        </DialogTitle>
        <div className="space-y-4">
          <select
            className="w-full border rounded p-2"
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
          >
            <option value="">Select a job</option>
            {JOB_OPTIONS.map((job) => (
              <option key={job} value={job}>
                {job}
              </option>
            ))}
          </select>
          <Button onClick={handleAssign} disabled={!selectedJob || loading}>
            {loading
              ? mode === "reassign"
                ? "Reassigning..."
                : "Assigning..."
              : mode === "reassign"
              ? "Reassign"
              : "Assign"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
