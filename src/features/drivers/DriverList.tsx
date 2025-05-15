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
}

const DriverList: FC<DriverListProps> = ({ onDriverClick }) => {
  // Get merged drivers from the central store (includes optimistic updates)
  const mergedDrivers = useLogisticsStore((state) =>
    getMergedDriversSelector(state.drivers, state.vehicles, state.optimistic)
  );

  if (!mergedDrivers.length)
    return <div className="text-muted-foreground">No drivers found.</div>;

  // react-window row renderer
  const Row = ({ index, style }: ListChildComponentProps) => {
    const driver = mergedDrivers[index];
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
