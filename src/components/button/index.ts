/**
 * Button Component Module
 *
 * Exports:
 * - DanxButton: The button component
 * - Types: TypeScript interfaces
 * - Icons: SVG icon map for button types
 */

export { default as DanxButton } from "./DanxButton.vue";
export { buttonIcons } from "./icons";
export type {
  ButtonSize,
  ButtonType,
  DanxButtonEmits,
  DanxButtonProps,
  DanxButtonSlots,
} from "./types";
