<script setup lang="ts">
import { useToast, DanxButton } from "danx-ui";

const { toast } = useToast();

function showUndo() {
  toast("Item deleted", {
    variant: "warning",
    duration: 8000,
    action: {
      label: "Undo",
      onClick: () => toast("Item restored", { variant: "success" }),
    },
  });
}
</script>

<template>
  <DanxButton variant="warning" @click="showUndo">Delete Item</DanxButton>
</template>
