import { describe, it, expect, vi } from "vitest";
import {
  getCursorOffsetInCell,
  setCursorOffsetInCell,
  getFirstTextNode,
  focusCell,
  selectCellContent,
  getCurrentSelectionRange,
} from "../tableCellUtils";

/**
 * Helper to create a container with HTML content
 */
function createContainer(html: string): HTMLElement {
  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);
  return container;
}

/**
 * Helper to clean up container
 */
function destroyContainer(container: HTMLElement): void {
  container.remove();
}

/**
 * Helper to set cursor at a specific position in a text node
 */
function setCursorAt(node: Node, offset: number): void {
  const range = document.createRange();
  range.setStart(node, offset);
  range.collapse(true);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}

describe("tableCellUtils", () => {
  describe("getCursorOffsetInCell", () => {
    it("returns 0 when cursor is at start of cell", () => {
      const container = createContainer("<table><tbody><tr><td>Hello</td></tr></tbody></table>");
      const td = container.querySelector("td") as HTMLTableCellElement;
      setCursorAt(td.firstChild!, 0);

      expect(getCursorOffsetInCell(td)).toBe(0);
      destroyContainer(container);
    });

    it("returns correct offset when cursor is in middle of text", () => {
      const container = createContainer("<table><tbody><tr><td>Hello</td></tr></tbody></table>");
      const td = container.querySelector("td") as HTMLTableCellElement;
      setCursorAt(td.firstChild!, 3);

      expect(getCursorOffsetInCell(td)).toBe(3);
      destroyContainer(container);
    });

    it("returns correct offset for nested elements", () => {
      const container = createContainer(
        "<table><tbody><tr><td>A<strong>B</strong>C</td></tr></tbody></table>"
      );
      const td = container.querySelector("td") as HTMLTableCellElement;
      const strong = td.querySelector("strong")!;
      setCursorAt(strong.firstChild!, 1);

      // "A" + "B" (cursor after B) = offset 2
      expect(getCursorOffsetInCell(td)).toBe(2);
      destroyContainer(container);
    });

    it("returns 0 when no selection exists", () => {
      const container = createContainer("<table><tbody><tr><td>Hello</td></tr></tbody></table>");
      const td = container.querySelector("td") as HTMLTableCellElement;
      window.getSelection()?.removeAllRanges();

      expect(getCursorOffsetInCell(td)).toBe(0);
      destroyContainer(container);
    });
  });

  describe("setCursorOffsetInCell", () => {
    it("sets cursor at specified offset in text", () => {
      const container = createContainer("<table><tbody><tr><td>Hello</td></tr></tbody></table>");
      const td = container.querySelector("td") as HTMLTableCellElement;

      setCursorOffsetInCell(td, 3);

      const sel = window.getSelection();
      expect(sel?.rangeCount).toBe(1);
      const range = sel!.getRangeAt(0);
      expect(range.startOffset).toBe(3);
      destroyContainer(container);
    });

    it("clamps offset to text length when offset exceeds content", () => {
      const container = createContainer("<table><tbody><tr><td>Hi</td></tr></tbody></table>");
      const td = container.querySelector("td") as HTMLTableCellElement;

      setCursorOffsetInCell(td, 10);

      // Should be at end of "Hi" (offset 2)
      expect(getCursorOffsetInCell(td)).toBe(2);
      destroyContainer(container);
    });

    it("sets cursor at start when offset is 0", () => {
      const container = createContainer("<table><tbody><tr><td>Hello</td></tr></tbody></table>");
      const td = container.querySelector("td") as HTMLTableCellElement;

      setCursorOffsetInCell(td, 0);

      expect(getCursorOffsetInCell(td)).toBe(0);
      destroyContainer(container);
    });

    it("handles empty cell by placing cursor at end", () => {
      const container = createContainer("<table><tbody><tr><td><br></td></tr></tbody></table>");
      const td = container.querySelector("td") as HTMLTableCellElement;

      setCursorOffsetInCell(td, 3);

      // Cell is empty, cursor should be at position 0
      expect(getCursorOffsetInCell(td)).toBe(0);
      destroyContainer(container);
    });

    it("handles nested formatting elements", () => {
      const container = createContainer(
        "<table><tbody><tr><td>A<strong>BCD</strong>E</td></tr></tbody></table>"
      );
      const td = container.querySelector("td") as HTMLTableCellElement;

      setCursorOffsetInCell(td, 3);

      // Should be inside "BCD" at offset 2 (total: A + BC = 3)
      expect(getCursorOffsetInCell(td)).toBe(3);
      destroyContainer(container);
    });
  });

  describe("getFirstTextNode", () => {
    it("returns text node directly if node is text", () => {
      const text = document.createTextNode("Hello");

      expect(getFirstTextNode(text)).toBe(text);
    });

    it("returns first child text node from element", () => {
      const div = document.createElement("div");
      const text = document.createTextNode("Hello");
      div.appendChild(text);

      expect(getFirstTextNode(div)).toBe(text);
    });

    it("skips BR elements", () => {
      const div = document.createElement("div");
      div.appendChild(document.createElement("br"));
      const text = document.createTextNode("Hello");
      div.appendChild(text);

      expect(getFirstTextNode(div)).toBe(text);
    });

    it("returns null when no text nodes exist (only BRs)", () => {
      const div = document.createElement("div");
      div.appendChild(document.createElement("br"));

      expect(getFirstTextNode(div)).toBeNull();
    });

    it("finds text node in nested elements", () => {
      const div = document.createElement("div");
      const strong = document.createElement("strong");
      const text = document.createTextNode("Bold");
      strong.appendChild(text);
      div.appendChild(strong);

      expect(getFirstTextNode(div)).toBe(text);
    });

    it("returns empty text node (whitespace-only)", () => {
      const text = document.createTextNode("");

      expect(getFirstTextNode(text)).toBe(text);
    });
  });

  describe("focusCell", () => {
    it("places cursor at start of cell with text", () => {
      const container = createContainer("<table><tbody><tr><td>Hello</td></tr></tbody></table>");
      const td = container.querySelector("td") as HTMLTableCellElement;

      focusCell(td);

      const sel = window.getSelection();
      expect(sel?.rangeCount).toBe(1);
      const range = sel!.getRangeAt(0);
      expect(range.collapsed).toBe(true);
      expect(getCursorOffsetInCell(td)).toBe(0);
      destroyContainer(container);
    });

    it("handles empty cell with BR placeholder", () => {
      const container = createContainer("<table><tbody><tr><td><br></td></tr></tbody></table>");
      const td = container.querySelector("td") as HTMLTableCellElement;

      focusCell(td);

      const sel = window.getSelection();
      expect(sel?.rangeCount).toBe(1);
      const range = sel!.getRangeAt(0);
      expect(range.collapsed).toBe(true);
      destroyContainer(container);
    });

    it("places cursor at start, not selecting text", () => {
      const container = createContainer(
        "<table><tbody><tr><td>Hello World</td></tr></tbody></table>"
      );
      const td = container.querySelector("td") as HTMLTableCellElement;

      focusCell(td);

      const sel = window.getSelection();
      expect(sel?.isCollapsed).toBe(true);
      destroyContainer(container);
    });
  });

  describe("selectCellContent", () => {
    it("selects all content in a cell", () => {
      const container = createContainer("<table><tbody><tr><td>Hello</td></tr></tbody></table>");
      const td = container.querySelector("td") as HTMLTableCellElement;

      selectCellContent(td);

      const sel = window.getSelection();
      expect(sel?.toString()).toBe("Hello");
      destroyContainer(container);
    });

    it("selects content with nested formatting", () => {
      const container = createContainer(
        "<table><tbody><tr><td><strong>Bold</strong></td></tr></tbody></table>"
      );
      const td = container.querySelector("td") as HTMLTableCellElement;

      selectCellContent(td);

      const sel = window.getSelection();
      expect(sel?.toString()).toBe("Bold");
      destroyContainer(container);
    });
  });

  describe("setCursorOffsetInCell - null selection", () => {
    it("returns early when window.getSelection returns null", () => {
      const container = createContainer("<table><tbody><tr><td>Hello</td></tr></tbody></table>");
      const td = container.querySelector("td") as HTMLTableCellElement;

      const spy = vi.spyOn(window, "getSelection").mockReturnValue(null);

      // Should return without throwing
      setCursorOffsetInCell(td, 3);

      spy.mockRestore();
      destroyContainer(container);
    });
  });

  describe("focusCell - null selection", () => {
    it("returns early when window.getSelection returns null", () => {
      const container = createContainer("<table><tbody><tr><td>Hello</td></tr></tbody></table>");
      const td = container.querySelector("td") as HTMLTableCellElement;

      const spy = vi.spyOn(window, "getSelection").mockReturnValue(null);

      // Should return without throwing
      focusCell(td);

      spy.mockRestore();
      destroyContainer(container);
    });
  });

  describe("selectCellContent - null selection", () => {
    it("returns early when window.getSelection returns null", () => {
      const container = createContainer("<table><tbody><tr><td>Hello</td></tr></tbody></table>");
      const td = container.querySelector("td") as HTMLTableCellElement;

      const spy = vi.spyOn(window, "getSelection").mockReturnValue(null);

      // Should return without throwing
      selectCellContent(td);

      spy.mockRestore();
      destroyContainer(container);
    });
  });

  describe("getFirstTextNode - element with no children", () => {
    it("returns null for an empty element with no child nodes", () => {
      const div = document.createElement("div");

      expect(getFirstTextNode(div)).toBeNull();
    });

    it("returns null when all children are non-text, non-BR elements with no text nodes", () => {
      const div = document.createElement("div");
      const span = document.createElement("span");
      div.appendChild(span);

      expect(getFirstTextNode(div)).toBeNull();
    });

    it("skips BR then recurses into nested element to find text", () => {
      const div = document.createElement("div");
      div.appendChild(document.createElement("br"));
      const span = document.createElement("span");
      const text = document.createTextNode("nested");
      span.appendChild(text);
      div.appendChild(span);

      expect(getFirstTextNode(div)).toBe(text);
    });
  });

  describe("getCurrentSelectionRange", () => {
    it("returns range when selection exists", () => {
      const container = createContainer("<p>Hello</p>");
      setCursorAt(container.querySelector("p")!.firstChild!, 0);

      const range = getCurrentSelectionRange();

      expect(range).not.toBeNull();
      expect(range).toBeInstanceOf(Range);
      destroyContainer(container);
    });

    it("returns null when no selection exists", () => {
      window.getSelection()?.removeAllRanges();

      expect(getCurrentSelectionRange()).toBeNull();
    });
  });
});
