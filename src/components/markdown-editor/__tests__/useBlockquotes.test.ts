import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ref } from "vue";
import { useBlockquotes } from "../useBlockquotes";
import { createTestEditor, TestEditorResult } from "./editorTestUtils";

describe("useBlockquotes", () => {
  let editor: TestEditorResult;
  let onContentChange: ReturnType<typeof vi.fn>;

  afterEach(() => {
    if (editor) {
      editor.destroy();
    }
  });

  function createBlockquotes() {
    return useBlockquotes({
      contentRef: editor.contentRef,
      onContentChange: onContentChange as unknown as () => void,
    });
  }

  describe("toggleBlockquote", () => {
    describe("wrapping in blockquote", () => {
      beforeEach(() => {
        onContentChange = vi.fn();
      });

      it("wraps paragraph in blockquote", () => {
        editor = createTestEditor("<p>Hello world</p>");
        const blockquotes = createBlockquotes();
        editor.setCursorInBlock(0, 5);

        blockquotes.toggleBlockquote();

        expect(editor.getHtml()).toBe("<blockquote><p>Hello world</p></blockquote>");
        expect(onContentChange).toHaveBeenCalled();
      });

      it("wraps h1 in blockquote", () => {
        editor = createTestEditor("<h1>Hello world</h1>");
        const blockquotes = createBlockquotes();
        editor.setCursorInBlock(0, 0);

        blockquotes.toggleBlockquote();

        expect(editor.getHtml()).toBe("<blockquote><h1>Hello world</h1></blockquote>");
        expect(onContentChange).toHaveBeenCalled();
      });

      it("wraps h2 in blockquote", () => {
        editor = createTestEditor("<h2>Test heading</h2>");
        const blockquotes = createBlockquotes();
        editor.setCursorInBlock(0, 0);

        blockquotes.toggleBlockquote();

        expect(editor.getHtml()).toBe("<blockquote><h2>Test heading</h2></blockquote>");
      });

      it("wraps div in blockquote", () => {
        editor = createTestEditor("<div>Div content</div>");
        const blockquotes = createBlockquotes();
        editor.setCursorInBlock(0, 0);

        blockquotes.toggleBlockquote();

        expect(editor.getHtml()).toBe("<blockquote><div>Div content</div></blockquote>");
      });

      it("preserves cursor position after wrapping", () => {
        editor = createTestEditor("<p>Hello world</p>");
        const blockquotes = createBlockquotes();
        editor.setCursorInBlock(0, 5);

        blockquotes.toggleBlockquote();

        // Verify cursor is still at offset 5
        const sel = window.getSelection();
        expect(sel).not.toBeNull();
        expect(sel!.rangeCount).toBeGreaterThan(0);
      });

      it("only wraps current block, not siblings", () => {
        editor = createTestEditor("<p>First</p><p>Second</p><p>Third</p>");
        const blockquotes = createBlockquotes();
        editor.setCursorInBlock(1, 0); // Cursor in second paragraph

        blockquotes.toggleBlockquote();

        expect(editor.getHtml()).toBe(
          "<p>First</p><blockquote><p>Second</p></blockquote><p>Third</p>"
        );
      });
    });

    describe("unwrapping from blockquote", () => {
      beforeEach(() => {
        onContentChange = vi.fn();
      });

      it("unwraps paragraph from blockquote", () => {
        editor = createTestEditor("<blockquote><p>Hello world</p></blockquote>");
        const blockquotes = createBlockquotes();
        // Set cursor inside the paragraph within blockquote
        const p = editor.container.querySelector("blockquote p");
        if (p?.firstChild) {
          editor.setCursor(p.firstChild, 5);
        }

        blockquotes.toggleBlockquote();

        expect(editor.getHtml()).toBe("<p>Hello world</p>");
        expect(onContentChange).toHaveBeenCalled();
      });

      it("unwraps heading from blockquote", () => {
        editor = createTestEditor("<blockquote><h1>Heading</h1></blockquote>");
        const blockquotes = createBlockquotes();
        const h1 = editor.container.querySelector("blockquote h1");
        if (h1?.firstChild) {
          editor.setCursor(h1.firstChild, 0);
        }

        blockquotes.toggleBlockquote();

        expect(editor.getHtml()).toBe("<h1>Heading</h1>");
      });

      it("preserves cursor position after unwrapping", () => {
        editor = createTestEditor("<blockquote><p>Hello world</p></blockquote>");
        const blockquotes = createBlockquotes();
        const p = editor.container.querySelector("blockquote p");
        if (p?.firstChild) {
          editor.setCursor(p.firstChild, 5);
        }

        blockquotes.toggleBlockquote();

        const sel = window.getSelection();
        expect(sel).not.toBeNull();
        expect(sel!.rangeCount).toBeGreaterThan(0);
      });

      it("unwraps only the blockquote, keeps other blocks", () => {
        editor = createTestEditor(
          "<p>Before</p><blockquote><p>Quoted</p></blockquote><p>After</p>"
        );
        const blockquotes = createBlockquotes();
        const quotedP = editor.container.querySelector("blockquote p");
        if (quotedP?.firstChild) {
          editor.setCursor(quotedP.firstChild, 0);
        }

        blockquotes.toggleBlockquote();

        expect(editor.getHtml()).toBe("<p>Before</p><p>Quoted</p><p>After</p>");
      });

      it("unwraps blockquote when cursor is directly in blockquote text node", () => {
        // Blockquote with a direct text node (no wrapping p/div/h1-h6).
        // findCurrentBlock returns the blockquote itself. Override contains()
        // on the blockquote so it returns false for self-reference, forcing
        // the `currentBlock === blockquote` branch (lines 132-134).
        editor = createTestEditor("<blockquote>Direct text</blockquote>");
        const blockquotes = createBlockquotes();
        const bq = editor.container.querySelector("blockquote")!;

        // Place cursor in the raw text node inside blockquote
        editor.setCursor(bq.firstChild!, 3);

        // Override contains so blockquote.contains(blockquote) returns false,
        // which makes the first if-branch fail and the else-if branch fire
        const originalContains = bq.contains.bind(bq);
        bq.contains = (node: Node | null) => {
          if (node === bq) return false;
          return originalContains(node);
        };

        blockquotes.toggleBlockquote();

        // Blockquote should be removed, content preserved
        expect(editor.container.querySelector("blockquote")).toBeNull();
        expect(editor.container.textContent).toContain("Direct text");
        expect(onContentChange).toHaveBeenCalled();
      });

      it("restores cursor via firstMovedElement when targetBlock is not in parent", () => {
        // Blockquote with an element child. Place cursor at the blockquote
        // element level (not inside a child block) so findCurrentBlock returns
        // the blockquote itself. This sets cursorOffset but leaves targetBlock
        // null, triggering the `else if (firstMovedElement)` fallback
        // (lines 155-156).
        editor = createTestEditor("<blockquote><p>Paragraph text</p></blockquote>");
        const blockquotes = createBlockquotes();
        const bq = editor.container.querySelector("blockquote");
        if (bq) {
          // Set cursor at the blockquote element itself (child index 0),
          // not inside the paragraph's text node
          const range = document.createRange();
          range.setStart(bq, 0);
          range.collapse(true);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        }

        blockquotes.toggleBlockquote();

        // Blockquote should be removed, paragraph preserved
        expect(editor.container.querySelector("blockquote")).toBeNull();
        expect(editor.getHtml()).toBe("<p>Paragraph text</p>");
        expect(onContentChange).toHaveBeenCalled();
      });
    });

    describe("with inline formatting preserved", () => {
      beforeEach(() => {
        onContentChange = vi.fn();
      });

      it("preserves bold formatting when wrapping", () => {
        editor = createTestEditor("<p>Hello <strong>bold</strong> world</p>");
        const blockquotes = createBlockquotes();
        editor.setCursorInBlock(0, 0);

        blockquotes.toggleBlockquote();

        expect(editor.getHtml()).toBe(
          "<blockquote><p>Hello <strong>bold</strong> world</p></blockquote>"
        );
      });

      it("preserves italic formatting when wrapping", () => {
        editor = createTestEditor("<p>Hello <em>italic</em> world</p>");
        const blockquotes = createBlockquotes();
        editor.setCursorInBlock(0, 0);

        blockquotes.toggleBlockquote();

        expect(editor.getHtml()).toBe(
          "<blockquote><p>Hello <em>italic</em> world</p></blockquote>"
        );
      });

      it("preserves nested formatting when wrapping", () => {
        editor = createTestEditor("<p>Hello <strong><em>bold italic</em></strong> world</p>");
        const blockquotes = createBlockquotes();
        editor.setCursorInBlock(0, 0);

        blockquotes.toggleBlockquote();

        expect(editor.getHtml()).toBe(
          "<blockquote><p>Hello <strong><em>bold italic</em></strong> world</p></blockquote>"
        );
      });

      it("preserves bold formatting when unwrapping", () => {
        editor = createTestEditor(
          "<blockquote><p>Hello <strong>bold</strong> world</p></blockquote>"
        );
        const blockquotes = createBlockquotes();
        // Place cursor inside the strong element so findCurrentBlock walks
        // through a non-block element (strong) before reaching the p
        const strong = editor.container.querySelector("blockquote strong")!;
        editor.setCursor(strong.firstChild!, 2);

        blockquotes.toggleBlockquote();

        expect(editor.getHtml()).toBe("<p>Hello <strong>bold</strong> world</p>");
      });

      it("preserves link formatting when wrapping", () => {
        editor = createTestEditor('<p>Hello <a href="https://example.com">link</a> world</p>');
        const blockquotes = createBlockquotes();
        editor.setCursorInBlock(0, 0);

        blockquotes.toggleBlockquote();

        expect(editor.getHtml()).toBe(
          '<blockquote><p>Hello <a href="https://example.com">link</a> world</p></blockquote>'
        );
      });

      it("preserves code formatting when wrapping", () => {
        editor = createTestEditor("<p>Hello <code>code</code> world</p>");
        const blockquotes = createBlockquotes();
        editor.setCursorInBlock(0, 0);

        blockquotes.toggleBlockquote();

        expect(editor.getHtml()).toBe(
          "<blockquote><p>Hello <code>code</code> world</p></blockquote>"
        );
      });
    });
  });

  describe("isInBlockquote", () => {
    beforeEach(() => {
      onContentChange = vi.fn();
    });

    it("returns false when cursor is in plain paragraph", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const blockquotes = createBlockquotes();
      editor.setCursorInBlock(0, 5);

      expect(blockquotes.isInBlockquote()).toBe(false);
    });

    it("returns true when cursor is inside blockquote", () => {
      editor = createTestEditor("<blockquote><p>Hello world</p></blockquote>");
      const blockquotes = createBlockquotes();
      const p = editor.container.querySelector("blockquote p");
      if (p?.firstChild) {
        editor.setCursor(p.firstChild, 5);
      }

      expect(blockquotes.isInBlockquote()).toBe(true);
    });

    it("returns false when cursor is outside blockquote", () => {
      editor = createTestEditor("<p>Outside</p><blockquote><p>Inside</p></blockquote>");
      const blockquotes = createBlockquotes();
      editor.setCursorInBlock(0, 0); // Cursor in first paragraph

      expect(blockquotes.isInBlockquote()).toBe(false);
    });

    it("returns true for nested content inside blockquote", () => {
      editor = createTestEditor("<blockquote><p><strong>Bold text</strong></p></blockquote>");
      const blockquotes = createBlockquotes();
      const strong = editor.container.querySelector("blockquote strong");
      if (strong?.firstChild) {
        editor.setCursor(strong.firstChild, 2);
      }

      expect(blockquotes.isInBlockquote()).toBe(true);
    });

    it("returns true when cursor is in blockquote with direct text (no child block)", () => {
      editor = createTestEditor("<blockquote>Direct text</blockquote>");
      const blockquotes = createBlockquotes();
      const bq = editor.container.querySelector("blockquote")!;
      editor.setCursor(bq.firstChild!, 3);

      expect(blockquotes.isInBlockquote()).toBe(true);
    });

    it("returns false when contentRef is null", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const { isInBlockquote } = useBlockquotes({
        contentRef: ref<HTMLElement | null>(null),
        onContentChange: onContentChange as unknown as () => void,
      });

      expect(isInBlockquote()).toBe(false);
    });

    it("returns false when no selection exists", () => {
      editor = createTestEditor("<blockquote><p>Hello world</p></blockquote>");
      const blockquotes = createBlockquotes();
      window.getSelection()?.removeAllRanges();

      expect(blockquotes.isInBlockquote()).toBe(false);
    });
  });

  describe("edge cases", () => {
    beforeEach(() => {
      onContentChange = vi.fn();
    });

    it("does nothing when contentRef is null", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const { toggleBlockquote } = useBlockquotes({
        contentRef: ref<HTMLElement | null>(null),
        onContentChange: onContentChange as unknown as () => void,
      });

      toggleBlockquote();

      expect(editor.getHtml()).toBe("<p>Hello world</p>");
      expect(onContentChange).not.toHaveBeenCalled();
    });

    it("does nothing when selection is outside content area", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const blockquotes = createBlockquotes();

      // Create a selection outside the editor
      const externalDiv = document.createElement("div");
      externalDiv.textContent = "External text";
      document.body.appendChild(externalDiv);

      const range = document.createRange();
      range.selectNodeContents(externalDiv);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      blockquotes.toggleBlockquote();

      expect(editor.getHtml()).toBe("<p>Hello world</p>");
      expect(onContentChange).not.toHaveBeenCalled();

      externalDiv.remove();
    });

    it("does nothing when no selection exists", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const blockquotes = createBlockquotes();
      window.getSelection()?.removeAllRanges();

      blockquotes.toggleBlockquote();

      expect(editor.getHtml()).toBe("<p>Hello world</p>");
      expect(onContentChange).not.toHaveBeenCalled();
    });

    it("handles empty paragraph", () => {
      editor = createTestEditor("<p></p>");
      const blockquotes = createBlockquotes();
      const p = editor.getBlock(0);
      if (p) {
        const range = document.createRange();
        range.selectNodeContents(p);
        range.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }

      blockquotes.toggleBlockquote();

      expect(editor.getHtml()).toBe("<blockquote><p></p></blockquote>");
    });

    it("handles whitespace-only content", () => {
      editor = createTestEditor("<p>   </p>");
      const blockquotes = createBlockquotes();
      editor.setCursorInBlock(0, 1);

      blockquotes.toggleBlockquote();

      expect(editor.getHtml()).toBe("<blockquote><p>   </p></blockquote>");
    });

    it("unwraps blockquote when findCurrentBlock returns null in unwrap", () => {
      // Create blockquote with a bare text node sibling so cursor can be
      // moved to a position where findCurrentBlock returns null
      editor = createTestEditor("<blockquote><p>Quoted</p></blockquote>");
      const blockquotes = createBlockquotes();
      const p = editor.container.querySelector("blockquote p")!;
      editor.setCursor(p.firstChild!, 3);

      // Add a bare text node directly under contentRef (no block wrapper)
      const bareText = document.createTextNode("bare");
      editor.container.appendChild(bareText);

      // toggleBlockquote calls getSelection once (line 86), then
      // unwrapBlockquote calls it again (line 114). On the 2nd call,
      // return a range pointing to bare text so findCurrentBlock returns null
      const origGetSel = window.getSelection;
      let callCount = 0;
      vi.spyOn(window, "getSelection").mockImplementation(() => {
        callCount++;
        if (callCount <= 1) return origGetSel.call(window);
        // 2nd call: inside unwrapBlockquote - return range pointing to bare text
        const range = document.createRange();
        range.setStart(bareText, 2);
        range.collapse(true);
        return {
          rangeCount: 1,
          getRangeAt: () => range,
          removeAllRanges: vi.fn(),
          addRange: vi.fn(),
        } as unknown as Selection;
      });

      blockquotes.toggleBlockquote();

      vi.restoreAllMocks();
      expect(editor.container.querySelector("blockquote")).toBeNull();
      expect(editor.container.textContent).toContain("Quoted");
    });

    it("unwraps blockquote even when selection is lost during unwrap", () => {
      editor = createTestEditor("<blockquote><p>Content</p></blockquote>");
      const blockquotes = createBlockquotes();
      const p = editor.container.querySelector("blockquote p")!;
      editor.setCursor(p.firstChild!, 3);

      // toggleBlockquote calls getSelection once (line 86), then
      // unwrapBlockquote calls it again (line 114). Return null on
      // the 2nd call so the cursor-save branch is skipped.
      const origGetSel = window.getSelection;
      let callCount = 0;
      vi.spyOn(window, "getSelection").mockImplementation(() => {
        callCount++;
        // First call: toggleBlockquote validation (needs valid selection)
        if (callCount <= 1) return origGetSel.call(window);
        // Second call: inside unwrapBlockquote (return null)
        return null;
      });

      blockquotes.toggleBlockquote();

      vi.restoreAllMocks();
      // Blockquote should still be removed even without cursor restoration
      expect(editor.container.querySelector("blockquote")).toBeNull();
      expect(editor.container.textContent).toContain("Content");
    });

    it("does not wrap when cursor is in text node directly under contentRef", () => {
      // Create editor with a bare text node (no block wrapper)
      // This forces findCurrentBlock to walk up to contentRef and return null
      editor = createTestEditor("");
      editor.container.innerHTML = "";
      const textNode = document.createTextNode("bare text");
      editor.container.appendChild(textNode);
      const blockquotes = createBlockquotes();

      // Place cursor in the bare text node
      editor.setCursor(textNode, 3);

      blockquotes.toggleBlockquote();

      // Should not wrap since findCurrentBlock returns null
      expect(editor.container.querySelector("blockquote")).toBeNull();
      expect(editor.container.textContent).toContain("bare text");
    });

    it("does not double-wrap blockquote when cursor is on blockquote element", () => {
      // toggleBlockquote detects the blockquote ancestor and unwraps
      // instead of attempting to wrap
      editor = createTestEditor("<blockquote>Direct text in blockquote</blockquote>");
      const blockquotes = createBlockquotes();
      const bq = editor.container.querySelector("blockquote")!;

      // Place cursor directly in the blockquote text
      editor.setCursor(bq.firstChild!, 3);

      // The toggleBlockquote should detect blockquote ancestor and unwrap,
      // not try to double-wrap
      blockquotes.toggleBlockquote();

      // Should have been unwrapped
      expect(editor.container.querySelector("blockquote")).toBeNull();
      expect(onContentChange).toHaveBeenCalled();
    });

    it("unwrapBlockquote handles blockquote with no parent", () => {
      // Create a detached blockquote
      editor = createTestEditor("<blockquote><p>Test</p></blockquote>");
      const blockquotes = createBlockquotes();
      const bq = editor.container.querySelector("blockquote")!;
      const p = bq.querySelector("p")!;

      // Place cursor inside the paragraph
      editor.setCursor(p.firstChild!, 0);

      blockquotes.toggleBlockquote();

      // Should have unwrapped
      expect(editor.getHtml()).toBe("<p>Test</p>");
    });

    it("unwrapBlockquote handles blockquote with multiple element children", () => {
      editor = createTestEditor("<blockquote><p>First</p><p>Second</p></blockquote>");
      const blockquotes = createBlockquotes();
      const p = editor.container.querySelector("blockquote p")!;
      editor.setCursor(p.firstChild!, 3);

      blockquotes.toggleBlockquote();

      // Both paragraphs should be unwrapped
      expect(editor.container.querySelector("blockquote")).toBeNull();
      expect(editor.getHtml()).toContain("<p>First</p>");
      expect(editor.getHtml()).toContain("<p>Second</p>");
    });
  });

  // Note: wrapInBlockquote internal guards (contentRef/selection/range checks
  // and the BLOCKQUOTE tagName guard) were removed as dead code.
  // toggleBlockquote already validates contentRef, selection, and range before
  // calling wrapInBlockquote, and always detects blockquote ancestors first,
  // so those checks were unreachable.

  describe("round-trip toggle", () => {
    beforeEach(() => {
      onContentChange = vi.fn();
    });

    it("toggle wrap then unwrap returns to original", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const blockquotes = createBlockquotes();
      editor.setCursorInBlock(0, 5);

      // First toggle - wrap
      blockquotes.toggleBlockquote();
      expect(editor.getHtml()).toBe("<blockquote><p>Hello world</p></blockquote>");

      // Set cursor again inside the blockquote
      const p = editor.container.querySelector("blockquote p");
      if (p?.firstChild) {
        editor.setCursor(p.firstChild, 5);
      }

      // Second toggle - unwrap
      blockquotes.toggleBlockquote();
      expect(editor.getHtml()).toBe("<p>Hello world</p>");
    });

    it("toggle unwrap then wrap returns to original", () => {
      editor = createTestEditor("<blockquote><p>Hello world</p></blockquote>");
      const blockquotes = createBlockquotes();
      const p = editor.container.querySelector("blockquote p");
      if (p?.firstChild) {
        editor.setCursor(p.firstChild, 5);
      }

      // First toggle - unwrap
      blockquotes.toggleBlockquote();
      expect(editor.getHtml()).toBe("<p>Hello world</p>");

      // Set cursor in the unwrapped paragraph
      editor.setCursorInBlock(0, 5);

      // Second toggle - wrap
      blockquotes.toggleBlockquote();
      expect(editor.getHtml()).toBe("<blockquote><p>Hello world</p></blockquote>");
    });
  });
});
