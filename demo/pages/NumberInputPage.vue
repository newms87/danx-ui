<script setup lang="ts">
/**
 * NumberInputPage
 *
 * Demo page for DanxNumberInput with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import numberInputDocs from "../../docs/number-input.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./number-input-examples/BasicUsage.vue?raw";
import minMaxClampingCode from "./number-input-examples/MinMaxClamping.vue?raw";
import decimalStepsCode from "./number-input-examples/DecimalSteps.vue?raw";
import holdToRepeatCode from "./number-input-examples/HoldToRepeat.vue?raw";
import sizesAndStatesCode from "./number-input-examples/SizesAndStates.vue?raw";
import themingCode from "./number-input-examples/Theming.vue?raw";
</script>

<template>
  <DemoPage
    title="Number Input"
    description="A numeric field with visible stepper buttons, range clamping and decimal-safe stepping — replacing the browser's tiny, inconsistent native spinners."
    :docs="numberInputDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="v-model binds a number. Clearing the field yields null rather than 0, so 'no answer' stays distinguishable from zero."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Min, max and clamping"
      description="Steppers disable at the bounds. Typing an out-of-range value settles on blur rather than mid-keystroke, so typing 5 on the way to 50 is never fought."
      :code="minMaxClampingCode"
    />

    <DemoSection
      title="Decimal steps"
      description="Rounding is anchored to the step's own decimal precision, so 0.2 + 0.1 is 0.3 and not 0.30000000000000004."
      :code="decimalStepsCode"
    />

    <DemoSection
      title="Hold to repeat"
      description="Press and hold a stepper to step continuously. holdDelay and holdInterval tune how eager that is — slow it down for values where a slip is expensive."
      :code="holdToRepeatCode"
    />

    <DemoSection
      title="Sizes and states"
      description="Three sizes, plus required, error, readonly and disabled — all rendered through the shared DanxFieldWrapper, so it matches every other field."
      :code="sizesAndStatesCode"
    />

    <DemoSection
      title="Theming with tokens"
      description="Every surface is a --dx-number-input-* custom property. No styling props — scope the tokens to a wrapper and the field re-skins."
      :code="themingCode"
    />
  </DemoPage>
</template>
