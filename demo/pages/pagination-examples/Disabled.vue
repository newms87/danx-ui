<script setup lang="ts">
import { ref } from "vue";
import { DanxPagination } from "danx-ui";

const page = ref(3);
const perPage = ref(10);
const total = 500;
</script>

<template>
  <DanxPagination v-model:page="page" v-model:perPage="perPage" :total="total" disabled />
</template>
