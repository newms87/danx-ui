<script setup lang="ts">
import { ref } from "vue";
import { DanxBadge, DanxButton } from "danx-ui";

const count = ref(5);

function increment() {
  count.value++;
}
</script>

<template>
  <DanxBadge :value="count">
    <DanxButton @click="increment">Messages</DanxButton>
  </DanxBadge>

  <DanxBadge :value="0" showZero>
    <DanxButton>Empty</DanxButton>
  </DanxBadge>

  <DanxBadge :value="150" :max="99">
    <DanxButton>Overflow</DanxButton>
  </DanxBadge>
</template>
