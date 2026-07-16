/**
 * request — a thin `fetch` wrapper for JSON GET/POST APIs.
 *
 * Reads ambient config (baseUrl, headers, onUnauthorized, onAppVersionMismatch)
 * from the module-level `danxOptions` singleton — there is no per-call factory
 * and no per-call baseUrl/headers threading.
 *
 * In-flight requests are tracked per `requestKey` to support two concurrency
 * strategies:
 * - abort-previous (default): a newer request aborts the older one.
 * - wait-on-previous + use-most-recent: serialize same-key requests and resolve
 *   every caller to the freshest response.
 *
 * Ordering uses a process-monotonic `sequence` counter, NOT `Date.now()`, so two
 * requests started in the same millisecond never tie (fixes the stale-wins bug).
 *
 * @example
 *   setDanxOptions({ request: { baseUrl: "/api" } });
 *   const user = await request.get("users/1");
 *   const saved = await request.post("users/1", { name: "Ada" });
 */

import { danxOptions } from "./config";
import { sleep } from "./sleep";
import type { ActiveRequest, RequestApi, RequestCallOptions } from "./request-types";

/** Thrown by `request.poll` when its `signal` aborts before the predicate is satisfied. */
export class PollAbortError extends Error {
  constructor(reason?: unknown) {
    super(reason ? `Polling was aborted: ${String(reason)}` : "Polling was aborted");
    this.name = "PollAbortError";
  }
}

/** Thrown by `request.poll` when `maxAttempts` is reached before the predicate is satisfied. */
export class PollMaxAttemptsError extends Error {
  constructor(public readonly maxAttempts: number) {
    super(`Polling exceeded maxAttempts (${maxAttempts})`);
    this.name = "PollMaxAttemptsError";
  }
}

/** Thrown by `request.poll` when `maxDuration` elapses before the predicate is satisfied. */
export class PollTimeoutError extends Error {
  constructor(public readonly maxDuration: number) {
    super(`Polling exceeded maxDuration (${maxDuration}ms)`);
    this.name = "PollTimeoutError";
  }
}

/** Delay that rejects with `PollAbortError` immediately if `signal` fires, instead of waiting it out. */
function abortableSleep(delay: number, signal?: AbortSignal): Promise<void> {
  if (!signal) {
    return sleep(delay);
  }
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new PollAbortError(signal.reason));
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(new PollAbortError(signal.reason));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, delay);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

/**
 * Process-monotonic request counter. Guarantees strict ordering of same-key
 * requests independent of the wall clock.
 */
let requestSequence = 0;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export const request: RequestApi = {
  activeRequests: {},

  url(url) {
    if (url.startsWith("http")) {
      return url;
    }
    return (danxOptions.value.request?.baseUrl || "").replace(/\/$/, "") + "/" + url;
  },

  async call(url, options) {
    options = options || {};
    const requestKey = options.requestKey || url + JSON.stringify(options.params || "");
    const waitOnPrevious = !!options.waitOnPrevious;
    const useMostRecentResponse = !!options.useMostRecentResponse;
    const shouldAbortPrevious = !waitOnPrevious;
    const sequence = ++requestSequence;

    // If there was a request with the same key still active, track it.
    const previousRequest = request.activeRequests[requestKey];

    // Register this request as the current active one for the key.
    const currentRequest: ActiveRequest = { sequence };
    request.activeRequests[requestKey] = currentRequest;

    if (shouldAbortPrevious) {
      if (previousRequest) {
        previousRequest.abortController?.abort(
          "Request was aborted due to a newer request being made"
        );
      }
      const abortController = new AbortController();
      currentRequest.abortController = abortController;
      const consumerSignal = options.signal;
      options.signal = consumerSignal
        ? AbortSignal.any([consumerSignal, abortController.signal])
        : abortController.signal;
    }

    // Append query params (object values serialized) to the URL.
    if (options.params) {
      const search = new URLSearchParams();
      for (const [key, value] of Object.entries(options.params)) {
        search.set(key, isObject(value) ? JSON.stringify(value) : String(value));
      }
      const queryString = search.toString();
      if (queryString) {
        url += (url.includes("?") ? "&" : "?") + queryString;
      }
      delete options.params;
    }

    let resolvePromise!: (value: unknown) => void;
    let rejectPromise!: (reason?: unknown) => void;
    currentRequest.requestPromise = new Promise((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });
    // Mark the internal promise as handled so a failure with no `waitOnPrevious`
    // waiter does not surface as an unhandled rejection. Real waiters attach
    // their own handlers and still observe the rejection independently.
    currentRequest.requestPromise.catch(() => {});

    // Serialize behind the previous same-key request when requested.
    if (waitOnPrevious && previousRequest?.requestPromise) {
      try {
        await previousRequest.requestPromise;
      } catch {
        // We only need it to settle; its outcome is irrelevant here.
      }
    }

    try {
      let response: Response;
      try {
        response = await fetch(request.url(url), options);
      } catch (e) {
        if (options.ignoreAbort && String(e).match(/Request was aborted/)) {
          const abortResponse = { abort: true };
          resolvePromise(abortResponse);
          return abortResponse;
        }
        rejectPromise(e);
        throw e;
      }

      checkAppVersion(response);

      // Another same-key request may have started after this one.
      let mostRecentRequest = request.activeRequests[requestKey]!;

      let responseJson: unknown = await response.json();

      // Resolve our own promise so any request waiting on us can proceed.
      resolvePromise(responseJson);

      // If we are no longer the most recent request for this key...
      if (mostRecentRequest.sequence !== sequence) {
        if (shouldAbortPrevious) {
          // We were superseded but finished too late to be aborted in time.
          responseJson = { abort: true };
        } else if (useMostRecentResponse) {
          // Resolve forward to the freshest response, re-checking each iteration
          // in case still-newer requests start while we await.
          do {
            mostRecentRequest = request.activeRequests[requestKey]!;
            responseJson = await mostRecentRequest.requestPromise;
            // Check if the entry still exists (it may be deleted by a completed request's finally).
            // If deleted, the superseding request is done and we've gotten its response.
            if (
              !request.activeRequests[requestKey] ||
              request.activeRequests[requestKey]!.sequence === mostRecentRequest.sequence
            ) {
              break;
            }
          } while (
            request.activeRequests[requestKey] &&
            mostRecentRequest.sequence !== request.activeRequests[requestKey]!.sequence
          );
        }
      }

      if (response.status === 401) {
        const onUnauthorized = danxOptions.value.request?.onUnauthorized;
        return onUnauthorized
          ? onUnauthorized(responseJson, response)
          : {
              error: true,
              message: "Unauthorized",
              ...(isObject(responseJson) ? responseJson : {}),
            };
      }

      if (response.status > 400 && isObject(responseJson)) {
        if (responseJson.exception && !responseJson.error) {
          responseJson.error = true;
        }
      }

      return responseJson;
    } finally {
      // Clean up the active request entry only if we are still the current one.
      // Do not delete a newer superseding request's entry.
      if (request.activeRequests[requestKey]?.sequence === sequence) {
        delete request.activeRequests[requestKey];
      }
    }
  },

  async poll(url, options, interval, fnUntil, pollOptions) {
    const until = fnUntil || ((response: unknown) => !!response);
    const { signal, maxAttempts, maxDuration } = pollOptions || {};
    const startedAt = Date.now();
    let attempts = 0;
    let response: unknown;

    // DXUI-172: bound polling by signal/maxAttempts/maxDuration so a buggy or
    // unsatisfiable fnUntil predicate can't loop forever.
    while (true) {
      if (signal?.aborted) {
        throw new PollAbortError(signal.reason);
      }

      response = await request.call(url, options);
      attempts++;

      if (until(response)) {
        return response;
      }
      if (maxAttempts !== undefined && attempts >= maxAttempts) {
        throw new PollMaxAttemptsError(maxAttempts);
      }
      if (maxDuration !== undefined && Date.now() - startedAt >= maxDuration) {
        throw new PollTimeoutError(maxDuration);
      }

      await abortableSleep(interval || 1000, signal);
    }
  },

  async get(url, options) {
    return request.call(url, {
      method: "get",
      ...options,
      headers: jsonHeaders(options),
    });
  },

  async post(url, data, options) {
    return request.call(url, {
      method: "post",
      body: data && JSON.stringify(data),
      ...options,
      headers: jsonHeaders(options),
    });
  },
};

/** Default JSON headers merged with configured + per-call headers. */
function jsonHeaders(options?: RequestCallOptions): Record<string, string> {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...danxOptions.value.request?.headers,
    ...(options?.headers as Record<string, string> | undefined),
  };
}

/**
 * Compares the client's and server's `X-App-Version` headers and invokes the
 * configured `onAppVersionMismatch` handler when they differ.
 */
function checkAppVersion(response: Response): void {
  const requestOptions = danxOptions.value.request;
  if (!requestOptions || !requestOptions.headers || !requestOptions.onAppVersionMismatch) {
    return;
  }

  const clientAppVersion = requestOptions.headers["X-App-Version"] || "";
  const serverAppVersion = response.headers.get("X-App-Version");
  if (clientAppVersion && clientAppVersion !== serverAppVersion) {
    requestOptions.onAppVersionMismatch(serverAppVersion);
  }
}
