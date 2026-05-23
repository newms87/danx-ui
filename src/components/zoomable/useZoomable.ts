/**
 * useZoomable - Composable for Photoshop-style zoom + pan
 *
 * Owns the modifier-key event listeners and drag state for a zoomable
 * container. Designed to back DanxZoomable but reusable by any component
 * that exposes a `zoom` and `pan` model.
 *
 * Handlers:
 *   - Ctrl/Cmd + wheel       → zoom in/out (preventDefault hijacks browser zoom)
 *   - Ctrl/Cmd + drag        → pan
 *   - Ctrl/Cmd + +/=/-/_     → zoom in/out
 *   - Ctrl/Cmd + 0           → reset zoom to 100
 *   - dblclick on container  → reset pan
 *
 * Keyboard listeners attach to `window` (capture phase) so they fire even
 * when the wrapped content has focus. They no-op unless the focused element
 * is inside `rootRef` — this keeps multiple Zoomables on a page from fighting.
 *
 * Wheel must be a non-passive listener so preventDefault can stop the
 * browser's built-in zoom; the composable registers it manually.
 */

import { computed, onBeforeUnmount, onMounted, ref, type Ref } from "vue";
import type { Pan } from "./types";

export interface UseZoomableOptions {
  zoom: Ref<number>;
  pan: Ref<Pan>;
  rootRef: Ref<HTMLElement | null>;
  min?: Ref<number>;
  max?: Ref<number>;
  step?: Ref<number>;
  panDisabled?: Ref<boolean>;
  wheelDisabled?: Ref<boolean>;
  keyboardDisabled?: Ref<boolean>;
  onReset?: () => void;
}

export interface UseZoomableReturn {
  isDragging: Ref<boolean>;
  panInputActive: Ref<boolean>;
  modifierKeyLabel: Ref<string>;
  clampZoom: (value: number) => number;
  resetPan: () => void;
  resetZoom: () => void;
  resetAll: () => void;
  onDragStart: (event: MouseEvent) => void;
  onDblClick: () => void;
}

function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  // navigator.platform is deprecated but still the most reliable cross-browser
  // signal for Mac vs PC modifier-key labeling.
  return /Mac|iPhone|iPad/i.test(navigator.platform);
}

export function useZoomable(options: UseZoomableOptions): UseZoomableReturn {
  const {
    zoom,
    pan,
    rootRef,
    min,
    max,
    step,
    panDisabled,
    wheelDisabled,
    keyboardDisabled,
    onReset,
  } = options;

  const getMin = () => min?.value ?? 25;
  const getMax = () => max?.value ?? 400;
  const getStep = () => step?.value ?? 10;

  const isDragging = ref(false);
  const panInputActive = ref(false);

  let dragStartX = 0;
  let dragStartY = 0;
  let dragOriginPanX = 0;
  let dragOriginPanY = 0;

  const modifierKeyLabel = computed(() => (isMacPlatform() ? "⌘" : "Ctrl"));

  function clampZoom(value: number): number {
    return Math.min(getMax(), Math.max(getMin(), value));
  }

  function setZoom(value: number) {
    const next = clampZoom(value);
    if (next !== zoom.value) zoom.value = next;
  }

  function resetPan() {
    if (pan.value.x !== 0 || pan.value.y !== 0) {
      pan.value = { x: 0, y: 0 };
    }
  }

  function resetZoom() {
    setZoom(100);
  }

  function resetAll() {
    resetZoom();
    resetPan();
    onReset?.();
  }

  function isFocusInsideRoot(): boolean {
    const root = rootRef.value;
    if (!root) return false;
    if (typeof document === "undefined") return false;
    const active = document.activeElement;
    if (!active) return false;
    return root === active || root.contains(active);
  }

  function onWheel(event: WheelEvent) {
    if (wheelDisabled?.value) return;
    if (!(event.ctrlKey || event.metaKey)) return;
    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;
    setZoom(zoom.value + direction * getStep());
  }

  function onZoomKey(event: KeyboardEvent) {
    if (keyboardDisabled?.value) return;
    if (!(event.ctrlKey || event.metaKey)) return;
    if (!isFocusInsideRoot()) return;
    if (event.altKey) return;
    // shift only allowed for `+` / `=` on US keyboards
    if (event.shiftKey && event.key !== "+" && event.key !== "=") return;

    let next: number | null = null;
    switch (event.key) {
      case "+":
      case "=":
        next = clampZoom(zoom.value + getStep());
        break;
      case "-":
      case "_":
        next = clampZoom(zoom.value - getStep());
        break;
      case "0":
        next = 100;
        break;
      default:
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (next !== zoom.value) zoom.value = next;
  }

  function onModifierKey(event: KeyboardEvent) {
    panInputActive.value = (event.ctrlKey || event.metaKey) && !panDisabled?.value;
  }

  function onWindowBlur() {
    panInputActive.value = false;
  }

  function onDragStart(event: MouseEvent) {
    if (panDisabled?.value) return;
    if (event.button !== 0) return;
    if (!(event.ctrlKey || event.metaKey)) return;
    event.preventDefault();
    isDragging.value = true;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    dragOriginPanX = pan.value.x;
    dragOriginPanY = pan.value.y;
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", onDragEnd, { once: true });
  }

  function onDragMove(event: MouseEvent) {
    if (!isDragging.value) return;
    pan.value = {
      x: dragOriginPanX + (event.clientX - dragStartX),
      y: dragOriginPanY + (event.clientY - dragStartY),
    };
  }

  function onDragEnd() {
    isDragging.value = false;
    window.removeEventListener("mousemove", onDragMove);
  }

  function onDblClick() {
    resetAll();
  }

  onMounted(() => {
    const root = rootRef.value;
    if (root) {
      root.addEventListener("wheel", onWheel, { passive: false });
    }
    window.addEventListener("keydown", onZoomKey, { capture: true });
    window.addEventListener("keydown", onModifierKey);
    window.addEventListener("keyup", onModifierKey);
    window.addEventListener("blur", onWindowBlur);
  });

  onBeforeUnmount(() => {
    const root = rootRef.value;
    if (root) {
      root.removeEventListener("wheel", onWheel);
    }
    window.removeEventListener("keydown", onZoomKey, { capture: true });
    window.removeEventListener("keydown", onModifierKey);
    window.removeEventListener("keyup", onModifierKey);
    window.removeEventListener("blur", onWindowBlur);
    window.removeEventListener("mousemove", onDragMove);
  });

  return {
    isDragging,
    panInputActive,
    modifierKeyLabel,
    clampZoom,
    resetPan,
    resetZoom,
    resetAll,
    onDragStart,
    onDblClick,
  };
}
