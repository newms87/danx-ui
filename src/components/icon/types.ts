import type { Component } from "vue";
import type { IconName } from "./icons";

/**
 * DanxIcon Type Definitions
 */

export interface DanxIconProps {
  /**
   * Icon to display. Accepts:
   * - A built-in icon name (e.g. "confirm", "trash", "edit")
   * - A raw SVG string (rendered via innerHTML, preserving currentColor)
   * - A Vue component (renders via <component :is>)
   *
   * Trust boundary: a string that does not match a built-in icon name is
   * treated as untrusted markup and passed through `sanitizeSvg` (see
   * `src/shared/sanitizeSvg.ts`) before being rendered via `innerHTML`. It is
   * NOT run through `escapeHtml` — that entity-escapes all markup, which
   * would break legitimate SVG rendering. `sanitizeSvg` instead structurally
   * validates a single `<svg>` root and strips known-dangerous content
   * (`<script>`/`<style>`/`<foreignObject>`, `on*` attributes,
   * `javascript:`/`data:` URIs). A string that fails validation renders
   * nothing rather than being injected raw.
   */
  icon: Component | IconName | string;
}
