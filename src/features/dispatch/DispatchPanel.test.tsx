import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DispatchPanel from "../../features/dispatch/DispatchPanel";
import { useLogisticsStore } from "../../lib/store/useLogisticsStore";
import { useDrivers } from "../../lib/hooks/useDrivers";
import React from "react";
import "@testing-library/jest-dom";

// Mock hooks
vi.mock("@/lib/hooks/useDrivers", () => ({
  useDrivers: () => ({
    drivers: [
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
    ],
    loading: false,
    error: null,
  }),
}));

vi.mock("../../lib/store/useLogisticsStore", async (importOriginal) => {
  const actual = await importOriginal();
  return Object.assign({}, actual, {
    useLogisticsStore: (fn: (store: Record<string, unknown>) => unknown) =>
      fn({
        optimistic: { "1": { job: "Pickup", status: "Idle" } },
      }),
  });
});

describe("DispatchPanel", () => {
  it("shows syncing badge for drivers with pending optimistic updates", () => {
    render(
      <DispatchPanel
        completeJob={async () => true}
        pauseResumeDriver={async () => true}
        loading={false}
      />
    );
    expect(screen.getByText("Syncing")).toBeInTheDocument();
  });
});
