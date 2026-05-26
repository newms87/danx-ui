# Actions

A composable for wiring reactive, route-backed actions to your resources:
delete, save, create, batch operations, etc. Each action can show a confirmation
or input dialog, run optimistic updates through the [object store](./object-store.md),
debounce, and toggle a per-item `isSaving` flag while a request is in flight.

Ported from `quasar-ui-danx` with zero runtime dependencies on it.

## useActions(actionDefinitions, globalOptions?)

Creates a namespace-scoped set of actions wired to your API routes.

```ts
import { useActions, withDefaultActions } from "@thehammer/danx-ui";

const { getAction, action } = useActions(
  withDefaultActions("Workflow", routes),
  { routes: { applyAction: routes.applyAction, batchAction: routes.batchAction } }
);

const del = getAction("delete");
await action("delete", item);     // runs the delete, toggles item.isSaving
```

`useActions` returns `UseActionsReturn`:

| Member | Purpose |
|--------|---------|
| `getAction(name, options?)` | Resolve (and lazily create) an action by name |
| `getActions(names)` | Resolve several actions at once |
| `action(actionOrName, target?, input?)` | Execute an action against a target item or list |
| `modifyAction(name, options)` | Mutate an existing action's options in place |
| `extendAction(name, id, options)` | Instance-scoped copy with overridden options |

## withDefaultActions(label, routes)

Returns the standard CRUD action set (create / edit / delete, etc.) for a
resource label, ready to pass into `useActions`. Override or extend individual
entries as needed.

## activeActionVnode

A reactive ref holding the action's currently-active dialog vnode (confirmation
or input). Render it at the app root so any action can surface its dialog:

```ts
import { activeActionVnode, ConfirmActionDialog, CreateNewWithNameDialog } from "@thehammer/danx-ui";
```

`ConfirmActionDialog` and `CreateNewWithNameDialog` are the built-in dialogs the
default actions use.

## useActionStore(routes)

A lazy, load-once list store for route-backed lists that rarely change (statuses,
categories, users). Returns `UseActionStoreReturn`:

```ts
const { listItems, isRefreshing, hasLoadedItems, loadItems, refreshItems } =
  useActionStore(routes);

onMounted(loadItems);   // loads once
await refreshItems();   // always re-fetches
```

`routes.list(filter)` may return either an array or a `{ data: [] }` envelope.

## Exports

`useActions`, `withDefaultActions`, `activeActionVnode`, `useActionStore`,
`ConfirmActionDialog`, `CreateNewWithNameDialog`, and the `ActionOptions`,
`ActionGlobalOptions`, `ResourceAction`, `UseActionsReturn`, `ActionTarget`,
`ActionTargetItem`, `ListController`, `ListControllerRoutes`,
`UseActionStoreReturn` types.
