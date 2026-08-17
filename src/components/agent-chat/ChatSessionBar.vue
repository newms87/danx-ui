<!--
/**
 * ChatSessionBar Component
 *
 * The strip above the composer: live session counters, a context-window
 * meter behind a popover, plan/quota rows, and a model picker. Internal to
 * the agent-chat tree.
 *
 * EVERY part of this bar is opt-in and driven entirely by props. The panel
 * invents no numbers of its own — supply `sessionStats` and the counters
 * appear, supply `contextUsage` and the meter appears, supply `models` and
 * the picker appears. Supply none and the bar renders nothing at all, which
 * is what a chat with no telemetry should look like.
 *
 * Nothing here is bespoke: the meter is `DanxUsageMeter`, the popover is
 * `DanxPopover`, the picker is `DanxDropdownMenu` in its picker mode
 * (`active` + `shortcut`), and reset times use the shared Intl formatters.
 *
 * ## Props
 * | Prop         | Type              | Default | Description                     |
 * |--------------|-------------------|---------|---------------------------------|
 * | stats        | ChatSessionStats  | -       | Elapsed / tokens / running tasks |
 * | contextUsage | ChatContextUsage  | -       | Segmented context-window meter  |
 * | limits       | ChatUsageLimit[]  | []      | Plan or rate limit rows         |
 * | models       | ChatModel[]       | []      | Selectable models               |
 * | modelId      | string            | -       | The model currently in effect   |
 *
 * ## Events
 * | Event       | Payload | Description                  |
 * |-------------|---------|-------------------------------|
 * | selectModel | string  | The user picked a model by id |
 */
-->

<script setup lang="ts">
import { computed, ref } from "vue";
import { DanxDropdownMenu } from "../dropdown-menu";
import type { DropdownMenuItem } from "../dropdown-menu";
import { DanxPopover } from "../popover";
import { DanxUsageMeter } from "../usage-meter";
import { fRelativeTime } from "../../shared/formatters/relativeTime";
import type { ChatContextUsage, ChatModel, ChatSessionStats, ChatUsageLimit } from "./types";

const props = withDefaults(
  defineProps<{
    stats?: ChatSessionStats;
    contextUsage?: ChatContextUsage;
    limits?: ChatUsageLimit[];
    models?: ChatModel[];
    modelId?: string;
  }>(),
  { limits: () => [], models: () => [] }
);

const emit = defineEmits<{ selectModel: [modelId: string] }>();

/** Compact duration: "1m 34s" / "45s" / "2h 5m". Intl-free, so peer-free. */
function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

/** 1600 -> "1.6k". Kept local and tiny rather than importing the meter's. */
function formatCount(value: number): string {
  if (value < 1000) return String(value);
  const thousands = value / 1000;
  return `${thousands >= 100 ? Math.round(thousands) : Math.round(thousands * 10) / 10}k`;
}

const statParts = computed<string[]>(() => {
  const stats = props.stats;
  if (!stats) return [];
  const parts: string[] = [];
  if (stats.elapsedMs != null) parts.push(formatElapsed(stats.elapsedMs));
  if (stats.tokens != null) parts.push(`${formatCount(stats.tokens)} tokens`);
  if (stats.runningTasks) {
    parts.push(`${stats.runningTasks} running task${stats.runningTasks === 1 ? "" : "s"}`);
  }
  return parts;
});

const usedTotal = computed(() =>
  (props.contextUsage?.segments ?? []).reduce((sum, segment) => sum + segment.value, 0)
);

/** Whole-percent context consumption, shown beside the counters. */
const contextPercent = computed(() => {
  const total = props.contextUsage?.total ?? 0;
  if (total <= 0) return 0;
  return Math.round((usedTotal.value / total) * 100);
});

const hasDetail = computed(() => !!props.contextUsage || props.limits.length > 0);
const hasSummary = computed(() => statParts.value.length > 0 || hasDetail.value);
const selectedModel = computed(() => props.models.find((model) => model.id === props.modelId));

/** Detail popover open state, driven explicitly rather than by hover. */
const detailOpen = ref(false);

/**
 * Models render as a picker, not an action list — the one in effect carries a
 * check. Grouped models collapse into a submenu whose parent reflects a
 * selected child, which DanxContextMenu already does for free.
 */
const modelItems = computed<DropdownMenuItem[]>(() => {
  const ungrouped = props.models.filter((model) => !model.group);
  const groups = new Map<string, ChatModel[]>();
  for (const model of props.models.filter((model) => model.group)) {
    const bucket = groups.get(model.group as string) ?? [];
    bucket.push(model);
    groups.set(model.group as string, bucket);
  }

  const toItem = (model: ChatModel): DropdownMenuItem => ({
    label: model.label,
    shortcut: model.shortcut,
    active: model.id === props.modelId,
    disabled: model.disabled,
    action: () => emit("selectModel", model.id),
  });

  return [
    ...ungrouped.map(toItem),
    ...[...groups.entries()].map(([group, models]) => ({
      label: group,
      children: models.map(toItem),
    })),
  ];
});
</script>

<template>
  <div v-if="hasSummary || models.length" class="danx-agent-chat-session" data-testid="session-bar">
    <DanxPopover v-if="hasDetail" v-model="detailOpen" placement="top">
      <template #trigger>
        <button
          type="button"
          class="danx-agent-chat-session__summary"
          data-testid="session-summary"
          :aria-expanded="detailOpen"
          @click="detailOpen = !detailOpen"
        >
          <span v-for="(part, i) in statParts" :key="part">
            <span v-if="i > 0" aria-hidden="true"> · </span>{{ part }}
          </span>
          <span v-if="contextUsage" class="danx-agent-chat-session__context">
            <span v-if="statParts.length" aria-hidden="true"> · </span>{{ contextPercent }}% context
          </span>
        </button>
      </template>

      <div class="danx-agent-chat-session__detail" data-testid="session-detail">
        <DanxUsageMeter
          v-if="contextUsage"
          :segments="contextUsage.segments"
          :total="contextUsage.total"
          :label="contextUsage.label || 'Context window'"
          size="sm"
        />

        <div
          v-if="limits.length"
          class="danx-agent-chat-session__limits"
          data-testid="usage-limits"
        >
          <div v-for="limit in limits" :key="limit.id" class="danx-agent-chat-session__limit">
            <div class="danx-agent-chat-session__limit-head">
              <span>{{ limit.label }}</span>
              <span v-if="limit.resetsAt" class="danx-agent-chat-session__limit-reset">
                Resets {{ fRelativeTime(limit.resetsAt) }}
              </span>
            </div>
            <DanxUsageMeter
              :segments="[{ id: limit.id, label: limit.label, value: limit.percent }]"
              :total="100"
              size="sm"
              :show-readout="false"
              :show-tooltips="false"
            />
          </div>
        </div>
      </div>
    </DanxPopover>

    <span v-else-if="statParts.length" class="danx-agent-chat-session__summary">
      {{ statParts.join(" · ") }}
    </span>

    <DanxDropdownMenu v-if="models.length" :items="modelItems" placement="top">
      <button type="button" class="danx-agent-chat-session__model" data-testid="model-picker">
        {{ selectedModel?.label || "Model" }}
      </button>
    </DanxDropdownMenu>
  </div>
</template>
