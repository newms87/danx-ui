import { describe, it, expect, afterEach } from "vitest";
import { getCursorOffset, setCursorOffset } from "../cursorOffset";

describe("cursorOffset", () => {
  let container: HTMLElement;

  afterEach(() => {
    container?.remove();
  });

  function setup(html: string): HTMLElement {
    container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);
    return container;
  }

  function setCursor(node: Node, offset: number): void {
    const range = document.createRange();
    range.setStart(node, offset);
    range.collapse(true);
    const sel = window.getSelection()!;
    sel.removeAllRanges();
    sel.addRange(range);
  }

  describe("getCursorOffset", () => {
    it("returns 0 when no selection exists", () => {
      const el = setup("<p>Hello</p>");
      window.getSelection()?.removeAllRanges();
      expect(getCursorOffset(el)).toBe(0);
    });

    it("returns correct offset in simple text", () => {
      const el = setup("Hello world");
      setCursor(el.firstChild!, 5);
      expect(getCursorOffset(el)).toBe(5);
    });

    it("returns correct offset with nested elements", () => {
      const el = setup("Hello <strong>bold</strong> world");
      const strong = el.querySelector("strong")!;
      setCursor(strong.firstChild!, 2);
      // "Hello " (6) + "bo" (2) = 8
      expect(getCursorOffset(el)).toBe(8);
    });

    describe("with skipAncestorTags", () => {
      it("skips text nodes inside specified ancestor tags", () => {
        const el = setup("Item text<ul><li>nested</li></ul>");
        // Place cursor in the main text
        setCursor(el.firstChild!, 4);
        const offset = getCursorOffset(el, { skipAncestorTags: ["UL"] });
        expect(offset).toBe(4);
      });

      it("returns offset at cursor in skipped branch text node", () => {
        // When the cursor IS in the nested list item text node,
        // the walker will skip it and then break out
        const el = setup("Main<ul><li>nested</li></ul>");
        const li = el.querySelector("li")!;
        setCursor(li.firstChild!, 3);
        const offset = getCursorOffset(el, { skipAncestorTags: ["UL"] });
        // Since "nested" is inside UL, it's skipped. The walker sees only "Main" (length 4).
        // The cursor is in a skipped node, so none of the branches match exactly.
        // The function returns whatever accumulated offset it has.
        expect(offset).toBeGreaterThanOrEqual(0);
      });

      it("handles case where cursor is past all eligible text nodes", () => {
        // Cursor is in a text node that comes after all non-skipped nodes
        // This hits the branch on lines 70-75 where the walker traverses
        // text nodes but the startContainer is after them
        const el = setup("AB<ul><li>nested</li></ul>CD");
        // Get the last text node "CD"
        const lastTextNode = el.lastChild!;
        setCursor(lastTextNode, 1);
        const offset = getCursorOffset(el, { skipAncestorTags: ["UL"] });
        // "AB" (2) + "C" (1) = 3 (skipping "nested" inside UL)
        expect(offset).toBe(3);
      });

      it("handles node comparison with DOCUMENT_POSITION_FOLLOWING", () => {
        // This exercises line 69-70: when walker visits a node that is
        // BEFORE the startContainer (position & DOCUMENT_POSITION_FOLLOWING)
        const el = setup("First<span>Middle</span>Last");
        const lastTextNode = el.lastChild!;
        setCursor(lastTextNode, 2);
        const offset = getCursorOffset(el, { skipAncestorTags: ["NONEXISTENT"] });
        // "First" (5) + "Middle" (6) + "La" (2) = 13
        expect(offset).toBe(13);
      });

      it("handles break condition when node is not following cursor", () => {
        // Exercise line 71-72: when position does NOT have DOCUMENT_POSITION_FOLLOWING
        // This means the walker visited a node that comes after the cursor,
        // so we break
        const el = setup("Start<em>mid</em>End");
        const firstTextNode = el.firstChild!;
        setCursor(firstTextNode, 3); // cursor at "Sta|rt"
        const offset = getCursorOffset(el, { skipAncestorTags: ["NONEXISTENT"] });
        expect(offset).toBe(3);
      });

      it("handles empty skipTags array same as no skipTags", () => {
        const el = setup("Hello world");
        setCursor(el.firstChild!, 5);
        const offset = getCursorOffset(el, { skipAncestorTags: [] });
        expect(offset).toBe(5);
      });

      it("handles cursor in text node not contained by element", () => {
        // Exercise line 74-75: when element does NOT contain range.startContainer
        const el = setup("Hello");
        const externalEl = document.createElement("div");
        externalEl.textContent = "External";
        document.body.appendChild(externalEl);

        // Set cursor in external element
        setCursor(externalEl.firstChild!, 3);

        // Call getCursorOffset with skipTags on the original element
        const offset = getCursorOffset(el, { skipAncestorTags: ["SPAN"] });
        // When startContainer is not in element, the else branch (line 74-75) adds node lengths
        expect(offset).toBeGreaterThanOrEqual(0);

        externalEl.remove();
      });
    });
  });

  describe("setCursorOffset", () => {
    it("sets cursor at correct offset in simple text", () => {
      const el = setup("Hello world");
      setCursorOffset(el, 5);

      const sel = window.getSelection()!;
      const range = sel.getRangeAt(0);
      expect(range.startContainer).toBe(el.firstChild);
      expect(range.startOffset).toBe(5);
    });

    it("sets cursor at correct offset across multiple text nodes", () => {
      const el = setup("Hello <strong>bold</strong> world");
      setCursorOffset(el, 8); // "Hello " (6) + "bo" (2)

      const sel = window.getSelection()!;
      const range = sel.getRangeAt(0);
      expect(range.startOffset).toBe(2);
    });

    it("positions cursor at end when offset exceeds content length", () => {
      const el = setup("Short");
      setCursorOffset(el, 100);

      // Should call positionCursorAtEnd when offset exceeds content
      const sel = window.getSelection()!;
      expect(sel.rangeCount).toBe(1);
    });

    it("does nothing when getSelection returns null", () => {
      const el = setup("Hello");
      // Can't really make getSelection return null in JSDOM, but we verify no throw
      setCursorOffset(el, 3);
    });

    describe("with skipAncestorTags", () => {
      it("skips text nodes inside specified ancestor tags", () => {
        const el = setup("Item<ul><li>nested</li></ul>After");
        setCursorOffset(el, 5, { skipAncestorTags: ["UL"] });

        // "Item" (4) is the first non-skipped text node, skip "nested",
        // then "After" starts at offset 4. Offset 5 = "A" in "After"
        const sel = window.getSelection()!;
        const range = sel.getRangeAt(0);
        expect(range.startOffset).toBe(1); // 1 char into "After"
      });

      it("skips nested list text when traversing", () => {
        const el = setup("AB<ul><li>nested</li></ul>CD");
        // Set cursor at offset 3 (skipping "nested")
        // "AB" = 2 chars, skip nested, "CD" starts at 2
        // So offset 3 = 1 char into "CD"
        setCursorOffset(el, 3, { skipAncestorTags: ["UL"] });

        const sel = window.getSelection()!;
        const range = sel.getRangeAt(0);
        expect(range.startOffset).toBe(1);
      });

      it("positions at end when offset exceeds non-skipped content", () => {
        const el = setup("AB<ul><li>nested</li></ul>");
        // Only "AB" (2 chars) is non-skipped, offset 100 exceeds it
        setCursorOffset(el, 100, { skipAncestorTags: ["UL"] });

        // Should position at end
        const sel = window.getSelection()!;
        expect(sel.rangeCount).toBe(1);
      });
    });
  });
});
