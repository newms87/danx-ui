<script setup lang="ts">
import { ref } from "vue";
import { DanxPagination } from "danx-ui";

const page = ref(1);
const perPage = ref(10);
const total = 237;
</script>

<template>
  <DanxPagination v-model:page="page" v-model:perPage="perPage" :total="total" />
  <p class="mt-4 text-text-muted">Page {{ page }} of {{ Math.ceil(total / perPage) }}</p>
</template>
