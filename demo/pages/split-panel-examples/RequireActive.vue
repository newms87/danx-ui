<script setup>
import { ref } from "vue";
import {
  DanxSplitPanel,
  DanxIcon,
  DanxBadge,
  DanxButton,
  DanxChip,
  DanxProgressBar,
  DanxButtonGroup,
  DanxTooltip,
  DanxScroll,
} from "danx-ui";

const panels = [
  { id: "left", label: "Preview", defaultWidth: 55 },
  { id: "right", label: "Inspector", defaultWidth: 45 },
];
const active = ref(["left", "right"]);
const toggleButtons = panels.map((p) => ({ value: p.id, label: p.label }));

const properties = [
  { label: "Width", value: "1200px", variant: "info" },
  { label: "Height", value: "800px", variant: "info" },
  { label: "Format", value: "PNG", variant: "success" },
  { label: "Color Space", value: "sRGB", variant: "" },
  { label: "File Size", value: "2.4 MB", variant: "warning" },
  { label: "Created", value: "Mar 1, 2026", variant: "muted" },
];

const layers = [
  { name: "Background", visible: true, variant: "info" },
  { name: "Text Layer", visible: true, variant: "success" },
  { name: "Effects", visible: false, variant: "warning" },
  { name: "Overlay", visible: true, variant: "danger" },
];
</script>

<template>
  <DanxSplitPanel
    v-model="active"
    :panels="panels"
    require-active
    class="h-[430px] rounded-xl border-2 border-blue-500/40 shadow-xl overflow-hidden"
  >
    <template #toggles>
      <div class="flex items-center gap-3 mb-3">
        <DanxButtonGroup v-model="active" :buttons="toggleButtons" multiple required />
        <DanxChip variant="muted">
          <DanxIcon icon="info" class="w-3 h-3" />
          Last panel stays open
        </DanxChip>
      </div>
    </template>
    <template #left>
      <div class="h-full flex flex-col bg-blue-500/5 border-r-2 border-blue-500/30">
        <div class="px-5 py-3 border-b-2 border-blue-500/20 bg-blue-500/10 flex items-center gap-2">
          <DanxIcon icon="view" class="w-4 h-4 text-interactive" />
          <span class="text-sm font-semibold">Preview</span>
          <div class="ml-auto flex gap-1.5">
            <DanxTooltip text="Zoom in">
              <DanxButton size="xxs"><DanxIcon icon="search" class="w-3 h-3" /></DanxButton>
            </DanxTooltip>
            <DanxTooltip text="Download">
              <DanxButton size="xxs" variant="info"
                ><DanxIcon icon="download" class="w-3 h-3"
              /></DanxButton>
            </DanxTooltip>
          </div>
        </div>
        <div class="flex-1 flex items-center justify-center p-6">
          <div
            class="w-full max-w-[280px] aspect-[3/2] rounded-xl shadow-2xl overflow-hidden border-2 border-border"
            style="
              background: linear-gradient(
                135deg,
                var(--color-info) 0%,
                var(--color-interactive) 40%,
                var(--color-success) 100%
              );
            "
          >
            <div class="h-full flex flex-col items-center justify-center text-white/90 gap-2">
              <DanxIcon icon="document" class="w-10 h-10 opacity-80" />
              <div class="text-lg font-bold">landscape.png</div>
              <DanxChip class="bg-white/20 text-white border-0">1200 x 800</DanxChip>
            </div>
          </div>
        </div>
        <div
          class="px-5 py-3 border-t-2 border-green-500/20 bg-green-500/5 flex items-center gap-3"
        >
          <DanxBadge variant="success" size="sm">
            <DanxIcon icon="confirm" class="w-3 h-3" />
            Optimized
          </DanxBadge>
          <DanxProgressBar
            :value="73"
            size="sm"
            variant="success"
            class="flex-1"
            :show-text="false"
          />
          <span class="text-xs text-text-muted">73% compressed</span>
        </div>
      </div>
    </template>
    <template #right>
      <div class="h-full flex flex-col bg-amber-500/5">
        <div
          class="px-5 py-3 border-b-2 border-amber-500/20 bg-amber-500/10 flex items-center gap-2"
        >
          <DanxIcon icon="search" class="w-4 h-4 text-text-muted" />
          <span class="text-sm font-semibold">Inspector</span>
          <DanxChip variant="info" class="ml-auto">PNG</DanxChip>
        </div>
        <DanxScroll class="flex-1 p-4 flex flex-col gap-5">
          <div>
            <div class="text-xs text-text-subtle uppercase tracking-wide mb-2">Properties</div>
            <div class="flex flex-col gap-1.5">
              <div
                v-for="prop in properties"
                :key="prop.label"
                class="flex items-center justify-between py-1.5 px-3 rounded-lg bg-surface-sunken border border-border/50 text-sm"
              >
                <span class="text-text-muted">{{ prop.label }}</span>
                <DanxBadge :variant="prop.variant" size="sm">{{ prop.value }}</DanxBadge>
              </div>
            </div>
          </div>
          <div>
            <div class="text-xs text-text-subtle uppercase tracking-wide mb-2">Layers</div>
            <div class="flex flex-col gap-1.5">
              <div
                v-for="layer in layers"
                :key="layer.name"
                class="flex items-center gap-2 py-1.5 px-3 rounded-lg border border-border/50 text-sm"
                :class="layer.visible ? 'bg-surface' : 'bg-surface-sunken opacity-50'"
              >
                <DanxButton size="xxs" :variant="layer.visible ? 'success' : 'muted'">
                  <DanxIcon :icon="layer.visible ? 'view' : 'close'" class="w-3 h-3" />
                </DanxButton>
                <span class="flex-1" :class="layer.visible ? 'text-text' : 'text-text-muted'">{{
                  layer.name
                }}</span>
                <DanxChip :variant="layer.variant">{{ layer.variant }}</DanxChip>
              </div>
            </div>
          </div>
        </DanxScroll>
      </div>
    </template>
  </DanxSplitPanel>
</template>
