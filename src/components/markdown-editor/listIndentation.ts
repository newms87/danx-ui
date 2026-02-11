/**
 * List Indentation
 *
 * Handles list item indentation (Tab) and outdentation (Shift+Tab).
 * Indent creates a nested list inside the previous sibling list item.
 * Outdent moves the item up one level, carrying subsequent siblings.
 *
 * Factory function receives shared dependencies and returns indent/outdent methods.
 * Used by useLists for Tab/Shift+Tab key handling.
 */

import { Ref } from "vue";
import { UseMarkdownSelectionReturn } from "./useMarkdownSelection";
import { getCursorOffset, setCursorOffset } from "./cursorOffset";
import { getListItem, getParentList } from "./listDomUtils";
import { convertListItemToParagraph } from "./listConversions";

/** Tag names to skip when calculating cursor offset in list items */
const LIST_ANCESTOR_TAGS = ["UL", "OL"];

/**
 * Dependencies for list indentation operations
 */
export interface ListIndentationDeps {
  contentRef: Ref<HTMLElement | null>;
  selection: UseMarkdownSelectionReturn;
  onContentChange: () => void;
}

/**
 * Return type for createListIndentation factory
 */
export interface ListIndentationReturn {
  indentListItem: () => boolean;
  outdentListItem: () => boolean;
}

/**
 * Creates list indentation methods bound to shared dependencies.
 */
export function createListIndentation(deps: ListIndentationDeps): ListIndentationReturn {
  const { contentRef, selection, onContentChange } = deps;

  /**
   * Indent current list item (Tab key).
   * Creates a nested list inside the previous list item.
   * Returns true if handled, false otherwise.
   */
  function indentListItem(): boolean {
    if (!contentRef.value) return false;

    const li = getListItem(selection);
    if (!li) return false;

    const parentList = getParentList(li);
    if (!parentList) return false;

    const prevLi = li.previousElementSibling;
    if (!prevLi || prevLi.tagName !== "LI") return false;

    const cursorOffset = getCursorOffset(li as HTMLElement, {
      skipAncestorTags: LIST_ANCESTOR_TAGS,
    });

    let nestedList = prevLi.querySelector(":scope > ul, :scope > ol") as
      | HTMLUListElement
      | HTMLOListElement
      | null;

    if (!nestedList) {
      nestedList = document.createElement(parentList.tagName.toLowerCase()) as
        | HTMLUListElement
        | HTMLOListElement;
      prevLi.appendChild(nestedList);
    }

    nestedList.appendChild(li);

    setCursorOffset(li as HTMLElement, cursorOffset, { skipAncestorTags: LIST_ANCESTOR_TAGS });

    onContentChange();
    return true;
  }

  /**
   * Outdent current list item (Shift+Tab key).
   * Moves list item up one level. At top level, converts to paragraph.
   * Returns true if handled, false otherwise.
   */
  function outdentListItem(): boolean {
    if (!contentRef.value) return false;

    const li = getListItem(selection);
    if (!li) return false;

    const parentList = getParentList(li);
    if (!parentList) return false;

    const parentLi = parentList.parentElement;
    if (!parentLi || parentLi.tagName !== "LI") {
      // Already at top level - convert to paragraph
      const cursorOffset = getCursorOffset(li as HTMLElement, {
        skipAncestorTags: LIST_ANCESTOR_TAGS,
      });
      const p = convertListItemToParagraph(li, contentRef.value);
      setCursorOffset(p as HTMLElement, cursorOffset, { skipAncestorTags: LIST_ANCESTOR_TAGS });
      onContentChange();
      return true;
    }

    const cursorOffset = getCursorOffset(li as HTMLElement, {
      skipAncestorTags: LIST_ANCESTOR_TAGS,
    });

    const grandparentList = getParentList(parentLi as HTMLLIElement);
    if (!grandparentList) return false;

    const itemsAfter = [];
    let sibling = li.nextElementSibling;
    while (sibling) {
      const next = sibling.nextElementSibling;
      itemsAfter.push(sibling);
      sibling = next;
    }

    if (itemsAfter.length > 0) {
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

    grandparentList.insertBefore(li, parentLi.nextSibling);

    if (parentList.children.length === 0) {
      parentList.remove();
    }

    setCursorOffset(li as HTMLElement, cursorOffset, { skipAncestorTags: LIST_ANCESTOR_TAGS });

    onContentChange();
    return true;
  }

  return { indentListItem, outdentListItem };
}
