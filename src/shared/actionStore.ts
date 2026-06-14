/**
 * useActionStore — a load-once, refreshable cache of a resource list.
 *
 * Wraps a `ListControlsRoutes.list` call: `loadItems()` fetches once and
 * memoizes; `refreshItems()` re-fetches (guarded against overlap). Items are
 * sorted by name on the server.
 *
 * @example
 *   const store = useActionStore(useActionRoutes("/api/tags"));
 *   await store.loadItems();
 *   store.listItems.value; // ActionTargetItem[]
 */

import { ref, shallowRef } from "vue";
import type { ActionStore, ActionTargetItem, ListControlsRoutes } from "./action-types";

export function useActionStore(routes: ListControlsRoutes): ActionStore {
  const listItems = shallowRef<ActionTargetItem[]>([]);
  const isRefreshing = ref(false);
  const hasLoadedItems = ref(false);

  async function loadItems(): Promise<void> {
    if (hasLoadedItems.value) return;
    await refreshItems();
    hasLoadedItems.value = true;
  }

  async function refreshItems(): Promise<void> {
    if (isRefreshing.value) return;
    isRefreshing.value = true;
    const response = await routes.list({ sort: [{ column: "name" }] });
    listItems.value = response.data || [];
    isRefreshing.value = false;
  }

  return {
    listItems,
    isRefreshing,
    hasLoadedItems,
    loadItems,
    refreshItems,
  };
}
