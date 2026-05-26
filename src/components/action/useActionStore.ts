/**
 * useActionStore - Lazy-loaded list store for action route integrations
 *
 * Wraps a `routes.list()` call with load-once / refresh-on-demand semantics.
 * Useful for populating select lists whose data rarely changes (e.g., enum-like
 * entities: statuses, categories, users).
 *
 * @example
 *   const { listItems, loadItems } = useActionStore(myRoutes);
 *   onMounted(loadItems);
 *
 * @returns `UseActionStoreReturn`
 */

import { ref, shallowRef } from "vue";
import type { ActionTargetItem } from "../../shared/types";

export interface ListControllerRoutes {
  /** Fetch a paginated or plain list of items. */
  list: (filter: object) => Promise<{ data?: ActionTargetItem[] } | ActionTargetItem[]>;
}

export interface ListController {
  /** Activate a panel (e.g. "edit") for a specific item. */
  activatePanel?: (target: ActionTargetItem, panel: string) => void;
  /** Refresh both the list and any associated summary data. */
  loadListAndSummary?: () => void;
}

export interface UseActionStoreReturn {
  /** Reactive list populated by `loadItems` / `refreshItems`. */
  listItems: ReturnType<typeof shallowRef<ActionTargetItem[]>>;
  /** `true` while a refresh is in flight. */
  isRefreshing: ReturnType<typeof ref<boolean>>;
  /** `true` once the first load has completed. */
  hasLoadedItems: ReturnType<typeof ref<boolean>>;
  /** Load items once; subsequent calls are no-ops until `refreshItems` is called. */
  loadItems: () => Promise<void>;
  /** Always re-fetches, even if already loaded. */
  refreshItems: () => Promise<void>;
}

export function useActionStore(routes: ListControllerRoutes): UseActionStoreReturn {
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
    const result = await routes.list({ sort: [{ column: "name" }] });
    listItems.value = (Array.isArray(result) ? result : result.data) ?? [];
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
