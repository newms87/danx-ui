/**
 * useToast - Singleton composable for managing toast notifications
 *
 * Provides an imperative API for showing transient messages with
 * deduplication, variant shorthands, and auto-dismiss support.
 * State is module-level (global singleton) so all consumers share
 * the same toast queue.
 *
 * Deduplication: When a toast with matching message + variant + position
 * already exists, its count is incremented and timer reset instead of
 * creating a duplicate.
 *
 * Max visible / queueing: Each bucket (screen position, or target element
 * for anchored toasts) allows at most `maxVisible` toasts at once (default 5,
 * configurable via `setDanxOptions({ toasts: { maxVisible } })`). A new toast
 * that would exceed the bucket's cap is queued FIFO and displayed once an
 * earlier toast in that bucket dismisses — chosen over evict-oldest so a
 * burst of toasts never force-dismisses a message the user hasn't seen yet.
 *
 * Container detection: If toast() is called before a DanxToastContainer
 * is mounted, a dev-mode console warning is logged.
 *
 * @returns Reactive toast list and imperative API
 */

import { ref, type Ref } from "vue";
import type { ToastEntry, ToastOptions, ToastPosition } from "./types";
import type { VariantType } from "../../shared/types";
import { uid } from "../../shared/uid";
import { getDanxOptions } from "../../shared/config";

/** Default values for toast options */
const DEFAULTS = {
  variant: "" as VariantType,
  position: "bottom-right" as ToastPosition,
  duration: 5000,
  dismissible: true,
  targetPlacement: "top" as const,
} as const;

/** Fallback cap per bucket when `toasts.maxVisible` is not configured */
const DEFAULT_MAX_VISIBLE = 5;

/** Module-level singleton state */
const toasts = ref<ToastEntry[]>([]);
const queue = ref<ToastEntry[]>([]);
const containerMounted = ref(false);

function getMaxVisible(): number {
  return getDanxOptions().toasts?.maxVisible ?? DEFAULT_MAX_VISIBLE;
}

/** Bucket key for the max-visible cap: target-anchored toasts bucket per
 *  element (matching the container's per-target regions), screen-anchored
 *  toasts bucket per position. */
function bucketKey(position: ToastPosition, target?: HTMLElement): HTMLElement | ToastPosition {
  return target ?? position;
}

function visibleCountInBucket(key: HTMLElement | ToastPosition): number {
  return toasts.value.filter((t) => bucketKey(t.position, t.target) === key).length;
}

/** Promote the oldest queued entry for this bucket into the visible list, if any. */
function promoteFromQueue(key: HTMLElement | ToastPosition): void {
  const index = queue.value.findIndex((t) => bucketKey(t.position, t.target) === key);
  if (index === -1) return;
  const [entry] = queue.value.splice(index, 1);
  if (entry) toasts.value.push(entry);
}

function generateId(): string {
  return `toast-${uid()}`;
}

/** Find an existing toast that matches for deduplication (visible or queued).
 *  Matches on message + variant + position + target (same element or both undefined). */
function findDuplicate(
  message: string,
  variant: VariantType,
  position: ToastPosition,
  target?: HTMLElement
): ToastEntry | undefined {
  const matches = (t: ToastEntry): boolean =>
    t.message === message &&
    t.variant === variant &&
    t.position === position &&
    t.target === target;
  return toasts.value.find(matches) ?? queue.value.find(matches);
}

/** Callbacks registered by DanxToast instances for timer resets on dedup */
const timerResetCallbacks = new Map<string, () => void>();

export function registerTimerReset(id: string, callback: () => void): void {
  timerResetCallbacks.set(id, callback);
}

export function unregisterTimerReset(id: string): void {
  timerResetCallbacks.delete(id);
}

function toast(message: string, options?: Omit<ToastOptions, "message">): string {
  const variant = options?.variant ?? DEFAULTS.variant;
  const position = options?.position ?? DEFAULTS.position;
  const duration = options?.duration ?? DEFAULTS.duration;
  const dismissible = options?.dismissible ?? DEFAULTS.dismissible;
  const targetPlacement = options?.targetPlacement ?? DEFAULTS.targetPlacement;

  // Dev warning for missing container
  if (!containerMounted.value) {
    console.warn(
      "[DanxToast] toast() was called but no DanxToastContainer is mounted. " +
        "Add <DanxToastContainer /> to your App.vue."
    );
  }

  // Deduplication: increment count and reset timer for matching toasts
  // Targeted toasts match by target element reference (same element = same group)
  const existing = findDuplicate(message, variant, position, options?.target);
  if (existing) {
    existing.count++;
    existing.createdAt = Date.now();
    const resetCallback = timerResetCallbacks.get(existing.id);
    if (resetCallback) resetCallback();
    return existing.id;
  }

  const entry: ToastEntry = {
    id: generateId(),
    message,
    variant,
    position,
    duration,
    dismissible,
    targetPlacement,
    target: options?.target,
    action: options?.action,
    count: 1,
    createdAt: Date.now(),
  };

  const key = bucketKey(entry.position, entry.target);
  if (visibleCountInBucket(key) >= getMaxVisible()) {
    queue.value.push(entry);
  } else {
    toasts.value.push(entry);
  }
  return entry.id;
}

function success(message: string, options?: Omit<ToastOptions, "message" | "variant">): string {
  return toast(message, { ...options, variant: "success" });
}

function danger(message: string, options?: Omit<ToastOptions, "message" | "variant">): string {
  return toast(message, { ...options, variant: "danger" });
}

function warning(message: string, options?: Omit<ToastOptions, "message" | "variant">): string {
  return toast(message, { ...options, variant: "warning" });
}

function info(message: string, options?: Omit<ToastOptions, "message" | "variant">): string {
  return toast(message, { ...options, variant: "info" });
}

function dismiss(id: string): void {
  const index = toasts.value.findIndex((t) => t.id === id);
  if (index !== -1) {
    const [entry] = toasts.value.splice(index, 1);
    timerResetCallbacks.delete(id);
    if (entry) promoteFromQueue(bucketKey(entry.position, entry.target));
    return;
  }

  const queuedIndex = queue.value.findIndex((t) => t.id === id);
  if (queuedIndex !== -1) {
    queue.value.splice(queuedIndex, 1);
  }
}

function dismissAll(): void {
  timerResetCallbacks.clear();
  toasts.value.splice(0, toasts.value.length);
  queue.value.splice(0, queue.value.length);
}

export interface UseToastReturn {
  /** Reactive list of all active (visible) toasts */
  toasts: Ref<ToastEntry[]>;

  /** Reactive list of toasts queued because their bucket is at maxVisible */
  queuedToasts: Ref<ToastEntry[]>;

  /** Add a toast, returns its ID */
  toast: (message: string, options?: Omit<ToastOptions, "message">) => string;

  /** Add a success toast */
  success: (message: string, options?: Omit<ToastOptions, "message" | "variant">) => string;

  /** Add a danger toast */
  danger: (message: string, options?: Omit<ToastOptions, "message" | "variant">) => string;

  /** Add a warning toast */
  warning: (message: string, options?: Omit<ToastOptions, "message" | "variant">) => string;

  /** Add an info toast */
  info: (message: string, options?: Omit<ToastOptions, "message" | "variant">) => string;

  /** Remove a toast by ID */
  dismiss: (id: string) => void;

  /** Remove all toasts */
  dismissAll: () => void;

  /** Whether a DanxToastContainer is mounted (used for dev warnings) */
  containerMounted: Ref<boolean>;
}

export function useToast(): UseToastReturn {
  return {
    toasts,
    queuedToasts: queue,
    toast,
    success,
    danger,
    warning,
    info,
    dismiss,
    dismissAll,
    containerMounted,
  };
}
