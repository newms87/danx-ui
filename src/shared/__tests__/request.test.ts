import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  request,
  PollAbortError,
  PollMaxAttemptsError,
  PollTimeoutError,
} from "../request";
import { danxOptions } from "../config";
import type { DanxOptions } from "../config-types";

type Deferred<T> = { promise: Promise<T>; resolve: (v: T) => void; reject: (e: unknown) => void };

function deferred<T>(): Deferred<T> {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function makeResponse(
  body: unknown,
  { status = 200, headers = {} as Record<string, string> } = {}
): Response {
  return {
    status,
    headers: new Headers(headers),
    json: async () => body,
  } as unknown as Response;
}

/** Let pending microtasks + a timer tick drain. */
function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe("request", () => {
  let snapshot: DanxOptions;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    snapshot = danxOptions.value;
    danxOptions.value = {
      request: { baseUrl: "https://api.test", headers: {} },
      flashMessages: {},
    };
    request.activeRequests = {};
    fetchMock = vi.fn().mockResolvedValue(makeResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    danxOptions.value = snapshot;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe("url", () => {
    it("prepends the configured baseUrl to relative paths", () => {
      expect(request.url("users")).toBe("https://api.test/users");
    });

    it("trims a trailing slash on the baseUrl", () => {
      danxOptions.value = { request: { baseUrl: "https://api.test/" } };
      expect(request.url("users")).toBe("https://api.test/users");
    });

    it("returns absolute http(s) urls unchanged", () => {
      expect(request.url("https://other.test/x")).toBe("https://other.test/x");
    });

    it("uses an empty base when no baseUrl is configured", () => {
      danxOptions.value = { request: {} };
      expect(request.url("users")).toBe("/users");
    });
  });

  describe("get/post", () => {
    it("get merges default, config, and per-call headers", async () => {
      danxOptions.value = { request: { baseUrl: "https://api.test", headers: { "X-Token": "t" } } };
      await request.get("users", { headers: { "X-Extra": "e" } });
      const [, options] = fetchMock.mock.calls[0]!;
      expect(options.method).toBe("get");
      expect(options.headers).toMatchObject({
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Token": "t",
        "X-Extra": "e",
      });
    });

    it("post serializes the body and sets method post", async () => {
      await request.post("users", { name: "Ada" });
      const [url, options] = fetchMock.mock.calls[0]!;
      expect(url).toBe("https://api.test/users");
      expect(options.method).toBe("post");
      expect(options.body).toBe(JSON.stringify({ name: "Ada" }));
    });

    it("post omits the body when no data is provided", async () => {
      await request.post("users");
      const [, options] = fetchMock.mock.calls[0]!;
      expect(options.body).toBeFalsy();
    });
  });

  describe("params", () => {
    it("appends scalar params and JSON-serializes object params", async () => {
      await request.call("users", { params: { page: 2, filter: { active: true } } });
      const [url] = fetchMock.mock.calls[0]!;
      expect(url).toContain("page=2");
      expect(url).toContain(`filter=${encodeURIComponent(JSON.stringify({ active: true }))}`);
    });

    it("uses & when the url already has a query string", async () => {
      await request.call("users?existing=1", { params: { page: 2 } });
      const [url] = fetchMock.mock.calls[0]!;
      expect(url).toBe("https://api.test/users?existing=1&page=2");
    });
  });

  describe("error handling", () => {
    it("returns onUnauthorized result on 401 when a handler is configured", async () => {
      const onUnauthorized = vi.fn().mockReturnValue({ redirected: true });
      danxOptions.value = { request: { baseUrl: "https://api.test", onUnauthorized } };
      fetchMock.mockResolvedValue(makeResponse({ detail: "nope" }, { status: 401 }));
      const result = await request.get("secure");
      expect(onUnauthorized).toHaveBeenCalledWith({ detail: "nope" }, expect.anything());
      expect(result).toEqual({ redirected: true });
    });

    it("returns a default unauthorized object on 401 without a handler", async () => {
      danxOptions.value = { request: { baseUrl: "https://api.test" } };
      fetchMock.mockResolvedValue(makeResponse({ detail: "nope" }, { status: 401 }));
      const result = await request.get("secure");
      expect(result).toEqual({ error: true, message: "Unauthorized", detail: "nope" });
    });

    it("flags exceptions as errors for >400 responses", async () => {
      fetchMock.mockResolvedValue(makeResponse({ exception: "Boom" }, { status: 500 }));
      const result = (await request.get("boom")) as Record<string, unknown>;
      expect(result.error).toBe(true);
    });

    it("does not override an existing error flag", async () => {
      fetchMock.mockResolvedValue(
        makeResponse({ exception: "Boom", error: "custom" }, { status: 500 })
      );
      const result = (await request.get("boom")) as Record<string, unknown>;
      expect(result.error).toBe("custom");
    });
  });

  describe("app version mismatch", () => {
    it("invokes onAppVersionMismatch when client and server versions differ", async () => {
      const onAppVersionMismatch = vi.fn();
      danxOptions.value = {
        request: {
          baseUrl: "https://api.test",
          headers: { "X-App-Version": "1.0" },
          onAppVersionMismatch,
        },
      };
      fetchMock.mockResolvedValue(
        makeResponse({ ok: true }, { headers: { "X-App-Version": "2.0" } })
      );
      await request.get("ping");
      expect(onAppVersionMismatch).toHaveBeenCalledWith("2.0");
    });

    it("does not invoke onAppVersionMismatch when versions match", async () => {
      const onAppVersionMismatch = vi.fn();
      danxOptions.value = {
        request: {
          baseUrl: "https://api.test",
          headers: { "X-App-Version": "1.0" },
          onAppVersionMismatch,
        },
      };
      fetchMock.mockResolvedValue(
        makeResponse({ ok: true }, { headers: { "X-App-Version": "1.0" } })
      );
      await request.get("ping");
      expect(onAppVersionMismatch).not.toHaveBeenCalled();
    });

    it("skips the check when no handler is configured", async () => {
      danxOptions.value = {
        request: { baseUrl: "https://api.test", headers: { "X-App-Version": "1.0" } },
      };
      fetchMock.mockResolvedValue(
        makeResponse({ ok: true }, { headers: { "X-App-Version": "2.0" } })
      );
      await expect(request.get("ping")).resolves.toEqual({ ok: true });
    });
  });

  describe("abort behavior", () => {
    it("returns {abort:true} on an aborted fetch when ignoreAbort is set", async () => {
      fetchMock.mockRejectedValue(new Error("Request was aborted"));
      const result = await request.call("x", { ignoreAbort: true });
      expect(result).toEqual({ abort: true });
    });

    it("rethrows a fetch error when ignoreAbort is not set", async () => {
      fetchMock.mockRejectedValue(new Error("Network down"));
      await expect(request.call("x")).rejects.toThrow("Network down");
    });

    it("aborts the previous same-key request when a newer one starts", async () => {
      const d1 = deferred<Response>();
      const d2 = deferred<Response>();
      let call = 0;
      fetchMock.mockImplementation(() => (++call === 1 ? d1.promise : d2.promise));

      const p1 = request.call("x", { requestKey: "k" });
      await flush();
      const p2 = request.call("x", { requestKey: "k" });
      await flush();

      d1.resolve(makeResponse({ n: 1 }));
      d2.resolve(makeResponse({ n: 2 }));

      // The superseded first request resolves to an abort marker.
      await expect(p1).resolves.toEqual({ abort: true });
      await expect(p2).resolves.toEqual({ n: 2 });
    });

    it("composes a consumer-supplied signal into the fetch signal instead of discarding it", async () => {
      const controller = new AbortController();
      fetchMock.mockResolvedValue(makeResponse({ ok: true }));

      await request.call("x", { requestKey: "k", signal: controller.signal });
      const [, options] = fetchMock.mock.calls[0]!;

      // The signal handed to fetch is not the consumer's raw signal (it's merged
      // with the internal abort-previous controller), but it must still abort
      // when the consumer's signal aborts.
      expect(options.signal).not.toBe(controller.signal);
      expect((options.signal as AbortSignal).aborted).toBe(false);
      controller.abort("consumer cancelled");
      expect((options.signal as AbortSignal).aborted).toBe(true);
    });

    it("still aborts the previous same-key request when a consumer signal is supplied but not fired", async () => {
      const d1 = deferred<Response>();
      const d2 = deferred<Response>();
      let call = 0;
      fetchMock.mockImplementation(() => (++call === 1 ? d1.promise : d2.promise));

      const consumerController = new AbortController();
      const p1 = request.call("x", { requestKey: "k", signal: consumerController.signal });
      await flush();
      const p2 = request.call("x", { requestKey: "k" });
      await flush();

      const [, firstOptions] = fetchMock.mock.calls[0]!;
      expect((firstOptions.signal as AbortSignal).aborted).toBe(true);

      d1.resolve(makeResponse({ n: 1 }));
      d2.resolve(makeResponse({ n: 2 }));

      await expect(p1).resolves.toEqual({ abort: true });
      await expect(p2).resolves.toEqual({ n: 2 });
    });

    it("aborts the merged signal via either the consumer signal or the internal abort-previous controller independently", async () => {
      fetchMock.mockResolvedValue(makeResponse({ ok: true }));

      // Consumer signal alone triggers the merged signal.
      const consumerOnly = new AbortController();
      await request.call("x", { requestKey: "k1", signal: consumerOnly.signal });
      const mergedFromConsumer = fetchMock.mock.calls[0]![1].signal as AbortSignal;
      expect(mergedFromConsumer.aborted).toBe(false);
      consumerOnly.abort();
      expect(mergedFromConsumer.aborted).toBe(true);

      // Internal abort-previous controller alone (no consumer signal) still aborts.
      const d1 = deferred<Response>();
      const d2 = deferred<Response>();
      let call = 0;
      fetchMock.mockImplementation(() => (++call === 1 ? d1.promise : d2.promise));
      const p1 = request.call("x", { requestKey: "k2" });
      await flush();
      const mergedInternalOnly = fetchMock.mock.calls[1]![1].signal as AbortSignal;
      request.call("x", { requestKey: "k2" });
      await flush();
      expect(mergedInternalOnly.aborted).toBe(true);
      d1.resolve(makeResponse({ n: 1 }));
      await expect(p1).resolves.toEqual({ abort: true });
    });
  });

  describe("useMostRecentResponse (monotonic ordering, fix #3)", () => {
    it("uses a monotonic counter to order same-millisecond requests", () => {
      // Ordering must come from the monotonic counter, not Date.now().
      // Capture sequences synchronously during call() (before any async operation).
      const opts = { requestKey: "k" };
      request.call("x", { ...opts });
      const seq1 = request.activeRequests["k"]?.sequence;
      request.call("x", { ...opts });
      const seq2 = request.activeRequests["k"]?.sequence;

      expect(typeof seq1).toBe("number");
      expect(typeof seq2).toBe("number");
      expect(seq2 as number).toBeGreaterThan(seq1 as number);
    });

    it("resolves same-millisecond requests to the truly-latest response", async () => {
      const d1 = deferred<Response>();
      const d2 = deferred<Response>();
      let call = 0;
      fetchMock.mockImplementation(() => (++call === 1 ? d1.promise : d2.promise));

      const opts = { requestKey: "k", waitOnPrevious: true, useMostRecentResponse: true };
      const p1 = request.call("x", { ...opts });
      await flush();
      const p2 = request.call("x", { ...opts });
      await flush();

      d1.resolve(makeResponse({ from: "first" }));
      await flush();
      d2.resolve(makeResponse({ from: "second" }));

      // The earlier caller receives the LATEST request's payload.
      await expect(p1).resolves.toEqual({ from: "second" });
      await expect(p2).resolves.toEqual({ from: "second" });
    });

    it("resolves through multiple supersessions to the final response", async () => {
      const d1 = deferred<Response>();
      const d2 = deferred<Response>();
      const d3 = deferred<Response>();
      let call = 0;
      fetchMock.mockImplementation(() => {
        call += 1;
        return call === 1 ? d1.promise : call === 2 ? d2.promise : d3.promise;
      });

      const opts = { requestKey: "k", waitOnPrevious: true, useMostRecentResponse: true };
      const p1 = request.call("x", { ...opts });
      await flush();
      const p2 = request.call("x", { ...opts });
      await flush();
      const p3 = request.call("x", { ...opts });
      await flush();

      d1.resolve(makeResponse({ from: "first" }));
      await flush();
      d2.resolve(makeResponse({ from: "second" }));
      await flush();
      d3.resolve(makeResponse({ from: "third" }));

      // Every caller resolves to the final, most-recent response.
      await expect(p1).resolves.toEqual({ from: "third" });
      await expect(p2).resolves.toEqual({ from: "third" });
      await expect(p3).resolves.toEqual({ from: "third" });
    });
  });

  describe("poll", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("polls until the predicate is satisfied", async () => {
      vi.useFakeTimers();
      let n = 0;
      fetchMock.mockImplementation(async () => makeResponse({ done: ++n >= 3 }));
      const promise = request.poll("job", {}, 1000, (r) => !!(r as { done: boolean }).done);
      await vi.runAllTimersAsync();
      const result = (await promise) as { done: boolean };
      expect(result.done).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it("uses the default predicate (truthy response) and interval when none is given", async () => {
      vi.useFakeTimers();
      fetchMock.mockResolvedValue(makeResponse({ ok: true }));
      const promise = request.poll("job");
      await vi.runAllTimersAsync();
      const result = await promise;
      expect(result).toEqual({ ok: true });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    describe("bounds", () => {
      it("rejects with PollAbortError when the signal is already aborted", async () => {
        const controller = new AbortController();
        controller.abort("cancelled by caller");
        await expect(
          request.poll("job", {}, 1000, () => false, { signal: controller.signal })
        ).rejects.toThrow(PollAbortError);
      });

      it("rejects with PollAbortError when the signal fires while waiting between attempts", async () => {
        vi.useFakeTimers();
        const controller = new AbortController();
        fetchMock.mockResolvedValue(makeResponse({ done: false }));

        const promise = request.poll("job", {}, 1000, () => false, {
          signal: controller.signal,
        });
        const assertion = expect(promise).rejects.toThrow(PollAbortError);

        await vi.advanceTimersByTimeAsync(0);
        controller.abort("cancelled mid-wait");
        await assertion;
        vi.useRealTimers();
      });

      it("rejects with PollMaxAttemptsError once the attempt cap is reached", async () => {
        vi.useFakeTimers();
        fetchMock.mockResolvedValue(makeResponse({ done: false }));

        const promise = request.poll("job", {}, 1000, () => false, { maxAttempts: 3 });
        const assertion = expect(promise).rejects.toThrow(PollMaxAttemptsError);
        await vi.runAllTimersAsync();
        await assertion;
        expect(fetchMock).toHaveBeenCalledTimes(3);
      });

      it("rejects with PollTimeoutError once maxDuration has elapsed", async () => {
        vi.useFakeTimers();
        fetchMock.mockResolvedValue(makeResponse({ done: false }));

        const promise = request.poll("job", {}, 1000, () => false, { maxDuration: 2500 });
        const assertion = expect(promise).rejects.toThrow(PollTimeoutError);
        await vi.runAllTimersAsync();
        await assertion;
        // Bound is checked after each attempt: fires once elapsed time crosses 2500ms.
        expect(fetchMock).toHaveBeenCalledTimes(4);
      });

      it("succeeds normally when bounds are supplied but the predicate is satisfied first", async () => {
        vi.useFakeTimers();
        let n = 0;
        fetchMock.mockImplementation(async () => makeResponse({ done: ++n >= 2 }));

        const promise = request.poll("job", {}, 1000, (r) => !!(r as { done: boolean }).done, {
          maxAttempts: 10,
          maxDuration: 60000,
        });
        await vi.runAllTimersAsync();
        const result = (await promise) as { done: boolean };
        expect(result.done).toBe(true);
        expect(fetchMock).toHaveBeenCalledTimes(2);
      });
    });
  });
});
