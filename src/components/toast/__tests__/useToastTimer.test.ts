import { effectScope, ref } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useToastTimer } from "../useToastTimer";
import type { UseToastTimerReturn } from "../useToastTimer";

describe("useToastTimer", () => {
  let scope: ReturnType<typeof effectScope>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    scope = effectScope();
  });

  afterEach(() => {
    scope.stop();
    vi.useRealTimers();
  });

  function createTimer(
    duration: number,
    onExpire = vi.fn()
  ): UseToastTimerReturn & { onExpire: ReturnType<typeof vi.fn> } {
    let result!: UseToastTimerReturn;
    scope.run(() => {
      result = useToastTimer(ref(duration), onExpire);
    });
    return { ...result, onExpire };
  }

  it("starts with progress at 0", () => {
    const { progress } = createTimer(5000);
    expect(progress.value).toBe(0);
  });

  it("advances progress over time", () => {
    const { progress } = createTimer(1000);
    vi.advanceTimersByTime(500);
    expect(progress.value).toBeCloseTo(0.5, 1);
  });

  it("calls onExpire when duration elapses", () => {
    const { onExpire } = createTimer(1000);
    vi.advanceTimersByTime(1000);
    expect(onExpire).toHaveBeenCalledOnce();
  });

  it("caps progress at 1", () => {
    const { progress } = createTimer(1000);
    vi.advanceTimersByTime(2000);
    expect(progress.value).toBe(1);
  });

  it("does not start timer when duration is 0", () => {
    const { progress, onExpire } = createTimer(0);
    vi.advanceTimersByTime(10000);
    expect(progress.value).toBe(0);
    expect(onExpire).not.toHaveBeenCalled();
  });

  it("pauses the countdown", () => {
    const { pause, progress } = createTimer(1000);
    vi.advanceTimersByTime(300);
    pause();
    vi.advanceTimersByTime(500);
    // Progress should not have advanced beyond where it was at pause
    expect(progress.value).toBeCloseTo(0.3, 1);
  });

  it("resumes the countdown after pause", () => {
    const { pause, resume, onExpire } = createTimer(1000);
    vi.advanceTimersByTime(300);
    pause();
    vi.advanceTimersByTime(5000);
    resume();
    vi.advanceTimersByTime(700);
    expect(onExpire).toHaveBeenCalledOnce();
  });

  it("resets elapsed to 0 and restarts", () => {
    const { reset, progress, onExpire } = createTimer(1000);
    vi.advanceTimersByTime(800);
    expect(progress.value).toBeCloseTo(0.8, 1);
    reset();
    expect(progress.value).toBe(0);
    vi.advanceTimersByTime(500);
    expect(progress.value).toBeCloseTo(0.5, 1);
    expect(onExpire).not.toHaveBeenCalled();
    vi.advanceTimersByTime(500);
    expect(onExpire).toHaveBeenCalledOnce();
  });

  it("cleans up interval on scope dispose", () => {
    const onExpire = vi.fn();
    scope.run(() => {
      useToastTimer(ref(1000), onExpire);
    });
    scope.stop();
    vi.advanceTimersByTime(5000);
    expect(onExpire).not.toHaveBeenCalled();
  });

  it("restarts timer when duration ref changes", () => {
    const duration = ref(1000);
    const onExpire = vi.fn();
    let result!: UseToastTimerReturn;
    scope.run(() => {
      result = useToastTimer(duration, onExpire);
    });

    vi.advanceTimersByTime(500);
    expect(result.progress.value).toBeCloseTo(0.5, 1);

    // Change duration — should reset elapsed and restart
    duration.value = 2000;
    expect(result.progress.value).toBe(0);

    vi.advanceTimersByTime(2000);
    expect(onExpire).toHaveBeenCalledOnce();
  });

  it("reset does not start interval when duration is 0", () => {
    const { reset, progress, onExpire } = createTimer(0);
    reset();
    vi.advanceTimersByTime(5000);
    expect(progress.value).toBe(0);
    expect(onExpire).not.toHaveBeenCalled();
  });

  it("stops timer when duration changes to 0", () => {
    const duration = ref(1000);
    const onExpire = vi.fn();
    scope.run(() => {
      useToastTimer(duration, onExpire);
    });

    vi.advanceTimersByTime(300);
    duration.value = 0;
    vi.advanceTimersByTime(5000);
    expect(onExpire).not.toHaveBeenCalled();
  });
});
