/**
 * Inline Formatting Utilities
 *
 * Pure DOM manipulation functions for inline text formatting operations.
 * Handles format detection, wrapping/unwrapping selections, removing
 * formatting, and cursor management around formatted elements.
 *
 * No composable closure dependency - all functions take explicit parameters.
 * Used by useInlineFormatting for its toggleFormat dispatcher.
 */

/**
 * Inline formatting tag mappings
 */
export const FORMAT_TAGS = {
  bold: { tag: "STRONG", fallback: "B" },
  italic: { tag: "EM", fallback: "I" },
  strikethrough: { tag: "DEL", fallback: "S" },
  code: { tag: "CODE", fallback: null },
  highlight: { tag: "MARK", fallback: null },
  underline: { tag: "U", fallback: null },
} as const;

export type FormatType = keyof typeof FORMAT_TAGS;

/**
 * Check if a node or its ancestors have a specific formatting tag
 */
export function hasFormatting(node: Node | null, formatType: FormatType): Element | null {
  const { tag, fallback } = FORMAT_TAGS[formatType];

  let current: Node | null = node;
  while (current && current.nodeType !== Node.DOCUMENT_NODE) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const element = current as Element;
      const tagName = element.tagName.toUpperCase();
      if (tagName === tag || (fallback && tagName === fallback)) {
        return element;
      }
    }
    current = current.parentNode;
  }
  return null;
}

/**
 * Check if selection encompasses the entire element's content
 */
export function isSelectionEntireElement(range: Range, element: Element): boolean {
  return range.toString() === element.textContent;
}

/**
 * Move cursor to position immediately after an element by inserting a
 * zero-width space to break out of the formatting context.
 */
export function moveCursorAfterElement(element: Element): void {
  const selection = window.getSelection();
  if (!selection) return;

  const zws = document.createTextNode("\u200B");
  element.parentNode?.insertBefore(zws, element.nextSibling);

  const range = document.createRange();
  range.setStart(zws, 1);
  range.collapse(true);

  selection.removeAllRanges();
  selection.addRange(range);
}

/**
 * Remove formatting from just the selected portion within a formatted element
 */
export function unwrapSelectionFromFormat(
  range: Range,
  formatElement: Element,
  formatType: FormatType
): void {
  const { tag } = FORMAT_TAGS[formatType];
  const tagLower = tag.toLowerCase();

  const selectedText = range.toString();
  const fullText = formatElement.textContent || "";

  const beforeText = fullText.substring(0, fullText.indexOf(selectedText));
  const afterText = fullText.substring(fullText.indexOf(selectedText) + selectedText.length);

  const parent = formatElement.parentNode;
  if (!parent) return;

  const fragment = document.createDocumentFragment();

  if (beforeText) {
    const beforeElement = document.createElement(tagLower);
    beforeElement.textContent = beforeText;
    fragment.appendChild(beforeElement);
  }

  const unformattedText = document.createTextNode(selectedText);
  fragment.appendChild(unformattedText);

  if (afterText) {
    const afterElement = document.createElement(tagLower);
    afterElement.textContent = afterText;
    fragment.appendChild(afterElement);
  }

  parent.replaceChild(fragment, formatElement);

  const newRange = document.createRange();
  newRange.selectNodeContents(unformattedText);
  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(newRange);
  }
}

/**
 * Remove formatting from an element, keeping its content
 */
export function removeFormatting(element: Element): void {
  const parent = element.parentNode;
  if (!parent) return;

  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }

  parent.removeChild(element);
  parent.normalize();
}
