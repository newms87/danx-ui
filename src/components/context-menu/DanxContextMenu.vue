<script setup lang="ts">
/**
 * DanxContextMenu - Context menu / button dropdown with nested submenu support
 *
 * One component, two entry shapes (mirrors how DanxPopover itself supports both
 * an explicit position and trigger anchoring without a legacy branch):
 *
 *  - Right-click mode: pass viewport `position` coords and mount/unmount via
 *    `v-if`. The `open` model defaults true so the panel renders immediately on
 *    mount; on dismiss (click-outside / Escape) it flips false and the watch
 *    emits "close" so the parent unmounts.
 *  - Button-anchored (dropdown) mode: omit `position`, provide a `#trigger`
 *    slot, and bind `v-model:open`. DanxPopover anchors the panel to the
 *    trigger element automatically — no rect math here or in the consumer.
 *
 * Supports single-level nested submenus, disabled items, keyboard shortcuts,
 * icons, dividers, and an active/selected indicator on items. Submenus open to
 * the right by default, or to the left when the menu panel is near the right
 * viewport edge (derived from the rendered panel rect, so it works with or
 * without an explicit `position`).
 *
 * @props
 *   position?: PopoverPosition - x/y viewport coords; omit for anchored mode
 *   placement?: PopoverPlacement - anchored-mode panel placement (default bottom)
 *   items: ContextMenuItem[] - Menu items to display (supports children for submenus)
 *
 * @models
 *   open: boolean - Visibility (default true). Bind v-model:open in anchored mode.
 *
 * @slots
 *   trigger - Inline anchor element for anchored mode (forwarded to DanxPopover)
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
 * @example Right-click
 *   <DanxContextMenu
 *     v-if="menu.isVisible"
 *     :position="menu.position"
 *     :items="menu.items"
 *     @close="menu.hide"
 *   />
 *
 * @example Button dropdown
 *   <DanxContextMenu v-model:open="open" :items="items">
 *     <template #trigger><button @click="open = true">Sort</button></template>
 *   </DanxContextMenu>
 */
import { onUnmounted, ref, watch } from "vue";
import { DanxIcon } from "../icon";
import { DanxPopover } from "../popover";
import type {
  ContextMenuItem,
  DanxContextMenuEmits,
  DanxContextMenuProps,
  DanxContextMenuSlots,
} from "./types";

defineProps<DanxContextMenuProps>();

const emit = defineEmits<DanxContextMenuEmits>();

/**
 * Single open-state model (default true). The default keeps right-click
 * consumers — mounted via v-if with no `open` binding — rendering immediately
 * and still emitting "close" on dismiss. Anchored consumers bind v-model:open.
 * When DanxPopover closes itself (click-outside / Escape), isOpen flips false
 * and the watch below emits "close".
 */
const isOpen = defineModel<boolean>("open", { default: true });

defineSlots<DanxContextMenuSlots>();

/** Wraps the rendered menu items; used to locate the popover panel for measurement. */
const menuRef = ref<HTMLElement | null>(null);

const activeSubmenuId = ref<string | null>(null);
let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Emit close when popover dismisses itself (click-outside or Escape).
 * Separated from v-model to avoid the double-handling issue of combining
 * v-model with an explicit @update:model-value listener.
 */
watch(isOpen, (val) => {
  if (!val) emit("close");
});

/**
 * Submenu open-direction, derived from the rendered menu panel's bounding rect
 * (NOT props.position, which is optional in anchored mode). If a submenu —
 * estimated the same width as the menu — would overflow the right viewport
 * edge, submenus open to the left instead. Works identically with or without
 * an explicit `position`.
 */
const ESTIMATED_MENU_WIDTH = 320;
const submenuOpenLeft = ref(false);

function getMenuPanel(): Element {
  // menuRef is bound synchronously during render, before the watch below can
  // ever invoke this — it is never null when called.
  return menuRef.value!.closest(".danx-popover") ?? menuRef.value!;
}

function updateSubmenuDirection(): void {
  const panel = getMenuPanel();
  const rect = panel.getBoundingClientRect();
  submenuOpenLeft.value = rect.right + ESTIMATED_MENU_WIDTH > window.innerWidth;
}

/**
 * Re-measure direction whenever a submenu opens. The menu panel is already
 * rendered (the menu is open), so measuring it synchronously is valid — and
 * the updated submenuOpenLeft applies to the submenu in the same render cycle.
 */
watch(activeSubmenuId, (id) => {
  if (id) updateSubmenuDirection();
});

/**
 * True when the item itself is active, or (for a submenu parent) any of its
 * descendants is active — so the parent reflects a child's active state.
 */
function isItemActive(item: ContextMenuItem): boolean {
  if (item.active) return true;
  return item.children?.some(isItemActive) ?? false;
}

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
    :placement="placement"
    class="danx-context-menu"
  >
    <template v-if="$slots.trigger" #trigger>
      <slot name="trigger" />
    </template>

    <div ref="menuRef" class="danx-context-menu__list">
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
                'is-active': isItemActive(item),
              }"
              type="button"
              :disabled="item.disabled"
              @click="onItemClick(item)"
            >
              <span v-if="isItemActive(item)" class="danx-context-menu__check" aria-hidden="true"
                >&#10003;</span
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
                  :class="{ 'is-disabled': child.disabled, 'is-active': isItemActive(child) }"
                  type="button"
                  :disabled="child.disabled"
                  @click="onItemClick(child)"
                >
                  <span
                    v-if="isItemActive(child)"
                    class="danx-context-menu__check"
                    aria-hidden="true"
                    >&#10003;</span
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
    </div>
  </DanxPopover>
</template>
