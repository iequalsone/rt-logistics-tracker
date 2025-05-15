// Simple mock REST API for drivers, vehicles, and jobs
// Run with: node mocks/server.ts
import express from "express";
import cors from "cors";
import type { Request, Response } from "express";

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// In-memory mock data
const drivers = [
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

const vehicles = [
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

let jobs = [
  { id: "j1", type: "Delivery", assignedTo: "1", status: "active" },
  { id: "j2", type: "Pickup", assignedTo: "2", status: "active" },
];

// REST endpoints
app.get("/drivers", function (req: Request, res: Response) {
  res.json(drivers);
});
app.get("/vehicles", function (req: Request, res: Response) {
  res.json(vehicles);
});
app.get("/jobs", function (req: Request, res: Response) {
  res.json(jobs);
});

app.post("/assign-job", function (req: Request, res: Response) {
  const { driverId, job } = req.body;
  const driver = drivers.find((d) => d.id === driverId);
  if (driver) {
    driver.currentJob = job;
    driver.status = "Active";
    const vehicle = vehicles.find((v) => v.driverName === driver.name);
    if (vehicle) {
      vehicle.job = job;
      vehicle.status = "Active";
    }
    jobs.push({
      id: `j${jobs.length + 1}`,
      type: job,
      assignedTo: driverId,
      status: "active",
    });
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false });
  }
});

app.post("/pause-driver", function (req: Request, res: Response) {
  const { driverId } = req.body;
  const driver = drivers.find((d) => d.id === driverId);
  if (driver) {
    driver.status = "Offline";
    const vehicle = vehicles.find((v) => v.driverName === driver.name);
    if (vehicle) vehicle.status = "Offline";
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false });
  }
});

app.post("/resume-driver", function (req: Request, res: Response) {
  const { driverId } = req.body;
  const driver = drivers.find((d) => d.id === driverId);
  if (driver) {
    driver.status = "Active";
    const vehicle = vehicles.find((v) => v.driverName === driver.name);
    if (vehicle) vehicle.status = "Active";
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false });
  }
});

app.post("/complete-job", function (req: Request, res: Response) {
  const { driverId } = req.body;
  const driver = drivers.find((d) => d.id === driverId);
  if (driver) {
    driver.currentJob = null;
    driver.status = "Idle";
    const vehicle = vehicles.find((v) => v.driverName === driver.name);
    if (vehicle) {
      vehicle.job = null;
      vehicle.status = "Idle";
    }
    jobs = jobs.map((j) =>
      j.assignedTo === driverId ? { ...j, status: "completed" } : j
    );
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false });
  }
});

app.listen(PORT, () => {
  console.log(`Mock REST API server running on http://localhost:${PORT}`);
});
