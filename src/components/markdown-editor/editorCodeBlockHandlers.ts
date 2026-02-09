/**
 * Editor Code Block Handlers
 *
 * Handles code block lifecycle events within the editor: exiting a code block
 * (double-Enter creates a new paragraph after it) and deleting a code block
 * (Backspace/Delete on empty block removes it and positions cursor nearby).
 *
 * Each handler receives the code block ID and operates on the DOM via
 * the shared dependencies (contentRef, codeBlocks state, sync).
 */

import { nextTick, Ref } from "vue";

/**
 * Dependencies for code block handlers
 */
export interface CodeBlockHandlerDeps {
  contentRef: Ref<HTMLElement | null>;
  codeBlocksMap: Map<string, unknown>;
  debouncedSyncFromHtml: () => void;
}

/**
 * Return type for createCodeBlockHandlers factory
 */
export interface CodeBlockHandlersReturn {
  handleCodeBlockExit: (id: string) => void;
  handleCodeBlockDelete: (id: string) => void;
}

/**
 * Creates code block handler functions bound to editor dependencies.
 */
export function createCodeBlockHandlers(deps: CodeBlockHandlerDeps): CodeBlockHandlersReturn {
  const { contentRef, codeBlocksMap, debouncedSyncFromHtml } = deps;

  /**
   * Handle code block exit (double-Enter at end of code block).
   * Creates a new paragraph after the code block and positions cursor there.
   */
  function handleCodeBlockExit(id: string): void {
    if (!contentRef.value) return;

    const wrapper = contentRef.value.querySelector(`[data-code-block-id="${id}"]`);
    if (!wrapper) return;

    const p = document.createElement("p");
    p.appendChild(document.createElement("br"));
    wrapper.parentNode?.insertBefore(p, wrapper.nextSibling);

    nextTick(() => {
      const range = document.createRange();
      range.selectNodeContents(p);
      range.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      p.focus();
    });

    debouncedSyncFromHtml();
  }

  /**
   * Handle code block delete (Backspace/Delete on empty code block).
   * Removes the code block and positions cursor in the previous or next element.
   */
  function handleCodeBlockDelete(id: string): void {
    if (!contentRef.value) return;

    const wrapper = contentRef.value.querySelector(`[data-code-block-id="${id}"]`);
    if (!wrapper) return;

    const previousSibling = wrapper.previousElementSibling;
    const nextSibling = wrapper.nextElementSibling;

    codeBlocksMap.delete(id);
    wrapper.remove();

    nextTick(() => {
      let targetElement: Element | null = null;

      if (previousSibling) {
        targetElement = previousSibling;
      } else if (nextSibling) {
        targetElement = nextSibling;
      } else {
        const p = document.createElement("p");
        p.appendChild(document.createElement("br"));
        contentRef.value?.appendChild(p);
        targetElement = p;
      }

      if (targetElement) {
        const range = document.createRange();
        range.selectNodeContents(targetElement);
        range.collapse(previousSibling ? false : true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    });

    debouncedSyncFromHtml();
  }

  return { handleCodeBlockExit, handleCodeBlockDelete };
}
