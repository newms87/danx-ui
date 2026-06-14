<script setup lang="ts">
import { DanxAlert } from "danx-ui";
</script>

<template>
  <div class="flex flex-col gap-3">
    <DanxAlert variant="danger" title="Save failed">
      The server rejected the request. Please try again.
    </DanxAlert>
    <DanxAlert variant="warning" title="Unsaved changes">
      You have edits that have not been saved yet.
    </DanxAlert>
    <DanxAlert variant="success" title="All set">Your profile was updated.</DanxAlert>
    <DanxAlert variant="info">A new version is available.</DanxAlert>
  </div>
</template>
