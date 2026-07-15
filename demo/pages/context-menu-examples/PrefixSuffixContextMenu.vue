<script setup lang="ts">
import { h, ref } from "vue";
import { DanxContextMenu } from "danx-ui";

const showMenu = ref(false);
const menuPosition = ref({ x: 0, y: 0 });
const lastAction = ref("");

function onContextMenu(event) {
  event.preventDefault();
  menuPosition.value = { x: event.clientX, y: event.clientY };
  showMenu.value = true;
}

const badgeSuffix = '<span style="opacity: 0.6; font-size: 0.75em;">3</span>';

// A prefix/suffix `Component` renders via <component :is>, so it can close
// over local state and expose its own click handlers.
const PrioritySortButtons = {
  setup() {
    return () =>
      h("span", { style: "display: inline-flex; gap: 0.25rem;" }, [
        h(
          "button",
          {
            type: "button",
            style: "cursor: pointer;",
            onClick: (event) => {
              event.stopPropagation();
              lastAction.value = "Priority ascending";
            },
          },
          "↑"
        ),
        h(
          "button",
          {
            type: "button",
            style: "cursor: pointer;",
            onClick: (event) => {
              event.stopPropagation();
              lastAction.value = "Priority descending";
            },
          },
          "↓"
        ),
      ]);
  },
};

const items = [
  {
    id: "priority",
    label: "Priority",
    suffix: PrioritySortButtons,
  },
  {
    id: "notifications",
    label: "Notifications",
    suffix: badgeSuffix,
    action: () => {
      lastAction.value = "Notifications";
    },
  },
];
</script>

<template>
  <div
    class="border-2 border-dashed border-color-border rounded-lg p-8 text-center cursor-context-menu min-h-[120px] flex flex-col items-center justify-center"
    @contextmenu="onContextMenu"
  >
    <p>Right-click for menu items with prefix/suffix content</p>
    <p v-if="lastAction" class="mt-2 text-sm text-text-muted">
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
