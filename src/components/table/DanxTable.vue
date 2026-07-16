<script setup lang="ts" generic="T extends Record<string, unknown> = Record<string, unknown>">
/**
 * DanxTable - Declarative, static/synchronous data table
 *
 * Renders an array of rows against a `columns` declaration — app data
 * tables, not a virtualized DataTable. Column cells default to the raw
 * `row[column.key]` value, overridable per column via the `#cell-{key}`
 * slot; headers default to `column.label`, overridable via `#header-{key}`.
 *
 * Sorting is presentational only: clicking a sortable header emits a
 * `{ key, direction }` sort event a consumer maps onto their own data
 * source (e.g. `ListController.pager.sort`) — DanxTable never reorders
 * `rows` itself.
 *
 * @props
 *   columns: TableColumn[] - Column declarations (required)
 *   rows: T[] - Row data to render (required)
 *   rowKey: string - Field on each row holding a unique id, used as the v-for key (required)
 *   sort?: TableSort | null - Currently active sort, controls the header indicator
 *
 * @emits
 *   row-click (rowClick) - (row: T) A row was clicked
 *   sort - (sort: TableSort) A sortable header was clicked
 *
 * @slots
 *   cell-{key} - Per-column cell content { row, column, value }
 *   header-{key} - Per-column header content { column }
 *   empty - Shown when there are no rows
 *
 * @tokens
 *   --dx-table-border, --dx-table-header-bg, --dx-table-header-text,
 *   --dx-table-row-stripe-bg, --dx-table-row-hover-bg, --dx-table-text
 *
 * @example
 *   <DanxTable
 *     :columns="[{ key: 'name', label: 'Name', sortable: true }, { key: 'email', label: 'Email' }]"
 *     :rows="users"
 *     row-key="id"
 *     @sort="onSort"
 *   />
 */
import { useSlots } from "vue";
import { DanxIcon } from "../icon";
import type { DanxTableProps, DanxTableEmits, TableColumn, TableSortDirection } from "./types";

const props = defineProps<DanxTableProps<T>>();

const emit = defineEmits<DanxTableEmits<T>>();

// Cell/header slot names are dynamic (`cell-{key}` / `header-{key}`, driven
// by the `columns` prop) so they're read via useSlots() rather than
// defineSlots<>(), which requires statically-known property names.
const slots = useSlots();

function alignClass(column: TableColumn): string {
  return `is-align-${column.align ?? "left"}`;
}

function cellValue(row: T, column: TableColumn): unknown {
  return row[column.key];
}

function handleHeaderClick(column: TableColumn): void {
  if (!column.sortable) return;
  const nextDirection: TableSortDirection =
    props.sort?.key === column.key && props.sort.direction === "asc" ? "desc" : "asc";
  emit("sort", { key: column.key, direction: nextDirection });
}

function sortIcon(column: TableColumn): "chevron-up" | "chevron-down" | null {
  if (!column.sortable || props.sort?.key !== column.key) return null;
  return props.sort.direction === "asc" ? "chevron-up" : "chevron-down";
}
</script>

<template>
  <div class="danx-table">
    <table v-if="rows.length > 0" class="danx-table__table">
      <thead class="danx-table__head">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :style="column.width ? { width: column.width } : undefined"
            :class="['danx-table__header', alignClass(column), { 'is-sortable': column.sortable }]"
            :aria-sort="
              sortIcon(column) ? (sort!.direction === 'asc' ? 'ascending' : 'descending') : 'none'
            "
            @click="handleHeaderClick(column)"
          >
            <span class="danx-table__header-content">
              <component
                :is="slots[`header-${column.key}`]"
                v-if="slots[`header-${column.key}`]"
                :column="column"
              />
              <template v-else>{{ column.label }}</template>

              <DanxIcon
                v-if="sortIcon(column)"
                :icon="sortIcon(column)!"
                class="danx-table__sort-icon"
              />
            </span>
          </th>
        </tr>
      </thead>

      <tbody class="danx-table__body">
        <tr
          v-for="row in rows"
          :key="String(row[rowKey])"
          class="danx-table__row"
          @click="emit('rowClick', row)"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            :class="['danx-table__cell', alignClass(column)]"
          >
            <component
              :is="slots[`cell-${column.key}`]"
              v-if="slots[`cell-${column.key}`]"
              :row="row"
              :column="column"
              :value="cellValue(row, column)"
            />
            <template v-else>{{ cellValue(row, column) }}</template>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="danx-table__empty">
      <slot name="empty">
        <span>No data to display</span>
      </slot>
    </div>
  </div>
</template>
