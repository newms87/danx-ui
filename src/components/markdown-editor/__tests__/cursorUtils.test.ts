import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import {
  CURSOR_ANCHOR,
  positionCursorAtEnd,
  positionCursorAtStart,
  getCursorViewportPosition,
  dispatchInputEvent,
  createSelectionManager,
} from "../cursorPosition";
import { getCursorOffset, setCursorOffset } from "../cursorOffset";

describe("cursorUtils", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    container.setAttribute("contenteditable", "true");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe("CURSOR_ANCHOR", () => {
    it("is a zero-width space character", () => {
      expect(CURSOR_ANCHOR).toBe("\u200B");
    });
  });

  describe("positionCursorAtEnd", () => {
    it("positions cursor at end of text content", () => {
      container.innerHTML = "<p>Hello world</p>";
      const p = container.querySelector("p")!;

      positionCursorAtEnd(p);

      const sel = window.getSelection()!;
      expect(sel.rangeCount).toBe(1);
      const range = sel.getRangeAt(0);
      expect(range.collapsed).toBe(true);
      expect(range.startContainer.textContent).toBe("Hello world");
      expect(range.startOffset).toBe(11);
    });

    it("positions cursor at end of nested content", () => {
      container.innerHTML = "<p>Hello <strong>bold</strong></p>";
      const p = container.querySelector("p")!;

      positionCursorAtEnd(p);

      const sel = window.getSelection()!;
      const range = sel.getRangeAt(0);
      expect(range.startContainer.textContent).toBe("bold");
      expect(range.startOffset).toBe(4);
    });

    it("handles empty element with no text nodes", () => {
      container.innerHTML = "<p></p>";
      const p = container.querySelector("p")!;

      positionCursorAtEnd(p);

      const sel = window.getSelection()!;
      expect(sel.rangeCount).toBe(1);
      const range = sel.getRangeAt(0);
      expect(range.collapsed).toBe(true);
    });

    it("does nothing when getSelection returns null", () => {
      const original = window.getSelection;
      window.getSelection = () => null;

      container.innerHTML = "<p>Hello</p>";
      const p = container.querySelector("p")!;

      // Should not throw
      positionCursorAtEnd(p);

      window.getSelection = original;
    });
  });

  describe("positionCursorAtStart", () => {
    it("positions cursor at start of text content", () => {
      container.innerHTML = "<p>Hello world</p>";
      const p = container.querySelector("p")!;

      positionCursorAtStart(p);

      const sel = window.getSelection()!;
      const range = sel.getRangeAt(0);
      expect(range.collapsed).toBe(true);
      expect(range.startOffset).toBe(0);
    });

    it("positions cursor after CURSOR_ANCHOR (zero-width space)", () => {
      container.innerHTML = "<p>\u200B</p>";
      const p = container.querySelector("p")!;

      positionCursorAtStart(p);

      const sel = window.getSelection()!;
      const range = sel.getRangeAt(0);
      // Should position after the zero-width space
      expect(range.startOffset).toBe(1);
    });

    it("handles empty element with no text nodes", () => {
      container.innerHTML = "<p></p>";
      const p = container.querySelector("p")!;

      positionCursorAtStart(p);

      const sel = window.getSelection()!;
      expect(sel.rangeCount).toBe(1);
      const range = sel.getRangeAt(0);
      expect(range.collapsed).toBe(true);
    });

    it("does nothing when getSelection returns null", () => {
      const original = window.getSelection;
      window.getSelection = () => null;

      container.innerHTML = "<p>Hello</p>";
      const p = container.querySelector("p")!;

      positionCursorAtStart(p);

      window.getSelection = original;
    });
  });

  describe("getCursorOffset", () => {
    it("returns 0 when no selection exists", () => {
      window.getSelection()?.removeAllRanges();
      expect(getCursorOffset(container)).toBe(0);
    });

    it("returns correct offset for cursor in middle of text", () => {
      container.textContent = "Hello world";
      const textNode = container.firstChild!;

      const range = document.createRange();
      range.setStart(textNode, 5);
      range.collapse(true);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);

      expect(getCursorOffset(container)).toBe(5);
    });

    it("returns 0 when cursor is at start", () => {
      container.textContent = "Hello";
      const textNode = container.firstChild!;

      const range = document.createRange();
      range.setStart(textNode, 0);
      range.collapse(true);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);

      expect(getCursorOffset(container)).toBe(0);
    });

    it("returns 0 when getSelection returns null", () => {
      const original = window.getSelection;
      window.getSelection = () => null;

      expect(getCursorOffset(container)).toBe(0);

      window.getSelection = original;
    });

    it("skips text inside ancestors matching skipAncestorTags", () => {
      // Simulate a list item with nested list: <li>Hello<ul><li>nested</li></ul></li>
      container.innerHTML = "Hello";
      const nestedUl = document.createElement("ul");
      const nestedLi = document.createElement("li");
      nestedLi.textContent = "nested";
      nestedUl.appendChild(nestedLi);
      container.appendChild(nestedUl);
      container.appendChild(document.createTextNode(" world"));

      // Place cursor at end of " world" (5 + 6 = 11 without skip, 5 + 6 = 11 total)
      const worldNode = container.lastChild!;
      const range = document.createRange();
      range.setStart(worldNode, 6);
      range.collapse(true);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);

      // Without skip: includes "nested" (6 chars)
      const offsetWithAll = getCursorOffset(container);
      expect(offsetWithAll).toBe(17); // "Hello" + "nested" + " world"

      // With skip: excludes "nested"
      const offsetSkipped = getCursorOffset(container, { skipAncestorTags: ["UL"] });
      expect(offsetSkipped).toBe(11); // "Hello" + " world"
    });

    it("returns 0 with skipAncestorTags when no selection exists", () => {
      window.getSelection()?.removeAllRanges();
      expect(getCursorOffset(container, { skipAncestorTags: ["UL"] })).toBe(0);
    });

    it("handles cursor inside text before skipped ancestor", () => {
      container.innerHTML = "Hello";
      const nestedOl = document.createElement("ol");
      const nestedLi = document.createElement("li");
      nestedLi.textContent = "nested";
      nestedOl.appendChild(nestedLi);
      container.appendChild(nestedOl);

      // Place cursor at offset 3 in "Hello"
      const textNode = container.firstChild!;
      const range = document.createRange();
      range.setStart(textNode, 3);
      range.collapse(true);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);

      const offset = getCursorOffset(container, { skipAncestorTags: ["OL"] });
      expect(offset).toBe(3);
    });

    it("treats empty skipAncestorTags as fast path", () => {
      container.textContent = "Hello";
      const textNode = container.firstChild!;

      const range = document.createRange();
      range.setStart(textNode, 3);
      range.collapse(true);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);

      expect(getCursorOffset(container, { skipAncestorTags: [] })).toBe(3);
    });

    it("stops counting when text node is after cursor position with skipAncestorTags", () => {
      // Create: "Hello<span>World</span>" with cursor at offset 3 in "Hello"
      // The span text "World" comes AFTER the cursor, so the slow path
      // should stop and not count it (DOCUMENT_POSITION_FOLLOWING fails)
      const span = document.createElement("span");
      span.textContent = "World";
      container.textContent = "";
      container.appendChild(document.createTextNode("Hello"));
      container.appendChild(span);

      // Place cursor at offset 3 in "Hello"
      const textNode = container.firstChild!;
      const range = document.createRange();
      range.setStart(textNode, 3);
      range.collapse(true);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);

      // Use a skipAncestorTags that doesn't match anything to force slow path
      const offset = getCursorOffset(container, { skipAncestorTags: ["BLOCKQUOTE"] });
      expect(offset).toBe(3);
    });

    it("counts offset when cursor is in an element node with skipAncestorTags", () => {
      // When cursor startContainer is an element (not text node), the slow path
      // must handle comparing text nodes to the element-level cursor
      container.innerHTML = "<b>Bold</b><i>Italic</i>";

      // Place cursor in the <i> element node (not in its text)
      const italic = container.querySelector("i")!;
      const range = document.createRange();
      range.setStart(italic, 0);
      range.collapse(true);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);

      const offset = getCursorOffset(container, { skipAncestorTags: ["BLOCKQUOTE"] });
      // "Bold" is 4 chars, all before the cursor in <i>
      expect(offset).toBe(4);
    });

    it("counts all text when cursor is outside the element with skipAncestorTags", () => {
      // When cursor startContainer is outside the element, all text nodes
      // inside the element are counted (fallback branch)
      const inner = document.createElement("span");
      inner.textContent = "Inside";
      container.textContent = "";
      container.appendChild(inner);
      container.appendChild(document.createTextNode("Outside"));

      // Place cursor in the "Outside" text node which is a sibling, not inside <span>
      const outsideText = container.lastChild!;
      const range = document.createRange();
      range.setStart(outsideText, 3);
      range.collapse(true);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);

      // Measure offset inside <span> only - cursor is outside <span>
      const offset = getCursorOffset(inner as HTMLElement, { skipAncestorTags: ["BLOCKQUOTE"] });
      // "Inside" is 6 chars, all counted because cursor is outside span
      expect(offset).toBe(6);
    });
  });

  describe("setCursorOffset", () => {
    it("sets cursor at the target offset in a single text node", () => {
      container.textContent = "Hello world";

      setCursorOffset(container, 5);

      const sel = window.getSelection()!;
      const range = sel.getRangeAt(0);
      expect(range.startOffset).toBe(5);
    });

    it("sets cursor in the correct text node for multi-node content", () => {
      container.innerHTML = "Hello <strong>bold</strong> world";

      // Offset 8 should be inside "bold" (offset 2 within the strong text)
      setCursorOffset(container, 8);

      const sel = window.getSelection()!;
      const range = sel.getRangeAt(0);
      expect(range.startContainer.textContent).toBe("bold");
      expect(range.startOffset).toBe(2);
    });

    it("places cursor at end when offset exceeds content length", () => {
      container.textContent = "Hi";

      setCursorOffset(container, 100);

      const sel = window.getSelection()!;
      const range = sel.getRangeAt(0);
      expect(range.collapsed).toBe(true);
    });

    it("does nothing when getSelection returns null", () => {
      const original = window.getSelection;
      window.getSelection = () => null;

      container.textContent = "Hello";
      setCursorOffset(container, 3);

      window.getSelection = original;
    });

    it("skips text inside ancestors matching skipAncestorTags", () => {
      // <div>Hello<ul><li>nested</li></ul> world</div>
      container.innerHTML = "Hello";
      const nestedUl = document.createElement("ul");
      const nestedLi = document.createElement("li");
      nestedLi.textContent = "nested";
      nestedUl.appendChild(nestedLi);
      container.appendChild(nestedUl);
      container.appendChild(document.createTextNode(" world"));

      // Set cursor at offset 8 (skipping "nested"): should land in " world" at position 3
      setCursorOffset(container, 8, { skipAncestorTags: ["UL"] });

      const sel = window.getSelection()!;
      const range = sel.getRangeAt(0);
      expect(range.startContainer.textContent).toBe(" world");
      expect(range.startOffset).toBe(3);
    });

    it("places cursor at end when offset exceeds content with skipAncestorTags", () => {
      container.innerHTML = "Hi";
      const nestedUl = document.createElement("ul");
      const nestedLi = document.createElement("li");
      nestedLi.textContent = "nested";
      nestedUl.appendChild(nestedLi);
      container.appendChild(nestedUl);

      setCursorOffset(container, 100, { skipAncestorTags: ["UL"] });

      const sel = window.getSelection()!;
      const range = sel.getRangeAt(0);
      expect(range.collapsed).toBe(true);
    });

    it("handles empty skipAncestorTags normally", () => {
      container.textContent = "Hello";

      setCursorOffset(container, 3, { skipAncestorTags: [] });

      const sel = window.getSelection()!;
      const range = sel.getRangeAt(0);
      expect(range.startOffset).toBe(3);
    });
  });

  describe("getCursorViewportPosition", () => {
    it("returns center of window when no selection exists", () => {
      window.getSelection()?.removeAllRanges();

      const pos = getCursorViewportPosition();
      expect(pos.x).toBe(window.innerWidth / 2);
      expect(pos.y).toBe(window.innerHeight / 2);
    });

    it("returns position based on range bounding rect", () => {
      container.textContent = "Hello world";
      const textNode = container.firstChild!;

      const range = document.createRange();
      range.setStart(textNode, 5);
      range.collapse(true);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);

      const pos = getCursorViewportPosition();
      // In jsdom, getBoundingClientRect returns zeros
      // When width and height are 0, it uses rect.left or window center
      expect(pos).toHaveProperty("x");
      expect(pos).toHaveProperty("y");
    });

    it("returns center fallback when getSelection returns null", () => {
      const original = window.getSelection;
      window.getSelection = () => null;

      const pos = getCursorViewportPosition();
      expect(pos.x).toBe(window.innerWidth / 2);
      expect(pos.y).toBe(window.innerHeight / 2);

      window.getSelection = original;
    });
  });

  describe("dispatchInputEvent", () => {
    it("dispatches an input event on the element", () => {
      const handler = vi.fn();
      container.addEventListener("input", handler);

      dispatchInputEvent(container);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0]).toBeInstanceOf(InputEvent);
    });

    it("dispatches event that bubbles", () => {
      const child = document.createElement("span");
      container.appendChild(child);

      const handler = vi.fn();
      container.addEventListener("input", handler);

      dispatchInputEvent(child);

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe("createSelectionManager", () => {
    it("returns save and restore functions", () => {
      const manager = createSelectionManager();
      expect(typeof manager.save).toBe("function");
      expect(typeof manager.restore).toBe("function");
    });

    it("saves and restores selection", () => {
      container.textContent = "Hello world";
      const textNode = container.firstChild!;

      // Set initial cursor position
      const range = document.createRange();
      range.setStart(textNode, 5);
      range.collapse(true);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);

      const manager = createSelectionManager();

      // Save the current selection
      manager.save();

      // Move cursor elsewhere
      const newRange = document.createRange();
      newRange.setStart(textNode, 0);
      newRange.collapse(true);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(newRange);

      // Restore
      manager.restore();

      const sel = window.getSelection()!;
      const restored = sel.getRangeAt(0);
      expect(restored.startOffset).toBe(5);
    });

    it("restore does nothing when nothing was saved", () => {
      const manager = createSelectionManager();

      // Should not throw
      manager.restore();
    });

    it("save does nothing when no selection exists", () => {
      window.getSelection()?.removeAllRanges();
      const manager = createSelectionManager();

      // Should not throw
      manager.save();

      // Restore should also not throw since nothing was saved
      manager.restore();
    });

    it("save does nothing when getSelection returns null", () => {
      const original = window.getSelection;
      window.getSelection = () => null;

      const manager = createSelectionManager();
      manager.save();

      window.getSelection = original;

      // Restore should not throw since nothing was saved
      manager.restore();
    });

    it("restore does nothing when getSelection returns null", () => {
      container.textContent = "Hello";
      const textNode = container.firstChild!;

      const range = document.createRange();
      range.setStart(textNode, 3);
      range.collapse(true);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);

      const manager = createSelectionManager();
      manager.save();

      const original = window.getSelection;
      window.getSelection = () => null;

      // Should not throw
      manager.restore();

      window.getSelection = original;
    });
  });
});
