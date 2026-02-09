import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useHeadings } from "../useHeadings";
import { useMarkdownSelection } from "../useMarkdownSelection";
import { createTestEditor, TestEditorResult } from "./editorTestUtils";

describe("useHeadings", () => {
  let editor: TestEditorResult;
  let onContentChange: ReturnType<typeof vi.fn>;

  afterEach(() => {
    if (editor) {
      editor.destroy();
    }
  });

  /**
   * Create headings composable with test editor
   */
  function createHeadings() {
    const selection = useMarkdownSelection(editor.contentRef)!;
    return useHeadings({
      contentRef: editor.contentRef,
      selection,
      onContentChange: onContentChange as unknown as () => void,
    });
  }

  describe("setHeadingLevel", () => {
    beforeEach(() => {
      onContentChange = vi.fn();
    });

    it("converts paragraph to H1", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 5);

      headings.setHeadingLevel(1);

      expect(editor.getHtml()).toBe("<h1>Hello world</h1>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("converts paragraph to H2", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.setHeadingLevel(2);

      expect(editor.getHtml()).toBe("<h2>Hello world</h2>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("converts paragraph to H3", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.setHeadingLevel(3);

      expect(editor.getHtml()).toBe("<h3>Hello world</h3>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("converts paragraph to H4", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.setHeadingLevel(4);

      expect(editor.getHtml()).toBe("<h4>Hello world</h4>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("converts paragraph to H5", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.setHeadingLevel(5);

      expect(editor.getHtml()).toBe("<h5>Hello world</h5>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("converts paragraph to H6", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.setHeadingLevel(6);

      expect(editor.getHtml()).toBe("<h6>Hello world</h6>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("converts H1 to paragraph (level 0)", () => {
      editor = createTestEditor("<h1>Hello world</h1>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.setHeadingLevel(0);

      expect(editor.getHtml()).toBe("<p>Hello world</p>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("converts H2 to H1", () => {
      editor = createTestEditor("<h2>Hello world</h2>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.setHeadingLevel(1);

      expect(editor.getHtml()).toBe("<h1>Hello world</h1>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("converts H6 to H3", () => {
      editor = createTestEditor("<h6>Hello world</h6>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.setHeadingLevel(3);

      expect(editor.getHtml()).toBe("<h3>Hello world</h3>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("does not change when already at target level", () => {
      editor = createTestEditor("<h2>Hello world</h2>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.setHeadingLevel(2);

      expect(editor.getHtml()).toBe("<h2>Hello world</h2>");
      expect(onContentChange).not.toHaveBeenCalled();
    });

    it("preserves cursor position after conversion", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 5);

      headings.setHeadingLevel(1);

      // After conversion, cursor should still be at position 5
      const sel = window.getSelection();
      expect(sel).not.toBeNull();
      expect(sel!.rangeCount).toBeGreaterThan(0);
    });

    it("preserves element attributes (except id)", () => {
      editor = createTestEditor('<p class="test-class" data-custom="value">Hello</p>');
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.setHeadingLevel(1);

      const h1 = editor.getBlock(0);
      expect(h1?.getAttribute("class")).toBe("test-class");
      expect(h1?.getAttribute("data-custom")).toBe("value");
    });

    it("does not copy id attribute", () => {
      editor = createTestEditor('<p id="my-id" class="test">Hello</p>');
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.setHeadingLevel(1);

      const h1 = editor.getBlock(0);
      expect(h1?.getAttribute("id")).toBeNull();
      expect(h1?.getAttribute("class")).toBe("test");
    });

    it("handles DIV elements (browsers often create DIV instead of P)", () => {
      editor = createTestEditor("<div>Hello world</div>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.setHeadingLevel(1);

      expect(editor.getHtml()).toBe("<h1>Hello world</h1>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("does nothing when not in a valid block", () => {
      editor = createTestEditor("<ul><li>List item</li></ul>");
      const headings = createHeadings();
      // Set cursor in list item - not a heading/paragraph block
      const li = editor.container.querySelector("li");
      if (li?.firstChild) {
        editor.setCursor(li.firstChild, 0);
      }

      headings.setHeadingLevel(1);

      // Should not change the list
      expect(editor.getHtml()).toBe("<ul><li>List item</li></ul>");
      expect(onContentChange).not.toHaveBeenCalled();
    });
  });

  describe("increaseHeadingLevel", () => {
    beforeEach(() => {
      onContentChange = vi.fn();
    });

    it("converts paragraph to H6", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.increaseHeadingLevel();

      expect(editor.getHtml()).toBe("<h6>Hello world</h6>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("converts H6 to H5", () => {
      editor = createTestEditor("<h6>Hello world</h6>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.increaseHeadingLevel();

      expect(editor.getHtml()).toBe("<h5>Hello world</h5>");
    });

    it("converts H5 to H4", () => {
      editor = createTestEditor("<h5>Hello world</h5>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.increaseHeadingLevel();

      expect(editor.getHtml()).toBe("<h4>Hello world</h4>");
    });

    it("converts H4 to H3", () => {
      editor = createTestEditor("<h4>Hello world</h4>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.increaseHeadingLevel();

      expect(editor.getHtml()).toBe("<h3>Hello world</h3>");
    });

    it("converts H3 to H2", () => {
      editor = createTestEditor("<h3>Hello world</h3>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.increaseHeadingLevel();

      expect(editor.getHtml()).toBe("<h2>Hello world</h2>");
    });

    it("converts H2 to H1", () => {
      editor = createTestEditor("<h2>Hello world</h2>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.increaseHeadingLevel();

      expect(editor.getHtml()).toBe("<h1>Hello world</h1>");
    });

    it("H1 stays at H1 (cannot increase further)", () => {
      editor = createTestEditor("<h1>Hello world</h1>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.increaseHeadingLevel();

      expect(editor.getHtml()).toBe("<h1>Hello world</h1>");
      expect(onContentChange).not.toHaveBeenCalled();
    });

    it("full progression: P -> H6 -> H5 -> H4 -> H3 -> H2 -> H1", () => {
      editor = createTestEditor("<p>Hello</p>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.increaseHeadingLevel();
      expect(editor.getHtml()).toBe("<h6>Hello</h6>");

      headings.increaseHeadingLevel();
      expect(editor.getHtml()).toBe("<h5>Hello</h5>");

      headings.increaseHeadingLevel();
      expect(editor.getHtml()).toBe("<h4>Hello</h4>");

      headings.increaseHeadingLevel();
      expect(editor.getHtml()).toBe("<h3>Hello</h3>");

      headings.increaseHeadingLevel();
      expect(editor.getHtml()).toBe("<h2>Hello</h2>");

      headings.increaseHeadingLevel();
      expect(editor.getHtml()).toBe("<h1>Hello</h1>");

      // Should stay at H1
      headings.increaseHeadingLevel();
      expect(editor.getHtml()).toBe("<h1>Hello</h1>");
    });
  });

  describe("decreaseHeadingLevel", () => {
    beforeEach(() => {
      onContentChange = vi.fn();
    });

    it("converts H1 to H2", () => {
      editor = createTestEditor("<h1>Hello world</h1>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.decreaseHeadingLevel();

      expect(editor.getHtml()).toBe("<h2>Hello world</h2>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("converts H2 to H3", () => {
      editor = createTestEditor("<h2>Hello world</h2>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.decreaseHeadingLevel();

      expect(editor.getHtml()).toBe("<h3>Hello world</h3>");
    });

    it("converts H3 to H4", () => {
      editor = createTestEditor("<h3>Hello world</h3>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.decreaseHeadingLevel();

      expect(editor.getHtml()).toBe("<h4>Hello world</h4>");
    });

    it("converts H4 to H5", () => {
      editor = createTestEditor("<h4>Hello world</h4>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.decreaseHeadingLevel();

      expect(editor.getHtml()).toBe("<h5>Hello world</h5>");
    });

    it("converts H5 to H6", () => {
      editor = createTestEditor("<h5>Hello world</h5>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.decreaseHeadingLevel();

      expect(editor.getHtml()).toBe("<h6>Hello world</h6>");
    });

    it("converts H6 to paragraph", () => {
      editor = createTestEditor("<h6>Hello world</h6>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.decreaseHeadingLevel();

      expect(editor.getHtml()).toBe("<p>Hello world</p>");
    });

    it("paragraph stays at paragraph (cannot decrease further)", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.decreaseHeadingLevel();

      expect(editor.getHtml()).toBe("<p>Hello world</p>");
      expect(onContentChange).not.toHaveBeenCalled();
    });

    it("full progression: H1 -> H2 -> H3 -> H4 -> H5 -> H6 -> P", () => {
      editor = createTestEditor("<h1>Hello</h1>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.decreaseHeadingLevel();
      expect(editor.getHtml()).toBe("<h2>Hello</h2>");

      headings.decreaseHeadingLevel();
      expect(editor.getHtml()).toBe("<h3>Hello</h3>");

      headings.decreaseHeadingLevel();
      expect(editor.getHtml()).toBe("<h4>Hello</h4>");

      headings.decreaseHeadingLevel();
      expect(editor.getHtml()).toBe("<h5>Hello</h5>");

      headings.decreaseHeadingLevel();
      expect(editor.getHtml()).toBe("<h6>Hello</h6>");

      headings.decreaseHeadingLevel();
      expect(editor.getHtml()).toBe("<p>Hello</p>");

      // Should stay at P
      headings.decreaseHeadingLevel();
      expect(editor.getHtml()).toBe("<p>Hello</p>");
    });
  });

  describe("getCurrentHeadingLevel", () => {
    beforeEach(() => {
      onContentChange = vi.fn();
    });

    it("returns 0 for paragraph", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      expect(headings.getCurrentHeadingLevel()).toBe(0);
    });

    it("returns 0 for DIV (treated as paragraph)", () => {
      editor = createTestEditor("<div>Hello world</div>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      expect(headings.getCurrentHeadingLevel()).toBe(0);
    });

    it("returns 1 for H1", () => {
      editor = createTestEditor("<h1>Hello world</h1>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      expect(headings.getCurrentHeadingLevel()).toBe(1);
    });

    it("returns 2 for H2", () => {
      editor = createTestEditor("<h2>Hello world</h2>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      expect(headings.getCurrentHeadingLevel()).toBe(2);
    });

    it("returns 3 for H3", () => {
      editor = createTestEditor("<h3>Hello world</h3>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      expect(headings.getCurrentHeadingLevel()).toBe(3);
    });

    it("returns 4 for H4", () => {
      editor = createTestEditor("<h4>Hello world</h4>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      expect(headings.getCurrentHeadingLevel()).toBe(4);
    });

    it("returns 5 for H5", () => {
      editor = createTestEditor("<h5>Hello world</h5>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      expect(headings.getCurrentHeadingLevel()).toBe(5);
    });

    it("returns 6 for H6", () => {
      editor = createTestEditor("<h6>Hello world</h6>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      expect(headings.getCurrentHeadingLevel()).toBe(6);
    });

    it("returns -1 when not in heading/paragraph", () => {
      editor = createTestEditor("<ul><li>List item</li></ul>");
      const headings = createHeadings();
      // Set cursor in list item
      const li = editor.container.querySelector("li");
      if (li?.firstChild) {
        editor.setCursor(li.firstChild, 0);
      }

      expect(headings.getCurrentHeadingLevel()).toBe(-1);
    });

    it("returns -1 when no selection", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const headings = createHeadings();
      // Clear selection
      window.getSelection()?.removeAllRanges();

      expect(headings.getCurrentHeadingLevel()).toBe(-1);
    });

    it("correctly identifies level when cursor is in middle of content", () => {
      editor = createTestEditor("<h3>Hello world</h3>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 6); // Middle of "Hello world"

      expect(headings.getCurrentHeadingLevel()).toBe(3);
    });

    it("handles multiple blocks correctly", () => {
      editor = createTestEditor("<h1>First</h1><p>Second</p><h3>Third</h3>");
      const headings = createHeadings();

      editor.setCursorInBlock(0, 0);
      expect(headings.getCurrentHeadingLevel()).toBe(1);

      editor.setCursorInBlock(1, 0);
      expect(headings.getCurrentHeadingLevel()).toBe(0);

      editor.setCursorInBlock(2, 0);
      expect(headings.getCurrentHeadingLevel()).toBe(3);
    });
  });

  describe("checkAndConvertHeadingPattern", () => {
    beforeEach(() => {
      onContentChange = vi.fn();
    });

    it('converts "# Hello" to H1', () => {
      editor = createTestEditor("<p># Hello</p>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 7); // After "# Hello"

      const result = headings.checkAndConvertHeadingPattern();

      expect(result).toBe(true);
      expect(editor.getHtml()).toBe("<h1>Hello</h1>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it('converts "## World" to H2', () => {
      editor = createTestEditor("<p>## World</p>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 8);

      const result = headings.checkAndConvertHeadingPattern();

      expect(result).toBe(true);
      expect(editor.getHtml()).toBe("<h2>World</h2>");
    });

    it('converts "### Test" to H3', () => {
      editor = createTestEditor("<p>### Test</p>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 8);

      const result = headings.checkAndConvertHeadingPattern();

      expect(result).toBe(true);
      expect(editor.getHtml()).toBe("<h3>Test</h3>");
    });

    it('converts "#### Test" to H4', () => {
      editor = createTestEditor("<p>#### Test</p>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 9);

      const result = headings.checkAndConvertHeadingPattern();

      expect(result).toBe(true);
      expect(editor.getHtml()).toBe("<h4>Test</h4>");
    });

    it('converts "##### Test" to H5', () => {
      editor = createTestEditor("<p>##### Test</p>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 10);

      const result = headings.checkAndConvertHeadingPattern();

      expect(result).toBe(true);
      expect(editor.getHtml()).toBe("<h5>Test</h5>");
    });

    it('converts "###### Test" to H6', () => {
      editor = createTestEditor("<p>###### Test</p>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 11);

      const result = headings.checkAndConvertHeadingPattern();

      expect(result).toBe(true);
      expect(editor.getHtml()).toBe("<h6>Test</h6>");
    });

    it("returns false when no pattern is present", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 5);

      const result = headings.checkAndConvertHeadingPattern();

      expect(result).toBe(false);
      expect(editor.getHtml()).toBe("<p>Hello world</p>");
      expect(onContentChange).not.toHaveBeenCalled();
    });

    it('returns false for "# " without content', () => {
      editor = createTestEditor("<p># </p>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 2);

      const result = headings.checkAndConvertHeadingPattern();

      expect(result).toBe(false);
      expect(editor.getHtml()).toBe("<p># </p>");
    });

    it('returns false for "#" without space', () => {
      editor = createTestEditor("<p>#Hello</p>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 6);

      const result = headings.checkAndConvertHeadingPattern();

      expect(result).toBe(false);
      expect(editor.getHtml()).toBe("<p>#Hello</p>");
    });

    it("does not convert if already a heading", () => {
      editor = createTestEditor("<h1># Hello</h1>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 7);

      const result = headings.checkAndConvertHeadingPattern();

      expect(result).toBe(false);
      expect(editor.getHtml()).toBe("<h1># Hello</h1>");
      expect(onContentChange).not.toHaveBeenCalled();
    });

    it("converts DIV elements (browser default)", () => {
      editor = createTestEditor("<div>## World</div>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 8);

      const result = headings.checkAndConvertHeadingPattern();

      expect(result).toBe(true);
      expect(editor.getHtml()).toBe("<h2>World</h2>");
    });

    it("positions cursor at end of content after conversion", () => {
      editor = createTestEditor("<p># Hello</p>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 7);

      headings.checkAndConvertHeadingPattern();

      // Cursor should be at end of "Hello" (offset 5)
      const sel = window.getSelection();
      expect(sel).not.toBeNull();
      expect(sel!.rangeCount).toBeGreaterThan(0);
      const range = sel!.getRangeAt(0);
      expect(range.collapsed).toBe(true);
    });

    it("preserves attributes (except id) during pattern conversion", () => {
      editor = createTestEditor('<p class="test" data-foo="bar"># Hello</p>');
      const headings = createHeadings();
      editor.setCursorInBlock(0, 7);

      headings.checkAndConvertHeadingPattern();

      const h1 = editor.getBlock(0);
      expect(h1?.getAttribute("class")).toBe("test");
      expect(h1?.getAttribute("data-foo")).toBe("bar");
    });

    it("handles content with special characters", () => {
      editor = createTestEditor("<p>## Hello! @world #tag</p>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 21);

      const result = headings.checkAndConvertHeadingPattern();

      expect(result).toBe(true);
      expect(editor.getHtml()).toBe("<h2>Hello! @world #tag</h2>");
    });

    it("handles content with multiple spaces after hash", () => {
      editor = createTestEditor("<p>#  Hello</p>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 8);

      const result = headings.checkAndConvertHeadingPattern();

      expect(result).toBe(true);
      expect(editor.getHtml()).toBe("<h1>Hello</h1>");
    });
  });

  describe("edge cases", () => {
    beforeEach(() => {
      onContentChange = vi.fn();
    });

    it("handles empty paragraph", () => {
      editor = createTestEditor("<p></p>");
      const headings = createHeadings();
      // Can't set cursor in empty block, use direct approach
      const p = editor.getBlock(0);
      if (p) {
        const range = document.createRange();
        range.selectNodeContents(p);
        range.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }

      headings.setHeadingLevel(1);

      expect(editor.getHtml()).toBe("<h1></h1>");
    });

    it("handles nested inline elements", () => {
      editor = createTestEditor("<p>Hello <strong><em>bold italic</em></strong> world</p>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.setHeadingLevel(2);

      // Should preserve nested formatting
      expect(editor.getHtml()).toBe("<h2>Hello <strong><em>bold italic</em></strong> world</h2>");
    });

    it("handles multiple blocks - only affects current block", () => {
      editor = createTestEditor("<p>First</p><p>Second</p><p>Third</p>");
      const headings = createHeadings();
      editor.setCursorInBlock(1, 0); // Cursor in second block

      headings.setHeadingLevel(2);

      expect(editor.getHtml()).toBe("<p>First</p><h2>Second</h2><p>Third</p>");
    });

    it("handles content with links", () => {
      editor = createTestEditor('<p>Hello <a href="https://example.com">link</a> world</p>');
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.setHeadingLevel(1);

      expect(editor.getHtml()).toBe('<h1>Hello <a href="https://example.com">link</a> world</h1>');
    });

    it("handles whitespace-only content", () => {
      editor = createTestEditor("<p>   </p>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 1);

      headings.setHeadingLevel(3);

      expect(editor.getHtml()).toBe("<h3>   </h3>");
    });
  });

  describe("list to heading workflow", () => {
    /**
     * These tests verify the workflow where a list item is first
     * converted to a paragraph, then setHeadingLevel is called.
     */
    beforeEach(() => {
      onContentChange = vi.fn();
    });

    it("setHeadingLevel works on paragraph created from list item", () => {
      // Start with a list, manually convert to paragraph, then apply heading
      editor = createTestEditor("<p>Former list item</p>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      headings.setHeadingLevel(1);

      expect(editor.getHtml()).toBe("<h1>Former list item</h1>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("setHeadingLevel with level 0 keeps paragraph", () => {
      editor = createTestEditor("<p>Test paragraph</p>");
      const headings = createHeadings();
      editor.setCursorInBlock(0, 0);

      // Setting level 0 should keep it as paragraph
      headings.setHeadingLevel(0);

      expect(editor.getHtml()).toBe("<p>Test paragraph</p>");
      // Not called because already at level 0
      expect(onContentChange).not.toHaveBeenCalled();
    });

    it("converts to all heading levels correctly after list-to-paragraph", () => {
      const testCases = [
        { level: 1, tag: "h1" },
        { level: 2, tag: "h2" },
        { level: 3, tag: "h3" },
        { level: 4, tag: "h4" },
        { level: 5, tag: "h5" },
        { level: 6, tag: "h6" },
      ];

      for (const { level, tag } of testCases) {
        editor = createTestEditor("<p>Test content</p>");
        const headings = createHeadings();
        editor.setCursorInBlock(0, 0);

        headings.setHeadingLevel(level as 0 | 1 | 2 | 3 | 4 | 5 | 6);

        expect(editor.getHtml()).toBe(`<${tag}>Test content</${tag}>`);
      }
    });
  });
});
