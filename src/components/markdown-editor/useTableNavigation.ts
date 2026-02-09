/**
 * Table Navigation Module
 *
 * Handles cursor navigation between table cells: next/previous cell,
 * cell above/below, and key handlers (Tab, Enter) that delegate to
 * navigation functions.
 *
 * Factory function receives shared table context and returns navigation methods.
 * Used by useTables to compose the full table operations interface.
 */

import {
  getCellCoordinates,
  getAllTableRows,
  getColumnCount,
  getCellAt,
} from "./tableStructureUtils";
import {
  getCursorOffsetInCell,
  setCursorOffsetInCell,
  focusCell,
  selectCellContent,
} from "./tableCellUtils";
import type { TableContext } from "./table-types";

/**
 * Return type for createTableNavigation factory
 */
export interface TableNavigationReturn {
  navigateToNextCell: () => boolean;
  navigateToPreviousCell: () => boolean;
  navigateToCellBelow: () => boolean;
  navigateToCellAbove: () => boolean;
  handleTableTab: (shift: boolean) => boolean;
  handleTableEnter: () => boolean;
}

/**
 * Creates table navigation methods bound to the shared table context.
 */
export function createTableNavigation(ctx: TableContext): TableNavigationReturn {
  const { isInTableCell, getCurrentCellAndTable, getCurrentTable, insertRowBelow } = ctx;

  /**
   * Navigate to the next cell (right, then next row).
   * Returns false if at the end of the table.
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
   * Navigate to the previous cell.
   * Returns false if at the start of the table.
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
   * Navigate to the cell directly below.
   * Returns false if at the bottom row of the table.
   * Preserves cursor offset position from the source cell.
   */
  function navigateToCellBelow(): boolean {
    const context = getCurrentCellAndTable();
    if (!context) return false;

    const { cell, table } = context;
    const cursorOffset = getCursorOffsetInCell(cell);
    const { row, col } = getCellCoordinates(cell);
    const rows = getAllTableRows(table);

    if (row + 1 < rows.length) {
      const belowCell = getCellAt(table, row + 1, col);
      if (belowCell) {
        setCursorOffsetInCell(belowCell, cursorOffset);
        return true;
      }
    }

    return false;
  }

  /**
   * Navigate to the cell directly above.
   * Returns false if at the top row of the table.
   * Preserves cursor offset position from the source cell.
   */
  function navigateToCellAbove(): boolean {
    const context = getCurrentCellAndTable();
    if (!context) return false;

    const { cell, table } = context;
    const cursorOffset = getCursorOffsetInCell(cell);
    const { row, col } = getCellCoordinates(cell);

    if (row > 0) {
      const aboveCell = getCellAt(table, row - 1, col);
      if (aboveCell) {
        setCursorOffsetInCell(aboveCell, cursorOffset);
        return true;
      }
    }

    return false;
  }

  /**
   * Handle Tab key in table.
   * Tab navigates to next cell, creates new row if at end.
   * Shift+Tab navigates to previous cell, exits table if at start.
   * Returns true if handled, false to let browser handle it.
   */
  function handleTableTab(shift: boolean): boolean {
    if (!isInTableCell()) return false;

    if (shift) {
      const moved = navigateToPreviousCell();
      if (!moved) {
        return false;
      }
      return true;
    } else {
      const moved = navigateToNextCell();
      if (!moved) {
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
   * Handle Enter key in table.
   * Moves to cell directly below, creates new row if at bottom.
   * Returns true if handled, false to let browser handle it.
   */
  function handleTableEnter(): boolean {
    if (!isInTableCell()) return false;

    const moved = navigateToCellBelow();
    if (!moved) {
      insertRowBelow();
      navigateToCellBelow();
    }

    return true;
  }

  return {
    navigateToNextCell,
    navigateToPreviousCell,
    navigateToCellBelow,
    navigateToCellAbove,
    handleTableTab,
    handleTableEnter,
  };
}
