/**
 * List Operations Composable
 *
 * Orchestrates list functionality by composing domain-specific modules:
 * - listDomUtils: DOM traversal and query functions
 * - listConversions: Creating/destroying list structure
 * - listIndentation: Tab/Shift+Tab indent/outdent operations
 *
 * Provides list toggling, pattern detection, Enter key handling,
 * and exposes indent/outdent from the indentation module.
 *
 * @see listDomUtils.ts for DOM query utilities
 * @see listConversions.ts for structure conversion
 * @see listIndentation.ts for indent/outdent operations
 */

import { Ref } from "vue";
import { UseMarkdownSelectionReturn } from "./useMarkdownSelection";
import { detectListPattern } from "../../shared/markdown";
import { positionCursorAtEnd, positionCursorAtStart } from "./cursorPosition";
import { isConvertibleBlock } from "./blockUtils";
import {
  getTargetBlock,
  getListItem,
  getParentList,
  getListType,
  getDirectTextContent,
  isCursorAtEndOfElement,
} from "./listDomUtils";
import { convertToListItem, convertListItemToParagraph } from "./listConversions";
import { createListIndentation } from "./listIndentation";

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
  toggleUnorderedList: () => void;
  toggleOrderedList: () => void;
  checkAndConvertListPattern: () => boolean;
  handleListEnter: () => boolean;
  indentListItem: () => boolean;
  outdentListItem: () => boolean;
  getCurrentListType: () => "ul" | "ol" | null;
  convertCurrentListItemToParagraph: () => HTMLParagraphElement | null;
}

/**
 * Composable for list operations in markdown editor.
 * Composes indentation sub-module and provides list toggle/creation/enter handling.
 */
export function useLists(options: UseListsOptions): UseListsReturn {
  const { contentRef, selection, onContentChange } = options;

  const { indentListItem, outdentListItem } = createListIndentation({
    contentRef,
    selection,
    onContentChange,
  });

  function toggleList(type: "ul" | "ol"): void {
    if (!contentRef.value) return;

    const otherType = type === "ul" ? "ol" : "ul";
    const currentListType = getListType(selection);

    if (currentListType === type) {
      const li = getListItem(selection);
      if (li) {
        const p = convertListItemToParagraph(li, contentRef.value);
        positionCursorAtEnd(p);
      }
    } else if (currentListType === otherType) {
      const li = getListItem(selection);
      if (li) {
        const parentList = getParentList(li);
        if (parentList) {
          const newList = document.createElement(type);
          while (parentList.firstChild) {
            newList.appendChild(parentList.firstChild);
          }
          parentList.parentNode?.replaceChild(newList, parentList);
          const newLi = newList.querySelector("li");
          if (newLi) positionCursorAtEnd(newLi);
        }
      }
    } else {
      const block = getTargetBlock(contentRef, selection);
      if (block && isConvertibleBlock(block)) {
        const li = convertToListItem(block, type);
        positionCursorAtEnd(li);
      }
    }

    onContentChange();
  }

  function toggleUnorderedList(): void {
    toggleList("ul");
  }

  function toggleOrderedList(): void {
    toggleList("ol");
  }

  function checkAndConvertListPattern(): boolean {
    if (!contentRef.value) return false;

    const block = getTargetBlock(contentRef, selection);
    if (!block) return false;
    if (!isConvertibleBlock(block)) return false;

    const textContent = block.textContent || "";
    const pattern = detectListPattern(textContent);
    if (!pattern) return false;

    const listType = pattern.type === "unordered" ? "ul" : "ol";
    const remainingContent = pattern.content;

    const list = document.createElement(listType);
    const li = document.createElement("li");
    li.textContent = remainingContent;
    list.appendChild(li);
    block.parentNode?.replaceChild(list, block);

    positionCursorAtEnd(li);
    onContentChange();
    return true;
  }

  function handleListEnter(): boolean {
    if (!contentRef.value) return false;

    const li = getListItem(selection);
    if (!li) return false;

    const parentList = getParentList(li);
    if (!parentList) return false;

    const directContent = getDirectTextContent(li);

    if (directContent === "") {
      const parentLi = parentList.parentElement;
      const isNested = parentLi && parentLi.tagName === "LI";

      if (isNested) {
        return outdentListItem();
      } else {
        const p = convertListItemToParagraph(li, contentRef.value);
        positionCursorAtStart(p);
        onContentChange();
        return true;
      }
    }

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;

    const range = sel.getRangeAt(0);
    const cursorAtEnd = isCursorAtEndOfElement(li, range);
    const newLi = document.createElement("li");

    if (cursorAtEnd) {
      newLi.appendChild(document.createElement("br"));
    } else {
      const afterRange = document.createRange();
      afterRange.setStart(range.endContainer, range.endOffset);
      afterRange.setEndAfter(li.lastChild || li);
      const afterContent = afterRange.extractContents();
      newLi.appendChild(afterContent);
    }

    li.parentNode?.insertBefore(newLi, li.nextSibling);
    positionCursorAtStart(newLi);
    onContentChange();
    return true;
  }

  function getCurrentListType(): "ul" | "ol" | null {
    return getListType(selection);
  }

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
