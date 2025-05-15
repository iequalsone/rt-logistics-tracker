import { describe, it, expect } from "vitest";
import { getMergedDriversSelector } from "../store/useLogisticsStore";
import type { Driver } from "../types/Driver";
import type { Vehicle } from "../types/Vehicle";

const drivers: Driver[] = [
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
    vehicleId: undefined,
    currentJob: undefined,
  },
];

const vehicles: Vehicle[] = [
  {
    id: "1",
    name: "Truck 1",
    lat: 0,
    lng: 0,
    driverName: "Alice",
    status: "Active",
    route: "A",
    job: "Delivery",
  },
  {
    id: "2",
    name: "Van 2",
    lat: 0,
    lng: 0,
    driverName: "Bob",
    status: "Idle",
    route: "B",
    job: "Pickup",
  },
];

describe("getMergedDriversSelector", () => {
  it("merges optimistic state for job and status", () => {
    const optimistic = { "1": { job: "Pickup", status: "Idle" } };
    const merged = getMergedDriversSelector(drivers, vehicles, optimistic);
    expect(merged[0].currentJob).toBe("Pickup");
    expect(merged[0].status).toBe("Idle");
  });

  it("falls back to vehicle status/job if no optimistic", () => {
    const merged = getMergedDriversSelector(drivers, vehicles, {});
    expect(merged[0].currentJob).toBe("Delivery");
    expect(merged[0].status).toBe("Active");
    expect(merged[1].currentJob).toBe("Pickup");
    expect(merged[1].status).toBe("Idle");
  });

  it("handles missing vehicle gracefully", () => {
    const merged = getMergedDriversSelector(drivers, [], {});
    expect(merged[2].status).toBe("Offline");
  });
});
