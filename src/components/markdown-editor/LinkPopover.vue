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
import { computed, nextTick, onMounted, ref, watch } from "vue";
import MdeFloatingPanel from "./MdeFloatingPanel.vue";
import type { PopoverPosition } from "./usePopoverManager";
import { calculatePopoverPosition } from "./popoverUtils";
import { isSafeUrl } from "../../shared/isSafeUrl";

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
const urlInputRef = ref<HTMLInputElement | null>(null);

// State
const urlValue = ref(props.existingUrl || "");
const labelValue = ref("");
const validationError = ref("");

// Computed
const isEditing = computed(() => !!props.existingUrl);

const labelPlaceholder = computed(() => {
  if (props.selectedText) {
    return props.selectedText;
  }
  return "Link text (optional)";
});

const popoverStyle = computed(() => {
  const result = calculatePopoverPosition({
    anchorX: props.position.x,
    anchorY: props.position.y,
    popoverWidth: 320,
    popoverHeight: 200,
    centerOnAnchor: true,
  });
  return { top: result.top, left: result.left };
});

// Methods
function onSubmit(): void {
  const url = urlValue.value.trim();

  // DXUI-72: validate URL scheme before submission
  if (url && !isSafeUrl(url)) {
    validationError.value = "Invalid URL scheme. Allowed: http, https, mailto, tel, ftp, ftps, relative URLs, or fragments.";
    return;
  }

  validationError.value = "";
  const label = labelValue.value.trim() || undefined;
  emit("submit", url, label);
}

function onCancel(): void {
  emit("cancel");
}

// Auto-focus URL input on mount
onMounted(() => {
  nextTick(() => {
    urlInputRef.value?.focus();
    urlInputRef.value?.select();
  });
});

// Watch for existingUrl changes to update the input
watch(
  () => props.existingUrl,
  (newUrl) => {
    urlValue.value = newUrl || "";
  }
);

// Clear validation error when user types
watch(urlValue, () => {
  validationError.value = "";
});
</script>

<template>
  <MdeFloatingPanel
    :title="isEditing ? 'Edit Link' : 'Insert Link'"
    :confirm-label="isEditing ? 'Update' : 'Insert'"
    class="dx-link-popover"
    :style="popoverStyle"
    @cancel="onCancel"
    @confirm="onSubmit"
  >
    <div class="input-group">
      <label for="link-url">URL</label>
      <input
        id="link-url"
        ref="urlInputRef"
        v-model="urlValue"
        type="text"
        placeholder="https://example.com"
        @keydown.enter.prevent="onSubmit"
      />
      <div v-if="validationError" class="validation-error">{{ validationError }}</div>
    </div>

    <div v-if="!isEditing" class="input-group">
      <label for="link-label">Label</label>
      <input
        id="link-label"
        v-model="labelValue"
        type="text"
        :placeholder="labelPlaceholder"
        @keydown.enter.prevent="onSubmit"
      />
    </div>

    <div v-if="isEditing" class="edit-hint">Enter an empty URL to remove the link.</div>
  </MdeFloatingPanel>
</template>

<style scoped>
.validation-error {
  color: #ff6b6b;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1.4;
}
</style>
