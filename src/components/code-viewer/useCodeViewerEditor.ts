/**
 * Code Viewer Editor Composable
 *
 * Handles contenteditable code editing with syntax highlighting, cursor management,
 * smart indentation (JSON/YAML-aware), debounced validation and highlighting,
 * and keyboard shortcuts.
 *
 * Keyboard shortcuts:
 * - Ctrl/Cmd+Alt+L: Cycle between available formats
 * - Ctrl/Cmd+Alt+Shift+L: Open language search panel
 * - Ctrl/Cmd+Enter: Exit editing
 * - Tab: Insert 2 spaces (prevents focus change)
 * - Escape: Exit edit mode
 * - Ctrl/Cmd+S: Save without exiting
 * - Ctrl/Cmd+A: Select all within this code viewer
 * - Enter: Smart indentation based on format context
 * - Backspace/Delete on empty: Delete the code block
 */

import { computed, nextTick, onUnmounted, Ref, ref } from "vue";
import { highlightSyntax } from "../../shared/syntax-highlighting";
import {
  getAvailableFormats,
  getCursorOffset,
  getCurrentLineInfo,
  getSmartIndent,
  setCursorOffset,
} from "./cursorUtils";
import type { CodeFormat, ValidationError } from "./types";
import type { UseCodeFormatReturn } from "./useCodeFormat";

export interface UseCodeViewerEditorOptions {
  codeRef: Ref<HTMLPreElement | null>;
  codeFormat: UseCodeFormatReturn;
  currentFormat: Ref<CodeFormat>;
  canEdit: Ref<boolean>;
  editable: Ref<boolean>;
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
    onEmitModelValue,
    onEmitEditable,
    onEmitFormat,
    onExit,
    onDelete,
    onOpenLanguageSearch,
  } = options;

  let validationTimeout: ReturnType<typeof setTimeout> | null = null;
  let highlightTimeout: ReturnType<typeof setTimeout> | null = null;

  const internalEditable = ref(editable.value);
  const editingContent = ref("");
  const cachedHighlightedContent = ref("");
  const isUserEditing = ref(false);
  const validationError = ref<ValidationError | null>(null);

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
    const highlighted = highlightSyntax(displayContent.value, { format: currentFormat.value });
    cachedHighlightedContent.value = highlighted;
    return highlighted;
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
      cachedHighlightedContent.value = highlightSyntax(editingContent.value, {
        format: currentFormat.value,
      });
      nextTick(() => {
        if (codeRef.value) {
          codeRef.value.innerHTML = cachedHighlightedContent.value;
        }
      });
    }
  }

  function debouncedValidate(): void {
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }
    validationTimeout = setTimeout(() => {
      validationError.value = codeFormat.validateWithError(
        editingContent.value,
        currentFormat.value
      );
    }, 300);
  }

  function debouncedHighlight(): void {
    if (highlightTimeout) {
      clearTimeout(highlightTimeout);
    }
    highlightTimeout = setTimeout(() => {
      if (!codeRef.value || !isEditing.value) return;

      const activeElement = document.activeElement;
      const hasFocus = activeElement === codeRef.value || codeRef.value.contains(activeElement);

      const cursorOffset = getCursorOffset(codeRef.value);
      codeRef.value.innerHTML = highlightSyntax(editingContent.value, {
        format: currentFormat.value,
      });
      setCursorOffset(codeRef.value, cursorOffset);

      if (hasFocus && document.activeElement !== codeRef.value) {
        codeRef.value.focus();
      }
    }, 300);
  }

  function toggleEdit(): void {
    internalEditable.value = !internalEditable.value;
    onEmitEditable(internalEditable.value);

    if (internalEditable.value) {
      editingContent.value = codeFormat.formattedContent.value;
      validationError.value = null;
      nextTick(() => {
        if (codeRef.value) {
          codeRef.value.innerHTML = highlightSyntax(editingContent.value, {
            format: currentFormat.value,
          });
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
  }

  function onContentEditableBlur(): void {
    if (!isEditing.value || !isUserEditing.value) return;

    isUserEditing.value = false;

    if (validationTimeout) {
      clearTimeout(validationTimeout);
      validationTimeout = null;
    }
    if (highlightTimeout) {
      clearTimeout(highlightTimeout);
      highlightTimeout = null;
    }
    validationError.value = codeFormat.validateWithError(editingContent.value, currentFormat.value);

    const parsed = codeFormat.parse(editingContent.value);
    if (parsed) {
      onEmitModelValue(parsed);
    } else {
      onEmitModelValue(editingContent.value);
    }

    if (codeRef.value) {
      codeRef.value.innerHTML = highlightSyntax(editingContent.value, {
        format: currentFormat.value,
      });
    }
  }

  /** Handle Ctrl+Alt+L (cycle format) and Ctrl+Alt+Shift+L (open search) */
  function handleFormatShortcut(event: KeyboardEvent): boolean {
    const isCtrlAltL =
      (event.ctrlKey || event.metaKey) && event.altKey && event.key.toLowerCase() === "l";
    if (!isCtrlAltL) return false;

    event.preventDefault();
    event.stopPropagation();

    if (event.shiftKey && onOpenLanguageSearch) {
      onOpenLanguageSearch();
    } else if (!event.shiftKey && onEmitFormat) {
      const formats = getAvailableFormats(currentFormat.value);
      if (formats.length > 1) {
        const currentIndex = formats.indexOf(currentFormat.value);
        const nextIndex = (currentIndex + 1) % formats.length;
        const nextFormat = formats[nextIndex];
        if (nextFormat) onEmitFormat(nextFormat);
      }
    }
    return true;
  }

  /** Handle Backspace/Delete on empty content — delete the code block */
  function handleDeleteOnEmpty(event: KeyboardEvent): boolean {
    if ((event.key !== "Backspace" && event.key !== "Delete") || !onDelete) return false;
    if (editingContent.value.trim() !== "") return false;

    event.preventDefault();
    onDelete();
    return true;
  }

  /** Handle Ctrl+Enter — save and exit the code block */
  function handleCtrlEnter(event: KeyboardEvent): boolean {
    if (event.key !== "Enter" || !(event.ctrlKey || event.metaKey)) return false;

    event.preventDefault();
    if (onExit) {
      const parsed = codeFormat.parse(editingContent.value);
      onEmitModelValue(parsed ?? editingContent.value);
      onExit();
    }
    return true;
  }

  /** Handle Enter — insert newline with smart indentation */
  function handleEnter(event: KeyboardEvent): boolean {
    if (event.key !== "Enter") return false;

    // getSelection() is always non-null in browsers and jsdom
    const selection = window.getSelection()!;

    if (selection.rangeCount === 0) {
      // codeRef is guaranteed non-null when isEditing is true (handleEnter only runs in edit mode)
      const range = document.createRange();
      range.selectNodeContents(codeRef.value!);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    event.preventDefault();

    let range = selection.getRangeAt(0);
    const isWithinCodeRef = codeRef.value?.contains(range.startContainer);

    if (!isWithinCodeRef && codeRef.value) {
      range = document.createRange();
      range.selectNodeContents(codeRef.value);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    const domTextContent = codeRef.value!.innerText;
    const lineInfo = getCurrentLineInfo(domTextContent, codeRef.value);
    const smartIndent = getSmartIndent(lineInfo, currentFormat.value);

    range.deleteContents();
    const textNode = document.createTextNode("\n" + smartIndent);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);

    codeRef.value?.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  }

  /** Handle Tab — insert 2 spaces */
  function handleTab(event: KeyboardEvent): boolean {
    if (event.key !== "Tab") return false;

    event.preventDefault();
    // getSelection() is always non-null in browsers and jsdom
    const selection = window.getSelection()!;
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode("  ");
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
      // codeRef is guaranteed non-null when isEditing is true (handleTab only runs in edit mode)
      codeRef.value!.dispatchEvent(new Event("input", { bubbles: true }));
    }
    return true;
  }

  /** Handle Escape — blur and exit edit mode */
  function handleEscape(event: KeyboardEvent): boolean {
    if (event.key !== "Escape") return false;

    event.preventDefault();
    onContentEditableBlur();
    toggleEdit();
    return true;
  }

  /** Handle Ctrl+S — save without exiting */
  function handleCtrlS(event: KeyboardEvent): boolean {
    if (!((event.ctrlKey || event.metaKey) && event.key === "s")) return false;

    event.preventDefault();
    onContentEditableBlur();
    return true;
  }

  /** Handle Ctrl+A — select all within this code viewer */
  function handleCtrlA(event: KeyboardEvent): boolean {
    if (!((event.ctrlKey || event.metaKey) && event.key === "a")) return false;

    event.preventDefault();
    event.stopPropagation();

    // getSelection() is always non-null in browsers and jsdom
    const selection = window.getSelection()!;
    const range = document.createRange();
    // codeRef is guaranteed non-null when isEditing is true (handleCtrlA only runs in edit mode)
    range.selectNodeContents(codeRef.value!);
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (handleFormatShortcut(event)) return;
    if (!isEditing.value) return;

    // Stop propagation for all editing handlers to prevent double-firing
    // (onKeyDown is bound on both the wrapper div and the contenteditable pre)
    if (handleDeleteOnEmpty(event)) {
      event.stopPropagation();
      return;
    }
    if (handleCtrlEnter(event)) {
      event.stopPropagation();
      return;
    }
    if (handleEnter(event)) {
      event.stopPropagation();
      return;
    }
    if (handleTab(event)) {
      event.stopPropagation();
      return;
    }
    if (handleEscape(event)) {
      event.stopPropagation();
      return;
    }
    if (handleCtrlS(event)) {
      event.stopPropagation();
      return;
    }
    if (handleCtrlA(event)) {
      event.stopPropagation();
      return;
    }
  }

  // Initialize editing content when starting in edit mode
  if (isEditing.value) {
    editingContent.value = codeFormat.formattedContent.value;
    nextTick(() => {
      if (codeRef.value) {
        codeRef.value.innerHTML = highlightSyntax(editingContent.value, {
          format: currentFormat.value,
        });
      }
    });
  }

  onUnmounted(() => {
    if (validationTimeout) clearTimeout(validationTimeout);
    if (highlightTimeout) clearTimeout(highlightTimeout);
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
  };
}
