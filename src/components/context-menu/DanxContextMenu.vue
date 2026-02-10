<script setup lang="ts">
/**
 * DanxContextMenu - Right-click context menu with nested submenu support
 *
 * A top-level context menu component positioned at viewport coordinates.
 * Supports single-level nested submenus, disabled items, keyboard shortcuts
 * display, icons, and visual dividers. Submenus open to the right by default,
 * or to the left when near the viewport edge.
 *
 * Always visible when mounted — parent controls visibility via v-if.
 *
 * @props
 *   position: ContextMenuPosition - x/y viewport coordinates for menu placement
 *   items: ContextMenuItem[] - Menu items to display (supports children for submenus)
 *
 * @emits
 *   close - Fired when the menu should close (item click, overlay click, Escape)
 *   action - Fired with the clicked ContextMenuItem before executing its action
 *
 * @tokens
 *   --context-menu-bg - Menu background color
 *   --context-menu-border - Menu border color
 *   --context-menu-shadow - Box shadow color
 *   --context-menu-text - Item text color
 *   --context-menu-text-muted - Shortcut/chevron/disabled text color
 *   --context-menu-item-hover - Item hover background
 *   --context-menu-divider - Divider line color
 *   --context-menu-min-width - Minimum menu width
 *   --context-menu-max-width - Maximum menu width
 *   --context-menu-icon-size - Icon dimensions
 *   --context-menu-border-radius - Corner radius
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
import { computed, onMounted, onUnmounted, ref } from "vue";
import type { ContextMenuItem, ContextMenuPosition } from "./types";
import { calculateContextMenuPosition } from "./useContextMenuPosition";

const props = defineProps<{
  position: ContextMenuPosition;
  items: ContextMenuItem[];
}>();

const emit = defineEmits<{
  close: [];
  action: [item: ContextMenuItem];
}>();

const activeSubmenuId = ref<string | null>(null);
const submenuOpenLeft = ref(false);
let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

const menuStyle = computed(() => {
  const result = calculateContextMenuPosition(props.position.x, props.position.y, 320, 400);
  submenuOpenLeft.value = result.nearRightEdge;
  return { top: result.top, left: result.left };
});

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

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    onClose();
  }
}

onMounted(() => {
  document.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
  }
});
</script>

<template>
  <!-- Transparent full-viewport overlay -->
  <div class="danx-context-menu-overlay" @click.self="onClose" />

  <!-- Menu container -->
  <div class="danx-context-menu" :style="menuStyle">
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
            <span v-if="item.icon" class="danx-context-menu__icon" v-html="item.icon" />
            <span class="danx-context-menu__label">{{ item.label }}</span>
            <span v-if="item.shortcut && !item.children" class="danx-context-menu__shortcut">{{
              item.shortcut
            }}</span>
            <span v-if="item.children?.length" class="danx-context-menu__chevron">&#9656;</span>
          </button>

          <!-- Nested submenu -->
          <div
            v-if="item.children?.length && activeSubmenuId === item.id"
            class="danx-context-menu__submenu"
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
                <span v-if="child.icon" class="danx-context-menu__icon" v-html="child.icon" />
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
  </div>
</template>
