/**
 * usePopoverPositioning - Computes fixed position for a popover panel anchored to a trigger
 *
 * When isOpen becomes true, measures the trigger and panel via getBoundingClientRect(),
 * computes position based on placement (bottom/top/left/right) with a configurable offset,
 * and auto-flips when the panel would overflow the viewport. Listens for scroll (capture)
 * and resize events while open to keep the panel correctly positioned.
 *
 * @param trigger - Ref to the trigger element
 * @param panel - Ref to the panel element
 * @param placement - Ref to the desired placement direction
 * @param isOpen - Ref controlling when positioning is active
 * @returns Reactive style object with top/left as pixel strings
 */
import { type CSSProperties, nextTick, onScopeDispose, reactive, type Ref, watch } from "vue";
import type { PopoverPlacement } from "./types";

/** Default gap between trigger and panel in pixels */
const DEFAULT_OFFSET = 8;

export interface UsePopoverPositioningReturn {
  style: CSSProperties;
}

export function usePopoverPositioning(
  trigger: Ref<HTMLElement | null>,
  panel: Ref<HTMLElement | null>,
  placement: Ref<PopoverPlacement>,
  isOpen: Ref<boolean>
): UsePopoverPositioningReturn {
  const style = reactive<CSSProperties>({});

  function updatePosition(): void {
    if (!trigger.value || !panel.value) return;

    const triggerRect = trigger.value.getBoundingClientRect();
    const panelRect = panel.value.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const resolved = resolvePosition(
      placement.value,
      triggerRect,
      panelRect,
      viewportWidth,
      viewportHeight
    );

    style.top = `${resolved.top}px`;
    style.left = `${resolved.left}px`;
  }

  let scrollListenerActive = false;

  function addScrollListeners(): void {
    if (!scrollListenerActive) {
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      scrollListenerActive = true;
    }
  }

  function removeScrollListeners(): void {
    if (scrollListenerActive) {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      scrollListenerActive = false;
    }
  }

  watch(
    isOpen,
    async (open) => {
      if (open) {
        await nextTick();
        updatePosition();
        addScrollListeners();
      } else {
        removeScrollListeners();
      }
    },
    { immediate: true }
  );

  onScopeDispose(() => {
    removeScrollListeners();
  });

  return { style };
}

/** Resolve final top/left, flipping placement if the panel overflows the viewport */
function resolvePosition(
  placement: PopoverPlacement,
  triggerRect: DOMRect,
  panelRect: DOMRect,
  viewportWidth: number,
  viewportHeight: number
): { top: number; left: number } {
  let { top, left } = computePosition(placement, triggerRect, panelRect);

  // Auto-flip if overflowing
  if (placement === "bottom" && top + panelRect.height > viewportHeight) {
    const flipped = computePosition("top", triggerRect, panelRect);
    top = flipped.top;
    left = flipped.left;
  } else if (placement === "top" && top < 0) {
    const flipped = computePosition("bottom", triggerRect, panelRect);
    top = flipped.top;
    left = flipped.left;
  } else if (placement === "right" && left + panelRect.width > viewportWidth) {
    const flipped = computePosition("left", triggerRect, panelRect);
    top = flipped.top;
    left = flipped.left;
  } else if (placement === "left" && left < 0) {
    const flipped = computePosition("right", triggerRect, panelRect);
    top = flipped.top;
    left = flipped.left;
  }

  // Clamp to viewport boundaries
  top = Math.max(0, Math.min(top, viewportHeight - panelRect.height));
  left = Math.max(0, Math.min(left, viewportWidth - panelRect.width));

  return { top, left };
}

/** Compute raw top/left for a given placement without flip logic */
function computePosition(
  placement: PopoverPlacement,
  triggerRect: DOMRect,
  panelRect: DOMRect
): { top: number; left: number } {
  const triggerCenterX = triggerRect.left + triggerRect.width / 2;
  const triggerCenterY = triggerRect.top + triggerRect.height / 2;

  switch (placement) {
    case "bottom":
      return {
        top: triggerRect.bottom + DEFAULT_OFFSET,
        left: triggerCenterX - panelRect.width / 2,
      };
    case "top":
      return {
        top: triggerRect.top - panelRect.height - DEFAULT_OFFSET,
        left: triggerCenterX - panelRect.width / 2,
      };
    case "right":
      return {
        top: triggerCenterY - panelRect.height / 2,
        left: triggerRect.right + DEFAULT_OFFSET,
      };
    case "left":
      return {
        top: triggerCenterY - panelRect.height / 2,
        left: triggerRect.left - panelRect.width - DEFAULT_OFFSET,
      };
  }
}
