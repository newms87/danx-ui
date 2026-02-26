/**
 * useTouchSwipe - Touch/swipe gesture detection composable
 *
 * Detects horizontal swipe gestures and invokes callbacks. Ignores vertical
 * drags and sub-threshold movements. Mutable state is instance-scoped via
 * closure (no module-level variables).
 *
 * @param options.onSwipeLeft - Called when a left swipe is detected
 * @param options.onSwipeRight - Called when a right swipe is detected
 * @param options.threshold - Minimum horizontal distance in px (default: 50)
 *
 * @returns { onTouchStart, onTouchEnd } handlers to bind to touch events
 */

export interface UseTouchSwipeOptions {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  threshold?: number;
}

export interface UseTouchSwipeReturn {
  onTouchStart: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
}

const DEFAULT_THRESHOLD = 50;

export function useTouchSwipe(options: UseTouchSwipeOptions): UseTouchSwipeReturn {
  const { onSwipeLeft, onSwipeRight, threshold = DEFAULT_THRESHOLD } = options;

  let touchStartX = 0;
  let touchStartY = 0;

  function onTouchStart(e: TouchEvent) {
    const touch = e.touches[0];
    if (touch) {
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }
  }

  function onTouchEnd(e: TouchEvent) {
    const touch = e.changedTouches[0];
    if (!touch) return;
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
    }
  }

  return { onTouchStart, onTouchEnd };
}
