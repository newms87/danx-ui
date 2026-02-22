<script setup lang="ts">
/**
 * DanxSplitPanel - Resizable multi-panel layout component
 *
 * Displays 2+ named panels side-by-side (or stacked) with drag-to-resize
 * handles between adjacent panels. Panels can be toggled on/off via v-model,
 * and state persists to localStorage when a storageKey is provided.
 *
 * Panel widths are proportional weights — they don't need to sum to 100.
 * The component redistributes widths so active panels always fill exactly 100%.
 *
 * @props
 *   panels: SplitPanelConfig[] - Panel configurations (required)
 *   horizontal?: boolean - Stacked rows instead of side-by-side columns (default: false)
 *   storageKey?: string - localStorage key for persistence (omit to disable)
 *   requireActive?: boolean - Prevent deactivating the last panel (default: false)
 *
 * @model
 *   modelValue: string[] - Active panel IDs (defaults to all panels)
 *
 * @slots
 *   [panelId] - Dynamic named slot for each panel's content
 *   toggles - Custom toggle UI: { panels, isActive, toggle }
 *
 * @tokens
 *   --dx-split-panel-handle-size - Handle hit area width/height (default: 8px)
 *   --dx-split-panel-handle-color - Handle grip color (default: var(--color-border))
 *   --dx-split-panel-handle-hover - Handle hover color (default: var(--color-interactive))
 *   --dx-split-panel-handle-active - Handle active/dragging color (default: var(--color-interactive))
 *   --dx-split-panel-transition - Width transition on toggle (default: 200ms ease)
 *
 * @example
 *   <DanxSplitPanel
 *     v-model="activePanels"
 *     :panels="[
 *       { id: 'sidebar', label: 'Sidebar', defaultWidth: 30 },
 *       { id: 'content', label: 'Content', defaultWidth: 70 },
 *     ]"
 *     storage-key="my-layout"
 *   >
 *     <template #sidebar>Sidebar content</template>
 *     <template #content>Main content</template>
 *   </DanxSplitPanel>
 */
import { ref, toRef, type Ref } from "vue";
import type { DanxSplitPanelProps } from "./types";
import { useSplitPanel } from "./useSplitPanel";
import SplitPanelHandle from "./SplitPanelHandle.vue";

const props = withDefaults(defineProps<DanxSplitPanelProps>(), {
  horizontal: false,
  storageKey: undefined,
  requireActive: false,
});

const activePanelIds = defineModel<string[]>({
  default: undefined,
});

// Default to all panel IDs when no v-model is provided
if (activePanelIds.value === undefined) {
  activePanelIds.value = props.panels.map((p) => p.id);
}

const containerRef = ref<HTMLElement | null>(null);

const { panelStates, togglePanel, isActive, startResize, isResizing } = useSplitPanel(
  toRef(props, "panels"),
  activePanelIds as Ref<string[]>,
  {
    storageKey: props.storageKey,
    requireActive: props.requireActive,
    containerRef,
    horizontal: props.horizontal,
  }
);
</script>

<template>
  <div>
    <slot name="toggles" :panels="panels" :is-active="isActive" :toggle="togglePanel" />

    <div
      ref="containerRef"
      class="danx-split-panel"
      :class="{
        'danx-split-panel--horizontal': horizontal,
        'is-resizing': isResizing,
      }"
    >
      <template v-for="(state, index) in panelStates" :key="state.id">
        <div class="danx-split-panel__panel" :style="{ flexBasis: state.computedWidth + '%' }">
          <slot :name="state.id" />
        </div>

        <SplitPanelHandle
          v-if="index < panelStates.length - 1"
          :horizontal="horizontal"
          @drag-start="startResize(index, $event)"
        />
      </template>
    </div>
  </div>
</template>
