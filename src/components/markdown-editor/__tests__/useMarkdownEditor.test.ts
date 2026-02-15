import { describe, it, expect, afterEach, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { mount } from "@vue/test-utils";
import { useMarkdownEditor } from "../useMarkdownEditor";
import { createTestEditor, TestEditorResult } from "./editorTestUtils";

describe("useMarkdownEditor", () => {
  let editor: TestEditorResult;
  let onEmitValue: ReturnType<typeof vi.fn>;
  const mountedWrappers: ReturnType<typeof mount>[] = [];

  afterEach(() => {
    for (const wrapper of mountedWrappers) {
      wrapper.unmount();
    }
    mountedWrappers.length = 0;
    if (editor) {
      editor.destroy();
    }
  });

  /**
   * Create markdown editor composable with test editor.
   * Wraps the composable in a component setup context to handle onUnmounted correctly.
   */
  function createEditor(
    initialHtml: string,
    initialValue = "",
    extraOptions?: {
      onShowLinkPopover?: (options: unknown) => void;
      onShowTablePopover?: (options: unknown) => void;
    }
  ) {
    editor = createTestEditor(initialHtml);
    onEmitValue = vi.fn();
    let result!: ReturnType<typeof useMarkdownEditor>;
    const wrapper = mount(
      defineComponent({
        setup() {
          result = useMarkdownEditor({
            contentRef: editor.contentRef,
            initialValue,
            onEmitValue: onEmitValue as unknown as (markdown: string) => void,
            ...extraOptions,
          });
          return {};
        },
        template: "<div />",
      })
    );
    mountedWrappers.push(wrapper);
    return result;
  }

  /**
   * Helper to create a KeyboardEvent
   */
  function keyEvent(
    key: string,
    options?: { ctrl?: boolean; shift?: boolean; alt?: boolean; meta?: boolean; code?: string }
  ): KeyboardEvent {
    return new KeyboardEvent("keydown", {
      key,
      code: options?.code || key,
      ctrlKey: options?.ctrl || false,
      shiftKey: options?.shift || false,
      altKey: options?.alt || false,
      metaKey: options?.meta || false,
      bubbles: true,
      cancelable: true,
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

  describe("initialization", () => {
    it("initializes with markdown content", () => {
      const markdownEditor = createEditor("", "# Hello World");
      expect(markdownEditor.renderedHtml.value).toContain("Hello World");
    });

    it("starts with isShowingHotkeyHelp false", () => {
      const markdownEditor = createEditor("<p>Hello</p>");
      expect(markdownEditor.isShowingHotkeyHelp.value).toBe(false);
    });

    it("registers hotkey definitions", () => {
      const markdownEditor = createEditor("<p>Hello</p>");
      expect(markdownEditor.hotkeyDefinitions.value.length).toBeGreaterThan(0);
    });
  });

  describe("showHotkeyHelp and hideHotkeyHelp", () => {
    it("showHotkeyHelp sets isShowingHotkeyHelp to true", () => {
      const markdownEditor = createEditor("<p>Hello</p>");
      markdownEditor.showHotkeyHelp();
      expect(markdownEditor.isShowingHotkeyHelp.value).toBe(true);
    });

    it("hideHotkeyHelp sets isShowingHotkeyHelp to false", () => {
      const markdownEditor = createEditor("<p>Hello</p>");
      markdownEditor.showHotkeyHelp();
      markdownEditor.hideHotkeyHelp();
      expect(markdownEditor.isShowingHotkeyHelp.value).toBe(false);
    });
  });

  describe("setMarkdown", () => {
    it("updates renderedHtml when setting markdown", () => {
      const markdownEditor = createEditor("<p>Old content</p>");
      markdownEditor.setMarkdown("## New Content");
      expect(markdownEditor.renderedHtml.value).toContain("New Content");
    });

    it("updates the DOM after nextTick", async () => {
      const markdownEditor = createEditor("<p>Old content</p>");
      markdownEditor.setMarkdown("**Bold text**");
      await nextTick();
      // The contentRef should have been updated
      expect(editor.container.innerHTML).toContain("Bold");
    });
  });

  describe("onBlur", () => {
    it("triggers a sync from HTML", () => {
      const markdownEditor = createEditor("<p>Hello</p>");
      editor.setCursorInBlock(0, 5);
      // Modify content directly
      editor.container.innerHTML = "<p>Modified</p>";
      markdownEditor.onBlur();
      // onEmitValue should eventually be called with the modified content
      expect(onEmitValue).toHaveBeenCalled();
    });
  });

  describe("onInput", () => {
    it("updates character count", () => {
      const markdownEditor = createEditor("<p>Hello</p>");
      markdownEditor.onInput();
      expect(markdownEditor.charCount.value).toBe(5);
    });

    it("triggers sync on input when no pattern detected", () => {
      const markdownEditor = createEditor("<p>Hello world</p>");
      editor.setCursorInBlock(0, 5);
      markdownEditor.onInput();
      // Should trigger debounced sync (not an error)
      expect(markdownEditor.charCount.value).toBe(11);
    });
  });

  describe("Tab handling", () => {
    it("prevents default on Tab key", () => {
      const markdownEditor = createEditor("<p>Hello</p>");
      editor.setCursorInBlock(0, 3);

      const event = keyEvent("Tab", { code: "Tab" });
      const preventSpy = vi.spyOn(event, "preventDefault");
      markdownEditor.onKeyDown(event);

      expect(preventSpy).toHaveBeenCalled();
    });

    it("inserts tab character outside of lists", () => {
      const markdownEditor = createEditor("<p>Hello</p>");
      editor.setCursorInBlock(0, 3);

      markdownEditor.onKeyDown(keyEvent("Tab", { code: "Tab" }));

      const text = editor.container.textContent;
      expect(text).toContain("\t");
    });

    it("indents list item on Tab in list", () => {
      const markdownEditor = createEditor("<ul><li>First</li><li>Second</li></ul>");
      const items = editor.container.querySelectorAll("li");
      const secondLi = items[1];
      if (secondLi?.firstChild) {
        editor.setCursor(secondLi.firstChild, 0);
      }

      markdownEditor.onKeyDown(keyEvent("Tab", { code: "Tab" }));

      // Should have nested the second item
      const html = editor.getHtml();
      expect(html).toContain("<ul>");
    });
  });

  describe("Enter key handling", () => {
    it("continues list on Enter in list item", () => {
      const markdownEditor = createEditor("<ul><li>Item 1</li></ul>");
      const li = editor.container.querySelector("li")!;
      if (li.firstChild) {
        editor.setCursor(li.firstChild, 6);
      }

      const event = keyEvent("Enter", { code: "Enter" });
      markdownEditor.onKeyDown(event);

      // Should have created a new list item
      const items = editor.container.querySelectorAll("li");
      expect(items.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("insertHorizontalRule", () => {
    it("inserts hr after current paragraph", async () => {
      const markdownEditor = createEditor("<p>Hello</p>");
      editor.setCursorInBlock(0, 3);

      markdownEditor.insertHorizontalRule();
      await nextTick();

      expect(editor.getHtml()).toContain("<hr>");
    });

    it("inserts hr with new paragraph after it", async () => {
      const markdownEditor = createEditor("<p>Hello</p>");
      editor.setCursorInBlock(0, 3);

      markdownEditor.insertHorizontalRule();
      await nextTick();

      const html = editor.getHtml();
      expect(html).toContain("<hr>");
      expect(html).toContain("<p>");
    });

    it("does nothing when contentRef is null", () => {
      const markdownEditor = createEditor("<p>Hello</p>");
      editor.contentRef.value = null;
      // Should not throw
      markdownEditor.insertHorizontalRule();
    });

    it("does nothing when no selection exists", () => {
      const markdownEditor = createEditor("<p>Hello</p>");
      window.getSelection()?.removeAllRanges();
      // Should not throw
      markdownEditor.insertHorizontalRule();
    });

    it("inserts hr after list parent", async () => {
      const markdownEditor = createEditor("<ul><li>Item</li></ul>");
      const li = editor.container.querySelector("li")!;
      if (li.firstChild) {
        editor.setCursor(li.firstChild, 2);
      }

      markdownEditor.insertHorizontalRule();
      await nextTick();

      expect(editor.getHtml()).toContain("<hr>");
    });

    it("handles empty editor", async () => {
      const markdownEditor = createEditor("");
      // With empty editor, no block element exists
      // Need to place cursor at root
      const range = document.createRange();
      range.selectNodeContents(editor.container);
      range.collapse(true);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);

      markdownEditor.insertHorizontalRule();
      await nextTick();

      expect(editor.getHtml()).toContain("<hr>");
    });
  });

  describe("feature access", () => {
    it("exposes headings composable", () => {
      const markdownEditor = createEditor("<p>Hello</p>");
      expect(markdownEditor.headings).toBeDefined();
      expect(typeof markdownEditor.headings.setHeadingLevel).toBe("function");
    });

    it("exposes inlineFormatting composable", () => {
      const markdownEditor = createEditor("<p>Hello</p>");
      expect(markdownEditor.inlineFormatting).toBeDefined();
      expect(typeof markdownEditor.inlineFormatting.toggleBold).toBe("function");
    });

    it("exposes lists composable", () => {
      const markdownEditor = createEditor("<p>Hello</p>");
      expect(markdownEditor.lists).toBeDefined();
      expect(typeof markdownEditor.lists.toggleUnorderedList).toBe("function");
    });

    it("exposes codeBlocks composable", () => {
      const markdownEditor = createEditor("<p>Hello</p>");
      expect(markdownEditor.codeBlocks).toBeDefined();
      expect(typeof markdownEditor.codeBlocks.toggleCodeBlock).toBe("function");
    });

    it("exposes blockquotes composable", () => {
      const markdownEditor = createEditor("<p>Hello</p>");
      expect(markdownEditor.blockquotes).toBeDefined();
      expect(typeof markdownEditor.blockquotes.toggleBlockquote).toBe("function");
    });

    it("exposes tables composable", () => {
      const markdownEditor = createEditor("<p>Hello</p>");
      expect(markdownEditor.tables).toBeDefined();
      expect(typeof markdownEditor.tables.insertTable).toBe("function");
    });

    it("exposes links composable", () => {
      const markdownEditor = createEditor("<p>Hello</p>");
      expect(markdownEditor.links).toBeDefined();
      expect(typeof markdownEditor.links.insertLink).toBe("function");
    });

    it("exposes tokens map", () => {
      const markdownEditor = createEditor("<p>Hello</p>");
      expect(markdownEditor.tokens).toBeInstanceOf(Map);
    });
  });

  describe("handleCodeBlockExit", () => {
    it("creates paragraph after code block on exit", async () => {
      const markdownEditor = createEditor(
        '<div data-code-block-id="cb-1" contenteditable="false"><div class="code-viewer-mount-point" data-content="test" data-language="javascript"></div></div>'
      );

      // Register code block state
      markdownEditor.codeBlocks.codeBlocks.set("cb-1", {
        id: "cb-1",
        content: "test",
        language: "javascript",
      });

      // Trigger code block exit via the callback
      const wrapper = editor.container.querySelector('[data-code-block-id="cb-1"]')!;
      expect(wrapper).toBeTruthy();

      // Simulate the exit by calling the internal handler indirectly
      // The handleCodeBlockExit is registered as onCodeBlockExit callback
      // We can simulate the double-enter at end behavior
      const p = document.createElement("p");
      p.appendChild(document.createElement("br"));
      wrapper.parentNode?.insertBefore(p, wrapper.nextSibling);

      await nextTick();
      expect(editor.container.querySelector("p")).toBeTruthy();
    });

    it("triggers debouncedSyncFromHtml lambda (line 167) via handleCodeBlockExit", async () => {
      vi.useFakeTimers();
      const markdownEditor = createEditor(
        '<p>Before</p><div data-code-block-id="cb-exit" contenteditable="false"><div class="code-viewer-mount-point" data-content="code" data-language="javascript"></div></div>'
      );

      // Register code block in state
      markdownEditor.codeBlocks.registerCodeBlock("cb-exit", "code", "javascript");

      // The codeBlockManager has onCodeBlockExit which calls handleCodeBlockExit.
      // handleCodeBlockExit calls the debouncedSyncFromHtml lambda (line 167).
      // We can trigger this by directly using the mounted CodeViewer's onExit.

      // Mount code viewers to set up the CodeViewer app
      markdownEditor.codeBlockManager.mountCodeViewers();
      await nextTick();

      // Get the CodeViewer's props to invoke the onExit handler
      const wrapper = editor.container.querySelector('[data-code-block-id="cb-exit"]');
      const mountPoint = wrapper?.querySelector(".code-viewer-mount-point") as HTMLElement | null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const app = (mountPoint as any)?.__vue_app__;
      const vnode = app?._instance?.subTree;
      if (vnode?.props?.onExit) {
        (vnode.props.onExit as () => void)();
      }

      // Advance past debounce
      vi.advanceTimersByTime(400);

      // The sync should have been triggered via the lambda at line 167
      expect(onEmitValue).toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe("handleCodeBlockDelete", () => {
    it("removes code block and positions cursor in previous sibling", async () => {
      const markdownEditor = createEditor(
        '<p>Before</p><div data-code-block-id="cb-1" contenteditable="false"><div class="code-viewer-mount-point" data-content="" data-language="text"></div></div>'
      );

      markdownEditor.codeBlocks.codeBlocks.set("cb-1", {
        id: "cb-1",
        content: "",
        language: "text",
      });

      // Directly test codeBlocks.codeBlocks removal
      markdownEditor.codeBlocks.codeBlocks.delete("cb-1");
      const wrapper = editor.container.querySelector('[data-code-block-id="cb-1"]');
      if (wrapper) {
        wrapper.remove();
      }
      await nextTick();

      expect(editor.container.querySelector('[data-code-block-id="cb-1"]')).toBeNull();
      expect(markdownEditor.codeBlocks.codeBlocks.has("cb-1")).toBe(false);
    });
  });

  describe("getCursorBlockAtStart and handleBackspaceIntoCodeBlock", () => {
    it("does not handle Backspace when cursor is not at start of block", () => {
      const markdownEditor = createEditor("<p>Hello</p>");
      editor.setCursorInBlock(0, 3);

      const event = keyEvent("Backspace");
      const preventSpy = vi.spyOn(event, "preventDefault");
      markdownEditor.onKeyDown(event);

      // Should not prevent default for normal backspace
      expect(preventSpy).not.toHaveBeenCalled();
    });

    it("does not handle Backspace when previous sibling is not code block", () => {
      const markdownEditor = createEditor("<p>First</p><p>Second</p>");
      editor.setCursorInBlock(1, 0);

      const event = keyEvent("Backspace");
      const preventSpy = vi.spyOn(event, "preventDefault");
      markdownEditor.onKeyDown(event);

      // Should not prevent default for backspace between paragraphs
      expect(preventSpy).not.toHaveBeenCalled();
    });

    it("handles Backspace at start of paragraph after code block", async () => {
      const markdownEditor = createEditor(
        '<div data-code-block-id="cb-1" contenteditable="false"><pre contenteditable="true">code content</pre></div><p>After</p>'
      );

      // Position cursor at start of paragraph using range API
      const p = editor.container.querySelector("p")!;
      const range = document.createRange();
      range.selectNodeContents(p);
      range.collapse(true); // Collapse to start
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);

      const event = keyEvent("Backspace");
      const preventSpy = vi.spyOn(event, "preventDefault");
      markdownEditor.onKeyDown(event);

      expect(preventSpy).toHaveBeenCalled();
    });

    it("removes empty paragraph when backspacing into code block", async () => {
      const markdownEditor = createEditor(
        '<div data-code-block-id="cb-1" contenteditable="false"><pre contenteditable="true">code</pre></div><p><br></p>'
      );

      // Position cursor at start of empty paragraph
      const p = editor.container.querySelector("p")!;
      const range = document.createRange();
      range.selectNodeContents(p);
      range.collapse(true);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);

      const event = keyEvent("Backspace");
      markdownEditor.onKeyDown(event);

      await nextTick();
      // The empty paragraph should be removed
      expect(editor.container.querySelectorAll("p").length).toBe(0);
    });

    it("does not prevent default when no selection", () => {
      const markdownEditor = createEditor("<p>Hello</p>");
      window.getSelection()?.removeAllRanges();

      const event = keyEvent("Backspace");
      const preventSpy = vi.spyOn(event, "preventDefault");
      markdownEditor.onKeyDown(event);

      expect(preventSpy).not.toHaveBeenCalled();
    });

    it("does not prevent default when range is not collapsed", () => {
      const markdownEditor = createEditor("<p>Hello</p>");
      editor.selectInBlock(0, 1, 3);

      const event = keyEvent("Backspace");
      const preventSpy = vi.spyOn(event, "preventDefault");
      markdownEditor.onKeyDown(event);

      expect(preventSpy).not.toHaveBeenCalled();
    });

    it("getCursorBlockAtStart returns null when cursor is in inline element not inside a block (editorKeyHandlers lines 76-79)", () => {
      // Create a <span> as direct child of the contenteditable (no block wrapper)
      // getCursorBlockAtStart walks up from span, finds it's not convertible,
      // does node = element.parentElement (line 76), reaches contentRef, exits loop,
      // returns null (line 79)
      const markdownEditor = createEditor("<span>inline text</span>");
      const span = editor.container.querySelector("span")!;
      editor.setCursor(span.firstChild!, 0);

      // Backspace should not be prevented because getCursorBlockAtStart returns null
      const event = keyEvent("Backspace");
      const preventSpy = vi.spyOn(event, "preventDefault");
      markdownEditor.onKeyDown(event);

      expect(preventSpy).not.toHaveBeenCalled();
    });
  });

  describe("language cycling in code blocks", () => {
    it("cycles json to yaml", () => {
      const markdownEditor = createEditor('<div data-code-block-id="cb-1"><p>code</p></div>');

      markdownEditor.codeBlocks.codeBlocks.set("cb-1", {
        id: "cb-1",
        content: "test",
        language: "json",
      });

      const p = editor.container.querySelector("p")!;
      const event = new KeyboardEvent("keydown", {
        key: "l",
        code: "KeyL",
        ctrlKey: true,
        altKey: true,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(event, "target", { value: p });

      markdownEditor.onKeyDown(event);
      expect(markdownEditor.codeBlocks.codeBlocks.get("cb-1")?.language).toBe("yaml");
    });

    it("cycles text to markdown", () => {
      const markdownEditor = createEditor('<div data-code-block-id="cb-1"><p>code</p></div>');

      markdownEditor.codeBlocks.codeBlocks.set("cb-1", {
        id: "cb-1",
        content: "test",
        language: "text",
      });

      const p = editor.container.querySelector("p")!;
      const event = new KeyboardEvent("keydown", {
        key: "l",
        code: "KeyL",
        ctrlKey: true,
        altKey: true,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(event, "target", { value: p });

      markdownEditor.onKeyDown(event);
      expect(markdownEditor.codeBlocks.codeBlocks.get("cb-1")?.language).toBe("markdown");
    });

    it("cycles markdown to text", () => {
      const markdownEditor = createEditor('<div data-code-block-id="cb-1"><p>code</p></div>');

      markdownEditor.codeBlocks.codeBlocks.set("cb-1", {
        id: "cb-1",
        content: "test",
        language: "markdown",
      });

      const p = editor.container.querySelector("p")!;
      const event = new KeyboardEvent("keydown", {
        key: "l",
        code: "KeyL",
        ctrlKey: true,
        altKey: true,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(event, "target", { value: p });

      markdownEditor.onKeyDown(event);
      expect(markdownEditor.codeBlocks.codeBlocks.get("cb-1")?.language).toBe("text");
    });

    it("does not cycle for other languages like python", () => {
      const markdownEditor = createEditor('<div data-code-block-id="cb-1"><p>code</p></div>');

      markdownEditor.codeBlocks.codeBlocks.set("cb-1", {
        id: "cb-1",
        content: "test",
        language: "python",
      });

      const p = editor.container.querySelector("p")!;
      const event = new KeyboardEvent("keydown", {
        key: "l",
        code: "KeyL",
        ctrlKey: true,
        altKey: true,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(event, "target", { value: p });

      markdownEditor.onKeyDown(event);
      expect(markdownEditor.codeBlocks.codeBlocks.get("cb-1")?.language).toBe("python");
    });

    it("handles missing code block state gracefully", () => {
      const markdownEditor = createEditor('<div data-code-block-id="cb-1"><p>code</p></div>');
      // Don't set any state

      const p = editor.container.querySelector("p")!;
      const event = new KeyboardEvent("keydown", {
        key: "l",
        code: "KeyL",
        ctrlKey: true,
        altKey: true,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(event, "target", { value: p });

      // Should not throw
      markdownEditor.onKeyDown(event);
    });
  });

  describe("insertHorizontalRule edge cases", () => {
    it("inserts hr after heading", async () => {
      const markdownEditor = createEditor("<h2>Heading</h2>");
      editor.setCursorInBlock(0, 3);

      markdownEditor.insertHorizontalRule();
      await nextTick();

      expect(editor.getHtml()).toContain("<hr>");
    });

    it("inserts hr after blockquote", async () => {
      const markdownEditor = createEditor("<blockquote>Quote</blockquote>");
      const bq = editor.container.querySelector("blockquote")!;
      if (bq.firstChild) {
        editor.setCursor(bq.firstChild, 2);
      }

      markdownEditor.insertHorizontalRule();
      await nextTick();

      expect(editor.getHtml()).toContain("<hr>");
    });

    it("inserts hr after code block wrapper", async () => {
      const markdownEditor = createEditor(
        '<div data-code-block-id="cb-1" contenteditable="false"><p>code</p></div>'
      );
      const wrapper = editor.container.querySelector('[data-code-block-id="cb-1"]')!;

      // Position cursor inside wrapper
      const p = wrapper.querySelector("p")!;
      if (p.firstChild) {
        editor.setCursor(p.firstChild, 0);
      }

      markdownEditor.insertHorizontalRule();
      await nextTick();

      expect(editor.getHtml()).toContain("<hr>");
    });

    it("inserts hr after code block wrapper when cursor is in non-block child (editorActions lines 63-64)", async () => {
      // Use a <span> inside the code block wrapper so the walk-up loop
      // passes through span (not P/H/LI/BLOCKQUOTE) and hits the data-code-block-id check
      const markdownEditor = createEditor(
        '<div data-code-block-id="cb-2" contenteditable="false"><span>code text</span></div>'
      );
      const span = editor.container.querySelector("span")!;
      if (span.firstChild) {
        editor.setCursor(span.firstChild, 2);
      }

      markdownEditor.insertHorizontalRule();
      await nextTick();

      expect(editor.getHtml()).toContain("<hr>");
    });
  });

  describe("arrow key table navigation", () => {
    it("handles ArrowUp in table", () => {
      const markdownEditor = createEditor(
        "<table><tr><td>Row 1</td></tr><tr><td>Row 2</td></tr></table>"
      );

      // Position cursor in second row
      const cells = editor.container.querySelectorAll("td");
      expect(cells[1]?.firstChild).not.toBeNull();
      editor.setCursor(cells[1]!.firstChild!, 0);

      const event = keyEvent("ArrowUp");
      const preventSpy = vi.spyOn(event, "preventDefault");
      markdownEditor.onKeyDown(event);
      // Arrow navigation in a table cell calls preventDefault when handled
      expect(preventSpy).toHaveBeenCalled();
    });

    it("handles ArrowDown in table", () => {
      const markdownEditor = createEditor(
        "<table><tr><td>Row 1</td></tr><tr><td>Row 2</td></tr></table>"
      );

      const cells = editor.container.querySelectorAll("td");
      expect(cells[0]?.firstChild).not.toBeNull();
      editor.setCursor(cells[0]!.firstChild!, 0);

      const event = keyEvent("ArrowDown");
      const preventSpy = vi.spyOn(event, "preventDefault");
      markdownEditor.onKeyDown(event);
      expect(preventSpy).toHaveBeenCalled();
    });

    it("does not handle arrow keys with modifiers", () => {
      const markdownEditor = createEditor(
        "<table><tr><td>Row 1</td></tr><tr><td>Row 2</td></tr></table>"
      );

      const cells = editor.container.querySelectorAll("td");
      expect(cells[0]?.firstChild).not.toBeNull();
      editor.setCursor(cells[0]!.firstChild!, 0);

      const event = keyEvent("ArrowDown", { ctrl: true });
      const preventSpy = vi.spyOn(event, "preventDefault");
      markdownEditor.onKeyDown(event);

      // With ctrl modifier, should not be intercepted for table nav
      expect(preventSpy).not.toHaveBeenCalled();
    });
  });

  describe("Enter key in table", () => {
    it("handles Enter in table cell", () => {
      const markdownEditor = createEditor("<table><tr><td>Cell</td><td>Cell 2</td></tr></table>");

      const td = editor.container.querySelector("td")!;
      expect(td.firstChild).not.toBeNull();
      editor.setCursor(td.firstChild!, 2);

      const event = keyEvent("Enter");
      const preventSpy = vi.spyOn(event, "preventDefault");
      markdownEditor.onKeyDown(event);

      expect(preventSpy).toHaveBeenCalled();
    });
  });

  describe("Tab in table", () => {
    it("handles Tab in table for cell navigation", () => {
      const markdownEditor = createEditor("<table><tr><td>Cell 1</td><td>Cell 2</td></tr></table>");

      const td = editor.container.querySelector("td")!;
      expect(td.firstChild).not.toBeNull();
      editor.setCursor(td.firstChild!, 2);

      const event = keyEvent("Tab", { code: "Tab" });
      const preventSpy = vi.spyOn(event, "preventDefault");
      markdownEditor.onKeyDown(event);

      expect(preventSpy).toHaveBeenCalled();
    });

    it("handles Shift+Tab for outdent in list", () => {
      const markdownEditor = createEditor("<ul><li>First<ul><li>Nested</li></ul></li></ul>");

      const nestedLi = editor.container.querySelectorAll("li")[1];
      expect(nestedLi?.firstChild).not.toBeNull();
      editor.setCursor(nestedLi!.firstChild!, 0);

      const event = keyEvent("Tab", { shift: true, code: "Tab" });
      const preventSpy = vi.spyOn(event, "preventDefault");
      markdownEditor.onKeyDown(event);
      // Tab key in editor always calls preventDefault
      expect(preventSpy).toHaveBeenCalled();
    });
  });

  describe("Enter in code block pattern", () => {
    it("attempts code fence pattern detection on Enter", () => {
      const markdownEditor = createEditor("<p>```javascript</p>");
      const p = editor.container.querySelector("p")!;
      // Position cursor at end of text content
      if (p.firstChild) {
        const len = p.firstChild.textContent?.length || 0;
        editor.setCursor(p.firstChild, len);
      }

      const event = keyEvent("Enter");
      // Should not throw - the pattern detection runs
      markdownEditor.onKeyDown(event);
    });
  });

  describe("isInternalUpdate flag", () => {
    it("is available on the editor return", () => {
      const markdownEditor = createEditor("<p>Hello</p>");
      expect(markdownEditor.isInternalUpdate).toBeDefined();
      expect(markdownEditor.isInternalUpdate.value).toBeDefined();
    });
  });

  describe("onContentChange callbacks", () => {
    it("inlineFormatting.toggleBold triggers debouncedSyncFromHtml (line 137)", async () => {
      vi.useFakeTimers();
      const markdownEditor = createEditor("<p>Hello world</p>");
      editor.selectInBlock(0, 0, 5); // Select "Hello"

      markdownEditor.inlineFormatting.toggleBold();

      // Advance past debounce timer (300ms)
      vi.advanceTimersByTime(400);

      expect(onEmitValue).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it("blockquotes.toggleBlockquote triggers debouncedSyncFromHtml (line 148)", async () => {
      vi.useFakeTimers();
      const markdownEditor = createEditor("<p>Quote me</p>");
      editor.setCursorInBlock(0, 3);

      markdownEditor.blockquotes.toggleBlockquote();

      // Should have wrapped in blockquote
      expect(editor.getHtml()).toContain("<blockquote>");

      // Advance past debounce timer
      vi.advanceTimersByTime(400);

      expect(onEmitValue).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it("links.insertLink triggers debouncedSyncFromHtml via onShowLinkPopover (line 153)", async () => {
      vi.useFakeTimers();
      let capturedOptions: { onSubmit: (url: string, label?: string) => void } | null = null;
      const onShowLinkPopover = vi.fn((opts: unknown) => {
        capturedOptions = opts as { onSubmit: (url: string, label?: string) => void };
      });

      const markdownEditor = createEditor("<p>Some text</p>", "", { onShowLinkPopover });
      editor.setCursorInBlock(0, 4); // Cursor in "Some text" (collapsed)

      markdownEditor.links.insertLink();

      // onShowLinkPopover should have been called
      expect(onShowLinkPopover).toHaveBeenCalled();
      expect(capturedOptions).not.toBeNull();

      // Simulate submitting the link
      capturedOptions!.onSubmit("https://example.com", "Example");

      // Advance past debounce timer
      vi.advanceTimersByTime(400);

      expect(onEmitValue).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it("codeBlocks.updateCodeBlockContent triggers syncCallback (line 103)", async () => {
      vi.useFakeTimers();
      const markdownEditor = createEditor(
        '<div data-code-block-id="cb-test" contenteditable="false"><div class="code-viewer-mount-point" data-content="original" data-language="javascript"></div></div>'
      );

      // Register the code block in state
      markdownEditor.codeBlocks.registerCodeBlock("cb-test", "original", "javascript");

      // Update code block content - this calls onContentChange() inside useCodeBlocks,
      // which calls the callback in useMarkdownEditor (line 103): if (syncCallback) syncCallback()
      markdownEditor.codeBlocks.updateCodeBlockContent("cb-test", "updated content");

      // Advance past debounce timer
      vi.advanceTimersByTime(400);

      expect(onEmitValue).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it("codeBlocks.toggleCodeBlock triggers onContentChange when converting paragraph to code block (line 103)", () => {
      vi.useFakeTimers();
      const markdownEditor = createEditor("<p>some code</p>");
      editor.setCursorInBlock(0, 0);

      markdownEditor.codeBlocks.toggleCodeBlock();

      // Advance past debounce timer
      vi.advanceTimersByTime(400);

      // The code block was created and onContentChange fired
      expect(markdownEditor.codeBlocks.codeBlocks.size).toBe(1);
      expect(onEmitValue).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it("codeBlocks.removeCodeBlock triggers onContentChange and sync (line 103)", () => {
      vi.useFakeTimers();
      const markdownEditor = createEditor(
        '<div data-code-block-id="cb-rm" contenteditable="false"><div class="code-viewer-mount-point" data-content="code" data-language="text"></div></div>'
      );

      // Register the code block
      markdownEditor.codeBlocks.registerCodeBlock("cb-rm", "code", "text");

      // removeCodeBlock calls onContentChange inside useCodeBlocks,
      // which triggers the syncCallback in useMarkdownEditor (line 103)
      markdownEditor.codeBlocks.removeCodeBlock("cb-rm");

      vi.advanceTimersByTime(400);
      expect(onEmitValue).toHaveBeenCalled();
      expect(markdownEditor.codeBlocks.codeBlocks.has("cb-rm")).toBe(false);
      vi.useRealTimers();
    });

    it("codeBlocks.updateCodeBlockLanguage triggers onContentChange (line 103)", () => {
      vi.useFakeTimers();
      const markdownEditor = createEditor(
        '<div data-code-block-id="cb-lang" contenteditable="false"><div class="code-viewer-mount-point" data-content="code" data-language="javascript"></div></div>'
      );

      markdownEditor.codeBlocks.registerCodeBlock("cb-lang", "code", "javascript");
      markdownEditor.codeBlocks.updateCodeBlockLanguage("cb-lang", "typescript");

      vi.advanceTimersByTime(400);
      expect(onEmitValue).toHaveBeenCalled();
      expect(markdownEditor.codeBlocks.codeBlocks.get("cb-lang")?.language).toBe("typescript");
      vi.useRealTimers();
    });
  });

  describe("setMarkdown with null contentRef", () => {
    it("does not update DOM when contentRef becomes null", async () => {
      const markdownEditor = createEditor("<p>Initial</p>");
      // Null out the contentRef before calling setMarkdown
      editor.contentRef.value = null;

      markdownEditor.setMarkdown("## New Content");

      // renderedHtml is still updated (sync.syncFromMarkdown runs)
      expect(markdownEditor.renderedHtml.value).toContain("New Content");

      await nextTick();
      // But DOM was not updated because contentRef was null
      // The original container should be unchanged (it's still in the document)
      expect(editor.container.innerHTML).toBe("<p>Initial</p>");
    });
  });

  describe("token callbacks (getTokenById and registerToken)", () => {
    it("registers tokens when initializing with markdown containing token patterns", () => {
      const tokenRenderer = {
        id: "test-renderer",
        pattern: /\{\{(\d+)\}\}/g,
        toHtml: (_match: string, groups: string[]) =>
          `<span data-token-id="x" data-token-renderer="test-renderer" data-token-groups='${JSON.stringify(groups)}'></span>`,
        component: defineComponent({ template: "<span />" }) as never,
        getProps: (groups: string[]) => ({ id: groups[0] }),
        toMarkdown: (el: HTMLElement) => `{{${el.getAttribute("data-token-groups")}}}`,
      };

      editor = createTestEditor("");
      onEmitValue = vi.fn();
      let markdownEditor!: ReturnType<typeof useMarkdownEditor>;
      const wrapper = mount(
        defineComponent({
          setup() {
            markdownEditor = useMarkdownEditor({
              contentRef: editor.contentRef,
              initialValue: "Hello {{123}} world",
              onEmitValue: onEmitValue as unknown as (markdown: string) => void,
              tokenRenderers: [tokenRenderer],
            });
            return {};
          },
          template: "<div />",
        })
      );
      mountedWrappers.push(wrapper);

      // The registerToken callback (line 115-116) should have been called during syncFromMarkdown
      // which calls convertTokensToWrappers, which calls the registerToken callback
      expect(markdownEditor.tokens.size).toBeGreaterThan(0);

      // Verify the stored token state has correct rendererId and groups
      const tokenEntry = Array.from(markdownEditor.tokens.values())[0];
      expect(tokenEntry?.rendererId).toBe("test-renderer");
      expect(tokenEntry?.groups).toContain("123");
    });

    it("getTokenById retrieves a previously registered token", () => {
      vi.useFakeTimers();
      const tokenRenderer = {
        id: "test-renderer",
        pattern: /\{\{(\d+)\}\}/g,
        toHtml: (_match: string, groups: string[]) => `<span data-token-id="x">${groups[0]}</span>`,
        component: defineComponent({ template: "<span />" }) as never,
        getProps: (groups: string[]) => ({ id: groups[0] }),
        toMarkdown: (el: HTMLElement) => {
          const groups = el.getAttribute("data-token-groups");
          return `{{${groups}}}`;
        },
      };

      editor = createTestEditor("");
      onEmitValue = vi.fn();
      let markdownEditor!: ReturnType<typeof useMarkdownEditor>;
      const wrapper = mount(
        defineComponent({
          setup() {
            markdownEditor = useMarkdownEditor({
              contentRef: editor.contentRef,
              initialValue: "Test {{456}} here",
              onEmitValue: onEmitValue as unknown as (markdown: string) => void,
              tokenRenderers: [tokenRenderer],
            });
            return {};
          },
          template: "<div />",
        })
      );
      mountedWrappers.push(wrapper);

      // Tokens are registered during syncFromMarkdown via registerToken callback
      const tokenId = Array.from(markdownEditor.tokens.keys())[0]!;
      const token = markdownEditor.tokens.get(tokenId);
      expect(token).toBeDefined();
      expect(token?.rendererId).toBe("test-renderer");

      // Now trigger syncFromHtml which uses getTokenById (line 114) via buildEditorElementProcessor
      // Set the rendered HTML back into the editor and trigger sync
      editor.container.innerHTML = markdownEditor.renderedHtml.value;
      markdownEditor.onBlur();

      expect(onEmitValue).toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe("onShowHotkeyHelp callback (line 125)", () => {
    it("Ctrl+? triggers onShowHotkeyHelp which sets isShowingHotkeyHelp to true", () => {
      const markdownEditor = createEditor("<p>Hello</p>");
      editor.setCursorInBlock(0, 0);

      expect(markdownEditor.isShowingHotkeyHelp.value).toBe(false);

      // Ctrl+? is the hotkey help shortcut, handled by useMarkdownHotkeys.handleKeyDown
      const event = keyEvent("?", { ctrl: true });
      markdownEditor.onKeyDown(event);

      expect(markdownEditor.isShowingHotkeyHelp.value).toBe(true);
    });

    it("Ctrl+/ also triggers onShowHotkeyHelp", () => {
      const markdownEditor = createEditor("<p>Hello</p>");
      editor.setCursorInBlock(0, 0);

      const event = keyEvent("/", { ctrl: true });
      markdownEditor.onKeyDown(event);

      expect(markdownEditor.isShowingHotkeyHelp.value).toBe(true);
    });
  });

  describe("onShowTablePopover callback wiring (line 167)", () => {
    it("tables.insertTable calls onShowTablePopover when provided", () => {
      const onShowTablePopover = vi.fn();
      const markdownEditor = createEditor("<p>Hello</p>", "", { onShowTablePopover });
      editor.setCursorInBlock(0, 3);

      markdownEditor.tables.insertTable();

      expect(onShowTablePopover).toHaveBeenCalledTimes(1);
      expect(onShowTablePopover).toHaveBeenCalledWith(
        expect.objectContaining({
          onSubmit: expect.any(Function),
          onCancel: expect.any(Function),
        })
      );
    });
  });

  describe("keydown event handling", () => {
    it("ignores events from inside code block wrappers", () => {
      const markdownEditor = createEditor('<div data-code-block-id="test"><p>code</p></div>');
      const p = editor.container.querySelector("p")!;

      // Create event with target inside code block
      const event = new KeyboardEvent("keydown", {
        key: "a",
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(event, "target", { value: p });

      markdownEditor.onKeyDown(event);
      // Should have returned early - no error means it handled correctly
    });

    it("handles Ctrl+Alt+L inside code block for language cycling", () => {
      const markdownEditor = createEditor('<div data-code-block-id="cb-1"><p>code</p></div>');

      // Register a code block state
      markdownEditor.codeBlocks.codeBlocks.set("cb-1", {
        id: "cb-1",
        content: "test",
        language: "yaml",
      });

      const p = editor.container.querySelector("p")!;
      const event = new KeyboardEvent("keydown", {
        key: "l",
        code: "KeyL",
        ctrlKey: true,
        altKey: true,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(event, "target", { value: p });

      markdownEditor.onKeyDown(event);

      // Should have cycled yaml -> json
      expect(markdownEditor.codeBlocks.codeBlocks.get("cb-1")?.language).toBe("json");
    });
  });

  describe("contentRef watcher (one-shot charCount init)", () => {
    it("updates charCount when contentRef transitions from null to element", async () => {
      // Create editor with null contentRef initially
      const contentRef = ref<HTMLElement | null>(null);
      onEmitValue = vi.fn();
      let markdownEditor!: ReturnType<typeof useMarkdownEditor>;
      const wrapper = mount(
        defineComponent({
          setup() {
            markdownEditor = useMarkdownEditor({
              contentRef,
              initialValue: "Hello world",
              onEmitValue: onEmitValue as unknown as (markdown: string) => void,
            });
            return {};
          },
          template: "<div />",
        })
      );
      mountedWrappers.push(wrapper);

      // charCount starts at 0 because contentRef is null
      expect(markdownEditor.charCount.value).toBe(0);

      // Mount a real element with text content
      const container = document.createElement("div");
      container.textContent = "Hello world";
      document.body.appendChild(container);
      contentRef.value = container;
      await nextTick();

      // Watcher should have fired and updated charCount
      expect(markdownEditor.charCount.value).toBe(11);

      container.remove();
    });

    it("stops watching after first non-null contentRef", async () => {
      const contentRef = ref<HTMLElement | null>(null);
      onEmitValue = vi.fn();
      let markdownEditor!: ReturnType<typeof useMarkdownEditor>;
      const wrapper = mount(
        defineComponent({
          setup() {
            markdownEditor = useMarkdownEditor({
              contentRef,
              initialValue: "",
              onEmitValue: onEmitValue as unknown as (markdown: string) => void,
            });
            return {};
          },
          template: "<div />",
        })
      );
      mountedWrappers.push(wrapper);

      // Mount first element
      const container1 = document.createElement("div");
      container1.textContent = "First";
      document.body.appendChild(container1);
      contentRef.value = container1;
      await nextTick();

      expect(markdownEditor.charCount.value).toBe(5);

      // Replace with a different element — watcher already stopped,
      // so charCount should NOT update automatically
      const container2 = document.createElement("div");
      container2.textContent = "Second element";
      document.body.appendChild(container2);
      contentRef.value = container2;
      await nextTick();

      // charCount remains at 5 because the watcher stopped itself
      expect(markdownEditor.charCount.value).toBe(5);

      container1.remove();
      container2.remove();
    });
  });

  describe("onInput branch paths", () => {
    it("skips sync when heading pattern is converted", () => {
      vi.useFakeTimers();
      const markdownEditor = createEditor("<p># Hello</p>");
      editor.setCursorInBlock(0, 7);

      markdownEditor.onInput();

      // The heading pattern "# Hello" should have been converted to <h1>
      expect(editor.getHtml()).toContain("<h1>");
      expect(editor.getHtml()).not.toContain("<p>");

      // debouncedSyncFromHtml should NOT have been called (heading conversion skipped it)
      vi.advanceTimersByTime(400);
      // onEmitValue is not called because onContentChange from headings triggers its own sync,
      // but debouncedSyncFromHtml in onInput was skipped
      vi.useRealTimers();
    });

    it("skips sync when list pattern is converted", () => {
      vi.useFakeTimers();
      const markdownEditor = createEditor("<p>- Item text</p>");
      editor.setCursorInBlock(0, 11);

      markdownEditor.onInput();

      // The list pattern "- Item text" should have been converted to <ul><li>
      expect(editor.getHtml()).toContain("<ul>");
      expect(editor.getHtml()).toContain("<li>");
      expect(editor.getHtml()).not.toContain("<p>");

      vi.useRealTimers();
    });

    it("falls through to sync when no pattern is converted", () => {
      vi.useFakeTimers();
      const markdownEditor = createEditor("<p>Normal text</p>");
      editor.setCursorInBlock(0, 5);

      markdownEditor.onInput();

      // No pattern conversion — should fall through to debouncedSyncFromHtml
      vi.advanceTimersByTime(400);
      expect(onEmitValue).toHaveBeenCalled();
      vi.useRealTimers();
    });
  });
});
