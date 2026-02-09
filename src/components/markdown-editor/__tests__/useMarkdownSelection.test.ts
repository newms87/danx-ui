import { describe, it, expect, afterEach } from "vitest";
import { useMarkdownSelection } from "../useMarkdownSelection";
import { createTestEditor, TestEditorResult } from "./editorTestUtils";

describe("useMarkdownSelection", () => {
  let editor: TestEditorResult;

  afterEach(() => {
    if (editor) editor.destroy();
  });

  describe("getCurrentBlock", () => {
    it("returns null when contentRef is null", () => {
      const { ref } = require("vue");
      const contentRef = ref(null);
      const selection = useMarkdownSelection(contentRef);
      expect(selection.getCurrentBlock()).toBeNull();
    });

    it("returns null when no selection exists", () => {
      editor = createTestEditor("<p>Hello</p>");
      const selection = useMarkdownSelection(editor.contentRef);
      window.getSelection()?.removeAllRanges();
      expect(selection.getCurrentBlock()).toBeNull();
    });

    it("returns the paragraph containing the cursor", () => {
      editor = createTestEditor("<p>Hello</p><p>World</p>");
      const selection = useMarkdownSelection(editor.contentRef);
      editor.setCursorInBlock(0, 3);

      const block = selection.getCurrentBlock();
      expect(block?.tagName).toBe("P");
      expect(block?.textContent).toBe("Hello");
    });

    it("returns the heading containing the cursor", () => {
      editor = createTestEditor("<h2>Title</h2><p>Body</p>");
      const selection = useMarkdownSelection(editor.contentRef);
      editor.setCursorInBlock(0, 2);

      const block = selection.getCurrentBlock();
      expect(block?.tagName).toBe("H2");
    });

    it("returns the LI containing the cursor in a list", () => {
      editor = createTestEditor("<ul><li>Item 1</li><li>Item 2</li></ul>");
      const selection = useMarkdownSelection(editor.contentRef);

      const secondLi = editor.container.querySelectorAll("li")[1]!;
      const textNode = secondLi.firstChild!;
      editor.setCursor(textNode, 2);

      const block = selection.getCurrentBlock();
      expect(block?.tagName).toBe("LI");
      expect(block?.textContent).toBe("Item 2");
    });

    it("returns PRE for cursor in code block", () => {
      editor = createTestEditor("<pre>code here</pre>");
      const selection = useMarkdownSelection(editor.contentRef);

      const pre = editor.container.querySelector("pre")!;
      const textNode = pre.firstChild!;
      editor.setCursor(textNode, 3);

      const block = selection.getCurrentBlock();
      expect(block?.tagName).toBe("PRE");
    });

    it("returns BLOCKQUOTE for cursor in blockquote", () => {
      editor = createTestEditor("<blockquote>quoted text</blockquote>");
      const selection = useMarkdownSelection(editor.contentRef);

      const bq = editor.container.querySelector("blockquote")!;
      const textNode = bq.firstChild!;
      editor.setCursor(textNode, 3);

      const block = selection.getCurrentBlock();
      expect(block?.tagName).toBe("BLOCKQUOTE");
    });

    it("walks up from inline elements to find block parent", () => {
      editor = createTestEditor("<p><strong>bold text</strong></p>");
      const selection = useMarkdownSelection(editor.contentRef);

      const strong = editor.container.querySelector("strong")!;
      const textNode = strong.firstChild!;
      editor.setCursor(textNode, 2);

      const block = selection.getCurrentBlock();
      expect(block?.tagName).toBe("P");
    });
  });

  describe("getBlockIndex", () => {
    it("returns -1 when contentRef is null", () => {
      const { ref } = require("vue");
      const contentRef = ref(null);
      const selection = useMarkdownSelection(contentRef);
      expect(selection.getBlockIndex()).toBe(-1);
    });

    it("returns -1 when no block contains cursor", () => {
      editor = createTestEditor("<p>Hello</p>");
      const selection = useMarkdownSelection(editor.contentRef);
      window.getSelection()?.removeAllRanges();
      expect(selection.getBlockIndex()).toBe(-1);
    });

    it("returns correct index for first block", () => {
      editor = createTestEditor("<p>First</p><p>Second</p><p>Third</p>");
      const selection = useMarkdownSelection(editor.contentRef);
      editor.setCursorInBlock(0, 2);
      expect(selection.getBlockIndex()).toBe(0);
    });

    it("returns correct index for second block", () => {
      editor = createTestEditor("<p>First</p><p>Second</p><p>Third</p>");
      const selection = useMarkdownSelection(editor.contentRef);
      editor.setCursorInBlock(1, 2);
      expect(selection.getBlockIndex()).toBe(1);
    });

    it("returns correct index for last block", () => {
      editor = createTestEditor("<p>First</p><p>Second</p><p>Third</p>");
      const selection = useMarkdownSelection(editor.contentRef);
      editor.setCursorInBlock(2, 2);
      expect(selection.getBlockIndex()).toBe(2);
    });
  });

  describe("saveCursorPosition", () => {
    it("returns null when contentRef is null", () => {
      const { ref } = require("vue");
      const contentRef = ref(null);
      const selection = useMarkdownSelection(contentRef);
      expect(selection.saveCursorPosition()).toBeNull();
    });

    it("returns null when no selection exists", () => {
      editor = createTestEditor("<p>Hello</p>");
      const selection = useMarkdownSelection(editor.contentRef);
      window.getSelection()?.removeAllRanges();
      expect(selection.saveCursorPosition()).toBeNull();
    });

    it("saves block index and character offset", () => {
      editor = createTestEditor("<p>Hello</p><p>World</p>");
      const selection = useMarkdownSelection(editor.contentRef);
      editor.setCursorInBlock(1, 3);

      const pos = selection.saveCursorPosition();
      expect(pos).toEqual({ blockIndex: 1, charOffset: 3 });
    });

    it("saves position at block start", () => {
      editor = createTestEditor("<p>Hello</p>");
      const selection = useMarkdownSelection(editor.contentRef);
      editor.setCursorInBlock(0, 0);

      const pos = selection.saveCursorPosition();
      expect(pos).toEqual({ blockIndex: 0, charOffset: 0 });
    });
  });

  describe("restoreCursorPosition", () => {
    it("does nothing when contentRef is null", () => {
      const { ref } = require("vue");
      const contentRef = ref(null);
      const selection = useMarkdownSelection(contentRef);
      // Should not throw
      selection.restoreCursorPosition({ blockIndex: 0, charOffset: 0 });
    });

    it("restores cursor to the correct block and offset", () => {
      editor = createTestEditor("<p>Hello</p><p>World</p>");
      const selection = useMarkdownSelection(editor.contentRef);

      selection.restoreCursorPosition({ blockIndex: 1, charOffset: 3 });

      const sel = window.getSelection()!;
      const range = sel.getRangeAt(0);
      expect(range.startContainer.textContent).toBe("World");
      expect(range.startOffset).toBe(3);
    });

    it("restores to content root when blockIndex is -1", () => {
      editor = createTestEditor("<p>Hello</p>");
      const selection = useMarkdownSelection(editor.contentRef);

      selection.restoreCursorPosition({ blockIndex: -1, charOffset: 2 });

      const sel = window.getSelection()!;
      expect(sel.rangeCount).toBe(1);
    });

    it("places cursor at end when block no longer exists", () => {
      editor = createTestEditor("<p>Hello</p>");
      const selection = useMarkdownSelection(editor.contentRef);

      // Block index 5 doesn't exist
      selection.restoreCursorPosition({ blockIndex: 5, charOffset: 0 });

      const sel = window.getSelection()!;
      expect(sel.rangeCount).toBe(1);
      const range = sel.getRangeAt(0);
      expect(range.collapsed).toBe(true);
    });
  });

  describe("round-trip save/restore", () => {
    it("restores cursor to the same position after save", () => {
      editor = createTestEditor("<p>Hello</p><p>World</p><p>Foo</p>");
      const selection = useMarkdownSelection(editor.contentRef);

      editor.setCursorInBlock(1, 3);
      const savedPos = selection.saveCursorPosition();
      expect(savedPos).not.toBeNull();

      // Move cursor somewhere else
      editor.setCursorInBlock(0, 0);

      // Restore
      selection.restoreCursorPosition(savedPos!);

      // Verify restored correctly
      const newPos = selection.saveCursorPosition();
      expect(newPos).toEqual(savedPos);
    });
  });
});
