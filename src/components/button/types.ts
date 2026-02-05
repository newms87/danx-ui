import type { Component } from "vue";

/**
 * DanxButton Type Definitions
 */

/**
 * Semantic button types that determine both icon and color.
 *
 * Categories:
 * - Destructive (danger): trash, stop, close
 * - Constructive (success): save, create, confirm, check
 * - Warning: pause, clock
 * - Informational (interactive): view, document, users, database, folder
 * - Neutral (muted): cancel, back, edit, copy, refresh, export, import, minus, merge, restart, play
 */
export type ButtonType =
  // Destructive (danger)
  | "trash"
  | "stop"
  | "close"
  // Constructive (success)
  | "save"
  | "create"
  | "confirm"
  | "check"
  // Warning
  | "pause"
  | "clock"
  // Informational (interactive)
  | "view"
  | "document"
  | "users"
  | "database"
  | "folder"
  // Neutral (muted)
  | "cancel"
  | "back"
  | "edit"
  | "copy"
  | "refresh"
  | "export"
  | "import"
  | "minus"
  | "merge"
  | "restart"
  | "play";

/**
 * Button sizes.
 * Affects padding, icon size, font size, and gap.
 */
export type ButtonSize = "xxs" | "xs" | "sm" | "md" | "lg";

export interface DanxButtonProps {
  /**
   * Semantic button type that determines icon and color.
   * Each type has a default icon and color based on its semantic category.
   */
  type: ButtonType;

  /**
   * Button size affecting padding, icon size, and font size.
   * @default "md"
   */
  size?: ButtonSize;

  /**
   * Custom icon component to override the type's default icon.
   * The component receives no props and should render an SVG.
   */
  icon?: Component;

  /**
   * Disables the button, preventing clicks and styling as disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * Shows a loading spinner and prevents clicks.
   * @default false
   */
  loading?: boolean;

  /**
   * Tooltip text shown on hover (native title attribute).
   */
  tooltip?: string;
}

export interface DanxButtonEmits {
  /** Emitted when button is clicked (not emitted when disabled or loading) */
  (e: "click", event: MouseEvent): void;
}

export interface DanxButtonSlots {
  /** Override the icon rendering entirely */
  icon(): unknown;

  /** Button text content */
  default(): unknown;
}
