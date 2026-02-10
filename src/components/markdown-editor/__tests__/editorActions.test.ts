import { describe, it, expect, vi, afterEach } from "vitest";
import { createEditorActions, EditorActionDeps } from "../editorActions";
import { createTestEditor, TestEditorResult } from "./editorTestUtils";

describe("editorActions", () => {
  let editor: TestEditorResult;

  afterEach(() => {
    if (editor) editor.destroy();
  });

  function createDeps(testEditor: TestEditorResult): EditorActionDeps {
    return {
      contentRef: testEditor.contentRef,
      debouncedSyncFromHtml: vi.fn(),
    };
  }

  describe("insertTabCharacter", () => {
    it("inserts a tab character at cursor position", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const deps = createDeps(editor);
      const { insertTabCharacter } = createEditorActions(deps);

      editor.setCursorInBlock(0, 5);
      insertTabCharacter();

      expect(editor.container.textContent).toContain("\t");
      expect(deps.debouncedSyncFromHtml).toHaveBeenCalled();
    });

    it("does nothing when contentRef is null", () => {
      editor = createTestEditor("<p>Hello</p>");
      const deps = createDeps(editor);
      deps.contentRef.value = null;

      const { insertTabCharacter } = createEditorActions(deps);
      // Should not throw
      insertTabCharacter();
      expect(deps.debouncedSyncFromHtml).not.toHaveBeenCalled();
    });

    it("does nothing when no selection exists", () => {
      editor = createTestEditor("<p>Hello</p>");
      const deps = createDeps(editor);
      const { insertTabCharacter } = createEditorActions(deps);

      window.getSelection()?.removeAllRanges();
      insertTabCharacter();
      expect(deps.debouncedSyncFromHtml).not.toHaveBeenCalled();
    });

    it("replaces selected text with tab", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const deps = createDeps(editor);
      const { insertTabCharacter } = createEditorActions(deps);

      // Select "world"
      editor.selectInBlock(0, 6, 11);
      insertTabCharacter();

      expect(editor.container.textContent).toContain("\t");
      expect(deps.debouncedSyncFromHtml).toHaveBeenCalled();
    });
  });

  describe("insertHorizontalRule", () => {
    it("inserts hr after current paragraph", () => {
      editor = createTestEditor("<p>Hello</p>");
      const deps = createDeps(editor);
      const { insertHorizontalRule } = createEditorActions(deps);

      editor.setCursorInBlock(0, 3);
      insertHorizontalRule();

      expect(editor.getHtml()).toContain("<hr>");
      expect(deps.debouncedSyncFromHtml).toHaveBeenCalled();
    });

    it("does nothing when contentRef is null", () => {
      editor = createTestEditor("<p>Hello</p>");
      const deps = createDeps(editor);
      deps.contentRef.value = null;

      const { insertHorizontalRule } = createEditorActions(deps);
      insertHorizontalRule();
      expect(deps.debouncedSyncFromHtml).not.toHaveBeenCalled();
    });

    it("does nothing when no selection exists", () => {
      editor = createTestEditor("<p>Hello</p>");
      const deps = createDeps(editor);
      const { insertHorizontalRule } = createEditorActions(deps);

      window.getSelection()?.removeAllRanges();
      insertHorizontalRule();
      expect(deps.debouncedSyncFromHtml).not.toHaveBeenCalled();
    });

    it("inserts hr after LI, using parent UL as insertion point", () => {
      editor = createTestEditor("<ul><li>Item</li></ul>");
      const deps = createDeps(editor);
      const { insertHorizontalRule } = createEditorActions(deps);

      const li = editor.container.querySelector("li")!;
      if (li.firstChild) {
        editor.setCursor(li.firstChild, 2);
      }

      insertHorizontalRule();

      const html = editor.getHtml();
      expect(html).toContain("<hr>");
      expect(deps.debouncedSyncFromHtml).toHaveBeenCalled();
    });

    it("inserts hr after heading", () => {
      editor = createTestEditor("<h2>Heading</h2>");
      const deps = createDeps(editor);
      const { insertHorizontalRule } = createEditorActions(deps);

      editor.setCursorInBlock(0, 3);
      insertHorizontalRule();

      expect(editor.getHtml()).toContain("<hr>");
    });

    it("inserts hr after blockquote", () => {
      editor = createTestEditor("<blockquote>Quote</blockquote>");
      const deps = createDeps(editor);
      const { insertHorizontalRule } = createEditorActions(deps);

      const bq = editor.container.querySelector("blockquote")!;
      if (bq.firstChild) {
        editor.setCursor(bq.firstChild, 2);
      }

      insertHorizontalRule();

      expect(editor.getHtml()).toContain("<hr>");
    });

    it("inserts hr after code block wrapper", () => {
      editor = createTestEditor(
        '<div data-code-block-id="cb-1" contenteditable="false"><span>code text</span></div>'
      );
      const deps = createDeps(editor);
      const { insertHorizontalRule } = createEditorActions(deps);

      const span = editor.container.querySelector("span")!;
      if (span.firstChild) {
        editor.setCursor(span.firstChild, 2);
      }

      insertHorizontalRule();

      expect(editor.getHtml()).toContain("<hr>");
    });

    it("handles empty editor (no block element)", () => {
      editor = createTestEditor("");
      const deps = createDeps(editor);
      const { insertHorizontalRule } = createEditorActions(deps);

      // Place cursor at root level
      const range = document.createRange();
      range.selectNodeContents(editor.container);
      range.collapse(true);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);

      insertHorizontalRule();

      expect(editor.getHtml()).toContain("<hr>");
    });

    it("inserts hr after LI without parent list (line 86 falsy branch)", () => {
      // Create an LI inside a div (not inside UL/OL) so closest("ul, ol") returns null
      editor = createTestEditor("<div><li>Orphan item</li></div>");
      const deps = createDeps(editor);
      const { insertHorizontalRule } = createEditorActions(deps);

      const li = editor.container.querySelector("li")!;
      if (li.firstChild) {
        editor.setCursor(li.firstChild, 3);
      }

      insertHorizontalRule();

      expect(editor.getHtml()).toContain("<hr>");
      expect(deps.debouncedSyncFromHtml).toHaveBeenCalled();
    });
  });
});
