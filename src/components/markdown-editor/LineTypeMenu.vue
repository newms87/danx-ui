<template>
  <div ref="menuRef" class="dx-line-type-menu" :class="{ 'is-open': isOpen }">
    <button
      class="line-type-trigger"
      :title="currentTypeLabel"
      type="button"
      @mousedown.prevent="toggleMenu"
    >
      <span class="type-icon">{{ typeIcon }}</span>
    </button>

    <div v-if="isOpen" ref="dropdownRef" class="line-type-dropdown" :class="{ 'open-upward': openUpward }">
      <button
        v-for="option in LINE_TYPE_OPTIONS"
        :key="option.value"
        class="line-type-option"
        :class="{ active: option.value === currentType }"
        type="button"
        @mousedown.prevent="selectType(option.value)"
      >
        <span class="option-icon">{{ option.icon }}</span>
        <span class="option-label">{{ option.label }}</span>
        <span class="option-shortcut">{{ option.shortcut }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from "vue";
import type { LineType, LineTypeOption } from "./types";

export interface LineTypeMenuProps {
  currentType: LineType;
}

const LINE_TYPE_OPTIONS: LineTypeOption[] = [
  { value: "paragraph", label: "Paragraph", icon: "\u00B6", shortcut: "Ctrl+0" },
  { value: "h1", label: "Heading 1", icon: "H1", shortcut: "Ctrl+1" },
  { value: "h2", label: "Heading 2", icon: "H2", shortcut: "Ctrl+2" },
  { value: "h3", label: "Heading 3", icon: "H3", shortcut: "Ctrl+3" },
  { value: "h4", label: "Heading 4", icon: "H4", shortcut: "Ctrl+4" },
  { value: "h5", label: "Heading 5", icon: "H5", shortcut: "Ctrl+5" },
  { value: "h6", label: "Heading 6", icon: "H6", shortcut: "Ctrl+6" },
  { value: "ul", label: "Bullet List", icon: "\u2022", shortcut: "Ctrl+Shift+[" },
  { value: "ol", label: "Numbered List", icon: "1.", shortcut: "Ctrl+Shift+]" },
  { value: "code", label: "Code Block", icon: "</>", shortcut: "Ctrl+Shift+K" },
  { value: "blockquote", label: "Blockquote", icon: ">", shortcut: "Ctrl+Shift+Q" }
];

const props = defineProps<LineTypeMenuProps>();

const emit = defineEmits<{
  change: [type: LineType];
}>();

const isOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const openUpward = ref(false);

const currentOption = computed((): LineTypeOption => {
  return LINE_TYPE_OPTIONS.find(o => o.value === props.currentType) ?? LINE_TYPE_OPTIONS[0]!;
});

const currentTypeLabel = computed(() => currentOption.value.label);
const typeIcon = computed(() => currentOption.value.icon);

function toggleMenu() {
  isOpen.value = !isOpen.value;
}

function selectType(type: LineType) {
  emit("change", type);
  isOpen.value = false;
}

/**
 * Check if dropdown would overflow the editor container and adjust positioning
 */
function checkDropdownPosition() {
  if (!dropdownRef.value || !menuRef.value) return;

  // Find the editor container (walk up to find .dx-markdown-editor or similar scrollable container)
  const editor = menuRef.value.closest(".dx-markdown-editor") || menuRef.value.closest("[class*='editor']");
  if (!editor) {
    openUpward.value = false;
    return;
  }

  const editorRect = editor.getBoundingClientRect();
  const dropdownRect = dropdownRef.value.getBoundingClientRect();

  // Check if dropdown extends below editor
  if (dropdownRect.bottom > editorRect.bottom) {
    openUpward.value = true;
  } else {
    openUpward.value = false;
  }
}

// Close menu on click outside
function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node;
  if (menuRef.value && !menuRef.value.contains(target)) {
    isOpen.value = false;
  }
}

// Close menu on Escape key
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    isOpen.value = false;
  }
}

// Add/remove event listeners when menu opens/closes
watch(isOpen, async (open) => {
  if (open) {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    // Wait for dropdown to render, then check position
    await nextTick();
    checkDropdownPosition();
  } else {
    document.removeEventListener("mousedown", handleClickOutside);
    document.removeEventListener("keydown", handleKeyDown);
    // Reset position when closed
    openUpward.value = false;
  }
});

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener("mousedown", handleClickOutside);
  document.removeEventListener("keydown", handleKeyDown);
});
</script>

<style>
.dx-line-type-menu {
  position: relative;
  display: inline-block;
}

.dx-line-type-menu .line-type-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-radius: 0.2rem;
  color: #6b7280;
  font-size: 0.625rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dx-line-type-menu .line-type-trigger:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #9ca3af;
}

.dx-line-type-menu .line-type-dropdown {
  position: absolute;
  top: 0;
  left: 100%;
  z-index: 100;
  min-width: 240px;
  margin-left: 0.25rem;
  background: #2d2d2d;
  border: 1px solid #404040;
  border-radius: 0.375rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

/* When dropdown would overflow editor bottom, open upward instead */
.dx-line-type-menu .line-type-dropdown.open-upward {
  top: auto;
  bottom: 0;
}

.dx-line-type-menu .line-type-option {
  display: flex;
  align-items: center;
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

.dx-line-type-menu .line-type-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dx-line-type-menu .line-type-option.active {
  background: rgba(56, 139, 253, 0.2);
  color: #58a6ff;
}

.dx-line-type-menu .line-type-option .option-icon {
  width: 1.5rem;
  font-weight: 700;
  font-size: 0.75rem;
  color: #9ca3af;
}

.dx-line-type-menu .line-type-option .option-label {
  flex: 1;
}

.dx-line-type-menu .line-type-option .option-shortcut {
  font-size: 0.75rem;
  color: #6b7280;
  font-family: 'Consolas', 'Monaco', monospace;
}
</style>
