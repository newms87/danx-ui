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
    id: "approve",
    label: "Approve",
    action: () => {
      lastAction.value = "Approve";
    },
  },
  {
    id: "review",
    label: "Request Review",
    action: () => {
      lastAction.value = "Request Review";
    },
  },
  { id: "div-1", label: "", divider: true },
  {
    id: "reject",
    label: "Reject",
    action: () => {
      lastAction.value = "Reject";
    },
  },
];
</script>

<template>
  <div
    class="custom-context-menu-demo border-2 border-dashed border-color-border rounded-lg p-8 text-center cursor-context-menu min-h-[120px] flex flex-col items-center justify-center"
    @contextmenu="onContextMenu"
  >
    <p>Right-click for custom-styled menu</p>
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
