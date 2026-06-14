/**
 * FlashMessages — transient user notifications.
 *
 * A thin, static facade over the danx-ui `useToast` singleton, kept as a class
 * with static methods so consumers migrating from quasar-ui-danx keep the same
 * `FlashMessages.success(...)` / `FlashMessages.error(...)` call sites.
 *
 * Per-severity default options come from the ambient config
 * (`setDanxOptions({ flashMessages: { ... } })`) and are read live on each call.
 *
 * Severity → toast variant mapping:
 * - success → "success"
 * - info    → "info"
 * - warning → "warning"
 * - error   → "danger"
 *
 * @example
 *   FlashMessages.success("Saved");
 *   FlashMessages.error("Could not save");
 *   FlashMessages.combine("error", ["Field A is required", "Field B is invalid"]);
 */

import { useToast } from "../components/toast/useToast";
import type { ToastOptions } from "../components/toast/types";
import { danxOptions } from "./config";

const toast = useToast();

/** Severities that map to a `combine` target. */
export type FlashSeverity = "success" | "info" | "warning" | "error";

/** A message entry accepted by `combine` — a raw string or an error-like object. */
export type FlashMessageInput = string | { message?: string; Message?: string };

function resolveMessage(input: FlashMessageInput): string {
  if (typeof input === "string") return input;
  return input.message ?? input.Message ?? "";
}

export class FlashMessages {
  /** Show a neutral message using the configured `default` options. */
  static send(message?: string, options: Partial<ToastOptions> = {}): void {
    if (!message) return;
    toast.toast(message, { ...danxOptions.value.flashMessages?.default, ...options });
  }

  static success(message?: string, options: Partial<ToastOptions> = {}): void {
    if (!message) return;
    toast.toast(message, {
      variant: "success",
      ...options,
      ...danxOptions.value.flashMessages?.success,
    });
  }

  static info(message?: string, options: Partial<ToastOptions> = {}): void {
    if (!message) return;
    toast.toast(message, {
      variant: "info",
      ...options,
      ...danxOptions.value.flashMessages?.info,
    });
  }

  static warning(message?: string, options: Partial<ToastOptions> = {}): void {
    if (!message) return;
    toast.toast(message, {
      variant: "warning",
      ...options,
      ...danxOptions.value.flashMessages?.warning,
    });
  }

  static error(message?: string, options: Partial<ToastOptions> = {}): void {
    if (!message) return;
    toast.toast(message, {
      variant: "danger",
      ...options,
      ...danxOptions.value.flashMessages?.error,
    });
  }

  /**
   * Join multiple messages into a single notification of the given severity.
   * Used to surface validation/error lists as one toast.
   */
  static combine(
    severity: FlashSeverity,
    messages: FlashMessageInput[],
    options: Partial<ToastOptions> = {}
  ): void {
    const text = messages.map(resolveMessage).filter(Boolean).join("\n");
    if (!text) return;
    FlashMessages[severity](text, options);
  }
}
