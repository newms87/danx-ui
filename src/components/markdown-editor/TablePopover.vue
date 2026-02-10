<script setup lang="ts">
/**
 * TablePopover - Modal for inserting tables with visual grid selector
 *
 * Provides a 5x5 visual grid for quick table size selection plus manual row/column
 * inputs for larger tables (up to 20 rows, 10 columns). Positions itself near the
 * cursor with viewport boundary detection.
 *
 * @props
 *   position: PopoverPosition - x/y coordinates for positioning
 *
 * @emits
 *   submit - Fired with (rows: number, cols: number) when the user confirms
 *   cancel - Fired when the user cancels (overlay click, close button, Escape)
 *
 * @tokens
 *   --dx-mde-popover-bg - Popover background (default: #2d2d2d)
 *   --dx-mde-popover-border - Popover border color (default: #404040)
 *   --dx-mde-grid-cell-bg - Grid cell background (default: #3a3a3a)
 *   --dx-mde-grid-cell-selected - Selected grid cell color (default: #3b82f6)
 *
 * @example
 *   <TablePopover
 *     v-if="showTablePopover"
 *     :position="{ x: 200, y: 300 }"
 *     @submit="insertTable"
 *     @cancel="closeTablePopover"
 *   />
 */
import { computed, ref } from "vue";
import DanxPopover from "./DanxPopover.vue";
import type { PopoverPosition } from "./usePopoverManager";
import { calculatePopoverPosition } from "./popoverUtils";

export interface TablePopoverProps {
  position: PopoverPosition;
}

const props = defineProps<TablePopoverProps>();
const emit = defineEmits<{
  submit: [rows: number, cols: number];
  cancel: [];
}>();
const GRID_SIZE = 5;
const MAX_ROWS = 20;
const MAX_COLS = 10;
const DEFAULT_SIZE = 3;

// State
const hoverRows = ref(DEFAULT_SIZE);
const hoverCols = ref(DEFAULT_SIZE);
const manualRows = ref(DEFAULT_SIZE);
const manualCols = ref(DEFAULT_SIZE);

const popoverStyle = computed(() => {
  const result = calculatePopoverPosition({
    anchorX: props.position.x,
    anchorY: props.position.y,
    popoverWidth: 280,
    popoverHeight: 340,
    centerOnAnchor: true,
  });
  return { top: result.top, left: result.left };
});

// Methods
function onCellHover(row: number, col: number): void {
  hoverRows.value = row;
  hoverCols.value = col;
  manualRows.value = row;
  manualCols.value = col;
}

function onCellClick(row: number, col: number): void {
  emit("submit", row, col);
}

function onSubmit(): void {
  const rows = Math.min(Math.max(1, manualRows.value), MAX_ROWS);
  const cols = Math.min(Math.max(1, manualCols.value), MAX_COLS);
  emit("submit", rows, cols);
}

function onCancel(): void {
  emit("cancel");
}
</script>

<template>
  <DanxPopover
    title="Insert Table"
    confirm-label="Insert"
    class="dx-table-popover"
    :style="popoverStyle"
    @cancel="onCancel"
    @confirm="onSubmit"
  >
    <!-- Visual Grid Selector -->
    <div class="grid-selector">
      <div v-for="row in GRID_SIZE" :key="row" class="grid-row">
        <div
          v-for="col in GRID_SIZE"
          :key="col"
          class="grid-cell"
          :class="{ selected: row <= hoverRows && col <= hoverCols }"
          @mouseenter="onCellHover(row, col)"
          @click="onCellClick(row, col)"
        />
      </div>
    </div>

    <!-- Dimension Label -->
    <div class="dimension-label">{{ hoverRows }} x {{ hoverCols }}</div>

    <!-- Manual Input Divider -->
    <div class="divider">
      <span>or enter manually</span>
    </div>

    <!-- Manual Input Fields -->
    <div class="manual-inputs">
      <div class="input-group">
        <label for="table-rows">Rows</label>
        <input
          id="table-rows"
          v-model.number="manualRows"
          type="number"
          min="1"
          :max="MAX_ROWS"
          @keydown.enter.prevent="onSubmit"
        />
      </div>
      <div class="input-group">
        <label for="table-cols">Cols</label>
        <input
          id="table-cols"
          v-model.number="manualCols"
          type="number"
          min="1"
          :max="MAX_COLS"
          @keydown.enter.prevent="onSubmit"
        />
      </div>
    </div>
  </DanxPopover>
</template>

<style>
.dx-table-popover {
  width: 280px;

  .popover-content {
    align-items: center;
    gap: 0.75rem;
  }

  .grid-selector {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 0.5rem;
    background: var(--dx-mde-input-bg);
    border-radius: 0.375rem;
  }

  .grid-row {
    display: flex;
    gap: 3px;
  }

  .grid-cell {
    width: 28px;
    height: 28px;
    background: var(--dx-mde-grid-bg);
    border: 1px solid var(--dx-mde-grid-border);
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.1s ease;

    &:hover {
      border-color: var(--dx-mde-grid-selected-border);
    }

    &.selected {
      background: var(--dx-mde-grid-selected-bg);
      border-color: var(--dx-mde-grid-selected-border);
    }
  }

  .dimension-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--dx-mde-popover-text);
    margin-top: 0.25rem;
  }

  .divider {
    display: flex;
    align-items: center;
    width: 100%;
    margin: 0.5rem 0;

    &::before,
    &::after {
      content: "";
      flex: 1;
      height: 1px;
      background: var(--dx-mde-popover-border);
    }

    span {
      padding: 0 0.75rem;
      font-size: 0.75rem;
      color: var(--dx-mde-popover-dimmed);
      white-space: nowrap;
    }
  }

  .manual-inputs {
    display: flex;
    gap: 1rem;
    width: 100%;
    justify-content: center;
  }

  .input-group input {
    width: 70px;
    text-align: center;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    &[type="number"] {
      -moz-appearance: textfield;
    }
  }
}
</style>
