/**
 * Button Component Module
 *
 * Exports:
 * - DanxButton: The button component
 * - DanxActionButton: Action-integrated button wrapper
 * - Types: TypeScript interfaces
 * - Icons: Individual SVG icon constants
 */

export { default as DanxButton } from "./DanxButton.vue";
export { default as DanxActionButton } from "./DanxActionButton.vue";
export * from "./icons";
export type { ButtonSize, DanxButtonEmits, DanxButtonProps, DanxButtonSlots } from "./types";
export type {
  ActionTarget,
  ActionTargetItem,
  DanxActionButtonEmits,
  DanxActionButtonProps,
  ResourceAction,
} from "./action-types";
