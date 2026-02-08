<template>
  <div
    class="dx-context-menu-overlay"
    @click.self="onClose"
    @keydown.escape="onClose"
  >
    <div
      ref="menuRef"
      class="dx-context-menu"
      :style="menuStyle"
    >
      <template v-for="(item, itemIndex) in items" :key="item.id">
        <!-- Divider -->
        <div v-if="item.divider" class="context-menu-divider" />

        <!-- Regular menu item or submenu trigger -->
        <template v-else>
          <div
            class="context-menu-item-wrapper"
            @mouseenter="handleItemHover(item, itemIndex)"
            @mouseleave="handleItemLeave"
          >
            <button
              class="context-menu-item"
              :class="{ disabled: item.disabled, 'has-children': item.children?.length }"
              type="button"
              :disabled="item.disabled"
              @click="onItemClick(item)"
            >
              <span class="item-label">{{ item.label }}</span>
              <span v-if="item.shortcut && !item.children" class="item-shortcut">{{ item.shortcut }}</span>
              <span v-if="item.children?.length" class="item-chevron">&#9656;</span>
            </button>

            <!-- Nested submenu -->
            <div
              v-if="item.children?.length && activeSubmenuId === item.id"
              ref="submenuRefs"
              class="dx-context-submenu"
              :class="{ 'open-left': submenuOpenLeft }"
              :data-item-id="item.id"
              @mouseenter="handleSubmenuEnter"
              @mouseleave="handleSubmenuLeave"
            >
              <template v-for="child in item.children" :key="child.id">
                <!-- Child divider -->
                <div v-if="child.divider" class="context-menu-divider" />

                <!-- Child item -->
                <button
                  v-else
                  class="context-menu-item"
                  :class="{ disabled: child.disabled }"
                  type="button"
                  :disabled="child.disabled"
                  @click="onItemClick(child)"
                >
                  <span class="item-label">{{ child.label }}</span>
                  <span v-if="child.shortcut" class="item-shortcut">{{ child.shortcut }}</span>
                </button>
              </template>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import type { ContextMenuItem } from "./types";
import type { PopoverPosition } from "./usePopoverManager";

export interface ContextMenuProps {
  position: PopoverPosition;
  items: ContextMenuItem[];
}

const props = defineProps<ContextMenuProps>();

const emit = defineEmits<{
  close: [];
  action: [item: ContextMenuItem];
}>();

const menuRef = ref<HTMLElement | null>(null);
const activeSubmenuId = ref<string | null>(null);
const submenuOpenLeft = ref(false);
let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

// Calculate menu position with viewport boundary detection
const menuStyle = computed(() => {
  const menuHeight = 400; // Approximate max height for nested menus
  const menuWidth = 320; // Match CSS max-width
  const padding = 10;

  let top = props.position.y;
  let left = props.position.x;

  // Check if menu would extend below viewport
  if (top + menuHeight > window.innerHeight - padding) {
    // Position above the cursor
    top = Math.max(padding, props.position.y - menuHeight);
  }

  // Ensure menu doesn't go off left edge
  if (left < padding) {
    left = padding;
  }

  // Ensure menu doesn't go off right edge
  if (left + menuWidth > window.innerWidth - padding) {
    left = window.innerWidth - menuWidth - padding;
  }

  // Determine if submenus should open to the left
  // (if menu is positioned near right edge, submenus should open left)
  submenuOpenLeft.value = left + menuWidth + menuWidth > window.innerWidth - padding;

  return {
    top: `${top}px`,
    left: `${left}px`
  };
});

function handleItemHover(item: ContextMenuItem, _index: number): void {
  // Clear any pending timeout
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }

  // If item has children, show submenu after a small delay
  if (item.children?.length) {
    hoverTimeout = setTimeout(() => {
      activeSubmenuId.value = item.id;
    }, 100);
  } else {
    // Immediately hide submenu for non-parent items
    activeSubmenuId.value = null;
  }
}

function handleItemLeave(): void {
  // Clear pending timeout
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }

  // Set a timeout to close submenu (will be cancelled if mouse enters submenu)
  hoverTimeout = setTimeout(() => {
    activeSubmenuId.value = null;
  }, 150);
}

function handleSubmenuEnter(): void {
  // Cancel any pending close timeout when entering the submenu
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }
}

function handleSubmenuLeave(): void {
  // Start timeout to close submenu when leaving
  hoverTimeout = setTimeout(() => {
    activeSubmenuId.value = null;
  }, 150);
}

function onItemClick(item: ContextMenuItem): void {
  if (item.disabled) return;

  // If item has children, don't close - just toggle submenu
  if (item.children?.length) {
    activeSubmenuId.value = activeSubmenuId.value === item.id ? null : item.id;
    return;
  }

  // Execute action if available
  if (item.action) {
    emit("action", item);
    item.action();
  }
  emit("close");
}

function onClose(): void {
  emit("close");
}

// Handle Escape key at document level
function handleDocumentKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    onClose();
  }
}

onMounted(() => {
  document.addEventListener("keydown", handleDocumentKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleDocumentKeydown);
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
  }
});
</script>

<style>
.dx-context-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  /* Transparent overlay - no visual background */
}

.dx-context-menu {
  position: fixed;
  background: #2d2d2d;
  border: 1px solid #404040;
  border-radius: 0.375rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  min-width: 200px;
  max-width: 320px;
  overflow: visible;
  padding: 0.25rem 0;
}

.dx-context-menu .context-menu-divider {
  height: 1px;
  background: #404040;
  margin: 0.25rem 0;
}

.dx-context-menu .context-menu-item-wrapper {
  position: relative;
}

.dx-context-menu .context-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: none;
  color: #d4d4d4;
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.dx-context-menu .context-menu-item:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.dx-context-menu .context-menu-item.disabled {
  color: #6b7280;
  cursor: not-allowed;
}

.dx-context-menu .context-menu-item.has-children {
  padding-right: 0.5rem;
}

.dx-context-menu .context-menu-item .item-label {
  flex: 1;
  white-space: nowrap;
}

.dx-context-menu .context-menu-item .item-shortcut {
  font-size: 0.75rem;
  color: #6b7280;
  font-family: 'Consolas', 'Monaco', monospace;
  margin-left: 1rem;
  white-space: nowrap;
}

.dx-context-menu .context-menu-item .item-chevron {
  font-size: 0.75rem;
  color: #6b7280;
  margin-left: 0.5rem;
}

/* Submenu styling */
.dx-context-menu .dx-context-submenu {
  position: absolute;
  top: 0;
  left: 100%;
  margin-left: 2px;
  background: #2d2d2d;
  border: 1px solid #404040;
  border-radius: 0.375rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  min-width: 280px;
  max-width: 360px;
  overflow: hidden;
  padding: 0.25rem 0;
  z-index: 1001;
}

/* Open to the left when near right viewport edge */
.dx-context-menu .dx-context-submenu.open-left {
  left: auto;
  right: 100%;
  margin-left: 0;
  margin-right: 2px;
}
</style>
