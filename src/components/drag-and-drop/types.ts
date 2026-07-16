/**
 * Drag And Drop Type Definitions
 *
 * Types for the useDragAndDrop composable and DanxDragHandle component.
 */
import type { Ref } from "vue";

/** Layout orientation the list is rendered in — controls which arrow keys move items. */
export type DragAndDropOrientation = "vertical" | "horizontal";

/** Options accepted by useDragAndDrop. Read once at init, not reactive. */
export interface UseDragAndDropOptions {
  /**
   * Layout orientation of the list.
   * - "vertical" (default): items stack top-to-bottom, dragged with Up/Down arrows.
   * - "horizontal": items sit side-by-side, dragged with Left/Right arrows.
   */
  orientation?: DragAndDropOrientation;
}

/** Return shape of useDragAndDrop. */
export interface UseDragAndDropReturn {
  /** Index of the item currently being dragged (pointer or keyboard), or null when idle. */
  draggingIndex: Ref<number | null>;

  /** Index the dragged item would land on if dropped now, or null when idle. */
  dropTargetIndex: Ref<number | null>;

  /** Latest ARIA live-region announcement text for screen readers. */
  announcement: Ref<string>;

  /** Whether the item at `index` is the one currently being dragged. */
  isDragging: (index: number) => boolean;

  /** Whether the item at `index` is the current drop target (and not the dragged item itself). */
  isDropTarget: (index: number) => boolean;

  /** Registers (or clears, on unmount) the rendered element for an item at `index`. */
  registerItemRef: (index: number, el: HTMLElement | null) => void;

  /** Begins a pointer-driven drag for the item at `index`. Bind to the handle's pointerdown. */
  startDrag: (index: number, event: PointerEvent) => void;

  /** Handles keyboard grab/move/drop for the item at `index`. Bind to the handle's keydown. */
  onHandleKeydown: (index: number, event: KeyboardEvent) => void;
}
