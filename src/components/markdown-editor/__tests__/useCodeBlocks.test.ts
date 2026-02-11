import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useCodeBlocks } from "../useCodeBlocks";
import { useMarkdownSelection } from "../useMarkdownSelection";
import { createTestEditor, TestEditorResult } from "./editorTestUtils";
import { htmlToMarkdown } from "../../../shared/markdown/htmlToMarkdown";
import * as markdownModule from "../../../shared/markdown";

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

    it("toggleCodeBlock does nothing when contentRef is null", () => {
      editor = createTestEditor("<p>Hello</p>");
      const codeBlocks = createCodeBlocks();
      editor.contentRef.value = null;

      codeBlocks.toggleCodeBlock();
      expect(onContentChange).not.toHaveBeenCalled();
    });

    it("checkAndConvertCodeBlockPattern does nothing when contentRef is null", () => {
      editor = createTestEditor("<p>```js</p>");
      const codeBlocks = createCodeBlocks();
      editor.contentRef.value = null;

      expect(codeBlocks.checkAndConvertCodeBlockPattern()).toBe(false);
    });

    it("toggleCodeBlock returns early when no target block found (line 323)", () => {
      // Use bare text node with no block parent to make getTargetBlock return null
      editor = createTestEditor("");
      editor.container.innerHTML = "";
      const textNode = document.createTextNode("bare text");
      editor.container.appendChild(textNode);
      const codeBlocks = createCodeBlocks();

      // Place cursor in bare text node
      editor.setCursor(textNode, 3);

      codeBlocks.toggleCodeBlock();
      expect(onContentChange).not.toHaveBeenCalled();
    });

    it("toggleCodeBlock does not convert non-convertible block (line 333)", () => {
      // TABLE is not a convertible block
      editor = createTestEditor("<table><tr><td>Cell</td></tr></table>");
      const codeBlocks = createCodeBlocks();
      const td = editor.container.querySelector("td")!;
      editor.setCursor(td.firstChild!, 0);

      codeBlocks.toggleCodeBlock();
      // Should not convert the table
      expect(editor.container.querySelector("table")).not.toBeNull();
      expect(editor.container.querySelector(".code-block-wrapper")).toBeNull();
    });

    it("checkAndConvertCodeBlockPattern returns false when no target block (line 370)", () => {
      // Bare text node - getTargetBlock returns null
      editor = createTestEditor("");
      editor.container.innerHTML = "";
      const textNode = document.createTextNode("```javascript");
      editor.container.appendChild(textNode);
      const codeBlocks = createCodeBlocks();
      editor.setCursor(textNode, 13);

      expect(codeBlocks.checkAndConvertCodeBlockPattern()).toBe(false);
    });

    it("checkAndConvertCodeBlockPattern handles block with empty textContent (line 370)", () => {
      editor = createTestEditor("<p></p>");
      const codeBlocks = createCodeBlocks();
      const p = editor.getBlock(0)!;
      const range = document.createRange();
      range.selectNodeContents(p);
      range.collapse(true);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);

      // Empty text content doesn't match code fence pattern
      expect(codeBlocks.checkAndConvertCodeBlockPattern()).toBe(false);
    });
  });

  describe("state management", () => {
    beforeEach(() => {
      onContentChange = vi.fn();
    });

    it("updateCodeBlockContent updates state and notifies", () => {
      editor = createTestEditor("<p>placeholder</p>");
      const codeBlocks = createCodeBlocks();
      const id = createWrapperCodeBlock(codeBlocks, "old content", "js");

      codeBlocks.updateCodeBlockContent(id, "new content");

      expect(codeBlocks.getCodeBlockById(id)?.content).toBe("new content");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("updateCodeBlockContent does nothing for unknown ID", () => {
      editor = createTestEditor("<p>placeholder</p>");
      const codeBlocks = createCodeBlocks();

      codeBlocks.updateCodeBlockContent("nonexistent", "content");
      expect(onContentChange).not.toHaveBeenCalled();
    });

    it("updateCodeBlockLanguage updates state and notifies", () => {
      editor = createTestEditor("<p>placeholder</p>");
      const codeBlocks = createCodeBlocks();
      const id = createWrapperCodeBlock(codeBlocks, "code", "js");

      codeBlocks.updateCodeBlockLanguage(id, "python");

      expect(codeBlocks.getCodeBlockById(id)?.language).toBe("python");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("updateCodeBlockLanguage does nothing for unknown ID", () => {
      editor = createTestEditor("<p>placeholder</p>");
      const codeBlocks = createCodeBlocks();

      codeBlocks.updateCodeBlockLanguage("nonexistent", "python");
      expect(onContentChange).not.toHaveBeenCalled();
    });

    it("removeCodeBlock removes from state and DOM", () => {
      editor = createTestEditor("<p>placeholder</p>");
      const codeBlocks = createCodeBlocks();
      const id = createWrapperCodeBlock(codeBlocks, "code", "js");

      codeBlocks.removeCodeBlock(id);

      expect(codeBlocks.getCodeBlockById(id)).toBeUndefined();
      expect(editor.container.querySelector(`[data-code-block-id="${id}"]`)).toBeNull();
      expect(onContentChange).toHaveBeenCalled();
    });

    it("removeCodeBlock handles missing DOM wrapper gracefully", () => {
      editor = createTestEditor("<p>placeholder</p>");
      const codeBlocks = createCodeBlocks();
      codeBlocks.registerCodeBlock("orphan-id", "content", "js");

      codeBlocks.removeCodeBlock("orphan-id");

      expect(codeBlocks.getCodeBlockById("orphan-id")).toBeUndefined();
      expect(onContentChange).toHaveBeenCalled();
    });

    it("removeCodeBlock handles null contentRef", () => {
      editor = createTestEditor("<p>placeholder</p>");
      const codeBlocks = createCodeBlocks();
      codeBlocks.registerCodeBlock("test-id", "content", "js");
      editor.contentRef.value = null;

      codeBlocks.removeCodeBlock("test-id");

      expect(codeBlocks.getCodeBlockById("test-id")).toBeUndefined();
      expect(onContentChange).toHaveBeenCalled();
    });

    it("getCurrentCodeBlockId returns null when not in code block", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(0, 5);

      expect(codeBlocks.getCurrentCodeBlockId()).toBeNull();
    });

    it("getCurrentCodeBlockId returns ID when in code block", () => {
      editor = createTestEditor("<p>placeholder</p>");
      const codeBlocks = createCodeBlocks();
      const id = createWrapperCodeBlock(codeBlocks, "code", "js");

      const wrapper = editor.container.querySelector(`[data-code-block-id="${id}"]`);
      if (wrapper) {
        const range = document.createRange();
        range.selectNodeContents(wrapper);
        range.collapse(true);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
      }

      expect(codeBlocks.getCurrentCodeBlockId()).toBe(id);
    });

    it("getCodeBlocks returns the reactive map", () => {
      editor = createTestEditor("<p>placeholder</p>");
      const codeBlocks = createCodeBlocks();
      codeBlocks.registerCodeBlock("cb1", "a", "js");
      codeBlocks.registerCodeBlock("cb2", "b", "py");

      const map = codeBlocks.getCodeBlocks();
      expect(map.size).toBe(2);
    });

    it("handleCodeBlockMounted focuses pending code block", () => {
      editor = createTestEditor("<p>some content</p>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(0, 0);

      // Toggle to create code block (which adds to pendingFocusIds)
      codeBlocks.toggleCodeBlock();

      // Get wrapper
      const wrapper = editor.container.querySelector(".code-block-wrapper") as HTMLElement;
      const id = wrapper?.getAttribute("data-code-block-id");

      // Create a contenteditable pre inside wrapper to simulate CodeViewer
      const pre = document.createElement("pre");
      pre.setAttribute("contenteditable", "true");
      pre.textContent = "code";
      wrapper?.querySelector(".code-viewer-mount-point")?.appendChild(pre);

      // Call handleCodeBlockMounted - should focus the pre
      if (id) {
        codeBlocks.handleCodeBlockMounted(id, wrapper);
      }
    });

    it("handleCodeBlockMounted does nothing for non-pending blocks", () => {
      editor = createTestEditor("<p>placeholder</p>");
      const codeBlocks = createCodeBlocks();
      const id = createWrapperCodeBlock(codeBlocks, "code", "js");

      const wrapper = editor.container.querySelector(`[data-code-block-id="${id}"]`) as HTMLElement;
      // This should not throw or do anything since id is not pending
      codeBlocks.handleCodeBlockMounted(id, wrapper);
    });

    it("getCurrentCodeBlockLanguage returns null when wrapper has no id attr", () => {
      editor = createTestEditor("<p>Hello</p>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(0, 0);

      expect(codeBlocks.getCurrentCodeBlockLanguage()).toBeNull();
    });

    it("getCurrentCodeBlockLanguage returns null when wrapper has empty id (line 284)", () => {
      editor = createTestEditor("<p>placeholder</p>");
      const codeBlocks = createCodeBlocks();

      editor.container.innerHTML = "";
      const wrapper = document.createElement("div");
      wrapper.setAttribute("contenteditable", "false");
      wrapper.setAttribute("data-code-block-id", ""); // Empty id
      const mountPoint = document.createElement("div");
      wrapper.appendChild(mountPoint);
      editor.container.appendChild(wrapper);

      const range = document.createRange();
      range.selectNodeContents(mountPoint);
      range.collapse(true);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);

      expect(codeBlocks.getCurrentCodeBlockLanguage()).toBeNull();
    });

    it("getCurrentCodeBlockLanguage returns empty string when state not found (line 287)", () => {
      editor = createTestEditor("<p>placeholder</p>");
      const codeBlocks = createCodeBlocks();

      editor.container.innerHTML = "";
      const wrapper = document.createElement("div");
      wrapper.setAttribute("contenteditable", "false");
      wrapper.setAttribute("data-code-block-id", "cb-unknown");
      const mountPoint = document.createElement("div");
      wrapper.appendChild(mountPoint);
      editor.container.appendChild(wrapper);

      // Place cursor inside wrapper - do NOT register "cb-unknown" in state
      const range = document.createRange();
      range.selectNodeContents(mountPoint);
      range.collapse(true);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);

      // state is undefined, so state?.language is undefined, ?? "" returns ""
      expect(codeBlocks.getCurrentCodeBlockLanguage()).toBe("");
    });

    it("setCodeBlockLanguage does nothing when not in code block", () => {
      editor = createTestEditor("<p>Hello</p>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(0, 0);

      codeBlocks.setCodeBlockLanguage("python");
      expect(onContentChange).not.toHaveBeenCalled();
    });

    it("getCodeBlockWrapper returns null when getCurrentBlock returns null (line 87)", () => {
      editor = createTestEditor("<p>Hello</p>");
      const codeBlocks = createCodeBlocks();

      // Clear selection so getCurrentBlock returns null
      window.getSelection()?.removeAllRanges();

      expect(codeBlocks.isInCodeBlock()).toBe(false);
      expect(codeBlocks.getCurrentCodeBlockId()).toBeNull();
      expect(codeBlocks.getCurrentCodeBlockLanguage()).toBeNull();
    });

    it("setCodeBlockLanguage skips update when wrapper has empty id attr (line 298)", () => {
      // Create a wrapper with data-code-block-id="" (empty) so hasAttribute is true
      // but getAttribute returns "" (falsy), exercising the if(id) false branch
      editor = createTestEditor("<p>placeholder</p>");
      const codeBlocks = createCodeBlocks();

      editor.container.innerHTML = "";
      const wrapper = document.createElement("div");
      wrapper.className = "code-block-wrapper";
      wrapper.setAttribute("contenteditable", "false");
      wrapper.setAttribute("data-code-block-id", ""); // Empty id

      const mountPoint = document.createElement("div");
      wrapper.appendChild(mountPoint);
      editor.container.appendChild(wrapper);

      // Place cursor inside wrapper
      const range = document.createRange();
      range.selectNodeContents(mountPoint);
      range.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      // setCodeBlockLanguage finds wrapper but id is "" (falsy)
      codeBlocks.setCodeBlockLanguage("python");
      expect(onContentChange).not.toHaveBeenCalled();
    });

    it("toggleCodeBlock uses empty string when block.textContent is null (line 333)", () => {
      editor = createTestEditor("<p>Some text</p>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(0, 0);

      // Mock textContent to null on the block
      const block = editor.getBlock(0)!;
      Object.defineProperty(block, "textContent", {
        get: () => null,
        configurable: true,
      });

      codeBlocks.toggleCodeBlock();

      // The code block should be created with empty content
      const mountPoint = editor.container.querySelector(".code-viewer-mount-point");
      expect(mountPoint?.getAttribute("data-content")).toBe("");
      expect(onContentChange).toHaveBeenCalled();

      // Restore
      delete (block as unknown as Record<string, unknown>)["textContent"];
    });

    it("checkAndConvertCodeBlockPattern uses empty string when language is falsy (line 377)", () => {
      editor = createTestEditor("<p>```something</p>");
      const codeBlocks = createCodeBlocks();
      editor.setCursorInBlock(0, 12);

      // Mock detectCodeFenceStart to return pattern with empty language
      const spy = vi.spyOn(markdownModule, "detectCodeFenceStart").mockReturnValue({
        language: "",
      });

      const result = codeBlocks.checkAndConvertCodeBlockPattern();

      spy.mockRestore();
      expect(result).toBe(true);

      // Language should fall back to ""
      const wrapper = editor.container.querySelector(".code-block-wrapper");
      const id = wrapper?.getAttribute("data-code-block-id");
      expect(id).toBeTruthy();
      const state = codeBlocks.getCodeBlockById(id!);
      expect(state?.language).toBe("");
    });
  });
});
