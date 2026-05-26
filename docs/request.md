# Request

A typed HTTP helper built on the native Fetch API. Provides JSON GET/POST,
request deduplication via abort, two concurrency-coordination modes, and
app-version mismatch detection — with **zero** runtime dependencies.

Ported from `quasar-ui-danx` with a correctness fix: ordering uses a monotonic
sequence counter instead of `Date.now()`, so two requests started in the same
millisecond can no longer tie (and let a stale response win).

## Configuration

Configure once at app startup:

```ts
import { configureRequest } from "@thehammer/danx-ui";

configureRequest({
  baseUrl: "https://api.example.com",
  headers: { Authorization: `Bearer ${token}`, "X-App-Version": APP_VERSION },
  onUnauthorized: (body, res) => redirectToLogin(),
  onAppVersionMismatch: (serverVersion) => promptReload(serverVersion),
});
```

Relative URLs are resolved against `baseUrl`; absolute (`http…`) URLs pass
through unchanged.

## request.get / request.post / request.call

```ts
import { request } from "@thehammer/danx-ui";

const list = await request.get("users", { params: { page: 1, filter: { active: true } } });
const saved = await request.post("users", { name: "Ada" });
```

Object-valued `params` are JSON-stringified and appended as query string.

### Concurrency options

| Option | Behavior |
|--------|----------|
| `requestKey` | Identity for concurrent-call coordination (default: url + params) |
| `waitOnPrevious` | Serialise behind the previous same-key request instead of aborting it |
| `useMostRecentResponse` | Resolve to the latest same-key request's response, never an out-of-order earlier one |
| `ignoreAbort` | Return `{ abort: true }` instead of throwing when superseded |

By default a newer same-key request **aborts** the older one. `waitOnPrevious`
and `useMostRecentResponse` are flags on the call — there are no separate
wrapper functions.

```ts
// Type-ahead: only the freshest response is delivered.
const results = await request.get("search", {
  requestKey: "search",
  params: { q },
  useMostRecentResponse: true,
});
```

### Monotonic ordering (bug fix)

Each call takes a strictly-increasing `sequence` number. The "is this still the
most recent request?" check compares sequences, not timestamps, so
same-millisecond requests get a unique total order and the stale one can never
win.

## request.poll(url, options, interval, fnUntil?)

Repeatedly calls until `fnUntil(response)` returns true (default: truthy
response), sleeping `interval` ms between attempts.

```ts
const done = await request.poll("jobs/42", {}, 2000, (j) => j.status === "complete");
```

## Helpers

### fetchResourceListWithSelected(fetchFn, listRef, id, filter)

Fetches a filtered list while guaranteeing the currently-selected item is
present even if the filter would exclude it.

### getUrlParam(key, url?)

Reads a query parameter from `url` (or `window.location.search`).

## Exports

`request`, `configureRequest`, `requestConfig`,
`fetchResourceListWithSelected`, `getUrlParam`, and the `RequestApi`,
`ActiveRequest`, `RequestCallOptions`, `RequestConfig` types.
