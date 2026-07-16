# Table

A lightweight, declarative data table for static/synchronous data.
`DanxTable` renders an array of rows against a `columns` declaration — a
common app need like a users list or an orders table. It is **not** a
virtualized DataTable; for very large datasets pair it with your own
windowing/pagination.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `TableColumn[]` | required | Column declarations, rendered left to right |
| `rows` | `T[]` | required | Row data to render |
| `rowKey` | `string` | required | Field on each row holding a unique id, used as the v-for key |
| `sort` | `TableSort \| null` | `undefined` | Currently active sort, controls the header indicator |

### TableColumn

| Field | Type | Description |
|-------|------|--------------|
| `key` | `string` | Looks up the cell value (`row[key]`) and keys the `#cell-{key}`/`#header-{key}` slots |
| `label` | `string` | Header text |
| `align` | `"left" \| "center" \| "right"` | Header + cell alignment. Default: `"left"` |
| `width` | `string` | CSS width applied to the column (e.g. `"8rem"`, `"20%"`) |
| `sortable` | `boolean` | Whether the header is clickable and shows a sort indicator |

### TableSort

| Field | Type | Description |
|-------|------|--------------|
| `key` | `string` | The sorted column's `key` |
| `direction` | `"asc" \| "desc"` | Sort direction |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `row-click` | `(row: T)` | A row was clicked |
| `sort` | `(sort: TableSort)` | A sortable header was clicked, producing the next sort state |

DanxTable never reorders `rows` itself — sorting is presentational only.
Listen for `sort` and re-fetch/re-sort your data source, e.g. by mapping the
payload onto a `ListController.pager.sort`.

## Slots

| Slot | Bindings | Description |
|------|----------|--------------|
| `cell-{key}` | `{ row, column, value }` | Per-column cell content. Falls back to the raw `row[key]` value |
| `header-{key}` | `{ column }` | Per-column header content. Falls back to `column.label` |
| `empty` | — | Shown when `rows` is empty |

## CSS Tokens

| Token | Default | Purpose |
|-------|---------|---------|
| `--dx-table-border` | `var(--color-border)` | Table + cell border color |
| `--dx-table-header-bg` | `var(--color-surface-sunken)` | Header row background |
| `--dx-table-header-text` | `var(--color-text-subtle)` | Header text color |
| `--dx-table-row-stripe-bg` | `var(--color-surface-sunken)` | Even-row stripe background |
| `--dx-table-row-hover-bg` | `var(--color-interactive-subtle)` | Row hover background |
| `--dx-table-text` | `var(--color-text)` | Body text color |

There are no styling props — customize appearance entirely via these tokens.

## Example

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DanxTable, type TableColumn, type TableSort } from "danx-ui";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const columns: TableColumn[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email" },
  { key: "role", label: "Role", align: "center", width: "8rem" },
];

const users: User[] = [
  { id: "1", name: "Alice", email: "alice@example.com", role: "Admin" },
  { id: "2", name: "Bob", email: "bob@example.com", role: "Member" },
];

const sort = ref<TableSort | null>(null);

function onSort(next: TableSort) {
  sort.value = next;
  users.sort((a, b) => {
    const cmp = String(a[next.key as keyof User]).localeCompare(
      String(b[next.key as keyof User])
    );
    return next.direction === "asc" ? cmp : -cmp;
  });
}
</script>

<template>
  <DanxTable :columns="columns" :rows="users" row-key="id" :sort="sort" @sort="onSort">
    <template #cell-role="{ value }">
      <span class="rounded-full bg-surface-sunken px-2 py-0.5 text-xs">{{ value }}</span>
    </template>

    <template #empty>No users found.</template>
  </DanxTable>
</template>
```
