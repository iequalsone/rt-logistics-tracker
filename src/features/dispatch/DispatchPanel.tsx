import React from "react";
import { useState, useMemo } from "react";
import { useDrivers } from "@/lib/hooks/useDrivers";
import { Button } from "@/components/ui/button";
import AssignJobModal from "./AssignJobModal";
import {
  useLogisticsStore,
  getMergedDriversSelector,
} from "@/lib/store/useLogisticsStore";

// Remove unused assignJob and reassignJob from props
export default function DispatchPanel({
  completeJob,
  pauseResumeDriver,
  loading,
}: {
  completeJob: (driverId: string) => Promise<boolean>;
  pauseResumeDriver: (driverId: string, pause: boolean) => Promise<boolean>;
  loading: boolean;
}) {
  const { drivers } = useDrivers();
  const optimisticState = useLogisticsStore((s) => s.optimistic);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionDriver, setActionDriver] = useState<string | null>(null);
  const [actionType, setActionType] = useState<
    null | "reassign" | "complete" | "pause" | "resume"
  >(null);

  // Merge optimistic state into drivers for UI (centralized selector)
  const mergedDrivers = useMemo(
    () => getMergedDriversSelector(drivers, [], optimisticState),
    [drivers, optimisticState]
  );

  const handleAssignClick = (driverId: string) => {
    setSelectedDriver(driverId);
    setModalOpen(true);
  };

  const handleReassign = async (driverId: string) => {
    setActionDriver(driverId);
    setActionType("reassign");
    setModalOpen(true);
  };

  const handleComplete = async (driverId: string) => {
    await completeJob(driverId);
  };

  const handlePauseResume = async (driverId: string, pause: boolean) => {
    await pauseResumeDriver(driverId, pause);
  };

  return (
    <div className="p-4 border rounded-xl bg-card">
      <h2 className="text-lg font-semibold mb-4">Dispatch Actions</h2>
      <ul className="space-y-2">
        {mergedDrivers.map((driver) => {
          const isPending = Boolean(optimisticState[driver.id]);
          return (
            <li
              key={driver.id}
              className="flex items-center justify-between gap-2"
            >
              <span className="flex items-center gap-2">
                {driver.name}
                {isPending && (
                  <span
                    className="ml-1"
                    title="Pending update: action is syncing with server"
                  >
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-yellow-200 text-yellow-800 text-xs font-medium animate-pulse">
                      Syncing
                    </span>
                  </span>
                )}
              </span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  onClick={() => handleAssignClick(driver.id)}
                  disabled={loading}
                >
                  Assign Job
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReassign(driver.id)}
                  disabled={loading || !driver.currentJob}
                >
                  Reassign
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleComplete(driver.id)}
                  disabled={loading || !driver.currentJob}
                >
                  Complete
                </Button>
                {driver.status === "Active" ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handlePauseResume(driver.id, true)}
                    disabled={loading}
                  >
                    Pause
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handlePauseResume(driver.id, false)}
                    disabled={loading}
                  >
                    Resume
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {/* Assign or Reassign Modal */}
      <AssignJobModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setActionType(null);
            setActionDriver(null);
            setSelectedDriver(null);
          }
        }}
        driverId={actionType === "reassign" ? actionDriver : selectedDriver}
        mode={actionType === "reassign" ? "reassign" : "assign"}
      />
    </div>
  );
}
