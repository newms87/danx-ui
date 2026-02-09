import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ref } from "vue";
import { useInlineFormatting } from "../useInlineFormatting";
import { createTestEditor, TestEditorResult } from "./editorTestUtils";

describe("useInlineFormatting", () => {
	let editor: TestEditorResult;
	let onContentChange: ReturnType<typeof vi.fn>;

	afterEach(() => {
		if (editor) {
			editor.destroy();
		}
	});

	function createFormatting() {
		return useInlineFormatting({
			contentRef: editor.contentRef,
			onContentChange: onContentChange as unknown as () => void
		});
	}

	describe("toggleBold", () => {
		describe("with selection", () => {
			beforeEach(() => {
				onContentChange = vi.fn();
			});

			it("wraps selected text in strong tag", () => {
				editor = createTestEditor("<p>Hello world</p>");
				const formatting = createFormatting();
				editor.selectInBlock(0, 0, 5); // Select "Hello"

				formatting.toggleBold();

				expect(editor.getHtml()).toBe("<p><strong>Hello</strong> world</p>");
				expect(onContentChange).toHaveBeenCalled();
			});

			it("wraps middle text in strong tag", () => {
				editor = createTestEditor("<p>Hello beautiful world</p>");
				const formatting = createFormatting();
				editor.selectInBlock(0, 6, 15); // Select "beautiful"

				formatting.toggleBold();

				expect(editor.getHtml()).toBe("<p>Hello <strong>beautiful</strong> world</p>");
			});

			it("wraps end text in strong tag", () => {
				editor = createTestEditor("<p>Hello world</p>");
				const formatting = createFormatting();
				editor.selectInBlock(0, 6, 11); // Select "world"

				formatting.toggleBold();

				expect(editor.getHtml()).toBe("<p>Hello <strong>world</strong></p>");
			});

			it("unwraps entire bold element when fully selected", () => {
				editor = createTestEditor("<p><strong>Hello</strong> world</p>");
				const formatting = createFormatting();
				editor.selectInBlock(0, 0, 5); // Select "Hello"

				formatting.toggleBold();

				expect(editor.getHtml()).toBe("<p>Hello world</p>");
				expect(onContentChange).toHaveBeenCalled();
			});

			it("unwraps partial selection from beginning of bold element", () => {
				editor = createTestEditor("<p><strong>Hello world</strong> end</p>");
				const formatting = createFormatting();
				editor.selectInBlock(0, 0, 5); // Select "Hello"

				formatting.toggleBold();

				// Should result in: "Hello" unformatted + " world" bold + " end"
				expect(editor.getHtml()).toBe("<p>Hello<strong> world</strong> end</p>");
			});

			it("unwraps partial selection from middle of bold element", () => {
				editor = createTestEditor("<p><strong>Hello world</strong></p>");
				const formatting = createFormatting();
				editor.selectInBlock(0, 6, 11); // Select "world"

				formatting.toggleBold();

				// Should result in: "Hello " bold + "world" unformatted
				expect(editor.getHtml()).toBe("<p><strong>Hello </strong>world</p>");
			});

			it("unwraps partial selection from end of bold element", () => {
				editor = createTestEditor("<p>start <strong>Hello world</strong></p>");
				const formatting = createFormatting();
				editor.selectInBlock(0, 12, 17); // Select "world"

				formatting.toggleBold();

				// Should result in: "start " + "Hello " bold + "world" unformatted
				expect(editor.getHtml()).toBe("<p>start <strong>Hello </strong>world</p>");
			});

			it("selects the wrapped content after wrapping", () => {
				editor = createTestEditor("<p>Hello world</p>");
				const formatting = createFormatting();
				editor.selectInBlock(0, 0, 5); // Select "Hello"

				formatting.toggleBold();

				const selection = window.getSelection();
				expect(selection?.toString()).toBe("Hello");
			});
		});

		describe("without selection (cursor only)", () => {
			beforeEach(() => {
				onContentChange = vi.fn();
			});

			it("inserts bold placeholder when cursor is in plain text", () => {
				editor = createTestEditor("<p>Hello world</p>");
				const formatting = createFormatting();
				editor.setCursorInBlock(0, 6); // After "Hello "

				formatting.toggleBold();

				expect(editor.getHtml()).toContain("<strong>bold text</strong>");
				expect(onContentChange).toHaveBeenCalled();
			});

			it("inserts placeholder at beginning of text", () => {
				editor = createTestEditor("<p>Hello world</p>");
				const formatting = createFormatting();
				editor.setCursorInBlock(0, 0); // At start

				formatting.toggleBold();

				expect(editor.getHtml()).toContain("<strong>bold text</strong>");
			});

			it("placeholder text is selected after insertion", () => {
				editor = createTestEditor("<p>Hello world</p>");
				const formatting = createFormatting();
				editor.setCursorInBlock(0, 6); // After "Hello "

				formatting.toggleBold();

				const selection = window.getSelection();
				expect(selection?.toString()).toBe("bold text");
			});

			it("moves cursor outside bold when cursor is inside bold text", () => {
				editor = createTestEditor("<p><strong>Hello</strong> world</p>");
				const formatting = createFormatting();
				const strongEl = editor.container.querySelector("strong");
				editor.setCursor(strongEl!.firstChild!, 5); // End of "Hello"

				formatting.toggleBold();

				// The HTML should still have the strong element
				expect(editor.getHtml()).toContain("<strong>Hello</strong>");
				// A zero-width space should be inserted for cursor positioning
				expect(editor.getHtml()).toContain("\u200B");
				expect(onContentChange).toHaveBeenCalled();
			});

			it("moves cursor outside bold when cursor is at start of bold text", () => {
				editor = createTestEditor("<p><strong>Hello</strong> world</p>");
				const formatting = createFormatting();
				const strongEl = editor.container.querySelector("strong");
				editor.setCursor(strongEl!.firstChild!, 0); // Start of "Hello"

				formatting.toggleBold();

				expect(editor.getHtml()).toContain("<strong>Hello</strong>");
			});
		});
	});

	describe("toggleItalic", () => {
		describe("with selection", () => {
			beforeEach(() => {
				onContentChange = vi.fn();
			});

			it("wraps selected text in em tag", () => {
				editor = createTestEditor("<p>Hello world</p>");
				const formatting = createFormatting();
				editor.selectInBlock(0, 0, 5); // Select "Hello"

				formatting.toggleItalic();

				expect(editor.getHtml()).toBe("<p><em>Hello</em> world</p>");
				expect(onContentChange).toHaveBeenCalled();
			});

			it("unwraps entire italic element when fully selected", () => {
				editor = createTestEditor("<p><em>Hello</em> world</p>");
				const formatting = createFormatting();
				editor.selectInBlock(0, 0, 5); // Select "Hello"

				formatting.toggleItalic();

				expect(editor.getHtml()).toBe("<p>Hello world</p>");
			});

			it("unwraps partial selection from italic element", () => {
				editor = createTestEditor("<p><em>Hello world</em></p>");
				const formatting = createFormatting();
				editor.selectInBlock(0, 0, 5); // Select "Hello"

				formatting.toggleItalic();

				expect(editor.getHtml()).toBe("<p>Hello<em> world</em></p>");
			});
		});

		describe("without selection (cursor only)", () => {
			beforeEach(() => {
				onContentChange = vi.fn();
			});

			it("inserts italic placeholder when cursor is in plain text", () => {
				editor = createTestEditor("<p>Hello world</p>");
				const formatting = createFormatting();
				editor.setCursorInBlock(0, 6);

				formatting.toggleItalic();

				expect(editor.getHtml()).toContain("<em>italic text</em>");
			});

			it("placeholder text is selected after insertion", () => {
				editor = createTestEditor("<p>Hello world</p>");
				const formatting = createFormatting();
				editor.setCursorInBlock(0, 6);

				formatting.toggleItalic();

				const selection = window.getSelection();
				expect(selection?.toString()).toBe("italic text");
			});

			it("moves cursor outside italic when cursor is inside italic text", () => {
				editor = createTestEditor("<p><em>Hello</em> world</p>");
				const formatting = createFormatting();
				const emEl = editor.container.querySelector("em");
				editor.setCursor(emEl!.firstChild!, 3);

				formatting.toggleItalic();

				expect(editor.getHtml()).toContain("<em>Hello</em>");
				expect(editor.getHtml()).toContain("\u200B");
			});
		});
	});

	describe("toggleStrikethrough", () => {
		describe("with selection", () => {
			beforeEach(() => {
				onContentChange = vi.fn();
			});

			it("wraps selected text in del tag", () => {
				editor = createTestEditor("<p>Hello world</p>");
				const formatting = createFormatting();
				editor.selectInBlock(0, 0, 5);

				formatting.toggleStrikethrough();

				expect(editor.getHtml()).toBe("<p><del>Hello</del> world</p>");
				expect(onContentChange).toHaveBeenCalled();
			});

			it("unwraps entire strikethrough element when fully selected", () => {
				editor = createTestEditor("<p><del>Hello</del> world</p>");
				const formatting = createFormatting();
				editor.selectInBlock(0, 0, 5);

				formatting.toggleStrikethrough();

				expect(editor.getHtml()).toBe("<p>Hello world</p>");
			});

			it("unwraps partial selection from strikethrough element", () => {
				editor = createTestEditor("<p><del>Hello world</del></p>");
				const formatting = createFormatting();
				editor.selectInBlock(0, 6, 11); // Select "world"

				formatting.toggleStrikethrough();

				expect(editor.getHtml()).toBe("<p><del>Hello </del>world</p>");
			});
		});

		describe("without selection (cursor only)", () => {
			beforeEach(() => {
				onContentChange = vi.fn();
			});

			it("inserts strikethrough placeholder when cursor is in plain text", () => {
				editor = createTestEditor("<p>Hello world</p>");
				const formatting = createFormatting();
				editor.setCursorInBlock(0, 6);

				formatting.toggleStrikethrough();

				expect(editor.getHtml()).toContain("<del>strikethrough text</del>");
			});

			it("placeholder text is selected after insertion", () => {
				editor = createTestEditor("<p>Hello world</p>");
				const formatting = createFormatting();
				editor.setCursorInBlock(0, 6);

				formatting.toggleStrikethrough();

				const selection = window.getSelection();
				expect(selection?.toString()).toBe("strikethrough text");
			});

			it("moves cursor outside del when cursor is inside strikethrough text", () => {
				editor = createTestEditor("<p><del>Hello</del> world</p>");
				const formatting = createFormatting();
				const delEl = editor.container.querySelector("del");
				editor.setCursor(delEl!.firstChild!, 3);

				formatting.toggleStrikethrough();

				expect(editor.getHtml()).toContain("<del>Hello</del>");
				expect(editor.getHtml()).toContain("\u200B");
			});
		});
	});

	describe("toggleInlineCode", () => {
		describe("with selection", () => {
			beforeEach(() => {
				onContentChange = vi.fn();
			});

			it("wraps selected text in code tag", () => {
				editor = createTestEditor("<p>Hello world</p>");
				const formatting = createFormatting();
				editor.selectInBlock(0, 0, 5);

				formatting.toggleInlineCode();

				expect(editor.getHtml()).toBe("<p><code>Hello</code> world</p>");
				expect(onContentChange).toHaveBeenCalled();
			});

			it("unwraps entire code element when fully selected", () => {
				editor = createTestEditor("<p><code>Hello</code> world</p>");
				const formatting = createFormatting();
				editor.selectInBlock(0, 0, 5);

				formatting.toggleInlineCode();

				expect(editor.getHtml()).toBe("<p>Hello world</p>");
			});

			it("unwraps partial selection from code element", () => {
				editor = createTestEditor("<p><code>Hello world</code></p>");
				const formatting = createFormatting();
				editor.selectInBlock(0, 0, 5); // Select "Hello"

				formatting.toggleInlineCode();

				expect(editor.getHtml()).toBe("<p>Hello<code> world</code></p>");
			});
		});

		describe("without selection (cursor only)", () => {
			beforeEach(() => {
				onContentChange = vi.fn();
			});

			it("inserts code placeholder when cursor is in plain text", () => {
				editor = createTestEditor("<p>Hello world</p>");
				const formatting = createFormatting();
				editor.setCursorInBlock(0, 6);

				formatting.toggleInlineCode();

				expect(editor.getHtml()).toContain("<code>code</code>");
			});

			it("placeholder text is selected after insertion", () => {
				editor = createTestEditor("<p>Hello world</p>");
				const formatting = createFormatting();
				editor.setCursorInBlock(0, 6);

				formatting.toggleInlineCode();

				const selection = window.getSelection();
				expect(selection?.toString()).toBe("code");
			});

			it("moves cursor outside code when cursor is inside code text", () => {
				editor = createTestEditor("<p><code>Hello</code> world</p>");
				const formatting = createFormatting();
				const codeEl = editor.container.querySelector("code");
				editor.setCursor(codeEl!.firstChild!, 3);

				formatting.toggleInlineCode();

				expect(editor.getHtml()).toContain("<code>Hello</code>");
				expect(editor.getHtml()).toContain("\u200B");
			});
		});
	});

	describe("edge cases", () => {
		beforeEach(() => {
			onContentChange = vi.fn();
		});

		it("does nothing when contentRef is null", () => {
			editor = createTestEditor("<p>Hello world</p>");
			const { toggleBold } = useInlineFormatting({
				contentRef: ref<HTMLElement | null>(null),
				onContentChange: onContentChange as unknown as () => void
			});

			toggleBold();

			expect(editor.getHtml()).toBe("<p>Hello world</p>");
			expect(onContentChange).not.toHaveBeenCalled();
		});

		it("does nothing when selection is outside content area", () => {
			editor = createTestEditor("<p>Hello world</p>");
			const formatting = createFormatting();

			// Create a selection outside the editor
			const externalDiv = document.createElement("div");
			externalDiv.textContent = "External text";
			document.body.appendChild(externalDiv);

			const range = document.createRange();
			range.selectNodeContents(externalDiv);
			const sel = window.getSelection();
			sel?.removeAllRanges();
			sel?.addRange(range);

			formatting.toggleBold();

			expect(editor.getHtml()).toBe("<p>Hello world</p>");
			expect(onContentChange).not.toHaveBeenCalled();

			externalDiv.remove();
		});

		it("does nothing when no selection exists", () => {
			editor = createTestEditor("<p>Hello world</p>");
			const formatting = createFormatting();

			// Clear any selection
			window.getSelection()?.removeAllRanges();

			formatting.toggleBold();

			expect(editor.getHtml()).toBe("<p>Hello world</p>");
			expect(onContentChange).not.toHaveBeenCalled();
		});

		it("handles fallback tag recognition (B for STRONG)", () => {
			editor = createTestEditor("<p><b>Hello</b> world</p>");
			const formatting = createFormatting();
			editor.selectInBlock(0, 0, 5);

			formatting.toggleBold();

			// Should unwrap the B tag (recognized as bold)
			expect(editor.getHtml()).toBe("<p>Hello world</p>");
		});

		it("handles fallback tag recognition (I for EM)", () => {
			editor = createTestEditor("<p><i>Hello</i> world</p>");
			const formatting = createFormatting();
			editor.selectInBlock(0, 0, 5);

			formatting.toggleItalic();

			// Should unwrap the I tag (recognized as italic)
			expect(editor.getHtml()).toBe("<p>Hello world</p>");
		});

		it("handles fallback tag recognition (S for DEL)", () => {
			editor = createTestEditor("<p><s>Hello</s> world</p>");
			const formatting = createFormatting();
			editor.selectInBlock(0, 0, 5);

			formatting.toggleStrikethrough();

			// Should unwrap the S tag (recognized as strikethrough)
			expect(editor.getHtml()).toBe("<p>Hello world</p>");
		});
	});

	describe("nested formatting", () => {
		beforeEach(() => {
			onContentChange = vi.fn();
		});

		it("can bold text inside italic element", () => {
			editor = createTestEditor("<p><em>Hello world</em></p>");
			const formatting = createFormatting();
			editor.selectInBlock(0, 0, 5); // Select "Hello"

			formatting.toggleBold();

			expect(editor.getHtml()).toContain("<strong>");
			expect(editor.getHtml()).toContain("<em>");
		});

		it("can italic text inside bold element", () => {
			editor = createTestEditor("<p><strong>Hello world</strong></p>");
			const formatting = createFormatting();
			editor.selectInBlock(0, 0, 5); // Select "Hello"

			formatting.toggleItalic();

			expect(editor.getHtml()).toContain("<em>");
			expect(editor.getHtml()).toContain("<strong>");
		});
	});

	describe("cursor position after operations", () => {
		beforeEach(() => {
			onContentChange = vi.fn();
		});

		it("selection encompasses wrapped content after wrapping", () => {
			editor = createTestEditor("<p>Hello world</p>");
			const formatting = createFormatting();
			editor.selectInBlock(0, 0, 5);

			formatting.toggleBold();

			const selection = window.getSelection();
			const range = selection?.getRangeAt(0);
			const strongEl = editor.container.querySelector("strong");

			// The selection should be within the strong element
			expect(strongEl?.contains(range?.commonAncestorContainer || null)).toBe(true);
			expect(selection?.toString()).toBe("Hello");
		});

		it("placeholder text is selected after inserting placeholder", () => {
			editor = createTestEditor("<p>Hello world</p>");
			const formatting = createFormatting();
			editor.setCursorInBlock(0, 5);

			formatting.toggleBold();

			const selection = window.getSelection();
			expect(selection?.toString()).toBe("bold text");
			expect(selection?.isCollapsed).toBe(false);
		});

		it("cursor is positioned outside formatted element after exiting", () => {
			editor = createTestEditor("<p><strong>Hello</strong> world</p>");
			const formatting = createFormatting();
			const strongEl = editor.container.querySelector("strong");
			editor.setCursor(strongEl!.firstChild!, 5);

			formatting.toggleBold();

			const pos = editor.getCursorPosition();
			// Cursor should be in a text node containing zero-width space
			expect(pos.node?.textContent).toContain("\u200B");
		});
	});

	describe("format merging (prevents nested same-type tags)", () => {
		beforeEach(() => {
			onContentChange = vi.fn();
		});

		it("merges highlight when selecting text containing highlighted portion", () => {
			// User has: some ==highlighted== text
			// User selects entire line and presses Ctrl+Shift+H
			// Expected: <mark>some highlighted text</mark> (merged, not nested)
			editor = createTestEditor("<p>some <mark>highlighted</mark> text</p>");
			const formatting = createFormatting();
			editor.selectInBlock(0, 0, 21); // Select "some highlighted text"

			formatting.toggleHighlight();

			const html = editor.getHtml();
			// Should have exactly one mark tag, not nested marks
			expect(html).toBe("<p><mark>some highlighted text</mark></p>");
			// Verify no nested marks
			expect(html.match(/<mark>/g)?.length).toBe(1);
		});

		it("merges bold when selecting text containing bold portion", () => {
			editor = createTestEditor("<p>some <strong>bold</strong> text</p>");
			const formatting = createFormatting();
			editor.selectInBlock(0, 0, 14); // Select "some bold text"

			formatting.toggleBold();

			const html = editor.getHtml();
			expect(html).toBe("<p><strong>some bold text</strong></p>");
			expect(html.match(/<strong>/g)?.length).toBe(1);
		});

		it("merges italic when selecting text containing italic portion", () => {
			editor = createTestEditor("<p>some <em>italic</em> text</p>");
			const formatting = createFormatting();
			editor.selectInBlock(0, 0, 16); // Select "some italic text"

			formatting.toggleItalic();

			const html = editor.getHtml();
			expect(html).toBe("<p><em>some italic text</em></p>");
			expect(html.match(/<em>/g)?.length).toBe(1);
		});

		it("merges strikethrough when selecting text containing strikethrough portion", () => {
			editor = createTestEditor("<p>some <del>deleted</del> text</p>");
			const formatting = createFormatting();
			editor.selectInBlock(0, 0, 17); // Select "some deleted text"

			formatting.toggleStrikethrough();

			const html = editor.getHtml();
			expect(html).toBe("<p><del>some deleted text</del></p>");
			expect(html.match(/<del>/g)?.length).toBe(1);
		});

		it("merges code when selecting text containing code portion", () => {
			editor = createTestEditor("<p>some <code>code</code> text</p>");
			const formatting = createFormatting();
			editor.selectInBlock(0, 0, 14); // Select "some code text"

			formatting.toggleInlineCode();

			const html = editor.getHtml();
			expect(html).toBe("<p><code>some code text</code></p>");
			expect(html.match(/<code>/g)?.length).toBe(1);
		});

		it("merges underline when selecting text containing underlined portion", () => {
			editor = createTestEditor("<p>some <u>underlined</u> text</p>");
			const formatting = createFormatting();
			editor.selectInBlock(0, 0, 21); // Select "some underlined text"

			formatting.toggleUnderline();

			const html = editor.getHtml();
			expect(html).toBe("<p><u>some underlined text</u></p>");
			expect(html.match(/<u>/g)?.length).toBe(1);
		});

		it("merges multiple same-type formatted portions into one", () => {
			// Multiple bold sections in selection - wrap the entire content
			// The inner strong tags should be unwrapped, not nested
			editor = createTestEditor("<p><strong>bold1</strong> middle <strong>bold2</strong></p>");
			const formatting = createFormatting();
			// Select all text content
			editor.selectInBlock(0, 0, 18); // Select "bold1 middle bold2"

			formatting.toggleBold();

			const html = editor.getHtml();
			// The result should have exactly one strong tag with merged content
			// Empty boundary tags should be cleaned up
			expect(html).toBe("<p><strong>bold1 middle bold2</strong></p>");
		});

		it("preserves different format types when merging same type", () => {
			// Bold with italic inside, then wrap all in bold - should merge bold but keep italic
			editor = createTestEditor("<p>text <strong>bold with <em>italic</em></strong> more</p>");
			const formatting = createFormatting();
			editor.selectInBlock(0, 0, 25); // Select all

			formatting.toggleBold();

			const html = editor.getHtml();
			// Should have one strong tag wrapping everything, with em preserved inside
			expect(html.match(/<strong>/g)?.length).toBe(1);
			expect(html).toContain("<em>italic</em>");
		});
	});

});
