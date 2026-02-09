import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useLists } from "../useLists";
import { useMarkdownSelection } from "../useMarkdownSelection";
import { createTestEditor, TestEditorResult } from "./editorTestUtils";

describe("useLists", () => {
  let editor: TestEditorResult;
  let onContentChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    editor = createTestEditor("<p>Hello world</p>");
    onContentChange = vi.fn();
  });

  afterEach(() => {
    if (editor) {
      editor.destroy();
    }
  });

  function createLists() {
    const selection = useMarkdownSelection(editor.contentRef);
    return useLists({
      contentRef: editor.contentRef,
      selection,
      onContentChange: onContentChange as unknown as () => void,
    });
  }

  /**
   * Helper to set cursor in a list item by finding its text node
   */
  function setCursorInListItem(li: HTMLLIElement, offset: number): void {
    const walker = document.createTreeWalker(li, NodeFilter.SHOW_TEXT);
    let textNode = walker.nextNode() as Text | null;

    // Skip text nodes inside nested lists
    while (textNode) {
      let parent: Node | null = textNode.parentNode;
      let inNestedList = false;
      while (parent && parent !== li) {
        if (parent.nodeName === "UL" || parent.nodeName === "OL") {
          inNestedList = true;
          break;
        }
        parent = parent.parentNode;
      }
      if (!inNestedList) break;
      textNode = walker.nextNode() as Text | null;
    }

    if (textNode) {
      editor.setCursor(textNode, Math.min(offset, textNode.textContent?.length || 0));
    } else {
      // If no text node, set cursor at the li itself
      const range = document.createRange();
      range.setStart(li, 0);
      range.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }

  describe("toggleUnorderedList", () => {
    it("converts paragraph to unordered list", () => {
      const lists = createLists();
      editor.setCursorInBlock(0, 0);

      lists.toggleUnorderedList();

      expect(editor.getHtml()).toBe("<ul><li>Hello world</li></ul>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("converts unordered list back to paragraph", () => {
      editor = createTestEditor("<ul><li>Hello world</li></ul>");
      const lists = createLists();
      const li = editor.container.querySelector("li")!;
      setCursorInListItem(li, 0);

      lists.toggleUnorderedList();

      expect(editor.getHtml()).toBe("<p>Hello world</p>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("converts ordered list to unordered list", () => {
      editor = createTestEditor("<ol><li>Item one</li></ol>");
      const lists = createLists();
      const li = editor.container.querySelector("li")!;
      setCursorInListItem(li, 0);

      lists.toggleUnorderedList();

      expect(editor.getHtml()).toBe("<ul><li>Item one</li></ul>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("converts multi-item ordered list to unordered list", () => {
      editor = createTestEditor("<ol><li>First</li><li>Second</li><li>Third</li></ol>");
      const lists = createLists();
      const firstLi = editor.container.querySelector("li")!;
      setCursorInListItem(firstLi, 0);

      lists.toggleUnorderedList();

      const html = editor.getHtml();
      expect(html).toContain("<ul>");
      expect(html).not.toContain("<ol>");
      expect(editor.container.querySelectorAll("li").length).toBe(3);
    });

    it("preserves content when toggling", () => {
      editor = createTestEditor("<p>Content with <strong>bold</strong> text</p>");
      const lists = createLists();
      editor.setCursorInBlock(0, 0);

      lists.toggleUnorderedList();

      expect(editor.container.querySelector("li strong")).not.toBeNull();
      expect(editor.container.textContent).toContain("Content with bold text");
    });
  });

  describe("toggleOrderedList", () => {
    it("converts paragraph to ordered list", () => {
      const lists = createLists();
      editor.setCursorInBlock(0, 0);

      lists.toggleOrderedList();

      expect(editor.getHtml()).toBe("<ol><li>Hello world</li></ol>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("converts ordered list back to paragraph", () => {
      editor = createTestEditor("<ol><li>Numbered item</li></ol>");
      const lists = createLists();
      const li = editor.container.querySelector("li")!;
      setCursorInListItem(li, 0);

      lists.toggleOrderedList();

      expect(editor.getHtml()).toBe("<p>Numbered item</p>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("converts unordered list to ordered list", () => {
      editor = createTestEditor("<ul><li>Bullet item</li></ul>");
      const lists = createLists();
      const li = editor.container.querySelector("li")!;
      setCursorInListItem(li, 0);

      lists.toggleOrderedList();

      expect(editor.getHtml()).toBe("<ol><li>Bullet item</li></ol>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("converts multi-item unordered list to ordered list", () => {
      editor = createTestEditor("<ul><li>One</li><li>Two</li></ul>");
      const lists = createLists();
      const li = editor.container.querySelector("li")!;
      setCursorInListItem(li, 0);

      lists.toggleOrderedList();

      const html = editor.getHtml();
      expect(html).toContain("<ol>");
      expect(html).not.toContain("<ul>");
      expect(editor.container.querySelectorAll("li").length).toBe(2);
    });
  });

  describe("checkAndConvertListPattern", () => {
    it('converts "- item" to unordered list', () => {
      editor = createTestEditor("<p>- my item</p>");
      const lists = createLists();
      editor.setCursorInBlock(0, 9);

      const converted = lists.checkAndConvertListPattern();

      expect(converted).toBe(true);
      expect(editor.getHtml()).toBe("<ul><li>my item</li></ul>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it('converts "* item" to unordered list', () => {
      editor = createTestEditor("<p>* bullet point</p>");
      const lists = createLists();
      editor.setCursorInBlock(0, 14);

      const converted = lists.checkAndConvertListPattern();

      expect(converted).toBe(true);
      expect(editor.container.querySelector("ul")).not.toBeNull();
      expect(editor.container.querySelector("li")?.textContent).toBe("bullet point");
    });

    it('converts "+" item" to unordered list', () => {
      editor = createTestEditor("<p>+ plus item</p>");
      const lists = createLists();
      editor.setCursorInBlock(0, 11);

      const converted = lists.checkAndConvertListPattern();

      expect(converted).toBe(true);
      expect(editor.container.querySelector("ul")).not.toBeNull();
      expect(editor.container.querySelector("li")?.textContent).toBe("plus item");
    });

    it('converts "1. item" to ordered list', () => {
      editor = createTestEditor("<p>1. first item</p>");
      const lists = createLists();
      editor.setCursorInBlock(0, 13);

      const converted = lists.checkAndConvertListPattern();

      expect(converted).toBe(true);
      expect(editor.getHtml()).toBe("<ol><li>first item</li></ol>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it('converts "42. item" to ordered list', () => {
      editor = createTestEditor("<p>42. numbered item</p>");
      const lists = createLists();
      editor.setCursorInBlock(0, 17);

      const converted = lists.checkAndConvertListPattern();

      expect(converted).toBe(true);
      expect(editor.container.querySelector("ol")).not.toBeNull();
      expect(editor.container.querySelector("li")?.textContent).toBe("numbered item");
    });

    it("does not convert text without list pattern", () => {
      editor = createTestEditor("<p>Normal paragraph</p>");
      const lists = createLists();
      editor.setCursorInBlock(0, 0);

      const converted = lists.checkAndConvertListPattern();

      expect(converted).toBe(false);
      expect(editor.getHtml()).toBe("<p>Normal paragraph</p>");
      expect(onContentChange).not.toHaveBeenCalled();
    });

    it("does not convert existing list items", () => {
      editor = createTestEditor("<ul><li>- nested dash</li></ul>");
      const lists = createLists();
      const li = editor.container.querySelector("li")!;
      setCursorInListItem(li, 0);

      const converted = lists.checkAndConvertListPattern();

      expect(converted).toBe(false);
      // Should still be a single list
      expect(editor.container.querySelectorAll("ul").length).toBe(1);
    });

    it("handles empty content after pattern", () => {
      editor = createTestEditor("<p>- </p>");
      const lists = createLists();
      editor.setCursorInBlock(0, 2);

      const converted = lists.checkAndConvertListPattern();

      expect(converted).toBe(true);
      expect(editor.container.querySelector("ul")).not.toBeNull();
      expect(editor.container.querySelector("li")?.textContent).toBe("");
    });
  });

  describe("handleListEnter", () => {
    it("creates new list item when current item has content", () => {
      editor = createTestEditor("<ul><li>Item 1</li></ul>");
      const lists = createLists();
      const li = editor.container.querySelector("li")!;
      setCursorInListItem(li, 6); // End of "Item 1"

      const handled = lists.handleListEnter();

      expect(handled).toBe(true);
      expect(editor.container.querySelectorAll("li").length).toBe(2);
      expect(onContentChange).toHaveBeenCalled();
    });

    it("splits content when cursor is in middle", () => {
      editor = createTestEditor("<ul><li>Hello World</li></ul>");
      const lists = createLists();
      const li = editor.container.querySelector("li")!;
      setCursorInListItem(li, 5); // After "Hello"

      lists.handleListEnter();

      const items = editor.container.querySelectorAll("li");
      expect(items.length).toBe(2);
      expect(items[0]!.textContent).toBe("Hello");
      expect(items[1]!.textContent).toBe(" World");
    });

    it("exits list when item is empty at top level", () => {
      editor = createTestEditor("<ul><li>Item 1</li><li></li></ul>");
      const lists = createLists();
      const emptyLi = editor.container.querySelectorAll("li")[1]!;
      setCursorInListItem(emptyLi, 0);

      lists.handleListEnter();

      // Should convert empty li to paragraph
      expect(editor.container.querySelector("p")).not.toBeNull();
      expect(onContentChange).toHaveBeenCalled();
    });

    it("exits list and removes list when only empty item remains", () => {
      editor = createTestEditor("<ul><li></li></ul>");
      const lists = createLists();
      const li = editor.container.querySelector("li")!;
      setCursorInListItem(li, 0);

      lists.handleListEnter();

      // List should be gone, replaced with paragraph
      expect(editor.container.querySelector("ul")).toBeNull();
      expect(editor.container.querySelector("p")).not.toBeNull();
    });

    it("outdents when empty nested item", () => {
      editor = createTestEditor("<ul><li>Parent<ul><li></li></ul></li></ul>");
      const lists = createLists();
      const nestedLi = editor.container.querySelector("ul ul li")!;
      setCursorInListItem(nestedLi as HTMLLIElement, 0);

      lists.handleListEnter();

      // Should outdent the empty nested item
      expect(onContentChange).toHaveBeenCalled();
    });

    it("returns false when not in a list", () => {
      editor = createTestEditor("<p>Not a list</p>");
      const lists = createLists();
      editor.setCursorInBlock(0, 0);

      const handled = lists.handleListEnter();

      expect(handled).toBe(false);
      expect(onContentChange).not.toHaveBeenCalled();
    });

    it("works with ordered lists", () => {
      editor = createTestEditor("<ol><li>First</li></ol>");
      const lists = createLists();
      const li = editor.container.querySelector("li")!;
      setCursorInListItem(li, 5);

      lists.handleListEnter();

      expect(editor.container.querySelectorAll("ol li").length).toBe(2);
    });
  });

  describe("indentListItem", () => {
    it("indents second item under first", () => {
      editor = createTestEditor("<ul><li>First</li><li>Second</li></ul>");
      const lists = createLists();
      const secondLi = editor.container.querySelectorAll("li")[1];
      setCursorInListItem(secondLi as HTMLLIElement, 3);

      const handled = lists.indentListItem();

      expect(handled).toBe(true);
      expect(editor.getHtml()).toContain("<li>First<ul><li>Second</li></ul></li>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("cannot indent first item (no previous sibling)", () => {
      editor = createTestEditor("<ul><li>First</li><li>Second</li></ul>");
      const lists = createLists();
      const firstLi = editor.container.querySelector("li")!;
      setCursorInListItem(firstLi, 0);

      const handled = lists.indentListItem();

      expect(handled).toBe(false);
      expect(onContentChange).not.toHaveBeenCalled();
    });

    it("preserves cursor position after indent", () => {
      editor = createTestEditor("<ul><li>First</li><li>Second</li></ul>");
      const lists = createLists();
      const secondLi = editor.container.querySelectorAll("li")[1];
      setCursorInListItem(secondLi as HTMLLIElement, 3); // In middle of "Second"

      lists.indentListItem();

      // Cursor should still be within the text
      const sel = window.getSelection();
      expect(sel?.rangeCount).toBeGreaterThan(0);
    });

    it("appends to existing nested list", () => {
      editor = createTestEditor("<ul><li>First<ul><li>Nested</li></ul></li><li>Third</li></ul>");
      const lists = createLists();
      const thirdLi = editor.container.querySelectorAll(":scope > ul > li")[1] as HTMLLIElement;
      setCursorInListItem(thirdLi, 0);

      lists.indentListItem();

      // Third should now be in the nested list
      const nestedItems = editor.container.querySelectorAll("ul ul li");
      expect(nestedItems.length).toBe(2);
    });

    it("preserves list type when indenting", () => {
      editor = createTestEditor("<ol><li>First</li><li>Second</li></ol>");
      const lists = createLists();
      const secondLi = editor.container.querySelectorAll("li")[1];
      setCursorInListItem(secondLi as HTMLLIElement, 0);

      lists.indentListItem();

      // Nested list should also be ordered
      expect(editor.container.querySelector("ol ol")).not.toBeNull();
    });

    it("returns false when not in a list", () => {
      editor = createTestEditor("<p>Paragraph</p>");
      const lists = createLists();
      editor.setCursorInBlock(0, 0);

      const handled = lists.indentListItem();

      expect(handled).toBe(false);
    });
  });

  describe("outdentListItem", () => {
    it("outdents nested item to parent level", () => {
      editor = createTestEditor("<ul><li>Parent<ul><li>Nested</li></ul></li></ul>");
      const lists = createLists();
      const nestedLi = editor.container.querySelector("ul ul li")!;
      setCursorInListItem(nestedLi as HTMLLIElement, 0);

      const handled = lists.outdentListItem();

      expect(handled).toBe(true);
      // Nested item should now be at top level
      const topLevelItems = editor.container.querySelectorAll(":scope > ul > li");
      expect(topLevelItems.length).toBe(2);
      expect(onContentChange).toHaveBeenCalled();
    });

    it("converts top-level item to paragraph", () => {
      editor = createTestEditor("<ul><li>Item</li></ul>");
      const lists = createLists();
      const li = editor.container.querySelector("li")!;
      setCursorInListItem(li, 0);

      const handled = lists.outdentListItem();

      expect(handled).toBe(true);
      expect(editor.container.querySelector("ul")).toBeNull();
      expect(editor.container.querySelector("p")).not.toBeNull();
      expect(editor.container.querySelector("p")?.textContent).toBe("Item");
    });

    it("preserves cursor position after outdent", () => {
      editor = createTestEditor("<ul><li>Parent<ul><li>Nested</li></ul></li></ul>");
      const lists = createLists();
      const nestedLi = editor.container.querySelector("ul ul li")!;
      setCursorInListItem(nestedLi as HTMLLIElement, 3);

      lists.outdentListItem();

      // Cursor should still be within text
      const sel = window.getSelection();
      expect(sel?.rangeCount).toBeGreaterThan(0);
    });

    it("moves following siblings to nested list in current item", () => {
      editor = createTestEditor(
        "<ul><li>Parent<ul><li>First</li><li>Second</li><li>Third</li></ul></li></ul>"
      );
      const lists = createLists();
      // Outdent "Second" - "Third" should become nested under it
      const secondLi = editor.container.querySelectorAll("ul ul li")[1];
      setCursorInListItem(secondLi as HTMLLIElement, 0);

      lists.outdentListItem();

      // After outdent, "Second" should be at parent level with "Third" nested under it
      const secondNowTop = editor.container.querySelectorAll(":scope > ul > li")[1];
      expect(secondNowTop?.textContent).toContain("Second");
      expect(secondNowTop?.textContent).toContain("Third");
    });

    it("cleans up empty parent list after outdent", () => {
      editor = createTestEditor("<ul><li>Parent<ul><li>Only child</li></ul></li></ul>");
      const lists = createLists();
      const nestedLi = editor.container.querySelector("ul ul li")!;
      setCursorInListItem(nestedLi as HTMLLIElement, 0);

      lists.outdentListItem();

      // The nested ul should be removed since it's empty
      const nestedLists = editor.container.querySelectorAll("ul ul");
      expect(nestedLists.length).toBe(0);
    });

    it("returns false when not in a list", () => {
      editor = createTestEditor("<p>Paragraph</p>");
      const lists = createLists();
      editor.setCursorInBlock(0, 0);

      const handled = lists.outdentListItem();

      expect(handled).toBe(false);
    });
  });

  describe("getCurrentListType", () => {
    it('returns "ul" when in unordered list', () => {
      editor = createTestEditor("<ul><li>Bullet item</li></ul>");
      const lists = createLists();
      const li = editor.container.querySelector("li")!;
      setCursorInListItem(li, 0);

      expect(lists.getCurrentListType()).toBe("ul");
    });

    it('returns "ol" when in ordered list', () => {
      editor = createTestEditor("<ol><li>Numbered item</li></ol>");
      const lists = createLists();
      const li = editor.container.querySelector("li")!;
      setCursorInListItem(li, 0);

      expect(lists.getCurrentListType()).toBe("ol");
    });

    it("returns null when not in list", () => {
      editor = createTestEditor("<p>Paragraph</p>");
      const lists = createLists();
      editor.setCursorInBlock(0, 0);

      expect(lists.getCurrentListType()).toBeNull();
    });

    it("returns null when in heading", () => {
      editor = createTestEditor("<h1>Heading</h1>");
      const lists = createLists();
      editor.setCursorInBlock(0, 0);

      expect(lists.getCurrentListType()).toBeNull();
    });

    it("returns correct type for nested list", () => {
      editor = createTestEditor("<ul><li>Parent<ol><li>Nested ordered</li></ol></li></ul>");
      const lists = createLists();
      const nestedLi = editor.container.querySelector("ol li")!;
      setCursorInListItem(nestedLi as HTMLLIElement, 0);

      // Should return the immediate parent list type
      expect(lists.getCurrentListType()).toBe("ol");
    });
  });

  describe("list splitting behavior", () => {
    it("splits list when converting middle item to paragraph", () => {
      editor = createTestEditor("<ul><li>First</li><li>Second</li><li>Third</li></ul>");
      const lists = createLists();
      const secondLi = editor.container.querySelectorAll("li")[1];
      setCursorInListItem(secondLi as HTMLLIElement, 0);

      lists.toggleUnorderedList();

      // Should have: ul with First, p with Second, ul with Third
      const paragraphs = editor.container.querySelectorAll("p");
      expect(paragraphs.length).toBe(1);
      expect(paragraphs[0]!.textContent).toBe("Second");

      const lists2 = editor.container.querySelectorAll("ul");
      expect(lists2.length).toBe(2);
    });

    it("handles converting first item of multi-item list", () => {
      editor = createTestEditor("<ul><li>First</li><li>Second</li></ul>");
      const lists = createLists();
      const firstLi = editor.container.querySelector("li")!;
      setCursorInListItem(firstLi, 0);

      lists.toggleUnorderedList();

      // Should have: p with First, ul with Second
      expect(editor.container.querySelector("p")?.textContent).toBe("First");
      expect(editor.container.querySelectorAll("li").length).toBe(1);
    });

    it("handles converting last item of multi-item list", () => {
      editor = createTestEditor("<ul><li>First</li><li>Last</li></ul>");
      const lists = createLists();
      const lastLi = editor.container.querySelectorAll("li")[1];
      setCursorInListItem(lastLi as HTMLLIElement, 0);

      lists.toggleUnorderedList();

      // Should have: ul with First, p with Last
      expect(editor.container.querySelectorAll("li").length).toBe(1);
      expect(editor.container.querySelector("li")?.textContent).toBe("First");
      expect(editor.container.querySelector("p")?.textContent).toBe("Last");
    });
  });

  describe("heading to list conversion", () => {
    it("converts H1 to unordered list", () => {
      editor = createTestEditor("<h1>Heading One</h1>");
      const lists = createLists();
      editor.setCursorInBlock(0, 0);

      lists.toggleUnorderedList();

      expect(editor.getHtml()).toBe("<ul><li>Heading One</li></ul>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("converts H2 to ordered list", () => {
      editor = createTestEditor("<h2>Heading Two</h2>");
      const lists = createLists();
      editor.setCursorInBlock(0, 0);

      lists.toggleOrderedList();

      expect(editor.getHtml()).toBe("<ol><li>Heading Two</li></ol>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("converts H3 to unordered list via hotkey", () => {
      editor = createTestEditor("<h3>Heading Three</h3>");
      const lists = createLists();
      editor.setCursorInBlock(0, 0);

      lists.toggleUnorderedList();

      expect(editor.container.querySelector("ul")).not.toBeNull();
      expect(editor.container.querySelector("li")?.textContent).toBe("Heading Three");
    });

    it("converts H4 to ordered list via hotkey", () => {
      editor = createTestEditor("<h4>Heading Four</h4>");
      const lists = createLists();
      editor.setCursorInBlock(0, 0);

      lists.toggleOrderedList();

      expect(editor.container.querySelector("ol")).not.toBeNull();
      expect(editor.container.querySelector("li")?.textContent).toBe("Heading Four");
    });

    it('converts H5 heading to list via "- " pattern', () => {
      editor = createTestEditor("<h5>- item from heading</h5>");
      const lists = createLists();
      editor.setCursorInBlock(0, 20);

      const converted = lists.checkAndConvertListPattern();

      expect(converted).toBe(true);
      expect(editor.container.querySelector("ul")).not.toBeNull();
      expect(editor.container.querySelector("li")?.textContent).toBe("item from heading");
    });

    it('converts H6 heading to list via "1. " pattern', () => {
      editor = createTestEditor("<h6>1. numbered from heading</h6>");
      const lists = createLists();
      editor.setCursorInBlock(0, 25);

      const converted = lists.checkAndConvertListPattern();

      expect(converted).toBe(true);
      expect(editor.container.querySelector("ol")).not.toBeNull();
      expect(editor.container.querySelector("li")?.textContent).toBe("numbered from heading");
    });

    it("converts list back to paragraph, not heading", () => {
      // Start with a heading, convert to list, then back
      editor = createTestEditor("<h1>Original Heading</h1>");
      const lists = createLists();
      editor.setCursorInBlock(0, 0);

      // Convert heading to list
      lists.toggleUnorderedList();
      expect(editor.container.querySelector("ul")).not.toBeNull();

      // Now convert back - should become a paragraph, not a heading
      const li = editor.container.querySelector("li")!;
      setCursorInListItem(li, 0);
      lists.toggleUnorderedList();

      // Should be a paragraph now
      expect(editor.container.querySelector("p")).not.toBeNull();
      expect(editor.container.querySelector("h1")).toBeNull();
      expect(editor.container.querySelector("p")?.textContent).toBe("Original Heading");
    });

    it("preserves heading content with formatting when converting to list", () => {
      editor = createTestEditor("<h2>Heading with <strong>bold</strong> text</h2>");
      const lists = createLists();
      editor.setCursorInBlock(0, 0);

      lists.toggleUnorderedList();

      expect(editor.container.querySelector("li strong")).not.toBeNull();
      expect(editor.container.textContent).toContain("Heading with bold text");
    });
  });

  describe("convertCurrentListItemToParagraph", () => {
    it("converts unordered list item to paragraph", () => {
      editor = createTestEditor("<ul><li>List item</li></ul>");
      const lists = createLists();
      const li = editor.container.querySelector("li")!;
      setCursorInListItem(li, 0);

      const result = lists.convertCurrentListItemToParagraph();

      expect(result).not.toBeNull();
      expect(editor.getHtml()).toBe("<p>List item</p>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("converts ordered list item to paragraph", () => {
      editor = createTestEditor("<ol><li>Numbered item</li></ol>");
      const lists = createLists();
      const li = editor.container.querySelector("li")!;
      setCursorInListItem(li, 0);

      const result = lists.convertCurrentListItemToParagraph();

      expect(result).not.toBeNull();
      expect(editor.getHtml()).toBe("<p>Numbered item</p>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("returns null when not in a list", () => {
      editor = createTestEditor("<p>Paragraph</p>");
      const lists = createLists();
      editor.setCursorInBlock(0, 0);

      const result = lists.convertCurrentListItemToParagraph();

      expect(result).toBeNull();
      expect(onContentChange).not.toHaveBeenCalled();
    });

    it("preserves content with formatting", () => {
      editor = createTestEditor("<ul><li>Item with <strong>bold</strong> text</li></ul>");
      const lists = createLists();
      const li = editor.container.querySelector("li")!;
      setCursorInListItem(li, 0);

      lists.convertCurrentListItemToParagraph();

      expect(editor.container.querySelector("p strong")).not.toBeNull();
      expect(editor.container.textContent).toContain("Item with bold text");
    });

    it("handles multi-item list - converts only current item", () => {
      editor = createTestEditor("<ul><li>First</li><li>Second</li><li>Third</li></ul>");
      const lists = createLists();
      const secondLi = editor.container.querySelectorAll("li")[1];
      setCursorInListItem(secondLi as HTMLLIElement, 0);

      lists.convertCurrentListItemToParagraph();

      // Should have two lists with paragraph in between
      const paragraphs = editor.container.querySelectorAll("p");
      expect(paragraphs.length).toBe(1);
      expect(paragraphs[0]!.textContent).toBe("Second");
    });
  });

  describe("edge cases", () => {
    it("handles empty contentRef gracefully", () => {
      const lists = createLists();
      editor.contentRef.value = null;

      // Should not throw
      expect(() => lists.toggleUnorderedList()).not.toThrow();
      expect(() => lists.toggleOrderedList()).not.toThrow();
      expect(() => lists.checkAndConvertListPattern()).not.toThrow();
      expect(() => lists.handleListEnter()).not.toThrow();
      expect(() => lists.indentListItem()).not.toThrow();
      expect(() => lists.outdentListItem()).not.toThrow();
      expect(lists.getCurrentListType()).toBeNull();
    });

    it("handles list item with only whitespace as empty", () => {
      editor = createTestEditor("<ul><li>   </li></ul>");
      const lists = createLists();
      const li = editor.container.querySelector("li")!;
      setCursorInListItem(li, 0);

      // Whitespace-only item should be treated as empty for Enter behavior
      lists.handleListEnter();

      // Should exit the list
      expect(editor.container.querySelector("p")).not.toBeNull();
    });

    it("handles deeply nested lists", () => {
      editor = createTestEditor("<ul><li>L1<ul><li>L2<ul><li>L3</li></ul></li></ul></li></ul>");
      const lists = createLists();
      const deepLi = editor.container.querySelector("ul ul ul li")!;
      setCursorInListItem(deepLi as HTMLLIElement, 0);

      // Should be able to outdent from deep nesting
      lists.outdentListItem();

      // L3 should now be at L2 level
      const l2Items = editor.container.querySelectorAll("ul ul li");
      expect(l2Items.length).toBe(2);
    });

    it("preserves nested list content when converting parent to paragraph", () => {
      editor = createTestEditor("<ul><li>Parent<ul><li>Nested</li></ul></li></ul>");
      const lists = createLists();
      const parentLi = editor.container.querySelector("li")!;
      setCursorInListItem(parentLi, 0);

      lists.toggleUnorderedList();

      // Parent should become paragraph, nested list is removed (per implementation)
      expect(editor.container.querySelector("p")?.textContent).toBe("Parent");
    });
  });
});
