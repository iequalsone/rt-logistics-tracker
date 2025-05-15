import { create } from "zustand";
import { Driver } from "../types/Driver";
import { Vehicle } from "../types/Vehicle";

export type OptimisticDriverState = {
  job?: string;
  status?: "Active" | "Idle" | "Offline";
};

interface LogisticsState {
  drivers: Driver[];
  vehicles: Vehicle[];
  optimistic: Record<string, OptimisticDriverState>;
  setDrivers: (drivers: Driver[]) => void;
  setVehicles: (vehicles: Vehicle[]) => void;
  setOptimistic: (driverId: string, update: OptimisticDriverState) => void;
  clearOptimistic: (driverId: string) => void;
  clearAllOptimistic: () => void;
  clearConfirmedOptimistic: (
    confirmed: { driverId: string; job?: string; status?: string }[]
  ) => void;
}

export const useLogisticsStore = create<LogisticsState>((set) => ({
  drivers: [],
  vehicles: [],
  optimistic: {},
  setDrivers: (drivers) => set({ drivers }),
  setVehicles: (vehicles) => set({ vehicles }),
  setOptimistic: (driverId, update) =>
    set((state) => ({
      optimistic: {
        ...state.optimistic,
        [driverId]: { ...state.optimistic[driverId], ...update },
      },
    })),
  clearOptimistic: (driverId) =>
    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [driverId]: _removed, ...rest } = state.optimistic;
      return { optimistic: rest };
    }),
  clearAllOptimistic: () => set({ optimistic: {} }),
  clearConfirmedOptimistic: (
    confirmed: { driverId: string; job?: string; status?: string }[]
  ) =>
    set((state) => {
      const newOptimistic = { ...state.optimistic };
      for (const conf of confirmed) {
        const opt = newOptimistic[conf.driverId];
        if (!opt) continue;
        // Only clear if optimistic matches confirmed
        let match = true;
        if (conf.job !== undefined && opt.job !== conf.job) match = false;
        if (conf.status !== undefined && opt.status !== conf.status)
          match = false;
        if (match) delete newOptimistic[conf.driverId];
      }
      return { optimistic: newOptimistic };
    }),
}));

// Centralized selectors for merged state
export function getMergedDriversSelector(
  drivers: Driver[],
  vehicles: Vehicle[],
  optimistic: Record<string, OptimisticDriverState>
): Driver[] {
  return drivers.map((driver) => {
    const vehicle = vehicles.find((v) => v.driverName === driver.name);
    const optimisticState = optimistic[driver.id];
    return {
      ...driver,
      status:
        optimisticState?.status ??
        (vehicle
          ? mapVehicleStatusToDriverStatus(vehicle.status)
          : driver.status),
      currentJob:
        optimisticState?.job ?? (vehicle ? vehicle.job : driver.currentJob),
    };
  });
}

function mapVehicleStatusToDriverStatus(
  vehicleStatus: string | undefined
): "Active" | "Idle" | "Offline" {
  if (!vehicleStatus) return "Offline";
  if (
    vehicleStatus.toLowerCase() === "en route" ||
    vehicleStatus.toLowerCase() === "active"
  )
    return "Active";
  if (vehicleStatus.toLowerCase() === "idle") return "Idle";
  return "Offline";
}

export function getMergedVehiclesSelector(
  vehicles: Vehicle[],
  drivers: Driver[],
  optimistic: Record<string, OptimisticDriverState>
): Vehicle[] {
  return vehicles.map((vehicle) => {
    const driver = drivers.find((d) => d.name === vehicle.driverName);
    const optimisticState = driver ? optimistic[driver.id] : undefined;

    // Create a new vehicle with optimistic updates
    const updatedVehicle = { ...vehicle };

    // Apply optimistic updates if available
    if (optimisticState) {
      if (optimisticState.job !== undefined) {
        updatedVehicle.job = optimisticState.job;
      }
      if (optimisticState.status !== undefined) {
        updatedVehicle.status = optimisticState.status;
      }
    }

    return updatedVehicle;
  });
}
