/**
 * Table Column Operations Module
 *
 * Handles column-level table operations: inserting columns left/right,
 * deleting the current column, setting column alignment, and deleting
 * the entire table. Each operation updates the DOM and notifies the
 * editor of content changes.
 *
 * Factory function receives shared table context and returns column/table
 * operation methods. Used by useTables to compose the full table operations interface.
 */

import {
  getCellCoordinates,
  getAllTableRows,
  getColumnCount,
  getCellAt,
  createCell,
  setColumnAlignment,
} from "./tableStructureUtils";
import { focusCell } from "./tableCellUtils";
import type { TableContext } from "./table-types";

/**
 * Return type for createTableColumnOps factory
 */
export interface TableColumnOpsReturn {
  insertColumnLeft: () => void;
  insertColumnRight: () => void;
  deleteCurrentColumn: () => void;
  deleteTable: () => void;
  setColumnAlignmentLeft: () => void;
  setColumnAlignmentCenter: () => void;
  setColumnAlignmentRight: () => void;
}

/**
 * Creates table column/table operation methods bound to the shared table context.
 */
export function createTableColumnOps(ctx: TableContext): TableColumnOpsReturn {
  const { contentRef, getCurrentCellAndTable, getCurrentTable, notifyContentChange } = ctx;

  /**
   * Insert a new column to the left
   */
  function insertColumnLeft(): void {
    const context = getCurrentCellAndTable();
    if (!context) return;

    const { cell, table } = context;
    const { col } = getCellCoordinates(cell);
    const rows = getAllTableRows(table);

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

    const currentRow = cell.parentElement as HTMLTableRowElement;
    const newCell = currentRow?.cells[col + 1];
    if (newCell) {
      focusCell(newCell);
    }

    notifyContentChange();
  }

  /**
   * Delete the current column.
   * Deletes the entire table if this is the last column.
   */
  function deleteCurrentColumn(): void {
    const context = getCurrentCellAndTable();
    if (!context) return;

    const { cell, table } = context;
    const { row: rowIndex, col } = getCellCoordinates(cell);
    const colCount = getColumnCount(table);
    const rows = getAllTableRows(table);

    if (colCount <= 1) {
      deleteTable();
      return;
    }

    for (const row of rows) {
      const cellToRemove = row.cells[col];
      if (cellToRemove) {
        cellToRemove.remove();
      }
    }

    const targetColIndex = Math.min(col, colCount - 2);
    const targetCell = getCellAt(table, rowIndex, targetColIndex);

    if (targetCell) {
      focusCell(targetCell);
    }

    notifyContentChange();
  }

  /**
   * Delete the entire table.
   * Focuses adjacent content or creates a paragraph if content area becomes empty.
   */
  function deleteTable(): void {
    if (!contentRef.value) return;

    const table = getCurrentTable();
    if (!table) return;

    const nextSibling = table.nextElementSibling;
    const prevSibling = table.previousElementSibling;

    table.remove();

    if (nextSibling && (nextSibling as HTMLElement).focus) {
      const focusable =
        (nextSibling.querySelector("[contenteditable], input, textarea") as HTMLElement) ||
        (nextSibling as HTMLElement);
      if (focusable.focus) {
        focusable.focus();
      }
    } else if (prevSibling && (prevSibling as HTMLElement).focus) {
      const focusable =
        (prevSibling.querySelector("[contenteditable], input, textarea") as HTMLElement) ||
        (prevSibling as HTMLElement);
      if (focusable.focus) {
        focusable.focus();
      }
    } else {
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
   * Apply an alignment to the current cell's column
   */
  function applyColumnAlignment(alignment: "left" | "center" | "right"): void {
    const context = getCurrentCellAndTable();
    if (!context) return;

    const { cell, table } = context;
    const { col } = getCellCoordinates(cell);
    setColumnAlignment(table, col, alignment);
    notifyContentChange();
  }

  function setColumnAlignmentLeft(): void {
    applyColumnAlignment("left");
  }

  function setColumnAlignmentCenter(): void {
    applyColumnAlignment("center");
  }

  function setColumnAlignmentRight(): void {
    applyColumnAlignment("right");
  }

  return {
    insertColumnLeft,
    insertColumnRight,
    deleteCurrentColumn,
    deleteTable,
    setColumnAlignmentLeft,
    setColumnAlignmentCenter,
    setColumnAlignmentRight,
  };
}
