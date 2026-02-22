/**
 * SplitPanel Type Definitions
 *
 * Types for the DanxSplitPanel resizable split-panel layout component.
 */

/**
 * Configuration for a single panel in a split layout.
 * Passed in the `panels` prop array to declare available panels.
 */
export interface SplitPanelConfig {
  /** Unique identifier — also used as the dynamic slot name */
  id: string;

  /** Human-readable label for toggle UI and accessibility */
  label: string;

  /**
   * Proportional weight for initial width/height calculation.
   * Does not need to sum to 100 — values are treated as ratios.
   * Example: weights [1, 2, 1] produce 25%, 50%, 25%.
   */
  defaultWidth: number;
}

/**
 * Internal resolved state for an active panel.
 * Computed by useSplitPanel after proportional redistribution.
 */
export interface SplitPanelState {
  /** Panel identifier (matches SplitPanelConfig.id) */
  id: string;

  /** Actual percentage width/height after redistribution (always sums to 100) */
  computedWidth: number;
}

/** Props for the DanxSplitPanel component */
export interface DanxSplitPanelProps {
  /** Panel configurations declaring available panels */
  panels: SplitPanelConfig[];

  /**
   * Layout orientation.
   * - false (default): vertical columns (side-by-side)
   * - true: horizontal rows (stacked top-to-bottom)
   */
  horizontal?: boolean;

  /**
   * localStorage key for persisting panel state.
   * When provided, active panel IDs and custom widths survive page refreshes.
   * When omitted, no persistence occurs.
   */
  storageKey?: string;

  /**
   * When true, prevents deactivating the last remaining active panel.
   * Toggle-off is a no-op when only one panel is active.
   */
  requireActive?: boolean;
}

/** Emits for the DanxSplitPanel component */
export interface DanxSplitPanelEmits {
  /** Emitted when the active panel list changes (v-model binding) */
  (e: "update:modelValue", value: string[]): void;
}

/**
 * Slots for the DanxSplitPanel component.
 *
 * In addition to the typed slots below, each panel ID becomes
 * a dynamic named slot (e.g. #sidebar, #content) that renders
 * inside the corresponding panel area.
 */
export interface DanxSplitPanelSlots {
  /**
   * Custom toggle UI slot.
   * Receives helpers for building panel visibility controls.
   */
  toggles?: (props: {
    panels: SplitPanelConfig[];
    isActive: (id: string) => boolean;
    toggle: (id: string) => void;
  }) => unknown;
}

/** Shape of localStorage persisted state */
export interface SplitPanelStorageState {
  /** IDs of currently active (visible) panels */
  activePanelIds: string[];

  /** User-customized widths from drag resizing, keyed by panel ID */
  customWidths: Record<string, number>;
}
