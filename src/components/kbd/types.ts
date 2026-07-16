/**
 * DanxKbd Type Definitions
 */

/**
 * Which platform's key symbols/labels to render.
 * "mac" uses symbolic glyphs (⌘ ⌥ ⇧ ^), "other" uses word labels (Ctrl, Alt, Shift, Win).
 */
export type DanxKbdOs = "mac" | "other";

export interface DanxKbdProps {
  /**
   * One or more key names to render as key-cap badges, e.g. `['ctrl', 'k']`.
   * Recognized modifier names (`ctrl`, `alt`, `shift`, `meta`/`cmd`) are mapped to
   * platform-specific labels; any other string is rendered as-is (uppercased).
   */
  keys: string[];

  /**
   * Overrides OS auto-detection. When omitted, the platform is auto-detected from
   * `navigator.platform` / `navigator.userAgent`.
   */
  os?: DanxKbdOs;

  /**
   * Separator rendered between each key-cap for a combo (e.g. `ctrl` + `k`).
   * @default "+"
   */
  separator?: string;
}
