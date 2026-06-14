# Reactive Data Layer

A zero-dependency reactive data layer: a shared object store, an HTTP `request`
helper, an action system, and ambient configuration. Ported from
`quasar-ui-danx` and fully self-contained here.

## Configuration

The data layer reads ambient configuration from a single module-level singleton.
Call `setDanxOptions()` once at app init.

```ts
import { setDanxOptions } from "@thehammer/danx-ui";

setDanxOptions({
  request: {
    baseUrl: "https://api.example.com",
    headers: { Authorization: `Bearer ${token}` },
    onUnauthorized: () => router.push("/login"),
    onAppVersionMismatch: (version) => console.warn("New version:", version),
  },
  flashMessages: {
    error: { duration: 8000 },
  },
});
```

`request` and `FlashMessages` both read from this one ref — there is no per-call
config threading and no factory. `getDanxOptions()` reads the current value.

## Object store

The store is an identity map keyed by `` `${__type}:${id ?? name}` ``. Storing an
object returns the single shared reactive instance for that identity, so every
part of the app references — and re-renders from — the same object.

```ts
import { storeObject, storeObjects } from "@thehammer/danx-ui";

const user = storeObject({ id: 1, __type: "User", name: "Ada", updated_at: "2026-01-01T00:00:00Z" });
// Anywhere later — same identity returns the same instance:
const same = storeObject({ id: 1, __type: "User" });
same === user; // true

// Store a list; nested TypedObjects are canonicalized too:
const users = storeObjects(response.data);
```

An object participates in the store when it has a `__type` and an `id` (or
`name`). Objects without both are returned reactive but not cached.

### Causality (freshest-wins, per field)

Each stored object tracks per-field "as-of" timestamps (`__fieldTimestamps`,
falling back to the object-level `__timestamp`, which is derived from
`updated_at` when not supplied). On every merge, an incoming field is applied
**only if it is at least as new as the locally-held field**. This makes both of
these correct without any extra work:

- **Rapid single-user edits** — a slow in-flight request's late response cannot
  overwrite a field the user changed after that request was sent.
- **Concurrent multi-user edits** — a server payload still applies the fields it
  legitimately advanced, while leaving fields it has no newer value for.

`hasRecentUpdates(newObject, oldObject)` is the cheap short-circuit: an older
whole-object payload with no newer field or child is skipped entirely. A missing
`__timestamp` counts as "new information" only for child TypedObjects, never for
scalars.

### Optimistic deletes

`registerList(ref)` wires a local list ref so that store-driven removals splice
it automatically; `unregisterList(ref)` (e.g. in `onBeforeUnmount`) cleans up.
`removeObjectFromLists(object)` removes an object from every array property of
every stored object and from all registered list refs. Storing an object with a
`__deleted_at` value triggers this automatically.

### Auto refresh

```ts
autoRefreshObject("job-1", job, (j) => j.status === "running", (j) => routes.details(j));
stopAutoRefreshObject("job-1");
```

Re-runs the callback on an interval while the condition holds, storing each
result, until stopped.

## Request

A thin `fetch` wrapper for JSON APIs. Relative URLs are prefixed with the
configured `baseUrl`; default `Accept`/`Content-Type` and configured headers are
merged in.

```ts
import { request } from "@thehammer/danx-ui";

const user = await request.get("users/1");
const saved = await request.post("users/1", { name: "Ada" });
await request.poll("jobs/1", {}, 2000, (r) => r.status === "done");
```

In-flight requests are tracked per `requestKey` (defaults to URL + params):

- **abort-previous** (default): a newer same-key request aborts the older one.
- **`waitOnPrevious` + `useMostRecentResponse`**: serialize same-key requests and
  resolve every caller to the freshest response.

Ordering uses a process-monotonic sequence counter, never the wall clock, so two
requests started in the same millisecond never tie.

## Actions

`useActions` resolves declarative actions into reactive, store-backed actions
with a bound `trigger`, handling optimistic updates, an optional confirm/input
vnode, the route call, and success/error/finish callbacks.

```ts
import { useActions, useActionRoutes, withDefaultActions } from "@thehammer/danx-ui";

const routes = useActionRoutes("/api/users");
const { getAction } = useActions(withDefaultActions("User", controls), { routes });

await getAction("update").trigger(user, { name: "Ada" });
```

`useActionRoutes(baseUrl, extend?)` returns the standard REST routes
(`list`, `summary`, `details`, `fieldOptions`, `applyAction`, `batchAction`)
wired to the store. `applyAction` uses `waitOnPrevious` + `useMostRecentResponse`
so rapid saves resolve to the latest result. `useActionStore(routes)` is a
load-once, refreshable list cache.

### Default actions

`withDefaultActions(label, controls?)` returns the common CRUD presets. The
`create-with-name` and `delete-with-confirm` presets ship **without** a baked
confirm/name dialog — supply your own `vnode` (built from
[`DanxDialog`](./dialog.md)) when you want one:

```ts
import { h } from "vue";
import { DanxDialog } from "@thehammer/danx-ui";

const { getAction } = useActions(withDefaultActions("User", controls), { routes });
const del = getAction("delete-with-confirm", {
  vnode: (target) => h(DanxDialog, { title: `Delete ${target.name}?` }),
});
```

## Flash messages

`FlashMessages` is a thin facade over the toast singleton, kept for migration
parity. Severities map to toast variants (`error` → `danger`).

```ts
import { FlashMessages } from "@thehammer/danx-ui";

FlashMessages.success("Saved");
FlashMessages.error("Could not save");
FlashMessages.combine("error", ["Name is required", "Email is invalid"]);
```

Render a `<DanxToastContainer />` once in your app for messages to appear.
