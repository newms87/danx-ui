<template>
  <div
    class="dx-link-popover-overlay"
    @click.self="onCancel"
    @keydown.escape="onCancel"
  >
    <div
      ref="popoverRef"
      class="dx-link-popover"
      :style="popoverStyle"
    >
      <div class="popover-header">
        <h3>{{ isEditing ? 'Edit Link' : 'Insert Link' }}</h3>
        <button
          class="close-btn"
          type="button"
          aria-label="Close"
          @click="onCancel"
        >
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
          >
        </div>

        <div
          v-if="!isEditing"
          class="input-group"
        >
          <label for="link-label">Label</label>
          <input
            id="link-label"
            v-model="labelValue"
            type="text"
            :placeholder="labelPlaceholder"
            @keydown.enter.prevent="onSubmit"
            @keydown.escape="onCancel"
          >
        </div>

        <div
          v-if="isEditing"
          class="edit-hint"
        >
          Enter an empty URL to remove the link.
        </div>
      </div>

      <div class="popover-footer">
        <button
          type="button"
          class="btn-cancel"
          @click="onCancel"
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn-insert"
          @click="onSubmit"
        >
          {{ isEditing ? 'Update' : 'Insert' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
  selectedText: ""
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
  let left = props.position.x - (popoverWidth / 2);

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
    left: `${left}px`
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
watch(() => props.existingUrl, (newUrl) => {
  urlValue.value = newUrl || "";
});
</script>

<style>
.dx-link-popover-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(1px);
}

.dx-link-popover {
  position: fixed;
  background: #2d2d2d;
  border: 1px solid #404040;
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
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
  border-bottom: 1px solid #404040;
}

.dx-link-popover .popover-header h3 {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #f3f4f6;
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
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dx-link-popover .popover-header .close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f3f4f6;
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
  color: #9ca3af;
}

.dx-link-popover .input-group input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: #1e1e1e;
  border: 1px solid #404040;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #f3f4f6;
  outline: none;
  transition: border-color 0.15s ease;
}

.dx-link-popover .input-group input::placeholder {
  color: #6b7280;
}

.dx-link-popover .input-group input:focus {
  border-color: #60a5fa;
}

.dx-link-popover .edit-hint {
  font-size: 0.75rem;
  color: #6b7280;
  font-style: italic;
}

.dx-link-popover .popover-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid #404040;
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
  border: 1px solid #404040;
  color: #d4d4d4;
}

.dx-link-popover .popover-footer .btn-cancel:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: #525252;
}

.dx-link-popover .popover-footer .btn-insert {
  background: #3b82f6;
  border: 1px solid #3b82f6;
  color: #ffffff;
}

.dx-link-popover .popover-footer .btn-insert:hover {
  background: #2563eb;
  border-color: #2563eb;
}
</style>
