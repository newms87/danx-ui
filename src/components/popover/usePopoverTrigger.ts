/**
 * usePopoverTrigger - Manages automatic open/close behavior for popover trigger modes
 *
 * Programmatically attaches and detaches DOM event listeners on the trigger and
 * panel elements based on the active trigger mode. Supports three modes:
 *
 * - "manual": No listeners (parent manages v-model directly)
 * - "click": Toggles on click of the trigger element
 * - "hover": mouseenter/mouseleave with configurable close delay
 * - "focus": focusin/focusout with relatedTarget tracking
 *
 * The composable watches the mode ref and tears down old listeners before setting
 * up new ones when the mode changes. Panel listeners are managed dynamically via
 * a watcher on panelRef since the panel is conditionally rendered with v-if.
 *
 * @param triggerRef - Ref to the trigger wrapper element
 * @param panelRef - Ref to the panel element (null when panel is hidden via v-if)
 * @param isOpen - defineModel ref controlling popover visibility
 * @param trigger - Ref to the active trigger mode
 * @param hoverDelay - Ref to the close delay in ms for hover mode
 */
import { type Ref, watch, onScopeDispose } from "vue";
import type { PopoverTrigger } from "./types";

/** Check if a node is contained within any of the provided elements */
function isInsideElements(node: Node | null, ...elements: (HTMLElement | null)[]): boolean {
  if (!node) return false;
  return elements.some((el) => el?.contains(node));
}

interface EventPair {
  open: string;
  close: string;
  openHandler: EventListener;
  closeHandler: EventListener;
}

/**
 * Sets up event listeners on the trigger element and dynamically on the panel
 * (which may mount/unmount via v-if). Returns a cleanup function that tears
 * down all listeners and stops the panel watcher.
 */
function setupListeners(
  triggerRef: Ref<HTMLElement | null>,
  panelRef: Ref<HTMLElement | null>,
  triggerEvents: EventPair,
  panelEvents: EventPair,
  extraCleanup?: () => void
): () => void {
  const el = triggerRef.value;
  if (!el) return () => {};

  el.addEventListener(triggerEvents.open, triggerEvents.openHandler);
  el.addEventListener(triggerEvents.close, triggerEvents.closeHandler);

  const stopPanelWatch = watch(
    panelRef,
    (panel, oldPanel) => {
      if (oldPanel) {
        oldPanel.removeEventListener(panelEvents.open, panelEvents.openHandler);
        oldPanel.removeEventListener(panelEvents.close, panelEvents.closeHandler);
      }
      if (panel) {
        panel.addEventListener(panelEvents.open, panelEvents.openHandler);
        panel.addEventListener(panelEvents.close, panelEvents.closeHandler);
      }
    },
    { immediate: true, flush: "post" }
  );

  return () => {
    extraCleanup?.();
    el.removeEventListener(triggerEvents.open, triggerEvents.openHandler);
    el.removeEventListener(triggerEvents.close, triggerEvents.closeHandler);
    stopPanelWatch();
    const panel = panelRef.value;
    if (panel) {
      panel.removeEventListener(panelEvents.open, panelEvents.openHandler);
      panel.removeEventListener(panelEvents.close, panelEvents.closeHandler);
    }
  };
}

export function usePopoverTrigger(
  triggerRef: Ref<HTMLElement | null>,
  panelRef: Ref<HTMLElement | null>,
  isOpen: Ref<boolean>,
  trigger: Ref<PopoverTrigger>,
  hoverDelay: Ref<number>
): void {
  let closeTimer: ReturnType<typeof setTimeout> | undefined;
  let cleanupFn: (() => void) | null = null;
  let disposed = false;

  function clearCloseTimer(): void {
    if (closeTimer !== undefined) {
      clearTimeout(closeTimer);
      closeTimer = undefined;
    }
  }

  function startCloseTimer(): void {
    clearCloseTimer();
    closeTimer = setTimeout(() => {
      isOpen.value = false;
    }, hoverDelay.value);
  }

  // --- Click mode ---

  function setupClick(): () => void {
    const el = triggerRef.value;
    if (!el) return () => {};

    function onClick(): void {
      isOpen.value = !isOpen.value;
    }

    el.addEventListener("click", onClick);

    return () => {
      el.removeEventListener("click", onClick);
    };
  }

  // --- Hover mode ---

  function setupHover(): () => void {
    return setupListeners(
      triggerRef,
      panelRef,
      {
        open: "mouseenter",
        close: "mouseleave",
        openHandler: () => {
          clearCloseTimer();
          isOpen.value = true;
        },
        closeHandler: () => startCloseTimer(),
      },
      {
        open: "mouseenter",
        close: "mouseleave",
        openHandler: () => clearCloseTimer(),
        closeHandler: () => startCloseTimer(),
      },
      clearCloseTimer
    );
  }

  // --- Focus mode ---

  function onFocusIn(): void {
    isOpen.value = true;
  }

  function onFocusOut(event: FocusEvent): void {
    Promise.resolve().then(() => {
      if (disposed) return;
      const related = event.relatedTarget as Node | null;
      if (isInsideElements(related, triggerRef.value, panelRef.value)) return;
      isOpen.value = false;
    });
  }

  function setupFocus(): () => void {
    return setupListeners(
      triggerRef,
      panelRef,
      {
        open: "focusin",
        close: "focusout",
        openHandler: onFocusIn as EventListener,
        closeHandler: onFocusOut as EventListener,
      },
      {
        open: "focusin",
        close: "focusout",
        openHandler: onFocusIn as EventListener,
        closeHandler: onFocusOut as EventListener,
      }
    );
  }

  // --- Mode switching ---

  function setup(): void {
    if (cleanupFn) {
      cleanupFn();
      cleanupFn = null;
    }

    const mode = trigger.value;
    if (mode === "click") {
      cleanupFn = setupClick();
    } else if (mode === "hover") {
      cleanupFn = setupHover();
    } else if (mode === "focus") {
      cleanupFn = setupFocus();
    }
    // "manual" — no listeners
  }

  // Re-setup when trigger mode or triggerRef changes
  watch([trigger, triggerRef], setup, { immediate: true, flush: "post" });

  onScopeDispose(() => {
    disposed = true;
    if (cleanupFn) {
      cleanupFn();
      cleanupFn = null;
    }
    clearCloseTimer();
  });
}
