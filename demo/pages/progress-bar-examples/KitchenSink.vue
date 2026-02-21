<script setup lang="ts">
import { ref } from "vue";
import { DanxProgressBar, DanxButtonGroup, DanxPopover, DanxIcon } from "danx-ui";

const value = ref(75);
const buffer = ref(90);
const type = ref("danger");
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

const typeButtons = [
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

const labelStyle =
  "display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; min-width: 0";
const inputStyle =
  "padding: 0.2rem 0.4rem; border: 1px solid #555; border-radius: 4px; font-size: 0.8rem; background: #222; color: #eee; flex: 1; min-width: 0";
const checkStyle = "accent-color: #06b6d4";
const sectionLabel =
  "font-size: 0.7rem; color: #999; text-transform: uppercase; letter-spacing: 0.05em";
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1.25rem; width: 100%">
    <DanxProgressBar
      :value="value"
      :buffer="buffer"
      :type="type"
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
    <div style="display: flex; gap: 1rem; flex-wrap: wrap">
      <label :style="labelStyle" style="flex: 1">
        Value: {{ value }}%
        <input type="range" v-model.number="value" min="0" max="100" style="flex: 1" />
      </label>
      <label :style="labelStyle" style="flex: 1">
        Buffer: {{ buffer }}%
        <input type="range" v-model.number="buffer" min="0" max="100" style="flex: 1" />
      </label>
    </div>

    <!-- Type -->
    <div style="display: flex; flex-direction: column; gap: 0.35rem; align-items: flex-start">
      <span :style="sectionLabel">Type</span>
      <DanxButtonGroup v-model="type" :buttons="typeButtons" />
    </div>

    <!-- Size, Text Position & Align -->
    <div style="display: flex; gap: 1.5rem; flex-wrap: wrap">
      <div style="display: flex; flex-direction: column; gap: 0.35rem">
        <span :style="sectionLabel">Size</span>
        <DanxButtonGroup v-model="size" :buttons="sizeButtons" />
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.35rem">
        <span :style="sectionLabel">Text Position</span>
        <DanxButtonGroup v-model="textPosition" :buttons="textPositionButtons" />
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.35rem">
        <span :style="sectionLabel">Text Align</span>
        <DanxButtonGroup v-model="textAlign" :buttons="textAlignButtons" />
      </div>
    </div>

    <!-- Icon Picker -->
    <div style="display: flex; flex-direction: column; gap: 0.35rem">
      <span :style="sectionLabel">Icon</span>
      <div style="display: flex; align-items: center; gap: 0.75rem">
        <DanxPopover v-model="iconPopoverOpen" trigger="click">
          <template #trigger>
            <button
              style="
                display: inline-flex;
                align-items: center;
                gap: 0.4rem;
                padding: 0.35rem 0.75rem;
                border: 1px solid #555;
                border-radius: 6px;
                background: #222;
                color: #eee;
                font-size: 0.8rem;
                cursor: pointer;
              "
            >
              <DanxIcon
                v-if="selectedIcon"
                :icon="selectedIcon"
                style="width: 1rem; height: 1rem"
              />
              <span>{{ selectedIcon || "(none)" }}</span>
            </button>
          </template>
          <div
            style="
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 0.25rem;
              padding: 0.5rem;
              max-width: 280px;
            "
          >
            <button
              v-for="name in iconNames"
              :key="name"
              style="
                display: flex;
                align-items: center;
                justify-content: center;
                width: 2.5rem;
                height: 2.5rem;
                border: 1px solid transparent;
                border-radius: 6px;
                background: transparent;
                color: #eee;
                cursor: pointer;
              "
              :style="name === selectedIcon ? 'background: #334155; border-color: #06b6d4' : ''"
              :title="name"
              @click="selectIcon(name)"
            >
              <DanxIcon :icon="name" style="width: 1.1rem; height: 1.1rem" />
            </button>
            <button
              style="
                display: flex;
                align-items: center;
                justify-content: center;
                width: 2.5rem;
                height: 2.5rem;
                border: 1px solid transparent;
                border-radius: 6px;
                background: transparent;
                color: #999;
                cursor: pointer;
                font-size: 0.65rem;
              "
              :style="!selectedIcon ? 'background: #334155; border-color: #06b6d4' : ''"
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
    <label :style="labelStyle">
      Custom Label
      <input v-model="label" :style="inputStyle" placeholder="Leave empty for default %" />
    </label>

    <!-- Toggles -->
    <div style="display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.8rem">
      <label :style="labelStyle">
        <input type="checkbox" v-model="showText" :style="checkStyle" /> Show Text
      </label>
      <label :style="labelStyle">
        <input type="checkbox" v-model="indeterminate" :style="checkStyle" /> Indeterminate
      </label>
      <label :style="labelStyle">
        <input type="checkbox" v-model="striped" :style="checkStyle" /> Striped
      </label>
      <label :style="labelStyle">
        <input type="checkbox" v-model="animateStripes" :style="checkStyle" /> Animate Stripes
      </label>
      <label :style="labelStyle">
        <input type="checkbox" v-model="glow" :style="checkStyle" /> Glow
      </label>
      <label :style="labelStyle">
        <input type="checkbox" v-model="shimmer" :style="checkStyle" /> Shimmer
      </label>
      <label :style="labelStyle">
        <input type="checkbox" v-model="gradient" :style="checkStyle" /> Gradient
      </label>
    </div>
  </div>
</template>
