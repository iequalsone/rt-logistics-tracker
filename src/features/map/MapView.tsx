import { MapContainer, TileLayer } from "react-leaflet";
import { Marker as LeafletMarker, Map as LeafletMap } from "leaflet";
import VehicleMarker from "./VehicleMarker";
import "leaflet/dist/leaflet.css";
import { FC, useMemo } from "react";
import { useRealTimeVehicles } from "@/lib/hooks/useRealTimeVehicles";
import {
  useLogisticsStore,
  getMergedVehiclesSelector,
} from "@/lib/store/useLogisticsStore";

interface MapViewProps {
  markerRefs: React.RefObject<Record<string, LeafletMarker | null>>;
  mapRef: React.RefObject<LeafletMap | null>;
}

const WS_URL = typeof window !== "undefined" ? `ws://localhost:3001` : "";

const MapView: FC<MapViewProps> = ({ markerRefs, mapRef }) => {
  // Use real-time vehicles
  const { loading, error, connectionStatus } = useRealTimeVehicles(WS_URL);

  const vehicles = useLogisticsStore((s) => s.vehicles);
  const drivers = useLogisticsStore((s) => s.drivers);
  const optimisticState = useLogisticsStore((s) => s.optimistic);

  // Merge optimistic state into vehicles for UI (centralized selector)
  const mergedVehicles = useMemo(
    () => getMergedVehiclesSelector(vehicles, drivers, optimisticState),
    [vehicles, drivers, optimisticState]
  );

  if (loading) return <div>Loading map...</div>;
  if (error) return <div>Error loading vehicles</div>;

  return (
    <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden">
      {/* Show connection status */}
      {connectionStatus !== "open" && (
        <div className="absolute top-2 left-2 z-50 bg-yellow-100 text-yellow-800 px-3 py-1 rounded shadow">
          {connectionStatus === "connecting" && "Connecting to live updates..."}
          {connectionStatus === "closed" && "Connection lost. Reconnecting..."}
          {connectionStatus === "error" && "WebSocket error."}
        </div>
      )}
      <MapContainer
        center={[37.7749, -122.4194]} // Center on San Francisco
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        whenReady={(...args: unknown[]) => {
          // Leaflet passes the event as the first argument
          const event = args[0] as { target?: unknown };
          if (event && event.target && typeof event.target === "object") {
            mapRef.current = event.target as LeafletMap;
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mergedVehicles.map((vehicle) => (
          <VehicleMarker
            key={vehicle.id}
            vehicle={vehicle}
            ref={(el) => {
              markerRefs.current[vehicle.id] = el;
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
