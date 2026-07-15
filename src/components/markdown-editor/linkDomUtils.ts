/**
 * Link DOM Utilities
 *
 * Pure DOM manipulation functions for link operations.
 * Handles unwrapping links, editing link URLs, and inserting link elements.
 *
 * @see linkPopoverHandlers.ts for popover orchestration
 */

import { Ref } from "vue";
import { dispatchInputEvent } from "./cursorPosition";
import { isSafeUrl } from "../../shared/isSafeUrl";

/**
 * Unwrap a link, keeping its text content
 */
export function unwrapLink(link: HTMLAnchorElement): void {
  const parent = link.parentNode;
  if (!parent) return;

  while (link.firstChild) {
    parent.insertBefore(link.firstChild, link);
  }

  parent.removeChild(link);
}

/**
 * Complete editing an existing link
 */
export function completeEditLink(
  link: HTMLAnchorElement,
  url: string,
  contentRef: Ref<HTMLElement | null>,
  onContentChange: () => void
): void {
  if (url.trim() === "") {
    unwrapLink(link);
  } else if (isSafeUrl(url.trim())) {
    link.setAttribute("href", url.trim());
  }
  // DXUI-72: silently reject unsafe URL schemes

  dispatchInputEvent(contentRef.value!);
  onContentChange();
  contentRef.value?.focus();
}

/**
 * Create a link element with standard attributes
 * DXUI-72: validates URL scheme before setting href
 */
export function createLinkElement(url: string): HTMLAnchorElement {
  const link = document.createElement("a");
  const trimmedUrl = url.trim();
  if (isSafeUrl(trimmedUrl)) {
    link.setAttribute("href", trimmedUrl);
  }
  link.setAttribute("target", "_blank");
  link.setAttribute("rel", "noopener noreferrer");
  return link;
}

/**
 * Insert a link at the current selection, select its contents, and notify
 */
export function insertAndSelectLink(
  link: HTMLAnchorElement,
  range: Range,
  contentRef: Ref<HTMLElement | null>,
  onContentChange: () => void
): void {
  range.insertNode(link);

  const newRange = document.createRange();
  newRange.selectNodeContents(link);
  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(newRange);
  }

  dispatchInputEvent(contentRef.value!);
  onContentChange();
  contentRef.value?.focus();
}
