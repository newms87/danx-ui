<script setup lang="ts">
import { ref } from "vue";
import { DanxInput } from "danx-ui";

const name = ref("");
const email = ref("");
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxInput v-model="name" label="Name" placeholder="Enter your name" />
    <DanxInput v-model="email" label="Email" type="email" placeholder="you@example.com" />
    <p class="text-sm text-slate-500">Name: {{ name }} | Email: {{ email }}</p>
  </div>
</template>
