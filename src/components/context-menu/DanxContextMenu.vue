<script setup lang="ts">
/**
 * DanxContextMenu - Right-click context menu with nested submenu support
 *
 * A context menu component positioned at viewport coordinates using DanxPopover.
 * Supports single-level nested submenus, disabled items, keyboard shortcuts
 * display, icons, and visual dividers. Submenus open to the right by default,
 * or to the left when near the viewport edge.
 *
 * Always visible when mounted — parent controls visibility via v-if.
 *
 * @props
 *   position: PopoverPosition - x/y viewport coordinates for menu placement
 *   items: ContextMenuItem[] - Menu items to display (supports children for submenus)
 *
 * @emits
 *   close - Fired when the menu should close (item click, overlay click, Escape)
 *   action - Fired with the clicked ContextMenuItem before executing its action
 *
 * @tokens
 *   --dx-context-menu-text - Item text color
 *   --dx-context-menu-text-muted - Shortcut/chevron/disabled text color
 *   --dx-context-menu-item-hover - Item hover background
 *   --dx-context-menu-divider - Divider line color
 *   --dx-context-menu-min-width - Minimum menu width
 *   --dx-context-menu-max-width - Maximum menu width
 *   --dx-context-menu-icon-size - Icon dimensions
 *
 * @example
 *   <DanxContextMenu
 *     v-if="menu.isVisible"
 *     :position="menu.position"
 *     :items="menu.items"
 *     @close="menu.hide"
 *     @action="onAction"
 *   />
 */
import { computed, onUnmounted, ref } from "vue";
import { DanxIcon } from "../icon";
import { DanxPopover } from "../popover";
import type { PopoverPosition } from "../popover/types";
import type { ContextMenuItem } from "./types";

const props = defineProps<{
  position: PopoverPosition;
  items: ContextMenuItem[];
}>();

const emit = defineEmits<{
  close: [];
  action: [item: ContextMenuItem];
}>();

const ESTIMATED_MENU_WIDTH = 320;

const isOpen = ref(true);

const activeSubmenuId = ref<string | null>(null);
let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

const submenuOpenLeft = computed(
  () => props.position.x + ESTIMATED_MENU_WIDTH * 2 > window.innerWidth
);

function handleItemHover(item: ContextMenuItem): void {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }

  if (item.children?.length) {
    hoverTimeout = setTimeout(() => {
      activeSubmenuId.value = item.id;
    }, 100);
  } else {
    activeSubmenuId.value = null;
  }
}

function handleItemLeave(): void {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }

  hoverTimeout = setTimeout(() => {
    activeSubmenuId.value = null;
  }, 150);
}

function handleSubmenuEnter(): void {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }
}

function handleSubmenuLeave(): void {
  hoverTimeout = setTimeout(() => {
    activeSubmenuId.value = null;
  }, 150);
}

function onItemClick(item: ContextMenuItem): void {
  if (item.disabled) return;

  if (item.children?.length) {
    activeSubmenuId.value = activeSubmenuId.value === item.id ? null : item.id;
    return;
  }

  if (item.action) {
    emit("action", item);
    item.action();
  }
  emit("close");
}

function onClose(): void {
  emit("close");
}

onUnmounted(() => {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
  }
});
</script>

<template>
  <DanxPopover
    v-model="isOpen"
    :position="position"
    class="danx-context-menu"
    @update:model-value="!$event && onClose()"
  >
    <template v-for="item in items" :key="item.id">
      <!-- Divider -->
      <div v-if="item.divider" class="danx-context-menu__divider" />

      <!-- Regular or submenu-trigger item -->
      <template v-else>
        <div
          class="danx-context-menu__item-wrapper"
          @mouseenter="handleItemHover(item)"
          @mouseleave="handleItemLeave"
        >
          <button
            class="danx-context-menu__item"
            :class="{
              'is-disabled': item.disabled,
              'has-children': item.children?.length,
            }"
            type="button"
            :disabled="item.disabled"
            @click="onItemClick(item)"
          >
            <DanxIcon v-if="item.icon" :icon="item.icon" class="danx-context-menu__icon" />
            <span class="danx-context-menu__label">{{ item.label }}</span>
            <span v-if="item.shortcut && !item.children" class="danx-context-menu__shortcut">{{
              item.shortcut
            }}</span>
            <span v-if="item.children?.length" class="danx-context-menu__chevron">&#9656;</span>
          </button>

          <!-- Nested submenu -->
          <div
            v-if="item.children?.length && activeSubmenuId === item.id"
            class="danx-context-menu__submenu danx-context-menu-panel"
            :class="{ 'open-left': submenuOpenLeft }"
            @mouseenter="handleSubmenuEnter"
            @mouseleave="handleSubmenuLeave"
          >
            <template v-for="child in item.children" :key="child.id">
              <div v-if="child.divider" class="danx-context-menu__divider" />
              <button
                v-else
                class="danx-context-menu__item"
                :class="{ 'is-disabled': child.disabled }"
                type="button"
                :disabled="child.disabled"
                @click="onItemClick(child)"
              >
                <DanxIcon v-if="child.icon" :icon="child.icon" class="danx-context-menu__icon" />
                <span class="danx-context-menu__label">{{ child.label }}</span>
                <span v-if="child.shortcut" class="danx-context-menu__shortcut">{{
                  child.shortcut
                }}</span>
              </button>
            </template>
          </div>
        </div>
      </template>
    </template>
  </DanxPopover>
</template>
