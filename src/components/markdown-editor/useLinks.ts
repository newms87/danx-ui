/**
 * Links Composable
 *
 * Provides link insertion, editing, and detection for the markdown editor.
 * Delegates popover handling to linkPopoverHandlers module.
 *
 * @see linkPopoverHandlers.ts for popover show/complete flows
 */

import { Ref } from "vue";
import { CursorViewportPosition, createSelectionManager } from "./cursorPosition";
import { findLinkAncestor } from "./blockUtils";
import { createLinkPopoverHandlers } from "./linkPopoverHandlers";

/**
 * Options passed to the onShowLinkPopover callback
 */
export interface ShowLinkPopoverOptions {
  /** Position in viewport where popover should appear */
  position: CursorViewportPosition;
  /** If editing an existing link, the current URL */
  existingUrl?: string;
  /** If text is selected, the selected text (for label preview) */
  selectedText?: string;
  /** Callback to complete the link insertion/update */
  onSubmit: (url: string, label?: string) => void;
  /** Callback to cancel the operation */
  onCancel: () => void;
}

/**
 * Options for useLinks composable
 */
export interface UseLinksOptions {
  contentRef: Ref<HTMLElement | null>;
  onContentChange: () => void;
  /** Callback to show the link popover UI */
  onShowLinkPopover?: (options: ShowLinkPopoverOptions) => void;
}

/**
 * Return type for useLinks composable
 */
export interface UseLinksReturn {
  /** Insert or edit a link at the current selection/cursor */
  insertLink: () => void;
  /** Check if cursor is inside a link */
  isInLink: () => boolean;
}

/**
 * Composable for link operations in markdown editor.
 * Delegates popover handling to linkPopoverHandlers.
 */
export function useLinks(options: UseLinksOptions): UseLinksReturn {
  const { contentRef, onContentChange, onShowLinkPopover } = options;

  const { save: saveSelection, restore: restoreSelection } = createSelectionManager();

  const { showEditLinkPopover, showWrapSelectionPopover, showNewLinkPopover } =
    createLinkPopoverHandlers({
      contentRef,
      onContentChange,
      onShowLinkPopover,
      saveSelection,
      restoreSelection,
    });

  function isInLink(): boolean {
    if (!contentRef.value) return false;

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return false;

    const range = selection.getRangeAt(0);
    return findLinkAncestor(range.startContainer, contentRef.value) !== null;
  }

  function insertLink(): void {
    if (!contentRef.value) return;

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (!contentRef.value.contains(range.startContainer)) return;

    saveSelection();

    const existingLink = findLinkAncestor(range.startContainer, contentRef.value);

    if (existingLink) {
      showEditLinkPopover(existingLink);
    } else if (!range.collapsed) {
      showWrapSelectionPopover(range);
    } else {
      showNewLinkPopover(range);
    }
  }

  return {
    insertLink,
    isInLink,
  };
}
