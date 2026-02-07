/**
 * danx-ui - Zero-dependency Vue 3 + Tailwind CSS v4 component library
 *
 * Main entry point. Re-exports all components, composables, and types.
 */

// Components
export { DanxButton } from "./components/button";
export { DanxDialog } from "./components/dialog";

// Composables
export { useDialog } from "./components/dialog";

// Icons
export * from "./components/button/icons";

// Types
export type {
  ButtonSize,
  ButtonType,
  DanxButtonEmits,
  DanxButtonProps,
  DanxButtonSlots,
} from "./components/button";
export type {
  DanxDialogEmits,
  DanxDialogProps,
  DanxDialogSlots,
  UseDialogReturn,
} from "./components/dialog";

export type * from "./shared";
