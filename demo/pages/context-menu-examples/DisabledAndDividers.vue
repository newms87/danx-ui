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
    style="
      border: 2px dashed var(--color-border);
      border-radius: 0.5rem;
      padding: 2rem;
      text-align: center;
      cursor: context-menu;
      min-height: 120px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    "
    @contextmenu="onContextMenu"
  >
    <p style="margin: 0">Right-click for disabled items and dividers</p>
    <p
      v-if="lastAction"
      style="margin: 0.5rem 0 0; font-size: 0.875rem; color: var(--color-text-muted)"
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
