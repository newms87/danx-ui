<!--
/**
 * DanxAuditHistoryItem Component
 *
 * A single change-log/audit-trail row: who did what, to which field, and
 * when. Renders an actor, a color-coded action label, a relative timestamp,
 * and either a before/after value diff (when `entry.field` is set) or a
 * generic description fallback. Ships as one row so consumers compose their
 * own list/feed wrapper around it.
 *
 * ## Features
 * - Actor + relative-time timestamp (via the shared fTimeAgo formatter)
 * - Action label colored via the shared --dx-variant-* token system
 * - Before/after diff (strikethrough old -> new) when a field changed
 * - Generic description fallback (prop or slot) when no field is set
 * - CSS token system for complete styling control
 *
 * ## Props
 * | Prop          | Type              | Default | Description                              |
 * |---------------|-------------------|---------|-------------------------------------------|
 * | entry         | AuditHistoryEntry | -       | The audit entry to render (required)      |
 * | actionVariant | VariantType       | -       | Overrides the automatic action -> variant |
 *
 * ## Slots
 * | Slot    | Props            | Description                                          |
 * |---------|------------------|-------------------------------------------------------|
 * | default | { entry }        | Overrides the fallback description (no-field branch) |
 *
 * ## CSS Tokens
 * | Token                                  | Default        | Description          |
 * |-----------------------------------------|----------------|-----------------------|
 * | --dx-audit-history-item-gap             | 0.5rem         | Row gap               |
 * | --dx-audit-history-item-padding-y       | 0.5rem         | Vertical padding      |
 * | --dx-audit-history-item-font-size       | 0.875rem       | Body font size         |
 * | --dx-audit-history-item-actor-weight    | --font-semibold| Actor font weight     |
 * | --dx-audit-history-item-timestamp-color | --color-text-muted | Timestamp color   |
 * | --dx-audit-history-item-old-color       | --color-text-muted | Old value color   |
 *
 * ## Usage Examples
 *
 * Field change:
 *   <DanxAuditHistoryItem :entry="{
 *     actor: 'Jane Doe', timestamp: Date.now(), action: 'update',
 *     field: 'status', oldValue: 'Draft', newValue: 'Published',
 *   }" />
 *
 * No field (falls back to description):
 *   <DanxAuditHistoryItem :entry="{
 *     actor: 'Jane Doe', timestamp: Date.now(), action: 'create',
 *     description: 'created this record',
 *   }" />
 */
-->

<script setup lang="ts">
import { computed } from "vue";
import { fTimeAgo } from "../../shared/formatters/datetime";
import type { VariantType } from "../../shared/types";
import { DanxChip } from "../chip";
import type {
  AuditHistoryAction,
  DanxAuditHistoryItemProps,
  DanxAuditHistoryItemSlots,
} from "./types";

const props = defineProps<DanxAuditHistoryItemProps>();

defineSlots<DanxAuditHistoryItemSlots>();

/** Built-in action -> variant coloring, consistent with DanxChip/DanxAlert. */
const ACTION_VARIANTS: Record<string, VariantType> = {
  create: "success",
  update: "info",
  delete: "danger",
};

const resolvedVariant = computed<VariantType>(
  () => props.actionVariant || ACTION_VARIANTS[props.entry.action] || "muted"
);

const actionLabel = computed<AuditHistoryAction>(() => props.entry.action);

const hasDiff = computed(() => Boolean(props.entry.field));

const timestampLabel = computed(() => fTimeAgo(props.entry.timestamp));
</script>

<template>
  <div class="danx-audit-history-item">
    <span class="danx-audit-history-item__actor">{{ entry.actor }}</span>

    <DanxChip class="danx-audit-history-item__action" :variant="resolvedVariant" size="xs">
      {{ actionLabel }}
    </DanxChip>

    <span class="danx-audit-history-item__body">
      <template v-if="hasDiff">
        <span class="danx-audit-history-item__field">{{ entry.field }}</span>
        <span class="danx-audit-history-item__old">{{ entry.oldValue }}</span>
        <span class="danx-audit-history-item__arrow" aria-hidden="true">&#8594;</span>
        <span class="danx-audit-history-item__new">{{ entry.newValue }}</span>
      </template>
      <template v-else>
        <slot :entry="entry">{{ entry.description }}</slot>
      </template>
    </span>

    <time class="danx-audit-history-item__timestamp" :title="String(entry.timestamp)">
      {{ timestampLabel }}
    </time>
  </div>
</template>
