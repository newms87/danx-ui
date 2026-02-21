/**
 * useVariant - Maps variant names to component CSS tokens via inline styles
 *
 * CSS cannot do dynamic variable name resolution (e.g. `var(--dx-variant-${name}-bg)`).
 * This composable bridges the gap: when a variant is set, it returns inline styles
 * that map component-internal tokens to the shared variant token namespace.
 *
 * Fallback chain per token:
 *   var(--dx-variant-{component}-{variant}-{token}, var(--dx-variant-{variant}-{token}))
 *
 * This means:
 * - Shared variant tokens (--dx-variant-danger-bg) work everywhere automatically
 * - Component-specific overrides are possible (--dx-variant-button-danger-bg)
 * - Unset tokens fall through to the component's base CSS defaults
 *
 * @param variant - The variant name (reactive string). Empty string = no variant styles.
 * @param component - Component identifier for component-specific token overrides (e.g. "button", "chip").
 * @param tokenMap - Maps component token names to variant token suffixes.
 *   Key: the CSS property to set (e.g. "--dx-button-bg")
 *   Value: the variant token suffix (e.g. "bg" resolves to --dx-variant-{variant}-bg)
 *
 * @returns Computed CSSProperties object. Empty when variant is blank.
 *
 * @example
 *   const variantStyle = useVariant(
 *     computed(() => props.variant),
 *     "button",
 *     {
 *       "--dx-button-bg": "bg",
 *       "--dx-button-hover-bg": "bg-hover",
 *       "--dx-button-text": "text",
 *     }
 *   );
 *   // When variant="danger", returns:
 *   // {
 *   //   "--dx-button-bg": "var(--dx-variant-button-danger-bg, var(--dx-variant-danger-bg))",
 *   //   "--dx-button-hover-bg": "var(--dx-variant-button-danger-bg-hover, var(--dx-variant-danger-bg-hover))",
 *   //   "--dx-button-text": "var(--dx-variant-button-danger-text, var(--dx-variant-danger-text))",
 *   // }
 */

import { computed, type CSSProperties, type MaybeRefOrGetter, toValue } from "vue";

export type VariantTokenMap = Record<string, string>;

export function useVariant(
  variant: MaybeRefOrGetter<string>,
  component: string,
  tokenMap: VariantTokenMap
) {
  return computed<CSSProperties>(() => {
    const v = toValue(variant);
    if (!v) return {} as CSSProperties;

    const styles: Record<string, string> = {};
    for (const [componentToken, suffix] of Object.entries(tokenMap)) {
      styles[componentToken] =
        `var(--dx-variant-${component}-${v}-${suffix}, var(--dx-variant-${v}-${suffix}))`;
    }
    return styles as CSSProperties;
  });
}
