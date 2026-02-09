import { describe, it, expect, afterEach, vi } from "vitest";
import { useMarkdownEditor } from "../useMarkdownEditor";
import { createTestEditor, TestEditorResult } from "./editorTestUtils";

describe("useMarkdownEditor", () => {
  let editor: TestEditorResult;
  let onEmitValue: ReturnType<typeof vi.fn>;

  afterEach(() => {
    if (editor) {
      editor.destroy();
    }
  });

  /**
   * Create markdown editor composable with test editor
   */
  function createEditor(initialHtml: string, initialValue = "") {
    editor = createTestEditor(initialHtml);
    onEmitValue = vi.fn();
    return useMarkdownEditor({
      contentRef: editor.contentRef,
      initialValue,
      onEmitValue: onEmitValue as unknown as (markdown: string) => void,
    });
  }

  describe("heading hotkeys with list handling", () => {
    describe("Ctrl+1-6 hotkeys convert list items to headings", () => {
      it("Ctrl+1 converts bullet list item to H1", () => {
        const markdownEditor = createEditor("<ul><li>List item</li></ul>");
        // Set cursor in list item
        const li = editor.container.querySelector("li");
        if (li?.firstChild) {
          editor.setCursor(li.firstChild!, 5);
        }

        // Simulate Ctrl+1 by calling the onKeyDown handler
        const event = new KeyboardEvent("keydown", {
          key: "1",
          code: "Digit1",
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        });
        markdownEditor.onKeyDown(event);

        // Should convert to H1
        expect(editor.getHtml()).toBe("<h1>List item</h1>");
      });

      it("Ctrl+2 converts numbered list item to H2", () => {
        const markdownEditor = createEditor("<ol><li>Numbered item</li></ol>");
        // Set cursor in list item
        const li = editor.container.querySelector("li");
        if (li?.firstChild) {
          editor.setCursor(li.firstChild!, 5);
        }

        // Simulate Ctrl+2
        const event = new KeyboardEvent("keydown", {
          key: "2",
          code: "Digit2",
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        });
        markdownEditor.onKeyDown(event);

        // Should convert to H2
        expect(editor.getHtml()).toBe("<h2>Numbered item</h2>");
      });

      it("Ctrl+3 converts list item to H3", () => {
        const markdownEditor = createEditor("<ul><li>Test item</li></ul>");
        const li = editor.container.querySelector("li");
        if (li?.firstChild) {
          editor.setCursor(li.firstChild!, 0);
        }

        const event = new KeyboardEvent("keydown", {
          key: "3",
          code: "Digit3",
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        });
        markdownEditor.onKeyDown(event);

        expect(editor.getHtml()).toBe("<h3>Test item</h3>");
      });

      it("Ctrl+4 converts list item to H4", () => {
        const markdownEditor = createEditor("<ul><li>Test item</li></ul>");
        const li = editor.container.querySelector("li");
        if (li?.firstChild) {
          editor.setCursor(li.firstChild!, 0);
        }

        const event = new KeyboardEvent("keydown", {
          key: "4",
          code: "Digit4",
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        });
        markdownEditor.onKeyDown(event);

        expect(editor.getHtml()).toBe("<h4>Test item</h4>");
      });

      it("Ctrl+5 converts list item to H5", () => {
        const markdownEditor = createEditor("<ul><li>Test item</li></ul>");
        const li = editor.container.querySelector("li");
        if (li?.firstChild) {
          editor.setCursor(li.firstChild!, 0);
        }

        const event = new KeyboardEvent("keydown", {
          key: "5",
          code: "Digit5",
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        });
        markdownEditor.onKeyDown(event);

        expect(editor.getHtml()).toBe("<h5>Test item</h5>");
      });

      it("Ctrl+6 converts list item to H6", () => {
        const markdownEditor = createEditor("<ul><li>Test item</li></ul>");
        const li = editor.container.querySelector("li");
        if (li?.firstChild) {
          editor.setCursor(li.firstChild!, 0);
        }

        const event = new KeyboardEvent("keydown", {
          key: "6",
          code: "Digit6",
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        });
        markdownEditor.onKeyDown(event);

        expect(editor.getHtml()).toBe("<h6>Test item</h6>");
      });
    });

    describe("Ctrl+0 converts list item to paragraph", () => {
      it("Ctrl+0 converts bullet list item to paragraph", () => {
        const markdownEditor = createEditor("<ul><li>List item</li></ul>");
        const li = editor.container.querySelector("li");
        if (li?.firstChild) {
          editor.setCursor(li.firstChild!, 0);
        }

        const event = new KeyboardEvent("keydown", {
          key: "0",
          code: "Digit0",
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        });
        markdownEditor.onKeyDown(event);

        // Should convert to paragraph
        expect(editor.getHtml()).toBe("<p>List item</p>");
      });

      it("Ctrl+0 converts numbered list item to paragraph", () => {
        const markdownEditor = createEditor("<ol><li>Numbered item</li></ol>");
        const li = editor.container.querySelector("li");
        if (li?.firstChild) {
          editor.setCursor(li.firstChild!, 0);
        }

        const event = new KeyboardEvent("keydown", {
          key: "0",
          code: "Digit0",
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        });
        markdownEditor.onKeyDown(event);

        expect(editor.getHtml()).toBe("<p>Numbered item</p>");
      });
    });

    describe("Ctrl+> and Ctrl+< work on list items", () => {
      it("Ctrl+> (increase heading) converts list item to H6", () => {
        const markdownEditor = createEditor("<ul><li>List item</li></ul>");
        const li = editor.container.querySelector("li");
        if (li?.firstChild) {
          editor.setCursor(li.firstChild!, 0);
        }

        // Ctrl+Shift+. is typically how Ctrl+> is triggered
        const event = new KeyboardEvent("keydown", {
          key: ">",
          code: "Period",
          ctrlKey: true,
          shiftKey: true,
          bubbles: true,
          cancelable: true,
        });
        markdownEditor.onKeyDown(event);

        // List item -> paragraph -> H6
        expect(editor.getHtml()).toBe("<h6>List item</h6>");
      });

      it("Ctrl+< (decrease heading) converts list item to paragraph", () => {
        const markdownEditor = createEditor("<ul><li>List item</li></ul>");
        const li = editor.container.querySelector("li");
        if (li?.firstChild) {
          editor.setCursor(li.firstChild!, 0);
        }

        // Ctrl+Shift+, is typically how Ctrl+< is triggered
        const event = new KeyboardEvent("keydown", {
          key: "<",
          code: "Comma",
          ctrlKey: true,
          shiftKey: true,
          bubbles: true,
          cancelable: true,
        });
        markdownEditor.onKeyDown(event);

        // List item -> paragraph (lowest level)
        expect(editor.getHtml()).toBe("<p>List item</p>");
      });
    });

    describe("heading hotkeys still work on paragraphs", () => {
      it("Ctrl+1 still converts paragraph to H1", () => {
        const markdownEditor = createEditor("<p>Hello world</p>");
        editor.setCursorInBlock(0, 5);

        const event = new KeyboardEvent("keydown", {
          key: "1",
          code: "Digit1",
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        });
        markdownEditor.onKeyDown(event);

        expect(editor.getHtml()).toBe("<h1>Hello world</h1>");
      });

      it("Ctrl+0 converts heading to paragraph", () => {
        const markdownEditor = createEditor("<h2>Hello world</h2>");
        editor.setCursorInBlock(0, 0);

        const event = new KeyboardEvent("keydown", {
          key: "0",
          code: "Digit0",
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        });
        markdownEditor.onKeyDown(event);

        expect(editor.getHtml()).toBe("<p>Hello world</p>");
      });

      it("Ctrl+> increases heading level on paragraph", () => {
        const markdownEditor = createEditor("<p>Hello world</p>");
        editor.setCursorInBlock(0, 0);

        const event = new KeyboardEvent("keydown", {
          key: ">",
          code: "Period",
          ctrlKey: true,
          shiftKey: true,
          bubbles: true,
          cancelable: true,
        });
        markdownEditor.onKeyDown(event);

        expect(editor.getHtml()).toBe("<h6>Hello world</h6>");
      });

      it("Ctrl+< decreases heading level on H1", () => {
        const markdownEditor = createEditor("<h1>Hello world</h1>");
        editor.setCursorInBlock(0, 0);

        const event = new KeyboardEvent("keydown", {
          key: "<",
          code: "Comma",
          ctrlKey: true,
          shiftKey: true,
          bubbles: true,
          cancelable: true,
        });
        markdownEditor.onKeyDown(event);

        expect(editor.getHtml()).toBe("<h2>Hello world</h2>");
      });
    });

    describe("multiple list items - only current item is affected", () => {
      it("converts only the current list item when multiple items exist", () => {
        const markdownEditor = createEditor("<ul><li>First</li><li>Second</li><li>Third</li></ul>");
        // Set cursor in second list item
        const items = editor.container.querySelectorAll("li");
        if (items[1]?.firstChild) {
          editor.setCursor(items[1].firstChild!, 0);
        }

        const event = new KeyboardEvent("keydown", {
          key: "2",
          code: "Digit2",
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        });
        markdownEditor.onKeyDown(event);

        // Should split the list and convert only second item
        const html = editor.getHtml();
        expect(html).toContain("<ul><li>First</li></ul>");
        expect(html).toContain("<h2>Second</h2>");
        expect(html).toContain("<ul><li>Third</li></ul>");
      });
    });
  });
});
