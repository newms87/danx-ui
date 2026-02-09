/**
 * Inline Formatting Wrap Operations
 *
 * DOM manipulation functions for wrapping selections with formatting tags,
 * inserting formatted placeholders, and cleaning up formatting artifacts.
 *
 * @see inlineFormattingUtils.ts for format detection and unwrapping
 */

import { FormatType } from "./inlineFormattingUtils";

/**
 * Unwrap all existing formatting elements of the same type within a node tree.
 * Prevents nested formatting like <mark><mark>text</mark></mark>.
 */
export function unwrapExistingFormat(container: Node, tagName: string): void {
  if (
    container.nodeType === Node.ELEMENT_NODE ||
    container.nodeType === Node.DOCUMENT_FRAGMENT_NODE
  ) {
    const wrapper = document.createElement("div");
    while (container.firstChild) {
      wrapper.appendChild(container.firstChild);
    }

    const matchingElements = Array.from(wrapper.querySelectorAll(tagName));

    for (const el of matchingElements) {
      const parent = el.parentNode;
      if (parent) {
        while (el.firstChild) {
          parent.insertBefore(el.firstChild, el);
        }
        parent.removeChild(el);
      }
    }

    while (wrapper.firstChild) {
      container.appendChild(wrapper.firstChild);
    }
  }
}

/**
 * Remove empty formatting elements from a parent node
 */
export function removeEmptyElements(parent: Node, tagName: string): void {
  if (parent.nodeType === Node.ELEMENT_NODE) {
    const element = parent as Element;
    const emptyElements = Array.from(element.querySelectorAll(tagName)).filter(
      (el) => !el.textContent?.trim()
    );
    for (const el of emptyElements) {
      el.parentNode?.removeChild(el);
    }
  }
}

/**
 * Wrap the current selection with a formatting tag
 */
export function wrapSelection(range: Range, tagName: string): void {
  const formatElement = document.createElement(tagName);
  const contents = range.extractContents();

  unwrapExistingFormat(contents, tagName);
  formatElement.appendChild(contents);
  range.insertNode(formatElement);

  const parentBlock = formatElement.parentElement;
  if (parentBlock) {
    removeEmptyElements(parentBlock, tagName);
  }

  formatElement.normalize();

  const newRange = document.createRange();
  newRange.selectNodeContents(formatElement);

  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(newRange);
  }
}

/**
 * Get placeholder text for a format type
 */
export function getPlaceholderText(formatType: FormatType): string {
  switch (formatType) {
    case "bold":
      return "bold text";
    case "italic":
      return "italic text";
    case "strikethrough":
      return "strikethrough text";
    case "code":
      return "code";
    case "highlight":
      return "highlighted text";
    case "underline":
      return "underlined text";
    default:
      return "text";
  }
}

/**
 * Insert a formatted placeholder when there's no selection
 */
export function insertFormattedPlaceholder(
  range: Range,
  tagName: string,
  formatType: FormatType
): void {
  const formatElement = document.createElement(tagName);
  const placeholderText = getPlaceholderText(formatType);
  formatElement.textContent = placeholderText;

  range.insertNode(formatElement);

  const newRange = document.createRange();
  newRange.selectNodeContents(formatElement);

  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(newRange);
  }
}
