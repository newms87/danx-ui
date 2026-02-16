/**
 * useTooltipInteraction - Manages tooltip open/close behavior
 *
 * Handles three interaction modes (hover, click, focus) and both
 * inline and external trigger binding strategies. Returns isOpen state,
 * inline event handlers for template binding, and panel hover handlers.
 *
 * For hover mode with enterable=true, uses a 200ms close delay to allow
 * users to move their mouse into the tooltip panel. When enterable=false
 * (default), mouseleave closes immediately.
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
  enterable: Ref<boolean>;
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
  const { interaction, enterable, disabled, resolvedTrigger, panelRef, hasExternalTarget } =
    options;
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
    if (interaction.value === "hover" && enterable.value) {
      clearTimeout(hoverTimeout);
    }
  }

  function onPanelMouseleave() {
    if (interaction.value === "hover" && enterable.value) {
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
    if (interaction.value === "hover") {
      if (enterable.value) {
        hideTooltipDelayed();
      } else {
        hideTooltipImmediate();
      }
    }
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

  /** Single mouseleave handler for external targets — reads enterable at call time */
  function onTargetMouseleave() {
    if (enterable.value) {
      hideTooltipDelayed();
    } else {
      hideTooltipImmediate();
    }
  }

  function bindTargetListeners(el: HTMLElement) {
    unbindTargetListeners();
    boundTarget = el;

    if (interaction.value === "hover") {
      el.addEventListener("mouseenter", showTooltip);
      el.addEventListener("mouseleave", onTargetMouseleave);
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
    boundTarget.removeEventListener("mouseleave", onTargetMouseleave);
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

  // Bind after mount — resolvedTrigger may be null during setup when using
  // targetId (getElementById needs the DOM to be rendered first)
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
