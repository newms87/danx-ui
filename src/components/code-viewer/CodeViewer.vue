<!--
/**
 * CodeViewer Component
 *
 * A rich code display and editing component with syntax highlighting, format
 * switching, collapsible preview, markdown rendering, and inline editing.
 *
 * ## Features
 * - Syntax highlighting for JSON, YAML, HTML, CSS, JavaScript, and more
 * - Bidirectional JSON ↔ YAML format conversion
 * - Inline contenteditable editing with smart indentation
 * - Collapsible single-line preview mode
 * - Markdown rendering with nested code blocks
 * - Language badge with quick-switch and searchable language selector
 * - Dark and light theme support via CSS tokens
 * - Keyboard shortcuts for format cycling, save, exit, select-all
 *
 * ## Props
 * | Prop              | Type                   | Default  | Description                                |
 * |-------------------|------------------------|----------|--------------------------------------------|
 * | modelValue        | object/string/null     | null     | Data to display                            |
 * | format            | CodeFormat             | "yaml"   | Display format                             |
 * | label             | string                 | ""       | Label above the viewer                     |
 * | canEdit           | boolean                | false    | Enable edit toggle                         |
 * | editable          | boolean                | false    | Start in edit mode                         |
 * | collapsible       | boolean                | false    | Enable collapse                            |
 * | defaultCollapsed  | boolean                | true     | Start collapsed                            |
 * | defaultCodeFormat | "json"/"yaml"          | —        | Default format for markdown code blocks    |
 * | allowAnyLanguage  | boolean                | false    | Show language search in badge              |
 * | theme             | "dark"/"light"         | "dark"   | Color theme                                |
 * | hideFooter        | boolean                | false    | Hide the footer bar                        |
 * | debounceMs        | number                 | 300      | Debounce delay (ms) for v-model emit while editing (0 = immediate) |
 * | annotations       | CodeAnnotation[]       | []       | Inline annotations highlighting property paths with hover messages |
 *
 * ## Events
 * - update:modelValue — edited value (object or string)
 * - update:format — format changed via badge
 * - update:editable — edit mode toggled
 * - exit — user pressed Ctrl+Enter to exit
 * - delete — user pressed Backspace/Delete on empty content
 *
 * ## Slots
 * - footer-actions — Custom actions inserted into the footer bar (next to the edit button)
 *
 * ## Usage Examples
 *
 * Display read-only YAML:
 *   <CodeViewer :model-value="myObject" format="yaml" />
 *
 * Editable JSON with format switching:
 *   <CodeViewer :model-value="data" format="json" can-edit @update:model-value="onSave" />
 *
 * Collapsible preview (starts collapsed):
 *   <CodeViewer :model-value="data" collapsible :default-collapsed="true" />
 *
 * Markdown rendering:
 *   <CodeViewer :model-value="markdownString" format="markdown" />
 *
 * Light theme with any-language search:
 *   <CodeViewer :model-value="code" format="javascript" theme="light" allow-any-language />
 *
 * ## CSS Tokens
 * See `code-viewer-tokens.css` for the full list of customizable tokens.
 */
-->

<script setup lang="ts">
import { computed, ref, toRef, watch } from "vue";
import CodeViewerCollapsed from "./CodeViewerCollapsed.vue";
import CodeViewerFooter from "./CodeViewerFooter.vue";
import { getAvailableFormats } from "./formatUtils";
import { DanxIcon } from "../icon";
import LanguageBadge from "./LanguageBadge.vue";
import MarkdownContent from "./MarkdownContent.vue";
import type { CodeFormat, DanxCodeViewerEmits, DanxCodeViewerProps } from "./types";
import { useAnnotationTooltip } from "./useAnnotationTooltip";
import { useCodeFormat } from "./useCodeFormat";
import { useCodeViewerCollapse } from "./useCodeViewerCollapse";
import { useCodeViewerEditor } from "./useCodeViewerEditor";

const props = withDefaults(defineProps<DanxCodeViewerProps>(), {
  modelValue: null,
  format: "yaml",
  label: "",
  canEdit: false,
  editable: false,
  collapsible: false,
  defaultCollapsed: true,
  theme: "dark",
  hideFooter: false,
  debounceMs: 300,
  annotations: () => [],
});

const emit = defineEmits<DanxCodeViewerEmits>();

const valid = defineModel<boolean>("valid", { default: true });

const annotationTooltip = useAnnotationTooltip();

const codeFormat = useCodeFormat({
  initialFormat: props.format,
  initialValue: props.modelValue,
});

const currentFormat = ref<CodeFormat>(props.format);
const codeRef = ref<HTMLPreElement | null>(null);
const languageSearchOpen = ref(false);
const availableFormats = computed(() => getAvailableFormats(currentFormat.value));

const isCollapsed = ref(props.collapsible && props.defaultCollapsed);

watch(
  () => props.defaultCollapsed,
  (newValue) => {
    if (props.collapsible) {
      isCollapsed.value = newValue;
    }
  }
);

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
}

const editor = useCodeViewerEditor({
  codeRef,
  codeFormat,
  currentFormat,
  canEdit: toRef(props, "canEdit"),
  editable: toRef(props, "editable"),
  debounceMs: props.debounceMs,
  onEmitModelValue: (value) => emit("update:modelValue", value),
  onEmitEditable: (editable) => emit("update:editable", editable),
  onEmitFormat: (format) => onFormatChange(format),
  onExit: () => emit("exit"),
  onDelete: () => emit("delete"),
  onOpenLanguageSearch: () => (languageSearchOpen.value = true),
  annotations: toRef(props, "annotations"),
});

watch(currentFormat, (newFormat) => {
  codeFormat.setFormat(newFormat);
  editor.updateEditingContentOnFormatChange();
});

watch(
  () => props.format,
  (newFormat) => {
    currentFormat.value = newFormat;
  }
);

watch(
  () => props.modelValue,
  () => {
    codeFormat.setValue(props.modelValue);
    editor.syncEditingContentFromValue();
  }
);

watch(
  () => props.editable,
  (newValue) => {
    editor.syncEditableFromProp(newValue);
  }
);

const { collapsedPreview } = useCodeViewerCollapse({
  modelValue: toRef(props, "modelValue"),
  format: currentFormat,
  displayContent: editor.displayContent,
  codeFormat,
});

function onFormatChange(newFormat: CodeFormat) {
  currentFormat.value = newFormat;
  emit("update:format", newFormat);
}

const markdownSource = computed(() => {
  if (typeof props.modelValue === "string") {
    return props.modelValue;
  }
  return editor.displayContent.value;
});

watch(
  () => editor.isValid.value,
  (newValid) => {
    valid.value = newValid;
  },
  { immediate: true }
);
</script>

<template>
  <div
    class="dx-code-viewer group flex flex-col"
    :class="[{ 'is-collapsed': isCollapsed }, props.theme === 'light' ? 'theme-light' : '']"
  >
    <!-- Label (replaces FieldLabel dependency) -->
    <div v-if="label" class="mb-2 text-sm flex-shrink-0">
      {{ label }}
    </div>

    <!-- Collapsed view - inline preview -->
    <CodeViewerCollapsed
      v-if="collapsible && isCollapsed"
      :preview="collapsedPreview"
      :format="currentFormat"
      :available-formats="availableFormats"
      :allow-any-language="allowAnyLanguage"
      @expand="toggleCollapse"
      @format-change="(fmt: string) => onFormatChange(fmt as CodeFormat)"
    />

    <!-- Expanded view - full code viewer -->
    <template v-else>
      <div
        class="code-wrapper relative flex flex-col flex-1 min-h-0"
        tabindex="0"
        @keydown="editor.onKeyDown"
      >
        <!-- Language badge -->
        <LanguageBadge
          v-model:search-open="languageSearchOpen"
          :format="currentFormat"
          :available-formats="availableFormats"
          :toggleable="true"
          :allow-any-language="allowAnyLanguage"
          @click.stop
          @change="(fmt: string) => onFormatChange(fmt as CodeFormat)"
        />

        <!-- Collapse button (when collapsible and expanded) -->
        <div
          v-if="collapsible"
          class="collapse-toggle absolute top-0 left-0 p-1 cursor-pointer z-10 text-gray-500 hover:text-gray-300"
          @click="toggleCollapse"
        >
          <DanxIcon icon="chevron-down" class="w-3 h-3" />
        </div>

        <!-- Clickable header to collapse when expanded -->
        <div v-if="collapsible" class="collapse-header" @click="toggleCollapse" />

        <!-- Code display - readonly with syntax highlighting (non-markdown formats) -->
        <pre
          v-if="!editor.isEditing.value && currentFormat !== 'markdown'"
          class="code-content dx-scrollbar flex-1 min-h-0"
          :class="{ 'is-collapsible': collapsible }"
          @click="editor.onNestedJsonClick"
          @mouseover="annotationTooltip.onCodeMouseOver"
          @mouseout="annotationTooltip.onCodeMouseOut"
        ><code :class="'language-' + currentFormat" v-html="editor.highlightedContent.value"></code></pre>

        <!-- Markdown display - rendered HTML -->
        <MarkdownContent
          v-else-if="currentFormat === 'markdown' && !editor.isEditing.value"
          :content="markdownSource"
          :default-code-format="defaultCodeFormat"
          class="code-content dx-scrollbar flex-1 min-h-0"
          :class="{ 'is-collapsible': collapsible }"
        />

        <!-- Code editor - contenteditable -->
        <pre
          v-else
          ref="codeRef"
          class="code-content dx-scrollbar flex-1 min-h-0 is-editable"
          :class="['language-' + currentFormat, { 'is-collapsible': collapsible }]"
          contenteditable="true"
          @input="editor.onContentEditableInput"
          @blur="editor.onContentEditableBlur"
          @keydown="editor.onKeyDown"
          @mouseover="annotationTooltip.onCodeMouseOver"
          @mouseout="annotationTooltip.onCodeMouseOut"
        ></pre>

        <!-- Annotation tooltip (independent of v-if chain above) -->
        <div
          v-if="annotationTooltip.tooltipVisible.value"
          class="dx-code-annotation-tooltip"
          :class="'dx-code-annotation-tooltip--' + annotationTooltip.tooltipType.value"
          :style="annotationTooltip.tooltipStyle.value"
        >
          {{ annotationTooltip.tooltipMessage.value }}
        </div>

        <!-- Footer with char count and edit toggle -->
        <CodeViewerFooter
          v-if="!hideFooter"
          :char-count="editor.charCount.value"
          :validation-error="editor.validationError.value"
          :can-edit="canEdit && currentFormat !== 'markdown'"
          :is-editing="editor.isEditing.value"
          @toggle-edit="editor.toggleEdit"
        >
          <template v-if="$slots['footer-actions']" #actions>
            <slot name="footer-actions" />
          </template>
        </CodeViewerFooter>
      </div>
    </template>
  </div>
</template>
