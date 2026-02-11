/**
 * Code Block Toggle and Pattern Detection
 *
 * Extracted from useCodeBlocks for single-responsibility decomposition.
 * Handles toggling code blocks on/off and detecting code fence patterns
 * (```) typed inline to auto-convert them.
 */

import { Ref } from "vue";
import { UseMarkdownSelectionReturn } from "./useMarkdownSelection";
import { detectCodeFenceStart } from "../../shared/markdown";
import { positionCursorAtEnd } from "./cursorPosition";
import {
  getTargetBlock,
  getCodeBlockWrapper,
  createCodeBlockWrapper,
  convertCodeBlockToParagraph,
  isConvertibleBlock,
} from "./codeBlockUtils";
import type { CodeBlockState } from "./useCodeBlocks";

/**
 * Dependencies needed by toggle/pattern functions
 */
export interface CodeBlockToggleDeps {
  contentRef: Ref<HTMLElement | null>;
  selection: UseMarkdownSelectionReturn;
  codeBlocks: Map<string, CodeBlockState>;
  pendingFocusIds: Set<string>;
  onContentChange: () => void;
}

/**
 * Toggle code block on the current block.
 * If paragraph/div/heading: convert to code block wrapper.
 * If already in code block: convert back to paragraph.
 * If in a list: no-op (caller handles this).
 */
export function toggleCodeBlock(deps: CodeBlockToggleDeps): void {
  const { contentRef, selection, codeBlocks, pendingFocusIds, onContentChange } = deps;
  if (!contentRef.value) return;

  const wrapper = getCodeBlockWrapper(selection);
  if (wrapper) {
    const p = convertCodeBlockToParagraph(wrapper, codeBlocks);
    positionCursorAtEnd(p);
    onContentChange();
    return;
  }

  const block = getTargetBlock(contentRef, selection);
  if (!block) return;

  if (block.tagName === "LI") return;

  if (isConvertibleBlock(block)) {
    const content = block.textContent || "";
    const { wrapper: newWrapper, id } = createCodeBlockWrapper(content, "");

    codeBlocks.set(id, { id, content, language: "" });
    block.parentNode?.replaceChild(newWrapper, block);
    pendingFocusIds.add(id);
    onContentChange();
  }
}

/**
 * Check if the current block contains a code fence pattern (```) and convert it.
 * Only converts paragraphs/divs/headings, not existing code blocks or list items.
 * Returns true if a pattern was detected and converted.
 */
export function checkAndConvertCodeBlockPattern(deps: CodeBlockToggleDeps): boolean {
  const { contentRef, selection, codeBlocks, pendingFocusIds, onContentChange } = deps;
  if (!contentRef.value) return false;

  const block = getTargetBlock(contentRef, selection);
  if (!block) return false;
  if (!isConvertibleBlock(block)) return false;

  const textContent = block.textContent || "";
  const pattern = detectCodeFenceStart(textContent);
  if (!pattern) return false;

  const language = pattern.language || "";
  const { wrapper, id } = createCodeBlockWrapper("", language);

  codeBlocks.set(id, { id, content: "", language });
  block.parentNode?.replaceChild(wrapper, block);
  pendingFocusIds.add(id);
  onContentChange();

  return true;
}
