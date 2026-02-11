/**
 * Code Viewer Keyboard Handlers
 *
 * Factory that creates keyboard handlers for the CodeViewer's contenteditable editor.
 * Extracted from useCodeViewerEditor to keep responsibilities focused.
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

import { Ref } from "vue";
import { getAvailableFormats, getCurrentLineInfo, getSmartIndent } from "./cursorUtils";
import type { CodeFormat } from "./types";

export interface KeyboardHandlerDeps {
  codeRef: Ref<HTMLPreElement | null>;
  currentFormat: Ref<CodeFormat>;
  editingContent: Ref<string>;
  isEditing: Ref<boolean>;
  parseThenEmit: (content: string) => void;
  onEmitFormat?: (format: CodeFormat) => void;
  onExit?: () => void;
  onDelete?: () => void;
  onOpenLanguageSearch?: () => void;
  onContentEditableBlur: () => void;
  toggleEdit: () => void;
}

/** Create keyboard handlers for the code viewer editor */
export function createKeyboardHandlers(deps: KeyboardHandlerDeps): {
  onKeyDown: (event: KeyboardEvent) => void;
} {
  const {
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
  } = deps;

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
      parseThenEmit(editingContent.value);
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

  return { onKeyDown };
}
