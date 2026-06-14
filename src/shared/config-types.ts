/**
 * Danx Options — Configuration Type Definitions
 *
 * The reactive data layer reads its ambient configuration from a single
 * module-level singleton (see `config.ts`). These types describe the shape
 * consumers pass to `setDanxOptions()`. This mirrors quasar-ui-danx's
 * `danxOptions` shape so migrating consumers keep the same init call.
 */

import type { ToastOptions } from "../components/toast/types";

/** Ambient HTTP configuration consumed by the `request` helper. */
export interface DanxRequestOptions {
  /** Base URL prepended to relative request paths (trailing slash trimmed). */
  baseUrl?: string;
  /** Default headers merged into every request. */
  headers?: Record<string, string>;
  /** Handler invoked when a response returns HTTP 401. */
  onUnauthorized?: (result: unknown, response: Response) => unknown;
  /** Handler invoked when the server's `X-App-Version` differs from the client's. */
  onAppVersionMismatch?: (serverVersion: string | null) => void;
}

/** Default toast options applied by `FlashMessages`, per severity. */
export interface DanxFlashMessageOptions {
  default?: Partial<ToastOptions>;
  success?: Partial<ToastOptions>;
  info?: Partial<ToastOptions>;
  warning?: Partial<ToastOptions>;
  error?: Partial<ToastOptions>;
}

/** Ambient configuration for the danx-ui reactive data layer. */
export interface DanxOptions {
  /** HTTP request configuration. */
  request?: DanxRequestOptions;
  /** Default flash-message (toast) options per severity. */
  flashMessages?: DanxFlashMessageOptions;
}
