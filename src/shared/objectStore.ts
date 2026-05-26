/**
 * objectStore - Reactive singleton object cache
 *
 * Provides identity-based reactive caching for TypedObjects so that the same
 * logical entity is represented by a single ShallowReactive instance across the
 * entire app.  Incoming server payloads are merged into the existing reactive
 * object using per-field causality, which prevents a delayed/stale response
 * from silently overwriting a field the user edited after the request was sent.
 *
 * ## Key invariants
 * - Identity: `type + (id || name)` → one reactive object in the store forever.
 * - Staleness: object-level `__timestamp` guards wholesale replacement.
 * - Causality: per-field `__fieldTimestamps` prevents stale-response clobber.
 * - Deleted objects: `__deleted_at` triggers automatic removal from all lists.
 *
 * ## Exports
 * - `storeObject` / `storeObjects` — insert or merge
 * - `registerList` / `unregisterList` — opt-in list for auto-delete
 * - `hasRecentUpdates` — staleness predicate (exported for testing)
 * - `removeObjectFromLists` — manual eviction
 * - `autoRefreshObject` / `stopAutoRefreshObject` — polling helpers
 */

import type { Ref } from "vue";
import { ShallowReactive, shallowReactive } from "vue";
import type { AnyObject, TypedObject } from "./types";
import { uid } from "./uid";

const store = new Map<string, ShallowReactive<TypedObject>>();

/**
 * External list refs registered for automatic optimistic-delete support.
 * Call `registerList` on mount and `unregisterList` on unmount.
 */
const registeredLists = new Set<Ref<TypedObject[]>>();

export function registerList(listRef: Ref<TypedObject[]>): void {
  registeredLists.add(listRef);
}

export function unregisterList(listRef: Ref<TypedObject[]>): void {
  registeredLists.delete(listRef);
}

export function storeObjects<T extends TypedObject>(newObjects: T[]): T[] {
  for (const index in newObjects) {
    if (newObjects[index] && typeof newObjects[index] === "object") {
      newObjects[index] = storeObject(newObjects[index]);
    }
  }
  return newObjects;
}

/**
 * Insert or merge a TypedObject into the store.
 *
 * Returns the canonical reactive instance that should be used in place of
 * the passed-in object — callers must replace their local reference.
 *
 * Merge semantics:
 * 1. If the incoming object is older than the stored object at the
 *    object level, recurse into children but skip field application.
 * 2. Otherwise apply fields with per-field causality:
 *    a field is only written when `incoming_field_ts >= stored_field_ts`.
 */
export function storeObject<T extends TypedObject>(
  newObject: T,
  recentlyStoredObjects: AnyObject = {}
): ShallowReactive<T> {
  if (typeof newObject !== "object") {
    return newObject;
  }

  const id = newObject?.id || newObject?.name;
  const type = newObject?.__type;

  if (!id || !type) {
    const reactiveObject = shallowReactive(newObject);
    storeObjectChildren(newObject, recentlyStoredObjects, reactiveObject);
    return reactiveObject;
  }

  if (!newObject.__id) {
    newObject.__id = uid();
  }
  if (!newObject.__timestamp) {
    newObject.__timestamp = ((newObject as AnyObject).updated_at as string | number) || 0;
  }

  const objectKey = `${type}:${id}`;

  if (recentlyStoredObjects[objectKey]) {
    return recentlyStoredObjects[objectKey] as ShallowReactive<T>;
  }

  const oldObject = store.get(objectKey) as ShallowReactive<T> | undefined;

  if (!hasRecentUpdates(newObject, oldObject || null)) {
    recentlyStoredObjects[objectKey] = oldObject;
    storeObjectChildren(newObject, recentlyStoredObjects, oldObject || null);
    return oldObject as ShallowReactive<T>;
  }

  const reactiveObject = (oldObject || shallowReactive(newObject)) as ShallowReactive<T>;
  recentlyStoredObjects[objectKey] = reactiveObject;

  storeObjectChildren(newObject, recentlyStoredObjects);
  applyFieldCausalityMerge(reactiveObject, newObject);

  if (!oldObject) {
    store.set(objectKey, reactiveObject as ShallowReactive<TypedObject>);
  }

  if (reactiveObject.__deleted_at) {
    removeObjectFromLists(reactiveObject);
  }

  return reactiveObject;
}

/**
 * Recursively store child TypedObjects, updating `applyToObject` with the
 * canonical reactive instances.  `recentlyStoredObjects` prevents infinite
 * recursion on circular references.
 */
function storeObjectChildren<T extends TypedObject>(
  object: T,
  recentlyStoredObjects: AnyObject = {},
  applyToObject: T | null = null
): void {
  const target = (applyToObject || object) as AnyObject;
  for (const key of Object.keys(object)) {
    const value = (object as AnyObject)[key];
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (item && typeof item === "object") {
          if (!target[key]) {
            target[key] = [];
          }
          (target[key] as TypedObject[])[i] = storeObject(
            item as TypedObject,
            recentlyStoredObjects
          );
        }
      }
    } else if ((value as TypedObject | undefined)?.__type) {
      target[key] = storeObject(value as TypedObject, recentlyStoredObjects);
    } else if (value && typeof value === "object") {
      storeObjectChildren(value as TypedObject, recentlyStoredObjects, target[key] as TypedObject);
    }
  }
}

/**
 * Determine whether `newObject` carries any information newer than `oldObject`.
 *
 * Returns `true` (→ should merge) when:
 * - Either object lacks a `__timestamp` (assume new info)
 * - `newObject.__timestamp > oldObject.__timestamp`
 * - Any child TypedObject in `newObject` is newer than its stored counterpart
 *
 * ### Bug fix: scalars no longer short-circuit to `true`
 * The original implementation ran `if (!oldObjectValue?.__timestamp) return true`
 * unconditionally for every key, including plain scalars such as `name: "foo"`.
 * Since scalars never carry `__timestamp`, this caused every incoming payload to
 * be treated as "recent", making the older-payload skip unreachable.
 *
 * Fix: the missing-timestamp early-return fires ONLY for keys whose new value is
 * itself a TypedObject (`newObjectValue?.__type`).  Plain scalars and plain
 * objects do not carry temporal metadata and are therefore not consulted here —
 * the object-level timestamp comparison is the sole gate for non-typed values.
 */
export function hasRecentUpdates(newObject: TypedObject, oldObject: TypedObject | null): boolean {
  if (!newObject.__timestamp || !oldObject?.__timestamp) return true;

  // >= so that equal-timestamp payloads still trigger the merge (per-field
  // causality inside applyFieldCausalityMerge then decides per-field winners)
  if (Number(newObject.__timestamp) >= Number(oldObject.__timestamp)) return true;

  for (const key of Object.keys(newObject)) {
    const newObjectValue = (newObject as AnyObject)[key] as TypedObject | undefined;
    const oldObjectValue = (oldObject as AnyObject)[key] as TypedObject | undefined;

    // BUG FIX: only treat missing __timestamp as "new info" for TypedObjects,
    // never for plain scalars or generic objects.
    if (newObjectValue?.__type && !oldObjectValue?.__timestamp) {
      return true;
    }

    if (Array.isArray(newObjectValue) && newObjectValue.length > 0) {
      for (const newObjectItem of newObjectValue as TypedObject[]) {
        if (newObjectItem?.__type) {
          const oldObjectItem = (oldObjectValue as TypedObject[] | undefined)?.find(
            (v: TypedObject) => v.id === newObjectItem.id && v.__type === newObjectItem.__type
          );

          if (!oldObjectItem?.__timestamp) {
            return true;
          }

          if (hasRecentUpdates(newObjectItem, oldObjectItem)) {
            return true;
          }
        }
      }
    } else if (newObjectValue?.__type) {
      if (hasRecentUpdates(newObjectValue, oldObjectValue as TypedObject)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Apply `newObject`'s scalar/plain-object fields to `reactiveObject` using
 * per-field causality timestamps.
 *
 * ### Bug fix: per-field causality merge replaces Object.assign
 * The original implementation used `Object.assign(reactiveObject, newObject)`,
 * which overwrote every field wholesale regardless of timing.  When a delayed
 * server response arrived after the user had already edited a field locally, the
 * local edit was silently destroyed.
 *
 * Fix: each field is applied only when `incoming_field_ts >= stored_field_ts`.
 * The incoming field timestamp is `newObject.__fieldTimestamps[key]` (if the
 * caller stamped it) falling back to `newObject.__timestamp`.  The stored
 * timestamp is `reactiveObject.__fieldTimestamps[key]` falling back to
 * `reactiveObject.__timestamp`.  After application the stored field timestamp is
 * updated to the maximum of the two, so a subsequent equal-timestamp payload is
 * idempotent rather than rejected.
 *
 * TypedObject children and arrays-of-TypedObjects are handled by
 * `storeObjectChildren` and are NOT touched here.
 */
function applyFieldCausalityMerge<T extends TypedObject>(reactiveObject: T, newObject: T): void {
  const storedObjTs = Number((reactiveObject as AnyObject).__timestamp ?? 0);
  const newObjTs = Number((newObject as AnyObject).__timestamp ?? 0);

  // Single initialisation point — every field-timestamp write below assumes this map exists.
  if (!(reactiveObject as AnyObject).__fieldTimestamps) {
    (reactiveObject as AnyObject).__fieldTimestamps = {};
  }
  const storedFieldTimestamps = reactiveObject.__fieldTimestamps as Record<string, number>;
  const incomingFieldTimestamps = newObject.__fieldTimestamps as Record<string, number> | undefined;

  for (const key of Object.keys(newObject)) {
    if (key === "__fieldTimestamps") continue;

    const newValue = (newObject as AnyObject)[key];

    // TypedObject fields and arrays of TypedObjects are handled by storeObjectChildren
    if ((newValue as TypedObject | undefined)?.__type) continue;
    if (Array.isArray(newValue) && newValue.length > 0 && (newValue[0] as AnyObject)?.__type)
      continue;

    if (key.startsWith("__")) {
      // System fields always applied (they carry their own consistency guarantees)
      (reactiveObject as AnyObject)[key] = newValue;
      continue;
    }

    const incomingFieldTs = incomingFieldTimestamps?.[key] ?? newObjTs;
    const storedFieldTs = storedFieldTimestamps[key] ?? storedObjTs;

    if (Number(incomingFieldTs) >= Number(storedFieldTs)) {
      (reactiveObject as AnyObject)[key] = newValue;
      // Track the max so a subsequent equal-timestamp payload is idempotent
      storedFieldTimestamps[key] = Math.max(Number(incomingFieldTs), Number(storedFieldTs));
    }
  }

  // Merge incoming __fieldTimestamps entries that are newer than stored ones
  if (incomingFieldTimestamps) {
    for (const [key, ts] of Object.entries(incomingFieldTimestamps)) {
      const storedTs = storedFieldTimestamps[key] ?? storedObjTs;
      if (Number(ts) >= storedTs) {
        storedFieldTimestamps[key] = Number(ts);
      }
    }
  }
}

/**
 * Remove `object` from every list in the store and from all registered
 * external list refs.  Called automatically when an object gains `__deleted_at`.
 */
export function removeObjectFromLists<T extends TypedObject>(object: T): void {
  for (const storedObject of store.values()) {
    for (const key of Object.keys(storedObject)) {
      const value = (storedObject as AnyObject)[key];
      if (Array.isArray(value) && value.length > 0) {
        const index = value.findIndex(
          (v: TypedObject) => v.__id === object.__id && v.__type === object.__type
        );
        if (index !== -1) {
          value.splice(index, 1);
          (storedObject as AnyObject)[key] = [...value];
        }
      }
    }
  }

  for (const listRef of registeredLists) {
    const arr = listRef.value;
    if (arr.length > 0) {
      const index = arr.findIndex(
        (v: TypedObject) => v.__id === object.__id && v.__type === object.__type
      );
      if (index !== -1) {
        arr.splice(index, 1);
      }
    }
  }
}

/** Auto-refresh registry: name → timeout id */
const registeredAutoRefreshes: Record<string, ReturnType<typeof setTimeout>> = {};

/**
 * Poll `callback` on `interval` while `condition(object)` is true.
 *
 * Always cancels any previously-registered auto-refresh with the same `name`
 * before starting a new one. Call `stopAutoRefreshObject(name)` to cancel.
 *
 * @throws if `object` lacks `id` and `__type` (not a valid stored object)
 */
export async function autoRefreshObject<T extends TypedObject>(
  name: string,
  object: T,
  condition: (object: T) => boolean,
  callback: (object: T) => Promise<T>,
  interval = 3000
): Promise<void> {
  stopAutoRefreshObject(name);

  if (!object?.id || !object?.__type) {
    throw new Error("Invalid stored object. Cannot auto-refresh");
  }

  if (condition(object)) {
    const refreshedObject = await callback(object);

    if (!refreshedObject.id) {
      console.error(`Failed to refresh ${object.__type} (${object.id}) status: ` + object.name);
      return;
    }

    storeObject(refreshedObject);
  }

  registeredAutoRefreshes[name] = setTimeout(
    () => autoRefreshObject(name, object, condition, callback, interval),
    interval
  );
}

export function stopAutoRefreshObject(name: string): void {
  const timeoutId = registeredAutoRefreshes[name];
  if (timeoutId) clearTimeout(timeoutId);
}
