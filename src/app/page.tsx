"use client";

import dynamic from "next/dynamic";
import DriverDashboard from "@/features/drivers/DriverDashboard";
import { useRef } from "react";
import { Marker as LeafletMarker } from "leaflet";
import L from "leaflet";
import DispatchPanel from "@/features/dispatch/DispatchPanel";
import { useDispatchActions } from "@/lib/hooks/useDispatchActions";

const MapView = dynamic(() => import("@/features/map/MapView"), { ssr: false });

export default function Home() {
  const markerRefs = useRef<Record<string, LeafletMarker | null>>({});
  const mapRef = useRef<L.Map | null>(null);
  const dispatchActions = useDispatchActions();

  return (
    <div className="flex h-screen w-screen">
      <aside className="w-full max-w-md border-r bg-background h-full overflow-y-auto">
        <DriverDashboard markerRefs={markerRefs} mapRef={mapRef} />
        <div className="mt-8">
          <DispatchPanel {...dispatchActions} />
        </div>
      </aside>
      <main className="flex-1 h-full">
        <MapView markerRefs={markerRefs} mapRef={mapRef} />
      </main>
    </div>
  );
}
