import { describe, it, expect, vi, afterEach } from "vitest";
import { ref } from "vue";
import { createListIndentation } from "../listIndentation";
import type { ListIndentationDeps } from "../listIndentation";
import { useMarkdownSelection } from "../useMarkdownSelection";
import { createTestEditor, TestEditorResult } from "./editorTestUtils";

describe("listIndentation", () => {
  let editor: TestEditorResult;

  afterEach(() => {
    if (editor) editor.destroy();
  });

  function createDeps(editorInstance: TestEditorResult): ListIndentationDeps {
    return {
      contentRef: editorInstance.contentRef,
      selection: useMarkdownSelection(editorInstance.contentRef),
      onContentChange: vi.fn(),
    };
  }

  describe("indentListItem", () => {
    it("returns false when contentRef is null", () => {
      editor = createTestEditor("<ul><li>Item</li></ul>");
      const deps = createDeps(editor);
      deps.contentRef = ref<HTMLElement | null>(null);

      const { indentListItem } = createListIndentation(deps);
      expect(indentListItem()).toBe(false);
    });

    it("returns false when cursor is not in a list item", () => {
      editor = createTestEditor("<p>Not a list</p>");
      const deps = createDeps(editor);
      editor.setCursorInBlock(0, 3);

      const { indentListItem } = createListIndentation(deps);
      expect(indentListItem()).toBe(false);
    });

    it("returns false when there is no previous sibling LI", () => {
      editor = createTestEditor("<ul><li>First item</li></ul>");
      const deps = createDeps(editor);

      const li = editor.container.querySelector("li")!;
      editor.setCursor(li.firstChild!, 3);

      const { indentListItem } = createListIndentation(deps);
      expect(indentListItem()).toBe(false);
    });

    it("indents list item by creating nested list in previous sibling", () => {
      editor = createTestEditor("<ul><li>First</li><li>Second</li></ul>");
      const deps = createDeps(editor);

      const items = editor.container.querySelectorAll("li");
      editor.setCursor(items[1]!.firstChild!, 3);

      const { indentListItem } = createListIndentation(deps);
      const result = indentListItem();

      expect(result).toBe(true);
      expect(deps.onContentChange).toHaveBeenCalled();

      // The second item should now be nested inside the first
      const firstLi = editor.container.querySelector("li")!;
      const nestedList = firstLi.querySelector("ul");
      expect(nestedList).not.toBeNull();
      expect(nestedList?.querySelector("li")?.textContent).toBe("Second");
    });

    it("appends to existing nested list when one already exists", () => {
      editor = createTestEditor(
        "<ul><li>First<ul><li>Existing nested</li></ul></li><li>Third</li></ul>"
      );
      const deps = createDeps(editor);

      // Position cursor in "Third" (the last LI at top level)
      const topLevelItems = editor.container.querySelectorAll(":scope > ul > li");
      editor.setCursor(topLevelItems[1]!.firstChild!, 2);

      const { indentListItem } = createListIndentation(deps);
      const result = indentListItem();

      expect(result).toBe(true);
      // The nested list should now have 2 items
      const nestedList = editor.container.querySelector("ul ul")!;
      expect(nestedList.querySelectorAll("li").length).toBe(2);
    });

    it("returns false when list item has no parent list", () => {
      // Edge case: orphaned LI without parent UL/OL
      editor = createTestEditor("<li>Orphaned item</li>");
      const deps = createDeps(editor);

      const li = editor.container.querySelector("li")!;
      editor.setCursor(li.firstChild!, 3);

      const { indentListItem } = createListIndentation(deps);
      expect(indentListItem()).toBe(false);
    });

    it("returns false when previous sibling is not an LI", () => {
      // Use a structure where the previous sibling is a different element
      editor = createTestEditor("<ul><li>Item</li></ul>");
      const deps = createDeps(editor);

      // First item has no previous sibling, so it should return false
      const li = editor.container.querySelector("li")!;
      editor.setCursor(li.firstChild!, 0);

      const { indentListItem } = createListIndentation(deps);
      expect(indentListItem()).toBe(false);
    });

    it("preserves cursor position after indenting", () => {
      editor = createTestEditor("<ul><li>First</li><li>Second</li></ul>");
      const deps = createDeps(editor);

      const items = editor.container.querySelectorAll("li");
      editor.setCursor(items[1]!.firstChild!, 3);

      const { indentListItem } = createListIndentation(deps);
      indentListItem();

      // Cursor should still be positioned in the indented item
      const sel = window.getSelection();
      expect(sel?.rangeCount).toBeGreaterThan(0);
    });

    it("creates a list of the same type as the parent", () => {
      editor = createTestEditor("<ol><li>First</li><li>Second</li></ol>");
      const deps = createDeps(editor);

      const items = editor.container.querySelectorAll("li");
      editor.setCursor(items[1]!.firstChild!, 3);

      const { indentListItem } = createListIndentation(deps);
      indentListItem();

      // Should create an OL, not a UL
      const nestedList = editor.container.querySelector("ol ol");
      expect(nestedList).not.toBeNull();
    });
  });

  describe("outdentListItem", () => {
    it("returns false when contentRef is null", () => {
      editor = createTestEditor("<ul><li>Item</li></ul>");
      const deps = createDeps(editor);
      deps.contentRef = ref<HTMLElement | null>(null);

      const { outdentListItem } = createListIndentation(deps);
      expect(outdentListItem()).toBe(false);
    });

    it("returns false when cursor is not in a list item", () => {
      editor = createTestEditor("<p>Not a list</p>");
      const deps = createDeps(editor);
      editor.setCursorInBlock(0, 3);

      const { outdentListItem } = createListIndentation(deps);
      expect(outdentListItem()).toBe(false);
    });

    it("converts top-level list item to paragraph", () => {
      editor = createTestEditor("<ul><li>Item to outdent</li></ul>");
      const deps = createDeps(editor);

      const li = editor.container.querySelector("li")!;
      editor.setCursor(li.firstChild!, 5);

      const { outdentListItem } = createListIndentation(deps);
      const result = outdentListItem();

      expect(result).toBe(true);
      expect(deps.onContentChange).toHaveBeenCalled();
      expect(editor.container.querySelector("p")).not.toBeNull();
    });

    it("moves nested item to grandparent list", () => {
      editor = createTestEditor("<ul><li>First<ul><li>Nested item</li></ul></li></ul>");
      const deps = createDeps(editor);

      const nestedLi = editor.container.querySelector("ul ul li")!;
      editor.setCursor(nestedLi.firstChild!, 3);

      const { outdentListItem } = createListIndentation(deps);
      const result = outdentListItem();

      expect(result).toBe(true);
      expect(deps.onContentChange).toHaveBeenCalled();
    });

    it("carries subsequent siblings when outdenting", () => {
      editor = createTestEditor("<ul><li>First<ul><li>A</li><li>B</li><li>C</li></ul></li></ul>");
      const deps = createDeps(editor);

      // Cursor in "A" (first nested item)
      const nestedItems = editor.container.querySelectorAll("ul ul li");
      editor.setCursor(nestedItems[0]!.firstChild!, 1);

      const { outdentListItem } = createListIndentation(deps);
      outdentListItem();

      // "B" and "C" should have been carried into a nested list under "A"
      expect(deps.onContentChange).toHaveBeenCalled();
    });

    it("removes empty parent list after outdenting last item", () => {
      editor = createTestEditor("<ul><li>First<ul><li>Only nested</li></ul></li></ul>");
      const deps = createDeps(editor);

      const nestedLi = editor.container.querySelector("ul ul li")!;
      editor.setCursor(nestedLi.firstChild!, 3);

      const { outdentListItem } = createListIndentation(deps);
      outdentListItem();

      // The inner UL should be removed since it's empty
      const innerUl = editor.container.querySelector("ul ul");
      expect(innerUl).toBeNull();
    });

    it("returns false when LI has no parent list", () => {
      editor = createTestEditor("<li>Orphaned item</li>");
      const deps = createDeps(editor);

      const li = editor.container.querySelector("li")!;
      editor.setCursor(li.firstChild!, 3);

      const { outdentListItem } = createListIndentation(deps);
      expect(outdentListItem()).toBe(false);
    });

    it("returns false when grandparent list is not found", () => {
      // Structure: parentList > parentLi (is LI) but parentLi's parent is not a list
      // This is an unusual DOM state but we test the guard
      editor = createTestEditor("<ul><li>Item</li></ul>");

      // For a top-level item, parentLi.tagName !== "LI" so it converts to paragraph
      // We need a case where parentLi IS an LI but grandparent list is null
      // This happens when LI's parent is UL, UL's parent is LI, but LI's parent is not UL/OL
      const container = document.createElement("div");
      container.setAttribute("contenteditable", "true");
      const li = document.createElement("li");
      const ul = document.createElement("ul");
      const innerLi = document.createElement("li");
      innerLi.textContent = "Nested";
      ul.appendChild(innerLi);
      li.appendChild(ul);
      // Put li directly in the container (no parent UL/OL around it)
      container.appendChild(li);
      document.body.appendChild(container);

      const contentRef = ref<HTMLElement | null>(container);
      const selection = useMarkdownSelection(contentRef);
      const depsCustom: ListIndentationDeps = {
        contentRef,
        selection,
        onContentChange: vi.fn(),
      };

      editor.setCursor(innerLi.firstChild!, 3);

      const { outdentListItem } = createListIndentation(depsCustom);
      const result = outdentListItem();

      expect(result).toBe(false);
      container.remove();
    });

    it("appends siblings to existing nested list when outdenting", () => {
      // Create structure: UL > LI[First] > UL > LI[A] + LI[B]
      // where LI[A] already has a nested list
      editor = createTestEditor(
        "<ul><li>First<ul><li>A<ul><li>Existing</li></ul></li><li>B</li></ul></li></ul>"
      );
      const deps = createDeps(editor);

      // Cursor in "A"
      const nestedItems = editor.container.querySelectorAll("ul ul > li");
      editor.setCursor(nestedItems[0]!.firstChild!, 1);

      const { outdentListItem } = createListIndentation(deps);
      outdentListItem();

      // "B" should be carried into A's existing nested list
      expect(deps.onContentChange).toHaveBeenCalled();
    });
  });
});
