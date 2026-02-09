/**
 * Inline Formatting Composable
 *
 * Provides toggle methods for inline text formatting: bold, italic,
 * strikethrough, inline code, highlight, and underline. Each method
 * dispatches to the shared toggleFormat function which handles all
 * selection states (selection, partial selection, cursor-only).
 *
 * @see inlineFormattingUtils.ts for DOM manipulation functions
 */

import { Ref } from "vue";
import {
  FORMAT_TAGS,
  FormatType,
  hasFormatting,
  isSelectionEntireElement,
  moveCursorAfterElement,
  unwrapSelectionFromFormat,
  removeFormatting,
} from "./inlineFormattingUtils";
import { wrapSelection, insertFormattedPlaceholder } from "./inlineFormattingWrap";

/**
 * Options for useInlineFormatting composable
 */
export interface UseInlineFormattingOptions {
  contentRef: Ref<HTMLElement | null>;
  onContentChange: () => void;
}

/**
 * Return type for useInlineFormatting composable
 */
export interface UseInlineFormattingReturn {
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleStrikethrough: () => void;
  toggleInlineCode: () => void;
  toggleHighlight: () => void;
  toggleUnderline: () => void;
}

/**
 * Composable for inline formatting operations in markdown editor.
 * Delegates DOM manipulation to inlineFormattingUtils.
 */
export function useInlineFormatting(
  options: UseInlineFormattingOptions
): UseInlineFormattingReturn {
  const { contentRef, onContentChange } = options;

  function toggleFormat(formatType: FormatType): void {
    if (!contentRef.value) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (!contentRef.value.contains(range.commonAncestorContainer)) return;

    const { tag } = FORMAT_TAGS[formatType];
    const existingFormat = hasFormatting(range.commonAncestorContainer, formatType);

    if (!range.collapsed) {
      if (existingFormat && isSelectionEntireElement(range, existingFormat)) {
        removeFormatting(existingFormat);
      } else if (existingFormat) {
        unwrapSelectionFromFormat(range, existingFormat, formatType);
      } else {
        wrapSelection(range, tag.toLowerCase());
      }
    } else {
      if (existingFormat) {
        moveCursorAfterElement(existingFormat);
      } else {
        insertFormattedPlaceholder(range, tag.toLowerCase(), formatType);
      }
    }

    onContentChange();
  }

  function toggleBold(): void {
    toggleFormat("bold");
  }

  function toggleItalic(): void {
    toggleFormat("italic");
  }

  function toggleStrikethrough(): void {
    toggleFormat("strikethrough");
  }

  function toggleInlineCode(): void {
    toggleFormat("code");
  }

  function toggleHighlight(): void {
    toggleFormat("highlight");
  }

  function toggleUnderline(): void {
    toggleFormat("underline");
  }

  return {
    toggleBold,
    toggleItalic,
    toggleStrikethrough,
    toggleInlineCode,
    toggleHighlight,
    toggleUnderline,
  };
}
