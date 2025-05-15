import { FC } from "react";
import { Driver } from "@/lib/types/Driver";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLogisticsStore } from "@/lib/store/useLogisticsStore";

interface DriverCardProps {
  driver: Driver;
}

const statusColor: Record<Driver["status"], string> = {
  Active: "bg-green-500",
  Idle: "bg-yellow-500",
  Offline: "bg-gray-400",
};

const DriverCard: FC<DriverCardProps> = ({ driver }) => {
  // Show pending badge if optimistic update exists
  const optimisticState = useLogisticsStore((s) => s.optimistic);
  const isPending = Boolean(optimisticState[driver.id]);
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          {driver.name}
          {isPending && (
            <Badge
              className="bg-yellow-200 text-yellow-800 animate-pulse"
              title="Pending update: syncing with server"
            >
              Syncing
            </Badge>
          )}
        </CardTitle>
        <Badge className={statusColor[driver.status]}>{driver.status}</Badge>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {driver.currentJob ? (
          <div>Job: {driver.currentJob}</div>
        ) : (
          <div>No current job</div>
        )}
      </CardContent>
    </Card>
  );
};

export default DriverCard;
