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
import { computed, onMounted, onUnmounted, ref } from "vue";
import type { PopoverPosition } from "./usePopoverManager";

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

// Calculate popover position (below cursor by default, above if at bottom of viewport)
const popoverStyle = computed(() => {
  const popoverHeight = 340; // Approximate height
  const popoverWidth = 280;
  const padding = 10;

  let top = props.position.y + padding;
  let left = props.position.x - popoverWidth / 2;

  // Check if popover would extend below viewport
  if (top + popoverHeight > window.innerHeight - padding) {
    // Position above the cursor
    top = props.position.y - popoverHeight - padding;
  }

  // Ensure popover doesn't go off left edge
  if (left < padding) {
    left = padding;
  }

  // Ensure popover doesn't go off right edge
  if (left + popoverWidth > window.innerWidth - padding) {
    left = window.innerWidth - popoverWidth - padding;
  }

  return {
    top: `${top}px`,
    left: `${left}px`,
  };
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

// Handle Escape key at document level
function handleDocumentKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    onCancel();
  }
}

onMounted(() => {
  document.addEventListener("keydown", handleDocumentKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleDocumentKeydown);
});
</script>

<template>
  <div class="dx-table-popover-overlay" @click.self="onCancel" @keydown.escape="onCancel">
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
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(1px);
}

.dx-table-popover {
  position: fixed;
  background: #2d2d2d;
  border: 1px solid #404040;
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
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
  border-bottom: 1px solid #404040;
}

.dx-table-popover .popover-header h3 {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #f3f4f6;
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
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dx-table-popover .popover-header .close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f3f4f6;
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
  background: #1e1e1e;
  border-radius: 0.375rem;
}

.dx-table-popover .grid-row {
  display: flex;
  gap: 3px;
}

.dx-table-popover .grid-cell {
  width: 28px;
  height: 28px;
  background: #3a3a3a;
  border: 1px solid #4a4a4a;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.1s ease;
}

.dx-table-popover .grid-cell:hover {
  border-color: #60a5fa;
}

.dx-table-popover .grid-cell.selected {
  background: #3b82f6;
  border-color: #60a5fa;
}

.dx-table-popover .dimension-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #d4d4d4;
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
  background: #404040;
}

.dx-table-popover .divider span {
  padding: 0 0.75rem;
  font-size: 0.75rem;
  color: #6b7280;
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
  color: #9ca3af;
}

.dx-table-popover .input-group input {
  width: 70px;
  padding: 0.5rem 0.75rem;
  background: #1e1e1e;
  border: 1px solid #404040;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #f3f4f6;
  outline: none;
  text-align: center;
  transition: border-color 0.15s ease;
}

.dx-table-popover .input-group input::placeholder {
  color: #6b7280;
}

.dx-table-popover .input-group input:focus {
  border-color: #60a5fa;
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
  border-top: 1px solid #404040;
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
  border: 1px solid #404040;
  color: #d4d4d4;
}

.dx-table-popover .popover-footer .btn-cancel:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: #525252;
}

.dx-table-popover .popover-footer .btn-insert {
  background: #3b82f6;
  border: 1px solid #3b82f6;
  color: #ffffff;
}

.dx-table-popover .popover-footer .btn-insert:hover {
  background: #2563eb;
  border-color: #2563eb;
}
</style>
