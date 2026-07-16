<script setup lang="ts">
import { ref } from "vue";
import { DanxButton, DanxPopconfirm } from "danx-ui";

const deletedCount = ref(0);

function handleConfirm() {
  deletedCount.value++;
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <DanxPopconfirm
      title="Delete item?"
      message="This action cannot be undone."
      @confirm="handleConfirm"
    >
      <template #trigger>
        <DanxButton variant="danger" icon="trash">Delete</DanxButton>
      </template>
    </DanxPopconfirm>
    <p class="text-text-muted text-[0.8125rem] m-0">Confirmed {{ deletedCount }} time(s).</p>
  </div>
</template>
