/**
 * Table Structure Utilities
 *
 * Pure DOM utility functions for table structure traversal, coordinate lookup,
 * and element creation. These operate on table elements with no composable
 * closure dependency.
 *
 * Used by useTables and its sub-modules (useTableNavigation, useTableRowOps,
 * useTableColumnOps) for shared table DOM operations.
 */

/**
 * Find the table ancestor if one exists
 */
export function findTableAncestor(
  node: Node | null,
  contentRef: HTMLElement
): HTMLTableElement | null {
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
export function findCellAncestor(
  node: Node | null,
  contentRef: HTMLElement
): HTMLTableCellElement | null {
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
export function getCellCoordinates(cell: HTMLTableCellElement): { row: number; col: number } {
  const row = cell.parentElement as HTMLTableRowElement | null;
  if (!row) return { row: -1, col: -1 };

  const table =
    (row.parentElement?.parentElement as HTMLTableElement | null) ||
    (row.parentElement as HTMLTableElement | null);
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
export function getAllTableRows(table: HTMLTableElement): HTMLTableRowElement[] {
  // Use querySelectorAll for broad compatibility (happy-dom doesn't support HTMLTableSectionElement.rows)
  return Array.from(table.querySelectorAll("tr"));
}

/**
 * Get the number of columns in a table
 */
export function getColumnCount(table: HTMLTableElement): number {
  const rows = getAllTableRows(table);
  if (rows.length === 0) return 0;
  return rows[0]!.cells.length;
}

/**
 * Get a cell at specific coordinates
 */
export function getCellAt(
  table: HTMLTableElement,
  rowIndex: number,
  colIndex: number
): HTMLTableCellElement | null {
  const rows = getAllTableRows(table);
  if (rowIndex < 0 || rowIndex >= rows.length) return null;

  const row = rows[rowIndex]!;
  if (colIndex < 0 || colIndex >= row.cells.length) return null;

  return row.cells[colIndex] ?? null;
}

/**
 * Create a table cell with initial content
 */
export function createCell(isHeader: boolean): HTMLTableCellElement {
  const cell = document.createElement(isHeader ? "th" : "td");
  // Add a BR to make empty cell focusable
  cell.appendChild(document.createElement("br"));
  return cell;
}

/**
 * Create a table row with specified number of cells
 */
export function createRow(colCount: number, isHeader: boolean): HTMLTableRowElement {
  const row = document.createElement("tr");
  for (let i = 0; i < colCount; i++) {
    row.appendChild(createCell(isHeader));
  }
  return row;
}

/**
 * Set alignment for all cells in a column
 */
export function setColumnAlignment(
  table: HTMLTableElement,
  colIndex: number,
  alignment: "left" | "center" | "right"
): void {
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
