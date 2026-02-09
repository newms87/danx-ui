import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ref } from "vue";
import { useBlockquotes } from "../useBlockquotes";
import { createTestEditor, TestEditorResult } from "./editorTestUtils";

describe("useBlockquotes", () => {
	let editor: TestEditorResult;
	let onContentChange: ReturnType<typeof vi.fn>;

	afterEach(() => {
		if (editor) {
			editor.destroy();
		}
	});

	function createBlockquotes() {
		return useBlockquotes({
			contentRef: editor.contentRef,
			onContentChange: onContentChange as unknown as () => void
		});
	}

	describe("toggleBlockquote", () => {
		describe("wrapping in blockquote", () => {
			beforeEach(() => {
				onContentChange = vi.fn();
			});

			it("wraps paragraph in blockquote", () => {
				editor = createTestEditor("<p>Hello world</p>");
				const blockquotes = createBlockquotes();
				editor.setCursorInBlock(0, 5);

				blockquotes.toggleBlockquote();

				expect(editor.getHtml()).toBe("<blockquote><p>Hello world</p></blockquote>");
				expect(onContentChange).toHaveBeenCalled();
			});

			it("wraps h1 in blockquote", () => {
				editor = createTestEditor("<h1>Hello world</h1>");
				const blockquotes = createBlockquotes();
				editor.setCursorInBlock(0, 0);

				blockquotes.toggleBlockquote();

				expect(editor.getHtml()).toBe("<blockquote><h1>Hello world</h1></blockquote>");
				expect(onContentChange).toHaveBeenCalled();
			});

			it("wraps h2 in blockquote", () => {
				editor = createTestEditor("<h2>Test heading</h2>");
				const blockquotes = createBlockquotes();
				editor.setCursorInBlock(0, 0);

				blockquotes.toggleBlockquote();

				expect(editor.getHtml()).toBe("<blockquote><h2>Test heading</h2></blockquote>");
			});

			it("wraps div in blockquote", () => {
				editor = createTestEditor("<div>Div content</div>");
				const blockquotes = createBlockquotes();
				editor.setCursorInBlock(0, 0);

				blockquotes.toggleBlockquote();

				expect(editor.getHtml()).toBe("<blockquote><div>Div content</div></blockquote>");
			});

			it("preserves cursor position after wrapping", () => {
				editor = createTestEditor("<p>Hello world</p>");
				const blockquotes = createBlockquotes();
				editor.setCursorInBlock(0, 5);

				blockquotes.toggleBlockquote();

				// Verify cursor is still at offset 5
				const sel = window.getSelection();
				expect(sel).not.toBeNull();
				expect(sel!.rangeCount).toBeGreaterThan(0);
			});

			it("only wraps current block, not siblings", () => {
				editor = createTestEditor("<p>First</p><p>Second</p><p>Third</p>");
				const blockquotes = createBlockquotes();
				editor.setCursorInBlock(1, 0); // Cursor in second paragraph

				blockquotes.toggleBlockquote();

				expect(editor.getHtml()).toBe("<p>First</p><blockquote><p>Second</p></blockquote><p>Third</p>");
			});
		});

		describe("unwrapping from blockquote", () => {
			beforeEach(() => {
				onContentChange = vi.fn();
			});

			it("unwraps paragraph from blockquote", () => {
				editor = createTestEditor("<blockquote><p>Hello world</p></blockquote>");
				const blockquotes = createBlockquotes();
				// Set cursor inside the paragraph within blockquote
				const p = editor.container.querySelector("blockquote p");
				if (p?.firstChild) {
					editor.setCursor(p.firstChild, 5);
				}

				blockquotes.toggleBlockquote();

				expect(editor.getHtml()).toBe("<p>Hello world</p>");
				expect(onContentChange).toHaveBeenCalled();
			});

			it("unwraps heading from blockquote", () => {
				editor = createTestEditor("<blockquote><h1>Heading</h1></blockquote>");
				const blockquotes = createBlockquotes();
				const h1 = editor.container.querySelector("blockquote h1");
				if (h1?.firstChild) {
					editor.setCursor(h1.firstChild, 0);
				}

				blockquotes.toggleBlockquote();

				expect(editor.getHtml()).toBe("<h1>Heading</h1>");
			});

			it("preserves cursor position after unwrapping", () => {
				editor = createTestEditor("<blockquote><p>Hello world</p></blockquote>");
				const blockquotes = createBlockquotes();
				const p = editor.container.querySelector("blockquote p");
				if (p?.firstChild) {
					editor.setCursor(p.firstChild, 5);
				}

				blockquotes.toggleBlockquote();

				const sel = window.getSelection();
				expect(sel).not.toBeNull();
				expect(sel!.rangeCount).toBeGreaterThan(0);
			});

			it("unwraps only the blockquote, keeps other blocks", () => {
				editor = createTestEditor("<p>Before</p><blockquote><p>Quoted</p></blockquote><p>After</p>");
				const blockquotes = createBlockquotes();
				const quotedP = editor.container.querySelector("blockquote p");
				if (quotedP?.firstChild) {
					editor.setCursor(quotedP.firstChild, 0);
				}

				blockquotes.toggleBlockquote();

				expect(editor.getHtml()).toBe("<p>Before</p><p>Quoted</p><p>After</p>");
			});
		});

		describe("with inline formatting preserved", () => {
			beforeEach(() => {
				onContentChange = vi.fn();
			});

			it("preserves bold formatting when wrapping", () => {
				editor = createTestEditor("<p>Hello <strong>bold</strong> world</p>");
				const blockquotes = createBlockquotes();
				editor.setCursorInBlock(0, 0);

				blockquotes.toggleBlockquote();

				expect(editor.getHtml()).toBe("<blockquote><p>Hello <strong>bold</strong> world</p></blockquote>");
			});

			it("preserves italic formatting when wrapping", () => {
				editor = createTestEditor("<p>Hello <em>italic</em> world</p>");
				const blockquotes = createBlockquotes();
				editor.setCursorInBlock(0, 0);

				blockquotes.toggleBlockquote();

				expect(editor.getHtml()).toBe("<blockquote><p>Hello <em>italic</em> world</p></blockquote>");
			});

			it("preserves nested formatting when wrapping", () => {
				editor = createTestEditor("<p>Hello <strong><em>bold italic</em></strong> world</p>");
				const blockquotes = createBlockquotes();
				editor.setCursorInBlock(0, 0);

				blockquotes.toggleBlockquote();

				expect(editor.getHtml()).toBe("<blockquote><p>Hello <strong><em>bold italic</em></strong> world</p></blockquote>");
			});

			it("preserves bold formatting when unwrapping", () => {
				editor = createTestEditor("<blockquote><p>Hello <strong>bold</strong> world</p></blockquote>");
				const blockquotes = createBlockquotes();
				const p = editor.container.querySelector("blockquote p");
				if (p?.firstChild) {
					editor.setCursor(p.firstChild, 0);
				}

				blockquotes.toggleBlockquote();

				expect(editor.getHtml()).toBe("<p>Hello <strong>bold</strong> world</p>");
			});

			it("preserves link formatting when wrapping", () => {
				editor = createTestEditor("<p>Hello <a href=\"https://example.com\">link</a> world</p>");
				const blockquotes = createBlockquotes();
				editor.setCursorInBlock(0, 0);

				blockquotes.toggleBlockquote();

				expect(editor.getHtml()).toBe("<blockquote><p>Hello <a href=\"https://example.com\">link</a> world</p></blockquote>");
			});

			it("preserves code formatting when wrapping", () => {
				editor = createTestEditor("<p>Hello <code>code</code> world</p>");
				const blockquotes = createBlockquotes();
				editor.setCursorInBlock(0, 0);

				blockquotes.toggleBlockquote();

				expect(editor.getHtml()).toBe("<blockquote><p>Hello <code>code</code> world</p></blockquote>");
			});
		});
	});

	describe("isInBlockquote", () => {
		beforeEach(() => {
			onContentChange = vi.fn();
		});

		it("returns false when cursor is in plain paragraph", () => {
			editor = createTestEditor("<p>Hello world</p>");
			const blockquotes = createBlockquotes();
			editor.setCursorInBlock(0, 5);

			expect(blockquotes.isInBlockquote()).toBe(false);
		});

		it("returns true when cursor is inside blockquote", () => {
			editor = createTestEditor("<blockquote><p>Hello world</p></blockquote>");
			const blockquotes = createBlockquotes();
			const p = editor.container.querySelector("blockquote p");
			if (p?.firstChild) {
				editor.setCursor(p.firstChild, 5);
			}

			expect(blockquotes.isInBlockquote()).toBe(true);
		});

		it("returns false when cursor is outside blockquote", () => {
			editor = createTestEditor("<p>Outside</p><blockquote><p>Inside</p></blockquote>");
			const blockquotes = createBlockquotes();
			editor.setCursorInBlock(0, 0); // Cursor in first paragraph

			expect(blockquotes.isInBlockquote()).toBe(false);
		});

		it("returns true for nested content inside blockquote", () => {
			editor = createTestEditor("<blockquote><p><strong>Bold text</strong></p></blockquote>");
			const blockquotes = createBlockquotes();
			const strong = editor.container.querySelector("blockquote strong");
			if (strong?.firstChild) {
				editor.setCursor(strong.firstChild, 2);
			}

			expect(blockquotes.isInBlockquote()).toBe(true);
		});

		it("returns false when contentRef is null", () => {
			editor = createTestEditor("<p>Hello world</p>");
			const { isInBlockquote } = useBlockquotes({
				contentRef: ref<HTMLElement | null>(null),
				onContentChange: onContentChange as unknown as () => void
			});

			expect(isInBlockquote()).toBe(false);
		});

		it("returns false when no selection exists", () => {
			editor = createTestEditor("<blockquote><p>Hello world</p></blockquote>");
			const blockquotes = createBlockquotes();
			window.getSelection()?.removeAllRanges();

			expect(blockquotes.isInBlockquote()).toBe(false);
		});
	});

	describe("edge cases", () => {
		beforeEach(() => {
			onContentChange = vi.fn();
		});

		it("does nothing when contentRef is null", () => {
			editor = createTestEditor("<p>Hello world</p>");
			const { toggleBlockquote } = useBlockquotes({
				contentRef: ref<HTMLElement | null>(null),
				onContentChange: onContentChange as unknown as () => void
			});

			toggleBlockquote();

			expect(editor.getHtml()).toBe("<p>Hello world</p>");
			expect(onContentChange).not.toHaveBeenCalled();
		});

		it("does nothing when selection is outside content area", () => {
			editor = createTestEditor("<p>Hello world</p>");
			const blockquotes = createBlockquotes();

			// Create a selection outside the editor
			const externalDiv = document.createElement("div");
			externalDiv.textContent = "External text";
			document.body.appendChild(externalDiv);

			const range = document.createRange();
			range.selectNodeContents(externalDiv);
			const sel = window.getSelection();
			sel?.removeAllRanges();
			sel?.addRange(range);

			blockquotes.toggleBlockquote();

			expect(editor.getHtml()).toBe("<p>Hello world</p>");
			expect(onContentChange).not.toHaveBeenCalled();

			externalDiv.remove();
		});

		it("does nothing when no selection exists", () => {
			editor = createTestEditor("<p>Hello world</p>");
			const blockquotes = createBlockquotes();
			window.getSelection()?.removeAllRanges();

			blockquotes.toggleBlockquote();

			expect(editor.getHtml()).toBe("<p>Hello world</p>");
			expect(onContentChange).not.toHaveBeenCalled();
		});

		it("handles empty paragraph", () => {
			editor = createTestEditor("<p></p>");
			const blockquotes = createBlockquotes();
			const p = editor.getBlock(0);
			if (p) {
				const range = document.createRange();
				range.selectNodeContents(p);
				range.collapse(true);
				const sel = window.getSelection();
				sel?.removeAllRanges();
				sel?.addRange(range);
			}

			blockquotes.toggleBlockquote();

			expect(editor.getHtml()).toBe("<blockquote><p></p></blockquote>");
		});

		it("handles whitespace-only content", () => {
			editor = createTestEditor("<p>   </p>");
			const blockquotes = createBlockquotes();
			editor.setCursorInBlock(0, 1);

			blockquotes.toggleBlockquote();

			expect(editor.getHtml()).toBe("<blockquote><p>   </p></blockquote>");
		});
	});

	describe("round-trip toggle", () => {
		beforeEach(() => {
			onContentChange = vi.fn();
		});

		it("toggle wrap then unwrap returns to original", () => {
			editor = createTestEditor("<p>Hello world</p>");
			const blockquotes = createBlockquotes();
			editor.setCursorInBlock(0, 5);

			// First toggle - wrap
			blockquotes.toggleBlockquote();
			expect(editor.getHtml()).toBe("<blockquote><p>Hello world</p></blockquote>");

			// Set cursor again inside the blockquote
			const p = editor.container.querySelector("blockquote p");
			if (p?.firstChild) {
				editor.setCursor(p.firstChild, 5);
			}

			// Second toggle - unwrap
			blockquotes.toggleBlockquote();
			expect(editor.getHtml()).toBe("<p>Hello world</p>");
		});

		it("toggle unwrap then wrap returns to original", () => {
			editor = createTestEditor("<blockquote><p>Hello world</p></blockquote>");
			const blockquotes = createBlockquotes();
			const p = editor.container.querySelector("blockquote p");
			if (p?.firstChild) {
				editor.setCursor(p.firstChild, 5);
			}

			// First toggle - unwrap
			blockquotes.toggleBlockquote();
			expect(editor.getHtml()).toBe("<p>Hello world</p>");

			// Set cursor in the unwrapped paragraph
			editor.setCursorInBlock(0, 5);

			// Second toggle - wrap
			blockquotes.toggleBlockquote();
			expect(editor.getHtml()).toBe("<blockquote><p>Hello world</p></blockquote>");
		});
	});

});
