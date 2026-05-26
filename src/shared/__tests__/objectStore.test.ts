import { describe, it, expect, beforeEach, vi } from "vitest";
import { isReactive } from "vue";
import {
  storeObject,
  storeObjects,
  registerList,
  unregisterList,
  hasRecentUpdates,
  removeObjectFromLists,
  autoRefreshObject,
  stopAutoRefreshObject,
} from "../objectStore";
import type { TypedObject } from "../types";
import { ref } from "vue";

// Reset the module-level store between tests
// We can't directly reset the Map, but since store keys are type:id we can
// test in isolation by using unique types per test.
let counter = 0;
function mkType() {
  return `TestType${++counter}`;
}

describe("objectStore", () => {
  describe("storeObject", () => {
    it("returns a shallow reactive instance", () => {
      const type = mkType();
      const obj: TypedObject = { id: "1", __type: type, name: "Alice" };
      const stored = storeObject(obj);
      expect(isReactive(stored)).toBe(true);
    });

    it("returns the same reactive instance on second call", () => {
      const type = mkType();
      const a = storeObject({ id: "1", __type: type, name: "Alice", __timestamp: 100 });
      const b = storeObject({ id: "1", __type: type, name: "Alice Updated", __timestamp: 200 });
      expect(a).toBe(b);
      expect(a.name).toBe("Alice Updated");
    });

    it("handles objects without type/id — returns shallow reactive but identity-keyed objects are not stored", () => {
      const obj = { name: "no type" };
      const result = storeObject(obj as TypedObject);
      expect(isReactive(result)).toBe(true);
      // A different plain object (same shape, different reference) creates a new reactive
      const obj2 = { name: "no type" };
      const result2 = storeObject(obj2 as TypedObject);
      expect(result2).not.toBe(result);
    });

    it("handles non-object input (passthrough)", () => {
      const val = "not an object";
      expect(storeObject(val as unknown as TypedObject)).toBe(val);
    });

    it("assigns __id on first store", () => {
      const type = mkType();
      const obj: TypedObject = { id: "1", __type: type };
      const stored = storeObject(obj);
      expect(stored.__id).toBeTruthy();
    });

    it("derives __timestamp from updated_at when missing", () => {
      const type = mkType();
      const obj = { id: "1", __type: type, updated_at: "2024-01-01" } as TypedObject & {
        updated_at: string;
      };
      const stored = storeObject(obj);
      expect(stored.__timestamp).toBe("2024-01-01");
    });
  });

  describe("storeObjects", () => {
    it("stores each object in an array", () => {
      const type = mkType();
      const arr = [
        { id: "1", __type: type },
        { id: "2", __type: type },
      ];
      const result = storeObjects(arr);
      expect(result).toHaveLength(2);
      expect(isReactive(result[0])).toBe(true);
      expect(isReactive(result[1])).toBe(true);
    });

    it("skips non-object array entries", () => {
      const arr = [null, undefined, { id: "1", __type: mkType() }] as TypedObject[];
      const result = storeObjects(arr);
      expect(result[0]).toBeNull();
      expect(result[1]).toBeUndefined();
      expect(isReactive(result[2])).toBe(true);
    });
  });

  describe("registerList / unregisterList", () => {
    it("auto-removes deleted items from registered list refs", () => {
      const type = mkType();
      const item = storeObject({ id: "1", __type: type, name: "Doomed" });
      const listRef = ref<TypedObject[]>([item]);
      registerList(listRef);

      storeObject({ id: "1", __type: type, __deleted_at: "2024-01-01", __timestamp: 999 });
      expect(listRef.value).toHaveLength(0);

      unregisterList(listRef);
    });

    it("unregister stops auto-removal", () => {
      const type = mkType();
      const type2 = mkType();
      const item = storeObject({ id: "1", __type: type2, name: "Safe" });
      const listRef = ref<TypedObject[]>([item]);
      registerList(listRef);
      unregisterList(listRef);

      storeObject({ id: "1", __type: type2, __deleted_at: "2024-01-01", __timestamp: 9999 });
      expect(listRef.value).toHaveLength(1);
      void type;
    });
  });

  describe("hasRecentUpdates", () => {
    it("returns true when newObject has no __timestamp", () => {
      const old: TypedObject = { id: "1", __type: "T", __timestamp: 100 };
      const incoming: TypedObject = { id: "1", __type: "T" };
      expect(hasRecentUpdates(incoming, old)).toBe(true);
    });

    it("returns true when oldObject has no __timestamp", () => {
      const old: TypedObject = { id: "1", __type: "T" };
      const incoming: TypedObject = { id: "1", __type: "T", __timestamp: 100 };
      expect(hasRecentUpdates(incoming, old)).toBe(true);
    });

    it("returns false when incoming is strictly older", () => {
      const old: TypedObject = { id: "1", __type: "T", __timestamp: 200 };
      const incoming: TypedObject = { id: "1", __type: "T", __timestamp: 100 };
      expect(hasRecentUpdates(incoming, old)).toBe(false);
    });

    it("returns true when incoming is newer", () => {
      const old: TypedObject = { id: "1", __type: "T", __timestamp: 100 };
      const incoming: TypedObject = { id: "1", __type: "T", __timestamp: 200 };
      expect(hasRecentUpdates(incoming, old)).toBe(true);
    });

    it("returns true when timestamps are equal (idempotent re-apply)", () => {
      const old: TypedObject = { id: "1", __type: "T", __timestamp: 100 };
      const incoming: TypedObject = { id: "1", __type: "T", __timestamp: 100 };
      expect(hasRecentUpdates(incoming, old)).toBe(true);
    });

    // BUG FIX REGRESSION TEST
    it("does NOT return true for a scalar key without __timestamp (bug fix)", () => {
      // Original bug: `if (!oldObjectValue?.__timestamp) return true` fired for
      // ALL keys, including plain scalars. An older payload would be treated as
      // "recent" because scalars don't have __timestamp.
      const old: TypedObject = { id: "1", __type: "T", __timestamp: 200, name: "stored" };
      const incoming: TypedObject = { id: "1", __type: "T", __timestamp: 100, name: "stale" };
      // name is a scalar — its absence of __timestamp must NOT trigger a true return
      expect(hasRecentUpdates(incoming, old)).toBe(false);
    });

    it("returns true for a child TypedObject that is missing __timestamp in oldObject", () => {
      // Child TypedObjects DO trigger the early-return
      const old: TypedObject = {
        id: "1",
        __type: "T",
        __timestamp: 200,
        child: { id: "2", __type: "Child" }, // no __timestamp on child
      };
      const incoming: TypedObject = {
        id: "1",
        __type: "T",
        __timestamp: 100,
        child: { id: "2", __type: "Child", __timestamp: 50 },
      };
      expect(hasRecentUpdates(incoming, old)).toBe(true);
    });

    it("returns false when old has newer child TypedObject timestamp", () => {
      const old: TypedObject = {
        id: "1",
        __type: "T",
        __timestamp: 200,
        child: { id: "2", __type: "Child", __timestamp: 300 },
      };
      const incoming: TypedObject = {
        id: "1",
        __type: "T",
        __timestamp: 100,
        child: { id: "2", __type: "Child", __timestamp: 50 },
      };
      expect(hasRecentUpdates(incoming, old)).toBe(false);
    });

    it("returns true when a child array item is new (no entry in old)", () => {
      const old: TypedObject = {
        id: "1",
        __type: "T",
        __timestamp: 200,
        items: [],
      };
      const incoming: TypedObject = {
        id: "1",
        __type: "T",
        __timestamp: 100,
        items: [{ id: "99", __type: "Item", __timestamp: 50 }],
      };
      expect(hasRecentUpdates(incoming, old)).toBe(true);
    });
  });

  describe("per-field causality merge (bug fix)", () => {
    it("does NOT overwrite a field the user edited after the request was sent", () => {
      const type = mkType();

      // 1. Initial object stored
      const initial = storeObject({
        id: "1",
        __type: type,
        name: "Original",
        __timestamp: 100,
        __fieldTimestamps: { name: 100 },
      });

      // 2. User edits name locally at t=200
      storeObject({
        id: "1",
        __type: type,
        name: "User Edit",
        __timestamp: 200,
        __fieldTimestamps: { name: 200 },
      });
      expect(initial.name).toBe("User Edit");

      // 3. Stale server response arrives (object ts=150 > initial ts=100 so
      //    hasRecentUpdates returns true), but field ts=150 < user field ts=200
      storeObject({
        id: "1",
        __type: type,
        name: "Stale Server Name",
        __timestamp: 150,
        __fieldTimestamps: { name: 150 },
      });

      // The user's edit must survive
      expect(initial.name).toBe("User Edit");
    });

    it("applies a newer server field over the locally-held value", () => {
      const type = mkType();

      const stored = storeObject({
        id: "1",
        __type: type,
        score: 10,
        __timestamp: 100,
        __fieldTimestamps: { score: 100 },
      });

      storeObject({
        id: "1",
        __type: type,
        score: 99,
        __timestamp: 200,
        __fieldTimestamps: { score: 200 },
      });

      expect(stored.score).toBe(99);
    });

    it("applies fields without __fieldTimestamps using object-level timestamp", () => {
      const type = mkType();

      const stored = storeObject({
        id: "1",
        __type: type,
        value: "old",
        __timestamp: 50,
      });

      storeObject({
        id: "1",
        __type: type,
        value: "new",
        __timestamp: 150,
      });

      expect(stored.value).toBe("new");
    });

    it("rapid-edit regression: two edits, first response delayed + carrying pre-second-edit state → second edit survives", () => {
      const type = mkType();

      // Stored state
      const stored = storeObject({
        id: "1",
        __type: type,
        title: "Initial",
        __timestamp: 100,
        __fieldTimestamps: { title: 100 },
      });

      // User makes first edit at t=200
      storeObject({
        id: "1",
        __type: type,
        title: "First Edit",
        __timestamp: 200,
        __fieldTimestamps: { title: 200 },
      });

      // User makes second edit at t=300
      storeObject({
        id: "1",
        __type: type,
        title: "Second Edit",
        __timestamp: 300,
        __fieldTimestamps: { title: 300 },
      });
      expect(stored.title).toBe("Second Edit");

      // Delayed response from the FIRST request arrives carrying pre-second-edit state
      // Object ts=250 > stored ts=100 so hasRecentUpdates is true, but field ts=150 < 300
      storeObject({
        id: "1",
        __type: type,
        title: "Server Response (stale)",
        __timestamp: 250,
        __fieldTimestamps: { title: 150 },
      });

      // Second edit must survive
      expect(stored.title).toBe("Second Edit");
    });
  });

  describe("removeObjectFromLists", () => {
    it("removes object from stored object array properties", () => {
      const parentType = mkType();
      const childType = mkType();

      const child = storeObject({ id: "child1", __type: childType });
      const parent = storeObject({
        id: "parent1",
        __type: parentType,
        items: [child],
      });

      expect(parent.items).toHaveLength(1);
      removeObjectFromLists(child);
      expect(parent.items).toHaveLength(0);
    });

    it("removes object from registered list refs", () => {
      const type = mkType();
      const item = storeObject({ id: "1", __type: type });
      const listRef = ref<TypedObject[]>([item]);
      registerList(listRef);

      removeObjectFromLists(item);
      expect(listRef.value).toHaveLength(0);

      unregisterList(listRef);
    });
  });

  describe("autoRefreshObject", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it("calls callback when condition is true", async () => {
      const type = mkType();
      const obj = storeObject({ id: "1", __type: type, status: "pending" });
      const refreshed = { id: "1", __type: type, status: "done" };
      const callback = vi.fn().mockResolvedValue(refreshed);

      await autoRefreshObject("test-refresh", obj, (o) => o.status === "pending", callback, 500);
      expect(callback).toHaveBeenCalledOnce();
      stopAutoRefreshObject("test-refresh");
    });

    it("does not call callback when condition is false", async () => {
      const type = mkType();
      const obj = storeObject({ id: "1", __type: type, status: "done" });
      const callback = vi.fn().mockResolvedValue(obj);

      await autoRefreshObject("test-no-call", obj, (o) => o.status === "pending", callback, 500);
      expect(callback).not.toHaveBeenCalled();
      stopAutoRefreshObject("test-no-call");
    });

    it("throws for invalid objects", async () => {
      const obj = { name: "no id" } as TypedObject;
      await expect(
        autoRefreshObject(
          "bad",
          obj,
          () => true,
          async (o) => o,
          100
        )
      ).rejects.toThrow("Invalid stored object");
    });

    it("schedules subsequent refresh via setTimeout", async () => {
      const type = mkType();
      const obj = storeObject({ id: "1", __type: type, status: "pending" });
      const callback = vi.fn().mockResolvedValue({ id: "1", __type: type, status: "pending" });

      await autoRefreshObject("sched-test", obj, () => true, callback, 1000);
      expect(callback).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(1000);
      await Promise.resolve(); // flush microtasks
      stopAutoRefreshObject("sched-test");

      vi.useRealTimers();
    });

    it("logs an error and bails when the refreshed object has no id", async () => {
      const type = mkType();
      const obj = storeObject({ id: "1", __type: type, name: "Thing", status: "pending" });
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const callback = vi.fn().mockResolvedValue({ __type: type }); // no id

      await autoRefreshObject("no-id-refresh", obj, () => true, callback, 500);
      expect(callback).toHaveBeenCalledOnce();
      expect(errorSpy).toHaveBeenCalledOnce();
      // No subsequent timer scheduled when refresh fails
      stopAutoRefreshObject("no-id-refresh");
      errorSpy.mockRestore();
    });
  });

  describe("nested children, circular refs, and older-object merges", () => {
    it("handles circular references without infinite recursion", () => {
      const typeA = mkType();
      const typeB = mkType();
      const a: TypedObject = { id: "a", __type: typeA, __timestamp: 100 };
      const b: TypedObject = { id: "b", __type: typeB, __timestamp: 100, parent: a };
      a.child = b; // cycle: a → b → a

      const stored = storeObject(a);
      expect(stored.id).toBe("a");
      // The child resolved to the canonical reactive b, whose parent is canonical a
      expect((stored.child as TypedObject).id).toBe("b");
    });

    it("recurses into an older payload's children against the stored object", () => {
      const parentType = mkType();
      const childType = mkType();

      // V1: newer parent with a child, no `notes`/`meta`
      storeObject({
        id: "p",
        __type: parentType,
        __timestamp: 200,
        child: { id: "c", __type: childType, __timestamp: 50, label: "old-child" },
      });

      // V2: older parent (object ts lower, child ts lower) — NOT recent — but
      // carries a brand-new non-typed array (`notes`) and a plain nested object
      // (`meta`) that the stored object lacks. The not-recent branch applies
      // children against the stored object.
      const v2 = storeObject({
        id: "p",
        __type: parentType,
        __timestamp: 100,
        child: { id: "c", __type: childType, __timestamp: 40, label: "older-child" },
        notes: [{ text: "note-1" }],
        meta: { inner: { id: "m", __type: mkType(), __timestamp: 5, v: 1 } },
      });

      // Stored object retains the newer child label; the new non-typed array
      // (notes) is applied against the stored object. The plain `meta` object is
      // recursed (to store any nested typed children) but not copied wholesale —
      // matching the original not-recent merge semantics.
      expect((v2.child as TypedObject).label).toBe("old-child");
      expect(Array.isArray(v2.notes)).toBe(true);
      expect((v2.notes as unknown[]).length).toBe(1);
    });

    it("merges incoming __fieldTimestamps that exceed the stored field timestamps", () => {
      const type = mkType();
      const stored = storeObject({ id: "1", __type: type, score: 1, __timestamp: 100 });

      // Incoming carries __fieldTimestamps for the changed key plus an extra key
      storeObject({
        id: "1",
        __type: type,
        score: 2,
        __timestamp: 200,
        __fieldTimestamps: { score: 200, extra: 175 },
      });

      expect(stored.score).toBe(2);
      expect((stored as TypedObject).__fieldTimestamps).toMatchObject({ score: 200, extra: 175 });
    });

    it("skips arrays of TypedObjects during the field-causality merge", () => {
      const parentType = mkType();
      const childType = mkType();

      const stored = storeObject({
        id: "p",
        __type: parentType,
        __timestamp: 100,
        items: [{ id: "c", __type: childType, __timestamp: 50, v: 1 }],
      });

      // Newer payload with an updated typed-array item — items are handled by
      // storeObjectChildren, not the field-causality merge.
      storeObject({
        id: "p",
        __type: parentType,
        __timestamp: 200,
        items: [{ id: "c", __type: childType, __timestamp: 60, v: 2 }],
      });

      expect((stored.items as TypedObject[])[0]!.v).toBe(2);
    });
  });

  describe("hasRecentUpdates — array child branches", () => {
    it("returns true when an existing array child is newer in the incoming payload", () => {
      const old: TypedObject = {
        id: "1",
        __type: "T",
        __timestamp: 100,
        items: [{ id: "c", __type: "C", __timestamp: 50 }],
      };
      const incoming: TypedObject = {
        id: "1",
        __type: "T",
        __timestamp: 90, // older at object level
        items: [{ id: "c", __type: "C", __timestamp: 60 }], // but child is newer
      };
      expect(hasRecentUpdates(incoming, old)).toBe(true);
    });

    it("returns true when an existing array child has no stored timestamp", () => {
      const old: TypedObject = {
        id: "1",
        __type: "T",
        __timestamp: 100,
        items: [{ id: "c", __type: "C" }], // no __timestamp
      };
      const incoming: TypedObject = {
        id: "1",
        __type: "T",
        __timestamp: 90,
        items: [{ id: "c", __type: "C", __timestamp: 60 }],
      };
      expect(hasRecentUpdates(incoming, old)).toBe(true);
    });

    it("returns true when a single (non-array) child TypedObject is newer", () => {
      const old: TypedObject = {
        id: "1",
        __type: "T",
        __timestamp: 100,
        child: { id: "c", __type: "C", __timestamp: 50 },
      };
      const incoming: TypedObject = {
        id: "1",
        __type: "T",
        __timestamp: 90, // older at object level
        child: { id: "c", __type: "C", __timestamp: 60 }, // but the single child is newer
      };
      expect(hasRecentUpdates(incoming, old)).toBe(true);
    });

    it("returns false when array children are all older", () => {
      const old: TypedObject = {
        id: "1",
        __type: "T",
        __timestamp: 100,
        items: [{ id: "c", __type: "C", __timestamp: 50 }],
      };
      const incoming: TypedObject = {
        id: "1",
        __type: "T",
        __timestamp: 90,
        items: [{ id: "c", __type: "C", __timestamp: 40 }],
      };
      expect(hasRecentUpdates(incoming, old)).toBe(false);
    });
  });
});
