<script setup lang="ts">
/**
 * Tooltip Demo Page
 *
 * Demonstrates DanxTooltip component features.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

import tooltipDocs from "../../docs/tooltip.md?raw";

import basicUsageCode from "./tooltip-examples/BasicUsage.vue?raw";
import triggerIconCode from "./tooltip-examples/TriggerIcon.vue?raw";
import variantsCode from "./tooltip-examples/Variants.vue?raw";
import placementCode from "./tooltip-examples/Placement.vue?raw";

import panelIconCode from "./tooltip-examples/PanelIcon.vue?raw";
import clickAndFocusCode from "./tooltip-examples/ClickAndFocus.vue?raw";
import richContentCode from "./tooltip-examples/RichContent.vue?raw";
import targetPropCode from "./tooltip-examples/TargetProp.vue?raw";
import disabledCode from "./tooltip-examples/Disabled.vue?raw";
</script>

<template>
  <DemoPage
    title="Tooltip"
    description="A floating tooltip anchored to a trigger element with auto-positioning and semantic colors."
    :docs="tooltipDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="A tooltip with trigger slot content, and a shortcut using triggerIcon."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Trigger Icon Shortcut"
      description="Use the triggerIcon prop to render a DanxIcon as the trigger without a slot."
      :code="triggerIconCode"
    />

    <DemoSection
      title="Variants"
      description="One tooltip per variant with different semantic colors."
      :code="variantsCode"
    />

    <DemoSection
      title="Placement"
      description="Control tooltip placement with the placement prop. Auto-flips when near viewport edges."
      :code="placementCode"
    />

    <DemoSection
      title="Panel Icon"
      description="The icon prop places a DanxIcon at the top-left of the panel content."
      :code="panelIconCode"
    />

    <DemoSection
      title="Click and Focus Modes"
      description="Use interaction='click' for click-to-toggle or interaction='focus' for focus-based tooltips."
      :code="clickAndFocusCode"
    />

    <DemoSection
      title="Rich Content"
      description="Use the default slot for rich HTML content inside the tooltip panel."
      :code="richContentCode"
    />

    <DemoSection
      title="Target Prop"
      description="Anchor the tooltip to an external element by ID string or HTMLElement ref."
      :code="targetPropCode"
    />

    <DemoSection
      title="Disabled"
      description="Use the disabled prop to prevent the tooltip from showing."
      :code="disabledCode"
    />
  </DemoPage>
</template>
