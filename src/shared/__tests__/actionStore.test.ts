import { describe, expect, it, vi } from "vitest";
import { useActionStore } from "../actionStore";
import type { ListControlsRoutes, PagedItems } from "../action-types";

function makeRoutes(listImpl: ListControlsRoutes["list"]): ListControlsRoutes {
  return { list: listImpl };
}

describe("useActionStore", () => {
  it("loads items once and memoizes", async () => {
    const list = vi.fn(
      async (): Promise<PagedItems> => ({ data: [{ __type: "T", id: 1 }], meta: undefined })
    );
    const store = useActionStore(makeRoutes(list));
    await store.loadItems();
    await store.loadItems();
    expect(list).toHaveBeenCalledTimes(1);
    expect(store.hasLoadedItems.value).toBe(true);
    expect(store.listItems.value).toHaveLength(1);
  });

  it("sorts by name when listing", async () => {
    const list = vi.fn(async (): Promise<PagedItems> => ({ data: [], meta: undefined }));
    const store = useActionStore(makeRoutes(list));
    await store.refreshItems();
    expect(list).toHaveBeenCalledWith({ sort: [{ column: "name" }] });
  });

  it("falls back to an empty list when data is missing", async () => {
    const list = vi.fn(async (): Promise<PagedItems> => ({ data: undefined, meta: undefined }));
    const store = useActionStore(makeRoutes(list));
    await store.refreshItems();
    expect(store.listItems.value).toEqual([]);
  });

  it("guards against overlapping refreshes", async () => {
    let resolveList!: (v: PagedItems) => void;
    const list = vi.fn(
      () =>
        new Promise<PagedItems>((resolve) => {
          resolveList = resolve;
        })
    );
    const store = useActionStore(makeRoutes(list));
    const first = store.refreshItems();
    expect(store.isRefreshing.value).toBe(true); // guard is engaged
    const second = store.refreshItems(); // should early-return while first is in flight
    resolveList({ data: [], meta: undefined });
    await Promise.all([first, second]);
    expect(list).toHaveBeenCalledTimes(1);
    expect(store.isRefreshing.value).toBe(false); // cleared after completion
  });
});
