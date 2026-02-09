import { ref, type Ref } from "vue";
import { htmlToMarkdown } from "../../../shared/markdown/htmlToMarkdown";

export interface TestEditorResult {
  /** The contenteditable container element */
  container: HTMLElement;
  /** Get the current HTML content */
  getHtml: () => string;
  /** Get the markdown output from current HTML */
  getMarkdown: () => string;
  /** Get cursor position as { node, offset } */
  getCursorPosition: () => { node: Node | null; offset: number };
  /** Get cursor offset within a specific block */
  getCursorOffsetInBlock: (blockIndex: number) => number;
  /** Set cursor at a position in a specific text node */
  setCursor: (node: Node, offset: number) => void;
  /** Set cursor at offset within block's text content */
  setCursorInBlock: (blockIndex: number, offset: number) => void;
  /** Select text range */
  selectRange: (startNode: Node, startOffset: number, endNode: Node, endOffset: number) => void;
  /** Select text within a block by offsets */
  selectInBlock: (blockIndex: number, startOffset: number, endOffset: number) => void;
  /** Simulate a keydown event */
  pressKey: (
    key: string,
    modifiers?: { ctrl?: boolean; shift?: boolean; alt?: boolean; meta?: boolean }
  ) => void;
  /** Type text at current cursor position */
  type: (text: string) => void;
  /** Get block element by index */
  getBlock: (index: number) => Element | null;
  /** Get all block elements */
  getBlocks: () => Element[];
  /** Get the contentRef as a Vue ref (for composables) */
  contentRef: Ref<HTMLElement | null>;
  /** Cleanup function */
  destroy: () => void;
}

/**
 * Find a text node at a given offset within an element's text content.
 * Returns the text node and the offset within that node.
 */
function findTextNodeAtOffset(
  element: Element,
  targetOffset: number
): { node: Text; offset: number } | null {
  let currentOffset = 0;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let node: Text | null;
  let lastNode: Text | null = null;

  while ((node = walker.nextNode() as Text)) {
    lastNode = node;
    const nodeLength = node.textContent?.length || 0;
    if (currentOffset + nodeLength >= targetOffset) {
      return { node, offset: targetOffset - currentOffset };
    }
    currentOffset += nodeLength;
  }

  // If we're past the content, return end of last text node
  if (lastNode) {
    return { node: lastNode, offset: lastNode.textContent?.length || 0 };
  }

  return null;
}

/**
 * Get the key code string for common keys
 */
function getKeyCode(key: string): string {
  const keyCodes: Record<string, string> = {
    Enter: "Enter",
    Backspace: "Backspace",
    Delete: "Delete",
    Tab: "Tab",
    Escape: "Escape",
    ArrowUp: "ArrowUp",
    ArrowDown: "ArrowDown",
    ArrowLeft: "ArrowLeft",
    ArrowRight: "ArrowRight",
    " ": "Space",
  };

  if (keyCodes[key]) {
    return keyCodes[key]!;
  }

  // For single letters, use KeyX format
  if (key.length === 1 && /[a-zA-Z]/.test(key)) {
    return `Key${key.toUpperCase()}`;
  }

  // For digits
  if (key.length === 1 && /[0-9]/.test(key)) {
    return `Digit${key}`;
  }

  return key;
}

/**
 * Create a test editor with initial HTML content.
 * Provides a contenteditable div with cursor manipulation and assertion helpers.
 */
export function createTestEditor(initialHtml: string): TestEditorResult {
  // Create container
  const container = document.createElement("div");
  container.setAttribute("contenteditable", "true");
  container.innerHTML = initialHtml.trim();
  document.body.appendChild(container);

  // Create Vue ref for composables
  const contentRef = ref<HTMLElement | null>(container);

  function getHtml(): string {
    return container.innerHTML;
  }

  function getMarkdown(): string {
    return htmlToMarkdown(container);
  }

  function getCursorPosition(): { node: Node | null; offset: number } {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      return { node: null, offset: 0 };
    }
    const range = sel.getRangeAt(0);
    return { node: range.startContainer, offset: range.startOffset };
  }

  function getBlock(index: number): Element | null {
    const blocks = Array.from(container.children);
    return blocks[index] || null;
  }

  function getBlocks(): Element[] {
    return Array.from(container.children);
  }

  function getCursorOffsetInBlock(blockIndex: number): number {
    const block = getBlock(blockIndex);
    if (!block) return -1;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return -1;

    const range = sel.getRangeAt(0);
    if (!block.contains(range.startContainer)) return -1;

    // Calculate offset within block's text content
    const preRange = document.createRange();
    preRange.selectNodeContents(block);
    preRange.setEnd(range.startContainer, range.startOffset);
    return preRange.toString().length;
  }

  function setCursor(node: Node, offset: number): void {
    const range = document.createRange();
    range.setStart(node, offset);
    range.collapse(true);

    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  function setCursorInBlock(blockIndex: number, offset: number): void {
    const block = getBlock(blockIndex);
    if (!block) return;

    const result = findTextNodeAtOffset(block, offset);
    if (result) {
      setCursor(result.node, result.offset);
    }
  }

  function selectRange(
    startNode: Node,
    startOffset: number,
    endNode: Node,
    endOffset: number
  ): void {
    const range = document.createRange();
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);

    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  function selectInBlock(blockIndex: number, startOffset: number, endOffset: number): void {
    const block = getBlock(blockIndex);
    if (!block) return;

    const start = findTextNodeAtOffset(block, startOffset);
    const end = findTextNodeAtOffset(block, endOffset);

    if (start && end) {
      selectRange(start.node, start.offset, end.node, end.offset);
    }
  }

  function pressKey(
    key: string,
    modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean; meta?: boolean } = {}
  ): void {
    const event = new KeyboardEvent("keydown", {
      key,
      code: getKeyCode(key),
      ctrlKey: modifiers.ctrl || false,
      shiftKey: modifiers.shift || false,
      altKey: modifiers.alt || false,
      metaKey: modifiers.meta || false,
      bubbles: true,
      cancelable: true,
    });

    container.dispatchEvent(event);
  }

  function type(text: string): void {
    // Insert text at cursor position
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    range.deleteContents();

    const textNode = document.createTextNode(text);
    range.insertNode(textNode);

    // Move cursor after inserted text
    range.setStartAfter(textNode);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);

    // Dispatch input event
    container.dispatchEvent(new InputEvent("input", { bubbles: true }));
  }

  function destroy(): void {
    container.remove();
  }

  return {
    container,
    getHtml,
    getMarkdown,
    getCursorPosition,
    getCursorOffsetInBlock,
    setCursor,
    setCursorInBlock,
    selectRange,
    selectInBlock,
    pressKey,
    type,
    getBlock,
    getBlocks,
    contentRef,
    destroy,
  };
}
