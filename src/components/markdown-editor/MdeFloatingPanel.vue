<script setup lang="ts">
/**
 * MdeFloatingPanel - Internal floating panel for markdown editor popovers
 *
 * A positioned floating panel with full-viewport overlay for the markdown editor's
 * coordinate-positioned popovers (ContextMenu, LinkPopover, TablePopover). Not a
 * general-purpose component -- internal to the markdown-editor module.
 *
 * Always visible when mounted (parent controls via v-if). No v-model needed.
 * Uses inheritAttrs: false to forward $attrs to the panel container div.
 *
 * @props
 *   overlay: "transparent" | "standard" - Overlay backdrop variant (default: "standard")
 *   title?: string - Optional header title with close button
 *   confirmLabel?: string - Confirm button text (shows footer when provided)
 *   cancelLabel: string - Cancel button text (default: "Cancel")
 *
 * @emits
 *   cancel - Fired on overlay click, close button, cancel button, or Escape key
 *   confirm - Fired when confirm button is clicked
 *
 * @slots
 *   default - Main content area
 *
 * @tokens
 *   Uses --dx-mde-* tokens directly from markdown-editor-tokens.css
 *
 * @example
 *   <MdeFloatingPanel
 *     v-if="isVisible"
 *     overlay="transparent"
 *     :style="{ top: '100px', left: '200px' }"
 *     @cancel="close"
 *   >
 *     Panel content here
 *   </MdeFloatingPanel>
 */
import { onMounted, onUnmounted } from "vue";
import { XmarkIcon } from "./mde-icons";

export interface MdeFloatingPanelProps {
  overlay?: "transparent" | "standard";
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

const props = withDefaults(defineProps<MdeFloatingPanelProps>(), {
  overlay: "standard",
  title: undefined,
  confirmLabel: undefined,
  cancelLabel: "Cancel",
});

const emit = defineEmits<{
  cancel: [];
  confirm: [];
}>();

defineOptions({ inheritAttrs: false });

function onCancel(): void {
  emit("cancel");
}

function onConfirm(): void {
  emit("confirm");
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    onCancel();
  }
}

onMounted(() => {
  document.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <div
    class="mde-floating-overlay"
    :class="`mde-floating-overlay--${props.overlay}`"
    @click.self="onCancel"
  >
    <div class="mde-floating-panel" v-bind="$attrs">
      <div v-if="title" class="mde-floating-panel__header">
        <h3>{{ title }}</h3>
        <button
          class="mde-floating-panel__close-btn"
          type="button"
          aria-label="Close"
          @click="onCancel"
        >
          <span class="w-4 h-4" v-html="XmarkIcon" />
        </button>
      </div>

      <div class="mde-floating-panel__content">
        <slot />
      </div>

      <div v-if="confirmLabel" class="mde-floating-panel__footer">
        <button type="button" class="mde-floating-panel__btn-cancel" @click="onCancel">
          {{ cancelLabel }}
        </button>
        <button type="button" class="mde-floating-panel__btn-confirm" @click="onConfirm">
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
