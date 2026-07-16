import { computed, type Ref, ref, watch } from "vue";
import type { SplitPanelConfig, SplitPanelState, SplitPanelStorageState } from "./types";

/**
 * useSplitPanel Composable
 *
 * Manages panel visibility, proportional width redistribution, drag resizing,
 * and optional localStorage persistence for a split-panel layout.
 *
 * Width redistribution: Each active panel's effective width is its customWidth
 * (if set via drag) or its defaultWidth from config. All effective widths are
 * summed and each panel gets (effectiveWidth / total) * 100 as its percentage.
 *
 * @param panels - Reactive array of panel configurations
 * @param activePanelIds - v-model ref of active panel ID strings
 * @param options - Configuration options (read once at init, not reactive)
 * @returns Panel states, toggle/resize methods, and active-check helper
 */
export interface UseSplitPanelOptions {
  /** localStorage key for persistence (omit to disable). Read once at init. */
  storageKey?: string;

  /** Prevent deactivating the last panel. Read once at init. */
  requireActive?: boolean;

  /** Ref to the container element (needed for resize pixel-to-percent conversion) */
  containerRef?: Ref<HTMLElement | null>;

  /** Layout orientation (true = horizontal/stacked rows). Read once at init. */
  horizontal?: boolean;
}

export interface UseSplitPanelReturn {
  /** Computed active panels with resolved percentage widths */
  panelStates: Ref<SplitPanelState[]>;

  /** Toggle a panel's visibility by ID */
  togglePanel: (id: string) => void;

  /** Check whether a panel is currently active */
  isActive: (id: string) => boolean;

  /** Begin a drag-resize operation on the handle between two panels */
  startResize: (handleIndex: number, event: PointerEvent) => void;

  /** Whether a resize drag is in progress */
  isResizing: Ref<boolean>;

  /** Adjust the split at a handle by keyboard: step in a direction, or jump to an extreme */
  resizeStep: (handleIndex: number, direction: "decrease" | "increase" | "min" | "max") => void;
}

/** Minimum panel width as a percentage of container */
export const MIN_PANEL_PERCENT = 5;

/** Percentage adjustment applied per keyboard resize step */
const STEP_PANEL_PERCENT = 5;

export function useSplitPanel(
  panels: Ref<SplitPanelConfig[]>,
  activePanelIds: Ref<string[]>,
  options: UseSplitPanelOptions = {}
): UseSplitPanelReturn {
  const { storageKey, requireActive = false, containerRef, horizontal = false } = options;

  const customWidths = ref<Record<string, number>>({});
  const isResizing = ref(false);

  // --- localStorage ---

  function loadFromStorage(): void {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const stored: SplitPanelStorageState = JSON.parse(raw);
      const validIds = new Set(panels.value.map((p) => p.id));

      // Validate stored panel IDs against current config
      const validActive = stored.activePanelIds.filter((id) => validIds.has(id));
      if (validActive.length > 0) {
        activePanelIds.value = validActive;
      }

      // Validate stored custom widths
      if (stored.customWidths) {
        const validWidths: Record<string, number> = {};
        for (const [id, width] of Object.entries(stored.customWidths)) {
          if (validIds.has(id) && typeof width === "number" && width > 0) {
            validWidths[id] = width;
          }
        }
        customWidths.value = validWidths;
      }
    } catch {
      // Invalid JSON — ignore and use defaults
    }
  }

  function saveToStorage(): void {
    if (!storageKey) return;
    const state: SplitPanelStorageState = {
      activePanelIds: activePanelIds.value,
      customWidths: customWidths.value,
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Storage unavailable/full — preference stays in-memory for this session
    }
  }

  // Load persisted state on init
  loadFromStorage();

  // --- Panel states ---

  const panelStates = computed<SplitPanelState[]>(() => {
    const active = panels.value.filter((p) => activePanelIds.value.includes(p.id));
    if (active.length === 0) return [];

    const effectiveWidths = active.map((p) => customWidths.value[p.id] ?? p.defaultWidth);
    const total = effectiveWidths.reduce((sum, w) => sum + w, 0);

    return active.map((p, i) => ({
      id: p.id,
      computedWidth: (effectiveWidths[i]! / total) * 100,
    }));
  });

  // --- Toggle ---

  function togglePanel(id: string): void {
    const panelExists = panels.value.some((p) => p.id === id);
    if (!panelExists) return;

    const currentActive = [...activePanelIds.value];
    const idx = currentActive.indexOf(id);

    if (idx >= 0) {
      // Toggling off
      if (requireActive && currentActive.length <= 1) return;
      currentActive.splice(idx, 1);
      // Clear custom width so it reverts to default on re-open
      const newWidths = { ...customWidths.value };
      delete newWidths[id];
      customWidths.value = newWidths;
    } else {
      // Toggling on — insert in declaration order
      const declaredOrder = panels.value.map((p) => p.id);
      currentActive.push(id);
      currentActive.sort((a, b) => declaredOrder.indexOf(a) - declaredOrder.indexOf(b));
    }

    activePanelIds.value = currentActive;
    saveToStorage();
  }

  function isActive(id: string): boolean {
    return activePanelIds.value.includes(id);
  }

  // --- Resize ---

  /** Sum of each active panel's effective width (customWidth or defaultWidth) */
  function totalEffectiveWidth(states: SplitPanelState[]): number {
    return states.reduce((sum, s) => {
      return (
        sum + (customWidths.value[s.id] ?? panels.value.find((p) => p.id === s.id)!.defaultWidth)
      );
    }, 0);
  }

  function applyPanelSplit(
    states: SplitPanelState[],
    leftPanel: SplitPanelState,
    rightPanel: SplitPanelState,
    newLeftWidth: number,
    newRightWidth: number
  ): void {
    const totalEffective = totalEffectiveWidth(states);

    customWidths.value = {
      ...customWidths.value,
      [leftPanel.id]: (newLeftWidth / 100) * totalEffective,
      [rightPanel.id]: (newRightWidth / 100) * totalEffective,
    };
  }

  function resizeStep(
    handleIndex: number,
    direction: "decrease" | "increase" | "min" | "max"
  ): void {
    const states = panelStates.value;
    if (handleIndex < 0 || handleIndex >= states.length - 1) return;

    const leftPanel = states[handleIndex]!;
    const rightPanel = states[handleIndex + 1]!;
    const totalWidth = leftPanel.computedWidth + rightPanel.computedWidth;

    let newLeftWidth: number;
    if (direction === "min") {
      newLeftWidth = MIN_PANEL_PERCENT;
    } else if (direction === "max") {
      newLeftWidth = totalWidth - MIN_PANEL_PERCENT;
    } else {
      const delta = direction === "increase" ? STEP_PANEL_PERCENT : -STEP_PANEL_PERCENT;
      newLeftWidth = leftPanel.computedWidth + delta;
    }

    newLeftWidth = Math.max(
      MIN_PANEL_PERCENT,
      Math.min(totalWidth - MIN_PANEL_PERCENT, newLeftWidth)
    );
    const newRightWidth = totalWidth - newLeftWidth;

    applyPanelSplit(states, leftPanel, rightPanel, newLeftWidth, newRightWidth);
    saveToStorage();
  }

  function startResize(handleIndex: number, event: PointerEvent): void {
    const states = panelStates.value;
    if (handleIndex < 0 || handleIndex >= states.length - 1) return;

    const container = containerRef?.value;
    if (!container) return;

    const target = event.target as HTMLElement;
    target.setPointerCapture(event.pointerId);

    isResizing.value = true;

    const containerSize = horizontal
      ? container.getBoundingClientRect().height
      : container.getBoundingClientRect().width;

    const leftPanel = states[handleIndex]!;
    const rightPanel = states[handleIndex + 1]!;
    const startPos = horizontal ? event.clientY : event.clientX;
    const startLeftWidth = leftPanel.computedWidth;
    const startRightWidth = rightPanel.computedWidth;

    function onPointerMove(e: PointerEvent) {
      const currentPos = horizontal ? e.clientY : e.clientX;
      const pixelDelta = currentPos - startPos;
      const percentDelta = (pixelDelta / containerSize) * 100;

      let newLeftWidth = startLeftWidth + percentDelta;
      let newRightWidth = startRightWidth - percentDelta;

      // Clamp to minimum
      if (newLeftWidth < MIN_PANEL_PERCENT) {
        newLeftWidth = MIN_PANEL_PERCENT;
        newRightWidth = startLeftWidth + startRightWidth - MIN_PANEL_PERCENT;
      }
      if (newRightWidth < MIN_PANEL_PERCENT) {
        newRightWidth = MIN_PANEL_PERCENT;
        newLeftWidth = startLeftWidth + startRightWidth - MIN_PANEL_PERCENT;
      }

      // Convert back to effective weights for storage
      // We store the proportional value that would produce the desired percentage
      applyPanelSplit(states, leftPanel, rightPanel, newLeftWidth, newRightWidth);
    }

    function onPointerUp() {
      target.removeEventListener("pointermove", onPointerMove);
      target.removeEventListener("pointerup", onPointerUp);
      target.releasePointerCapture(event.pointerId);
      isResizing.value = false;
      saveToStorage();
    }

    target.addEventListener("pointermove", onPointerMove);
    target.addEventListener("pointerup", onPointerUp);
  }

  // Persist when active panels change externally (e.g. v-model)
  watch(activePanelIds, () => {
    saveToStorage();
  });

  return {
    panelStates,
    togglePanel,
    isActive,
    startResize,
    isResizing,
    resizeStep,
  };
}
