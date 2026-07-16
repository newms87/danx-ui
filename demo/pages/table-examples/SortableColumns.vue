<script setup lang="ts">
import { ref } from "vue";
import { DanxTable } from "danx-ui";

const columns = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "role", label: "Role", align: "center", width: "8rem" },
];

const users = ref([
  { id: "1", name: "Carol", email: "carol@example.com", role: "Member" },
  { id: "2", name: "Alice", email: "alice@example.com", role: "Admin" },
  { id: "3", name: "Bob", email: "bob@example.com", role: "Member" },
]);

const sort = ref(null);

function onSort(next) {
  sort.value = next;
  users.value = [...users.value].sort((a, b) => {
    const cmp = String(a[next.key]).localeCompare(String(b[next.key]));
    return next.direction === "asc" ? cmp : -cmp;
  });
}
</script>

<template>
  <DanxTable :columns="columns" :rows="users" row-key="id" :sort="sort" @sort="onSort" />
</template>
