<!--
/**
 * DanxAccordion - Collapsible content sections
 *
 * A list of items, each with a clickable header and a collapsible panel
 * animated via the shared CollapseTransition. Supports single-open (default,
 * accordion-style) or multi-open modes, keyboard toggling, and correct
 * aria-expanded/region semantics.
 *
 * ## Props
 * | Prop     | Type            | Default | Description                          |
 * |----------|-----------------|---------|---------------------------------------|
 * | items    | AccordionItem[] | -       | Collapsible sections to render        |
 * | multiple | boolean         | false   | Allow more than one item open at once |
 *
 * ## Model
 * `v-model` — `string | null` in single mode (the open item's value, or
 * `null` if none open); `string[]` in multiple mode (open items' values).
 *
 * ## Slots
 * | Slot   | Scoped Props           | Description                              |
 * |--------|------------------------|--------------------------------------------|
 * | header | { item, isOpen }       | Header content. Falls back to `item.label` |
 * | panel  | { item, isOpen }       | Panel content, rendered only while open    |
 *
 * ## Usage Examples
 *
 * Single-open:
 *   <DanxAccordion v-model="openValue" :items="items">
 *     <template #panel="{ item }">{{ item.value }} content</template>
 *   </DanxAccordion>
 *
 * Multi-open:
 *   <DanxAccordion v-model="openValues" :items="items" multiple>
 *     <template #panel="{ item }">{{ item.value }} content</template>
 *   </DanxAccordion>
 */
-->

<script lang="ts">
let accordionIdCounter = 0;
</script>

<script setup lang="ts">
import { computed } from "vue";
import { CollapseTransition } from "../../shared/transitions";
import { DanxIcon } from "../icon";
import type { AccordionItem, DanxAccordionProps, DanxAccordionSlots } from "./types";

const props = withDefaults(defineProps<DanxAccordionProps>(), {
  multiple: false,
});

const modelValue = defineModel<string | string[] | null>({ default: null });

defineSlots<DanxAccordionSlots>();

const accordionId = `danx-accordion-${++accordionIdCounter}`;

const openValues = computed(() => {
  const value = modelValue.value;
  if (Array.isArray(value)) return new Set(value);
  return new Set(value ? [value] : []);
});

function isOpen(value: string): boolean {
  return openValues.value.has(value);
}

function headerId(value: string): string {
  return `${accordionId}-header-${value}`;
}

function panelId(value: string): string {
  return `${accordionId}-panel-${value}`;
}

/**
 * Toggling is only ever wired to the header button/keydown handlers, and a
 * disabled button never dispatches click or keydown events — so there's no
 * disabled guard here; the native `disabled` attribute is the only gate.
 */
function toggle(item: AccordionItem): void {
  if (props.multiple) {
    const next = new Set(openValues.value);
    if (next.has(item.value)) {
      next.delete(item.value);
    } else {
      next.add(item.value);
    }
    modelValue.value = Array.from(next);
  } else {
    modelValue.value = isOpen(item.value) ? null : item.value;
  }
}
</script>

<template>
  <div class="danx-accordion">
    <div
      v-for="item in items"
      :key="item.value"
      class="danx-accordion__item"
      :class="{ 'is-open': isOpen(item.value), 'is-disabled': item.disabled }"
    >
      <button
        :id="headerId(item.value)"
        type="button"
        class="danx-accordion__header"
        :aria-expanded="isOpen(item.value)"
        :aria-controls="panelId(item.value)"
        :disabled="item.disabled"
        @click="toggle(item)"
        @keydown.enter.prevent="toggle(item)"
        @keydown.space.prevent="toggle(item)"
      >
        <span class="danx-accordion__header-content">
          <slot name="header" :item="item" :is-open="isOpen(item.value)">{{ item.label }}</slot>
        </span>
        <DanxIcon icon="chevron-down" class="danx-accordion__chevron" />
      </button>

      <CollapseTransition>
        <div
          v-if="isOpen(item.value)"
          :id="panelId(item.value)"
          role="region"
          :aria-labelledby="headerId(item.value)"
          class="danx-accordion__panel"
        >
          <slot name="panel" :item="item" :is-open="isOpen(item.value)" />
        </div>
      </CollapseTransition>
    </div>
  </div>
</template>
