// Shared data for both REST API and WebSocket servers

export type Driver = {
  id: string;
  name: string;
  status: "Active" | "Idle" | "Offline";
  vehicleId: string | null;
  currentJob: string | null;
};

export type Vehicle = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  driverName: string;
  status: string;
  route: string;
  job: string | null;
};

export type Job = {
  id: string;
  type: string;
  assignedTo: string;
  status: string;
};

// Shared data instances
export const drivers: Driver[] = [
  {
    id: "1",
    name: "Alice",
    status: "Active",
    vehicleId: "1",
    currentJob: "Delivery",
  },
  {
    id: "2",
    name: "Bob",
    status: "Idle",
    vehicleId: "2",
    currentJob: "Pickup",
  },
  {
    id: "3",
    name: "Charlie",
    status: "Offline",
    vehicleId: null,
    currentJob: null,
  },
];

export const vehicles: Vehicle[] = [
  {
    id: "1",
    name: "Truck 1",
    lat: 37.7749,
    lng: -122.4194,
    driverName: "Alice",
    status: "Active",
    route: "A",
    job: "Delivery",
  },
  {
    id: "2",
    name: "Van 2",
    lat: 37.7849,
    lng: -122.4094,
    driverName: "Bob",
    status: "Idle",
    route: "B",
    job: "Pickup",
  },
  {
    id: "3",
    name: "Car 3",
    lat: 37.7649,
    lng: -122.4294,
    driverName: "Charlie",
    status: "Offline",
    route: "C",
    job: null,
  },
];

// Using a class to manage jobs so we can update them without reassigning
export class JobManager {
  private _jobs: Job[] = [
    { id: "j1", type: "Delivery", assignedTo: "1", status: "active" },
    { id: "j2", type: "Pickup", assignedTo: "2", status: "active" },
  ];

  get jobs(): Job[] {
    return this._jobs;
  }

  addJob(job: Job): void {
    this._jobs.push(job);
  }

  updateJobStatus(assignedTo: string, status: string): void {
    this._jobs = this._jobs.map((j) =>
      j.assignedTo === assignedTo ? { ...j, status } : j
    );
  }
}

export const jobManager = new JobManager();
