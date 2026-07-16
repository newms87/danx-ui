/**
 * Table Type Definitions
 *
 * Types for the declarative, static/synchronous DanxTable component.
 */

/** A single column declaration for DanxTable. */
export interface TableColumn {
  /** Key used to look up the cell value on each row and to key the #cell-{key} slot. */
  key: string;

  /** Column header label. */
  label: string;

  /** Text alignment for the header + cells. Default: "left". */
  align?: "left" | "center" | "right";

  /** CSS width value applied to the column (e.g. "8rem", "20%"). */
  width?: string;

  /** When true, the header is clickable and shows a sort indicator. */
  sortable?: boolean;
}

/** Sort direction, following DXUI-173's `{ key, direction }` sort event shape. */
export type TableSortDirection = "asc" | "desc";

/** Payload emitted on the `sort` event — maps onto a consumer's `ListController.pager.sort`. */
export interface TableSort {
  key: string;
  direction: TableSortDirection;
}

/** Props for the DanxTable component. */
export interface DanxTableProps<T = Record<string, unknown>> {
  /** Column declarations, rendered left to right in array order. */
  columns: TableColumn[];

  /** Row data to render. */
  rows: T[];

  /** Name of the field on each row that holds a unique row identifier, used as the v-for key. */
  rowKey: string;

  /** Currently sorted column, controlling which header shows the active sort indicator. */
  sort?: TableSort | null;
}

/** Emits for the DanxTable component. */
export interface DanxTableEmits<T = Record<string, unknown>> {
  /** A row was clicked. Listen via `@row-click` in templates (Vue kebab-cases camelCase emits). */
  (e: "rowClick", row: T): void;

  /** A sortable header was clicked, producing the next sort state. */
  (e: "sort", sort: TableSort): void;
}

/** Scoped slot bindings shared by the per-column cell slot. */
export interface TableCellSlotProps<T = Record<string, unknown>> {
  /** The row being rendered. */
  row: T;

  /** The column being rendered. */
  column: TableColumn;

  /** The raw cell value (`row[column.key]`). */
  value: unknown;
}

/** Scoped slot bindings for a column header slot. */
export interface TableHeaderSlotProps {
  /** The column being rendered. */
  column: TableColumn;
}

/**
 * Slots for the DanxTable component.
 *
 * `cell-{key}` and `header-{key}` slot names are dynamic (driven by the
 * `columns` prop) so they can't be enumerated as static `defineSlots<>()`
 * properties — DanxTable reads them at render time via `useSlots()` instead.
 * Documented here for reference; see TableCellSlotProps / TableHeaderSlotProps
 * for their scoped-slot bindings.
 */
export interface DanxTableSlots {
  /** Rendered when there are no rows. */
  empty?: () => unknown;
}
