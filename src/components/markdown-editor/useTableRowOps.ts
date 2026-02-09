/**
 * Table Row Operations Module
 *
 * Handles row-level table operations: inserting rows above/below and
 * deleting the current row. Each operation updates the DOM and notifies
 * the editor of content changes.
 *
 * Factory function receives shared table context and returns row operation methods.
 * Used by useTables to compose the full table operations interface.
 */

import { getCellCoordinates, getAllTableRows, getCellAt, createRow } from "./tableStructureUtils";
import { focusCell } from "./tableCellUtils";
import type { TableContext } from "./table-types";

/**
 * Return type for createTableRowOps factory
 */
export interface TableRowOpsReturn {
  insertRowAbove: () => void;
  insertRowBelow: () => void;
  deleteCurrentRow: () => void;
}

/**
 * Creates table row operation methods bound to the shared table context.
 */
export function createTableRowOps(ctx: TableContext): TableRowOpsReturn {
  const { getCurrentCellAndTable, notifyContentChange, deleteTable } = ctx;

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
    const newRow = createRow(colCount, false);
    row.parentNode?.insertBefore(newRow, row);

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
    const newRow = createRow(colCount, false);

    if (isInHeader) {
      let tbody = table.querySelector("tbody");
      if (!tbody) {
        tbody = document.createElement("tbody");
        table.appendChild(tbody);
      }
      tbody.insertBefore(newRow, tbody.firstChild);
    } else {
      row.parentNode?.insertBefore(newRow, row.nextSibling);
    }

    const firstNewCell = newRow.cells[0];
    if (firstNewCell) {
      focusCell(firstNewCell);
    }

    notifyContentChange();
  }

  /**
   * Delete the current row.
   * Deletes the entire table if this is the last row.
   */
  function deleteCurrentRow(): void {
    const context = getCurrentCellAndTable();
    if (!context) return;

    const { cell, table } = context;
    const row = cell.parentElement as HTMLTableRowElement | null;
    if (!row) return;

    const rows = getAllTableRows(table);

    if (rows.length <= 1) {
      deleteTable();
      return;
    }

    const { row: rowIndex, col } = getCellCoordinates(cell);
    row.remove();

    const newRows = getAllTableRows(table);
    const targetRowIndex = Math.min(rowIndex, newRows.length - 1);
    const targetCell = getCellAt(table, targetRowIndex, col);

    if (targetCell) {
      focusCell(targetCell);
    }

    notifyContentChange();
  }

  return { insertRowAbove, insertRowBelow, deleteCurrentRow };
}
