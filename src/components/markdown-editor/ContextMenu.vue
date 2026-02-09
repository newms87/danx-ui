<script setup lang="ts">
/**
 * ContextMenu - Right-click context menu with nested submenu support
 *
 * Displays a context-aware menu at the right-click position. Supports single-level
 * nested submenus, disabled items, keyboard shortcuts display, and visual dividers.
 * Submenus open to the right by default, or to the left when near the viewport edge.
 *
 * @props
 *   position: PopoverPosition - x/y coordinates for menu placement
 *   items: ContextMenuItem[] - Menu items to display (supports children for submenus)
 *
 * @emits
 *   close - Fired when the menu should close (item click, overlay click, Escape)
 *   action - Fired with the clicked ContextMenuItem before executing its action
 *
 * @tokens
 *   --dx-mde-menu-bg - Menu background (default: #2d2d2d)
 *   --dx-mde-menu-border - Menu border color (default: #404040)
 *   --dx-mde-menu-item-hover - Item hover background (default: rgba(255,255,255,0.1))
 *
 * @example
 *   <ContextMenu
 *     v-if="contextMenu.isVisible"
 *     :position="contextMenu.position"
 *     :items="contextMenu.items"
 *     @close="contextMenu.hide"
 *   />
 */
import { computed, onUnmounted, ref } from "vue";
import type { ContextMenuItem } from "./types";
import type { PopoverPosition } from "./usePopoverManager";
import { calculatePopoverPosition } from "./popoverUtils";
import { useEscapeKey } from "./useEscapeKey";

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

const menuStyle = computed(() => {
  const result = calculatePopoverPosition({
    anchorX: props.position.x,
    anchorY: props.position.y,
    popoverWidth: 320,
    popoverHeight: 400,
  });
  submenuOpenLeft.value = result.nearRightEdge;
  return { top: result.top, left: result.left };
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

useEscapeKey(onClose);

onUnmounted(() => {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
  }
});
</script>

<template>
  <div class="dx-context-menu-overlay" @click.self="onClose">
    <div ref="menuRef" class="dx-context-menu" :style="menuStyle">
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
              <span v-if="item.shortcut && !item.children" class="item-shortcut">{{
                item.shortcut
              }}</span>
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

<style>
.dx-context-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  /* Transparent overlay - no visual background */
}

.dx-context-menu {
  position: fixed;
  background: var(--dx-mde-popover-bg);
  border: 1px solid var(--dx-mde-popover-border);
  border-radius: 0.375rem;
  box-shadow: 0 10px 25px var(--dx-mde-popover-shadow);
  min-width: 200px;
  max-width: 320px;
  overflow: visible;
  padding: 0.25rem 0;
}

.dx-context-menu .context-menu-divider {
  height: 1px;
  background: var(--dx-mde-popover-border);
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
  color: var(--dx-mde-popover-text);
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.dx-context-menu .context-menu-item:hover:not(.disabled) {
  background: var(--dx-mde-menu-item-hover);
}

.dx-context-menu .context-menu-item.disabled {
  color: var(--dx-mde-popover-dimmed);
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
  color: var(--dx-mde-popover-dimmed);
  font-family: "Consolas", "Monaco", monospace;
  margin-left: 1rem;
  white-space: nowrap;
}

.dx-context-menu .context-menu-item .item-chevron {
  font-size: 0.75rem;
  color: var(--dx-mde-popover-dimmed);
  margin-left: 0.5rem;
}

/* Submenu styling */
.dx-context-menu .dx-context-submenu {
  position: absolute;
  top: 0;
  left: 100%;
  margin-left: 2px;
  background: var(--dx-mde-popover-bg);
  border: 1px solid var(--dx-mde-popover-border);
  border-radius: 0.375rem;
  box-shadow: 0 10px 25px var(--dx-mde-popover-shadow);
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
