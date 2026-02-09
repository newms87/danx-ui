/**
 * Table Types
 *
 * Shared type definitions for the table composable modules.
 * Defines the TableContext interface used by useTableNavigation,
 * useTableRowOps, and useTableColumnOps factory functions.
 */

import type { Ref } from "vue";

/**
 * Shared context passed to table sub-module factory functions.
 * Provides access to the content element ref, detection methods,
 * and content change notification.
 */
export interface TableContext {
  /** Ref to the contenteditable editor element */
  contentRef: Ref<HTMLElement | null>;
  /** Check if cursor is inside a table cell */
  isInTableCell: () => boolean;
  /** Get the current table element */
  getCurrentTable: () => HTMLTableElement | null;
  /** Get both current cell and table, or null if not in a table */
  getCurrentCellAndTable: () => { cell: HTMLTableCellElement; table: HTMLTableElement } | null;
  /** Notify the editor of content changes */
  notifyContentChange: () => void;
  /** Insert a row below the current row (used by navigation for Tab at end) */
  insertRowBelow: () => void;
  /** Delete the entire table (used by row/column ops when last row/column deleted) */
  deleteTable: () => void;
}
