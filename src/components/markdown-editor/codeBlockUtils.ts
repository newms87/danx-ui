import { Ref } from "vue";
import { UseMarkdownSelectionReturn } from "./useMarkdownSelection";
import { isConvertibleBlock, getTargetBlock as getTargetBlockShared } from "./blockUtils";
import { generateCodeBlockId } from "./syncConverters";

/**
 * Code block state (defined in useCodeBlocks, used here as a generic parameter)
 */
interface CodeBlockStateEntry {
  content: string;
}

/**
 * Get the block-level parent element for code block operations.
 * Delegates to the shared getTargetBlock with code block recognition enabled.
 */
export function getTargetBlock(
  contentRef: Ref<HTMLElement | null>,
  selection: UseMarkdownSelectionReturn
): Element | null {
  return getTargetBlockShared(contentRef, selection, {
    includeCodeBlocks: true,
    includeLists: true,
  });
}

/**
 * Get the code block wrapper element containing the cursor (if in a code block).
 * Walks up the DOM to find an element with data-code-block-id attribute.
 */
export function getCodeBlockWrapper(selection: UseMarkdownSelectionReturn): HTMLElement | null {
  const currentBlock = selection.getCurrentBlock();
  if (!currentBlock) return null;

  let current: Element | null = currentBlock;
  while (current) {
    if (current.hasAttribute("data-code-block-id")) {
      return current as HTMLElement;
    }
    current = current.parentElement;
  }

  return null;
}

/**
 * Create a code block wrapper with non-editable island structure.
 * Returns the wrapper div and the code block ID.
 */
export function createCodeBlockWrapper(
  content: string,
  language: string
): { wrapper: HTMLDivElement; id: string } {
  const id = generateCodeBlockId();

  const wrapper = document.createElement("div");
  wrapper.className = "code-block-wrapper";
  wrapper.setAttribute("contenteditable", "false");
  wrapper.setAttribute("data-code-block-id", id);

  // Create mount point for CodeViewer
  const mountPoint = document.createElement("div");
  mountPoint.className = "code-viewer-mount-point";

  // Store initial content and language as data attributes for the manager to read
  mountPoint.setAttribute("data-content", content);
  mountPoint.setAttribute("data-language", language);

  wrapper.appendChild(mountPoint);

  return { wrapper, id };
}

/**
 * Convert a code block wrapper back to a paragraph.
 * Removes the block from the codeBlocks map and replaces the wrapper in the DOM.
 */
export function convertCodeBlockToParagraph(
  wrapper: HTMLElement,
  codeBlocks: Map<string, CodeBlockStateEntry>
): HTMLParagraphElement {
  const p = document.createElement("p");
  const id = wrapper.getAttribute("data-code-block-id");

  // Get content from state
  const state = id ? codeBlocks.get(id) : null;
  p.textContent = state?.content || "";

  // Remove from state
  if (id) {
    codeBlocks.delete(id);
  }

  // Replace wrapper with paragraph
  wrapper.parentNode?.replaceChild(p, wrapper);

  return p;
}

export { isConvertibleBlock };
