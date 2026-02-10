<script setup lang="ts">
/**
 * DanxPopover - Shared popover wrapper for markdown-editor modals
 *
 * Renders an overlay, container, optional header (title + close button),
 * content slot, and optional footer (cancel + confirm buttons). Handles
 * Escape key via useEscapeKey. Consumer attrs (class, style) are forwarded
 * to the container element, not the overlay.
 *
 * @props
 *   title?: string - Renders header with h3 + close button when provided
 *   overlay?: "standard" | "transparent" | "centered" - Overlay variant (default: "standard")
 *   confirmLabel?: string - Renders footer with cancel + confirm buttons when provided
 *   cancelLabel?: string - Cancel button text (default: "Cancel")
 *
 * @emits
 *   cancel - Fired on overlay click, close button, cancel button, or Escape key
 *   confirm - Fired on confirm button click
 *
 * @slots
 *   default - Content inside .popover-content
 *
 * @tokens
 *   Inherits all tokens from popover-base.css (.dx-mde-popover, .dx-popover-overlay)
 *
 * @example
 *   <DanxPopover
 *     title="Insert Table"
 *     confirm-label="Insert"
 *     class="dx-table-popover"
 *     :style="popoverStyle"
 *     @cancel="onCancel"
 *     @confirm="onSubmit"
 *   >
 *     <div>Popover content here</div>
 *   </DanxPopover>
 */
import { onMounted, ref } from "vue";
import { XmarkIcon } from "./icons";
import { useEscapeKey } from "./useEscapeKey";

export type PopoverOverlay = "standard" | "transparent" | "centered";

export interface DanxPopoverProps {
  title?: string;
  overlay?: PopoverOverlay;
  confirmLabel?: string;
  cancelLabel?: string;
}

withDefaults(defineProps<DanxPopoverProps>(), {
  title: undefined,
  overlay: "standard",
  confirmLabel: undefined,
  cancelLabel: "Cancel",
});

const emit = defineEmits<{
  cancel: [];
  confirm: [];
}>();

defineOptions({ inheritAttrs: false });

const overlayRef = ref<HTMLElement | null>(null);

function onCancel(): void {
  emit("cancel");
}

useEscapeKey(onCancel);

onMounted(() => {
  // Centered overlays need focus for keyboard events
  overlayRef.value?.focus();
});
</script>

<template>
  <div
    ref="overlayRef"
    class="dx-popover-overlay"
    :class="`dx-popover-overlay--${overlay}`"
    :tabindex="overlay === 'centered' ? -1 : undefined"
    @click.self="onCancel"
  >
    <div class="dx-mde-popover" v-bind="$attrs">
      <div v-if="title" class="popover-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" type="button" aria-label="Close" @click="onCancel">
          <span class="w-4 h-4" v-html="XmarkIcon" />
        </button>
      </div>

      <div class="popover-content">
        <slot />
      </div>

      <div v-if="confirmLabel" class="popover-footer">
        <button type="button" class="btn-cancel" @click="onCancel">{{ cancelLabel }}</button>
        <button type="button" class="btn-insert" @click="$emit('confirm')">
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
