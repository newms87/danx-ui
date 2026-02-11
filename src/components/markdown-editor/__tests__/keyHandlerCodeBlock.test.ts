import { describe, it, expect, vi, afterEach } from "vitest";
import { ref } from "vue";
import {
  getCursorBlockAtStart,
  handleBackspaceIntoCodeBlock,
  handleCodeBlockLanguageCycle,
} from "../keyHandlerCodeBlock";
import type { UseCodeBlocksReturn } from "../useCodeBlocks";
import type { UseMarkdownSyncReturn } from "../useMarkdownSync";
import { createTestEditor, TestEditorResult } from "./editorTestUtils";

describe("keyHandlerCodeBlock", () => {
  let editor: TestEditorResult;
  let compareSpy: ReturnType<typeof vi.spyOn> | null = null;

  afterEach(() => {
    if (editor) editor.destroy();
    compareSpy?.mockRestore();
    compareSpy = null;
  });

  /**
   * Happy-dom doesn't implement compareBoundaryPoints correctly.
   * Mock it to return 0 (equal) so positive-path tests can verify
   * block detection logic.
   */
  function mockCompareBoundaryPoints(): void {
    compareSpy = vi.spyOn(Range.prototype, "compareBoundaryPoints").mockReturnValue(0);
  }

  describe("getCursorBlockAtStart", () => {
    it("returns null when there is no selection", () => {
      editor = createTestEditor("<p>Hello</p>");
      window.getSelection()?.removeAllRanges();

      const result = getCursorBlockAtStart(editor.contentRef);
      expect(result).toBeNull();
    });

    it("returns null when contentRef is null", () => {
      editor = createTestEditor("<p>Hello</p>");
      editor.setCursorInBlock(0, 0);

      const result = getCursorBlockAtStart(ref<HTMLElement | null>(null));
      expect(result).toBeNull();
    });

    it("returns null when selection is not collapsed", () => {
      editor = createTestEditor("<p>Hello world</p>");
      editor.selectInBlock(0, 0, 5);

      const result = getCursorBlockAtStart(editor.contentRef);
      expect(result).toBeNull();
    });

    it("returns null when cursor is not at offset 0", () => {
      editor = createTestEditor("<p>Hello</p>");
      editor.setCursorInBlock(0, 3);

      const result = getCursorBlockAtStart(editor.contentRef);
      expect(result).toBeNull();
    });

    it("returns the block element when cursor is at the start", () => {
      mockCompareBoundaryPoints();
      editor = createTestEditor("<p>Hello</p>");
      editor.setCursorInBlock(0, 0);

      const result = getCursorBlockAtStart(editor.contentRef);
      expect(result).not.toBeNull();
      expect(result?.tagName).toBe("P");
    });

    it("returns DIV block when cursor is at start of a div", () => {
      mockCompareBoundaryPoints();
      editor = createTestEditor("<div>Content</div>");
      editor.setCursorInBlock(0, 0);

      const result = getCursorBlockAtStart(editor.contentRef);
      expect(result?.tagName).toBe("DIV");
    });

    it("returns heading when cursor is at start of heading", () => {
      mockCompareBoundaryPoints();
      editor = createTestEditor("<h2>Title</h2>");
      editor.setCursorInBlock(0, 0);

      const result = getCursorBlockAtStart(editor.contentRef);
      expect(result?.tagName).toBe("H2");
    });

    it("handles text node at start correctly", () => {
      mockCompareBoundaryPoints();
      editor = createTestEditor("<p>Text</p>");
      const p = editor.getBlock(0)!;
      const textNode = p.firstChild!;
      editor.setCursor(textNode, 0);

      const result = getCursorBlockAtStart(editor.contentRef);
      expect(result?.tagName).toBe("P");
    });

    it("returns null when cursor is not at offset 0 (non-text node)", () => {
      editor = createTestEditor("<p>Text</p>");
      editor.setCursorInBlock(0, 2);
      const result = getCursorBlockAtStart(editor.contentRef);
      expect(result).toBeNull();
    });
  });

  describe("handleBackspaceIntoCodeBlock", () => {
    function createMockSync(): UseMarkdownSyncReturn {
      return {
        renderedHtml: ref(""),
        isInternalUpdate: ref(false),
        syncFromMarkdown: vi.fn(),
        syncFromHtml: vi.fn(),
        debouncedSyncFromHtml: vi.fn(),
      };
    }

    it("returns false when no block is at start of cursor", () => {
      editor = createTestEditor("<p>Hello</p>");
      editor.setCursorInBlock(0, 3);
      const sync = createMockSync();

      const result = handleBackspaceIntoCodeBlock(editor.contentRef, sync);
      expect(result).toBe(false);
    });

    it("returns false when previous sibling is not a code block", () => {
      mockCompareBoundaryPoints();
      editor = createTestEditor("<p>First</p><p>Second</p>");
      editor.setCursorInBlock(1, 0);
      const sync = createMockSync();

      const result = handleBackspaceIntoCodeBlock(editor.contentRef, sync);
      expect(result).toBe(false);
    });

    it("returns false when previous sibling has no editable pre", () => {
      mockCompareBoundaryPoints();
      editor = createTestEditor(
        '<div data-code-block-id="cb1"><div>no pre here</div></div><p>After</p>'
      );
      const p = editor.container.querySelector("p")!;
      editor.setCursor(p.firstChild!, 0);
      const sync = createMockSync();

      const result = handleBackspaceIntoCodeBlock(editor.contentRef, sync);
      expect(result).toBe(false);
    });

    it("returns true and calls debouncedSyncFromHtml when handling backspace", () => {
      mockCompareBoundaryPoints();
      editor = createTestEditor(
        '<div data-code-block-id="cb1"><pre contenteditable="true">code</pre></div><p>After</p>'
      );
      const p = editor.container.querySelector("p")!;
      editor.setCursor(p.firstChild!, 0);
      const sync = createMockSync();

      const result = handleBackspaceIntoCodeBlock(editor.contentRef, sync);
      expect(result).toBe(true);
      expect(sync.debouncedSyncFromHtml).toHaveBeenCalled();
    });

    it("removes empty paragraph when backspacing into code block", () => {
      mockCompareBoundaryPoints();
      editor = createTestEditor(
        '<div data-code-block-id="cb1"><pre contenteditable="true">code</pre></div><p></p>'
      );
      const p = editor.container.querySelector("p")!;
      // Position cursor at start of empty paragraph
      const range = document.createRange();
      range.setStart(p, 0);
      range.collapse(true);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
      const sync = createMockSync();

      const result = handleBackspaceIntoCodeBlock(editor.contentRef, sync);
      expect(result).toBe(true);
      expect(editor.container.querySelector("p")).toBeNull();
    });

    it("preserves non-empty paragraph when backspacing into code block", () => {
      mockCompareBoundaryPoints();
      editor = createTestEditor(
        '<div data-code-block-id="cb1"><pre contenteditable="true">code</pre></div><p>Keep me</p>'
      );
      const p = editor.container.querySelector("p")!;
      editor.setCursor(p.firstChild!, 0);
      const sync = createMockSync();

      handleBackspaceIntoCodeBlock(editor.contentRef, sync);
      expect(editor.container.querySelector("p")).not.toBeNull();
    });
  });

  describe("handleCodeBlockLanguageCycle", () => {
    function createMockCodeBlocks(
      blocks: Map<string, { id: string; content: string; language: string }>
    ): UseCodeBlocksReturn {
      return {
        codeBlocks: blocks,
        toggleCodeBlock: vi.fn(),
        checkAndConvertCodeBlockPattern: vi.fn(() => false),
        isInCodeBlock: vi.fn(() => false),
        getCurrentCodeBlockLanguage: vi.fn(() => null),
        setCodeBlockLanguage: vi.fn(),
        getCodeBlocks: vi.fn(() => blocks),
        updateCodeBlockContent: vi.fn(),
        updateCodeBlockLanguage: vi.fn(),
        removeCodeBlock: vi.fn(),
        getCodeBlockById: vi.fn((id: string) => blocks.get(id)),
        getCurrentCodeBlockId: vi.fn(() => null),
        handleCodeBlockMounted: vi.fn(),
        registerCodeBlock: vi.fn(),
      };
    }

    function createKeyEvent(
      key: string,
      options: { ctrl?: boolean; alt?: boolean; meta?: boolean } = {}
    ): KeyboardEvent {
      return new KeyboardEvent("keydown", {
        key,
        ctrlKey: options.ctrl ?? false,
        altKey: options.alt ?? false,
        metaKey: options.meta ?? false,
        bubbles: true,
        cancelable: true,
      });
    }

    it("returns false when key combo is not Ctrl+Alt+L", () => {
      const codeBlocks = createMockCodeBlocks(new Map());
      const event = createKeyEvent("a", { ctrl: true, alt: true });

      expect(handleCodeBlockLanguageCycle(event, null, codeBlocks)).toBe(false);
    });

    it("returns false when only Ctrl is pressed without Alt", () => {
      const codeBlocks = createMockCodeBlocks(new Map());
      const event = createKeyEvent("l", { ctrl: true });

      expect(handleCodeBlockLanguageCycle(event, null, codeBlocks)).toBe(false);
    });

    it("returns true when Ctrl+Alt+L is pressed (even with no target)", () => {
      const codeBlocks = createMockCodeBlocks(new Map());
      const event = createKeyEvent("l", { ctrl: true, alt: true });

      expect(handleCodeBlockLanguageCycle(event, null, codeBlocks)).toBe(true);
    });

    it("returns true when Meta+Alt+L is pressed", () => {
      const codeBlocks = createMockCodeBlocks(new Map());
      const event = createKeyEvent("l", { meta: true, alt: true });

      expect(handleCodeBlockLanguageCycle(event, null, codeBlocks)).toBe(true);
    });

    it("prevents default and stops propagation", () => {
      const codeBlocks = createMockCodeBlocks(new Map());
      const event = createKeyEvent("l", { ctrl: true, alt: true });
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");
      const stopPropagationSpy = vi.spyOn(event, "stopPropagation");

      handleCodeBlockLanguageCycle(event, null, codeBlocks);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it("cycles yaml to json", () => {
      const blocks = new Map([["cb1", { id: "cb1", content: "", language: "yaml" }]]);
      const codeBlocks = createMockCodeBlocks(blocks);

      const wrapper = document.createElement("div");
      wrapper.setAttribute("data-code-block-id", "cb1");
      const target = document.createElement("pre");
      wrapper.appendChild(target);

      const event = createKeyEvent("l", { ctrl: true, alt: true });
      handleCodeBlockLanguageCycle(event, target, codeBlocks);

      expect(codeBlocks.updateCodeBlockLanguage).toHaveBeenCalledWith("cb1", "json");
    });

    it("cycles json to yaml", () => {
      const blocks = new Map([["cb1", { id: "cb1", content: "", language: "json" }]]);
      const codeBlocks = createMockCodeBlocks(blocks);

      const wrapper = document.createElement("div");
      wrapper.setAttribute("data-code-block-id", "cb1");
      const target = document.createElement("pre");
      wrapper.appendChild(target);

      const event = createKeyEvent("l", { ctrl: true, alt: true });
      handleCodeBlockLanguageCycle(event, target, codeBlocks);

      expect(codeBlocks.updateCodeBlockLanguage).toHaveBeenCalledWith("cb1", "yaml");
    });

    it("cycles text to markdown", () => {
      const blocks = new Map([["cb1", { id: "cb1", content: "", language: "text" }]]);
      const codeBlocks = createMockCodeBlocks(blocks);

      const wrapper = document.createElement("div");
      wrapper.setAttribute("data-code-block-id", "cb1");
      const target = document.createElement("pre");
      wrapper.appendChild(target);

      const event = createKeyEvent("l", { ctrl: true, alt: true });
      handleCodeBlockLanguageCycle(event, target, codeBlocks);

      expect(codeBlocks.updateCodeBlockLanguage).toHaveBeenCalledWith("cb1", "markdown");
    });

    it("cycles markdown to text", () => {
      const blocks = new Map([["cb1", { id: "cb1", content: "", language: "markdown" }]]);
      const codeBlocks = createMockCodeBlocks(blocks);

      const wrapper = document.createElement("div");
      wrapper.setAttribute("data-code-block-id", "cb1");
      const target = document.createElement("pre");
      wrapper.appendChild(target);

      const event = createKeyEvent("l", { ctrl: true, alt: true });
      handleCodeBlockLanguageCycle(event, target, codeBlocks);

      expect(codeBlocks.updateCodeBlockLanguage).toHaveBeenCalledWith("cb1", "text");
    });

    it("does not cycle for languages outside known groups", () => {
      const blocks = new Map([["cb1", { id: "cb1", content: "", language: "python" }]]);
      const codeBlocks = createMockCodeBlocks(blocks);

      const wrapper = document.createElement("div");
      wrapper.setAttribute("data-code-block-id", "cb1");
      const target = document.createElement("pre");
      wrapper.appendChild(target);

      const event = createKeyEvent("l", { ctrl: true, alt: true });
      handleCodeBlockLanguageCycle(event, target, codeBlocks);

      expect(codeBlocks.updateCodeBlockLanguage).not.toHaveBeenCalled();
    });

    it("defaults to yaml when language is empty", () => {
      const blocks = new Map([["cb1", { id: "cb1", content: "", language: "" }]]);
      const codeBlocks = createMockCodeBlocks(blocks);

      const wrapper = document.createElement("div");
      wrapper.setAttribute("data-code-block-id", "cb1");
      const target = document.createElement("pre");
      wrapper.appendChild(target);

      const event = createKeyEvent("l", { ctrl: true, alt: true });
      handleCodeBlockLanguageCycle(event, target, codeBlocks);

      // Empty language defaults to "yaml", which cycles to "json"
      expect(codeBlocks.updateCodeBlockLanguage).toHaveBeenCalledWith("cb1", "json");
    });

    it("does nothing when target has no code block wrapper", () => {
      const codeBlocks = createMockCodeBlocks(new Map());
      const target = document.createElement("pre");

      const event = createKeyEvent("l", { ctrl: true, alt: true });
      handleCodeBlockLanguageCycle(event, target, codeBlocks);

      expect(codeBlocks.updateCodeBlockLanguage).not.toHaveBeenCalled();
    });

    it("does nothing when target is null", () => {
      const codeBlocks = createMockCodeBlocks(new Map());
      const event = createKeyEvent("l", { ctrl: true, alt: true });

      handleCodeBlockLanguageCycle(event, null, codeBlocks);

      expect(codeBlocks.updateCodeBlockLanguage).not.toHaveBeenCalled();
    });

    it("does nothing when state is not found for the code block id", () => {
      const codeBlocks = createMockCodeBlocks(new Map());

      const wrapper = document.createElement("div");
      wrapper.setAttribute("data-code-block-id", "cb-missing");
      const target = document.createElement("pre");
      wrapper.appendChild(target);

      const event = createKeyEvent("l", { ctrl: true, alt: true });
      handleCodeBlockLanguageCycle(event, target, codeBlocks);

      expect(codeBlocks.updateCodeBlockLanguage).not.toHaveBeenCalled();
    });

    it("handles uppercase L key", () => {
      const blocks = new Map([["cb1", { id: "cb1", content: "", language: "yaml" }]]);
      const codeBlocks = createMockCodeBlocks(blocks);

      const wrapper = document.createElement("div");
      wrapper.setAttribute("data-code-block-id", "cb1");
      const target = document.createElement("pre");
      wrapper.appendChild(target);

      const event = createKeyEvent("L", { ctrl: true, alt: true });
      handleCodeBlockLanguageCycle(event, target, codeBlocks);

      expect(codeBlocks.updateCodeBlockLanguage).toHaveBeenCalledWith("cb1", "json");
    });
  });
});
