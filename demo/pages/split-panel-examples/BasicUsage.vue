<script setup>
import { ref } from "vue";
import {
  DanxSplitPanel,
  DanxIcon,
  DanxBadge,
  DanxButton,
  DanxChip,
  DanxTooltip,
  DanxProgressBar,
  DanxScroll,
} from "danx-ui";

const files = ref([
  { name: "index.ts", icon: "document", badge: "modified", variant: "warning" },
  { name: "types.ts", icon: "document", badge: "staged", variant: "success" },
  { name: "config.json", icon: "gear", badge: null, variant: "" },
  { name: "utils.ts", icon: "code", badge: "new", variant: "info" },
  { name: "README.md", icon: "document", badge: null, variant: "" },
]);

const selectedFile = ref("index.ts");
</script>

<template>
  <DanxSplitPanel
    :panels="[
      { id: 'sidebar', label: 'Sidebar', defaultWidth: 30 },
      { id: 'content', label: 'Content', defaultWidth: 70 },
    ]"
    class="h-[400px] rounded-xl border-2 border-blue-500/40 shadow-xl overflow-hidden"
  >
    <template #sidebar>
      <div class="h-full bg-blue-500/5 flex flex-col border-r-2 border-blue-500/30">
        <div class="px-4 py-3 border-b-2 border-blue-500/20 bg-blue-500/10">
          <DanxChip variant="info">
            <DanxIcon icon="folder" class="w-3.5 h-3.5" />
            Project Files
          </DanxChip>
        </div>
        <DanxScroll class="flex-1 p-2 flex flex-col gap-1">
          <DanxButton
            v-for="f in files"
            :key="f.name"
            size="sm"
            :variant="selectedFile === f.name ? 'info' : ''"
            class="w-full justify-start"
            @click="selectedFile = f.name"
          >
            <DanxIcon :icon="f.icon" class="w-3.5 h-3.5" />
            <span class="flex-1 text-left">{{ f.name }}</span>
            <DanxBadge v-if="f.badge" :variant="f.variant" size="sm">{{ f.badge }}</DanxBadge>
          </DanxButton>
        </DanxScroll>
        <div class="px-4 py-3 border-t-2 border-blue-500/20 bg-blue-500/10">
          <div class="text-xs text-text-subtle mb-1.5">Storage</div>
          <DanxProgressBar :value="68" size="sm" variant="info" gradient />
        </div>
      </div>
    </template>
    <template #content>
      <div class="h-full flex flex-col bg-surface shadow-inner">
        <div
          class="px-5 py-3 border-b-2 border-green-500/20 flex items-center gap-3 bg-green-500/5"
        >
          <DanxIcon icon="document" class="w-4 h-4 text-text-muted" />
          <span class="font-semibold text-sm">{{ selectedFile }}</span>
          <DanxBadge variant="success" size="sm">saved</DanxBadge>
          <div class="flex items-center gap-1.5 ml-auto">
            <DanxTooltip text="Copy file">
              <DanxButton size="xs"><DanxIcon icon="copy" class="w-3 h-3" /></DanxButton>
            </DanxTooltip>
            <DanxTooltip text="Edit file">
              <DanxButton size="xs"><DanxIcon icon="edit" class="w-3 h-3" /></DanxButton>
            </DanxTooltip>
            <DanxTooltip text="Download">
              <DanxButton size="xs" variant="info"
                ><DanxIcon icon="download" class="w-3 h-3"
              /></DanxButton>
            </DanxTooltip>
          </div>
        </div>
        <DanxScroll class="flex-1 p-5">
          <div class="flex flex-wrap gap-2 mb-4">
            <DanxChip variant="success">TypeScript</DanxChip>
            <DanxChip variant="info">ESM</DanxChip>
            <DanxChip variant="muted">247 lines</DanxChip>
          </div>
          <pre
            class="m-0 text-sm leading-relaxed text-text-muted font-mono bg-surface-sunken rounded-lg p-4 border border-border"
          ><span class="text-info">import</span> { defineComponent } <span class="text-info">from</span> <span class="text-success">"vue"</span>;
<span class="text-info">import</span> type { Config } <span class="text-info">from</span> <span class="text-success">"./types"</span>;

<span class="text-info">export function</span> <span class="text-warning">createApp</span>(config: Config) {
  <span class="text-info">return</span> defineComponent({
    name: config.name,
    setup() {
      <span class="text-text-subtle">// Application bootstrap logic</span>
    }
  });
}</pre>
        </DanxScroll>
      </div>
    </template>
  </DanxSplitPanel>
</template>
