/**
 * useElementResize - Thin wrapper around VueUse's useResizeObserver
 *
 * Requires `@vueuse/core` as a peer dependency. Callers that must stay
 * peer-free (e.g. modules shipped from the main barrel) should only reach
 * this module through a dynamic `import()`, matching the technique
 * established by scrollInfiniteSetup.ts.
 *
 * @param target - Element ref (or array of refs) to observe
 * @param callback - Invoked on every resize with the observer entries
 * @param options - Passed through to ResizeObserver.observe()
 * @returns { stop, isSupported } from VueUse's useResizeObserver
 */
import { useResizeObserver } from "@vueuse/core";
import type { MaybeComputedElementRef, UseResizeObserverOptions } from "@vueuse/core";

export function useElementResize(
  target: MaybeComputedElementRef | MaybeComputedElementRef[],
  callback: ResizeObserverCallback,
  options?: UseResizeObserverOptions
) {
  return useResizeObserver(target, callback, options);
}
