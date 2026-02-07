/**
 * Button Component Module
 *
 * Exports:
 * - DanxButton: The button component
 * - Types: TypeScript interfaces
 * - Icons: Individual SVG icon constants
 */

export { default as DanxButton } from "./DanxButton.vue";
export * from "./icons";
export type {
  ButtonSize,
  ButtonType,
  DanxButtonEmits,
  DanxButtonProps,
  DanxButtonSlots,
} from "./types";
export type { IconName } from "./icons";
