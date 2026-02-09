/**
 * Editor Actions
 *
 * Standalone editor actions that modify the document structure.
 * Currently provides insertHorizontalRule for adding <hr> elements.
 *
 * Each action receives shared dependencies (contentRef, sync) and
 * operates directly on the DOM.
 */

import { nextTick, Ref } from "vue";

/**
 * Dependencies for editor actions
 */
export interface EditorActionDeps {
  contentRef: Ref<HTMLElement | null>;
  debouncedSyncFromHtml: () => void;
}

/**
 * Return type for createEditorActions factory
 */
export interface EditorActionsReturn {
  insertHorizontalRule: () => void;
  insertTabCharacter: () => void;
}

/**
 * Creates editor action functions bound to editor dependencies.
 */
export function createEditorActions(deps: EditorActionDeps): EditorActionsReturn {
  const { contentRef, debouncedSyncFromHtml } = deps;

  /**
   * Insert a horizontal rule after the current block element.
   * Creates an <hr> element followed by a new paragraph for continued editing.
   */
  function insertHorizontalRule(): void {
    if (!contentRef.value) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    let node: Node | null = sel.getRangeAt(0).startContainer;
    let blockElement: HTMLElement | null = null;

    while (node && node !== contentRef.value) {
      const element = node as HTMLElement;
      const tagName = element.tagName?.toUpperCase();

      if (
        tagName === "P" ||
        /^H[1-6]$/.test(tagName) ||
        tagName === "LI" ||
        tagName === "BLOCKQUOTE"
      ) {
        blockElement = element;
        break;
      }

      if (element.hasAttribute?.("data-code-block-id")) {
        blockElement = element;
        break;
      }

      node = element.parentElement;
    }

    const insertAfter = blockElement || contentRef.value.lastElementChild;

    if (!insertAfter) {
      const hr = document.createElement("hr");
      const p = document.createElement("p");
      p.appendChild(document.createElement("br"));
      contentRef.value.appendChild(hr);
      contentRef.value.appendChild(p);
    } else {
      const hr = document.createElement("hr");
      const p = document.createElement("p");
      p.appendChild(document.createElement("br"));

      let insertionPoint: Element = insertAfter;
      if (insertAfter.tagName?.toUpperCase() === "LI") {
        const parentList = insertAfter.closest("ul, ol");
        if (parentList) {
          insertionPoint = parentList;
        }
      }

      insertionPoint.parentNode?.insertBefore(hr, insertionPoint.nextSibling);
      hr.parentNode?.insertBefore(p, hr.nextSibling);
    }

    nextTick(() => {
      const newParagraph = contentRef.value?.querySelector("hr + p");
      if (newParagraph) {
        const range = document.createRange();
        range.selectNodeContents(newParagraph);
        range.collapse(true);
        const newSel = window.getSelection();
        newSel?.removeAllRanges();
        newSel?.addRange(range);
      }
    });

    debouncedSyncFromHtml();
  }

  /**
   * Insert a tab character at the current cursor position.
   */
  function insertTabCharacter(): void {
    if (!contentRef.value) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    range.deleteContents();

    const tabNode = document.createTextNode("\t");
    range.insertNode(tabNode);

    range.setStartAfter(tabNode);
    range.setEndAfter(tabNode);

    sel.removeAllRanges();
    sel.addRange(range);

    debouncedSyncFromHtml();
  }

  return { insertHorizontalRule, insertTabCharacter };
}
