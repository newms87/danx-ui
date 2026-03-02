<script setup lang="ts">
import { useToast, DanxButton } from "danx-ui";

const { toast } = useToast();

function showToast() {
  toast("This is a basic toast notification.");
}
</script>

<template>
  <DanxButton variant="info" @click="showToast">Show Toast</DanxButton>
</template>
