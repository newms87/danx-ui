/**
 * SplitPanel Component Module
 *
 * Exports:
 * - DanxSplitPanel: Resizable multi-panel layout component
 * - SplitPanelHandle: Drag handle between adjacent panels
 * - useSplitPanel: Composable for panel state management
 * - Types: SplitPanelConfig, SplitPanelState, DanxSplitPanelProps, etc.
 */
export { default as DanxSplitPanel } from "./DanxSplitPanel.vue";
export { default as SplitPanelHandle } from "./SplitPanelHandle.vue";
export { useSplitPanel } from "./useSplitPanel";
export type {
  SplitPanelConfig,
  SplitPanelState,
  DanxSplitPanelProps,
  DanxSplitPanelEmits,
  DanxSplitPanelSlots,
  SplitPanelStorageState,
} from "./types";
export type { UseSplitPanelOptions, UseSplitPanelReturn } from "./useSplitPanel";
