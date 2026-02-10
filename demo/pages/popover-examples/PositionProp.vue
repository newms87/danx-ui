<script setup lang="ts">
import { ref } from "vue";
import { DanxPopover } from "danx-ui";

const show = ref(false);
const position = ref({ x: 0, y: 0 });

function onContextMenu(event) {
  event.preventDefault();
  position.value = { x: event.clientX, y: event.clientY };
  show.value = true;
}
</script>

<template>
  <DanxPopover v-model="show" :position="position">
    <template #trigger>
      <div
        style="
          padding: 2rem;
          border: 1px dashed var(--color-border);
          border-radius: 0.5rem;
          text-align: center;
          cursor: context-menu;
          user-select: none;
        "
        @contextmenu="onContextMenu"
      >
        Right-click anywhere in this area
      </div>
    </template>
    <div style="padding: 0.25rem 0; min-width: 10rem">
      <div
        v-for="item in ['Cut', 'Copy', 'Paste', 'Delete']"
        :key="item"
        style="padding: 0.375rem 1rem; cursor: pointer; font-size: 0.875rem"
        @click="show = false"
      >
        {{ item }}
      </div>
    </div>
  </DanxPopover>
</template>
