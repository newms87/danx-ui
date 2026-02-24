<script setup lang="ts">
import { ref } from "vue";
import { DanxContextMenu } from "danx-ui";

const showMenu = ref(false);
const menuPosition = ref({ x: 0, y: 0 });
const lastAction = ref("");

function onContextMenu(event) {
  event.preventDefault();
  menuPosition.value = { x: event.clientX, y: event.clientY };
  showMenu.value = true;
}

const items = [
  {
    id: "new",
    label: "New File",
    shortcut: "Ctrl+N",
    action: () => {
      lastAction.value = "New File";
    },
  },
  {
    id: "open",
    label: "Open File",
    shortcut: "Ctrl+O",
    action: () => {
      lastAction.value = "Open File";
    },
  },
  { id: "div-1", label: "", divider: true },
  {
    id: "save",
    label: "Save",
    shortcut: "Ctrl+S",
    action: () => {
      lastAction.value = "Save";
    },
  },
  { id: "save-as", label: "Save As...", disabled: true },
  { id: "div-2", label: "", divider: true },
  { id: "print", label: "Print", disabled: true },
  {
    id: "close",
    label: "Close",
    action: () => {
      lastAction.value = "Close";
    },
  },
];
</script>

<template>
  <div
    class="border-2 border-dashed border-color-border rounded-lg p-8 text-center cursor-context-menu min-h-[120px] flex flex-col items-center justify-center"
    @contextmenu="onContextMenu"
  >
    <p>Right-click for disabled items and dividers</p>
    <p
      v-if="lastAction"
      class="mt-2 text-sm text-text-muted"
    >
      Last action: <strong>{{ lastAction }}</strong>
    </p>
  </div>

  <DanxContextMenu
    v-if="showMenu"
    :position="menuPosition"
    :items="items"
    @close="showMenu = false"
  />
</template>
