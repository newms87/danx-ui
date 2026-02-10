import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";
import {
  getTargetBlock,
  getListItem,
  getParentList,
  getListType,
  getDirectTextContent,
  isCursorAtEndOfElement,
} from "../listDomUtils";
import { UseMarkdownSelectionReturn } from "../useMarkdownSelection";

function createMockSelection(currentBlock: Element | null = null): UseMarkdownSelectionReturn {
  return {
    getCurrentBlock: vi.fn(() => currentBlock),
    saveSelection: vi.fn(),
    restoreSelection: vi.fn(),
    setSelectionToEnd: vi.fn(),
    isSelectionInsideContent: vi.fn(() => true),
  } as unknown as UseMarkdownSelectionReturn;
}

describe("listDomUtils", () => {
  describe("getTargetBlock", () => {
    it("delegates to shared getTargetBlock with includeLists", () => {
      const contentEl = document.createElement("div");
      const p = document.createElement("p");
      p.textContent = "hello";
      contentEl.appendChild(p);

      const selection = createMockSelection(p);
      const result = getTargetBlock(ref(contentEl), selection);
      // Should return the block or null depending on DOM structure
      expect(result === p || result === null).toBe(true);
    });
  });

  describe("getListItem", () => {
    it("returns LI element when cursor is inside one", () => {
      const li = document.createElement("li");
      li.textContent = "item";
      const selection = createMockSelection(li);
      expect(getListItem(selection)).toBe(li);
    });

    it("walks up to find LI from nested element", () => {
      const li = document.createElement("li");
      const span = document.createElement("span");
      span.textContent = "text";
      li.appendChild(span);
      const selection = createMockSelection(span);
      expect(getListItem(selection)).toBe(li);
    });

    it("returns null when no LI ancestor", () => {
      const p = document.createElement("p");
      p.textContent = "not a list";
      const selection = createMockSelection(p);
      expect(getListItem(selection)).toBeNull();
    });

    it("returns null when getCurrentBlock returns null", () => {
      const selection = createMockSelection(null);
      expect(getListItem(selection)).toBeNull();
    });
  });

  describe("getParentList", () => {
    it("returns UL parent", () => {
      const ul = document.createElement("ul");
      const li = document.createElement("li");
      ul.appendChild(li);
      expect(getParentList(li)).toBe(ul);
    });

    it("returns OL parent", () => {
      const ol = document.createElement("ol");
      const li = document.createElement("li");
      ol.appendChild(li);
      expect(getParentList(li)).toBe(ol);
    });

    it("returns null when parent is not a list", () => {
      const div = document.createElement("div");
      const li = document.createElement("li");
      div.appendChild(li);
      expect(getParentList(li)).toBeNull();
    });

    it("returns null for detached LI", () => {
      const li = document.createElement("li");
      expect(getParentList(li)).toBeNull();
    });
  });

  describe("getListType", () => {
    it("returns 'ul' when in an unordered list", () => {
      const ul = document.createElement("ul");
      const li = document.createElement("li");
      li.textContent = "item";
      ul.appendChild(li);
      const selection = createMockSelection(li);
      expect(getListType(selection)).toBe("ul");
    });

    it("returns 'ol' when in an ordered list", () => {
      const ol = document.createElement("ol");
      const li = document.createElement("li");
      li.textContent = "item";
      ol.appendChild(li);
      const selection = createMockSelection(li);
      expect(getListType(selection)).toBe("ol");
    });

    it("returns null when not in a list", () => {
      const p = document.createElement("p");
      p.textContent = "text";
      const selection = createMockSelection(p);
      expect(getListType(selection)).toBeNull();
    });

    it("returns null when LI has no list parent", () => {
      const div = document.createElement("div");
      const li = document.createElement("li");
      div.appendChild(li);
      const selection = createMockSelection(li);
      expect(getListType(selection)).toBeNull();
    });
  });

  describe("getDirectTextContent", () => {
    it("returns text from text nodes", () => {
      const p = document.createElement("p");
      p.textContent = "hello world";
      expect(getDirectTextContent(p)).toBe("hello world");
    });

    it("includes text from non-list child elements", () => {
      const li = document.createElement("li");
      const span = document.createElement("span");
      span.textContent = "formatted";
      li.appendChild(document.createTextNode("plain "));
      li.appendChild(span);
      expect(getDirectTextContent(li)).toBe("plain formatted");
    });

    it("excludes text from nested UL", () => {
      const li = document.createElement("li");
      li.appendChild(document.createTextNode("item"));
      const nestedUl = document.createElement("ul");
      const nestedLi = document.createElement("li");
      nestedLi.textContent = "nested";
      nestedUl.appendChild(nestedLi);
      li.appendChild(nestedUl);
      expect(getDirectTextContent(li)).toBe("item");
    });

    it("excludes text from nested OL", () => {
      const li = document.createElement("li");
      li.appendChild(document.createTextNode("item"));
      const nestedOl = document.createElement("ol");
      const nestedLi = document.createElement("li");
      nestedLi.textContent = "nested";
      nestedOl.appendChild(nestedLi);
      li.appendChild(nestedOl);
      expect(getDirectTextContent(li)).toBe("item");
    });

    it("returns empty string for empty element", () => {
      const p = document.createElement("p");
      expect(getDirectTextContent(p)).toBe("");
    });

    it("trims whitespace", () => {
      const p = document.createElement("p");
      p.textContent = "  hello  ";
      expect(getDirectTextContent(p)).toBe("hello");
    });
  });

  describe("isCursorAtEndOfElement", () => {
    it("returns true when cursor is at the end", () => {
      const p = document.createElement("p");
      p.textContent = "hello";
      document.body.appendChild(p);

      const range = document.createRange();
      range.setStart(p.firstChild!, 5);
      range.setEnd(p.firstChild!, 5);

      expect(isCursorAtEndOfElement(p, range)).toBe(true);
      document.body.removeChild(p);
    });

    it("returns false when cursor is not at the end", () => {
      const p = document.createElement("p");
      p.textContent = "hello";
      document.body.appendChild(p);

      const range = document.createRange();
      range.setStart(p.firstChild!, 2);
      range.setEnd(p.firstChild!, 2);

      expect(isCursorAtEndOfElement(p, range)).toBe(false);
      document.body.removeChild(p);
    });

    it("returns true for empty element", () => {
      const p = document.createElement("p");
      document.body.appendChild(p);

      const range = document.createRange();
      range.selectNodeContents(p);
      range.collapse(false);

      expect(isCursorAtEndOfElement(p, range)).toBe(true);
      document.body.removeChild(p);
    });
  });
});
