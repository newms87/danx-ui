<script setup lang="ts">
import { ref } from "vue";
import { useToast, DanxButton } from "danx-ui";

const { toast, success, warning, dismissAll } = useToast();
const counter = ref(0);

function addMultiple() {
  counter.value++;
  toast(`Toast #${counter.value}`, { duration: 8000 });
}

function addDuplicate() {
  toast("Same message (watch the badge count!)", { duration: 8000 });
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <DanxButton variant="info" @click="addMultiple">Add Unique Toast</DanxButton>
    <DanxButton variant="warning" @click="addDuplicate">Add Duplicate</DanxButton>
    <DanxButton variant="success" @click="success('Quick success!', { duration: 2000 })"
      >Quick (2s)</DanxButton
    >
    <DanxButton variant="danger" @click="warning('No auto-dismiss', { duration: 0 })"
      >Persistent</DanxButton
    >
    <DanxButton variant="muted" @click="dismissAll()">Dismiss All</DanxButton>
  </div>
</template>
