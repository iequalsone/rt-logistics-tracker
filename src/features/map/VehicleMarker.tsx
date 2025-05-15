import { forwardRef } from "react";
import { Marker, Popup } from "react-leaflet";
import L, { Marker as LeafletMarker } from "leaflet";
import { Vehicle } from "../../lib/types/Vehicle";
import { useLogisticsStore } from "@/lib/store/useLogisticsStore";

interface VehicleMarkerProps {
  vehicle: Vehicle;
}

const VehicleMarker = forwardRef<LeafletMarker, VehicleMarkerProps>(
  ({ vehicle }, ref) => {
    const optimisticState = useLogisticsStore((s) => s.optimistic);
    const drivers = useLogisticsStore((s) => s.drivers);

    // Find the driver associated with this vehicle
    const driver = drivers.find((d) => d.name === vehicle.driverName);

    // Check if there's a pending optimistic update for this driver
    const isPending = Boolean(driver?.id && optimisticState[driver.id]);

    // Get the optimistic status and job directly
    const optimisticUpdate = driver?.id
      ? optimisticState[driver.id]
      : undefined;
    const status = optimisticUpdate?.status || vehicle.status;
    const job = optimisticUpdate?.job || vehicle.job;

    const icon = new L.Icon({
      iconUrl: "/globe.svg",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    return (
      <Marker position={[vehicle.lat, vehicle.lng]} icon={icon} ref={ref}>
        <Popup>
          <div className="space-y-2">
            <div className="font-semibold flex items-center gap-2">
              Driver: {vehicle.driverName}
              {isPending && (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded bg-yellow-200 text-yellow-800 text-xs font-medium animate-pulse"
                  title="Pending update: syncing with server"
                >
                  Syncing
                </span>
              )}
            </div>
            <div>Status: {status}</div>
            <div>Route: {vehicle.route}</div>
            <div>Job: {job || "No job assigned"}</div>
          </div>
        </Popup>
      </Marker>
    );
  }
);

VehicleMarker.displayName = "VehicleMarker";

export default VehicleMarker;
