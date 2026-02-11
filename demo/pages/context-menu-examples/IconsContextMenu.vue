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

const editIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z"/></svg>';

const trashIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>';

const copyIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M208 0H332.1c12.7 0 24.9 5.1 33.9 14.1l67.9 67.9c9 9 14.1 21.2 14.1 33.9V336c0 26.5-21.5 48-48 48H208c-26.5 0-48-21.5-48-48V48c0-26.5 21.5-48 48-48zM48 128h80v64H64V448H256V416h64v48c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V176c0-26.5 21.5-48 48-48z"/></svg>';

const items = [
  {
    id: "edit",
    label: "Edit",
    icon: editIcon,
    action: () => {
      lastAction.value = "Edit";
    },
  },
  {
    id: "copy",
    label: "Duplicate",
    icon: copyIcon,
    action: () => {
      lastAction.value = "Duplicate";
    },
  },
  { id: "div-1", label: "", divider: true },
  {
    id: "delete",
    label: "Delete",
    icon: trashIcon,
    action: () => {
      lastAction.value = "Delete";
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
    <p style="margin: 0">Right-click for menu items with icons</p>
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
