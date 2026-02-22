<script setup lang="ts">
import { DanxButton } from "danx-ui";
</script>

<template>
  <div class="demo-section">
    <h4>Built-in Variants</h4>
    <div class="button-group">
      <DanxButton icon="edit">Default</DanxButton>
      <DanxButton variant="danger" icon="trash">Danger</DanxButton>
      <DanxButton variant="success" icon="save">Success</DanxButton>
      <DanxButton variant="warning" icon="pause">Warning</DanxButton>
      <DanxButton variant="info" icon="view">Info</DanxButton>
      <DanxButton variant="muted" icon="edit">Muted</DanxButton>
    </div>
  </div>
</template>

<style scoped>
.demo-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-on-surface);
}
</style>
