/**
 * useTooltipInteraction - Manages tooltip open/close behavior
 *
 * Handles three interaction modes (hover, click, focus) and both
 * inline and external trigger binding strategies. Returns isOpen state,
 * inline event handlers for template binding, and panel hover handlers.
 *
 * For hover mode, uses a 200ms close delay to allow users to move
 * their mouse from the trigger into the tooltip panel for interaction.
 *
 * For click mode, integrates useClickOutside to close on outside clicks.
 *
 * For external targets (via target prop), imperatively binds/unbinds
 * DOM event listeners based on the interaction mode.
 *
 * @param options - Configuration refs for interaction behavior
 * @returns Event handlers and isOpen state for the component
 */
import { computed, onBeforeUnmount, onMounted, ref, type Ref, watch } from "vue";
import { useClickOutside } from "../popover/useClickOutside";
import type { TooltipInteraction } from "./types";

const HOVER_DELAY = 200;

export interface UseTooltipInteractionOptions {
  interaction: Ref<TooltipInteraction>;
  disabled: Ref<boolean>;
  resolvedTrigger: Ref<HTMLElement | null>;
  panelRef: Ref<HTMLElement | null>;
  hasExternalTarget: Ref<boolean>;
}

export interface UseTooltipInteractionReturn {
  isOpen: Ref<boolean>;
  onInlineMouseenter: () => void;
  onInlineMouseleave: () => void;
  onInlineClick: () => void;
  onInlineFocusin: () => void;
  onInlineFocusout: () => void;
  onPanelMouseenter: () => void;
  onPanelMouseleave: () => void;
}

export function useTooltipInteraction(
  options: UseTooltipInteractionOptions
): UseTooltipInteractionReturn {
  const { interaction, disabled, resolvedTrigger, panelRef, hasExternalTarget } = options;
  const isOpen = ref(false);

  // --- Hover interaction ---
  let hoverTimeout: ReturnType<typeof setTimeout> | undefined;

  function showTooltip() {
    if (disabled.value) return;
    clearTimeout(hoverTimeout);
    isOpen.value = true;
  }

  function hideTooltipDelayed() {
    clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(() => {
      isOpen.value = false;
    }, HOVER_DELAY);
  }

  function hideTooltipImmediate() {
    clearTimeout(hoverTimeout);
    isOpen.value = false;
  }

  function onPanelMouseenter() {
    if (interaction.value === "hover") {
      clearTimeout(hoverTimeout);
    }
  }

  function onPanelMouseleave() {
    if (interaction.value === "hover") {
      hideTooltipImmediate();
    }
  }

  // --- Click interaction ---
  function onTriggerClick() {
    if (disabled.value) return;
    isOpen.value = !isOpen.value;
  }

  useClickOutside(
    computed(() => resolvedTrigger.value),
    panelRef,
    () => {
      isOpen.value = false;
    },
    computed(() => interaction.value === "click" && isOpen.value)
  );

  // --- Focus interaction ---
  function onTriggerFocusin() {
    if (disabled.value) return;
    isOpen.value = true;
  }

  function onTriggerFocusout() {
    isOpen.value = false;
  }

  // --- Inline trigger event bindings ---
  function onInlineMouseenter() {
    if (interaction.value === "hover") showTooltip();
  }

  function onInlineMouseleave() {
    if (interaction.value === "hover") hideTooltipDelayed();
  }

  function onInlineClick() {
    if (interaction.value === "click") onTriggerClick();
  }

  function onInlineFocusin() {
    if (interaction.value === "focus") onTriggerFocusin();
  }

  function onInlineFocusout() {
    if (interaction.value === "focus") onTriggerFocusout();
  }

  // --- External target event binding (imperative) ---
  let boundTarget: HTMLElement | null = null;

  function bindTargetListeners(el: HTMLElement) {
    unbindTargetListeners();
    boundTarget = el;

    if (interaction.value === "hover") {
      el.addEventListener("mouseenter", showTooltip);
      el.addEventListener("mouseleave", hideTooltipDelayed);
    } else if (interaction.value === "click") {
      el.addEventListener("click", onTriggerClick);
    } else if (interaction.value === "focus") {
      el.addEventListener("focusin", onTriggerFocusin);
      el.addEventListener("focusout", onTriggerFocusout);
    }
  }

  function unbindTargetListeners() {
    if (!boundTarget) return;
    boundTarget.removeEventListener("mouseenter", showTooltip);
    boundTarget.removeEventListener("mouseleave", hideTooltipDelayed);
    boundTarget.removeEventListener("click", onTriggerClick);
    boundTarget.removeEventListener("focusin", onTriggerFocusin);
    boundTarget.removeEventListener("focusout", onTriggerFocusout);
    boundTarget = null;
  }

  watch(
    resolvedTrigger,
    (el) => {
      if (hasExternalTarget.value && el) {
        bindTargetListeners(el);
      } else {
        unbindTargetListeners();
      }
    },
    { immediate: true }
  );

  onMounted(() => {
    if (hasExternalTarget.value) {
      const el = resolvedTrigger.value;
      if (el) bindTargetListeners(el);
    }
  });

  onBeforeUnmount(() => {
    clearTimeout(hoverTimeout);
    unbindTargetListeners();
  });

  return {
    isOpen,
    onInlineMouseenter,
    onInlineMouseleave,
    onInlineClick,
    onInlineFocusin,
    onInlineFocusout,
    onPanelMouseenter,
    onPanelMouseleave,
  };
}
