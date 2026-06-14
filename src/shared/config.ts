/**
 * Danx Options — Module-Level Configuration Singleton
 *
 * The reactive data layer (request, FlashMessages) has no per-call config
 * threading. Instead, a single module-level `shallowRef` holds the ambient
 * options. Consumers call `setDanxOptions()` once at app init; `request` and
 * `FlashMessages` read `danxOptions.value` directly.
 *
 * This is the single source of truth for ambient request config — there is no
 * second config path and no per-call factory.
 *
 * @example
 *   import { setDanxOptions } from "@thehammer/danx-ui";
 *
 *   setDanxOptions({
 *     request: {
 *       baseUrl: "https://api.example.com",
 *       headers: { Authorization: `Bearer ${token}` },
 *       onUnauthorized: () => router.push("/login"),
 *     },
 *   });
 */

import { shallowRef } from "vue";
import type { DanxOptions } from "./config-types";

/**
 * The live configuration ref. Internal modules import this directly;
 * consumers should mutate it only via `setDanxOptions()`.
 */
export const danxOptions = shallowRef<DanxOptions>({
  request: {
    baseUrl: "",
    headers: {},
  },
  flashMessages: {},
});

/**
 * Merge partial options into the singleton. Nested `request` and
 * `flashMessages` objects are shallow-merged so a partial update does not
 * drop previously-set sibling keys.
 */
export function setDanxOptions(options: DanxOptions): void {
  danxOptions.value = {
    ...danxOptions.value,
    ...options,
    request: {
      ...danxOptions.value.request,
      ...options.request,
    },
    flashMessages: {
      ...danxOptions.value.flashMessages,
      ...options.flashMessages,
    },
  };
}

/** Read the current ambient options. */
export function getDanxOptions(): DanxOptions {
  return danxOptions.value;
}
