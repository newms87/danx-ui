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
   */
  icon: Component | IconName | string;
}
