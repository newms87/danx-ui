/**
 * useActionRoutes — standard REST routes for a resource, wired to the store.
 *
 * Returns a `ListControlsRoutes` whose `list`/`details`/`applyAction` results are
 * pushed through `storeObject(s)` so the UI shares reactive instances. The list
 * ref is auto-registered for optimistic deletes.
 *
 * `export` is intentionally omitted: danx-ui's `downloadFile` is client-only and
 * server-aware (POST + filter) downloads belong in the consumer's app layer.
 * Supply one via the `extend` argument if needed.
 *
 * @example
 *   const routes = useActionRoutes("/api/users");
 *   const { data } = await routes.list({ page: 1 });
 */

import { ref } from "vue";
import { registerList, storeObject, storeObjects, canonicalizeResult } from "./objectStore";
import { request } from "./request";
import type {
  ActionTargetItem,
  ApplyActionResponse,
  ListControlsRoutes,
  PagedItems,
} from "./action-types";
import type { AnyObject, TypedObject } from "./store-types";

export function useActionRoutes<T extends ActionTargetItem = ActionTargetItem>(
  baseUrl: string,
  extend?: Partial<ListControlsRoutes<T>>
): ListControlsRoutes<T> {
  // Track the most recent list result so optimistic deletes can splice it.
  // Lives for the controller's lifetime — no unregister needed.
  const listRef = ref<TypedObject[]>([]);
  registerList(listRef);

  return {
    async list(pager, options) {
      options = { ...options, ignoreAbort: true };
      const response = (await request.post(`${baseUrl}/list`, pager, options)) as PagedItems<T>;
      if (response.data) {
        response.data = storeObjects(response.data);
        listRef.value = response.data;
        response.data = listRef.value as T[];
      }
      return response;
    },

    summary(filter, options) {
      options = { ...options, ignoreAbort: true };
      return request.post(`${baseUrl}/summary`, { filter }, options) as Promise<AnyObject>;
    },

    async details(target, fields, options) {
      options = { ...options, ignoreAbort: true };
      if (fields) {
        options.params = { ...options.params, fields };
      }
      const item = await request.get(`${baseUrl}/${target.id}/details`, options);
      return storeObject(item as T);
    },

    fieldOptions(options) {
      return request.get(`${baseUrl}/field-options`, options) as Promise<AnyObject>;
    },

    async applyAction(action, target, data, options) {
      options = {
        ...options,
        waitOnPrevious: true,
        useMostRecentResponse: true,
        headers: {
          ...options?.headers,
          "X-Timestamp": Date.now().toString(),
        },
      };
      const response = (await request.post(
        `${baseUrl}/${target ? target.id + "/" : ""}apply-action`,
        { action, data: data || {} },
        options
      )) as ApplyActionResponse<T>;

      canonicalizeResult(response);

      return response;
    },

    batchAction(action, targets, data, options) {
      options = { ...options, waitOnPrevious: true };
      return request.post(
        `${baseUrl}/batch-action`,
        { action, filter: { id: targets.map((r) => r.id) }, data },
        options
      ) as Promise<AnyObject>;
    },

    ...extend,
  };
}
