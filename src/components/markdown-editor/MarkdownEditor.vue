<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useContextMenu } from "./useContextMenu";
import { useFocusTracking } from "./useFocusTracking";
import { useLineTypeMenu } from "./useLineTypeMenu";
import { useLinkPopover, useTablePopover } from "./usePopoverManager";
import { useMarkdownEditor } from "./useMarkdownEditor";
import { TokenRenderer } from "./types";
import ContextMenu from "./ContextMenu.vue";
import HotkeyHelpPopover from "./HotkeyHelpPopover.vue";
import LineTypeMenu from "./LineTypeMenu.vue";
import LinkPopover from "./LinkPopover.vue";
import MarkdownEditorContent from "./MarkdownEditorContent.vue";
import MarkdownEditorFooter from "./MarkdownEditorFooter.vue";
import TablePopover from "./TablePopover.vue";

export interface MarkdownEditorProps {
  modelValue?: string;
  placeholder?: string;
  readonly?: boolean;
  minHeight?: string;
  maxHeight?: string;
  theme?: "dark" | "light";
  hideFooter?: boolean;
  /** Custom token renderers for inline tokens like {{123}} */
  tokenRenderers?: TokenRenderer[];
  configureApp?: (app: import("vue").App) => void;
}

const props = withDefaults(defineProps<MarkdownEditorProps>(), {
  modelValue: "",
  placeholder: "Start typing...",
  readonly: false,
  minHeight: "100px",
  maxHeight: "none",
  theme: "dark",
  hideFooter: false,
  tokenRenderers: () => [],
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

// Reference to the content component
const contentRef = ref<InstanceType<typeof MarkdownEditorContent> | null>(null);

// Reference to the menu container for focus handling
const menuContainerRef = ref<HTMLElement | null>(null);

// Get the actual HTMLElement from the content component
const contentElementRef = computed(() => contentRef.value?.containerRef || null);

// Initialize popover managers
const linkPopover = useLinkPopover();
const tablePopover = useTablePopover();

// Initialize the markdown editor composable
const editor = useMarkdownEditor({
  contentRef: contentElementRef,
  initialValue: props.modelValue,
  onEmitValue: (markdown: string) => {
    emit("update:modelValue", markdown);
  },
  onShowLinkPopover: linkPopover.show,
  onShowTablePopover: tablePopover.show,
  tokenRenderers: props.tokenRenderers,
});

// Initialize focus tracking
const focusTracking = useFocusTracking({
  contentRef: contentElementRef,
  menuContainerRef,
  onSelectionChange: () => lineTypeMenu.updatePositionAndState(),
});

// Initialize line type menu
const lineTypeMenu = useLineTypeMenu({
  contentRef: contentElementRef,
  editor,
  isEditorFocused: focusTracking.isEditorFocused,
});

// Initialize context menu
const contextMenu = useContextMenu({
  editor,
  readonly: computed(() => props.readonly),
});

// Setup line type menu listeners on mount
onMounted(() => {
  lineTypeMenu.setupListeners();
});

// Cleanup line type menu listeners on unmount
onUnmounted(() => {
  lineTypeMenu.cleanupListeners();
});

// Watch for external value changes
watch(
  () => props.modelValue,
  (newValue) => {
    // Skip if this change originated from the editor itself (internal update)
    // This prevents cursor jumping when the watch triggers after typing
    if (editor.isInternalUpdate.value) {
      editor.isInternalUpdate.value = false;
      return;
    }

    // Only update if the value is different from current
    if (newValue !== undefined) {
      editor.setMarkdown(newValue);
    }
  }
);

// NOTE: Content is already initialized in useMarkdownEditor with initialValue.
// The v-html binding renders it, and the MutationObserver mounts CodeViewers.
// Calling setMarkdown again here would replace the DOM and cause race conditions
// with CodeViewer mounting. Only call setMarkdown for external value changes.

// Expose the editor for parent components that may need access
defineExpose({
  editor,
  setMarkdown: editor.setMarkdown,
});
</script>

<template>
  <div
    class="dx-markdown-editor"
    :class="[{ 'is-readonly': readonly }, props.theme === 'light' ? 'theme-light' : '']"
  >
    <div class="dx-markdown-editor-body" @contextmenu="contextMenu.show">
      <!-- Floating line type menu positioned next to current block -->
      <div
        ref="menuContainerRef"
        class="dx-line-type-menu-container"
        :style="lineTypeMenu.menuStyle.value"
      >
        <LineTypeMenu
          :current-type="lineTypeMenu.currentLineType.value"
          @change="lineTypeMenu.onLineTypeChange"
        />
      </div>

      <MarkdownEditorContent
        ref="contentRef"
        :html="editor.renderedHtml.value"
        :readonly="readonly"
        :placeholder="placeholder"
        @input="editor.onInput"
        @keydown="editor.onKeyDown"
        @blur="editor.onBlur"
      />

      <!-- Badge slot for overlaying content (share button, etc.) -->
      <div v-if="$slots.badge" class="dx-editor-badge">
        <slot name="badge" />
      </div>
    </div>

    <MarkdownEditorFooter
      v-if="!hideFooter"
      :char-count="editor.charCount.value"
      @show-hotkeys="editor.showHotkeyHelp"
    />

    <HotkeyHelpPopover
      v-if="editor.isShowingHotkeyHelp.value"
      :hotkeys="editor.hotkeyDefinitions.value"
      @close="editor.hideHotkeyHelp"
    />

    <LinkPopover
      v-if="linkPopover.isVisible.value"
      :position="linkPopover.position.value"
      :existing-url="linkPopover.existingUrl.value"
      :selected-text="linkPopover.selectedText.value"
      @submit="linkPopover.submit"
      @cancel="linkPopover.cancel"
    />

    <TablePopover
      v-if="tablePopover.isVisible.value"
      :position="tablePopover.position.value"
      @submit="tablePopover.submit"
      @cancel="tablePopover.cancel"
    />

    <ContextMenu
      v-if="contextMenu.isVisible.value"
      :position="contextMenu.position.value"
      :items="contextMenu.items.value"
      @close="contextMenu.hide"
    />
  </div>
</template>

<style>
.dx-markdown-editor {
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: 0.375rem;
  overflow: hidden;
}

.dx-markdown-editor.is-readonly .dx-markdown-editor-content {
  cursor: default;
}

.dx-markdown-editor.is-readonly .dx-line-type-menu-container {
  display: none;
}

/* Body container with floating menu and content side by side */
.dx-markdown-editor .dx-markdown-editor-body {
  display: flex;
  position: relative;
  flex: 1;
  overflow: visible;
}

/* Floating line type menu container - positioned outside editor bounds */
.dx-markdown-editor .dx-line-type-menu-container {
  position: absolute;
  left: -1.75rem;
  z-index: 10;
  width: 1.75rem;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 0.25rem;
  transition:
    top 0.1s ease-out,
    opacity 0.15s ease;
}

/* Apply min/max height to content area (no left margin needed - menu is outside) */
.dx-markdown-editor .dx-markdown-editor-content {
  flex: 1;
  min-height: v-bind(minHeight);
  max-height: v-bind(maxHeight);
}

/* Badge slot positioned at top-right of editor body */
.dx-markdown-editor .dx-editor-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 10;
}
</style>
