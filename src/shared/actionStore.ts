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
import { FlashMessages } from "./flashMessages";

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
    try {
      const response = await routes.list({ sort: [{ column: "name" }] });
      listItems.value = response.data || [];
    } catch (error) {
      // DXUI-56: surface the failure instead of leaving isRefreshing stuck true
      FlashMessages.error(`Failed to refresh items: ${(error as Error)?.message || error}`);
    } finally {
      isRefreshing.value = false;
    }
  }

  return {
    listItems,
    isRefreshing,
    hasLoadedItems,
    loadItems,
    refreshItems,
  };
}
