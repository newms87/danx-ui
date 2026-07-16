<script setup lang="ts">
import { DanxTable } from "danx-ui";

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role", align: "center", width: "8rem" },
];

const users = [
  { id: "1", name: "Alice", email: "alice@example.com", role: "Admin" },
  { id: "2", name: "Bob", email: "bob@example.com", role: "Member" },
  { id: "3", name: "Carol", email: "carol@example.com", role: "Member" },
];
</script>

<template>
  <DanxTable :columns="columns" :rows="users" row-key="id" />
</template>
