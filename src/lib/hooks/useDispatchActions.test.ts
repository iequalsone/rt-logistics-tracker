import { describe, it, expect, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDispatchActions } from "../hooks/useDispatchActions";
import { useLogisticsStore } from "../store/useLogisticsStore";

vi.mock("../store/useLogisticsStore", async (importOriginal) => {
  const actual = await importOriginal();
  return Object.assign({}, actual, {
    useLogisticsStore: (fn: (store: Record<string, unknown>) => unknown) =>
      fn({
        setOptimistic: vi.fn(),
        clearOptimistic: vi.fn(),
        optimistic: {},
      }),
  });
});

vi.mock("@/components/ui/toast", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("useDispatchActions", () => {
  it("sets and clears optimistic state on assignJob", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({}) });
    const { result } = renderHook(() => useDispatchActions());
    await act(async () => {
      await result.current.assignJob("1", "Delivery");
    });
    expect(result.current.loading).toBe(false);
  });
});
