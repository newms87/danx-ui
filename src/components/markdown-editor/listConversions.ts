/**
 * List Conversions
 *
 * Pure DOM manipulation functions that create or destroy list structure.
 * Handles converting paragraphs to list items and list items back to
 * paragraphs, including splitting lists when removing middle items.
 *
 * No composable closure dependency - all functions take explicit parameters.
 * Used by useLists for toggle and Enter key operations.
 */

import { isListTag } from "./blockUtils";
import { getParentList } from "./listDomUtils";

/**
 * Convert a paragraph/div to a list item.
 * Creates a new list of the specified type containing the block's content.
 */
export function convertToListItem(block: Element, listType: "ul" | "ol"): HTMLLIElement {
  const list = document.createElement(listType);
  const li = document.createElement("li");

  while (block.firstChild) {
    li.appendChild(block.firstChild);
  }

  list.appendChild(li);
  block.parentNode?.replaceChild(list, block);

  return li;
}

/**
 * Convert a list item back to a paragraph.
 * Handles single-item lists, first/last item removal, and list splitting
 * for middle item removal.
 */
export function convertListItemToParagraph(
  li: HTMLLIElement,
  _contentRef: HTMLElement
): HTMLParagraphElement {
  const p = document.createElement("p");

  while (li.firstChild) {
    if (li.firstChild.nodeType === Node.ELEMENT_NODE) {
      const el = li.firstChild as Element;
      if (isListTag(el.tagName)) {
        li.removeChild(li.firstChild);
        continue;
      }
    }
    p.appendChild(li.firstChild);
  }

  const parentList = getParentList(li);
  if (!parentList) {
    li.parentNode?.replaceChild(p, li);
    return p;
  }

  if (parentList.children.length === 1) {
    parentList.parentNode?.replaceChild(p, parentList);
  } else {
    const items = Array.from(parentList.children);
    const index = items.indexOf(li);

    if (index === 0) {
      parentList.parentNode?.insertBefore(p, parentList);
    } else if (index === items.length - 1) {
      parentList.parentNode?.insertBefore(p, parentList.nextSibling);
    } else {
      const newList = document.createElement(parentList.tagName.toLowerCase()) as
        | HTMLUListElement
        | HTMLOListElement;
      for (let i = index + 1; i < items.length; i++) {
        newList.appendChild(items[i]!);
      }
      parentList.parentNode?.insertBefore(p, parentList.nextSibling);
      if (newList.children.length > 0) {
        p.parentNode?.insertBefore(newList, p.nextSibling);
      }
    }

    li.remove();
  }

  return p;
}
