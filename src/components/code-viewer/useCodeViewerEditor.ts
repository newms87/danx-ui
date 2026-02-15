/**
 * Code Viewer Editor Composable
 *
 * Handles contenteditable code editing with syntax highlighting, cursor management,
 * smart indentation (JSON/YAML-aware), debounced validation and highlighting,
 * and keyboard shortcuts.
 *
 * Keyboard shortcuts are delegated to codeViewerKeyHandlers.ts.
 * Debounced operations are delegated to codeViewerDebounce.ts.
 */

import { computed, nextTick, onUnmounted, Ref, ref, watch, watchEffect } from "vue";
import { highlightSyntax } from "../../shared/syntax-highlighting";
import { createDebouncedOperations } from "./codeViewerDebounce";
import { createKeyboardHandlers } from "./codeViewerKeyHandlers";
import { applyHighlighting } from "./highlightUtils";
import type { CodeFormat, ValidationError } from "./types";
import type { UseCodeFormatReturn } from "./useCodeFormat";
import { useNestedJsonToggle } from "./useNestedJsonToggle";

export interface UseCodeViewerEditorOptions {
  codeRef: Ref<HTMLPreElement | null>;
  codeFormat: UseCodeFormatReturn;
  currentFormat: Ref<CodeFormat>;
  canEdit: Ref<boolean>;
  editable: Ref<boolean>;
  /** Delay in ms for debounced v-model emit during editing (default 300, 0 for immediate) */
  debounceMs?: number;
  onEmitModelValue: (value: object | string | null) => void;
  onEmitEditable: (editable: boolean) => void;
  /** Callback when format changes (e.g., cycling languages) */
  onEmitFormat?: (format: CodeFormat) => void;
  /** Callback when user wants to exit the code block (Ctrl+Enter) */
  onExit?: () => void;
  /** Callback when user wants to delete the code block (Backspace/Delete on empty) */
  onDelete?: () => void;
  /** Callback when user wants to open the language search panel (Ctrl+Alt+Shift+L) */
  onOpenLanguageSearch?: () => void;
}

export interface UseCodeViewerEditorReturn {
  internalEditable: Ref<boolean>;
  editingContent: Ref<string>;
  cachedHighlightedContent: Ref<string>;
  isUserEditing: Ref<boolean>;
  validationError: Ref<ValidationError | null>;
  isEditing: Ref<boolean>;
  hasValidationError: Ref<boolean>;
  highlightedContent: Ref<string>;
  displayContent: Ref<string>;
  charCount: Ref<number>;
  isValid: Ref<boolean>;
  toggleEdit: () => void;
  onContentEditableInput: (event: Event) => void;
  onContentEditableBlur: () => void;
  onKeyDown: (event: KeyboardEvent) => void;
  syncEditableFromProp: (value: boolean) => void;
  syncEditingContentFromValue: () => void;
  updateEditingContentOnFormatChange: () => void;
  onNestedJsonClick: (event: MouseEvent) => void;
}

/** Composable for CodeViewer editor functionality */
export function useCodeViewerEditor(
  options: UseCodeViewerEditorOptions
): UseCodeViewerEditorReturn {
  const {
    codeRef,
    codeFormat,
    currentFormat,
    canEdit,
    editable,
    debounceMs = 300,
    onEmitModelValue,
    onEmitEditable,
    onEmitFormat,
    onExit,
    onDelete,
    onOpenLanguageSearch,
  } = options;

  const internalEditable = ref(editable.value);
  const editingContent = ref("");
  const cachedHighlightedContent = ref("");
  const isUserEditing = ref(false);
  const validationError = ref<ValidationError | null>(null);
  let lastEmittedValue: object | string | null | undefined = undefined;

  const nestedJsonToggle = useNestedJsonToggle();

  const hasValidationError = computed(() => validationError.value !== null);
  const isEditing = computed(() => canEdit.value && internalEditable.value);

  const displayContent = computed(() => {
    if (isUserEditing.value) {
      return editingContent.value;
    }
    return codeFormat.formattedContent.value;
  });

  const highlightedContent = computed(() => {
    if (isUserEditing.value) {
      return cachedHighlightedContent.value;
    }
    // Read toggleVersion to create reactive dependency for re-highlighting on toggle
    nestedJsonToggle.toggleVersion.value;
    return highlightSyntax(displayContent.value, {
      format: currentFormat.value,
      nestedJson: { isExpanded: nestedJsonToggle.isExpanded },
      colorSwatches: true,
    });
  });

  // Reset nested JSON toggle state when content changes (new data loaded)
  watch(displayContent, () => {
    nestedJsonToggle.reset();
  });

  // Keep the cache warm so it's available when isUserEditing transitions to true
  watchEffect(() => {
    if (!isUserEditing.value) {
      cachedHighlightedContent.value = highlightedContent.value;
    }
  });

  const isValid = computed(() => {
    if (hasValidationError.value) return false;
    return codeFormat.isValid.value;
  });

  const charCount = computed(() => {
    return displayContent.value?.length || 0;
  });

  function syncEditableFromProp(value: boolean): void {
    internalEditable.value = value;
  }

  function syncEditingContentFromValue(): void {
    if (!isUserEditing.value) {
      editingContent.value = codeFormat.formattedContent.value;
    }
  }

  function updateEditingContentOnFormatChange(): void {
    if (isEditing.value) {
      editingContent.value = codeFormat.formattedContent.value;
      nextTick(() => {
        cachedHighlightedContent.value = applyHighlighting(
          codeRef,
          editingContent.value,
          currentFormat.value
        );
      });
    }
  }

  /** Emit the current editing content as parsed object (if parseable) or raw string */
  function emitCurrentValue(): void {
    const parsed = codeFormat.parse(editingContent.value);
    const value = parsed ?? editingContent.value;
    if (value === lastEmittedValue) return;
    lastEmittedValue = value;
    onEmitModelValue(value);
  }

  /** Parse content and emit (used by Ctrl+Enter to bypass dedup) */
  function parseThenEmit(content: string): void {
    const parsed = codeFormat.parse(content);
    onEmitModelValue(parsed ?? content);
  }

  const { debouncedEmit, debouncedValidate, debouncedHighlight, clearAllTimeouts } =
    createDebouncedOperations({
      codeRef,
      isEditing,
      editingContent,
      currentFormat,
      validationError,
      validateWithError: codeFormat.validateWithError,
      emitCurrentValue,
      debounceMs,
    });

  function toggleEdit(): void {
    internalEditable.value = !internalEditable.value;
    onEmitEditable(internalEditable.value);

    if (internalEditable.value) {
      editingContent.value = codeFormat.formattedContent.value;
      validationError.value = null;
      lastEmittedValue = undefined;
      nextTick(() => {
        applyHighlighting(codeRef, editingContent.value, currentFormat.value);
        if (codeRef.value) {
          codeRef.value.focus();
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(codeRef.value);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      });
    } else {
      validationError.value = null;
    }
  }

  function onContentEditableInput(event: Event): void {
    if (!isEditing.value) return;

    isUserEditing.value = true;
    const target = event.target as HTMLElement;
    editingContent.value = target.innerText || "";

    debouncedValidate();
    debouncedHighlight();
    debouncedEmit();
  }

  function onContentEditableBlur(): void {
    if (!isEditing.value || !isUserEditing.value) return;

    isUserEditing.value = false;
    clearAllTimeouts();
    validationError.value = codeFormat.validateWithError(editingContent.value, currentFormat.value);

    emitCurrentValue();
    applyHighlighting(codeRef, editingContent.value, currentFormat.value);
  }

  const { onKeyDown } = createKeyboardHandlers({
    codeRef,
    currentFormat,
    editingContent,
    isEditing,
    parseThenEmit,
    onEmitFormat,
    onExit,
    onDelete,
    onOpenLanguageSearch,
    onContentEditableBlur,
    toggleEdit,
  });

  // Initialize editing content when starting in edit mode
  if (isEditing.value) {
    editingContent.value = codeFormat.formattedContent.value;
    nextTick(() => {
      applyHighlighting(codeRef, editingContent.value, currentFormat.value);
    });
  }

  onUnmounted(() => {
    clearAllTimeouts();
  });

  return {
    internalEditable,
    editingContent,
    cachedHighlightedContent,
    isUserEditing,
    validationError,
    isEditing,
    hasValidationError,
    highlightedContent,
    displayContent,
    charCount,
    isValid,
    toggleEdit,
    onContentEditableInput,
    onContentEditableBlur,
    onKeyDown,
    syncEditableFromProp,
    syncEditingContentFromValue,
    updateEditingContentOnFormatChange,
    onNestedJsonClick: nestedJsonToggle.handleClick,
  };
}
