/**
 * Code Viewer Debounce Utilities
 *
 * Factory that creates debounced operations for the CodeViewer's contenteditable editor:
 * debounced emit, validation, and syntax highlighting with cursor preservation.
 * Extracted from useCodeViewerEditor to keep responsibilities focused.
 */

import { Ref } from "vue";
import { highlightSyntax } from "../../shared/syntax-highlighting";
import { getCursorOffset, setCursorOffset } from "./cursorUtils";
import type { CodeFormat, ValidationError } from "./types";

export interface DebounceDeps {
  codeRef: Ref<HTMLPreElement | null>;
  isEditing: Ref<boolean>;
  editingContent: Ref<string>;
  currentFormat: Ref<CodeFormat>;
  validationError: Ref<ValidationError | null>;
  validateWithError: (content: string, format: CodeFormat) => ValidationError | null;
  emitCurrentValue: () => void;
  debounceMs: number;
}

export interface DebounceReturn {
  debouncedEmit: () => void;
  debouncedValidate: () => void;
  debouncedHighlight: () => void;
  clearAllTimeouts: () => void;
}

/** Create debounced operations for the code viewer editor */
export function createDebouncedOperations(deps: DebounceDeps): DebounceReturn {
  const {
    codeRef,
    isEditing,
    editingContent,
    currentFormat,
    validationError,
    validateWithError,
    emitCurrentValue,
    debounceMs,
  } = deps;

  let validationTimeout: ReturnType<typeof setTimeout> | null = null;
  let highlightTimeout: ReturnType<typeof setTimeout> | null = null;
  let emitTimeout: ReturnType<typeof setTimeout> | null = null;

  function clearAllTimeouts(): void {
    if (validationTimeout) {
      clearTimeout(validationTimeout);
      validationTimeout = null;
    }
    if (highlightTimeout) {
      clearTimeout(highlightTimeout);
      highlightTimeout = null;
    }
    if (emitTimeout) {
      clearTimeout(emitTimeout);
      emitTimeout = null;
    }
  }

  function debouncedEmit(): void {
    if (emitTimeout) {
      clearTimeout(emitTimeout);
    }
    if (debounceMs === 0) {
      emitCurrentValue();
      return;
    }
    emitTimeout = setTimeout(() => {
      emitCurrentValue();
    }, debounceMs);
  }

  function debouncedValidate(): void {
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }
    validationTimeout = setTimeout(() => {
      validationError.value = validateWithError(editingContent.value, currentFormat.value);
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

  return { debouncedEmit, debouncedValidate, debouncedHighlight, clearAllTimeouts };
}
