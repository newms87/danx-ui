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
 * Container detection: If toast() is called before a DanxToastContainer
 * is mounted, a dev-mode console warning is logged.
 *
 * @returns Reactive toast list and imperative API
 */

import { ref, type Ref } from "vue";
import type { ToastEntry, ToastOptions, ToastPosition } from "./types";
import type { VariantType } from "../../shared/types";

/** Default values for toast options */
const DEFAULTS = {
  variant: "" as VariantType,
  position: "bottom-right" as ToastPosition,
  duration: 5000,
  dismissible: true,
  targetPlacement: "top" as const,
} as const;

/** Module-level singleton state */
const toasts = ref<ToastEntry[]>([]);
const containerMounted = ref(false);

/** Simple incrementing counter for unique IDs */
let nextId = 1;

function generateId(): string {
  return `toast-${nextId++}`;
}

/** Find an existing toast that matches for deduplication.
 *  Matches on message + variant + position + target (same element or both undefined). */
function findDuplicate(
  message: string,
  variant: VariantType,
  position: ToastPosition,
  target?: HTMLElement
): ToastEntry | undefined {
  return toasts.value.find(
    (t) =>
      t.message === message &&
      t.variant === variant &&
      t.position === position &&
      t.target === target
  );
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
    count: 1,
    createdAt: Date.now(),
  };

  toasts.value.push(entry);
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
    timerResetCallbacks.delete(toasts.value[index]!.id);
    toasts.value.splice(index, 1);
  }
}

function dismissAll(): void {
  timerResetCallbacks.clear();
  toasts.value.splice(0, toasts.value.length);
}

export interface UseToastReturn {
  /** Reactive list of all active toasts */
  toasts: Ref<ToastEntry[]>;

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
