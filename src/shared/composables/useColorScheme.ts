/**
 * useColorScheme - Reactive dark-mode activation for danx-ui's theme tokens
 *
 * `src/shared/tokens` ships a full dark theme (semantic-dark.css) that is
 * activated purely by a `.dark` class on `<html>`. This composable is the
 * thin wrapper VueUse's useDark/usePreferredDark, pre-configured for that
 * selector, that consumers can use instead of hand-rolling
 * prefers-color-scheme detection + localStorage persistence + class
 * toggling themselves.
 *
 * Requires `@vueuse/core` as a peer dependency.
 *
 * Not exported from `src/shared/index.ts` / the main barrel - see the
 * `./color-scheme` package.json exports subpath, matching the
 * `./breakpoints` pattern (DXUI-165, plan-architecture gate on DXUI-35).
 */
import { useDark, usePreferredDark } from "@vueuse/core";
import { computed, ref, watch, type ComputedRef, type Ref } from "vue";

export type ColorSchemeMode = "light" | "dark" | "auto";

export interface UseColorSchemeOptions {
  /** localStorage key the selected mode is persisted under. @default "danx-color-scheme" */
  storageKey?: string;
}

export interface UseColorSchemeReturn {
  /** Reactive - true when the resolved scheme is dark (accounts for 'auto') */
  isDark: ComputedRef<boolean>;
  /** Reactive selected mode: 'light' | 'dark' | 'auto' */
  mode: Ref<ColorSchemeMode>;
  /** Cycles: light -> dark -> light (never lands on 'auto') */
  toggle: () => void;
}

const DEFAULT_STORAGE_KEY = "danx-color-scheme";

function readStoredMode(storageKey: string): ColorSchemeMode | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  const stored = window.localStorage.getItem(storageKey);
  return stored === "light" || stored === "dark" || stored === "auto" ? stored : null;
}

/**
 * Reactive light/dark/auto color scheme, persisted to localStorage and
 * applied to `document.documentElement` as danx-ui's `.dark` class.
 */
export function useColorScheme(options: UseColorSchemeOptions = {}): UseColorSchemeReturn {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
  const hasDom = typeof document !== "undefined";

  const mode = ref<ColorSchemeMode>(readStoredMode(storageKey) ?? "auto");

  // No `window`/`document` in SSR: skip usePreferredDark/useDark entirely
  // rather than trust their internal guards - 'auto' just resolves to false.
  const preferredDark = hasDom ? usePreferredDark() : computed(() => false);

  // storageKey: null disables useDark's own persistence - mode above owns it,
  // since useDark only tracks a boolean and can't represent 'auto'.
  const isDarkClass = hasDom
    ? useDark({
        storageKey: null,
        selector: "html",
        valueDark: "dark",
        valueLight: "",
      })
    : ref(false);

  const isDark = computed(() =>
    mode.value === "auto" ? preferredDark.value : mode.value === "dark"
  );

  watch(
    isDark,
    (value) => {
      isDarkClass.value = value;
    },
    { immediate: true }
  );

  watch(mode, (value) => {
    if (hasDom && window.localStorage) {
      window.localStorage.setItem(storageKey, value);
    }
  });

  function toggle() {
    mode.value = isDark.value ? "light" : "dark";
  }

  return { isDark, mode, toggle };
}
