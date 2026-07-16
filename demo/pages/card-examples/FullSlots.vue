<script setup lang="ts">
import { DanxButton, DanxCard } from "danx-ui";
</script>

<template>
  <DanxCard variant="elevated" padding="spacious">
    <template #header>
      <strong>Custom header content</strong>
    </template>
    Body content sits between the header and footer.
    <template #footer>
      <DanxButton size="sm">Save</DanxButton>
    </template>
  </DanxCard>
</template>
