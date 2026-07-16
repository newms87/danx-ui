import type { Component } from "vue";
import type { IconName } from "../icon/icons";

/**
 * DanxAvatar Type Definitions
 */

/**
 * Avatar sizes.
 * Affects width, height, and font size.
 */
export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Avatar shape.
 */
export type AvatarShape = "circle" | "square";

export interface DanxAvatarProps {
  /**
   * Image URL. When provided and loads successfully, renders an <img>.
   * When omitted, or the image fails to load, falls back to initials
   * (derived from `name`) on a deterministic autoColor background.
   */
  src?: string;

  /**
   * Name used to derive initials for the fallback, and as the deterministic
   * autoColor hash key. Also used as the default `alt` text for the image.
   */
  name?: string;

  /**
   * Avatar size, either a size token or a numeric pixel value.
   * @default "md"
   */
  size?: AvatarSize | number;

  /**
   * Avatar shape.
   * @default "circle"
   */
  shape?: AvatarShape;

  /**
   * Icon fallback shown instead of initials when there is no `name`
   * (and no `src`, or the image failed to load). Accepts a built-in icon
   * name, a raw SVG string, or a Vue component.
   */
  icon?: Component | IconName | string;

  /**
   * Override the `alt` attribute of the rendered image.
   * Defaults to `name` when omitted.
   */
  alt?: string;
}

export interface DanxAvatarSlots {
  /** Override the fallback rendering entirely (replaces initials/icon) */
  fallback?(): unknown;
}
