import { Ref } from "vue";
import { UseMarkdownSelectionReturn } from "./useMarkdownSelection";
import { detectListPattern } from "../../shared/markdown";
import { positionCursorAtEnd, positionCursorAtStart } from "./cursorUtils";
import { isConvertibleBlock, getTargetBlock as getTargetBlockShared } from "./blockUtils";

/**
 * Options for useLists composable
 */
export interface UseListsOptions {
  contentRef: Ref<HTMLElement | null>;
  selection: UseMarkdownSelectionReturn;
  onContentChange: () => void;
}

/**
 * Return type for useLists composable
 */
export interface UseListsReturn {
  /** Toggle unordered list (Ctrl+Shift+[) */
  toggleUnorderedList: () => void;
  /** Toggle ordered list (Ctrl+Shift+]) */
  toggleOrderedList: () => void;
  /** Check for list pattern (e.g., "- ", "1. ") and convert if matched */
  checkAndConvertListPattern: () => boolean;
  /** Handle Enter key in list - returns true if handled */
  handleListEnter: () => boolean;
  /** Handle Tab key for list indentation - returns true if handled */
  indentListItem: () => boolean;
  /** Handle Shift+Tab key for list outdentation - returns true if handled */
  outdentListItem: () => boolean;
  /** Get current list type (ul, ol, or null if not in a list) */
  getCurrentListType: () => "ul" | "ol" | null;
  /** Convert current list item to paragraph - returns the new paragraph element or null */
  convertCurrentListItemToParagraph: () => HTMLParagraphElement | null;
}

/**
 * Get the block-level parent element for list operations.
 * Delegates to the shared getTargetBlock with list recognition enabled.
 */
function getTargetBlock(
  contentRef: Ref<HTMLElement | null>,
  selection: UseMarkdownSelectionReturn
): Element | null {
  return getTargetBlockShared(contentRef, selection, { includeLists: true });
}

/**
 * Get the list item element containing the cursor
 */
function getListItem(selection: UseMarkdownSelectionReturn): HTMLLIElement | null {
  const currentBlock = selection.getCurrentBlock();
  if (!currentBlock) return null;

  // Walk up to find LI
  let current: Element | null = currentBlock;
  while (current) {
    if (current.tagName === "LI") {
      return current as HTMLLIElement;
    }
    current = current.parentElement;
  }

  return null;
}

/**
 * Get the parent list element (UL or OL) of a list item
 */
function getParentList(li: HTMLLIElement): HTMLUListElement | HTMLOListElement | null {
  const parent = li.parentElement;
  if (parent && (parent.tagName === "UL" || parent.tagName === "OL")) {
    return parent as HTMLUListElement | HTMLOListElement;
  }
  return null;
}

/**
 * Check what type of list the cursor is in
 */
function getListType(selection: UseMarkdownSelectionReturn): "ul" | "ol" | null {
  const li = getListItem(selection);
  if (!li) return null;

  const parentList = getParentList(li);
  if (!parentList) return null;

  return parentList.tagName.toLowerCase() as "ul" | "ol";
}

/**
 * Convert a paragraph/div to a list item
 */
function convertToListItem(block: Element, listType: "ul" | "ol"): HTMLLIElement {
  const list = document.createElement(listType);
  const li = document.createElement("li");

  // Move content from block to list item
  while (block.firstChild) {
    li.appendChild(block.firstChild);
  }

  list.appendChild(li);

  // Replace block with list
  block.parentNode?.replaceChild(list, block);

  return li;
}

/**
 * Convert a list item back to a paragraph
 */
function convertListItemToParagraph(
  li: HTMLLIElement,
  _contentRef: HTMLElement
): HTMLParagraphElement {
  const p = document.createElement("p");

  // Move content from list item to paragraph
  while (li.firstChild) {
    // Skip nested lists
    if (li.firstChild.nodeType === Node.ELEMENT_NODE) {
      const el = li.firstChild as Element;
      if (el.tagName === "UL" || el.tagName === "OL") {
        li.removeChild(li.firstChild);
        continue;
      }
    }
    p.appendChild(li.firstChild);
  }

  const parentList = getParentList(li);
  if (!parentList) {
    // Just replace the li with p
    li.parentNode?.replaceChild(p, li);
    return p;
  }

  // Check if this is the only item in the list
  if (parentList.children.length === 1) {
    // Replace entire list with paragraph
    parentList.parentNode?.replaceChild(p, parentList);
  } else {
    // Find position of li in list
    const items = Array.from(parentList.children);
    const index = items.indexOf(li);

    if (index === 0) {
      // First item - insert paragraph before list
      parentList.parentNode?.insertBefore(p, parentList);
    } else if (index === items.length - 1) {
      // Last item - insert paragraph after list
      parentList.parentNode?.insertBefore(p, parentList.nextSibling);
    } else {
      // Middle item - split the list
      const newList = document.createElement(parentList.tagName.toLowerCase()) as
        | HTMLUListElement
        | HTMLOListElement;
      // Move items after current to new list
      for (let i = index + 1; i < items.length; i++) {
        newList.appendChild(items[i]!);
      }
      // Insert paragraph and new list after current list
      parentList.parentNode?.insertBefore(p, parentList.nextSibling);
      if (newList.children.length > 0) {
        p.parentNode?.insertBefore(newList, p.nextSibling);
      }
    }

    // Remove the original li
    li.remove();
  }

  return p;
}

/**
 * Get cursor offset within an element's text content (excluding nested lists)
 */
function getCursorOffsetInElement(element: Element): number {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return 0;

  const range = sel.getRangeAt(0);

  // Create a range from start of element to cursor position
  const preCaretRange = document.createRange();
  preCaretRange.selectNodeContents(element);
  preCaretRange.setEnd(range.startContainer, range.startOffset);

  // Count characters by walking text nodes, excluding nested lists
  let offset = 0;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let node: Text | null;

  while ((node = walker.nextNode() as Text | null)) {
    // Skip text nodes inside nested lists
    let parent: Node | null = node.parentNode;
    let inNestedList = false;
    while (parent && parent !== element) {
      if (parent.nodeName === "UL" || parent.nodeName === "OL") {
        inNestedList = true;
        break;
      }
      parent = parent.parentNode;
    }
    if (inNestedList) continue;

    // Check if this text node is before or at the cursor
    const nodeRange = document.createRange();
    nodeRange.selectNodeContents(node);

    if (preCaretRange.compareBoundaryPoints(Range.END_TO_START, nodeRange) >= 0) {
      // Entire node is before cursor
      offset += node.textContent?.length || 0;
    } else if (preCaretRange.compareBoundaryPoints(Range.END_TO_END, nodeRange) >= 0) {
      // Cursor is inside this node - calculate partial offset
      if (range.startContainer === node) {
        offset += range.startOffset;
      } else {
        offset += node.textContent?.length || 0;
      }
      break;
    } else {
      // Node is after cursor, stop
      break;
    }
  }

  return offset;
}

/**
 * Restore cursor to a specific text offset within an element (excluding nested lists)
 */
function restoreCursorToOffset(element: Element, targetOffset: number): void {
  const sel = window.getSelection();
  if (!sel) return;

  let currentOffset = 0;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let node: Text | null;

  while ((node = walker.nextNode() as Text | null)) {
    // Skip text nodes inside nested lists
    let parent: Node | null = node.parentNode;
    let inNestedList = false;
    while (parent && parent !== element) {
      if (parent.nodeName === "UL" || parent.nodeName === "OL") {
        inNestedList = true;
        break;
      }
      parent = parent.parentNode;
    }
    if (inNestedList) continue;

    const nodeLength = node.textContent?.length || 0;
    if (currentOffset + nodeLength >= targetOffset) {
      const range = document.createRange();
      range.setStart(node, targetOffset - currentOffset);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      return;
    }
    currentOffset += nodeLength;
  }

  // If offset not found (e.g., text is shorter), place cursor at end
  positionCursorAtEnd(element);
}

/**
 * Composable for list operations in markdown editor
 */
export function useLists(options: UseListsOptions): UseListsReturn {
  const { contentRef, selection, onContentChange } = options;

  /**
   * Toggle unordered list on the current block
   * - If paragraph/div: convert to <ul><li>
   * - If already in ul: convert back to paragraph
   * - If in ol: convert to ul
   */
  function toggleUnorderedList(): void {
    if (!contentRef.value) return;

    const currentListType = getListType(selection);

    if (currentListType === "ul") {
      // Already in ul - convert to paragraph
      const li = getListItem(selection);
      if (li) {
        const p = convertListItemToParagraph(li, contentRef.value);
        positionCursorAtEnd(p);
      }
    } else if (currentListType === "ol") {
      // In ol - convert to ul
      const li = getListItem(selection);
      if (li) {
        const parentList = getParentList(li);
        if (parentList) {
          const ul = document.createElement("ul");
          while (parentList.firstChild) {
            ul.appendChild(parentList.firstChild);
          }
          parentList.parentNode?.replaceChild(ul, parentList);
          // Find the li again (it moved) and position cursor
          const newLi = ul.querySelector("li");
          if (newLi) positionCursorAtEnd(newLi);
        }
      }
    } else {
      // Not in list - convert block to ul
      const block = getTargetBlock(contentRef, selection);
      if (block && isConvertibleBlock(block)) {
        const li = convertToListItem(block, "ul");
        positionCursorAtEnd(li);
      }
    }

    onContentChange();
  }

  /**
   * Toggle ordered list on the current block
   * - If paragraph/div: convert to <ol><li>
   * - If already in ol: convert back to paragraph
   * - If in ul: convert to ol
   */
  function toggleOrderedList(): void {
    if (!contentRef.value) return;

    const currentListType = getListType(selection);

    if (currentListType === "ol") {
      // Already in ol - convert to paragraph
      const li = getListItem(selection);
      if (li) {
        const p = convertListItemToParagraph(li, contentRef.value);
        positionCursorAtEnd(p);
      }
    } else if (currentListType === "ul") {
      // In ul - convert to ol
      const li = getListItem(selection);
      if (li) {
        const parentList = getParentList(li);
        if (parentList) {
          const ol = document.createElement("ol");
          while (parentList.firstChild) {
            ol.appendChild(parentList.firstChild);
          }
          parentList.parentNode?.replaceChild(ol, parentList);
          // Find the li again (it moved) and position cursor
          const newLi = ol.querySelector("li");
          if (newLi) positionCursorAtEnd(newLi);
        }
      }
    } else {
      // Not in list - convert block to ol
      const block = getTargetBlock(contentRef, selection);
      if (block && isConvertibleBlock(block)) {
        const li = convertToListItem(block, "ol");
        positionCursorAtEnd(li);
      }
    }

    onContentChange();
  }

  /**
   * Check if the current block contains a list pattern (e.g., "- ", "1. ")
   * and convert it to the appropriate list if detected.
   * Only converts paragraphs/divs/headings, not existing list items.
   * @returns true if a pattern was detected and converted, false otherwise
   */
  function checkAndConvertListPattern(): boolean {
    if (!contentRef.value) return false;

    const block = getTargetBlock(contentRef, selection);
    if (!block) return false;

    // Only convert paragraphs, divs, or headings - don't convert existing list items
    if (!isConvertibleBlock(block)) return false;

    // Get the text content of the block
    const textContent = block.textContent || "";

    // Check for list pattern
    const pattern = detectListPattern(textContent);
    if (!pattern) return false;

    // Pattern detected - convert to list
    const listType = pattern.type === "unordered" ? "ul" : "ol";
    const remainingContent = pattern.content;

    // Create the new list structure
    const list = document.createElement(listType);
    const li = document.createElement("li");
    li.textContent = remainingContent;
    list.appendChild(li);

    // Replace block with list
    block.parentNode?.replaceChild(list, block);

    // Position cursor at the end of the content
    positionCursorAtEnd(li);

    // Notify of content change
    onContentChange();

    return true;
  }

  /**
   * Handle Enter key press when in a list
   * - If list item has content: create new list item after current
   * - If list item is empty AND nested: outdent to parent list level
   * - If list item is empty AND at top level: exit list (convert to paragraph)
   * @returns true if the Enter was handled, false to let browser handle it
   */
  function handleListEnter(): boolean {
    if (!contentRef.value) return false;

    // Check if we're in a list
    const li = getListItem(selection);
    if (!li) return false;

    const parentList = getParentList(li);
    if (!parentList) return false;

    // Check if list item is empty (ignoring nested lists within the li)
    // We need to check only direct text content, not nested list content
    const directContent = getDirectTextContent(li);

    if (directContent === "") {
      // Empty list item - check if nested or at top level
      const parentLi = parentList.parentElement;
      const isNested = parentLi && parentLi.tagName === "LI";

      if (isNested) {
        // Nested list - outdent to parent level
        return outdentListItem();
      } else {
        // Top level - exit list (convert to paragraph)
        const p = convertListItemToParagraph(li, contentRef.value);
        positionCursorAtStart(p);
        onContentChange();
        return true;
      }
    }

    // List item has content - create new list item
    // Get cursor position within the li
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;

    const range = sel.getRangeAt(0);

    // Check if cursor is at end of list item
    const cursorAtEnd = isCursorAtEndOfElement(li, range);

    // Create new list item
    const newLi = document.createElement("li");

    if (cursorAtEnd) {
      // Cursor at end - create empty new item
      newLi.appendChild(document.createElement("br")); // Ensure empty li is editable
    } else {
      // Cursor in middle - split content
      // Extract content after cursor
      const afterRange = document.createRange();
      afterRange.setStart(range.endContainer, range.endOffset);
      afterRange.setEndAfter(li.lastChild || li);
      const afterContent = afterRange.extractContents();
      newLi.appendChild(afterContent);
    }

    // Insert new li after current
    li.parentNode?.insertBefore(newLi, li.nextSibling);

    // Position cursor at start of new li
    positionCursorAtStart(newLi);

    onContentChange();
    return true;
  }

  /**
   * Get direct text content of an element, excluding nested lists
   */
  function getDirectTextContent(element: Element): string {
    let text = "";
    const children = Array.from(element.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.TEXT_NODE) {
        text += child.textContent || "";
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as Element;
        // Skip nested lists
        if (el.tagName !== "UL" && el.tagName !== "OL") {
          text += getDirectTextContent(el);
        }
      }
    }
    return text.trim();
  }

  /**
   * Check if cursor is at the end of an element
   */
  function isCursorAtEndOfElement(element: Element, range: Range): boolean {
    // Create a range from cursor to end of element
    const testRange = document.createRange();
    testRange.setStart(range.endContainer, range.endOffset);
    testRange.setEndAfter(element.lastChild || element);

    // If the range is empty, cursor is at end
    return testRange.toString().trim() === "";
  }

  /**
   * Indent current list item (Tab key)
   * Creates a nested list inside the previous list item
   * @returns true if handled, false otherwise
   */
  function indentListItem(): boolean {
    if (!contentRef.value) return false;

    const li = getListItem(selection);
    if (!li) return false;

    const parentList = getParentList(li);
    if (!parentList) return false;

    // Get previous sibling li
    const prevLi = li.previousElementSibling;
    if (!prevLi || prevLi.tagName !== "LI") return false; // Can't indent first item

    // Save cursor offset within this specific list item before DOM manipulation
    const cursorOffset = getCursorOffsetInElement(li);

    // Check if prev li already has a nested list
    let nestedList = prevLi.querySelector(":scope > ul, :scope > ol") as
      | HTMLUListElement
      | HTMLOListElement
      | null;

    if (!nestedList) {
      // Create nested list of same type
      nestedList = document.createElement(parentList.tagName.toLowerCase()) as
        | HTMLUListElement
        | HTMLOListElement;
      prevLi.appendChild(nestedList);
    }

    // Move current li to nested list
    nestedList.appendChild(li);

    // Restore cursor to same offset within the moved list item
    restoreCursorToOffset(li, cursorOffset);

    onContentChange();
    return true;
  }

  /**
   * Outdent current list item (Shift+Tab key)
   * Moves list item up one level
   * @returns true if handled, false otherwise
   */
  function outdentListItem(): boolean {
    if (!contentRef.value) return false;

    const li = getListItem(selection);
    if (!li) return false;

    const parentList = getParentList(li);
    if (!parentList) return false;

    // Check if parent list is nested (has a parent li)
    const parentLi = parentList.parentElement;
    if (!parentLi || parentLi.tagName !== "LI") {
      // Already at top level - convert to paragraph
      const cursorOffset = getCursorOffsetInElement(li);
      const p = convertListItemToParagraph(li, contentRef.value);
      restoreCursorToOffset(p, cursorOffset);
      onContentChange();
      return true;
    }

    // Save cursor offset within this specific list item before DOM manipulation
    const cursorOffset = getCursorOffsetInElement(li);

    // Find the grandparent list
    const grandparentList = getParentList(parentLi as HTMLLIElement);
    if (!grandparentList) return false;

    // Move items after current li to a new nested list in current li
    const itemsAfter = [];
    let sibling = li.nextElementSibling;
    while (sibling) {
      const next = sibling.nextElementSibling;
      itemsAfter.push(sibling);
      sibling = next;
    }

    if (itemsAfter.length > 0) {
      // Create nested list for items after
      let nestedList = li.querySelector(":scope > ul, :scope > ol") as
        | HTMLUListElement
        | HTMLOListElement
        | null;
      if (!nestedList) {
        nestedList = document.createElement(parentList.tagName.toLowerCase()) as
          | HTMLUListElement
          | HTMLOListElement;
        li.appendChild(nestedList);
      }
      for (const item of itemsAfter) {
        nestedList.appendChild(item);
      }
    }

    // Move current li after parent li in grandparent list
    grandparentList.insertBefore(li, parentLi.nextSibling);

    // Clean up empty parent list
    if (parentList.children.length === 0) {
      parentList.remove();
    }

    // Restore cursor to same offset within the moved list item
    restoreCursorToOffset(li, cursorOffset);

    onContentChange();
    return true;
  }

  /**
   * Get current list type (exposed for menu)
   */
  function getCurrentListType(): "ul" | "ol" | null {
    return getListType(selection);
  }

  /**
   * Convert current list item to paragraph
   * Used when switching from list to heading/paragraph via menu
   * @returns the new paragraph element, or null if not in a list
   */
  function convertCurrentListItemToParagraphFn(): HTMLParagraphElement | null {
    if (!contentRef.value) return null;

    const li = getListItem(selection);
    if (!li) return null;

    const p = convertListItemToParagraph(li, contentRef.value);
    positionCursorAtEnd(p);
    onContentChange();
    return p;
  }

  return {
    toggleUnorderedList,
    toggleOrderedList,
    checkAndConvertListPattern,
    handleListEnter,
    indentListItem,
    outdentListItem,
    getCurrentListType,
    convertCurrentListItemToParagraph: convertCurrentListItemToParagraphFn,
  };
}
