/**
 * Table Component Module
 *
 * Exports:
 * - DanxTable: Declarative, static/synchronous column/slot data table
 * - Types: TableColumn, DanxTableProps, TableSort, etc.
 */
export { default as DanxTable } from "./DanxTable.vue";
export type {
  TableColumn,
  TableSortDirection,
  TableSort,
  DanxTableProps,
  DanxTableEmits,
  TableCellSlotProps,
  TableHeaderSlotProps,
  DanxTableSlots,
} from "./types";
