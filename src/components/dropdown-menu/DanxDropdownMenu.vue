<script setup lang="ts">
/**
 * DanxDropdownMenu - Button-triggered action menu
 *
 * Composes DanxContextMenu (anchored/dropdown mode) so it inherits keyboard
 * navigation (Up/Down/Home/End/Escape/Left/Right), submenu flyouts, icons,
 * disabled items, and dividers for free. This component only adds:
 *  - A `DropdownMenuItem[]` shape (no `id` field required from consumers —
 *    ids are derived from each item's position in the tree) with `separator`
 *    instead of `divider`, mapped to `ContextMenuItem` internally. Keep the
 *    array's shape (length/order/nesting) stable while the menu is open —
 *    see the `items` prop doc in ./types.ts.
 *  - Toggling open/closed when the default (trigger) slot is clicked, so any
 *    slotted content (usually a DanxButton) becomes a working trigger with no
 *    extra wiring from the consumer.
 *  - A `select` event carrying the originally-passed `DropdownMenuItem`,
 *    fired for any chosen leaf item (whether or not it has an `action`).
 *
 * @props
 *   items: DropdownMenuItem[] - Menu items to display (supports children for submenus)
 *   placement?: PopoverPlacement - Panel placement relative to the trigger (default bottom)
 *
 * @models
 *   open: boolean - Visibility (default false)
 *
 * @slots
 *   default - Trigger element (usually a DanxButton) that opens the menu on click
 *
 * @emits
 *   select - Fired with the chosen DropdownMenuItem before executing its action
 *
 * @example
 *   <DanxDropdownMenu :items="items" @select="onSelect">
 *     <DanxButton>Actions</DanxButton>
 *   </DanxDropdownMenu>
 */
import { computed } from "vue";
import { DanxContextMenu } from "../context-menu";
import type { ContextMenuItem } from "../context-menu";
import type {
  DanxDropdownMenuEmits,
  DanxDropdownMenuProps,
  DanxDropdownMenuSlots,
  DropdownMenuItem,
} from "./types";

const props = defineProps<DanxDropdownMenuProps>();

const emit = defineEmits<DanxDropdownMenuEmits>();

const isOpen = defineModel<boolean>("open", { default: false });

defineSlots<DanxDropdownMenuSlots>();

/**
 * Maps a DropdownMenuItem to a ContextMenuItem. The id is derived from tree
 * position (stable across re-renders as long as the items array shape is
 * unchanged) since DropdownMenuItem carries no id of its own. Leaf items
 * always get a synthetic `action` so DanxContextMenu treats them as
 * actionable and fires its own "action" path — that's what lets `select`
 * fire even for items with no consumer-supplied action.
 */
function toContextMenuItem(item: DropdownMenuItem, id: string): ContextMenuItem {
  const hasChildren = !!item.children?.length;
  return {
    id,
    label: item.label,
    icon: item.icon,
    disabled: item.disabled,
    divider: item.separator,
    children: hasChildren
      ? item.children!.map((child, index) => toContextMenuItem(child, `${id}-${index}`))
      : undefined,
    action: hasChildren
      ? undefined
      : () => {
          emit("select", item);
          item.action?.();
        },
  };
}

const menuItems = computed<ContextMenuItem[]>(() =>
  props.items.map((item, index) => toContextMenuItem(item, `item-${index}`))
);

function onTriggerClick(): void {
  isOpen.value = !isOpen.value;
}
</script>

<template>
  <DanxContextMenu
    v-model:open="isOpen"
    :items="menuItems"
    :placement="placement"
    class="danx-dropdown-menu"
    @close="isOpen = false"
  >
    <template #trigger>
      <span class="danx-dropdown-menu__trigger" @click="onTriggerClick">
        <slot />
      </span>
    </template>
  </DanxContextMenu>
</template>

<style>
.danx-dropdown-menu__trigger {
  display: contents;
}
</style>
