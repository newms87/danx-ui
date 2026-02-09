import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useCodeBlocks } from "../useCodeBlocks";
import { useMarkdownSelection } from "../useMarkdownSelection";
import { createTestEditor, TestEditorResult } from "./editorTestUtils";
import { htmlToMarkdown } from "../../../shared/markdown/htmlToMarkdown";

describe("useCodeBlocks", () => {
  let editor: TestEditorResult;
  let onContentChange: ReturnType<typeof vi.fn>;

  afterEach(() => {
    if (editor) {
      editor.destroy();
    }
  });

  /**
   * Create code blocks composable with test editor
   */
  function createCodeBlocks() {
    const selection = useMarkdownSelection(editor.contentRef);
    return useCodeBlocks({
      contentRef: editor.contentRef,
      selection,
      onContentChange: onContentChange as unknown as () => void,
    });
  }

  /**
   * Helper to verify code block wrapper structure
   */
  function expectCodeBlockWrapper(content: string, language = "") {
    const wrapper = editor.container.querySelector(".code-block-wrapper");
    expect(wrapper).not.toBeNull();
    expect(wrapper?.getAttribute("contenteditable")).toBe("false");
    expect(wrapper?.hasAttribute("data-code-block-id")).toBe(true);

    const mountPoint = wrapper?.querySelector(".code-viewer-mount-point");
    expect(mountPoint).not.toBeNull();
    expect(mountPoint?.getAttribute("data-content")).toBe(content);
    expect(mountPoint?.getAttribute("data-language")).toBe(language);
  }

  /**
   * Create a code block wrapper in the editor DOM and register it in state.
   * Returns the code block ID.
   */
  function createWrapperCodeBlock(
    codeBlocks: ReturnType<typeof createCodeBlocks>,
    content: string,
    language = ""
  ): string {
    const id = `cb-test-${Math.random().toString(36).slice(2)}`;
    const wrapper = document.createElement("div");
    wrapper.className = "code-block-wrapper";
    wrapper.setAttribute("contenteditable", "false");
    wrapper.setAttribute("data-code-block-id", id);

    const mountPoint = document.createElement("div");
    mountPoint.className = "code-viewer-mount-point";
    mountPoint.setAttribute("data-content", content);
    mountPoint.setAttribute("data-language", language);
    wrapper.appendChild(mountPoint);

    editor.container.innerHTML = "";
    editor.container.appendChild(wrapper);

    codeBlocks.registerCodeBlock(id, content, language);
    return id;
  }

  describe("toggleCodeBlock", () => {
    beforeEach(() => {
      onContentChange = vi.fn();
    });

    it("converts paragraph to code block", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(0, 5);

      codeBlocks.toggleCodeBlock();

      expectCodeBlockWrapper("Hello world");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("converts DIV to code block", () => {
      editor = createTestEditor("<div>Hello world</div>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(0, 0);

      codeBlocks.toggleCodeBlock();

      expectCodeBlockWrapper("Hello world");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("converts H1 to code block", () => {
      editor = createTestEditor("<h1>Hello world</h1>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(0, 0);

      codeBlocks.toggleCodeBlock();

      expectCodeBlockWrapper("Hello world");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("converts H2 to code block", () => {
      editor = createTestEditor("<h2>Hello world</h2>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(0, 0);

      codeBlocks.toggleCodeBlock();

      expectCodeBlockWrapper("Hello world");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("converts code block back to paragraph", () => {
      editor = createTestEditor("<p>placeholder</p>");
      const codeBlocks = createCodeBlocks();
      const id = createWrapperCodeBlock(codeBlocks, "Hello world");

      // Set cursor inside the wrapper
      const wrapper = editor.container.querySelector(`[data-code-block-id="${id}"]`);
      if (wrapper) {
        const range = document.createRange();
        range.selectNodeContents(wrapper);
        range.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }

      codeBlocks.toggleCodeBlock();

      expect(editor.getHtml()).toBe("<p>Hello world</p>");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("preserves content when toggling to code block", () => {
      editor = createTestEditor("<p>const x = 1;</p>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(0, 0);

      codeBlocks.toggleCodeBlock();

      expectCodeBlockWrapper("const x = 1;");
    });

    it("preserves content when toggling from code block", () => {
      editor = createTestEditor("<p>placeholder</p>");
      const codeBlocks = createCodeBlocks();
      const id = createWrapperCodeBlock(codeBlocks, "const x = 1;");

      // Set cursor inside the wrapper
      const wrapper = editor.container.querySelector(`[data-code-block-id="${id}"]`);
      if (wrapper) {
        const range = document.createRange();
        range.selectNodeContents(wrapper);
        range.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }

      codeBlocks.toggleCodeBlock();

      expect(editor.getHtml()).toBe("<p>const x = 1;</p>");
    });

    it("handles empty paragraph", () => {
      editor = createTestEditor("<p></p>");
      const codeBlocks = createCodeBlocks();
      const p = editor.getBlock(0);
      if (p) {
        const range = document.createRange();
        range.selectNodeContents(p);
        range.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }

      codeBlocks.toggleCodeBlock();

      expectCodeBlockWrapper("");
    });

    it("does not convert list items directly", () => {
      editor = createTestEditor("<ul><li>List item</li></ul>");
      const codeBlocks = createCodeBlocks();
      const li = editor.container.querySelector("li");
      if (li?.firstChild) {
        editor.setCursor(li.firstChild, 0);
      }

      codeBlocks.toggleCodeBlock();

      // Should remain a list (list items require conversion to paragraph first)
      expect(editor.getHtml()).toBe("<ul><li>List item</li></ul>");
      expect(onContentChange).not.toHaveBeenCalled();
    });
  });

  describe("checkAndConvertCodeBlockPattern", () => {
    beforeEach(() => {
      onContentChange = vi.fn();
    });

    it("does not convert just ``` without language (requires language identifier)", () => {
      // Implementation intentionally requires at least one character in language identifier
      // to avoid triggering on just "```" before user finishes typing the language
      editor = createTestEditor("<p>```</p>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(0, 3);

      const result = codeBlocks.checkAndConvertCodeBlockPattern();

      expect(result).toBe(false);
      expect(editor.getHtml()).toBe("<p>```</p>");
      expect(onContentChange).not.toHaveBeenCalled();
    });

    it("converts ```javascript to code block with language", () => {
      editor = createTestEditor("<p>```javascript</p>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(0, 13);

      const result = codeBlocks.checkAndConvertCodeBlockPattern();

      expect(result).toBe(true);
      expectCodeBlockWrapper("", "javascript");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("converts ```python to code block with language", () => {
      editor = createTestEditor("<p>```python</p>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(0, 9);

      const result = codeBlocks.checkAndConvertCodeBlockPattern();

      expect(result).toBe(true);
      expectCodeBlockWrapper("", "python");
    });

    it("converts ```typescript to code block with language", () => {
      editor = createTestEditor("<p>```typescript</p>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(0, 13);

      const result = codeBlocks.checkAndConvertCodeBlockPattern();

      expect(result).toBe(true);
      expectCodeBlockWrapper("", "typescript");
    });

    it("returns false when no pattern is present", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(0, 5);

      const result = codeBlocks.checkAndConvertCodeBlockPattern();

      expect(result).toBe(false);
      expect(editor.getHtml()).toBe("<p>Hello world</p>");
      expect(onContentChange).not.toHaveBeenCalled();
    });

    it("returns false for incomplete `` pattern", () => {
      editor = createTestEditor("<p>``</p>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(0, 2);

      const result = codeBlocks.checkAndConvertCodeBlockPattern();

      expect(result).toBe(false);
      expect(editor.getHtml()).toBe("<p>``</p>");
    });

    it("does not convert if already in code block", () => {
      editor = createTestEditor("<pre><code>```javascript</code></pre>");
      const codeBlocks = createCodeBlocks();
      const code = editor.container.querySelector("code");
      if (code?.firstChild) {
        editor.setCursor(code.firstChild, 13);
      }

      const result = codeBlocks.checkAndConvertCodeBlockPattern();

      expect(result).toBe(false);
      expect(editor.getHtml()).toBe("<pre><code>```javascript</code></pre>");
      expect(onContentChange).not.toHaveBeenCalled();
    });

    it("converts heading with code fence pattern", () => {
      editor = createTestEditor("<h1>```javascript</h1>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(0, 13);

      const result = codeBlocks.checkAndConvertCodeBlockPattern();

      // Headings ARE convertible blocks, so this should convert
      expect(result).toBe(true);
      expectCodeBlockWrapper("", "javascript");
    });

    it("converts DIV elements (browser default)", () => {
      editor = createTestEditor("<div>```rust</div>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(0, 7);

      const result = codeBlocks.checkAndConvertCodeBlockPattern();

      expect(result).toBe(true);
      expectCodeBlockWrapper("", "rust");
    });

    it("does not convert list items", () => {
      editor = createTestEditor("<ul><li>```javascript</li></ul>");
      const codeBlocks = createCodeBlocks();
      const li = editor.container.querySelector("li");
      if (li?.firstChild) {
        editor.setCursor(li.firstChild, 13);
      }

      const result = codeBlocks.checkAndConvertCodeBlockPattern();

      expect(result).toBe(false);
      expect(editor.getHtml()).toBe("<ul><li>```javascript</li></ul>");
      expect(onContentChange).not.toHaveBeenCalled();
    });

    it("creates wrapper structure after conversion", () => {
      editor = createTestEditor("<p>```javascript</p>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(0, 13);

      codeBlocks.checkAndConvertCodeBlockPattern();

      // Verify wrapper structure is created
      expectCodeBlockWrapper("", "javascript");

      // Verify the wrapper has an id that can be used for mounting
      const wrapper = editor.container.querySelector(".code-block-wrapper");
      expect(wrapper?.getAttribute("data-code-block-id")).toBeTruthy();
    });

    it("cursor anchor is stripped during markdown conversion", () => {
      editor = createTestEditor("<p>```javascript</p>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(0, 13);

      codeBlocks.checkAndConvertCodeBlockPattern();

      // Verify the cursor anchor is stripped during markdown conversion
      const markdown = htmlToMarkdown(editor.container);

      // The markdown should have empty code block (no zero-width space)
      expect(markdown).toBe("```javascript\n\n```");
    });
  });

  describe("isInCodeBlock", () => {
    beforeEach(() => {
      onContentChange = vi.fn();
    });

    it("returns true when cursor is in code block wrapper", () => {
      editor = createTestEditor("<p>placeholder</p>");
      const codeBlocks = createCodeBlocks();
      createWrapperCodeBlock(codeBlocks, "Hello world");

      // Set cursor inside the wrapper
      const wrapper = editor.container.querySelector(".code-block-wrapper");
      if (wrapper) {
        const range = document.createRange();
        range.selectNodeContents(wrapper);
        range.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }

      expect(codeBlocks.isInCodeBlock()).toBe(true);
    });

    it("returns false when cursor is in paragraph", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(0, 5);

      expect(codeBlocks.isInCodeBlock()).toBe(false);
    });

    it("returns false when cursor is in heading", () => {
      editor = createTestEditor("<h1>Hello world</h1>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(0, 5);

      expect(codeBlocks.isInCodeBlock()).toBe(false);
    });

    it("returns false when cursor is in list", () => {
      editor = createTestEditor("<ul><li>Hello world</li></ul>");
      const codeBlocks = createCodeBlocks();
      const li = editor.container.querySelector("li");
      if (li?.firstChild) {
        editor.setCursor(li.firstChild, 5);
      }

      expect(codeBlocks.isInCodeBlock()).toBe(false);
    });

    it("returns false when no selection", () => {
      editor = createTestEditor("<pre><code>Hello world</code></pre>");
      const codeBlocks = createCodeBlocks();
      window.getSelection()?.removeAllRanges();

      expect(codeBlocks.isInCodeBlock()).toBe(false);
    });
  });

  describe("getCurrentCodeBlockLanguage", () => {
    beforeEach(() => {
      onContentChange = vi.fn();
    });

    it("returns language when in code block with language", () => {
      editor = createTestEditor("<p>placeholder</p>");
      const codeBlocks = createCodeBlocks();
      createWrapperCodeBlock(codeBlocks, "const x = 1;", "javascript");

      const wrapper = editor.container.querySelector(".code-block-wrapper");
      if (wrapper) {
        const range = document.createRange();
        range.selectNodeContents(wrapper);
        range.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }

      expect(codeBlocks.getCurrentCodeBlockLanguage()).toBe("javascript");
    });

    it("returns empty string when in code block without language", () => {
      editor = createTestEditor("<p>placeholder</p>");
      const codeBlocks = createCodeBlocks();
      createWrapperCodeBlock(codeBlocks, "const x = 1;", "");

      const wrapper = editor.container.querySelector(".code-block-wrapper");
      if (wrapper) {
        const range = document.createRange();
        range.selectNodeContents(wrapper);
        range.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }

      expect(codeBlocks.getCurrentCodeBlockLanguage()).toBe("");
    });

    it("returns null when not in code block", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(0, 5);

      expect(codeBlocks.getCurrentCodeBlockLanguage()).toBeNull();
    });

    it("returns correct language for various languages", () => {
      const languages = ["python", "typescript", "rust", "go", "java", "css", "html"];

      for (const lang of languages) {
        editor = createTestEditor("<p>placeholder</p>");
        const codeBlocks = createCodeBlocks();
        createWrapperCodeBlock(codeBlocks, "code", lang);

        const wrapper = editor.container.querySelector(".code-block-wrapper");
        if (wrapper) {
          const range = document.createRange();
          range.selectNodeContents(wrapper);
          range.collapse(true);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        }

        expect(codeBlocks.getCurrentCodeBlockLanguage()).toBe(lang);
        editor.destroy();
      }
    });
  });

  describe("setCodeBlockLanguage", () => {
    beforeEach(() => {
      onContentChange = vi.fn();
    });

    it("sets language on code block without existing language", () => {
      editor = createTestEditor("<p>placeholder</p>");
      const codeBlocks = createCodeBlocks();
      const id = createWrapperCodeBlock(codeBlocks, "const x = 1;", "");

      const wrapper = editor.container.querySelector(`[data-code-block-id="${id}"]`);
      if (wrapper) {
        const range = document.createRange();
        range.selectNodeContents(wrapper);
        range.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }

      codeBlocks.setCodeBlockLanguage("javascript");

      const state = codeBlocks.getCodeBlockById(id);
      expect(state?.language).toBe("javascript");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("replaces existing language", () => {
      editor = createTestEditor("<p>placeholder</p>");
      const codeBlocks = createCodeBlocks();
      const id = createWrapperCodeBlock(codeBlocks, "const x = 1;", "javascript");

      const wrapper = editor.container.querySelector(`[data-code-block-id="${id}"]`);
      if (wrapper) {
        const range = document.createRange();
        range.selectNodeContents(wrapper);
        range.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }

      codeBlocks.setCodeBlockLanguage("typescript");

      const state = codeBlocks.getCodeBlockById(id);
      expect(state?.language).toBe("typescript");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("removes language when set to empty string", () => {
      editor = createTestEditor("<p>placeholder</p>");
      const codeBlocks = createCodeBlocks();
      const id = createWrapperCodeBlock(codeBlocks, "const x = 1;", "javascript");

      const wrapper = editor.container.querySelector(`[data-code-block-id="${id}"]`);
      if (wrapper) {
        const range = document.createRange();
        range.selectNodeContents(wrapper);
        range.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }

      codeBlocks.setCodeBlockLanguage("");

      const state = codeBlocks.getCodeBlockById(id);
      expect(state?.language).toBe("");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("does nothing when not in code block", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(0, 5);

      codeBlocks.setCodeBlockLanguage("javascript");

      expect(editor.getHtml()).toBe("<p>Hello world</p>");
      expect(onContentChange).not.toHaveBeenCalled();
    });
  });

  describe("handleCodeBlockEnter", () => {
    beforeEach(() => {
      onContentChange = vi.fn();
    });

    it("returns false when not in a code block", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(0, 5);

      const handled = codeBlocks.handleCodeBlockEnter();

      expect(handled).toBe(false);
      expect(onContentChange).not.toHaveBeenCalled();
    });

    it("returns false for wrapper-based code blocks (CodeViewer handles Enter internally)", () => {
      editor = createTestEditor("<p>placeholder</p>");
      const codeBlocks = createCodeBlocks();
      createWrapperCodeBlock(codeBlocks, "some code");

      const wrapper = editor.container.querySelector(".code-block-wrapper");
      if (wrapper) {
        const range = document.createRange();
        range.selectNodeContents(wrapper);
        range.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }

      const handled = codeBlocks.handleCodeBlockEnter();

      expect(handled).toBe(false);
      expect(onContentChange).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    beforeEach(() => {
      onContentChange = vi.fn();
    });

    it("handles empty code block wrapper", () => {
      editor = createTestEditor("<p>placeholder</p>");
      const codeBlocks = createCodeBlocks();
      const id = createWrapperCodeBlock(codeBlocks, "");

      const wrapper = editor.container.querySelector(`[data-code-block-id="${id}"]`);
      if (wrapper) {
        const range = document.createRange();
        range.selectNodeContents(wrapper);
        range.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }

      codeBlocks.toggleCodeBlock();

      expect(editor.getHtml()).toBe("<p></p>");
    });

    it("handles multiple blocks - only affects current block", () => {
      editor = createTestEditor("<p>First</p><p>Second</p><p>Third</p>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(1, 0); // Cursor in second block

      codeBlocks.toggleCodeBlock();

      // Verify only the second block was converted
      const html = editor.getHtml();
      expect(html).toContain("<p>First</p>");
      expect(html).toContain("<p>Third</p>");
      expect(html).toContain("code-block-wrapper");

      // Verify the wrapper has the correct content
      const mountPoint = editor.container.querySelector(".code-viewer-mount-point");
      expect(mountPoint?.getAttribute("data-content")).toBe("Second");
    });

    it("handles multiline content in code block", () => {
      editor = createTestEditor("<p>Line 1\nLine 2\nLine 3</p>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(0, 0);

      codeBlocks.toggleCodeBlock();

      // Content should be preserved in the data-content attribute
      const mountPoint = editor.container.querySelector(".code-viewer-mount-point");
      expect(mountPoint?.getAttribute("data-content")).toBe("Line 1\nLine 2\nLine 3");
    });
  });
});
