import type { Component } from "vue";
import type { IconName } from "../icon/icons";

/**
 * DanxEmptyState Type Definitions
 */

/**
 * Empty state size.
 * Affects icon size and overall spacing.
 */
export type EmptyStateSize = "sm" | "md" | "lg";

export interface DanxEmptyStateProps {
  /**
   * Icon shown above the title. Accepts a built-in icon name, a raw SVG
   * string, or a Vue component, rendered via `DanxIcon`. Ignored when the
   * `illustration` slot is populated.
   */
  icon?: Component | IconName | string;

  /**
   * Empty state size, controlling icon size and spacing via the CSS
   * component token system.
   * @default "md"
   */
  size?: EmptyStateSize;

  /**
   * Heading text.
   */
  title: string;

  /**
   * Supporting copy shown below the title.
   */
  description?: string;
}

export interface DanxEmptyStateSlots {
  /** Custom illustration (SVG/image), replacing the `icon` prop entirely */
  illustration?(): unknown;
  /** Action buttons (e.g. DanxButton) shown below the description */
  actions?(): unknown;
}
