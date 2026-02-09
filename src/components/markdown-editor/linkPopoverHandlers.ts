/**
 * Link Popover Handlers
 *
 * Handles the three link insertion/editing flows: edit existing link,
 * wrap selected text, and insert new link at cursor.
 */

import { Ref } from "vue";
import { getCursorViewportPosition } from "./cursorPosition";
import { ShowLinkPopoverOptions } from "./useLinks";
import { completeEditLink, createLinkElement, insertAndSelectLink } from "./linkDomUtils";

/** Dependencies for link popover handlers */
export interface LinkPopoverDeps {
  contentRef: Ref<HTMLElement | null>;
  onContentChange: () => void;
  onShowLinkPopover?: (options: ShowLinkPopoverOptions) => void;
  saveSelection: () => void;
  restoreSelection: () => void;
}

/** Return type for createLinkPopoverHandlers factory */
export interface LinkPopoverHandlersReturn {
  showEditLinkPopover: (link: HTMLAnchorElement) => void;
  showWrapSelectionPopover: (range: Range) => void;
  showNewLinkPopover: (range: Range) => void;
}

/** Creates link popover handler methods bound to shared dependencies. */
export function createLinkPopoverHandlers(deps: LinkPopoverDeps): LinkPopoverHandlersReturn {
  const { contentRef, onContentChange, onShowLinkPopover, restoreSelection } = deps;

  function showEditLinkPopover(link: HTMLAnchorElement): void {
    const currentHref = link.getAttribute("href") || "";
    const position = getCursorViewportPosition();

    if (onShowLinkPopover) {
      onShowLinkPopover({
        position,
        existingUrl: currentHref,
        selectedText: link.textContent || undefined,
        onSubmit: (url: string) => {
          restoreSelection();
          completeEditLink(link, url, contentRef, onContentChange);
        },
        onCancel: () => {
          restoreSelection();
          contentRef.value?.focus();
        },
      });
    } else {
      const newUrl = window.prompt("Edit link URL:", currentHref);
      if (newUrl === null) return;
      completeEditLink(link, newUrl, contentRef, onContentChange);
    }
  }

  function completeWrapSelection(url: string): void {
    if (!url || url.trim() === "") {
      contentRef.value?.focus();
      return;
    }

    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) {
      contentRef.value?.focus();
      return;
    }

    const range = sel.getRangeAt(0);
    const link = createLinkElement(url);
    link.appendChild(range.extractContents());
    insertAndSelectLink(link, range, contentRef, onContentChange);
  }

  function showWrapSelectionPopover(range: Range): void {
    const selectedText = range.toString();
    const position = getCursorViewportPosition();

    if (onShowLinkPopover) {
      onShowLinkPopover({
        position,
        selectedText,
        onSubmit: (url: string) => {
          restoreSelection();
          completeWrapSelection(url);
        },
        onCancel: () => {
          restoreSelection();
          contentRef.value?.focus();
        },
      });
    } else {
      const url = window.prompt("Enter link URL:");
      if (!url || url.trim() === "") return;
      completeWrapSelection(url);
    }
  }

  function completeNewLink(url: string, label?: string): void {
    if (!url || url.trim() === "") {
      contentRef.value?.focus();
      return;
    }

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      contentRef.value?.focus();
      return;
    }

    const range = selection.getRangeAt(0);
    const link = createLinkElement(url);
    link.textContent = label?.trim() || url.trim();
    insertAndSelectLink(link, range, contentRef, onContentChange);
  }

  function showNewLinkPopover(_range: Range): void {
    const position = getCursorViewportPosition();

    if (onShowLinkPopover) {
      onShowLinkPopover({
        position,
        onSubmit: (url: string, label?: string) => {
          restoreSelection();
          completeNewLink(url, label);
        },
        onCancel: () => {
          restoreSelection();
          contentRef.value?.focus();
        },
      });
    } else {
      const url = window.prompt("Enter link URL:");
      if (!url || url.trim() === "") return;
      completeNewLink(url);
    }
  }

  return {
    showEditLinkPopover,
    showWrapSelectionPopover,
    showNewLinkPopover,
  };
}
