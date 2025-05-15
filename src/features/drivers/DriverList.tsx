import { FC } from "react";
import DriverCard from "./DriverCard";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { useLogisticsStore } from "@/lib/store/useLogisticsStore";
import { getMergedDriversSelector } from "@/lib/store/useLogisticsStore";
import type { Driver } from "@/lib/types/Driver";

const ITEM_SIZE = 80; // px, adjust as needed for card height

interface DriverListProps {
  onDriverClick?: (driver: Driver) => void;
  status?: string;
  searchQuery?: string;
}

const DriverList: FC<DriverListProps> = ({
  onDriverClick,
  status = "all",
  searchQuery = "",
}) => {
  // Get merged drivers from the central store (includes optimistic updates)
  const allDrivers = useLogisticsStore((state) =>
    getMergedDriversSelector(state.drivers, state.vehicles, state.optimistic)
  );

  // Filter drivers based on status and search query
  const mergedDrivers = allDrivers.filter((driver) => {
    // Filter by status if not "all"
    const statusMatch = status === "all" || driver.status === status;

    // Filter by search query if provided
    const searchMatch =
      !searchQuery ||
      driver.name.toLowerCase().includes(searchQuery.toLowerCase());

    return statusMatch && searchMatch;
  });

  if (!mergedDrivers.length)
    return <div className="text-muted-foreground">No drivers found.</div>;

  // react-window row renderer
  const Row = ({ index, style }: ListChildComponentProps) => {
    const driver = mergedDrivers[index];
    // Add more detailed logging to help debug status issues
    const optimisticState = useLogisticsStore((s) => s.optimistic[driver.id]);
    console.log(
      `Driver ${driver.name}: status=${
        driver.status
      }, optimistic=${JSON.stringify(optimisticState)}`
    );
    return (
      <div
        style={style}
        key={driver.id}
        onClick={() => onDriverClick?.(driver)}
        className="cursor-pointer"
      >
        <DriverCard driver={driver} />
      </div>
    );
  };

  return (
    <div style={{ height: 480, width: "100%" }}>
      <AutoSizer disableWidth>
        {({ height }: { height: number }) => (
          <List
            height={height}
            itemCount={mergedDrivers.length}
            itemSize={ITEM_SIZE}
            width={"100%"}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
};

export default DriverList;
