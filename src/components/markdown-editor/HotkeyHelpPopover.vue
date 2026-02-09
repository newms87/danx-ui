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
import { computed, onMounted, ref } from "vue";
import { XmarkIcon } from "./icons";
import { HotkeyDefinition, HotkeyGroup } from "./useMarkdownHotkeys";

const props = defineProps<HotkeyHelpPopoverProps>();

defineEmits<{
  close: [];
}>();

const overlayRef = ref<HTMLDivElement | null>(null);

onMounted(() => {
  // Focus the overlay so it can receive keyboard events
  overlayRef.value?.focus();
});

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
  <div
    ref="overlayRef"
    class="dx-hotkey-help-overlay"
    tabindex="-1"
    @click.self="$emit('close')"
    @keydown.escape="$emit('close')"
  >
    <div class="dx-hotkey-help-popover">
      <div class="popover-header">
        <h3>Keyboard Shortcuts</h3>
        <button class="close-btn" type="button" aria-label="Close" @click="$emit('close')">
          <span class="w-4 h-4" v-html="XmarkIcon" />
        </button>
      </div>

      <div class="popover-content">
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
      </div>
    </div>
  </div>
</template>

<style>
.dx-hotkey-help-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.dx-hotkey-help-popover {
  background: #2d2d2d;
  border: 1px solid #404040;
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  min-width: 320px;
  max-width: 90vw;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dx-hotkey-help-popover .popover-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #404040;
}

.dx-hotkey-help-popover .popover-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #f3f4f6;
}

.dx-hotkey-help-popover .popover-header .close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0.25rem;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dx-hotkey-help-popover .popover-header .close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f3f4f6;
}

.dx-hotkey-help-popover .popover-content {
  padding: 1rem 1.25rem;
  overflow-y: auto;
}

.dx-hotkey-help-popover .hotkey-groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem 2rem;
}

/* For wider screens, limit to 3 columns max */
@media (min-width: 800px) {
  .dx-hotkey-help-popover .hotkey-groups-grid {
    grid-template-columns: repeat(3, minmax(200px, 1fr));
  }
}

.dx-hotkey-help-popover .hotkey-group h4 {
  margin: 0 0 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
}

.dx-hotkey-help-popover .hotkey-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dx-hotkey-help-popover .hotkey-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.dx-hotkey-help-popover .hotkey-item .hotkey-description {
  flex: 1;
  color: #d4d4d4;
  font-size: 0.875rem;
}

.dx-hotkey-help-popover .hotkey-item .hotkey-key {
  flex-shrink: 0;
  padding: 0.25rem 0.5rem;
  background: #1e1e1e;
  border: 1px solid #404040;
  border-radius: 0.25rem;
  font-family: "Consolas", "Monaco", monospace;
  font-size: 0.75rem;
  color: #9ca3af;
  white-space: nowrap;
}
</style>
