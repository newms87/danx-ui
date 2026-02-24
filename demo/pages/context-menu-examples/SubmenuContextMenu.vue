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
    id: "undo",
    label: "Undo",
    shortcut: "Ctrl+Z",
    action: () => {
      lastAction.value = "Undo";
    },
  },
  {
    id: "redo",
    label: "Redo",
    shortcut: "Ctrl+Y",
    action: () => {
      lastAction.value = "Redo";
    },
  },
  { id: "div-1", label: "", divider: true },
  {
    id: "insert",
    label: "Insert",
    children: [
      {
        id: "table",
        label: "Table",
        action: () => {
          lastAction.value = "Insert Table";
        },
      },
      {
        id: "link",
        label: "Link",
        shortcut: "Ctrl+K",
        action: () => {
          lastAction.value = "Insert Link";
        },
      },
      { id: "sub-div", label: "", divider: true },
      {
        id: "image",
        label: "Image",
        action: () => {
          lastAction.value = "Insert Image";
        },
      },
    ],
  },
  {
    id: "format",
    label: "Format",
    children: [
      {
        id: "bold",
        label: "Bold",
        shortcut: "Ctrl+B",
        action: () => {
          lastAction.value = "Bold";
        },
      },
      {
        id: "italic",
        label: "Italic",
        shortcut: "Ctrl+I",
        action: () => {
          lastAction.value = "Italic";
        },
      },
    ],
  },
];
</script>

<template>
  <div
    class="border-2 border-dashed border-color-border rounded-lg p-8 text-center cursor-context-menu min-h-[120px] flex flex-col items-center justify-center"
    @contextmenu="onContextMenu"
  >
    <p>Right-click for nested submenus</p>
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
