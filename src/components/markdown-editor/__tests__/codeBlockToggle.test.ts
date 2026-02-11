import { describe, it, expect, vi, afterEach } from "vitest";
import { ref } from "vue";
import { toggleCodeBlock, checkAndConvertCodeBlockPattern } from "../codeBlockToggle";
import type { CodeBlockToggleDeps } from "../codeBlockToggle";
import type { CodeBlockState } from "../useCodeBlocks";
import { useMarkdownSelection } from "../useMarkdownSelection";
import { createTestEditor, TestEditorResult } from "./editorTestUtils";

function createDeps(
  editor: TestEditorResult,
  codeBlocks?: Map<string, CodeBlockState>
): CodeBlockToggleDeps {
  const contentRef = editor.contentRef;
  const selection = useMarkdownSelection(contentRef);
  return {
    contentRef,
    selection,
    codeBlocks: codeBlocks ?? new Map(),
    pendingFocusIds: new Set(),
    onContentChange: vi.fn(),
  };
}

describe("codeBlockToggle", () => {
  let editor: TestEditorResult;

  afterEach(() => {
    if (editor) editor.destroy();
  });

  describe("toggleCodeBlock", () => {
    it("does nothing when contentRef is null", () => {
      editor = createTestEditor("<p>Hello</p>");
      const deps = createDeps(editor);
      deps.contentRef = ref<HTMLElement | null>(null);

      toggleCodeBlock(deps);
      expect(deps.onContentChange).not.toHaveBeenCalled();
    });

    it("converts existing code block back to paragraph", () => {
      editor = createTestEditor('<div data-code-block-id="cb1"><p>code</p></div>');
      const codeBlocks = new Map<string, CodeBlockState>([
        ["cb1", { id: "cb1", content: "code", language: "js" }],
      ]);
      const deps = createDeps(editor, codeBlocks);

      const p = editor.container.querySelector("p")!;
      editor.setCursor(p.firstChild!, 2);

      toggleCodeBlock(deps);

      expect(deps.onContentChange).toHaveBeenCalled();
      expect(editor.container.querySelector("[data-code-block-id]")).toBeNull();
    });

    it("converts paragraph to code block wrapper", () => {
      editor = createTestEditor("<p>some code here</p>");
      const deps = createDeps(editor);
      editor.setCursorInBlock(0, 5);

      toggleCodeBlock(deps);

      expect(deps.onContentChange).toHaveBeenCalled();
      const wrapper = editor.container.querySelector("[data-code-block-id]");
      expect(wrapper).not.toBeNull();
      expect(deps.codeBlocks.size).toBe(1);
    });

    it("does nothing when target block is an LI", () => {
      editor = createTestEditor("<ul><li>list item</li></ul>");
      const deps = createDeps(editor);

      const li = editor.container.querySelector("li")!;
      editor.setCursor(li.firstChild!, 2);

      toggleCodeBlock(deps);

      expect(deps.onContentChange).not.toHaveBeenCalled();
    });

    it("does nothing when no target block is found", () => {
      editor = createTestEditor("<p>Text</p>");
      const deps = createDeps(editor);

      // Remove all selections
      window.getSelection()?.removeAllRanges();

      toggleCodeBlock(deps);

      expect(deps.onContentChange).not.toHaveBeenCalled();
    });

    it("converts heading to code block", () => {
      editor = createTestEditor("<h2>Heading</h2>");
      const deps = createDeps(editor);
      editor.setCursorInBlock(0, 3);

      toggleCodeBlock(deps);

      expect(deps.onContentChange).toHaveBeenCalled();
      expect(editor.container.querySelector("[data-code-block-id]")).not.toBeNull();
    });

    it("adds the new code block id to pendingFocusIds", () => {
      editor = createTestEditor("<p>focus me</p>");
      const deps = createDeps(editor);
      editor.setCursorInBlock(0, 3);

      toggleCodeBlock(deps);

      expect(deps.pendingFocusIds.size).toBe(1);
    });

    it("stores content and empty language in codeBlocks map", () => {
      editor = createTestEditor("<p>my code content</p>");
      const deps = createDeps(editor);
      editor.setCursorInBlock(0, 3);

      toggleCodeBlock(deps);

      const entries = Array.from(deps.codeBlocks.values());
      expect(entries).toHaveLength(1);
      expect(entries[0]!.content).toBe("my code content");
      expect(entries[0]!.language).toBe("");
    });
  });

  describe("checkAndConvertCodeBlockPattern", () => {
    it("returns false when contentRef is null", () => {
      editor = createTestEditor("<p>```js</p>");
      const deps = createDeps(editor);
      deps.contentRef = ref<HTMLElement | null>(null);

      expect(checkAndConvertCodeBlockPattern(deps)).toBe(false);
    });

    it("returns false when no target block is found", () => {
      editor = createTestEditor("<p>Text</p>");
      const deps = createDeps(editor);
      window.getSelection()?.removeAllRanges();

      expect(checkAndConvertCodeBlockPattern(deps)).toBe(false);
    });

    it("returns false when block is not convertible", () => {
      editor = createTestEditor("<ul><li>```js</li></ul>");
      const deps = createDeps(editor);

      const li = editor.container.querySelector("li")!;
      editor.setCursor(li.firstChild!, 5);

      expect(checkAndConvertCodeBlockPattern(deps)).toBe(false);
    });

    it("returns false when text does not match code fence pattern", () => {
      editor = createTestEditor("<p>normal text</p>");
      const deps = createDeps(editor);
      editor.setCursorInBlock(0, 5);

      expect(checkAndConvertCodeBlockPattern(deps)).toBe(false);
    });

    it("returns false when text is just triple backticks without language", () => {
      editor = createTestEditor("<p>```</p>");
      const deps = createDeps(editor);
      editor.setCursorInBlock(0, 3);

      expect(checkAndConvertCodeBlockPattern(deps)).toBe(false);
    });

    it("converts code fence pattern with language to code block", () => {
      editor = createTestEditor("<p>```javascript</p>");
      const deps = createDeps(editor);
      editor.setCursorInBlock(0, 13);

      const result = checkAndConvertCodeBlockPattern(deps);

      expect(result).toBe(true);
      expect(deps.onContentChange).toHaveBeenCalled();
      expect(deps.codeBlocks.size).toBe(1);

      const entry = Array.from(deps.codeBlocks.values())[0]!;
      expect(entry.language).toBe("javascript");
      expect(entry.content).toBe("");
    });

    it("adds the new code block id to pendingFocusIds", () => {
      editor = createTestEditor("<p>```python</p>");
      const deps = createDeps(editor);
      editor.setCursorInBlock(0, 9);

      checkAndConvertCodeBlockPattern(deps);

      expect(deps.pendingFocusIds.size).toBe(1);
    });

    it("replaces the paragraph with a code block wrapper in the DOM", () => {
      editor = createTestEditor("<p>```yaml</p>");
      const deps = createDeps(editor);
      editor.setCursorInBlock(0, 7);

      checkAndConvertCodeBlockPattern(deps);

      expect(editor.container.querySelector("p")).toBeNull();
      expect(editor.container.querySelector("[data-code-block-id]")).not.toBeNull();
    });
  });
});
