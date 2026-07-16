<!--
/**
 * DanxStepper - Multi-step workflow progress indicator
 *
 * Renders an ordered list of steps with complete/active/upcoming/error
 * states, in horizontal or vertical orientation. Supports an optional
 * clickable (non-linear) navigation mode and a v-model bound to the
 * active step index.
 *
 * ## Features
 * - Ordered steps with label, optional description and icon
 * - Automatic complete/active/upcoming status derived from the active index
 * - Explicit per-step status override (e.g. "error")
 * - Horizontal and vertical orientation
 * - Optional clickable (non-linear) navigation mode
 * - v-model for the active step index
 * - Scoped slots for custom step label and connector content
 * - Full CSS token system for styling
 * - Light and dark theme support
 *
 * ## Props
 * | Prop        | Type                         | Default        | Description                |
 * |-------------|------------------------------|----------------|----------------------------|
 * | modelValue  | number                       | -              | Active step index (v-model)|
 * | steps       | DanxStep[]                   | -              | Array of step items        |
 * | orientation | "horizontal" \| "vertical"   | "horizontal"   | Layout direction           |
 * | clickable   | boolean                      | false          | Enables non-linear clicks  |
 *
 * ## Events
 * | Event             | Payload | Description                              |
 * |-------------------|---------|------------------------------------------|
 * | update:modelValue | number  | Emitted when a step is clicked            |
 * | stepChange        | number  | Emitted when a step is clicked (clickable)|
 *
 * ## Slots
 * | Slot      | Scoped Props                  | Description                    |
 * |-----------|--------------------------------|--------------------------------|
 * | label     | { step, index, status }       | Replaces label + description   |
 * | connector | { index, status }             | Replaces the connector line     |
 *
 * ## CSS Tokens
 * Container:
 * | Token                             | Default                | Description            |
 * |-----------------------------------|-------------------------|------------------------|
 * | --dx-stepper-gap                  | --spacing-2             | Gap between steps       |
 *
 * Indicator:
 * | Token                             | Default                       | Description       |
 * |-----------------------------------|--------------------------------|-------------------|
 * | --dx-stepper-indicator-size       | 2rem                           | Indicator diameter |
 * | --dx-stepper-indicator-font-size  | --text-sm                      | Index number size  |
 * | --dx-stepper-indicator-font-weight| --font-medium                  | Index number weight|
 * | --dx-stepper-indicator-border     | --color-border                | Upcoming border     |
 * | --dx-stepper-indicator-bg         | --color-surface                | Upcoming background|
 * | --dx-stepper-indicator-text       | --color-text-muted             | Upcoming text       |
 * | --dx-stepper-active-bg            | --color-interactive             | Active background   |
 * | --dx-stepper-active-text          | --color-text-inverted           | Active text         |
 * | --dx-stepper-complete-bg          | --color-success                 | Complete background |
 * | --dx-stepper-complete-text        | --color-text-inverted           | Complete text       |
 * | --dx-stepper-error-bg             | --color-danger                  | Error background    |
 * | --dx-stepper-error-text           | --color-text-inverted           | Error text          |
 *
 * Typography:
 * | Token                             | Default        | Description       |
 * |-----------------------------------|----------------|-------------------|
 * | --dx-stepper-label-font-size      | --text-sm      | Label font size   |
 * | --dx-stepper-label-font-weight    | --font-medium  | Label font weight |
 * | --dx-stepper-description-color    | --color-text-muted | Description text |
 *
 * Connector:
 * | Token                             | Default             | Description         |
 * |-----------------------------------|---------------------|---------------------|
 * | --dx-stepper-connector-color      | --color-border      | Upcoming connector   |
 * | --dx-stepper-connector-complete   | --color-success     | Complete connector   |
 * | --dx-stepper-connector-thickness  | 2px                 | Connector thickness  |
 *
 * ## Usage Examples
 *
 * Basic stepper:
 *   <DanxStepper v-model="activeStep" :steps="steps" />
 *
 * Vertical, clickable:
 *   <DanxStepper v-model="activeStep" :steps="steps" orientation="vertical" clickable />
 *
 * Custom label slot:
 *   <DanxStepper v-model="activeStep" :steps="steps">
 *     <template #label="{ step, status }">
 *       <span :class="{ 'font-bold': status === 'active' }">{{ step.label }}</span>
 *     </template>
 *   </DanxStepper>
 */
-->

<script setup lang="ts">
import { computed } from "vue";
import { DanxIcon } from "../icon";
import type { DanxStep, DanxStepperProps, DanxStepStatus } from "./types";

const props = withDefaults(defineProps<DanxStepperProps>(), {
  orientation: "horizontal",
  clickable: false,
});

const emit = defineEmits<{
  (e: "stepChange", index: number): void;
}>();

const modelValue = defineModel<number>("modelValue", { required: true });

/**
 * Resolve a step's effective status: explicit override wins, otherwise
 * derived from its index relative to the active step index.
 */
function stepStatus(step: DanxStep, index: number): DanxStepStatus {
  if (step.status) return step.status;
  if (index < modelValue.value) return "complete";
  if (index === modelValue.value) return "active";
  return "upcoming";
}

const resolvedSteps = computed(() =>
  props.steps.map((step, index) => ({ step, index, status: stepStatus(step, index) }))
);

/**
 * Navigate to a step when clickable mode is enabled.
 */
function selectStep(index: number) {
  if (!props.clickable) return;
  modelValue.value = index;
  emit("stepChange", index);
}
</script>

<template>
  <ol class="danx-stepper" :class="{ 'is-vertical': orientation === 'vertical' }">
    <li
      v-for="{ step, index, status } in resolvedSteps"
      :key="index"
      class="danx-stepper__step"
      :class="[`is-${status}`, { 'is-clickable': clickable }]"
    >
      <div class="danx-stepper__row">
        <component
          :is="clickable ? 'button' : 'div'"
          :type="clickable ? 'button' : undefined"
          class="danx-stepper__indicator"
          :aria-current="status === 'active' ? 'step' : undefined"
          @click="selectStep(index)"
        >
          <DanxIcon v-if="step.icon" :icon="step.icon" class="danx-stepper__icon" />
          <DanxIcon v-else-if="status === 'complete'" icon="check" class="danx-stepper__icon" />
          <span v-else>{{ index + 1 }}</span>
        </component>

        <span v-if="index < resolvedSteps.length - 1" class="danx-stepper__connector">
          <slot name="connector" :index="index" :status="status" />
        </span>
      </div>

      <div class="danx-stepper__content">
        <slot name="label" :step="step" :index="index" :status="status">
          <span class="danx-stepper__label">{{ step.label }}</span>
          <span v-if="step.description" class="danx-stepper__description">{{
            step.description
          }}</span>
        </slot>
      </div>
    </li>
  </ol>
</template>
