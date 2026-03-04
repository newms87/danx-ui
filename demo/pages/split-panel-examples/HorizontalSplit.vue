<script setup>
import { ref } from "vue";
import {
  DanxSplitPanel,
  DanxIcon,
  DanxBadge,
  DanxButton,
  DanxChip,
  DanxProgressBar,
  DanxTooltip,
  DanxScroll,
} from "danx-ui";

const logs = ref([
  { time: "14:32:01", level: "info", msg: "Server started on port 3000" },
  { time: "14:32:02", level: "success", msg: "Database connected (12ms)" },
  { time: "14:32:03", level: "info", msg: "Loading 847 routes..." },
  { time: "14:32:03", level: "success", msg: "Routes loaded successfully" },
  { time: "14:32:05", level: "warning", msg: "Cache miss for session store" },
  { time: "14:32:06", level: "info", msg: "Request: GET /api/users (200)" },
  { time: "14:32:08", level: "danger", msg: "Failed to connect to Redis" },
  { time: "14:32:09", level: "info", msg: "Retrying connection..." },
  { time: "14:32:10", level: "success", msg: "Redis reconnected" },
]);
</script>

<template>
  <DanxSplitPanel
    :panels="[
      { id: 'editor', label: 'Editor', defaultWidth: 60 },
      { id: 'console', label: 'Console', defaultWidth: 40 },
    ]"
    horizontal
    class="h-[450px] rounded-xl border-2 border-blue-500/40 shadow-xl overflow-hidden"
  >
    <template #editor>
      <div class="h-full flex flex-col bg-blue-500/5">
        <div class="px-5 py-3 border-b-2 border-blue-500/30 flex items-center gap-3 bg-blue-500/10">
          <DanxIcon icon="code" class="w-4 h-4 text-interactive" />
          <span class="font-semibold text-sm">server.ts</span>
          <div class="flex gap-1.5 ml-auto">
            <DanxChip variant="info">TypeScript</DanxChip>
            <DanxBadge variant="success" size="sm">
              <DanxIcon icon="confirm" class="w-3 h-3" />
              No errors
            </DanxBadge>
          </div>
        </div>
        <DanxScroll class="flex-1 p-5">
          <pre
            class="m-0 text-sm leading-loose text-text-muted font-mono bg-surface-sunken rounded-lg p-4 border border-border"
          ><span class="text-info">import</span> express <span class="text-info">from</span> <span class="text-success">"express"</span>;
<span class="text-info">import</span> { connectDB } <span class="text-info">from</span> <span class="text-success">"./database"</span>;
<span class="text-info">import</span> { loadRoutes } <span class="text-info">from</span> <span class="text-success">"./routes"</span>;

<span class="text-info">const</span> app = express();
<span class="text-info">const</span> PORT = process.env.PORT || <span class="text-warning">3000</span>;

<span class="text-info">async function</span> <span class="text-warning">bootstrap</span>() {
  <span class="text-info">await</span> connectDB();
  <span class="text-info">await</span> loadRoutes(app);
  app.listen(PORT);
}</pre>
        </DanxScroll>
        <div
          class="px-5 py-2.5 border-t-2 border-green-500/20 bg-green-500/5 flex items-center gap-4"
        >
          <DanxProgressBar
            :value="100"
            size="sm"
            variant="success"
            class="w-24"
            :show-text="false"
          />
          <span class="text-xs text-success font-medium">Build complete</span>
          <div class="ml-auto flex gap-2">
            <DanxTooltip text="Run file">
              <DanxButton size="xs" variant="success"
                ><DanxIcon icon="play" class="w-3 h-3"
              /></DanxButton>
            </DanxTooltip>
            <DanxTooltip text="Stop">
              <DanxButton size="xs" variant="danger"
                ><DanxIcon icon="stop" class="w-3 h-3"
              /></DanxButton>
            </DanxTooltip>
          </div>
        </div>
      </div>
    </template>
    <template #console>
      <div class="h-full flex flex-col bg-amber-500/5">
        <div
          class="px-4 py-2.5 border-t-2 border-amber-500/30 flex items-center gap-2 bg-amber-500/10"
        >
          <DanxIcon icon="keyboard" class="w-3.5 h-3.5 text-text-subtle" />
          <DanxChip variant="muted">Console</DanxChip>
          <DanxBadge size="sm" class="ml-auto">{{ logs.length }}</DanxBadge>
          <DanxTooltip text="Clear console">
            <DanxButton size="xxs" variant="danger"
              ><DanxIcon icon="trash" class="w-3 h-3"
            /></DanxButton>
          </DanxTooltip>
        </div>
        <DanxScroll class="flex-1 px-4 py-2 font-mono text-xs">
          <div
            v-for="(log, i) in logs"
            :key="i"
            class="flex items-center gap-3 py-1.5 border-b border-amber-500/20"
          >
            <span class="text-text-subtle shrink-0">{{ log.time }}</span>
            <DanxBadge
              :variant="log.level"
              size="sm"
              class="shrink-0 w-18 justify-center uppercase"
              >{{ log.level }}</DanxBadge
            >
            <span class="text-text">{{ log.msg }}</span>
          </div>
        </DanxScroll>
      </div>
    </template>
  </DanxSplitPanel>
</template>
