/**
 * useToastTimer - Per-toast timer with pause-on-hover support
 *
 * Manages an auto-dismiss countdown that can be paused and resumed.
 * Provides a smooth progress value (0 to 1) for animating a progress bar.
 * Cleans up via onScopeDispose when the owning scope is destroyed.
 *
 * @param duration - Ref to the toast duration in milliseconds (0 = no timer)
 * @param onExpire - Callback invoked when the timer reaches the duration
 * @returns pause/resume controls and a reactive progress value
 */

import { computed, onScopeDispose, ref, type Ref, watch } from "vue";

/** Interval frequency for smooth progress updates */
const TICK_INTERVAL = 50;

export interface UseToastTimerReturn {
  /** Pause the countdown (e.g. on mouseenter) */
  pause: () => void;

  /** Resume the countdown (e.g. on mouseleave) */
  resume: () => void;

  /** Progress from 0 (just started) to 1 (expired) */
  progress: Ref<number>;

  /** Reset elapsed time to 0 and restart the timer */
  reset: () => void;
}

export function useToastTimer(duration: Ref<number>, onExpire: () => void): UseToastTimerReturn {
  const elapsed = ref(0);
  const paused = ref(false);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const progress = computed(() => {
    if (duration.value <= 0) return 0;
    return Math.min(elapsed.value / duration.value, 1);
  });

  function startInterval(): void {
    stopInterval();
    if (duration.value <= 0) return;

    intervalId = setInterval(() => {
      if (paused.value) return;
      elapsed.value += TICK_INTERVAL;
      if (elapsed.value >= duration.value) {
        stopInterval();
        onExpire();
      }
    }, TICK_INTERVAL);
  }

  function stopInterval(): void {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function pause(): void {
    paused.value = true;
  }

  function resume(): void {
    paused.value = false;
  }

  function reset(): void {
    elapsed.value = 0;
    paused.value = false;
    startInterval();
  }

  // Start timer when duration is set, stop when it becomes 0
  watch(
    duration,
    (dur) => {
      elapsed.value = 0;
      paused.value = false;
      if (dur > 0) {
        startInterval();
      } else {
        stopInterval();
      }
    },
    { immediate: true, flush: "sync" }
  );

  onScopeDispose(() => {
    stopInterval();
  });

  return { pause, resume, progress, reset };
}
