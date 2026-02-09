/**
 * Hotkey Helpers
 *
 * Helper functions for hotkey actions that need to handle
 * list-to-heading/code-block conversions before applying changes.
 */

import { UseMarkdownEditorReturn } from "./useMarkdownEditor";

/** Set heading level, converting list items to paragraph first if needed. */
export function setHeadingWithListHandling(
  editor: UseMarkdownEditorReturn,
  level: 0 | 1 | 2 | 3 | 4 | 5 | 6
): void {
  const listType = editor.lists.getCurrentListType();
  if (listType) {
    editor.lists.convertCurrentListItemToParagraph();
  }
  if (level > 0 || !listType) {
    editor.headings.setHeadingLevel(level);
  }
}

/** Increase heading level, converting list items to paragraph first if needed. */
export function increaseHeadingWithListHandling(editor: UseMarkdownEditorReturn): void {
  const listType = editor.lists.getCurrentListType();
  if (listType) {
    editor.lists.convertCurrentListItemToParagraph();
    editor.headings.setHeadingLevel(6);
  } else {
    editor.headings.increaseHeadingLevel();
  }
}

/** Decrease heading level, converting list items to paragraph first if needed. */
export function decreaseHeadingWithListHandling(editor: UseMarkdownEditorReturn): void {
  const listType = editor.lists.getCurrentListType();
  if (listType) {
    editor.lists.convertCurrentListItemToParagraph();
  } else {
    editor.headings.decreaseHeadingLevel();
  }
}

/** Toggle code block, converting list items to paragraph first if needed. */
export function toggleCodeBlockWithListHandling(editor: UseMarkdownEditorReturn): void {
  if (editor.codeBlocks.isInCodeBlock()) {
    editor.codeBlocks.toggleCodeBlock();
    return;
  }
  const listType = editor.lists.getCurrentListType();
  if (listType) {
    editor.lists.convertCurrentListItemToParagraph();
  }
  editor.codeBlocks.toggleCodeBlock();
}
