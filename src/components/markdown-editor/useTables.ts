import { Ref } from "vue";

/**
 * Position for table popover
 */
export interface TablePopoverPosition {
	x: number;
	y: number;
}

/**
 * Options passed to the onShowTablePopover callback
 */
export interface ShowTablePopoverOptions {
	/** Position in viewport where popover should appear */
	position: TablePopoverPosition;
	/** Callback to complete the table insertion with specified dimensions */
	onSubmit: (rows: number, cols: number) => void;
	/** Callback to cancel the operation */
	onCancel: () => void;
}

/**
 * Options for useTables composable
 */
export interface UseTablesOptions {
	contentRef: Ref<HTMLElement | null>;
	onContentChange: () => void;
	/** Callback to show the table popover UI for dimension selection */
	onShowTablePopover?: (options: ShowTablePopoverOptions) => void;
}

/**
 * Return type for useTables composable
 */
export interface UseTablesReturn {
	// Creation
	/** Insert a table - shows popover if callback provided, otherwise creates default 3x3 */
	insertTable: () => void;
	/** Create a table with specific dimensions */
	createTable: (rows: number, cols: number) => void;

	// Detection
	/** Check if cursor is inside a table */
	isInTable: () => boolean;
	/** Check if cursor is inside a table cell */
	isInTableCell: () => boolean;
	/** Get the current table element */
	getCurrentTable: () => HTMLTableElement | null;
	/** Get the current table cell element */
	getCurrentCell: () => HTMLTableCellElement | null;

	// Navigation
	/** Navigate to the next cell (right, then next row). Returns false if at end. */
	navigateToNextCell: () => boolean;
	/** Navigate to the previous cell. Returns false if at start. */
	navigateToPreviousCell: () => boolean;
	/** Navigate to the cell directly below. Returns false if at bottom row. */
	navigateToCellBelow: () => boolean;
	/** Navigate to the cell directly above. Returns false if at top row. */
	navigateToCellAbove: () => boolean;

	// Row operations
	/** Insert a new row above the current row */
	insertRowAbove: () => void;
	/** Insert a new row below the current row */
	insertRowBelow: () => void;
	/** Delete the current row */
	deleteCurrentRow: () => void;

	// Column operations
	/** Insert a new column to the left */
	insertColumnLeft: () => void;
	/** Insert a new column to the right */
	insertColumnRight: () => void;
	/** Delete the current column */
	deleteCurrentColumn: () => void;

	// Table operations
	/** Delete the entire table */
	deleteTable: () => void;

	// Alignment
	/** Set column alignment to left */
	setColumnAlignmentLeft: () => void;
	/** Set column alignment to center */
	setColumnAlignmentCenter: () => void;
	/** Set column alignment to right */
	setColumnAlignmentRight: () => void;

	// Key handlers
	/** Handle Tab key in table - returns true if handled */
	handleTableTab: (shift: boolean) => boolean;
	/** Handle Enter key in table - returns true if handled */
	handleTableEnter: () => boolean;
}

/**
 * Get the cursor position in viewport coordinates
 */
function getCursorPosition(): TablePopoverPosition {
	const selection = window.getSelection();
	if (!selection || !selection.rangeCount) {
		return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
	}

	const range = selection.getRangeAt(0);
	const rect = range.getBoundingClientRect();

	// If rect has no dimensions (collapsed cursor), use the start position
	if (rect.width === 0 && rect.height === 0) {
		return {
			x: rect.left || window.innerWidth / 2,
			y: rect.bottom || window.innerHeight / 2
		};
	}

	// Center horizontally on the selection, position below
	return {
		x: rect.left + (rect.width / 2),
		y: rect.bottom
	};
}

/**
 * Find the table ancestor if one exists
 */
function findTableAncestor(node: Node | null, contentRef: HTMLElement): HTMLTableElement | null {
	if (!node) return null;

	let current: Node | null = node;
	while (current && current !== contentRef) {
		if (current.nodeType === Node.ELEMENT_NODE && (current as Element).tagName === "TABLE") {
			return current as HTMLTableElement;
		}
		current = current.parentNode;
	}

	return null;
}

/**
 * Find the table cell (TD or TH) ancestor if one exists
 */
function findCellAncestor(node: Node | null, contentRef: HTMLElement): HTMLTableCellElement | null {
	if (!node) return null;

	let current: Node | null = node;
	while (current && current !== contentRef) {
		if (current.nodeType === Node.ELEMENT_NODE) {
			const tag = (current as Element).tagName;
			if (tag === "TD" || tag === "TH") {
				return current as HTMLTableCellElement;
			}
		}
		current = current.parentNode;
	}

	return null;
}

/**
 * Get the row and column indices of a cell
 */
function getCellCoordinates(cell: HTMLTableCellElement): { row: number; col: number } {
	const row = cell.parentElement as HTMLTableRowElement | null;
	if (!row) return { row: -1, col: -1 };

	const table = row.parentElement?.parentElement as HTMLTableElement | null
		|| row.parentElement as HTMLTableElement | null;
	if (!table) return { row: -1, col: -1 };

	// Get column index
	const colIndex = Array.from(row.cells).indexOf(cell);

	// Get row index (accounting for thead/tbody)
	let rowIndex = 0;
	const rows = getAllTableRows(table);
	for (let i = 0; i < rows.length; i++) {
		if (rows[i] === row) {
			rowIndex = i;
			break;
		}
	}

	return { row: rowIndex, col: colIndex };
}

/**
 * Get all rows from a table (including thead and tbody)
 */
function getAllTableRows(table: HTMLTableElement): HTMLTableRowElement[] {
	// Use querySelectorAll for broad compatibility (happy-dom doesn't support HTMLTableSectionElement.rows)
	return Array.from(table.querySelectorAll("tr"));
}

/**
 * Get the number of columns in a table
 */
function getColumnCount(table: HTMLTableElement): number {
	const rows = getAllTableRows(table);
	if (rows.length === 0) return 0;
	return rows[0]!.cells.length;
}

/**
 * Get a cell at specific coordinates
 */
function getCellAt(table: HTMLTableElement, rowIndex: number, colIndex: number): HTMLTableCellElement | null {
	const rows = getAllTableRows(table);
	if (rowIndex < 0 || rowIndex >= rows.length) return null;

	const row = rows[rowIndex]!;
	if (colIndex < 0 || colIndex >= row.cells.length) return null;

	return row.cells[colIndex] ?? null;
}

/**
 * Get the cursor offset (character position) within a cell
 * This measures the text length from the start of the cell to the cursor position
 */
function getCursorOffsetInCell(cell: HTMLTableCellElement): number {
	const selection = window.getSelection();
	if (!selection || !selection.rangeCount) return 0;

	const range = selection.getRangeAt(0);

	// Create a range from cell start to cursor position
	const preCaretRange = document.createRange();
	preCaretRange.selectNodeContents(cell);
	preCaretRange.setEnd(range.startContainer, range.startOffset);

	// Get text length up to cursor
	return preCaretRange.toString().length;
}

/**
 * Set the cursor at a specific character offset within a cell
 * If the offset exceeds the cell's text length, places cursor at the end
 */
function setCursorOffsetInCell(cell: HTMLTableCellElement, targetOffset: number): void {
	const selection = window.getSelection();
	if (!selection) return;

	const textContent = cell.textContent || "";
	const maxOffset = textContent.length;
	const offset = Math.min(targetOffset, maxOffset);

	// Find the text node and position for this offset
	let currentOffset = 0;
	const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
	let node: Text | null = null;

	while ((node = walker.nextNode() as Text | null)) {
		const nodeLength = node.textContent?.length || 0;
		if (currentOffset + nodeLength >= offset) {
			// Found the right node
			const range = document.createRange();
			range.setStart(node, offset - currentOffset);
			range.collapse(true);
			selection.removeAllRanges();
			selection.addRange(range);
			return;
		}
		currentOffset += nodeLength;
	}

	// Fallback: place at end of cell
	const range = document.createRange();
	range.selectNodeContents(cell);
	range.collapse(false);
	selection.removeAllRanges();
	selection.addRange(range);
}

/**
 * Get the first text node with actual content in an element
 */
function getFirstTextNode(node: Node): Text | null {
	if (node.nodeType === Node.TEXT_NODE) {
		// Return the text node even if it's empty/whitespace - we can position at offset 0
		return node as Text;
	}
	for (const child of Array.from(node.childNodes)) {
		// Skip BR elements - they're placeholders for empty cells
		if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName === "BR") {
			continue;
		}
		const found = getFirstTextNode(child);
		if (found) return found;
	}
	return null;
}

/**
 * Place cursor at the start of a cell without selecting text
 */
function focusCell(cell: HTMLTableCellElement): void {
	const selection = window.getSelection();
	if (!selection) return;

	const range = document.createRange();

	// Find first text node
	const firstTextNode = getFirstTextNode(cell);

	if (firstTextNode) {
		// Place cursor at start of text node
		range.setStart(firstTextNode, 0);
		range.collapse(true); // Collapse to start, no selection
	} else {
		// Empty cell or only has BR - position at start of cell contents
		range.selectNodeContents(cell);
		range.collapse(true); // Collapse to start, no selection
	}

	selection.removeAllRanges();
	selection.addRange(range);

	// Ensure the cell element itself has focus for keyboard events
	cell.focus();
}

/**
 * Select all content in a cell
 */
function selectCellContent(cell: HTMLTableCellElement): void {
	const selection = window.getSelection();
	if (!selection) return;

	const range = document.createRange();
	range.selectNodeContents(cell);
	selection.removeAllRanges();
	selection.addRange(range);
}

/**
 * Dispatch an input event to trigger content sync
 */
function dispatchInputEvent(element: HTMLElement): void {
	element.dispatchEvent(new InputEvent("input", { bubbles: true }));
}

/**
 * Get the current selection range if valid
 */
function getCurrentSelectionRange(): Range | null {
	const selection = window.getSelection();
	if (!selection || !selection.rangeCount) return null;
	return selection.getRangeAt(0);
}

/**
 * Create a table cell with initial content
 */
function createCell(isHeader: boolean): HTMLTableCellElement {
	const cell = document.createElement(isHeader ? "th" : "td");
	// Add a BR to make empty cell focusable
	cell.appendChild(document.createElement("br"));
	return cell;
}

/**
 * Create a table row with specified number of cells
 */
function createRow(colCount: number, isHeader: boolean): HTMLTableRowElement {
	const row = document.createElement("tr");
	for (let i = 0; i < colCount; i++) {
		row.appendChild(createCell(isHeader));
	}
	return row;
}

/**
 * Set alignment for all cells in a column
 */
function setColumnAlignment(table: HTMLTableElement, colIndex: number, alignment: "left" | "center" | "right"): void {
	const rows = getAllTableRows(table);
	for (const row of rows) {
		const cell = row.cells[colIndex];
		if (cell) {
			if (alignment === "left") {
				cell.style.removeProperty("text-align");
			} else {
				cell.style.textAlign = alignment;
			}
		}
	}
}

/**
 * Composable for table operations in markdown editor
 */
export function useTables(options: UseTablesOptions): UseTablesReturn {
	const { contentRef, onContentChange, onShowTablePopover } = options;

	// Store the selection range so we can restore it after popover interaction
	let savedRange: Range | null = null;

	/**
	 * Save the current selection for later restoration
	 */
	function saveSelection(): void {
		const selection = window.getSelection();
		if (selection && selection.rangeCount > 0) {
			savedRange = selection.getRangeAt(0).cloneRange();
		}
	}

	/**
	 * Restore the previously saved selection
	 */
	function restoreSelection(): void {
		if (savedRange) {
			const selection = window.getSelection();
			selection?.removeAllRanges();
			selection?.addRange(savedRange);
		}
	}

	/**
	 * Check if cursor is inside a table
	 */
	function isInTable(): boolean {
		return getCurrentTable() !== null;
	}

	/**
	 * Check if cursor is inside a table cell
	 */
	function isInTableCell(): boolean {
		return getCurrentCell() !== null;
	}

	/**
	 * Get the current table element
	 */
	function getCurrentTable(): HTMLTableElement | null {
		if (!contentRef.value) return null;
		const range = getCurrentSelectionRange();
		if (!range) return null;
		return findTableAncestor(range.startContainer, contentRef.value);
	}

	/**
	 * Get the current table cell element
	 */
	function getCurrentCell(): HTMLTableCellElement | null {
		if (!contentRef.value) return null;
		const range = getCurrentSelectionRange();
		if (!range) return null;
		return findCellAncestor(range.startContainer, contentRef.value);
	}

	/**
	 * Get both current cell and table, or null if not in a table
	 */
	function getCurrentCellAndTable(): { cell: HTMLTableCellElement; table: HTMLTableElement } | null {
		const cell = getCurrentCell();
		const table = getCurrentTable();
		if (!cell || !table) return null;
		return { cell, table };
	}

	/**
	 * Helper to notify content changes after table modifications
	 */
	function notifyContentChange(): void {
		if (contentRef.value) {
			dispatchInputEvent(contentRef.value);
			onContentChange();
		}
	}

	/**
	 * Insert a table - shows popover if callback provided, otherwise creates default 3x3
	 */
	function insertTable(): void {
		if (!contentRef.value) return;

		saveSelection();
		const position = getCursorPosition();

		if (onShowTablePopover) {
			onShowTablePopover({
				position,
				onSubmit: (rows: number, cols: number) => {
					restoreSelection();
					createTable(rows, cols);
				},
				onCancel: () => {
					restoreSelection();
					contentRef.value?.focus();
				}
			});
		} else {
			// Default to 3x3 table if no popover callback
			createTable(3, 3);
		}
	}

	/**
	 * Create a table with specific dimensions
	 */
	function createTable(rows: number, cols: number): void {
		if (!contentRef.value) return;
		if (rows < 1 || cols < 1) return;

		const range = getCurrentSelectionRange();
		if (!range) return;

		// Check if selection is within our content area
		if (!contentRef.value.contains(range.startContainer)) return;

		// Create table structure
		const table = document.createElement("table");

		// Create thead with first row (headers)
		const thead = document.createElement("thead");
		thead.appendChild(createRow(cols, true));
		table.appendChild(thead);

		// Create tbody with remaining rows
		if (rows > 1) {
			const tbody = document.createElement("tbody");
			for (let i = 1; i < rows; i++) {
				tbody.appendChild(createRow(cols, false));
			}
			table.appendChild(tbody);
		}

		// Insert table at cursor position
		// First, find a suitable insertion point
		let insertionPoint: Node | null = range.startContainer;

		// Walk up to find a block-level element
		while (insertionPoint && insertionPoint !== contentRef.value) {
			if (insertionPoint.nodeType === Node.ELEMENT_NODE) {
				const tag = (insertionPoint as Element).tagName;
				if (["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6"].includes(tag)) {
					break;
				}
			}
			insertionPoint = insertionPoint.parentNode;
		}

		if (insertionPoint && insertionPoint !== contentRef.value) {
			// Insert table after the current block
			insertionPoint.parentNode?.insertBefore(table, insertionPoint.nextSibling);
		} else {
			// Insert at end of content
			contentRef.value.appendChild(table);
		}

		// Focus the first cell
		const firstCell = table.querySelector("th, td") as HTMLTableCellElement | null;
		if (firstCell) {
			focusCell(firstCell);
		}

		notifyContentChange();
	}

	/**
	 * Navigate to the next cell (right, then next row)
	 * Returns false if at the end of the table
	 */
	function navigateToNextCell(): boolean {
		const context = getCurrentCellAndTable();
		if (!context) return false;

		const { cell, table } = context;
		const { row, col } = getCellCoordinates(cell);
		const rows = getAllTableRows(table);
		const colCount = getColumnCount(table);

		// Try next column
		if (col + 1 < colCount) {
			const nextCell = getCellAt(table, row, col + 1);
			if (nextCell) {
				selectCellContent(nextCell);
				return true;
			}
		}

		// Try first column of next row
		if (row + 1 < rows.length) {
			const nextCell = getCellAt(table, row + 1, 0);
			if (nextCell) {
				selectCellContent(nextCell);
				return true;
			}
		}

		return false;
	}

	/**
	 * Navigate to the previous cell
	 * Returns false if at the start of the table
	 */
	function navigateToPreviousCell(): boolean {
		const context = getCurrentCellAndTable();
		if (!context) return false;

		const { cell, table } = context;
		const { row, col } = getCellCoordinates(cell);
		const colCount = getColumnCount(table);

		// Try previous column
		if (col > 0) {
			const prevCell = getCellAt(table, row, col - 1);
			if (prevCell) {
				selectCellContent(prevCell);
				return true;
			}
		}

		// Try last column of previous row
		if (row > 0) {
			const prevCell = getCellAt(table, row - 1, colCount - 1);
			if (prevCell) {
				selectCellContent(prevCell);
				return true;
			}
		}

		return false;
	}

	/**
	 * Navigate to the cell directly below
	 * Returns false if at the bottom row of the table
	 * Preserves cursor offset position from the source cell
	 */
	function navigateToCellBelow(): boolean {
		const context = getCurrentCellAndTable();
		if (!context) return false;

		const { cell, table } = context;

		// Get current cursor offset BEFORE navigating
		const cursorOffset = getCursorOffsetInCell(cell);

		const { row, col } = getCellCoordinates(cell);
		const rows = getAllTableRows(table);

		if (row + 1 < rows.length) {
			const belowCell = getCellAt(table, row + 1, col);
			if (belowCell) {
				// Set cursor at same offset in target cell (clamped to cell length)
				setCursorOffsetInCell(belowCell, cursorOffset);
				return true;
			}
		}

		return false;
	}

	/**
	 * Navigate to the cell directly above
	 * Returns false if at the top row of the table
	 * Preserves cursor offset position from the source cell
	 */
	function navigateToCellAbove(): boolean {
		const context = getCurrentCellAndTable();
		if (!context) return false;

		const { cell, table } = context;

		// Get current cursor offset BEFORE navigating
		const cursorOffset = getCursorOffsetInCell(cell);

		const { row, col } = getCellCoordinates(cell);

		if (row > 0) {
			const aboveCell = getCellAt(table, row - 1, col);
			if (aboveCell) {
				// Set cursor at same offset in target cell (clamped to cell length)
				setCursorOffsetInCell(aboveCell, cursorOffset);
				return true;
			}
		}

		return false;
	}

	/**
	 * Insert a new row above the current row
	 */
	function insertRowAbove(): void {
		const context = getCurrentCellAndTable();
		if (!context) return;

		const { cell } = context;
		const row = cell.parentElement as HTMLTableRowElement | null;
		if (!row) return;

		const colCount = row.cells.length;

		// Create new row (use TD cells even if inserting above header)
		const newRow = createRow(colCount, false);

		// Insert new row
		row.parentNode?.insertBefore(newRow, row);

		// Focus the first cell of the new row
		const firstNewCell = newRow.cells[0];
		if (firstNewCell) {
			focusCell(firstNewCell);
		}

		notifyContentChange();
	}

	/**
	 * Insert a new row below the current row
	 */
	function insertRowBelow(): void {
		const context = getCurrentCellAndTable();
		if (!context) return;

		const { cell, table } = context;
		const row = cell.parentElement as HTMLTableRowElement | null;
		if (!row) return;

		const colCount = row.cells.length;
		const isInHeader = row.parentElement?.tagName === "THEAD";

		// Create new row with TD cells
		const newRow = createRow(colCount, false);

		// If inserting below header row, insert into tbody
		if (isInHeader) {
			// Ensure tbody exists
			let tbody = table.querySelector("tbody");
			if (!tbody) {
				tbody = document.createElement("tbody");
				table.appendChild(tbody);
			}
			// Insert at beginning of tbody
			tbody.insertBefore(newRow, tbody.firstChild);
		} else {
			// Insert after current row
			row.parentNode?.insertBefore(newRow, row.nextSibling);
		}

		// Focus the first cell of the new row
		const firstNewCell = newRow.cells[0];
		if (firstNewCell) {
			focusCell(firstNewCell);
		}

		notifyContentChange();
	}

	/**
	 * Delete the current row
	 */
	function deleteCurrentRow(): void {
		const context = getCurrentCellAndTable();
		if (!context) return;

		const { cell, table } = context;
		const row = cell.parentElement as HTMLTableRowElement | null;
		if (!row) return;

		const rows = getAllTableRows(table);

		// If this is the last row, delete the entire table
		if (rows.length <= 1) {
			deleteTable();
			return;
		}

		const { row: rowIndex, col } = getCellCoordinates(cell);

		// Remove the row
		row.remove();

		// Focus a cell in an adjacent row
		const newRows = getAllTableRows(table);
		const targetRowIndex = Math.min(rowIndex, newRows.length - 1);
		const targetCell = getCellAt(table, targetRowIndex, col);

		if (targetCell) {
			focusCell(targetCell);
		}

		notifyContentChange();
	}

	/**
	 * Insert a new column to the left
	 */
	function insertColumnLeft(): void {
		const context = getCurrentCellAndTable();
		if (!context) return;

		const { cell, table } = context;
		const { col } = getCellCoordinates(cell);
		const rows = getAllTableRows(table);

		// Insert a cell in each row at the specified column
		for (const row of rows) {
			const isHeader = row.parentElement?.tagName === "THEAD";
			const newCell = createCell(isHeader);
			const referenceCell = row.cells[col];
			if (referenceCell) {
				row.insertBefore(newCell, referenceCell);
			} else {
				row.appendChild(newCell);
			}
		}

		// Focus the new cell in the current row
		const currentRow = cell.parentElement as HTMLTableRowElement;
		const newCell = currentRow?.cells[col];
		if (newCell) {
			focusCell(newCell);
		}

		notifyContentChange();
	}

	/**
	 * Insert a new column to the right
	 */
	function insertColumnRight(): void {
		const context = getCurrentCellAndTable();
		if (!context) return;

		const { cell, table } = context;
		const { col } = getCellCoordinates(cell);
		const rows = getAllTableRows(table);

		// Insert a cell in each row after the specified column
		for (const row of rows) {
			const isHeader = row.parentElement?.tagName === "THEAD";
			const newCell = createCell(isHeader);
			const referenceCell = row.cells[col + 1];
			if (referenceCell) {
				row.insertBefore(newCell, referenceCell);
			} else {
				row.appendChild(newCell);
			}
		}

		// Focus the new cell in the current row
		const currentRow = cell.parentElement as HTMLTableRowElement;
		const newCell = currentRow?.cells[col + 1];
		if (newCell) {
			focusCell(newCell);
		}

		notifyContentChange();
	}

	/**
	 * Delete the current column
	 */
	function deleteCurrentColumn(): void {
		const context = getCurrentCellAndTable();
		if (!context) return;

		const { cell, table } = context;
		const { row: rowIndex, col } = getCellCoordinates(cell);
		const colCount = getColumnCount(table);
		const rows = getAllTableRows(table);

		// If this is the last column, delete the entire table
		if (colCount <= 1) {
			deleteTable();
			return;
		}

		// Remove the cell from each row
		for (const row of rows) {
			const cellToRemove = row.cells[col];
			if (cellToRemove) {
				cellToRemove.remove();
			}
		}

		// Focus a cell in an adjacent column
		const targetColIndex = Math.min(col, colCount - 2);
		const targetCell = getCellAt(table, rowIndex, targetColIndex);

		if (targetCell) {
			focusCell(targetCell);
		}

		notifyContentChange();
	}

	/**
	 * Delete the entire table
	 */
	function deleteTable(): void {
		if (!contentRef.value) return;

		const table = getCurrentTable();
		if (!table) return;

		// Get the next sibling to focus after deletion
		const nextSibling = table.nextElementSibling;
		const prevSibling = table.previousElementSibling;

		// Remove the table
		table.remove();

		// Try to focus next/previous element or create a paragraph
		if (nextSibling && (nextSibling as HTMLElement).focus) {
			const focusable = nextSibling.querySelector("[contenteditable], input, textarea") as HTMLElement
				|| nextSibling as HTMLElement;
			if (focusable.focus) {
				focusable.focus();
			}
		} else if (prevSibling && (prevSibling as HTMLElement).focus) {
			const focusable = prevSibling.querySelector("[contenteditable], input, textarea") as HTMLElement
				|| prevSibling as HTMLElement;
			if (focusable.focus) {
				focusable.focus();
			}
		} else {
			// Create a paragraph if the content area is now empty
			if (contentRef.value.children.length === 0) {
				const p = document.createElement("p");
				p.appendChild(document.createElement("br"));
				contentRef.value.appendChild(p);
				focusCell(p as unknown as HTMLTableCellElement);
			}
		}

		notifyContentChange();
	}

	/**
	 * Set column alignment to left
	 */
	function setColumnAlignmentLeft(): void {
		const context = getCurrentCellAndTable();
		if (!context) return;

		const { cell, table } = context;
		const { col } = getCellCoordinates(cell);
		setColumnAlignment(table, col, "left");
		notifyContentChange();
	}

	/**
	 * Set column alignment to center
	 */
	function setColumnAlignmentCenter(): void {
		const context = getCurrentCellAndTable();
		if (!context) return;

		const { cell, table } = context;
		const { col } = getCellCoordinates(cell);
		setColumnAlignment(table, col, "center");
		notifyContentChange();
	}

	/**
	 * Set column alignment to right
	 */
	function setColumnAlignmentRight(): void {
		const context = getCurrentCellAndTable();
		if (!context) return;

		const { cell, table } = context;
		const { col } = getCellCoordinates(cell);
		setColumnAlignment(table, col, "right");
		notifyContentChange();
	}

	/**
	 * Handle Tab key in table
	 * - Tab: navigate to next cell, create new row if at end
	 * - Shift+Tab: navigate to previous cell, exit table if at start
	 * @returns true if handled, false to let browser handle it
	 */
	function handleTableTab(shift: boolean): boolean {
		if (!isInTableCell()) return false;

		if (shift) {
			// Shift+Tab: go to previous cell
			const moved = navigateToPreviousCell();
			if (!moved) {
				// At start of table - exit table (return false to let browser handle)
				return false;
			}
			return true;
		} else {
			// Tab: go to next cell
			const moved = navigateToNextCell();
			if (!moved) {
				// At end of table - create new row
				insertRowBelow();
				const table = getCurrentTable();
				if (table) {
					const rows = getAllTableRows(table);
					const lastRow = rows[rows.length - 1];
					if (lastRow && lastRow.cells[0]) {
						focusCell(lastRow.cells[0]);
					}
				}
			}
			return true;
		}
	}

	/**
	 * Handle Enter key in table
	 * - Moves to cell directly below
	 * - Creates new row if at bottom
	 * @returns true if handled, false to let browser handle it
	 */
	function handleTableEnter(): boolean {
		if (!isInTableCell()) return false;

		const moved = navigateToCellBelow();
		if (!moved) {
			// At bottom of table - create new row
			insertRowBelow();
			// Navigate to the new row
			navigateToCellBelow();
		}

		return true;
	}

	return {
		// Creation
		insertTable,
		createTable,

		// Detection
		isInTable,
		isInTableCell,
		getCurrentTable,
		getCurrentCell,

		// Navigation
		navigateToNextCell,
		navigateToPreviousCell,
		navigateToCellBelow,
		navigateToCellAbove,

		// Row operations
		insertRowAbove,
		insertRowBelow,
		deleteCurrentRow,

		// Column operations
		insertColumnLeft,
		insertColumnRight,
		deleteCurrentColumn,

		// Table operations
		deleteTable,

		// Alignment
		setColumnAlignmentLeft,
		setColumnAlignmentCenter,
		setColumnAlignmentRight,

		// Key handlers
		handleTableTab,
		handleTableEnter
	};
}
