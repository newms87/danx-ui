# Object Store

A reactive, identity-based cache for server entities. The same logical record
(`__type + id`) is represented by **one** `shallowReactive` instance for the
lifetime of the app, so every component that holds a reference sees the same
live data. Incoming payloads are merged with **per-field causality**, which
prevents a delayed or out-of-order server response from silently overwriting a
field the user just edited.

Ported from the deprecated `quasar-ui-danx` with three correctness fixes (see
[Causality & staleness](#causality--staleness)).

## TypedObject shape

Objects managed by the store implement `TypedObject`:

| Field | Purpose |
|-------|---------|
| `id` / `name` | Identity within the `__type` namespace (`name` is the fallback) |
| `__type` | Class discriminator — required for store keying |
| `__id` | Stable internal UUID (auto-assigned) |
| `__timestamp` | Object-level update time (ISO string or Unix ms; defaults to `updated_at`) |
| `__fieldTimestamps` | Per-field update times (Unix ms) for causality merging |
| `__deleted_at` | When set, the object is auto-removed from all registered lists |

## storeObject(object)

Insert or merge a single object. **Returns the canonical reactive instance** —
callers must replace their local reference with the return value.

```ts
import { storeObject } from "@thehammer/danx-ui";

let user = storeObject({ __type: "User", id: 1, name: "Ada" });
// A later payload for the same id+type merges into the SAME instance:
const same = storeObject({ __type: "User", id: 1, role: "admin" });
same === user; // true
```

Objects without both an identity (`id`/`name`) and a `__type` are returned as a
fresh reactive instance and are **not** cached.

## storeObjects(objects)

Maps `storeObject` over an array, returning the array of canonical instances.

```ts
const users = storeObjects(response.data);
```

## Causality & staleness

When a payload arrives for an already-stored object, the merge is **per field**:
an incoming field is applied only when its timestamp is `>=` the stored field's
timestamp. The incoming field timestamp is `__fieldTimestamps[key]`, falling
back to the object-level `__timestamp`.

```ts
const t0 = Date.now();
storeObject({ __type: "Doc", id: 1, title: "Draft", status: "open",
  __timestamp: t0, __fieldTimestamps: { title: t0, status: t0 } });

// User edits title locally — stamps a newer per-field timestamp:
storeObject({ __type: "Doc", id: 1, title: "My edit",
  __timestamp: Date.now(), __fieldTimestamps: { title: Date.now() } });

// A stale response carrying the OLD title (t0) + a newer status:
storeObject({ __type: "Doc", id: 1, title: "Draft", status: "in-review",
  __timestamp: Date.now(), __fieldTimestamps: { title: t0, status: Date.now() } });
// → title stays "My edit" (older rejected), status becomes "in-review".
```

### Fixes carried in during the port

1. **`hasRecentUpdates` no longer short-circuits on scalars.** A missing
   `__timestamp` is treated as "new info" **only** for child `TypedObject`s
   (`value.__type`), never for plain scalars — so the "incoming is older → keep
   stored" path actually fires.
2. **No wholesale `Object.assign`.** Replaced with the per-field causality merge
   above, so concurrent edits resolve newest-per-field with no silent clobber.
3. **Monotonic request ordering** (see [Request](./request.md)) replaces
   wall-clock `Date.now()` so same-millisecond responses can't tie.

## hasRecentUpdates(newObject, oldObject)

Predicate used internally to decide whether a payload carries anything newer
than the stored object. Exported for testing.

## Lists & optimistic delete

Register a list ref so that any stored object gaining `__deleted_at` is removed
from it automatically.

```ts
import { registerList, unregisterList } from "@thehammer/danx-ui";

onMounted(() => registerList(myListRef));
onUnmounted(() => unregisterList(myListRef));
```

`removeObjectFromLists(object)` evicts an object manually from every stored list
and registered list ref.

## Auto-refresh

Poll a callback while a condition holds (e.g. a job is still running):

```ts
import { autoRefreshObject, stopAutoRefreshObject } from "@thehammer/danx-ui";

autoRefreshObject(
  "job-42",
  job,
  (j) => j.status === "running",
  (j) => api.fetchJob(j.id),   // must resolve to a TypedObject
  3000                          // interval ms (default 3000)
);

stopAutoRefreshObject("job-42");
```

Re-registering with the same name cancels the previous timer first.

## Exports

`storeObject`, `storeObjects`, `registerList`, `unregisterList`,
`hasRecentUpdates`, `removeObjectFromLists`, `autoRefreshObject`,
`stopAutoRefreshObject`, and the `TypedObject` / `AnyObject` types.
