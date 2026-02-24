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
        class="p-8 border border-dashed border-border rounded-lg text-center cursor-context-menu select-none"
        @contextmenu="onContextMenu"
      >
        Right-click anywhere in this area
      </div>
    </template>
    <div class="py-1 min-w-40">
      <div
        v-for="item in ['Cut', 'Copy', 'Paste', 'Delete']"
        :key="item"
        class="px-4 py-1.5 cursor-pointer text-sm"
        @click="show = false"
      >
        {{ item }}
      </div>
    </div>
  </DanxPopover>
</template>
