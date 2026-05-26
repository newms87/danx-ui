/**
 * request - Typed HTTP helper built on the Fetch API
 *
 * Provides JSON GET/POST with:
 * - Request deduplication via abort (newer request cancels older)
 * - waitOnPrevious mode: serialises requests behind the same key
 * - useMostRecentResponse mode: waits for the latest in-flight request
 * - App-version mismatch detection via response headers
 *
 * Configure once at app startup with `configureRequest()` from requestConfig.ts.
 *
 * ### Bug fix: monotonic sequence replaces Date.now() for useMostRecentResponse
 * The original implementation used `Date.now()` as the ordering key.  Two
 * requests starting in the same millisecond both got the same timestamp; the
 * comparison `mostRecentRequest.timestamp !== timestamp` evaluated `false` for
 * both, so neither yielded to the other — the stale one could silently win.
 *
 * Fix: a module-level monotonic integer `_requestSequence` is incremented for
 * every call, giving each request a unique total order independent of wall-clock
 * granularity.
 */

import type { Ref } from "vue";
import { requestConfig } from "./requestConfig";

/** Monotonic counter that replaces Date.now() for useMostRecentResponse ordering. */
let _requestSequence = 0;

export interface ActiveRequest {
  /** Unique sequence number for this request — strictly increasing, no ties. */
  sequence: number;
  abortController?: AbortController;
  requestPromise?: Promise<unknown>;
}

export interface RequestCallOptions extends RequestInit {
  /** Merge with URL as query params */
  params?: Record<string, unknown>;
  /** Key used to identify concurrent calls for abort/wait/mostRecent logic */
  requestKey?: string;
  /** If true, wait for the previous same-key request to finish before sending */
  waitOnPrevious?: boolean;
  /** If true and a newer same-key request exists, await that request's response instead */
  useMostRecentResponse?: boolean;
  /** If true, don't throw on abort errors */
  ignoreAbort?: boolean;
}

export interface RequestApi {
  activeRequests: Record<string, ActiveRequest>;
  url(url: string): string;
  call(url: string, options?: RequestCallOptions): Promise<unknown>;
  poll(
    url: string,
    options: RequestCallOptions,
    interval: number,
    fnUntil?: (response: unknown) => boolean
  ): Promise<unknown>;
  get(url: string, options?: RequestCallOptions): Promise<unknown>;
  post(url: string, data?: unknown, options?: RequestCallOptions): Promise<unknown>;
}

export const request: RequestApi = {
  activeRequests: {},

  url(url: string): string {
    if (url.startsWith("http")) {
      return url;
    }
    return (requestConfig.value.baseUrl || "").replace(/\/$/, "") + "/" + url;
  },

  async call(url: string, options?: RequestCallOptions): Promise<unknown> {
    options = options || {};
    const requestKey = options?.requestKey || url + JSON.stringify(options.params || "");
    const waitOnPrevious = !!options?.waitOnPrevious;
    const useMostRecentResponse = !!options?.useMostRecentResponse;
    const shouldAbortPrevious = !waitOnPrevious;

    // BUG FIX: monotonic sequence instead of Date.now() — two requests that
    // start in the same millisecond would both get the same timestamp, making
    // the "is this the most recent?" check incorrect.
    const sequence = ++_requestSequence;

    const previousRequest = request.activeRequests[requestKey];
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
      options.signal = abortController.signal;
    }

    if (options.params) {
      for (const [key, value] of Object.entries(options.params)) {
        if (typeof value === "object" && value !== null) {
          options.params[key] = JSON.stringify(value);
        }
      }
      url +=
        (url.match(/\?/) ? "&" : "?") +
        new URLSearchParams(options.params as Record<string, string>).toString();
      delete options.params;
    }

    let resolvePromise!: (value: unknown) => void;
    let rejectPromise!: (reason?: unknown) => void;
    currentRequest.requestPromise = new Promise((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });
    // The requestPromise is internal coordination state for waitOnPrevious /
    // useMostRecentResponse. Consumers receive errors via the value returned
    // from call() (which rethrows). Attach a passive handler so a rejection
    // with no coordinating waiter never surfaces as an unhandled rejection.
    currentRequest.requestPromise.catch(() => {});

    if (waitOnPrevious && previousRequest?.requestPromise) {
      try {
        await previousRequest.requestPromise;
      } catch {
        // Don't care if it fails — just need to wait for it to finish
      }
    }

    let response: Response;
    try {
      response = await fetch(request.url(url), options as RequestInit);
    } catch (e) {
      if (options.ignoreAbort && (e + "").match(/Request was aborted/)) {
        const abortResponse = { abort: true };
        resolvePromise(abortResponse);
        return abortResponse;
      }
      rejectPromise(e);
      throw e;
    }

    checkAppVersion(response);

    let mostRecentRequest = request.activeRequests[requestKey];
    let responseJson = await response.json();

    resolvePromise(responseJson);

    if (mostRecentRequest.sequence !== sequence) {
      if (shouldAbortPrevious) {
        responseJson = { abort: true };
      } else if (useMostRecentResponse) {
        do {
          mostRecentRequest = request.activeRequests[requestKey];
          responseJson = await mostRecentRequest.requestPromise;

          if (request.activeRequests[requestKey].sequence === mostRecentRequest.sequence) {
            break;
          }
        } while (mostRecentRequest.sequence !== request.activeRequests[requestKey].sequence);
      }
    }

    if (response.status === 401) {
      const onUnauthorized = requestConfig.value.onUnauthorized;
      return onUnauthorized
        ? onUnauthorized(responseJson, response)
        : { error: true, message: "Unauthorized", ...(responseJson as object) };
    }

    if (response.status > 400) {
      if (
        (responseJson as Record<string, unknown>).exception &&
        !(responseJson as Record<string, unknown>).error
      ) {
        (responseJson as Record<string, unknown>).error = true;
      }
    }

    return responseJson;
  },

  async poll(
    url: string,
    options: RequestCallOptions,
    interval: number,
    fnUntil?: (response: unknown) => boolean
  ): Promise<unknown> {
    let response: unknown;
    if (!fnUntil) {
      fnUntil = (r: unknown) => !!r;
    }
    do {
      response = await request.call(url, options);
      await sleep(interval || 1000);
    } while (!fnUntil(response));
    return response;
  },

  async get(url: string, options?: RequestCallOptions): Promise<unknown> {
    return request.call(url, {
      method: "get",
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(requestConfig.value.headers || {}),
        ...(options?.headers as Record<string, string> | undefined),
      },
    });
  },

  async post(url: string, data?: unknown, options?: RequestCallOptions): Promise<unknown> {
    return request.call(url, {
      method: "post",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(requestConfig.value.headers || {}),
        ...(options?.headers as Record<string, string> | undefined),
      },
    });
  },
};

function checkAppVersion(response: Response): void {
  const cfg = requestConfig.value;
  if (!cfg.headers || !cfg.onAppVersionMismatch) return;

  const clientVersion = cfg.headers["X-App-Version"] || "";
  const serverVersion = response.headers.get("X-App-Version");
  if (clientVersion && clientVersion !== serverVersion) {
    cfg.onAppVersionMismatch(serverVersion);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch a resource list while ensuring the currently-selected item is always
 * present, even if the applied filter would exclude it.
 */
export async function fetchResourceListWithSelected<T extends { id: string }>(
  fetchFn: (filter: object) => Promise<T[]>,
  list: Ref<T[]>,
  id: string,
  filter: object
): Promise<void> {
  let selectedResource: T | undefined;
  if (id) {
    selectedResource = list.value.find((c) => c.id === id) || (await fetchFn({ id }))[0];
  }

  list.value = await fetchFn(filter);

  if (selectedResource && !list.value.find((c) => c.id === id)) {
    list.value.push(selectedResource);
  }
}

/** Return the value of a URL query parameter. */
export function getUrlParam(key: string, url?: string): string | null {
  const params = new URLSearchParams(
    url?.replace(/.*\?/, "") || (typeof window !== "undefined" ? window.location.search : "")
  );
  return params.get(key);
}
