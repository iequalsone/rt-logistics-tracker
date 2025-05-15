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
    // Find driverId by matching vehicle.driverName to a driver in the store
    const driverId = Object.keys(optimisticState).find((id) => {
      // Try to match by driver name (assuming driverName is unique)
      // This assumes you have access to a driver list in context; otherwise, fallback to id
      // For now, fallback: if vehicle.driverName is in optimisticState keys
      return (
        id === vehicle.driverName ||
        vehicle.driverName.toLowerCase().includes(id.toLowerCase())
      );
    });
    const isPending = Boolean(driverId && optimisticState[driverId]);

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
            <div>Status: {vehicle.status}</div>
            <div>Route: {vehicle.route}</div>
            <div>Job: {vehicle.job}</div>
          </div>
        </Popup>
      </Marker>
    );
  }
);

VehicleMarker.displayName = "VehicleMarker";

export default VehicleMarker;
