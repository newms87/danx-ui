/**
 * Table Operations Composable
 *
 * Orchestrates table functionality by composing domain-specific modules:
 * - useTableNavigation: Cell navigation and key handlers (Tab, Enter)
 * - useTableRowOps: Row insertion and deletion
 * - useTableColumnOps: Column operations, alignment, and table deletion
 *
 * Provides detection methods (isInTable, isInTableCell, getCurrentTable,
 * getCurrentCell) and creation methods (insertTable, createTable) directly,
 * while delegating domain operations to sub-modules via a shared TableContext.
 *
 * @see tableStructureUtils.ts for DOM traversal utilities
 * @see tableCellUtils.ts for cursor/selection utilities
 * @see table-types.ts for the shared TableContext interface
 */

import { Ref } from "vue";
import {
  CursorViewportPosition,
  createSelectionManager,
  dispatchInputEvent,
  getCursorViewportPosition,
} from "./cursorPosition";
import { findTableAncestor, findCellAncestor, createRow } from "./tableStructureUtils";
import { focusCell, getCurrentSelectionRange } from "./tableCellUtils";
import { createTableNavigation } from "./useTableNavigation";
import { createTableRowOps } from "./useTableRowOps";
import { createTableColumnOps } from "./useTableColumnOps";
import type { TableContext } from "./table-types";

/**
 * Options passed to the onShowTablePopover callback
 */
export interface ShowTablePopoverOptions {
  /** Position in viewport where popover should appear */
  position: CursorViewportPosition;
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
  insertTable: () => void;
  createTable: (rows: number, cols: number) => void;
  isInTable: () => boolean;
  isInTableCell: () => boolean;
  getCurrentTable: () => HTMLTableElement | null;
  getCurrentCell: () => HTMLTableCellElement | null;
  navigateToNextCell: () => boolean;
  navigateToPreviousCell: () => boolean;
  navigateToCellBelow: () => boolean;
  navigateToCellAbove: () => boolean;
  insertRowAbove: () => void;
  insertRowBelow: () => void;
  deleteCurrentRow: () => void;
  insertColumnLeft: () => void;
  insertColumnRight: () => void;
  deleteCurrentColumn: () => void;
  deleteTable: () => void;
  setColumnAlignmentLeft: () => void;
  setColumnAlignmentCenter: () => void;
  setColumnAlignmentRight: () => void;
  handleTableTab: (shift: boolean) => boolean;
  handleTableEnter: () => boolean;
}

/**
 * Composable for table operations in markdown editor.
 * Composes navigation, row, and column sub-modules via a shared context.
 */
export function useTables(options: UseTablesOptions): UseTablesReturn {
  const { contentRef, onContentChange, onShowTablePopover } = options;
  const { save: saveSelection, restore: restoreSelection } = createSelectionManager();

  function isInTable(): boolean {
    return getCurrentTable() !== null;
  }

  function isInTableCell(): boolean {
    return getCurrentCell() !== null;
  }

  function getCurrentTable(): HTMLTableElement | null {
    if (!contentRef.value) return null;
    const range = getCurrentSelectionRange();
    if (!range) return null;
    return findTableAncestor(range.startContainer, contentRef.value);
  }

  function getCurrentCell(): HTMLTableCellElement | null {
    if (!contentRef.value) return null;
    const range = getCurrentSelectionRange();
    if (!range) return null;
    return findCellAncestor(range.startContainer, contentRef.value);
  }

  function getCurrentCellAndTable(): {
    cell: HTMLTableCellElement;
    table: HTMLTableElement;
  } | null {
    const cell = getCurrentCell();
    const table = getCurrentTable();
    if (!cell || !table) return null;
    return { cell, table };
  }

  function notifyContentChange(): void {
    if (contentRef.value) {
      dispatchInputEvent(contentRef.value);
      onContentChange();
    }
  }

  // Build shared context with late-bound cross-module references
  const ctx: TableContext = {
    contentRef,
    isInTableCell,
    getCurrentTable,
    getCurrentCellAndTable,
    notifyContentChange,
    // Late-bound: resolved after sub-modules are created
    insertRowBelow: () => rowOps.insertRowBelow(),
    deleteTable: () => columnOps.deleteTable(),
  };

  const navigation = createTableNavigation(ctx);
  const rowOps = createTableRowOps(ctx);
  const columnOps = createTableColumnOps(ctx);

  function insertTable(): void {
    if (!contentRef.value) return;

    saveSelection();
    const position = getCursorViewportPosition();

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
        },
      });
    } else {
      createTable(3, 3);
    }
  }

  function createTable(rows: number, cols: number): void {
    if (!contentRef.value) return;
    if (rows < 1 || cols < 1) return;

    const range = getCurrentSelectionRange();
    if (!range) return;
    if (!contentRef.value.contains(range.startContainer)) return;

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    thead.appendChild(createRow(cols, true));
    table.appendChild(thead);

    if (rows > 1) {
      const tbody = document.createElement("tbody");
      for (let i = 1; i < rows; i++) {
        tbody.appendChild(createRow(cols, false));
      }
      table.appendChild(tbody);
    }

    let insertionPoint: Node | null = range.startContainer;
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
      insertionPoint.parentNode?.insertBefore(table, insertionPoint.nextSibling);
    } else {
      contentRef.value.appendChild(table);
    }

    const firstCell = table.querySelector("th, td") as HTMLTableCellElement | null;
    if (firstCell) {
      focusCell(firstCell);
    }

    notifyContentChange();
  }

  return {
    insertTable,
    createTable,
    isInTable,
    isInTableCell,
    getCurrentTable,
    getCurrentCell,
    ...navigation,
    ...rowOps,
    ...columnOps,
  };
}
