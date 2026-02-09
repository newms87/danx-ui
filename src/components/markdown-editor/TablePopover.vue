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
import { XmarkIcon } from "./icons";
import { computed, ref } from "vue";
import type { PopoverPosition } from "./usePopoverManager";
import { calculatePopoverPosition } from "./popoverUtils";
import { useEscapeKey } from "./useEscapeKey";

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

// Refs
const popoverRef = ref<HTMLElement | null>(null);

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

useEscapeKey(onCancel);
</script>

<template>
  <div class="dx-table-popover-overlay" @click.self="onCancel">
    <div ref="popoverRef" class="dx-table-popover" :style="popoverStyle">
      <div class="popover-header">
        <h3>Insert Table</h3>
        <button class="close-btn" type="button" aria-label="Close" @click="onCancel">
          <span class="w-4 h-4" v-html="XmarkIcon" />
        </button>
      </div>

      <div class="popover-content">
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
              @keydown.escape="onCancel"
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
              @keydown.escape="onCancel"
            />
          </div>
        </div>
      </div>

      <div class="popover-footer">
        <button type="button" class="btn-cancel" @click="onCancel">Cancel</button>
        <button type="button" class="btn-insert" @click="onSubmit">Insert</button>
      </div>
    </div>
  </div>
</template>

<style>
.dx-table-popover-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: var(--dx-mde-overlay-bg);
  backdrop-filter: blur(1px);
}

.dx-table-popover {
  position: fixed;
  background: var(--dx-mde-popover-bg);
  border: 1px solid var(--dx-mde-popover-border);
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px var(--dx-mde-popover-shadow);
  width: 280px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dx-table-popover .popover-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--dx-mde-popover-border);
}

.dx-table-popover .popover-header h3 {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--dx-mde-popover-heading);
}

.dx-table-popover .popover-header .close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0.25rem;
  color: var(--dx-mde-popover-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.dx-table-popover .popover-header .close-btn:hover {
  background: var(--dx-mde-menu-item-hover);
  color: var(--dx-mde-popover-heading);
}

.dx-table-popover .popover-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.dx-table-popover .grid-selector {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 0.5rem;
  background: var(--dx-mde-input-bg);
  border-radius: 0.375rem;
}

.dx-table-popover .grid-row {
  display: flex;
  gap: 3px;
}

.dx-table-popover .grid-cell {
  width: 28px;
  height: 28px;
  background: var(--dx-mde-grid-bg);
  border: 1px solid var(--dx-mde-grid-border);
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.1s ease;
}

.dx-table-popover .grid-cell:hover {
  border-color: var(--dx-mde-grid-selected-border);
}

.dx-table-popover .grid-cell.selected {
  background: var(--dx-mde-grid-selected-bg);
  border-color: var(--dx-mde-grid-selected-border);
}

.dx-table-popover .dimension-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--dx-mde-popover-text);
  margin-top: 0.25rem;
}

.dx-table-popover .divider {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 0.5rem 0;
}

.dx-table-popover .divider::before,
.dx-table-popover .divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--dx-mde-popover-border);
}

.dx-table-popover .divider span {
  padding: 0 0.75rem;
  font-size: 0.75rem;
  color: var(--dx-mde-popover-dimmed);
  white-space: nowrap;
}

.dx-table-popover .manual-inputs {
  display: flex;
  gap: 1rem;
  width: 100%;
  justify-content: center;
}

.dx-table-popover .input-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.dx-table-popover .input-group label {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--dx-mde-popover-muted);
}

.dx-table-popover .input-group input {
  width: 70px;
  padding: 0.5rem 0.75rem;
  background: var(--dx-mde-input-bg);
  border: 1px solid var(--dx-mde-input-border);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: var(--dx-mde-input-text);
  outline: none;
  text-align: center;
  transition: border-color 0.15s ease;
}

.dx-table-popover .input-group input::placeholder {
  color: var(--dx-mde-input-placeholder);
}

.dx-table-popover .input-group input:focus {
  border-color: var(--dx-mde-input-border-focus);
}

.dx-table-popover .input-group input::-webkit-outer-spin-button,
.dx-table-popover .input-group input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.dx-table-popover .input-group input[type="number"] {
  -moz-appearance: textfield;
}

.dx-table-popover .popover-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--dx-mde-popover-border);
  background: rgba(0, 0, 0, 0.2);
}

.dx-table-popover .popover-footer button {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dx-table-popover .popover-footer .btn-cancel {
  background: transparent;
  border: 1px solid var(--dx-mde-btn-cancel-border);
  color: var(--dx-mde-btn-cancel-text);
}

.dx-table-popover .popover-footer .btn-cancel:hover {
  background: var(--dx-mde-menu-trigger-bg);
  border-color: var(--dx-mde-btn-cancel-hover-border);
}

.dx-table-popover .popover-footer .btn-insert {
  background: var(--dx-mde-btn-primary-bg);
  border: 1px solid var(--dx-mde-btn-primary-bg);
  color: var(--dx-mde-btn-primary-text);
}

.dx-table-popover .popover-footer .btn-insert:hover {
  background: var(--dx-mde-btn-primary-hover);
  border-color: var(--dx-mde-btn-primary-hover);
}
</style>
