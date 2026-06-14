/**
 * request — Type Definitions
 */

import type { AnyObject } from "./store-types";

/**
 * Tracks an in-flight request keyed by `requestKey`.
 *
 * `sequence` is a process-monotonic counter (NOT a wall-clock timestamp): two
 * requests started in the same millisecond still receive distinct, ordered
 * sequence numbers, so `useMostRecentResponse` can always identify the truly
 * latest request.
 */
export interface ActiveRequest {
  requestPromise?: Promise<unknown>;
  abortController?: AbortController;
  sequence: number;
}

/** Options accepted by every `request` method (extends the native `fetch` init). */
export interface RequestCallOptions extends RequestInit {
  /** Identity for in-flight de-duplication; defaults to url + serialized params. */
  requestKey?: string;
  /** Wait for the previous same-key request to settle instead of aborting it. */
  waitOnPrevious?: boolean;
  /** When a newer same-key request exists, resolve to its (latest) response. */
  useMostRecentResponse?: boolean;
  /** Treat an abort as a normal `{ abort: true }` result instead of throwing. */
  ignoreAbort?: boolean;
  /** Query params; object values are JSON-serialized, all appended to the URL. */
  params?: AnyObject;
}

/** The `request` helper surface. */
export interface RequestApi {
  activeRequests: { [key: string]: ActiveRequest };
  url(url: string): string;
  call(url: string, options?: RequestCallOptions): Promise<unknown>;
  get(url: string, options?: RequestCallOptions): Promise<unknown>;
  post(url: string, data?: object, options?: RequestCallOptions): Promise<unknown>;
  poll(
    url: string,
    options?: RequestCallOptions,
    interval?: number,
    fnUntil?: (response: unknown) => boolean
  ): Promise<unknown>;
}
