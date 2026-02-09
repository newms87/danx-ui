<script setup lang="ts">
/**
 * LinkPopover - Modal for inserting or editing hyperlinks
 *
 * Provides URL and optional label input fields. When editing an existing link,
 * shows the current URL pre-filled and hides the label field. Positions itself
 * near the cursor with viewport boundary detection. Auto-focuses the URL input
 * on mount.
 *
 * @props
 *   position: PopoverPosition - x/y coordinates for positioning
 *   existingUrl?: string - Pre-filled URL when editing an existing link (default: "")
 *   selectedText?: string - Currently selected text to use as label hint (default: "")
 *
 * @emits
 *   submit - Fired with (url: string, label?: string) when the user confirms
 *   cancel - Fired when the user cancels (overlay click, close button, Escape)
 *
 * @tokens
 *   --dx-mde-popover-bg - Popover background (default: #2d2d2d)
 *   --dx-mde-popover-border - Popover border color (default: #404040)
 *
 * @example
 *   <LinkPopover
 *     v-if="showLinkPopover"
 *     :position="{ x: 200, y: 300 }"
 *     existing-url="https://example.com"
 *     @submit="insertLink"
 *     @cancel="closeLinkPopover"
 *   />
 */
import { XmarkIcon } from "./icons";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import type { PopoverPosition } from "./usePopoverManager";

export interface LinkPopoverProps {
  position: PopoverPosition;
  existingUrl?: string;
  selectedText?: string;
}

const props = withDefaults(defineProps<LinkPopoverProps>(), {
  existingUrl: "",
  selectedText: "",
});

const emit = defineEmits<{
  submit: [url: string, label?: string];
  cancel: [];
}>();

// Refs
const popoverRef = ref<HTMLElement | null>(null);
const urlInputRef = ref<HTMLInputElement | null>(null);

// State
const urlValue = ref(props.existingUrl || "");
const labelValue = ref("");

// Computed
const isEditing = computed(() => !!props.existingUrl);

const labelPlaceholder = computed(() => {
  if (props.selectedText) {
    return props.selectedText;
  }
  return "Link text (optional)";
});

// Calculate popover position (below cursor by default, above if at bottom of viewport)
const popoverStyle = computed(() => {
  const popoverHeight = 200; // Approximate height
  const popoverWidth = 320;
  const padding = 10;

  let top = props.position.y + padding;
  let left = props.position.x - popoverWidth / 2;

  // Check if popover would extend below viewport
  if (top + popoverHeight > window.innerHeight - padding) {
    // Position above the cursor
    top = props.position.y - popoverHeight - padding;
  }

  // Ensure popover doesn't go off left edge
  if (left < padding) {
    left = padding;
  }

  // Ensure popover doesn't go off right edge
  if (left + popoverWidth > window.innerWidth - padding) {
    left = window.innerWidth - popoverWidth - padding;
  }

  return {
    top: `${top}px`,
    left: `${left}px`,
  };
});

// Methods
function onSubmit(): void {
  const url = urlValue.value.trim();
  const label = labelValue.value.trim() || undefined;
  emit("submit", url, label);
}

function onCancel(): void {
  emit("cancel");
}

// Handle Escape key at document level
function handleDocumentKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    onCancel();
  }
}

// Auto-focus URL input on mount
onMounted(() => {
  nextTick(() => {
    urlInputRef.value?.focus();
    urlInputRef.value?.select();
  });

  document.addEventListener("keydown", handleDocumentKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleDocumentKeydown);
});

// Watch for existingUrl changes to update the input
watch(
  () => props.existingUrl,
  (newUrl) => {
    urlValue.value = newUrl || "";
  }
);
</script>

<template>
  <div class="dx-link-popover-overlay" @click.self="onCancel" @keydown.escape="onCancel">
    <div ref="popoverRef" class="dx-link-popover" :style="popoverStyle">
      <div class="popover-header">
        <h3>{{ isEditing ? "Edit Link" : "Insert Link" }}</h3>
        <button class="close-btn" type="button" aria-label="Close" @click="onCancel">
          <span class="w-4 h-4" v-html="XmarkIcon" />
        </button>
      </div>

      <div class="popover-content">
        <div class="input-group">
          <label for="link-url">URL</label>
          <input
            id="link-url"
            ref="urlInputRef"
            v-model="urlValue"
            type="text"
            placeholder="https://example.com"
            @keydown.enter.prevent="onSubmit"
            @keydown.escape="onCancel"
          />
        </div>

        <div v-if="!isEditing" class="input-group">
          <label for="link-label">Label</label>
          <input
            id="link-label"
            v-model="labelValue"
            type="text"
            :placeholder="labelPlaceholder"
            @keydown.enter.prevent="onSubmit"
            @keydown.escape="onCancel"
          />
        </div>

        <div v-if="isEditing" class="edit-hint">Enter an empty URL to remove the link.</div>
      </div>

      <div class="popover-footer">
        <button type="button" class="btn-cancel" @click="onCancel">Cancel</button>
        <button type="button" class="btn-insert" @click="onSubmit">
          {{ isEditing ? "Update" : "Insert" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.dx-link-popover-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: var(--dx-mde-overlay-bg);
  backdrop-filter: blur(1px);
}

.dx-link-popover {
  position: fixed;
  background: var(--dx-mde-popover-bg);
  border: 1px solid var(--dx-mde-popover-border);
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px var(--dx-mde-popover-shadow);
  width: 320px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dx-link-popover .popover-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--dx-mde-popover-border);
}

.dx-link-popover .popover-header h3 {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--dx-mde-popover-heading);
}

.dx-link-popover .popover-header .close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0.25rem;
  color: var(--dx-mde-popover-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.dx-link-popover .popover-header .close-btn:hover {
  background: var(--dx-mde-menu-item-hover);
  color: var(--dx-mde-popover-heading);
}

.dx-link-popover .popover-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.dx-link-popover .input-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.dx-link-popover .input-group label {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--dx-mde-popover-muted);
}

.dx-link-popover .input-group input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: var(--dx-mde-input-bg);
  border: 1px solid var(--dx-mde-input-border);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: var(--dx-mde-input-text);
  outline: none;
  transition: border-color 0.15s ease;
}

.dx-link-popover .input-group input::placeholder {
  color: var(--dx-mde-input-placeholder);
}

.dx-link-popover .input-group input:focus {
  border-color: var(--dx-mde-input-border-focus);
}

.dx-link-popover .edit-hint {
  font-size: 0.75rem;
  color: var(--dx-mde-popover-dimmed);
  font-style: italic;
}

.dx-link-popover .popover-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--dx-mde-popover-border);
  background: rgba(0, 0, 0, 0.2);
}

.dx-link-popover .popover-footer button {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dx-link-popover .popover-footer .btn-cancel {
  background: transparent;
  border: 1px solid var(--dx-mde-btn-cancel-border);
  color: var(--dx-mde-btn-cancel-text);
}

.dx-link-popover .popover-footer .btn-cancel:hover {
  background: var(--dx-mde-menu-trigger-bg);
  border-color: var(--dx-mde-btn-cancel-hover-border);
}

.dx-link-popover .popover-footer .btn-insert {
  background: var(--dx-mde-btn-primary-bg);
  border: 1px solid var(--dx-mde-btn-primary-bg);
  color: var(--dx-mde-btn-primary-text);
}

.dx-link-popover .popover-footer .btn-insert:hover {
  background: var(--dx-mde-btn-primary-hover);
  border-color: var(--dx-mde-btn-primary-hover);
}
</style>
