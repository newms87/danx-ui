<!--
/**
 * ChatStepList Component
 *
 * The agent's tool calls / searches / reasoning, rendered as FLAT collapsible
 * rows under a single left rule. Internal to the agent-chat tree.
 *
 * Deliberately no card chrome per step: boxing every tool call turns a
 * transcript into a debug log, which is the dominant failure mode of agent
 * chat UIs. Detail is collapsed by default and never auto-expands.
 *
 * ## Props
 * | Prop  | Type       | Default | Description                    |
 * |-------|------------|---------|--------------------------------|
 * | steps | ChatStep[] | []      | Steps to render                |
 */
-->

<script setup lang="ts">
import { ref } from "vue";
import { DanxIcon } from "../icon";
import { DanxSpinner } from "../spinner";
import type { IconName } from "../icon/icons";
import type { ChatStep } from "./types";

withDefaults(defineProps<{ steps?: ChatStep[] }>(), { steps: () => [] });

const expanded = ref<Record<string, boolean>>({});

/** Only detail-bearing rows are interactive — the row button enforces it via `disabled`. */
function toggle(step: ChatStep) {
  expanded.value = { ...expanded.value, [step.id]: !expanded.value[step.id] };
}

const KIND_ICONS: Record<string, IconName> = {
  tool: "gear",
  search: "search",
  read: "document",
  write: "pencil",
  reasoning: "info",
};

function iconFor(step: ChatStep): IconName {
  if (step.status === "error") return "warning-triangle";
  return KIND_ICONS[step.kind ?? "tool"] ?? "gear";
}

function durationLabel(step: ChatStep): string {
  if (step.durationMs === undefined) return "";
  return step.durationMs < 1000
    ? `${Math.round(step.durationMs)}ms`
    : `${(step.durationMs / 1000).toFixed(1)}s`;
}
</script>

<template>
  <div v-if="steps.length" class="danx-agent-chat-steps" data-testid="steps">
    <div
      v-for="step in steps"
      :key="step.id"
      class="danx-agent-chat-step"
      :class="{ 'danx-agent-chat-step--error': step.status === 'error' }"
    >
      <button
        type="button"
        class="danx-agent-chat-step__row"
        :aria-expanded="step.detail ? !!expanded[step.id] : undefined"
        :disabled="!step.detail"
        @click="toggle(step)"
      >
        <DanxSpinner v-if="step.status === 'running'" size="sm" />
        <DanxIcon v-else :icon="iconFor(step)" />
        <span class="danx-agent-chat-step__label">{{ step.label }}</span>
        <span v-if="durationLabel(step)" class="danx-agent-chat-step__duration">
          {{ durationLabel(step) }}
        </span>
        <DanxIcon v-if="step.detail" :icon="expanded[step.id] ? 'chevron-down' : 'chevron-right'" />
      </button>
      <pre v-if="step.detail && expanded[step.id]" class="danx-agent-chat-step__detail">{{
        step.detail
      }}</pre>
    </div>
  </div>
</template>
