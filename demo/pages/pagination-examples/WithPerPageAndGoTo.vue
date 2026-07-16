<script setup lang="ts">
import { ref } from "vue";
import { DanxPagination } from "danx-ui";

const page = ref(1);
const perPage = ref(25);
const total = 1024;
</script>

<template>
  <DanxPagination
    v-model:page="page"
    v-model:perPage="perPage"
    :total="total"
    show-per-page-selector
    show-go-to-page
    :per-page-options="[10, 25, 50, 100]"
  />
</template>
