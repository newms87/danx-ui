/**
 * requestConfig - Global configuration for the danx-ui request helper
 *
 * Consumers call `configureRequest()` once at app startup to set the base URL,
 * default headers, and lifecycle callbacks. All request helpers read from the
 * reactive `requestConfig` ref so changes take effect immediately without
 * re-importing.
 *
 * @example
 *   import { configureRequest } from "@thehammer/danx-ui";
 *   configureRequest({
 *     baseUrl: "https://api.example.com",
 *     headers: { "X-App-Version": "1.2.3" },
 *     onUnauthorized: (json, raw) => router.push("/login"),
 *   });
 */

import { shallowRef } from "vue";

export interface RequestConfig {
  /** Prepended to relative URLs. Trailing slash is stripped automatically. */
  baseUrl?: string;
  /** Default headers merged into every request (lower priority than per-call headers). */
  headers?: Record<string, string>;
  /**
   * Called when the server responds with HTTP 401.
   * The return value is forwarded as the resolved response.
   */
  onUnauthorized?: (responseJson: unknown, rawResponse: Response) => unknown;
  /**
   * Called when the server's `X-App-Version` header differs from the
   * client's `headers["X-App-Version"]`. Useful for prompting a reload.
   */
  onAppVersionMismatch?: (serverVersion: string | null) => void;
}

const requestConfig = shallowRef<RequestConfig>({
  baseUrl: "",
  headers: {},
});

export function configureRequest(config: RequestConfig): void {
  requestConfig.value = { ...requestConfig.value, ...config };
}

export { requestConfig };
