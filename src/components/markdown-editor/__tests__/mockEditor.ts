import { ref } from "vue";
import { vi } from "vitest";
import { UseMarkdownEditorReturn } from "../useMarkdownEditor";

/**
 * Create a mock UseMarkdownEditorReturn for testing composables
 * that depend on the editor interface.
 */
export function createMockEditor(): UseMarkdownEditorReturn {
  return {
    renderedHtml: ref(""),
    isInternalUpdate: ref(false),
    isShowingHotkeyHelp: ref(false),
    charCount: ref(0),
    onInput: vi.fn(),
    onKeyDown: vi.fn(),
    onBlur: vi.fn(),
    setMarkdown: vi.fn(),
    insertHorizontalRule: vi.fn(),
    showHotkeyHelp: vi.fn(),
    hideHotkeyHelp: vi.fn(),
    hotkeyDefinitions: ref([]),
    headings: {
      setHeadingLevel: vi.fn(),
      getCurrentHeadingLevel: vi.fn(() => 0),
      increaseHeadingLevel: vi.fn(),
      decreaseHeadingLevel: vi.fn(),
    } as unknown as UseMarkdownEditorReturn["headings"],
    inlineFormatting: {
      toggleBold: vi.fn(),
      toggleItalic: vi.fn(),
      toggleInlineCode: vi.fn(),
      toggleStrikethrough: vi.fn(),
      toggleHighlight: vi.fn(),
      toggleUnderline: vi.fn(),
    } as unknown as UseMarkdownEditorReturn["inlineFormatting"],
    links: {
      insertLink: vi.fn(),
    } as unknown as UseMarkdownEditorReturn["links"],
    lists: {
      toggleUnorderedList: vi.fn(),
      toggleOrderedList: vi.fn(),
      getCurrentListType: vi.fn(() => null),
      convertCurrentListItemToParagraph: vi.fn(),
    } as unknown as UseMarkdownEditorReturn["lists"],
    codeBlocks: {
      toggleCodeBlock: vi.fn(),
      isInCodeBlock: vi.fn(() => false),
    } as unknown as UseMarkdownEditorReturn["codeBlocks"],
    codeBlockManager: {} as unknown as UseMarkdownEditorReturn["codeBlockManager"],
    blockquotes: {
      toggleBlockquote: vi.fn(),
    } as unknown as UseMarkdownEditorReturn["blockquotes"],
    tables: {
      insertTable: vi.fn(),
      isInTable: vi.fn(() => false),
      insertRowAbove: vi.fn(),
      insertRowBelow: vi.fn(),
      insertColumnLeft: vi.fn(),
      insertColumnRight: vi.fn(),
      deleteCurrentRow: vi.fn(),
      deleteCurrentColumn: vi.fn(),
      deleteTable: vi.fn(),
      setColumnAlignmentLeft: vi.fn(),
      setColumnAlignmentCenter: vi.fn(),
      setColumnAlignmentRight: vi.fn(),
    } as unknown as UseMarkdownEditorReturn["tables"],
    tokenManager: {} as unknown as UseMarkdownEditorReturn["tokenManager"],
    tokens: new Map(),
  };
}
