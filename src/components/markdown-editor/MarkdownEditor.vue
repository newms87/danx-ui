<script setup lang="ts">
/**
 * MarkdownEditor - Rich markdown editing component with live preview
 *
 * A full-featured contenteditable markdown editor that renders markdown as styled HTML
 * in real-time. Supports headings, lists, inline formatting, code blocks (with syntax
 * highlighting via CodeViewer), tables, links, blockquotes, horizontal rules, and custom
 * token renderers. Includes a context menu, hotkey help popover, link/table insert
 * popovers, and a raw markdown toggle to view unformatted source text.
 *
 * @props
 *   modelValue: string - The markdown content (use v-model, default: "")
 *   placeholder?: string - Placeholder text when empty (default: "Start typing...")
 *   readonly?: boolean - Disables editing (default: false)
 *   hideFooter?: boolean - Hides the character count footer (default: false)
 *   tokenRenderers?: TokenRenderer[] - Custom inline token renderers (default: [])
 *   debounceMs?: number - Debounce delay (ms) for v-model emit while editing (default: 300, 0 for immediate)
 *
 * @emits
 *   update:modelValue - Emitted when editor content changes (via defineModel)
 *
 * @slots
 *   badge - Overlay content positioned at top-right of editor (e.g., share button)
 *   footer - Extra content in the footer bar between char count and hotkey button
 *
 * @tokens
 *   --dx-mde-min-height - Override minimum height (default: 100px)
 *   --dx-mde-max-height - Override maximum height (default: none)
 *
 * @example
 *   <MarkdownEditor v-model="markdown" placeholder="Write something..." />
 *
 * @example
 *   <MarkdownEditor v-model="content" class="theme-light" :hide-footer="true">
 *     <template #badge><ShareButton /></template>
 *   </MarkdownEditor>
 */
import { computed, ref, watch } from "vue";
import { useContextMenu } from "./useContextMenu";
import { useFocusTracking } from "./useFocusTracking";
import { useLinkPopover, useTablePopover } from "./usePopoverManager";
import { useMarkdownEditor } from "./useMarkdownEditor";
import { TokenRenderer } from "./types";
import { DanxScroll } from "../scroll";
import DanxContextMenu from "../context-menu/DanxContextMenu.vue";
import HotkeyHelpPopover from "./HotkeyHelpPopover.vue";
import LinkPopover from "./LinkPopover.vue";
import MarkdownEditorContent from "./MarkdownEditorContent.vue";
import MarkdownEditorFooter from "./MarkdownEditorFooter.vue";
import TablePopover from "./TablePopover.vue";

export interface MarkdownEditorProps {
  placeholder?: string;
  readonly?: boolean;
  hideFooter?: boolean;
  /** Custom token renderers for inline tokens like {{123}} */
  tokenRenderers?: TokenRenderer[];
  /** Debounce delay (ms) for v-model emit while editing (default: 300, 0 for immediate) */
  debounceMs?: number;
}

const props = withDefaults(defineProps<MarkdownEditorProps>(), {
  placeholder: "Start typing...",
  readonly: false,
  hideFooter: false,
  tokenRenderers: () => [],
  debounceMs: 300,
});

const modelValue = defineModel<string>({ default: "" });

// Raw mode toggle: show unformatted markdown source text
const isRawMode = ref(false);

function toggleRawMode() {
  isRawMode.value = !isRawMode.value;
}

// Reference to the contenteditable DOM element (received via container-mounted emit)
const contentElementRef = ref<HTMLElement | null>(null);

// Initialize popover managers
const linkPopover = useLinkPopover();
const tablePopover = useTablePopover();

// Initialize the markdown editor composable
const editor = useMarkdownEditor({
  contentRef: contentElementRef,
  initialValue: modelValue.value,
  debounceMs: props.debounceMs,
  onEmitValue: (markdown: string) => {
    modelValue.value = markdown;
  },
  onShowLinkPopover: linkPopover.show,
  onShowTablePopover: tablePopover.show,
  tokenRenderers: props.tokenRenderers,
  readonly: props.readonly,
});

// Initialize focus tracking
useFocusTracking({ contentRef: contentElementRef });

// Initialize context menu
const contextMenu = useContextMenu({
  editor,
  readonly: computed(() => props.readonly),
});

// Watch for external value changes
watch(modelValue, (newValue) => {
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
});

// NOTE: Content is already initialized in useMarkdownEditor with initialValue.
// The v-html binding renders it, and the MutationObserver mounts CodeViewers.
// Calling setMarkdown again here would replace the DOM and cause race conditions
// with CodeViewer mounting. Only call setMarkdown for external value changes.
</script>

<template>
  <div class="dx-markdown-editor" :class="{ 'is-readonly': readonly }">
    <div class="dx-markdown-editor-body" @contextmenu="contextMenu.show">
      <DanxScroll class="dx-markdown-editor-scroll" size="sm">
        <pre v-if="isRawMode" class="dx-markdown-editor-raw">{{ modelValue }}</pre>
        <MarkdownEditorContent
          v-else
          :html="editor.renderedHtml.value"
          :readonly="readonly"
          :placeholder="placeholder"
          @input="editor.onInput"
          @keydown="editor.onKeyDown"
          @blur="editor.onBlur"
          @container-mounted="(el: HTMLElement) => (contentElementRef = el)"
        />
      </DanxScroll>

      <!-- Badge slot for overlaying content (share button, etc.) -->
      <div v-if="$slots.badge" class="dx-editor-badge">
        <slot name="badge" />
      </div>
    </div>

    <MarkdownEditorFooter
      v-if="!hideFooter"
      :char-count="editor.charCount.value"
      :is-raw-mode="isRawMode"
      @show-hotkeys="editor.showHotkeyHelp"
      @toggle-raw="toggleRawMode"
    >
      <slot name="footer" />
    </MarkdownEditorFooter>

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

    <DanxContextMenu
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

  &.is-readonly .dx-markdown-editor-content {
    cursor: default;
  }

  /* Body container for content */
  .dx-markdown-editor-body {
    display: flex;
    position: relative;
    flex: 1;
    overflow: visible;
  }

  /* Apply min/max height to scroll wrapper around content */
  .dx-markdown-editor-scroll {
    flex: 1;
    min-height: var(--dx-mde-min-height, 100px);
    max-height: var(--dx-mde-max-height, none);
  }

  /* Raw markdown source display */
  .dx-markdown-editor-raw {
    margin: 0;
    padding: 0.75rem 1rem;
    font-family: "Fira Code", Monaco, monospace;
    font-size: 0.875rem;
    line-height: 1.6;
    background-color: var(--dx-mde-bg);
    color: var(--dx-mde-color);
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  /* Badge slot positioned at top-right corner of editor body (matches LanguageBadge style) */
  .dx-editor-badge {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 10;
  }
}
</style>
