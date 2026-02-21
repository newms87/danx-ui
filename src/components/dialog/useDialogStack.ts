import { computed, type ComputedRef, type Ref, shallowRef } from "vue";

/**
 * useDialogStack - Singleton composable for managing stacked dialogs
 *
 * When multiple DanxDialogs open while others are already open, they form a navigation
 * stack. Only the top-of-stack dialog is visible; others are hidden (CSS, not unmounted)
 * to preserve scroll position and form state. Breadcrumbs show all stacked dialog titles.
 *
 * This is a module-level singleton: every call to useDialogStack() returns the same
 * shared state. This allows DanxDialog instances and DialogBreadcrumbs to coordinate
 * without prop drilling.
 *
 * @returns Shared stack state and mutation methods
 */

export interface DialogStackEntry {
  /** Unique identifier for this stack entry */
  id: string;
  /** Reactive title getter for breadcrumb display */
  title: () => string;
  /** Callback to close this dialog (sets its modelValue to false) */
  close: () => void;
}

export interface UseDialogStackReturn {
  /** Readonly ref of current stack entries (bottom to top) */
  stack: Ref<readonly DialogStackEntry[]>;
  /** Number of entries currently in the stack */
  stackSize: ComputedRef<number>;
  /** Push a new dialog onto the stack. Returns the generated entry id. */
  register: (title: string | (() => string), closeFn: () => void) => string;
  /** Remove a dialog from the stack. If mid-stack, closes all entries above it first. */
  unregister: (id: string) => void;
  /** Close all entries above the target, making it the active dialog. */
  navigateTo: (id: string) => void;
  /** Returns true if the given id is the topmost (visible) dialog. */
  isTopOfStack: (id: string) => boolean;
  /** Reset the stack (for testing). */
  reset: () => void;
}

let nextId = 0;

/** Module-level singleton state */
const stack = shallowRef<DialogStackEntry[]>([]);

/**
 * Trigger a shallow ref update so Vue detects the change.
 * We replace the array reference since shallowRef only tracks reference identity.
 */
function triggerUpdate() {
  stack.value = [...stack.value];
}

function register(title: string | (() => string), closeFn: () => void): string {
  const id = `dialog-stack-${nextId++}`;
  const titleGetter = typeof title === "string" ? () => title : title;
  stack.value.push({ id, title: titleGetter, close: closeFn });
  triggerUpdate();
  return id;
}

/**
 * Remove entries from the stack at and above `startIndex`, then call their
 * close callbacks. The stack is mutated FIRST to prevent re-entrancy issues:
 * each close callback may trigger a watcher that calls unregister() again,
 * but by then the entry is already gone so the nested call is a no-op.
 */
function closeAbove(startIndex: number): void {
  const removed = stack.value.splice(startIndex).reverse();
  triggerUpdate();
  for (const entry of removed) {
    entry.close();
  }
}

function unregister(id: string): void {
  const index = stack.value.findIndex((entry) => entry.id === id);
  if (index === -1) return;
  closeAbove(index);
}

function navigateTo(id: string): void {
  const index = stack.value.findIndex((entry) => entry.id === id);
  if (index === -1) return;
  closeAbove(index + 1);
}

function isTopOfStack(id: string): boolean {
  const entries = stack.value;
  return entries.length > 0 && entries[entries.length - 1]!.id === id;
}

function reset(): void {
  stack.value = [];
  nextId = 0;
}

const stackSize = computed(() => stack.value.length);

export function useDialogStack(): UseDialogStackReturn {
  return {
    stack: stack as Ref<readonly DialogStackEntry[]>,
    stackSize,
    register,
    unregister,
    navigateTo,
    isTopOfStack,
    reset,
  };
}
