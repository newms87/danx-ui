/**
 * useBreakpoints - Reactive responsive breakpoint helpers
 *
 * Thin wrapper around VueUse's useBreakpoints/useMediaQuery, pre-configured
 * with danx-ui's Tailwind v4 breakpoint tokens (sm/md/lg/xl). Consumers get
 * reactive booleans like `smAndDown`/`mdAndUp` without duplicating the
 * breakpoint values by hand.
 *
 * Requires `@vueuse/core` as a peer dependency.
 *
 * Safe under SSR / matchMedia-unavailable environments: VueUse's
 * useMediaQuery/useBreakpoints return `false`/non-matching computed refs
 * instead of throwing when `window.matchMedia` is unavailable.
 */
import { useBreakpoints as useVueUseBreakpoints, useMediaQuery } from "@vueuse/core";

// DXUI-153: Tailwind v4 default breakpoint tokens (sm/md/lg/xl) - no custom
// --breakpoint-* overrides exist in src/shared/tokens, so these mirror
// Tailwind's shipped defaults to stay in sync with the utility classes.
export const DANX_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export type DanxBreakpointKey = keyof typeof DANX_BREAKPOINTS;

export interface UseBreakpointsReturn {
  /** True when viewport width < md (mobile-first "sm and down") */
  smAndDown: import("vue").ComputedRef<boolean>;
  /** True when viewport width >= sm */
  smAndUp: import("vue").ComputedRef<boolean>;
  /** True when viewport width < lg */
  mdAndDown: import("vue").ComputedRef<boolean>;
  /** True when viewport width >= md */
  mdAndUp: import("vue").ComputedRef<boolean>;
  /** True when viewport width < xl */
  lgAndDown: import("vue").ComputedRef<boolean>;
  /** True when viewport width >= lg */
  lgAndUp: import("vue").ComputedRef<boolean>;
  /** True when viewport width >= xl */
  xlAndUp: import("vue").ComputedRef<boolean>;
  /** Reactive list of breakpoint keys the current viewport width satisfies */
  current: () => import("vue").ComputedRef<DanxBreakpointKey[]>;
  /** Reactive name of the largest matched breakpoint, or "" if none match */
  active: () => import("vue").ComputedRef<DanxBreakpointKey | "">;
}

/**
 * Reactive breakpoint booleans pre-configured with danx-ui's sm/md/lg/xl tokens.
 */
export function useBreakpoints(): UseBreakpointsReturn {
  const breakpoints = useVueUseBreakpoints(DANX_BREAKPOINTS);

  return {
    smAndDown: breakpoints.smaller("md"),
    smAndUp: breakpoints.greaterOrEqual("sm"),
    mdAndDown: breakpoints.smaller("lg"),
    mdAndUp: breakpoints.greaterOrEqual("md"),
    lgAndDown: breakpoints.smaller("xl"),
    lgAndUp: breakpoints.greaterOrEqual("lg"),
    xlAndUp: breakpoints.greaterOrEqual("xl"),
    current: breakpoints.current,
    active: breakpoints.active,
  };
}

export { useMediaQuery };
