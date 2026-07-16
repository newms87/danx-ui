import { type Ref, nextTick, ref } from "vue";
import type { UseDragAndDropOptions, UseDragAndDropReturn } from "./types";

/**
 * useDragAndDrop Composable
 *
 * Manages pointer- and keyboard-driven reordering of an array v-model.
 * Tracks the dragged item's source index and the current drop target index,
 * mutates `items` in place when a drop lands on a new position, and plays a
 * FLIP-style transform transition on the affected rows so movement animates
 * smoothly instead of snapping.
 *
 * Keyboard: Space/Enter grabs the focused item, arrow keys (Up/Down for
 * vertical, Left/Right for horizontal) move it one position at a time,
 * Space/Enter drops it, Escape cancels back to the original position.
 * Each action updates `announcement` for an ARIA live region.
 *
 * @param items - v-model ref of the ordered array; mutated directly on drop
 * @param options - orientation (read once at init, not reactive)
 * @returns Drag/drop state, per-item style helpers, and event handlers
 */
export function useDragAndDrop<T>(
  items: Ref<T[]>,
  options: UseDragAndDropOptions = {}
): UseDragAndDropReturn {
  const { orientation = "vertical" } = options;
  const horizontal = orientation === "horizontal";

  const itemEls: (HTMLElement | null)[] = [];

  const draggingIndex = ref<number | null>(null);
  const dropTargetIndex = ref<number | null>(null);
  const grabbedIndex = ref<number | null>(null);
  const announcement = ref("");

  function registerItemRef(index: number, el: HTMLElement | null): void {
    itemEls[index] = el;
  }

  function isDragging(index: number): boolean {
    return draggingIndex.value === index;
  }

  function isDropTarget(index: number): boolean {
    return dropTargetIndex.value === index && draggingIndex.value !== index;
  }

  function captureRects(): Map<number, DOMRect> {
    const rects = new Map<number, DOMRect>();
    itemEls.forEach((el, i) => {
      if (el) rects.set(i, el.getBoundingClientRect());
    });
    return rects;
  }

  /** Records pre-move rects, waits for the DOM to reflect the new order, then
   * animates each moved element from its old position to its new one. */
  async function playFlip(before: Map<number, DOMRect>): Promise<void> {
    await nextTick();
    itemEls.forEach((el, i) => {
      if (!el) return;
      const prev = before.get(i);
      if (!prev) return;
      const next = el.getBoundingClientRect();
      const deltaX = prev.left - next.left;
      const deltaY = prev.top - next.top;
      if (deltaX === 0 && deltaY === 0) return;

      el.style.transition = "none";
      el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      // Force a reflow so the browser registers the starting transform
      // before animating to the final position, otherwise it never plays.
      void el.getBoundingClientRect();
      el.style.transition = "transform var(--dx-drag-flip-duration, 200ms) ease";
      el.style.transform = "";

      const clearInlineStyles = () => {
        el.style.transition = "";
        el.style.transform = "";
        el.removeEventListener("transitionend", clearInlineStyles);
      };
      el.addEventListener("transitionend", clearInlineStyles);
    });
  }

  /** Splices `items` from `from` to `to`. Callers guarantee from !== to. */
  function moveItem(from: number, to: number): void {
    const before = captureRects();
    const next = [...items.value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved as T);
    items.value = next;
    void playFlip(before);
  }

  function findDropTarget(clientPos: number): number {
    for (let i = 0; i < itemEls.length; i++) {
      const el = itemEls[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const mid = horizontal ? rect.left + rect.width / 2 : rect.top + rect.height / 2;
      if (clientPos < mid) return i;
    }
    return Math.max(itemEls.length - 1, 0);
  }

  function endDrag(): void {
    draggingIndex.value = null;
    dropTargetIndex.value = null;
    grabbedIndex.value = null;
  }

  function startDrag(index: number, event: PointerEvent): void {
    draggingIndex.value = index;
    dropTargetIndex.value = index;

    const target = event.target as HTMLElement;
    const pointerId = event.pointerId;
    target.setPointerCapture(pointerId);

    function onMove(e: PointerEvent): void {
      dropTargetIndex.value = findDropTarget(horizontal ? e.clientX : e.clientY);
    }

    function onUp(): void {
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerup", onUp);
      target.removeEventListener("pointercancel", onUp);
      target.releasePointerCapture(pointerId);

      const from = draggingIndex.value;
      const to = dropTargetIndex.value;
      endDrag();
      if (from !== null && to !== null && from !== to) {
        moveItem(from, to);
        announcement.value = `Moved item from position ${from + 1} to position ${to + 1} of ${items.value.length}.`;
      }
    }

    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerup", onUp);
    target.addEventListener("pointercancel", onUp);
  }

  function onHandleKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      if (grabbedIndex.value === null) {
        grabbedIndex.value = index;
        draggingIndex.value = index;
        dropTargetIndex.value = index;
        announcement.value = `Grabbed item ${index + 1} of ${items.value.length}. Use arrow keys to move, space or enter to drop, escape to cancel.`;
      } else {
        const droppedAt = grabbedIndex.value;
        endDrag();
        announcement.value = `Dropped item at position ${droppedAt + 1} of ${items.value.length}.`;
      }
      return;
    }

    if (grabbedIndex.value === null) return;
    const grabbed = grabbedIndex.value;

    if (event.key === "Escape") {
      event.preventDefault();
      endDrag();
      announcement.value = "Reordering cancelled.";
      return;
    }

    const decreaseKey = horizontal ? "ArrowLeft" : "ArrowUp";
    const increaseKey = horizontal ? "ArrowRight" : "ArrowDown";

    if (event.key === decreaseKey && grabbed > 0) {
      event.preventDefault();
      moveItem(grabbed, grabbed - 1);
      grabbedIndex.value = grabbed - 1;
      draggingIndex.value = grabbed - 1;
      dropTargetIndex.value = grabbed - 1;
      announcement.value = `Moved item to position ${grabbed} of ${items.value.length}.`;
    } else if (event.key === increaseKey && grabbed < items.value.length - 1) {
      event.preventDefault();
      moveItem(grabbed, grabbed + 1);
      grabbedIndex.value = grabbed + 1;
      draggingIndex.value = grabbed + 1;
      dropTargetIndex.value = grabbed + 1;
      announcement.value = `Moved item to position ${grabbed + 2} of ${items.value.length}.`;
    }
  }

  return {
    draggingIndex,
    dropTargetIndex,
    announcement,
    isDragging,
    isDropTarget,
    registerItemRef,
    startDrag,
    onHandleKeydown,
  };
}
