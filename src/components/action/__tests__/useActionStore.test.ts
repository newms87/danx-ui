import { describe, it, expect, vi } from "vitest";
import { useActionStore } from "../useActionStore";
import type { ActionTargetItem } from "../../../shared/types";

function makeRoutes(items: ActionTargetItem[] = []) {
  return {
    list: vi.fn().mockResolvedValue({ data: items }),
  };
}

describe("useActionStore", () => {
  describe("initial state", () => {
    it("starts with empty listItems", () => {
      const { listItems } = useActionStore(makeRoutes());
      expect(listItems.value).toEqual([]);
    });

    it("starts with isRefreshing=false", () => {
      const { isRefreshing } = useActionStore(makeRoutes());
      expect(isRefreshing.value).toBe(false);
    });

    it("starts with hasLoadedItems=false", () => {
      const { hasLoadedItems } = useActionStore(makeRoutes());
      expect(hasLoadedItems.value).toBe(false);
    });
  });

  describe("loadItems", () => {
    it("populates listItems on first call", async () => {
      const items: ActionTargetItem[] = [{ isSaving: false }, { isSaving: false }];
      const { listItems, loadItems } = useActionStore(makeRoutes(items));

      await loadItems();
      expect(listItems.value).toEqual(items);
    });

    it("sets hasLoadedItems after first load", async () => {
      const { hasLoadedItems, loadItems } = useActionStore(makeRoutes());
      expect(hasLoadedItems.value).toBe(false);
      await loadItems();
      expect(hasLoadedItems.value).toBe(true);
    });

    it("is a no-op on subsequent calls (load once)", async () => {
      const routes = makeRoutes([{ isSaving: false }]);
      const { loadItems } = useActionStore(routes);

      await loadItems();
      await loadItems();
      await loadItems();

      expect(routes.list).toHaveBeenCalledTimes(1);
    });
  });

  describe("refreshItems", () => {
    it("re-fetches even when already loaded", async () => {
      const routes = makeRoutes([{ isSaving: false }]);
      const { loadItems, refreshItems } = useActionStore(routes);

      await loadItems();
      await refreshItems();

      expect(routes.list).toHaveBeenCalledTimes(2);
    });

    it("is a no-op when a refresh is already in flight", async () => {
      const routes = {
        list: vi
          .fn()
          .mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve({ data: [] }), 100))
          ),
      };
      const { refreshItems } = useActionStore(routes);

      const p1 = refreshItems();
      const p2 = refreshItems(); // should be ignored
      await Promise.all([p1, p2]);

      expect(routes.list).toHaveBeenCalledTimes(1);
    });

    it("clears isRefreshing after completion", async () => {
      const { isRefreshing, refreshItems } = useActionStore(makeRoutes());
      await refreshItems();
      expect(isRefreshing.value).toBe(false);
    });

    it("handles plain array response (no .data wrapper)", async () => {
      const items: ActionTargetItem[] = [{ isSaving: false }];
      const routes = { list: vi.fn().mockResolvedValue(items) };
      const { listItems, refreshItems } = useActionStore(routes);

      await refreshItems();
      expect(listItems.value).toEqual(items);
    });

    it("falls back to an empty array when the response has no data", async () => {
      const routes = { list: vi.fn().mockResolvedValue({}) };
      const { listItems, refreshItems } = useActionStore(routes);

      await refreshItems();
      expect(listItems.value).toEqual([]);
    });

    it("passes sort filter to routes.list", async () => {
      const routes = makeRoutes();
      const { loadItems } = useActionStore(routes);

      await loadItems();
      expect(routes.list).toHaveBeenCalledWith({ sort: [{ column: "name" }] });
    });
  });
});
