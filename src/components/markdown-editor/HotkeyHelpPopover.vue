<script setup lang="ts">
/**
 * HotkeyHelpPopover - Modal overlay displaying keyboard shortcut reference
 *
 * Shows all registered hotkeys grouped by category (headings, formatting, lists,
 * blocks, tables, other) in a responsive grid. Closes on overlay click, close
 * button click, or Escape key.
 *
 * @props
 *   hotkeys: HotkeyDefinition[] - Array of hotkey definitions to display
 *
 * @emits
 *   close - Fired when the popover should close (overlay click, close button, Escape)
 *
 * @tokens
 *   --dx-mde-popover-bg - Popover background (default: #2d2d2d)
 *   --dx-mde-popover-border - Popover border color (default: #404040)
 *
 * @example
 *   <HotkeyHelpPopover
 *     v-if="showHelp"
 *     :hotkeys="hotkeyDefinitions"
 *     @close="showHelp = false"
 *   />
 */
import { computed } from "vue";
import { DanxDialog } from "../dialog";
import { HotkeyDefinition, HotkeyGroup } from "./useMarkdownHotkeys";

const props = defineProps<HotkeyHelpPopoverProps>();

defineEmits<{
  close: [];
}>();

export interface HotkeyHelpPopoverProps {
  hotkeys: HotkeyDefinition[];
}

interface HotkeyGroupDisplay {
  name: HotkeyGroup;
  label: string;
  hotkeys: HotkeyDefinition[];
}

const GROUP_LABELS: Record<HotkeyGroup, string> = {
  headings: "Headings",
  formatting: "Formatting",
  lists: "Lists",
  blocks: "Blocks",
  tables: "Tables",
  other: "Other",
};

const GROUP_ORDER: HotkeyGroup[] = ["headings", "formatting", "lists", "blocks", "tables", "other"];

const groupedHotkeys = computed<HotkeyGroupDisplay[]>(() => {
  const groups = new Map<HotkeyGroup, HotkeyDefinition[]>();

  // Initialize groups
  for (const group of GROUP_ORDER) {
    groups.set(group, []);
  }

  // Distribute hotkeys into groups
  for (const hotkey of props.hotkeys) {
    const group = groups.get(hotkey.group);
    if (group) {
      group.push(hotkey);
    }
  }

  // Convert to display format, filtering empty groups
  return GROUP_ORDER.filter((name) => (groups.get(name)?.length || 0) > 0).map((name) => ({
    name,
    label: GROUP_LABELS[name],
    hotkeys: groups.get(name) || [],
  }));
});

/**
 * Format a key combination for display
 * Converts 'ctrl+1' to 'Ctrl + 1'
 */
function formatKey(key: string): string {
  return key
    .split("+")
    .map((part) => {
      const lower = part.toLowerCase();
      switch (lower) {
        case "ctrl":
        case "control":
          return "Ctrl";
        case "shift":
          return "Shift";
        case "alt":
        case "option":
          return "Alt";
        case "meta":
        case "cmd":
        case "command":
          return "Cmd";
        default:
          return part.toUpperCase();
      }
    })
    .join(" + ");
}
</script>

<template>
  <DanxDialog
    model-value
    title="Keyboard Shortcuts"
    close-x
    class="dx-hotkey-help-popover"
    @close="$emit('close')"
  >
    <div class="hotkey-groups-grid">
      <div v-for="group in groupedHotkeys" :key="group.name" class="hotkey-group">
        <h4>{{ group.label }}</h4>
        <div class="hotkey-list">
          <div v-for="hotkey in group.hotkeys" :key="hotkey.key" class="hotkey-item">
            <span class="hotkey-description">{{ hotkey.description }}</span>
            <kbd class="hotkey-key">{{ formatKey(hotkey.key) }}</kbd>
          </div>
        </div>
      </div>
    </div>
  </DanxDialog>
</template>
