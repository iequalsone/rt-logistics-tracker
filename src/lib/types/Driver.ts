export interface Driver {
  id: string;
  name: string;
  status: "Active" | "Idle" | "Offline";
  vehicleId?: string;
  currentJob?: string;
}
