<script setup lang="ts">
import { ref } from "vue";
import { DanxInput } from "danx-ui";

const text = ref("Hello world");
const email = ref("");
const password = ref("");
const number = ref(42);
const search = ref("");
const date = ref("");
const time = ref("");
const url = ref("");
const tel = ref("");
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxInput v-model="text" label="Text" type="text" />
    <DanxInput v-model="email" label="Email" type="email" placeholder="you@example.com" />
    <DanxInput v-model="password" label="Password" type="password" placeholder="Enter password" />
    <DanxInput v-model="number" label="Number" type="number" :min="0" :max="100" :step="1" />
    <DanxInput v-model="search" label="Search" type="search" placeholder="Search..." />
    <DanxInput v-model="date" label="Date" type="date" />
    <DanxInput v-model="time" label="Time" type="time" />
    <DanxInput v-model="url" label="URL" type="url" placeholder="https://example.com" />
    <DanxInput v-model="tel" label="Telephone" type="tel" placeholder="+1 (555) 000-0000" />
  </div>
</template>
