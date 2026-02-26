import { describe, it, expect, vi } from "vitest";
import { useTouchSwipe } from "../useTouchSwipe";

function makeTouchStartEvent(touches: Array<{ clientX: number; clientY: number }>): TouchEvent {
  return { touches } as unknown as TouchEvent;
}

function makeTouchEndEvent(
  changedTouches: Array<{ clientX: number; clientY: number }>
): TouchEvent {
  return { changedTouches } as unknown as TouchEvent;
}

describe("useTouchSwipe", () => {
  it("calls onSwipeLeft for left swipe exceeding threshold", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const { onTouchStart, onTouchEnd } = useTouchSwipe({ onSwipeLeft, onSwipeRight });

    onTouchStart(makeTouchStartEvent([{ clientX: 200, clientY: 100 }]));
    onTouchEnd(makeTouchEndEvent([{ clientX: 100, clientY: 100 }]));

    expect(onSwipeLeft).toHaveBeenCalledOnce();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it("calls onSwipeRight for right swipe exceeding threshold", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const { onTouchStart, onTouchEnd } = useTouchSwipe({ onSwipeLeft, onSwipeRight });

    onTouchStart(makeTouchStartEvent([{ clientX: 100, clientY: 100 }]));
    onTouchEnd(makeTouchEndEvent([{ clientX: 200, clientY: 100 }]));

    expect(onSwipeRight).toHaveBeenCalledOnce();
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it("ignores sub-threshold swipes", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const { onTouchStart, onTouchEnd } = useTouchSwipe({ onSwipeLeft, onSwipeRight });

    onTouchStart(makeTouchStartEvent([{ clientX: 200, clientY: 100 }]));
    onTouchEnd(makeTouchEndEvent([{ clientX: 170, clientY: 100 }]));

    expect(onSwipeLeft).not.toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it("does not trigger at exactly the threshold (strict greater-than)", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const { onTouchStart, onTouchEnd } = useTouchSwipe({ onSwipeLeft, onSwipeRight });

    // Exactly 50px — should NOT trigger (condition is > not >=)
    onTouchStart(makeTouchStartEvent([{ clientX: 150, clientY: 100 }]));
    onTouchEnd(makeTouchEndEvent([{ clientX: 100, clientY: 100 }]));

    expect(onSwipeLeft).not.toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();

    // 51px — should trigger
    onTouchStart(makeTouchStartEvent([{ clientX: 151, clientY: 100 }]));
    onTouchEnd(makeTouchEndEvent([{ clientX: 100, clientY: 100 }]));

    expect(onSwipeLeft).toHaveBeenCalledOnce();
  });

  it("ignores vertical swipes", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const { onTouchStart, onTouchEnd } = useTouchSwipe({ onSwipeLeft, onSwipeRight });

    onTouchStart(makeTouchStartEvent([{ clientX: 200, clientY: 100 }]));
    onTouchEnd(makeTouchEndEvent([{ clientX: 180, clientY: 300 }]));

    expect(onSwipeLeft).not.toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it("handles empty touches array in touchstart", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const { onTouchStart, onTouchEnd } = useTouchSwipe({ onSwipeLeft, onSwipeRight });

    onTouchStart(makeTouchStartEvent([]));
    // touchStartX/Y stayed at default 0; end at 30 gives deltaX=30 (under threshold)
    onTouchEnd(makeTouchEndEvent([{ clientX: 30, clientY: 0 }]));

    expect(onSwipeLeft).not.toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it("handles empty changedTouches array in touchend", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const { onTouchStart, onTouchEnd } = useTouchSwipe({ onSwipeLeft, onSwipeRight });

    onTouchStart(makeTouchStartEvent([{ clientX: 200, clientY: 100 }]));
    onTouchEnd(makeTouchEndEvent([]));

    expect(onSwipeLeft).not.toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it("respects custom threshold", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const { onTouchStart, onTouchEnd } = useTouchSwipe({
      onSwipeLeft,
      onSwipeRight,
      threshold: 100,
    });

    // 60px swipe — under the 100px custom threshold
    onTouchStart(makeTouchStartEvent([{ clientX: 200, clientY: 100 }]));
    onTouchEnd(makeTouchEndEvent([{ clientX: 140, clientY: 100 }]));

    expect(onSwipeLeft).not.toHaveBeenCalled();

    // 110px swipe — over the threshold
    onTouchStart(makeTouchStartEvent([{ clientX: 200, clientY: 100 }]));
    onTouchEnd(makeTouchEndEvent([{ clientX: 90, clientY: 100 }]));

    expect(onSwipeLeft).toHaveBeenCalledOnce();
  });

  it("instances have independent state", () => {
    const onSwipeLeft1 = vi.fn();
    const onSwipeLeft2 = vi.fn();
    const swipe1 = useTouchSwipe({ onSwipeLeft: onSwipeLeft1, onSwipeRight: vi.fn() });
    const swipe2 = useTouchSwipe({ onSwipeLeft: onSwipeLeft2, onSwipeRight: vi.fn() });

    // Start a swipe on instance 1
    swipe1.onTouchStart(makeTouchStartEvent([{ clientX: 200, clientY: 100 }]));
    // Start a different swipe on instance 2
    swipe2.onTouchStart(makeTouchStartEvent([{ clientX: 300, clientY: 100 }]));

    // End swipe on instance 1 (should use instance 1's start position)
    swipe1.onTouchEnd(makeTouchEndEvent([{ clientX: 100, clientY: 100 }]));

    expect(onSwipeLeft1).toHaveBeenCalledOnce();
    expect(onSwipeLeft2).not.toHaveBeenCalled();
  });
});
