import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import type { Ref } from "vue";
import {
  autoRefreshObject,
  hasRecentUpdates,
  registerList,
  removeObjectFromLists,
  stopAutoRefreshObject,
  storeObject,
  storeObjects,
  unregisterList,
} from "../objectStore";
import { FlashMessages } from "../flashMessages";
import type { TypedObject } from "../store-types";

// Each test uses a unique __type so the process-global store never collides.
let typeCounter = 0;
function freshType(): string {
  return `T${++typeCounter}`;
}

describe("storeObject", () => {
  it("returns non-object input unchanged", () => {
    expect(storeObject(42 as unknown as TypedObject)).toBe(42);
    expect(storeObject(null as unknown as TypedObject)).toBe(null);
  });

  it("returns the same shared instance for the same identity", () => {
    const type = freshType();
    const a = storeObject({ id: 1, __type: type, name: "Ada", __timestamp: 1 });
    const b = storeObject({ id: 1, __type: type, name: "Ada", __timestamp: 1 });
    expect(b).toBe(a);
  });

  it("keys by name when no id is present", () => {
    const type = freshType();
    const a = storeObject({ name: "byname", __type: type, __timestamp: 1 });
    const b = storeObject({ name: "byname", __type: type, __timestamp: 1 });
    expect(b).toBe(a);
  });

  it("does not store an object lacking id/name or __type, but still returns it reactive", () => {
    const noType = storeObject({ id: 1, foo: "bar" } as TypedObject);
    expect(noType.foo).toBe("bar");
    // Not stored: a second call returns a different instance.
    const again = storeObject({ id: 1, foo: "bar" } as TypedObject);
    expect(again).not.toBe(noType);
  });

  it("assigns a __id when missing and derives __timestamp from updated_at", () => {
    const type = freshType();
    const stored = storeObject({
      id: 1,
      __type: type,
      updated_at: "2026-01-01T00:00:00Z",
    } as TypedObject);
    expect(typeof stored.__id).toBe("string");
    expect(stored.__timestamp).toBe(Date.parse("2026-01-01T00:00:00Z"));
  });

  it("uses a numeric updated_at directly as __timestamp", () => {
    const type = freshType();
    const stored = storeObject({ id: 1, __type: type, updated_at: 12345 } as TypedObject);
    expect(stored.__timestamp).toBe(12345);
  });

  it("defaults __timestamp to 0 when no updated_at is present", () => {
    const type = freshType();
    const stored = storeObject({ id: 1, __type: type } as TypedObject);
    expect(stored.__timestamp).toBe(0);
  });

  it("canonicalizes a child TypedObject to its shared instance", () => {
    const childType = freshType();
    const parentType = freshType();
    const child = storeObject({ id: 10, __type: childType, name: "child", __timestamp: 1 });
    const parent = storeObject({
      id: 20,
      __type: parentType,
      __timestamp: 1,
      child: { id: 10, __type: childType, name: "child", __timestamp: 1 },
    });
    expect(parent.child).toBe(child);
  });

  it("canonicalizes TypedObjects inside arrays", () => {
    const itemType = freshType();
    const listType = freshType();
    const item = storeObject({ id: 30, __type: itemType, __timestamp: 1 });
    const list = storeObject({
      id: 40,
      __type: listType,
      __timestamp: 1,
      items: [{ id: 30, __type: itemType, __timestamp: 1 }],
    });
    expect((list.items as TypedObject[])[0]).toBe(item);
  });

  it("ignores non-object array entries", () => {
    const type = freshType();
    const stored = storeObject({ id: 1, __type: type, __timestamp: 1, tags: ["a", "b"] });
    expect(stored.tags).toEqual(["a", "b"]);
  });

  it("canonicalizes TypedObjects nested inside plain dictionaries", () => {
    const innerType = freshType();
    const outerType = freshType();
    const inner = storeObject({ id: 50, __type: innerType, __timestamp: 1 });
    const outer = storeObject({
      id: 60,
      __type: outerType,
      __timestamp: 1,
      meta: { nested: { id: 50, __type: innerType, __timestamp: 1 } },
    });
    expect((outer.meta as Record<string, unknown>).nested as TypedObject).toBe(inner);
  });

  it("breaks reference cycles via recentlyStoredObjects", () => {
    const type = freshType();
    const a: TypedObject = { id: 1, __type: type, __timestamp: 1 };
    const b: TypedObject = { id: 2, __type: type, __timestamp: 1 };
    a.partner = b;
    b.partner = a;
    const storedA = storeObject(a);
    expect((storedA.partner as TypedObject).id).toBe(2);
    expect((storedA.partner as TypedObject).partner as TypedObject).toBe(storedA);
  });
});

describe("storeObjects", () => {
  it("stores each array element and returns shared instances", () => {
    const type = freshType();
    const first = storeObject({ id: 1, __type: type, __timestamp: 1 });
    const result = storeObjects([
      { id: 1, __type: type, __timestamp: 1 },
      { id: 2, __type: type, __timestamp: 1 },
    ]);
    expect(result[0]).toBe(first);
    expect(result[1]!.id).toBe(2);
  });

  it("leaves non-object entries untouched", () => {
    const arr = [null, 5] as unknown as TypedObject[];
    expect(storeObjects(arr)).toEqual([null, 5]);
  });
});

describe("hasRecentUpdates (fix #1 — scalar __timestamp)", () => {
  it("returns true when either object lacks a __timestamp", () => {
    expect(hasRecentUpdates({ __type: "X" }, { __type: "X", __timestamp: 1 })).toBe(true);
    expect(hasRecentUpdates({ __type: "X", __timestamp: 1 }, { __type: "X" })).toBe(true);
    expect(hasRecentUpdates({ __type: "X", __timestamp: 1 }, null)).toBe(true);
  });

  it("returns true when the incoming object timestamp is newer", () => {
    expect(
      hasRecentUpdates(
        { __type: "X", __timestamp: 2, name: "b" },
        { __type: "X", __timestamp: 1, name: "a" }
      )
    ).toBe(true);
  });

  it("returns FALSE for an older payload that differs only in scalar fields", () => {
    // The bug: a scalar with no __timestamp used to force `true`, so the
    // older-payload skip never fired. It must now return false.
    expect(
      hasRecentUpdates(
        { __type: "X", __timestamp: 1, name: "old-server-value", status: "x" },
        { __type: "X", __timestamp: 5, name: "newer-local-value", status: "y" }
      )
    ).toBe(false);
  });

  it("returns true for equal object timestamps (same timestamp ⇒ update)", () => {
    // Equal timestamps are treated as an update so the payload merges, matching
    // applyObject's `>=` rule and the original "same timestamp ⇒ update" intent.
    expect(
      hasRecentUpdates(
        { __type: "X", __timestamp: 5, name: "a" },
        { __type: "X", __timestamp: 5, name: "b" }
      )
    ).toBe(true);
  });

  it("returns true for an older payload that adds a NEW child TypedObject", () => {
    expect(
      hasRecentUpdates(
        { __type: "X", __timestamp: 1, child: { id: 9, __type: "C", __timestamp: 1 } },
        { __type: "X", __timestamp: 5 }
      )
    ).toBe(true);
  });

  it("returns true for an older payload whose child TypedObject is newer", () => {
    expect(
      hasRecentUpdates(
        { __type: "X", __timestamp: 1, child: { id: 9, __type: "C", __timestamp: 9 } },
        { __type: "X", __timestamp: 5, child: { id: 9, __type: "C", __timestamp: 1 } }
      )
    ).toBe(true);
  });

  it("returns true for a new TypedObject appearing in an array", () => {
    expect(
      hasRecentUpdates(
        { __type: "X", __timestamp: 1, items: [{ id: 1, __type: "C", __timestamp: 1 }] },
        { __type: "X", __timestamp: 5, items: [] }
      )
    ).toBe(true);
  });

  it("ignores non-TypedObject array items when older", () => {
    expect(
      hasRecentUpdates(
        { __type: "X", __timestamp: 1, items: ["a", "b"] },
        { __type: "X", __timestamp: 5, items: ["a"] }
      )
    ).toBe(false);
  });

  it("recurses into a matching array child and reports it newer", () => {
    expect(
      hasRecentUpdates(
        { __type: "X", __timestamp: 1, items: [{ id: 1, __type: "C", __timestamp: 9 }] },
        { __type: "X", __timestamp: 5, items: [{ id: 1, __type: "C", __timestamp: 1 }] }
      )
    ).toBe(true);
  });

  it("returns false when a matching array child is not newer", () => {
    expect(
      hasRecentUpdates(
        { __type: "X", __timestamp: 1, items: [{ id: 1, __type: "C", __timestamp: 1 }] },
        { __type: "X", __timestamp: 5, items: [{ id: 1, __type: "C", __timestamp: 5 }] }
      )
    ).toBe(false);
  });

  it("treats an array child with no match in the old list as new info", () => {
    expect(
      hasRecentUpdates(
        { __type: "X", __timestamp: 1, items: [{ id: 1, __type: "C", __timestamp: 1 }] },
        { __type: "X", __timestamp: 5, items: [{ id: 2, __type: "C", __timestamp: 1 }] }
      )
    ).toBe(true);
  });

  it("treats an array child as new when the old list holds only non-typed items", () => {
    expect(
      hasRecentUpdates(
        { __type: "X", __timestamp: 1, items: [{ id: 1, __type: "C", __timestamp: 1 }] },
        { __type: "X", __timestamp: 5, items: [{ plain: true }] }
      )
    ).toBe(true);
  });

  it("returns true when a scalar field carries an explicitly newer field timestamp", () => {
    expect(
      hasRecentUpdates(
        { __type: "X", __timestamp: 1, status: "b", __fieldTimestamps: { status: 9 } },
        { __type: "X", __timestamp: 5, status: "a", __fieldTimestamps: { status: 1 } }
      )
    ).toBe(true);
  });
});

describe("per-field causal merge (fix #2)", () => {
  it("AC#3: keeps a user-edited field while applying a server-newer field", () => {
    const type = freshType();
    const id = 1;
    // Baseline stored at t=100.
    storeObject({ id, __type: type, name: "orig", status: "a", __timestamp: 100 });
    // User edits `name` optimistically at t=200.
    storeObject({ id, __type: type, name: "edited", __timestamp: 200 });
    // Late server payload: object older (150) but status advanced (250), name stale (150).
    const merged = storeObject({
      id,
      __type: type,
      name: "server-name",
      status: "b",
      __timestamp: 150,
      __fieldTimestamps: { name: 150, status: 250 },
    });
    expect(merged.name).toBe("edited"); // user edit preserved
    expect(merged.status).toBe("b"); // server-newer field applied
  });

  it("AC#5: a delayed first response carrying pre-second-edit state does not clobber the second edit", () => {
    const type = freshType();
    const id = 1;
    storeObject({ id, __type: type, value: "v0", __timestamp: 100 });
    storeObject({ id, __type: type, value: "v1", __timestamp: 200 }); // edit 1
    const afterEdit2 = storeObject({ id, __type: type, value: "v2", __timestamp: 300 }); // edit 2
    // First request's late response carries the pre-edit-2 value with its older timestamp.
    storeObject({ id, __type: type, value: "v1", __timestamp: 200 });
    expect(afterEdit2.value).toBe("v2");
  });

  it("applies an equal-timestamp field (at-least-as-new wins) and advances the ledger", () => {
    const type = freshType();
    const id = 1;
    const stored = storeObject({
      id,
      __type: type,
      name: "orig",
      __timestamp: 100,
    } as TypedObject);
    storeObject({ id, __type: type, name: "equal-ts", __timestamp: 100 });
    expect(stored.name).toBe("equal-ts");
    // The per-field ledger is the mechanism of the causal merge — assert it advanced.
    expect(stored.__fieldTimestamps?.name).toBe(100);
  });

  it("does not lower the object-level timestamp when keeping a user edit", () => {
    const type = freshType();
    const id = 1;
    const merged = storeObject({ id, __type: type, name: "orig", __timestamp: 100 });
    storeObject({ id, __type: type, name: "edited", __timestamp: 200 });
    storeObject({
      id,
      __type: type,
      name: "server-name",
      __timestamp: 150,
      __fieldTimestamps: { name: 150 },
    });
    expect(merged.name).toBe("edited");
    expect(merged.__timestamp).toBe(200); // not lowered to 150
  });

  it("merges a newer TypedObject nested in a plain dict even when the parent is stale", () => {
    const childType = freshType();
    const parentType = freshType();
    const pid = 1;
    const cid = 2;
    storeObject({
      id: pid,
      __type: parentType,
      __timestamp: 100,
      meta: { nested: { id: cid, __type: childType, label: "c0", __timestamp: 100 } },
    });
    storeObject({
      id: pid,
      __type: parentType,
      __timestamp: 50, // parent older overall
      meta: { nested: { id: cid, __type: childType, label: "c1", __timestamp: 200 } },
    });
    const storedChild = storeObject({ id: cid, __type: childType, __timestamp: 1 } as TypedObject);
    expect(storedChild.label).toBe("c1");
  });

  it("applies an across-the-board newer payload", () => {
    const type = freshType();
    const id = 1;
    const stored = storeObject({ id, __type: type, a: 1, b: 2, __timestamp: 100 });
    storeObject({ id, __type: type, a: 9, b: 8, __timestamp: 200 });
    expect(stored.a).toBe(9);
    expect(stored.b).toBe(8);
  });

  it("adds brand-new fields from a newer payload", () => {
    const type = freshType();
    const id = 1;
    const stored = storeObject({ id, __type: type, a: 1, __timestamp: 100 } as TypedObject);
    storeObject({ id, __type: type, a: 1, c: "new", __timestamp: 200 });
    expect(stored.c).toBe("new");
  });

  it("merges newer children even when the parent payload is stale", () => {
    const childType = freshType();
    const parentType = freshType();
    const pid = 1;
    const cid = 2;
    storeObject({
      id: pid,
      __type: parentType,
      __timestamp: 100,
      child: { id: cid, __type: childType, label: "c0", __timestamp: 100 },
    });
    // Parent payload older overall, but the child advanced.
    storeObject({
      id: pid,
      __type: parentType,
      __timestamp: 50,
      child: { id: cid, __type: childType, label: "c1", __timestamp: 200 },
    });
    const storedChild = storeObject({ id: cid, __type: childType, __timestamp: 1 } as TypedObject);
    expect(storedChild.label).toBe("c1");
  });

  it("initializes a missing array on the stored object when applying a stale payload's children", () => {
    const type = freshType();
    const id = 1;
    // Store a newer object that has no `data` array.
    storeObject({ id, __type: type, __timestamp: 100 });
    // Stale payload (older, no newer typed children) carrying an array of PLAIN
    // objects → rejected wholesale, but its children are still applied onto the
    // stored object, which must lazily create the missing array.
    const stored = storeObject({
      id,
      __type: type,
      __timestamp: 50,
      data: [{ plain: "x" }],
    } as TypedObject);
    expect(Array.isArray(stored.data)).toBe(true);
    expect((stored.data as Array<{ plain: string }>)[0]!.plain).toBe("x");
  });
});

describe("registered lists + removeObjectFromLists", () => {
  const listRefs: ReturnType<typeof ref<TypedObject[]>>[] = [];

  afterEach(() => {
    for (const r of listRefs) unregisterList(r as Ref<TypedObject[]>);
    listRefs.length = 0;
  });

  it("removes a matching item from a registered external list ref", () => {
    const type = freshType();
    const item = storeObject({ id: 1, __type: type, __timestamp: 1 });
    const listRef = ref<TypedObject[]>([item]);
    listRefs.push(listRef);
    registerList(listRef);
    removeObjectFromLists(item);
    expect(listRef.value).toHaveLength(0);
  });

  it("leaves a registered list untouched when nothing matches", () => {
    const type = freshType();
    const item = storeObject({ id: 1, __type: type, __timestamp: 1 });
    const other = storeObject({ id: 2, __type: type, __timestamp: 1 });
    const listRef = ref<TypedObject[]>([item]);
    listRefs.push(listRef);
    registerList(listRef);
    removeObjectFromLists(other);
    expect(listRef.value).toHaveLength(1);
  });

  it("ignores an empty registered list", () => {
    const type = freshType();
    const item = storeObject({ id: 1, __type: type, __timestamp: 1 });
    const listRef = ref<TypedObject[]>([]);
    listRefs.push(listRef);
    registerList(listRef);
    expect(() => removeObjectFromLists(item)).not.toThrow();
  });

  it("removes a matching item from array properties of stored objects", () => {
    const childType = freshType();
    const parentType = freshType();
    const child = storeObject({ id: 1, __type: childType, __timestamp: 1 });
    const parent = storeObject({
      id: 2,
      __type: parentType,
      __timestamp: 1,
      items: [{ id: 1, __type: childType, __timestamp: 1 }],
    });
    expect(parent.items as TypedObject[]).toHaveLength(1);
    removeObjectFromLists(child);
    expect(parent.items as TypedObject[]).toHaveLength(0);
  });

  it("removes an object from lists automatically when stored with __deleted_at", () => {
    const childType = freshType();
    const parentType = freshType();
    const child = storeObject({ id: 1, __type: childType, __timestamp: 1 });
    const parent = storeObject({
      id: 2,
      __type: parentType,
      __timestamp: 1,
      items: [{ id: 1, __type: childType, __timestamp: 1 }],
    });
    expect(parent.items as TypedObject[]).toHaveLength(1);
    storeObject({ ...child, __deleted_at: "2026-01-01T00:00:00Z", __timestamp: 100 });
    expect(parent.items as TypedObject[]).toHaveLength(0);
  });
});

describe("autoRefreshObject / stopAutoRefreshObject", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("throws for an object without id/__type", async () => {
    await expect(
      autoRefreshObject(
        "bad",
        {} as TypedObject,
        () => true,
        async (o) => o
      )
    ).rejects.toThrow("Invalid stored object");
  });

  it("invokes the callback and stores the result when the condition holds", async () => {
    const type = freshType();
    const object = storeObject({ id: 1, __type: type, status: "pending", __timestamp: 1 });
    const callback = vi
      .fn()
      .mockResolvedValue({ id: 1, __type: type, status: "done", __timestamp: 100 });
    await autoRefreshObject("r1", object, (o) => o.status === "pending", callback);
    expect(callback).toHaveBeenCalledOnce();
    expect(object.status).toBe("done");
    stopAutoRefreshObject("r1");
  });

  it("does not invoke the callback when the condition is false but still schedules", async () => {
    const type = freshType();
    const object = storeObject({ id: 1, __type: type, status: "done", __timestamp: 1 });
    const callback = vi.fn().mockResolvedValue(object);
    await autoRefreshObject("r2", object, () => false, callback);
    expect(callback).not.toHaveBeenCalled();
    stopAutoRefreshObject("r2");
  });

  it("flashes an error and returns when the refreshed object has no id", async () => {
    const type = freshType();
    const object = storeObject({
      id: 1,
      __type: type,
      name: "thing",
      status: "pending",
      __timestamp: 1,
    });
    const errorSpy = vi.spyOn(FlashMessages, "error").mockImplementation(() => {});
    const callback = vi.fn().mockResolvedValue({ __type: type });
    await autoRefreshObject("r3", object, () => true, callback);
    expect(errorSpy).toHaveBeenCalledOnce();
    stopAutoRefreshObject("r3");
  });

  it("reschedules itself after the interval", async () => {
    const type = freshType();
    const object = storeObject({ id: 1, __type: type, status: "pending", __timestamp: 1 });
    const callback = vi
      .fn()
      .mockResolvedValue({ id: 1, __type: type, status: "pending", __timestamp: 100 });
    await autoRefreshObject("r4", object, () => true, callback, 1000);
    expect(callback).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1000);
    expect(callback).toHaveBeenCalledTimes(2);
    stopAutoRefreshObject("r4");
  });

  it("stopAutoRefreshObject is a no-op for an unknown name", () => {
    expect(() => stopAutoRefreshObject("never-registered")).not.toThrow();
  });
});
