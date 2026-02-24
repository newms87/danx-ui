<script setup lang="ts">
import { ref } from "vue";
import { DanxProgressBar, DanxButtonGroup, DanxPopover, DanxIcon } from "danx-ui";

const value = ref(75);
const buffer = ref(90);
const variant = ref("danger");
const size = ref("lg");
const textPosition = ref("inside");
const textAlign = ref("center");
const showText = ref(true);
const indeterminate = ref(false);
const striped = ref(true);
const animateStripes = ref(true);
const glow = ref(true);
const shimmer = ref(true);
const gradient = ref(true);
const label = ref("");
const selectedIcon = ref("check");
const iconPopoverOpen = ref(false);

const variantButtons = [
  { value: "", label: "Default", activeColor: "var(--color-interactive)" },
  { value: "danger", label: "Danger", activeColor: "var(--color-danger)" },
  { value: "success", label: "Success", activeColor: "var(--color-success)" },
  { value: "warning", label: "Warning", activeColor: "var(--color-warning)" },
  { value: "info", label: "Info", activeColor: "var(--color-interactive)" },
  { value: "muted", label: "Muted", activeColor: "var(--color-surface-sunken)" },
];
const sizeButtons = [
  { value: "sm", label: "SM" },
  { value: "md", label: "MD" },
  { value: "lg", label: "LG" },
];
const textPositionButtons = [
  { value: "inside", label: "Inside" },
  { value: "above", label: "Above" },
  { value: "beside", label: "Beside" },
];
const textAlignButtons = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];
const iconNames = [
  "check",
  "save",
  "edit",
  "trash",
  "search",
  "play",
  "pause",
  "clock",
  "gear",
  "info",
  "copy",
  "download",
  "refresh",
  "view",
  "create",
  "close",
  "back",
  "pencil",
  "folder",
  "document",
];

function selectIcon(name) {
  selectedIcon.value = name;
  iconPopoverOpen.value = false;
}
</script>

<template>
  <div class="flex flex-col gap-5 w-full">
    <DanxProgressBar
      :value="value"
      :buffer="buffer"
      :variant="variant"
      :size="size"
      :icon="selectedIcon || undefined"
      :striped="striped"
      :animateStripes="animateStripes"
      :glow="glow"
      :shimmer="shimmer"
      :gradient="gradient"
      :showText="showText"
      :textPosition="textPosition"
      :textAlign="textAlign"
      :indeterminate="indeterminate"
      :label="label || undefined"
    />

    <!-- Sliders -->
    <div class="flex gap-4 flex-wrap">
      <label class="flex items-center gap-2 text-[0.8rem] min-w-0 flex-1">
        Value: {{ value }}%
        <input type="range" v-model.number="value" min="0" max="100" class="flex-1" />
      </label>
      <label class="flex items-center gap-2 text-[0.8rem] min-w-0 flex-1">
        Buffer: {{ buffer }}%
        <input type="range" v-model.number="buffer" min="0" max="100" class="flex-1" />
      </label>
    </div>

    <!-- Variant -->
    <div class="flex flex-col gap-1.5 items-start">
      <span class="text-[0.7rem] text-gray-400 uppercase tracking-wide">Variant</span>
      <DanxButtonGroup v-model="variant" :buttons="variantButtons" />
    </div>

    <!-- Size, Text Position & Align -->
    <div class="flex gap-6 flex-wrap">
      <div class="flex flex-col gap-1.5">
        <span class="text-[0.7rem] text-gray-400 uppercase tracking-wide">Size</span>
        <DanxButtonGroup v-model="size" :buttons="sizeButtons" />
      </div>
      <div class="flex flex-col gap-1.5">
        <span class="text-[0.7rem] text-gray-400 uppercase tracking-wide">Text Position</span>
        <DanxButtonGroup v-model="textPosition" :buttons="textPositionButtons" />
      </div>
      <div class="flex flex-col gap-1.5">
        <span class="text-[0.7rem] text-gray-400 uppercase tracking-wide">Text Align</span>
        <DanxButtonGroup v-model="textAlign" :buttons="textAlignButtons" />
      </div>
    </div>

    <!-- Icon Picker -->
    <div class="flex flex-col gap-1.5">
      <span class="text-[0.7rem] text-gray-400 uppercase tracking-wide">Icon</span>
      <div class="flex items-center gap-3">
        <DanxPopover v-model="iconPopoverOpen" trigger="click">
          <template #trigger>
            <button
              class="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-600 rounded-md bg-gray-900 text-gray-200 text-[0.8rem] cursor-pointer"
            >
              <DanxIcon v-if="selectedIcon" :icon="selectedIcon" class="w-4 h-4" />
              <span>{{ selectedIcon || "(none)" }}</span>
            </button>
          </template>
          <div class="grid grid-cols-5 gap-1 p-2 max-w-[280px]">
            <button
              v-for="name in iconNames"
              :key="name"
              class="flex items-center justify-center w-10 h-10 border border-transparent rounded-md bg-transparent text-gray-200 cursor-pointer"
              :class="name === selectedIcon ? 'bg-slate-700 border-cyan-500' : ''"
              :title="name"
              @click="selectIcon(name)"
            >
              <DanxIcon :icon="name" class="w-[1.1rem] h-[1.1rem]" />
            </button>
            <button
              class="flex items-center justify-center w-10 h-10 border border-transparent rounded-md bg-transparent text-gray-400 cursor-pointer text-[0.65rem]"
              :class="!selectedIcon ? 'bg-slate-700 border-cyan-500' : ''"
              title="No icon"
              @click="selectIcon('')"
            >
              none
            </button>
          </div>
        </DanxPopover>
      </div>
    </div>

    <!-- Custom Label -->
    <label class="flex items-center gap-2 text-[0.8rem] min-w-0">
      Custom Label
      <input
        v-model="label"
        class="px-1.5 py-0.5 border border-gray-600 rounded text-[0.8rem] bg-gray-900 text-gray-200 flex-1 min-w-0"
        placeholder="Leave empty for default %"
      />
    </label>

    <!-- Toggles -->
    <div class="flex gap-4 flex-wrap text-[0.8rem]">
      <label class="flex items-center gap-2 text-[0.8rem] min-w-0">
        <input type="checkbox" v-model="showText" class="accent-cyan-500" /> Show Text
      </label>
      <label class="flex items-center gap-2 text-[0.8rem] min-w-0">
        <input type="checkbox" v-model="indeterminate" class="accent-cyan-500" /> Indeterminate
      </label>
      <label class="flex items-center gap-2 text-[0.8rem] min-w-0">
        <input type="checkbox" v-model="striped" class="accent-cyan-500" /> Striped
      </label>
      <label class="flex items-center gap-2 text-[0.8rem] min-w-0">
        <input type="checkbox" v-model="animateStripes" class="accent-cyan-500" /> Animate Stripes
      </label>
      <label class="flex items-center gap-2 text-[0.8rem] min-w-0">
        <input type="checkbox" v-model="glow" class="accent-cyan-500" /> Glow
      </label>
      <label class="flex items-center gap-2 text-[0.8rem] min-w-0">
        <input type="checkbox" v-model="shimmer" class="accent-cyan-500" /> Shimmer
      </label>
      <label class="flex items-center gap-2 text-[0.8rem] min-w-0">
        <input type="checkbox" v-model="gradient" class="accent-cyan-500" /> Gradient
      </label>
    </div>
  </div>
</template>
