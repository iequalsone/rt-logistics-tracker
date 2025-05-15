import { FC, useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDrivers } from "@/lib/hooks/useDrivers";
import DriverList from "./DriverList";
import { useLogisticsStore } from "@/lib/store/useLogisticsStore";
import type { Driver } from "@/lib/types/Driver";

interface DriverDashboardProps {
  markerRefs: React.RefObject<Record<string, import("leaflet").Marker | null>>;
  mapRef: React.RefObject<import("leaflet").Map | null>;
}

const statusTabs = [
  { label: "All", value: "all" },
  { label: "Active", value: "Active" },
  { label: "Idle", value: "Idle" },
  { label: "Offline", value: "Offline" },
];

const DriverDashboard: FC<DriverDashboardProps> = ({ markerRefs, mapRef }) => {
  // Only loading and error are needed from useDrivers now
  const { loading, error } = useDrivers();
  const vehicles = useLogisticsStore((s) => s.vehicles);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const handleDriverClick = (driver: Driver) => {
    const vehicle = vehicles.find((v) => v.driverName === driver.name);
    if (vehicle && markerRefs.current[vehicle.id]) {
      markerRefs.current[vehicle.id]?.openPopup();
      if (mapRef.current) {
        mapRef.current.setView(
          [vehicle.lat, vehicle.lng],
          mapRef.current.getZoom(),
          { animate: true }
        );
      }
      // Add highlight class to marker icon
      const marker = markerRefs.current[vehicle.id];
      if (marker && marker.getElement) {
        // Remove highlight from all markers first
        Object.values(markerRefs.current).forEach((m) => {
          if (m && m.getElement) {
            m.getElement()?.classList.remove(
              "ring-4",
              "ring-blue-500",
              "z-[1000]"
            );
          }
        });
        marker
          .getElement()
          ?.classList.add("ring-4", "ring-blue-500", "z-[1000]");
      }
    }
  };

  if (loading) return <div>Loading drivers...</div>;
  if (error) return <div>Error loading drivers</div>;

  return (
    <div className="p-4 w-full max-w-md mx-auto">
      <Input
        placeholder="Search drivers..."
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearch(e.target.value)
        }
        className="mb-4"
      />
      <Tabs value={status} onValueChange={setStatus} className="mb-4">
        <TabsList>
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <DriverList
        onDriverClick={handleDriverClick}
        status={status}
        searchQuery={search}
      />
    </div>
  );
};

export default DriverDashboard;
