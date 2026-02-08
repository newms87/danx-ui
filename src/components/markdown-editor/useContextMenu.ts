import { Ref, ref } from "vue";
import { ContextMenuContext, ContextMenuItem } from "./types";
import { UseMarkdownEditorReturn } from "./useMarkdownEditor";

/**
 * Options for useContextMenu composable
 */
export interface UseContextMenuOptions {
	editor: UseMarkdownEditorReturn;
	readonly?: Ref<boolean>;
}

/**
 * Return type for useContextMenu composable
 */
export interface UseContextMenuReturn {
	isVisible: Ref<boolean>;
	position: Ref<{ x: number; y: number }>;
	items: Ref<ContextMenuItem[]>;
	show: (event: MouseEvent) => void;
	hide: () => void;
}

/**
 * Composable for managing the context menu in the markdown editor.
 * Handles context detection and menu item building based on cursor position.
 */
export function useContextMenu(options: UseContextMenuOptions): UseContextMenuReturn {
	const { editor, readonly } = options;

	// Context menu state
	const isVisible = ref(false);
	const position = ref({ x: 0, y: 0 });
	const items = ref<ContextMenuItem[]>([]);

	/**
	 * Determine the context for the context menu based on cursor position
	 */
	function determineContext(): ContextMenuContext {
		if (editor.tables.isInTable()) return "table";
		if (editor.codeBlocks.isInCodeBlock()) return "code";
		if (editor.lists.getCurrentListType()) return "list";
		return "text";
	}

	/**
	 * Build context menu items with nested submenus based on the current context.
	 *
	 * Menu items are filtered based on markdown spec constraints:
	 * - Code blocks: Only show toggle code block (code is verbatim, no formatting allowed)
	 * - Tables: Only inline formatting and table operations (no block-level elements)
	 * - Lists: Inline formatting, list toggle, and blockquote (no headings, tables, or code blocks)
	 * - Text: Full menu with all options
	 */
	function buildItems(context: ContextMenuContext): ContextMenuItem[] {
		const menuItems: ContextMenuItem[] = [];

		// In code blocks, show minimal menu - just exit option
		// Code blocks are literal/verbatim, no formatting is allowed
		// Unnested since this is the only action available in this context
		if (context === "code") {
			menuItems.push({
				id: "code-block",
				label: "Toggle Code Block",
				shortcut: "Ctrl+Shift+K",
				action: () => editor.codeBlocks.toggleCodeBlock()
			});
			return menuItems;
		}

		// In tables, only show inline formatting and table operations
		// Tables cannot contain block-level elements (headings, code blocks, blockquotes, lists, nested tables)
		// Table operations are unnested since this context is already limited to tables
		if (context === "table") {
			// Format submenu (inline only - keep nested)
			menuItems.push({
				id: "format",
				label: "Format",
				children: [
					{
						id: "bold",
						label: "Bold",
						shortcut: "Ctrl+B",
						action: () => editor.inlineFormatting.toggleBold()
					},
					{
						id: "italic",
						label: "Italic",
						shortcut: "Ctrl+I",
						action: () => editor.inlineFormatting.toggleItalic()
					},
					{
						id: "strikethrough",
						label: "Strikethrough",
						shortcut: "Ctrl+Shift+S",
						action: () => editor.inlineFormatting.toggleStrikethrough()
					},
					{
						id: "inline-code",
						label: "Inline Code",
						shortcut: "Ctrl+E",
						action: () => editor.inlineFormatting.toggleInlineCode()
					},
					{
						id: "link",
						label: "Link",
						shortcut: "Ctrl+K",
						action: () => editor.links.insertLink()
					}
				]
			});

			// Table operations - unnested as top-level items with dividers between groups
			// Divider after Format submenu
			menuItems.push({ id: "table-format-divider", label: "", divider: true });

			// Insert operations
			menuItems.push({
				id: "insert-row-above",
				label: "Insert Row Above",
				shortcut: "Ctrl+Alt+Shift+Up",
				action: () => editor.tables.insertRowAbove()
			});
			menuItems.push({
				id: "insert-row-below",
				label: "Insert Row Below",
				shortcut: "Ctrl+Alt+Shift+Down",
				action: () => editor.tables.insertRowBelow()
			});
			menuItems.push({
				id: "insert-col-left",
				label: "Insert Column Left",
				shortcut: "Ctrl+Alt+Shift+Left",
				action: () => editor.tables.insertColumnLeft()
			});
			menuItems.push({
				id: "insert-col-right",
				label: "Insert Column Right",
				shortcut: "Ctrl+Alt+Shift+Right",
				action: () => editor.tables.insertColumnRight()
			});

			// Divider before delete operations
			menuItems.push({ id: "table-divider-1", label: "", divider: true });

			// Delete operations
			menuItems.push({
				id: "delete-row",
				label: "Delete Row",
				shortcut: "Ctrl+Alt+Backspace",
				action: () => editor.tables.deleteCurrentRow()
			});
			menuItems.push({
				id: "delete-col",
				label: "Delete Column",
				shortcut: "Ctrl+Shift+Backspace",
				action: () => editor.tables.deleteCurrentColumn()
			});
			menuItems.push({
				id: "delete-table",
				label: "Delete Table",
				action: () => editor.tables.deleteTable()
			});

			// Divider before alignment
			menuItems.push({ id: "table-divider-2", label: "", divider: true });

			// Alignment submenu
			menuItems.push({
				id: "alignment",
				label: "Alignment",
				children: [
					{
						id: "align-left",
						label: "Align Left",
						shortcut: "Ctrl+Alt+L",
						action: () => editor.tables.setColumnAlignmentLeft()
					},
					{
						id: "align-center",
						label: "Align Center",
						shortcut: "Ctrl+Alt+C",
						action: () => editor.tables.setColumnAlignmentCenter()
					},
					{
						id: "align-right",
						label: "Align Right",
						shortcut: "Ctrl+Alt+R",
						action: () => editor.tables.setColumnAlignmentRight()
					}
				]
			});

			return menuItems;
		}

		// In lists, show inline formatting, list operations, and blockquote
		// Lists cannot contain headings, tables, or code blocks inside list items
		if (context === "list") {
			// Format submenu (inline formatting)
			menuItems.push({
				id: "format",
				label: "Format",
				children: [
					{
						id: "bold",
						label: "Bold",
						shortcut: "Ctrl+B",
						action: () => editor.inlineFormatting.toggleBold()
					},
					{
						id: "italic",
						label: "Italic",
						shortcut: "Ctrl+I",
						action: () => editor.inlineFormatting.toggleItalic()
					},
					{
						id: "strikethrough",
						label: "Strikethrough",
						shortcut: "Ctrl+Shift+S",
						action: () => editor.inlineFormatting.toggleStrikethrough()
					},
					{
						id: "inline-code",
						label: "Inline Code",
						shortcut: "Ctrl+E",
						action: () => editor.inlineFormatting.toggleInlineCode()
					},
					{
						id: "link",
						label: "Link",
						shortcut: "Ctrl+K",
						action: () => editor.links.insertLink()
					}
				]
			});

			// Lists submenu (toggle between bullet/numbered)
			menuItems.push({
				id: "lists",
				label: "Lists",
				children: [
					{
						id: "bullet-list",
						label: "Bullet List",
						shortcut: "Ctrl+Shift+[",
						action: () => editor.lists.toggleUnorderedList()
					},
					{
						id: "numbered-list",
						label: "Numbered List",
						shortcut: "Ctrl+Shift+]",
						action: () => editor.lists.toggleOrderedList()
					}
				]
			});

			// Blocks submenu (only blockquote, no code blocks or tables)
			menuItems.push({
				id: "blocks",
				label: "Blocks",
				children: [
					{
						id: "blockquote",
						label: "Blockquote",
						shortcut: "Ctrl+Shift+Q",
						action: () => editor.blockquotes.toggleBlockquote()
					}
				]
			});

			return menuItems;
		}

		// Text/Paragraph context - show everything (full menu)
		// Headings submenu
		menuItems.push({
			id: "headings",
			label: "Headings",
			children: [
				{
					id: "paragraph",
					label: "Paragraph",
					shortcut: "Ctrl+0",
					action: () => editor.headings.setHeadingLevel(0)
				},
				{
					id: "h1",
					label: "Heading 1",
					shortcut: "Ctrl+1",
					action: () => editor.headings.setHeadingLevel(1)
				},
				{
					id: "h2",
					label: "Heading 2",
					shortcut: "Ctrl+2",
					action: () => editor.headings.setHeadingLevel(2)
				},
				{
					id: "h3",
					label: "Heading 3",
					shortcut: "Ctrl+3",
					action: () => editor.headings.setHeadingLevel(3)
				},
				{
					id: "h4",
					label: "Heading 4",
					shortcut: "Ctrl+4",
					action: () => editor.headings.setHeadingLevel(4)
				},
				{
					id: "h5",
					label: "Heading 5",
					shortcut: "Ctrl+5",
					action: () => editor.headings.setHeadingLevel(5)
				},
				{
					id: "h6",
					label: "Heading 6",
					shortcut: "Ctrl+6",
					action: () => editor.headings.setHeadingLevel(6)
				}
			]
		});

		// Format submenu
		menuItems.push({
			id: "format",
			label: "Format",
			children: [
				{
					id: "bold",
					label: "Bold",
					shortcut: "Ctrl+B",
					action: () => editor.inlineFormatting.toggleBold()
				},
				{
					id: "italic",
					label: "Italic",
					shortcut: "Ctrl+I",
					action: () => editor.inlineFormatting.toggleItalic()
				},
				{
					id: "strikethrough",
					label: "Strikethrough",
					shortcut: "Ctrl+Shift+S",
					action: () => editor.inlineFormatting.toggleStrikethrough()
				},
				{
					id: "inline-code",
					label: "Inline Code",
					shortcut: "Ctrl+E",
					action: () => editor.inlineFormatting.toggleInlineCode()
				},
				{
					id: "link",
					label: "Link",
					shortcut: "Ctrl+K",
					action: () => editor.links.insertLink()
				}
			]
		});

		// Lists submenu
		menuItems.push({
			id: "lists",
			label: "Lists",
			children: [
				{
					id: "bullet-list",
					label: "Bullet List",
					shortcut: "Ctrl+Shift+[",
					action: () => editor.lists.toggleUnorderedList()
				},
				{
					id: "numbered-list",
					label: "Numbered List",
					shortcut: "Ctrl+Shift+]",
					action: () => editor.lists.toggleOrderedList()
				}
			]
		});

		// Blocks submenu (with all block options)
		menuItems.push({
			id: "blocks",
			label: "Blocks",
			children: [
				{
					id: "code-block",
					label: "Code Block",
					shortcut: "Ctrl+Shift+K",
					action: () => editor.codeBlocks.toggleCodeBlock()
				},
				{
					id: "blockquote",
					label: "Blockquote",
					shortcut: "Ctrl+Shift+Q",
					action: () => editor.blockquotes.toggleBlockquote()
				},
				{
					id: "insert-table",
					label: "Insert Table",
					shortcut: "Ctrl+Alt+Shift+T",
					action: () => editor.tables.insertTable()
				}
			]
		});

		return menuItems;
	}

	/**
	 * Show the context menu at the event position
	 */
	function show(event: MouseEvent): void {
		// Don't show context menu in readonly mode
		if (readonly?.value) return;

		event.preventDefault();

		const context = determineContext();
		const menuItems = buildItems(context);

		position.value = { x: event.clientX, y: event.clientY };
		items.value = menuItems;
		isVisible.value = true;
	}

	/**
	 * Hide the context menu
	 */
	function hide(): void {
		isVisible.value = false;
	}

	return {
		isVisible,
		position,
		items,
		show,
		hide
	};
}
