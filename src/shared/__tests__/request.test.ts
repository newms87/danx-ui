import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref } from "vue";
import { request, fetchResourceListWithSelected, getUrlParam } from "../request";
import { configureRequest } from "../requestConfig";

// Helpers for mocking fetch
function mockFetch(json: unknown, status = 200, headers: Record<string, string> = {}) {
  const responseHeaders = new Headers(headers);
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(json),
    headers: {
      get: (key: string) => responseHeaders.get(key),
    },
  });
}

beforeEach(() => {
  configureRequest({ baseUrl: "https://api.test", headers: {} });
  // Clear active requests between tests
  request.activeRequests = {};
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("request.url", () => {
  it("prepends baseUrl to relative paths", () => {
    configureRequest({ baseUrl: "https://api.example.com" });
    expect(request.url("users")).toBe("https://api.example.com/users");
  });

  it("strips trailing slash from baseUrl", () => {
    configureRequest({ baseUrl: "https://api.example.com/" });
    expect(request.url("users")).toBe("https://api.example.com/users");
  });

  it("passes absolute URLs through unchanged", () => {
    expect(request.url("https://other.com/endpoint")).toBe("https://other.com/endpoint");
  });
});

describe("request.call", () => {
  it("returns parsed JSON on success", async () => {
    const fetchMock = mockFetch({ ok: true, data: "hello" });
    vi.stubGlobal("fetch", fetchMock);

    const result = await request.call("endpoint");
    expect(result).toEqual({ ok: true, data: "hello" });
  });

  it("appends query params to URL", async () => {
    const fetchMock = mockFetch({});
    vi.stubGlobal("fetch", fetchMock);

    await request.call("search", { params: { q: "test", page: 1 } });
    const url = fetchMock.mock.calls[0]![0] as string;
    expect(url).toMatch(/q=test/);
    expect(url).toMatch(/page=1/);
  });

  it("serialises object params to JSON strings", async () => {
    const fetchMock = mockFetch({});
    vi.stubGlobal("fetch", fetchMock);

    await request.call("q", { params: { filter: { active: true } } });
    const url = fetchMock.mock.calls[0]![0] as string;
    expect(url).toMatch(/filter=%7B/); // URL-encoded {
  });

  it("rethrows a non-abort fetch error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network failure")));
    await expect(request.call("boom")).rejects.toThrow("network failure");
  });

  it("rethrows an abort error when ignoreAbort is not set", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Request was aborted due to a newer request"))
    );
    await expect(request.call("aborted-no-ignore")).rejects.toThrow("Request was aborted");
  });

  it("returns abort object when request is aborted and ignoreAbort=true", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Request was aborted due to a newer request"))
    );

    const result = await request.call("aborted", { ignoreAbort: true });
    expect(result).toEqual({ abort: true });
  });

  it("returns abort object when superseded by a newer request", async () => {
    let resolveLate!: (v: unknown) => void;
    const late = new Promise((resolve) => {
      resolveLate = resolve;
    });

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementationOnce(() =>
          late.then(() => ({
            status: 200,
            json: () => Promise.resolve({ msg: "late" }),
            headers: { get: () => null },
          }))
        )
        .mockResolvedValueOnce({
          status: 200,
          json: () => Promise.resolve({ msg: "fast" }),
          headers: { get: () => null },
        })
    );

    // Start two requests with the same key
    const p1 = request.call("dup", { requestKey: "same-key" });
    const p2 = request.call("dup", { requestKey: "same-key" });

    resolveLate(undefined);
    const [r1, r2] = await Promise.all([p1, p2]);

    // The first (slower) request was superseded — returns abort
    expect((r1 as { abort?: boolean }).abort).toBe(true);
    // The second (faster) request returns its own data
    expect((r2 as { msg: string }).msg).toBe("fast");
  });

  it("sets error=true on server exception without error field", async () => {
    vi.stubGlobal("fetch", mockFetch({ exception: "SomeException" }, 422));

    const result = (await request.call("err")) as Record<string, unknown>;
    expect(result.error).toBe(true);
  });

  it("calls onUnauthorized on 401", async () => {
    vi.stubGlobal("fetch", mockFetch({ message: "Unauthorized" }, 401));
    const handler = vi.fn().mockReturnValue({ redirected: true });
    configureRequest({ onUnauthorized: handler });

    const result = await request.call("protected");
    expect(handler).toHaveBeenCalledOnce();
    expect(result).toEqual({ redirected: true });
  });
});

describe("request.get / request.post", () => {
  it("get includes Accept/Content-Type headers", async () => {
    const fetchMock = mockFetch({});
    vi.stubGlobal("fetch", fetchMock);

    await request.get("resource");
    const opts = fetchMock.mock.calls[0]![1] as RequestInit;
    const headers = opts.headers as Record<string, string>;
    expect(headers["Accept"]).toBe("application/json");
    expect(headers["Content-Type"]).toBe("application/json");
    expect(opts.method).toBe("get");
  });

  it("post serialises body to JSON", async () => {
    const fetchMock = mockFetch({});
    vi.stubGlobal("fetch", fetchMock);

    await request.post("resource", { name: "test" });
    const opts = fetchMock.mock.calls[0]![1] as RequestInit;
    expect(opts.method).toBe("post");
    expect(opts.body).toBe(JSON.stringify({ name: "test" }));
  });

  it("post with no data sends no body", async () => {
    const fetchMock = mockFetch({});
    vi.stubGlobal("fetch", fetchMock);

    await request.post("resource");
    const opts = fetchMock.mock.calls[0]![1] as RequestInit;
    expect(opts.body).toBeUndefined();
  });
});

// BUG FIX REGRESSION: monotonic sequence counter
describe("useMostRecentResponse — monotonic sequence counter (bug fix)", () => {
  it("resolves to the most-recent response even when two requests start at the same ms", async () => {
    // Simulate two requests "at the same time" — the old code used Date.now()
    // and both would get the same timestamp, causing a race where the stale one
    // could win.  The fix uses a monotonic counter, so the second is always
    // identified as most-recent.

    let resolveEarly!: (v: unknown) => void;
    let resolveLate!: (v: unknown) => void;
    const earlyPromise = new Promise((resolve) => {
      resolveEarly = resolve;
    });
    const latePromise = new Promise((resolve) => {
      resolveLate = resolve;
    });

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementationOnce(() =>
          earlyPromise.then(() => ({
            status: 200,
            json: () => Promise.resolve({ req: "early" }),
            headers: { get: () => null },
          }))
        )
        .mockImplementationOnce(() =>
          latePromise.then(() => ({
            status: 200,
            json: () => Promise.resolve({ req: "late" }),
            headers: { get: () => null },
          }))
        )
    );

    // Both requests start with useMostRecentResponse=true
    const p1 = request.call("resource", {
      requestKey: "mono-key",
      waitOnPrevious: true,
      useMostRecentResponse: true,
    });
    const p2 = request.call("resource", {
      requestKey: "mono-key",
      waitOnPrevious: true,
      useMostRecentResponse: true,
    });

    // Resolve early request first, then late
    resolveEarly(undefined);
    await Promise.resolve();
    resolveLate(undefined);
    await Promise.resolve();

    const [r1, r2] = await Promise.all([p1, p2]);

    // Both requests with useMostRecentResponse should settle on the latest
    expect((r2 as { req: string }).req).toBe("late");
    // r1 waits on r2 (the more recent), so it also gets "late"
    expect((r1 as { req: string }).req).toBe("late");
  });
});

describe("fetchResourceListWithSelected", () => {
  it("fetches filtered list and preserves selected item", async () => {
    const allItems = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const fetchFn = vi.fn().mockImplementation(async ({ id }: { id?: string } = {}) => {
      if (id) return allItems.filter((i) => i.id === id);
      return [allItems[0]]; // filtered result that excludes selected
    });

    const list = ref<{ id: string }[]>([]);
    await fetchResourceListWithSelected(fetchFn, list, "b", { active: true });

    expect(list.value).toContainEqual({ id: "a" }); // in filtered result
    expect(list.value).toContainEqual({ id: "b" }); // selected, added back
    expect(list.value).not.toContainEqual({ id: "c" }); // not in filtered + not selected
  });

  it("skips selected fetch when id is empty", async () => {
    const fetchFn = vi.fn().mockResolvedValue([{ id: "x" }]);
    const list = ref<{ id: string }[]>([]);
    await fetchResourceListWithSelected(fetchFn, list, "", {});

    expect(fetchFn).toHaveBeenCalledOnce();
    expect(list.value).toEqual([{ id: "x" }]);
  });

  it("does not fetch the selected item when it is already in the list", async () => {
    const fetchFn = vi.fn().mockImplementation(async ({ id }: { id?: string } = {}) => {
      if (id) return [{ id }];
      return [{ id: "a" }, { id: "b" }];
    });
    const list = ref<{ id: string }[]>([{ id: "b" }]); // selected already present
    await fetchResourceListWithSelected(fetchFn, list, "b", { active: true });

    // Only the filter fetch happened, not the by-id lookup
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(list.value).toContainEqual({ id: "b" });
  });
});

describe("request.poll", () => {
  it("polls until fnUntil returns true", async () => {
    const responses = [{ done: false }, { done: false }, { done: true }];
    let i = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => {
        const body = responses[i++];
        return Promise.resolve({
          status: 200,
          json: () => Promise.resolve(body),
          headers: { get: () => null },
        });
      })
    );

    const result = await request.poll("status", {}, 1, (r) => !!(r as { done?: boolean }).done);
    expect((result as { done: boolean }).done).toBe(true);
  });

  it("uses default truthy predicate when fnUntil is omitted", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 200,
        json: () => Promise.resolve({ ok: true }),
        headers: { get: () => null },
      })
    );
    const result = await request.poll("status", {}, 1);
    expect(result).toEqual({ ok: true });
  });
});

describe("checkAppVersion", () => {
  it("invokes onAppVersionMismatch when client and server versions differ", async () => {
    const onMismatch = vi.fn();
    configureRequest({
      headers: { "X-App-Version": "1.0.0" },
      onAppVersionMismatch: onMismatch,
    });
    vi.stubGlobal("fetch", mockFetch({ ok: true }, 200, { "X-App-Version": "2.0.0" }));

    await request.call("versioned");
    expect(onMismatch).toHaveBeenCalledWith("2.0.0");
  });

  it("does not invoke onAppVersionMismatch when versions match", async () => {
    const onMismatch = vi.fn();
    configureRequest({
      headers: { "X-App-Version": "1.0.0" },
      onAppVersionMismatch: onMismatch,
    });
    vi.stubGlobal("fetch", mockFetch({ ok: true }, 200, { "X-App-Version": "1.0.0" }));

    await request.call("versioned");
    expect(onMismatch).not.toHaveBeenCalled();
  });
});

describe("getUrlParam", () => {
  it("extracts a query param from the provided URL", () => {
    expect(getUrlParam("foo", "https://host.com/path?foo=bar&baz=qux")).toBe("bar");
  });

  it("returns null for absent param", () => {
    expect(getUrlParam("missing", "https://host.com/?a=1")).toBeNull();
  });

  it("falls back to window.location.search when no URL is provided", () => {
    // happy-dom default location has an empty search → returns null, but this
    // exercises the window.location.search branch.
    expect(getUrlParam("anything")).toBeNull();
  });
});
