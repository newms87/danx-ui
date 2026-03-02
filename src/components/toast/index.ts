/**
 * Toast Component Module
 *
 * Exports:
 * - DanxToast: Individual toast notification panel
 * - DanxToastContainer: App-level container for positioning toasts
 * - useToast: Singleton composable for toast management
 * - useToastTimer: Per-toast timer with pause/resume
 * - Types: TypeScript interfaces
 */

export { default as DanxToast } from "./DanxToast.vue";
export { default as DanxToastContainer } from "./DanxToastContainer.vue";
export { useToast } from "./useToast";
export type { UseToastReturn } from "./useToast";
export { useToastTimer } from "./useToastTimer";
export type { UseToastTimerReturn } from "./useToastTimer";
export type {
  DanxToastProps,
  DanxToastSlots,
  ToastEntry,
  ToastOptions,
  ToastPosition,
} from "./types";
