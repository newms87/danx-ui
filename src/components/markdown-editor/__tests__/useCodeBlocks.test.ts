import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useCodeBlocks, CURSOR_ANCHOR } from "../useCodeBlocks";
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
			onContentChange: onContentChange as unknown as () => void
		});
	}

	/**
	 * Helper to verify code block wrapper structure
	 * The new implementation creates wrapper divs with mount points instead of <pre><code>
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
			editor = createTestEditor("<pre><code>Hello world</code></pre>");
			const codeBlocks = createCodeBlocks();
			// Set cursor inside the code element
			const code = editor.container.querySelector("code");
			if (code?.firstChild) {
				editor.setCursor(code.firstChild, 5);
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
			editor = createTestEditor("<pre><code>const x = 1;</code></pre>");
			const codeBlocks = createCodeBlocks();
			const code = editor.container.querySelector("code");
			if (code?.firstChild) {
				editor.setCursor(code.firstChild, 0);
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

		it("returns true when cursor is in code block", () => {
			editor = createTestEditor("<pre><code>Hello world</code></pre>");
			const codeBlocks = createCodeBlocks();
			const code = editor.container.querySelector("code");
			if (code?.firstChild) {
				editor.setCursor(code.firstChild, 5);
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
			editor = createTestEditor("<pre><code class=\"language-javascript\">const x = 1;</code></pre>");
			const codeBlocks = createCodeBlocks();
			const code = editor.container.querySelector("code");
			if (code?.firstChild) {
				editor.setCursor(code.firstChild, 0);
			}

			expect(codeBlocks.getCurrentCodeBlockLanguage()).toBe("javascript");
		});

		it("returns empty string when in code block without language", () => {
			editor = createTestEditor("<pre><code>const x = 1;</code></pre>");
			const codeBlocks = createCodeBlocks();
			const code = editor.container.querySelector("code");
			if (code?.firstChild) {
				editor.setCursor(code.firstChild, 0);
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
				editor = createTestEditor(`<pre><code class="language-${lang}">code</code></pre>`);
				const codeBlocks = createCodeBlocks();
				const code = editor.container.querySelector("code");
				if (code?.firstChild) {
					editor.setCursor(code.firstChild, 0);
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
			editor = createTestEditor("<pre><code>const x = 1;</code></pre>");
			const codeBlocks = createCodeBlocks();
			const code = editor.container.querySelector("code");
			if (code?.firstChild) {
				editor.setCursor(code.firstChild, 0);
			}

			codeBlocks.setCodeBlockLanguage("javascript");

			expect(editor.getHtml()).toBe("<pre><code class=\"language-javascript\">const x = 1;</code></pre>");
			expect(onContentChange).toHaveBeenCalled();
		});

		it("replaces existing language", () => {
			editor = createTestEditor("<pre><code class=\"language-javascript\">const x = 1;</code></pre>");
			const codeBlocks = createCodeBlocks();
			const code = editor.container.querySelector("code");
			if (code?.firstChild) {
				editor.setCursor(code.firstChild, 0);
			}

			codeBlocks.setCodeBlockLanguage("typescript");

			expect(editor.getHtml()).toBe("<pre><code class=\"language-typescript\">const x = 1;</code></pre>");
			expect(onContentChange).toHaveBeenCalled();
		});

		it("removes language when set to empty string", () => {
			editor = createTestEditor("<pre><code class=\"language-javascript\">const x = 1;</code></pre>");
			const codeBlocks = createCodeBlocks();
			const code = editor.container.querySelector("code");
			if (code?.firstChild) {
				editor.setCursor(code.firstChild, 0);
			}

			codeBlocks.setCodeBlockLanguage("");

			expect(editor.getHtml()).toBe("<pre><code>const x = 1;</code></pre>");
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

		it("preserves other classes when setting language", () => {
			editor = createTestEditor("<pre><code class=\"highlight other-class\">code</code></pre>");
			const codeBlocks = createCodeBlocks();
			const code = editor.container.querySelector("code");
			if (code?.firstChild) {
				editor.setCursor(code.firstChild, 0);
			}

			codeBlocks.setCodeBlockLanguage("python");

			const resultCode = editor.container.querySelector("code");
			expect(resultCode?.className).toContain("highlight");
			expect(resultCode?.className).toContain("other-class");
			expect(resultCode?.className).toContain("language-python");
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

		it("inserts newline when Enter is pressed inside code block", () => {
			editor = createTestEditor("<pre><code>line1</code></pre>");
			const codeBlocks = createCodeBlocks();
			const code = editor.container.querySelector("code");
			if (code?.firstChild) {
				editor.setCursor(code.firstChild, 5); // At end of "line1"
			}

			const handled = codeBlocks.handleCodeBlockEnter();

			expect(handled).toBe(true);
			// The code block should still exist with a newline inserted
			const codeElement = editor.container.querySelector("code");
			expect(codeElement).not.toBeNull();
			expect(codeElement?.textContent).toContain("\n");
			expect(onContentChange).toHaveBeenCalled();
		});

		it("inserts newline in middle of code content", () => {
			editor = createTestEditor("<pre><code>HelloWorld</code></pre>");
			const codeBlocks = createCodeBlocks();
			const code = editor.container.querySelector("code");
			if (code?.firstChild) {
				editor.setCursor(code.firstChild, 5); // After "Hello"
			}

			codeBlocks.handleCodeBlockEnter();

			const codeElement = editor.container.querySelector("code");
			expect(codeElement?.textContent).toContain("\n");
			expect(onContentChange).toHaveBeenCalled();
		});

		it("exits code block and creates paragraph after three consecutive Enters at end", () => {
			// Simulate content that already has two newlines at the end (user pressed Enter twice)
			editor = createTestEditor("<pre><code>some code\n\n</code></pre>");
			const codeBlocks = createCodeBlocks();
			const code = editor.container.querySelector("code");
			if (code?.firstChild) {
				// Position cursor at the very end
				editor.setCursor(code.firstChild, code.firstChild.textContent?.length || 0);
			}

			const handled = codeBlocks.handleCodeBlockEnter();

			expect(handled).toBe(true);
			// Should have created a paragraph after the code block
			const paragraph = editor.container.querySelector("p");
			expect(paragraph).not.toBeNull();
			// The code block should have the trailing newlines removed
			const codeElement = editor.container.querySelector("code");
			expect(codeElement?.textContent?.endsWith("\n\n")).toBe(false);
			expect(onContentChange).toHaveBeenCalled();
		});

		it("does not exit code block when double newline is not at cursor position", () => {
			// Content has double newline at end, but cursor is in the middle
			editor = createTestEditor("<pre><code>line1\n\nline2</code></pre>");
			const codeBlocks = createCodeBlocks();
			const code = editor.container.querySelector("code");
			if (code?.firstChild) {
				editor.setCursor(code.firstChild, 5); // After "line1", before first newline
			}

			const handled = codeBlocks.handleCodeBlockEnter();

			expect(handled).toBe(true);
			// Should NOT create a paragraph - just insert a newline
			const paragraph = editor.container.querySelector("p");
			expect(paragraph).toBeNull();
			expect(onContentChange).toHaveBeenCalled();
		});

		it("handles empty code block correctly", () => {
			editor = createTestEditor(`<pre><code>${CURSOR_ANCHOR}</code></pre>`);
			const codeBlocks = createCodeBlocks();
			const code = editor.container.querySelector("code");
			if (code?.firstChild) {
				editor.setCursor(code.firstChild, 1); // After cursor anchor
			}

			const handled = codeBlocks.handleCodeBlockEnter();

			expect(handled).toBe(true);
			expect(onContentChange).toHaveBeenCalled();
		});

		it("preserves code block content when exiting", () => {
			editor = createTestEditor("<pre><code>const x = 1;\nconst y = 2;\n\n</code></pre>");
			const codeBlocks = createCodeBlocks();
			const code = editor.container.querySelector("code");
			if (code?.firstChild) {
				editor.setCursor(code.firstChild, code.firstChild.textContent?.length || 0);
			}

			codeBlocks.handleCodeBlockEnter();

			const codeElement = editor.container.querySelector("code");
			// Content should have trailing newlines removed but rest preserved
			expect(codeElement?.textContent).toBe("const x = 1;\nconst y = 2;");
		});

		it("positions cursor in new paragraph after exiting code block", () => {
			editor = createTestEditor("<pre><code>code\n\n</code></pre>");
			const codeBlocks = createCodeBlocks();
			const code = editor.container.querySelector("code");
			if (code?.firstChild) {
				editor.setCursor(code.firstChild, code.firstChild.textContent?.length || 0);
			}

			codeBlocks.handleCodeBlockEnter();

			// Verify cursor is in the new paragraph
			const sel = window.getSelection();
			expect(sel).not.toBeNull();
			expect(sel?.rangeCount).toBe(1);

			const paragraph = editor.container.querySelector("p");
			expect(paragraph).not.toBeNull();
		});

		it("handles code block with language class when exiting", () => {
			editor = createTestEditor("<pre><code class=\"language-javascript\">const x = 1;\n\n</code></pre>");
			const codeBlocks = createCodeBlocks();
			const code = editor.container.querySelector("code");
			if (code?.firstChild) {
				editor.setCursor(code.firstChild, code.firstChild.textContent?.length || 0);
			}

			codeBlocks.handleCodeBlockEnter();

			// Code block should still have its language class
			const codeElement = editor.container.querySelector("code");
			expect(codeElement?.className).toContain("language-javascript");
			// And paragraph should be created after
			const paragraph = editor.container.querySelector("p");
			expect(paragraph).not.toBeNull();
		});

		it("adds cursor anchor when inserting newline at end to make trailing newline visible", () => {
			editor = createTestEditor("<pre><code>line1</code></pre>");
			const codeBlocks = createCodeBlocks();
			const code = editor.container.querySelector("code");
			if (code?.firstChild) {
				editor.setCursor(code.firstChild, 5); // At end of "line1"
			}

			codeBlocks.handleCodeBlockEnter();

			// The code block should contain a cursor anchor (zero-width space) after the newline
			const codeElement = editor.container.querySelector("code");
			expect(codeElement?.textContent).toBe("line1\n" + CURSOR_ANCHOR);
		});

		it("removes old cursor anchor and adds new one when pressing Enter at end multiple times", () => {
			// Start with content that already has a cursor anchor from previous Enter
			editor = createTestEditor(`<pre><code>line1\n${CURSOR_ANCHOR}</code></pre>`);
			const codeBlocks = createCodeBlocks();
			const code = editor.container.querySelector("code");
			if (code?.firstChild) {
				// Position cursor after the newline, before the cursor anchor
				editor.setCursor(code.firstChild, 6);
			}

			codeBlocks.handleCodeBlockEnter();

			// Should have only one cursor anchor, not accumulate them
			const codeElement = editor.container.querySelector("code");
			const content = codeElement?.textContent || "";
			const anchorCount = (content.match(/\u200B/g) || []).length;
			expect(anchorCount).toBe(1);
			// Content should be line1 + two newlines + cursor anchor
			expect(content).toBe("line1\n\n" + CURSOR_ANCHOR);
		});

		it("does not add cursor anchor when inserting newline in the middle of code", () => {
			editor = createTestEditor("<pre><code>HelloWorld</code></pre>");
			const codeBlocks = createCodeBlocks();
			const code = editor.container.querySelector("code");
			if (code?.firstChild) {
				editor.setCursor(code.firstChild, 5); // After "Hello"
			}

			codeBlocks.handleCodeBlockEnter();

			// Should not have a cursor anchor since we inserted in the middle
			const codeElement = editor.container.querySelector("code");
			const content = codeElement?.textContent || "";
			expect(content).not.toContain(CURSOR_ANCHOR);
			expect(content).toBe("Hello\nWorld");
		});

		it("positions cursor correctly after inserting newline at end", () => {
			editor = createTestEditor("<pre><code>line1</code></pre>");
			const codeBlocks = createCodeBlocks();
			const code = editor.container.querySelector("code");
			if (code?.firstChild) {
				editor.setCursor(code.firstChild, 5); // At end of "line1"
			}

			codeBlocks.handleCodeBlockEnter();

			// Cursor should be positioned after the newline, before the cursor anchor
			const sel = window.getSelection();
			expect(sel).not.toBeNull();
			expect(sel?.rangeCount).toBe(1);

			const range = sel?.getRangeAt(0);
			// Cursor should be at offset 6 (after "line1\n", before cursor anchor)
			expect(range?.startOffset).toBe(6);
		});
	});

	describe("edge cases", () => {
		beforeEach(() => {
			onContentChange = vi.fn();
		});

		it("handles code block with empty code element", () => {
			editor = createTestEditor("<pre><code></code></pre>");
			const codeBlocks = createCodeBlocks();
			const code = editor.container.querySelector("code");
			if (code) {
				const range = document.createRange();
				range.selectNodeContents(code);
				range.collapse(true);
				const sel = window.getSelection();
				sel?.removeAllRanges();
				sel?.addRange(range);
			}

			codeBlocks.toggleCodeBlock();

			expect(editor.getHtml()).toBe("<p></p>");
		});

		it("handles pre without code element", () => {
			editor = createTestEditor("<pre>Hello world</pre>");
			const codeBlocks = createCodeBlocks();
			const pre = editor.container.querySelector("pre");
			if (pre?.firstChild) {
				editor.setCursor(pre.firstChild, 0);
			}

			// Should still detect as code block
			expect(codeBlocks.isInCodeBlock()).toBe(true);
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
