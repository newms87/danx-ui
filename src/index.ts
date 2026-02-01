/**
 * danx-ui - Zero-dependency Vue 3 + Tailwind CSS v4 component library
 *
 * Main entry point. Re-exports all components, composables, and types.
 */

// Components
export { DanxDialog } from "./components/dialog";

// Composables
export { useDialog } from "./components/dialog";

// Types
export type {
  DanxDialogEmits,
  DanxDialogProps,
  DanxDialogSlots,
  UseDialogReturn,
} from "./components/dialog";

export type * from "./shared";
