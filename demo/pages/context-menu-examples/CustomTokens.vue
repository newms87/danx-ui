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
    class="custom-context-menu-demo"
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
    <p style="margin: 0">Right-click for custom-styled menu</p>
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
