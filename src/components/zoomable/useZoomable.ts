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
 *   - two-finger touch       → pinch to zoom (distance-delta drives setZoom)
 *   - one-finger touch-drag  → pan, but only once zoomed in (zoom > 100);
 *                              at 100% a lone finger is left untouched so a
 *                              host like DanxFileViewer can swipe-navigate
 *
 * Keyboard listeners attach to `window` (capture phase) so they fire even
 * when the wrapped content has focus. They no-op unless the focused element
 * is inside `rootRef` — this keeps multiple Zoomables on a page from fighting.
 *
 * Wheel must be a non-passive listener so preventDefault can stop the
 * browser's built-in zoom; the composable registers it manually. Touch
 * listeners are registered the same non-passive way, for the same reason —
 * pinch/pan must preventDefault to stop native pinch-zoom/scroll. Multi-touch
 * (pinch/pan) also stopPropagation so a host's own touchstart/touchend swipe
 * listener (keyed off touches[0]/changedTouches[0] only) never misreads a
 * two-finger gesture as a one-finger swipe.
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

  // All window-level listeners use the CAPTURE phase. Containers like
  // DanxDialog stop propagation of mousemove / mouseup / keydown / keyup on
  // their content (to isolate inner state), which would otherwise prevent
  // these bubble-phase events from ever reaching `window` — breaking drag-pan
  // and the modifier-key (grab cursor / keyboard zoom) state inside a dialog.
  // Capture-phase listeners fire on the way down, before any descendant's
  // bubble-phase stopPropagation can run.
  const CAPTURE = { capture: true } as const;

  const isDragging = ref(false);
  const panInputActive = ref(false);

  let dragStartX = 0;
  let dragStartY = 0;
  let dragOriginPanX = 0;
  let dragOriginPanY = 0;

  let pinchStartDistance = 0;
  let pinchStartZoom = 100;
  let isTouchPanning = false;
  let touchPanStartX = 0;
  let touchPanStartY = 0;
  let touchPanOriginX = 0;
  let touchPanOriginY = 0;

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
    window.addEventListener("mousemove", onDragMove, CAPTURE);
    window.addEventListener("mouseup", onDragEnd, { once: true, capture: true });
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
    window.removeEventListener("mousemove", onDragMove, CAPTURE);
  }

  function onDblClick() {
    resetAll();
  }

  function touchDistance(touches: TouchList): number {
    const a = touches[0];
    const b = touches[1];
    if (!a || !b) return 0;
    return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
  }

  function onTouchStart(event: TouchEvent) {
    if (event.touches.length >= 2) {
      event.stopPropagation();
      if (wheelDisabled?.value) return;
      event.preventDefault();
      pinchStartDistance = touchDistance(event.touches);
      pinchStartZoom = zoom.value;
      isTouchPanning = false;
      return;
    }
    if (panDisabled?.value || zoom.value <= 100) return;
    const touch = event.touches[0];
    if (!touch) return;
    event.preventDefault();
    isTouchPanning = true;
    isDragging.value = true;
    touchPanStartX = touch.clientX;
    touchPanStartY = touch.clientY;
    touchPanOriginX = pan.value.x;
    touchPanOriginY = pan.value.y;
  }

  function onTouchMove(event: TouchEvent) {
    if (event.touches.length >= 2) {
      event.stopPropagation();
      if (wheelDisabled?.value || pinchStartDistance <= 0) return;
      event.preventDefault();
      const distance = touchDistance(event.touches);
      setZoom(pinchStartZoom * (distance / pinchStartDistance));
      return;
    }
    if (!isTouchPanning) return;
    const touch = event.touches[0];
    if (!touch) return;
    event.preventDefault();
    pan.value = {
      x: touchPanOriginX + (touch.clientX - touchPanStartX),
      y: touchPanOriginY + (touch.clientY - touchPanStartY),
    };
  }

  function onTouchEnd(event: TouchEvent) {
    if (event.touches.length >= 2) {
      event.stopPropagation();
      return;
    }
    pinchStartDistance = 0;
    if (isTouchPanning) {
      isTouchPanning = false;
      isDragging.value = false;
    }
  }

  onMounted(() => {
    const root = rootRef.value;
    if (root) {
      root.addEventListener("wheel", onWheel, { passive: false });
      root.addEventListener("touchstart", onTouchStart, { passive: false });
      root.addEventListener("touchmove", onTouchMove, { passive: false });
      root.addEventListener("touchend", onTouchEnd, { passive: false });
      root.addEventListener("touchcancel", onTouchEnd, { passive: false });
    }
    window.addEventListener("keydown", onZoomKey, CAPTURE);
    window.addEventListener("keydown", onModifierKey, CAPTURE);
    window.addEventListener("keyup", onModifierKey, CAPTURE);
    window.addEventListener("blur", onWindowBlur);
  });

  onBeforeUnmount(() => {
    const root = rootRef.value;
    if (root) {
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchmove", onTouchMove);
      root.removeEventListener("touchend", onTouchEnd);
      root.removeEventListener("touchcancel", onTouchEnd);
    }
    window.removeEventListener("keydown", onZoomKey, CAPTURE);
    window.removeEventListener("keydown", onModifierKey, CAPTURE);
    window.removeEventListener("keyup", onModifierKey, CAPTURE);
    window.removeEventListener("blur", onWindowBlur);
    window.removeEventListener("mousemove", onDragMove, CAPTURE);
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
