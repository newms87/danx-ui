/**
 * Reactive Object Store
 *
 * A process-global identity map of reactive objects keyed by `${__type}:${id}`.
 * Storing an object returns the single shared reactive instance for that
 * identity, so every part of the app references (and re-renders from) the same
 * object. Re-storing merges the incoming payload into the shared instance.
 *
 * ## Causality model (per-field, freshest-wins)
 *
 * Each stored object tracks per-field "as-of" timestamps (`__fieldTimestamps`,
 * falling back to the object-level `__timestamp`). On merge, an incoming field
 * is applied only when it is at least as new as the locally-held field. This
 * means:
 * - An in-flight request's late response cannot clobber a field the user edited
 *   after the request was sent (single-user rapid edits stay correct).
 * - A server payload can still apply the fields it legitimately advanced, even
 *   if other fields are stale (concurrent multi-user edits: newer-per-field wins).
 *
 * `hasRecentUpdates` is the cheap short-circuit: an older whole-object payload
 * with no newer field or child is skipped entirely. A missing `__timestamp` is
 * treated as "new information" only for child TypedObjects, never for scalars.
 *
 * ## Eviction
 *
 * Storing an object with `__deleted_at` set only marks it deleted and removes
 * it from lists — it does NOT free the identity-map entry. The store is a
 * process-global `Map` with no automatic eviction, so long-running consumers
 * (e.g. a chat app accumulating messages across a session) must explicitly
 * call `disposeObject(type, id)` to release an entry, or `clearStore()` to
 * reset everything (e.g. on logout or tenant switch).
 *
 * @example
 *   const user = storeObject({ id: 1, __type: "User", name: "Ada", updated_at: "2026-01-01T00:00:00Z" });
 *   // Later, anywhere:
 *   const same = storeObject({ id: 1, __type: "User" }); // === user (shared instance)
 */

import { shallowReactive } from "vue";
import type { Ref } from "vue";
import { uid } from "./uid";
import { FlashMessages } from "./flashMessages";
import type { TypedObject } from "./store-types";
import type { ActionTargetItem } from "./action-types";

/** Identity map: `${__type}:${id ?? name}` → shared reactive object. */
const store = new Map<string, TypedObject>();

/**
 * External list refs registered for optimistic-delete support. When
 * `removeObjectFromLists` fires, these arrays are scanned and spliced too.
 */
const registeredLists = new Set<Ref<TypedObject[]>>();

/** Identity/meta keys that are never merged as ordinary data fields. */
const META_KEYS = new Set(["__type", "__id", "__timestamp", "__fieldTimestamps"]);

function isTypedObjectValue(value: unknown): value is TypedObject {
  return (
    typeof value === "object" && value !== null && typeof (value as TypedObject).__type === "string"
  );
}

/** Coerce a value to epoch milliseconds for timestamp comparisons. */
function toMs(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/** Effective as-of timestamp for a field: per-field entry, else object-level. */
function fieldTimestamp(object: TypedObject, key: string): number {
  const perField = object.__fieldTimestamps?.[key];
  if (typeof perField === "number") return perField;
  return object.__timestamp ?? 0;
}

/**
 * Register a local ref array so optimistic deletes also remove items from it.
 * Always pair with `unregisterList` (e.g. in `onBeforeUnmount`) to avoid leaks.
 */
export function registerList(listRef: Ref<TypedObject[]>): void {
  registeredLists.add(listRef);
}

/** Unregister a previously registered list ref. */
export function unregisterList(listRef: Ref<TypedObject[]>): void {
  registeredLists.delete(listRef);
}

/** Store each object in an array, returning the array of shared instances. */
export function storeObjects<T extends TypedObject>(newObjects: T[]): T[] {
  for (let index = 0; index < newObjects.length; index++) {
    const candidate = newObjects[index];
    if (candidate && typeof candidate === "object") {
      newObjects[index] = storeObject(candidate);
    }
  }
  return newObjects;
}

/**
 * Store an object by `${__type}:${id}`. Returns the shared reactive instance —
 * use the returned object, not the argument, since the instance is shared.
 */
export function storeObject<T extends TypedObject>(
  newObject: T,
  recentlyStoredObjects: Record<string, TypedObject> = {}
): T {
  if (typeof newObject !== "object" || newObject === null) {
    return newObject;
  }

  const id = newObject.id ?? newObject.name;
  const type = newObject.__type;

  // Without an identity we cannot store it, but still canonicalize its children.
  if (!id || !type) {
    const reactiveObject = shallowReactive(newObject);
    storeObjectChildren(newObject, recentlyStoredObjects, reactiveObject);
    return reactiveObject;
  }

  if (!newObject.__id) {
    newObject.__id = uid();
  }
  if (!newObject.__timestamp) {
    newObject.__timestamp = toMs(newObject.updated_at);
  }

  const objectKey = `${type}:${id}`;

  // Already handled in this pass — return it to break recursion cycles.
  const recent = recentlyStoredObjects[objectKey];
  if (recent) {
    return recent as T;
  }

  const oldObject = store.get(objectKey);

  // Stale whole-object payload (older, no newer field/child) → keep the stored
  // instance, but still merge any children that ARE newer.
  if (oldObject && !hasRecentUpdates(newObject, oldObject)) {
    recentlyStoredObjects[objectKey] = oldObject;
    storeObjectChildren(newObject, recentlyStoredObjects, oldObject);
    return oldObject as T;
  }

  const reactiveObject = (oldObject as T | undefined) ?? shallowReactive(newObject);
  recentlyStoredObjects[objectKey] = reactiveObject;

  // Canonicalize children (mutates newObject's child refs to shared instances).
  storeObjectChildren(newObject, recentlyStoredObjects);

  // Per-field causal merge of the (now child-canonicalized) payload.
  applyObject(reactiveObject, newObject);

  if (!oldObject) {
    store.set(objectKey, reactiveObject);
  }

  if (reactiveObject.__deleted_at) {
    removeObjectFromLists(reactiveObject);
  }

  return reactiveObject;
}

/**
 * Recursively replace child TypedObjects (and TypedObjects inside arrays / plain
 * nested objects) with their shared store instances. `applyToObject` lets the
 * canonicalized children be written onto a different instance than the source
 * (used when keeping a stored object whose scalar payload was stale).
 */
function storeObjectChildren<T extends TypedObject>(
  object: T,
  recentlyStoredObjects: Record<string, TypedObject> = {},
  applyToObject: TypedObject | null = null
): void {
  const target: TypedObject = applyToObject ?? object;
  for (const key of Object.keys(object)) {
    const value = object[key];
    if (Array.isArray(value)) {
      for (let index = 0; index < value.length; index++) {
        const item = value[index];
        if (item && typeof item === "object") {
          if (!Array.isArray(target[key])) {
            target[key] = [];
          }
          (target[key] as unknown[])[index] = storeObject(
            item as TypedObject,
            recentlyStoredObjects
          );
        }
      }
    } else if (isTypedObjectValue(value)) {
      target[key] = storeObject(value, recentlyStoredObjects);
    } else if (value && typeof value === "object") {
      // Plain dictionary — recurse to canonicalize nested TypedObjects at depth.
      const nextTarget = target[key];
      storeObjectChildren(
        value as TypedObject,
        recentlyStoredObjects,
        isTypedObjectValue(nextTarget) ? nextTarget : null
      );
    }
  }
}

/**
 * Merge `newObject` into the shared `reactiveObject` with per-field causality.
 * Child/array fields are referenced as-is (already canonicalized); scalar fields
 * are applied only when at least as new as the stored field.
 */
function applyObject(reactiveObject: TypedObject, newObject: TypedObject): void {
  if (!reactiveObject.__fieldTimestamps) {
    reactiveObject.__fieldTimestamps = {};
  }
  const storedFieldTs = reactiveObject.__fieldTimestamps;

  for (const key of Object.keys(newObject)) {
    if (META_KEYS.has(key)) continue;

    const value = newObject[key];
    if (isTypedObjectValue(value) || Array.isArray(value)) {
      // Children manage their own causality; always reference the canonical one.
      reactiveObject[key] = value;
      continue;
    }

    const incomingTs = fieldTimestamp(newObject, key);
    if (!(key in storedFieldTs) || incomingTs >= storedFieldTs[key]!) {
      reactiveObject[key] = value;
      storedFieldTs[key] = incomingTs;
    }
  }

  // Object-level timestamp tracks the freshest payload seen.
  const incomingObjTs = newObject.__timestamp ?? 0;
  if (incomingObjTs > (reactiveObject.__timestamp ?? 0)) {
    reactiveObject.__timestamp = incomingObjTs;
  }
}

/**
 * Whether `newObject` carries any information newer than `oldObject`.
 *
 * Returns true when the object-level timestamp is newer, when any scalar field
 * is newer per its field timestamp, or when a child TypedObject is new/newer.
 * A missing `__timestamp` counts as "new" only for child TypedObjects.
 */
export function hasRecentUpdates(newObject: TypedObject, oldObject: TypedObject | null): boolean {
  // No basis to compare at the object level → assume there are updates.
  if (!newObject.__timestamp || !oldObject?.__timestamp) return true;

  // Whole object is newer.
  if (newObject.__timestamp > oldObject.__timestamp) return true;

  // Incoming object is older-or-equal: only newer fields/children count.
  for (const key of Object.keys(newObject)) {
    if (META_KEYS.has(key)) continue;

    const newValue = newObject[key];
    const oldValue = oldObject[key];

    if (Array.isArray(newValue) && newValue.length > 0) {
      for (const item of newValue) {
        if (isTypedObjectValue(item)) {
          const oldItem = Array.isArray(oldValue)
            ? oldValue.find(
                (candidate) =>
                  isTypedObjectValue(candidate) &&
                  candidate.id === item.id &&
                  candidate.__type === item.__type
              )
            : undefined;
          // A child not present (or untimestamped) in the old list is new info.
          if (!isTypedObjectValue(oldItem) || !oldItem.__timestamp) return true;
          if (hasRecentUpdates(item, oldItem)) return true;
        }
      }
    } else if (isTypedObjectValue(newValue)) {
      if (!isTypedObjectValue(oldValue) || !oldValue.__timestamp) return true;
      if (hasRecentUpdates(newValue, oldValue)) return true;
    } else if (fieldTimestamp(newObject, key) >= fieldTimestamp(oldObject, key)) {
      // Scalar field at least as new as the stored field. `>=` (not `>`) so an
      // equal-timestamp payload is treated as an update — matching the merge rule
      // in `applyObject` and the original "same timestamp ⇒ update" intent. The
      // earlier strictly-newer object short-circuit already returned, so reaching
      // here means the object is older-or-equal; only equal-or-newer fields pass.
      return true;
    }
  }

  return false;
}

/**
 * Canonicalize result.item and result.result TypedObjects into the shared store,
 * mutating the result record in place. Used across actions and actionRoutes to
 * ensure consistent handling of action response payloads.
 */
export function canonicalizeResult(result: unknown): void {
  if (typeof result !== "object" || result === null) {
    return;
  }
  const resultRecord = result as Record<string, unknown>;
  if (resultRecord.item) {
    resultRecord.item = storeObject(resultRecord.item as ActionTargetItem);
  }
  if (typeof (resultRecord.result as Record<string, unknown> | undefined)?.__type === "string") {
    resultRecord.result = storeObject(resultRecord.result as ActionTargetItem);
  }
}

/**
 * Remove an object from every array property of every stored object, and from
 * all registered external list refs.
 */
export function removeObjectFromLists<T extends TypedObject>(object: T): void {
  for (const storedObject of store.values()) {
    for (const key of Object.keys(storedObject)) {
      const value = storedObject[key];
      if (Array.isArray(value) && value.length > 0) {
        const index = value.findIndex(
          (candidate) =>
            isTypedObjectValue(candidate) &&
            candidate.__id === object.__id &&
            candidate.__type === object.__type
        );
        if (index !== -1) {
          value.splice(index, 1);
          storedObject[key] = [...value];
        }
      }
    }
  }

  for (const listRef of registeredLists) {
    const arr = listRef.value;
    if (arr.length > 0) {
      const index = arr.findIndex(
        (v) => isTypedObjectValue(v) && v.__id === object.__id && v.__type === object.__type
      );
      if (index !== -1) {
        arr.splice(index, 1);
      }
    }
  }
}

/**
 * Remove one identity from the store and purge it from every registered list
 * and array property (reusing `removeObjectFromLists`). Use this to free
 * memory for objects no longer needed — merely storing `__deleted_at` does
 * not release the identity-map entry.
 */
export function disposeObject(type: string, id: string | number): void {
  const objectKey = `${type}:${id}`;
  const storedObject = store.get(objectKey);
  if (!storedObject) return;

  removeObjectFromLists(storedObject);
  store.delete(objectKey);
}

/**
 * Empty the entire identity map (e.g. on logout or tenant switch). Does not
 * touch registered list refs or in-flight auto-refresh timers.
 */
export function clearStore(): void {
  store.clear();
}

/** Active auto-refresh timers keyed by name. */
const registeredAutoRefreshes: Record<string, ReturnType<typeof setTimeout>> = {};

/**
 * Periodically refresh a stored object while `condition` holds. Returns once the
 * first refresh cycle is scheduled. Stop it with `stopAutoRefreshObject(name)`
 * (e.g. when the owning component unmounts).
 */
export async function autoRefreshObject<T extends TypedObject>(
  name: string,
  object: T,
  condition: (object: T) => boolean,
  callback: (object: T) => Promise<T>,
  interval = 3000
): Promise<void> {
  // Clear any existing timer for this name before scheduling a new one.
  stopAutoRefreshObject(name);

  if (!object?.id || !object?.__type) {
    throw new Error("Invalid stored object. Cannot auto-refresh");
  }

  if (condition(object)) {
    const refreshedObject = await callback(object);

    if (!refreshedObject.id) {
      FlashMessages.error(
        `Failed to refresh ${object.__type} (${object.id}) status: ${object.name}`
      );
      return;
    }

    storeObject(refreshedObject);
  }

  registeredAutoRefreshes[name] = setTimeout(
    () => autoRefreshObject(name, object, condition, callback, interval),
    interval
  );
}

/** Stop a named auto-refresh timer. */
export function stopAutoRefreshObject(name: string): void {
  const timeoutId = registeredAutoRefreshes[name];
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
}
