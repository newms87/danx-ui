<script setup lang="ts">
import { useToast, DanxButton } from "danx-ui";

const { toast } = useToast();

function showCustom() {
  toast("File uploaded: report.pdf (2.4 MB)", {
    variant: "success",
    duration: 6000,
    position: "top-right",
  });
}

function showNonDismissible() {
  toast("Processing... please wait.", {
    variant: "info",
    dismissible: false,
    duration: 3000,
  });
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <DanxButton variant="success" @click="showCustom">Upload Notification</DanxButton>
    <DanxButton variant="info" @click="showNonDismissible">Non-Dismissible</DanxButton>
  </div>
</template>
