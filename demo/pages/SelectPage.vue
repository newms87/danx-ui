<script setup lang="ts">
/**
 * SelectPage
 *
 * Demo page for DanxSelect component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./select-examples/BasicUsage.vue?raw";
import multiSelectCode from "./select-examples/MultiSelect.vue?raw";
import filterableCode from "./select-examples/Filterable.vue?raw";
import variantsCode from "./select-examples/Variants.vue?raw";
import sizesCode from "./select-examples/Sizes.vue?raw";
import withIconsCode from "./select-examples/WithIcons.vue?raw";
import groupsCode from "./select-examples/Groups.vue?raw";
import statesCode from "./select-examples/States.vue?raw";
import clearableCode from "./select-examples/Clearable.vue?raw";
import creatableCode from "./select-examples/Creatable.vue?raw";
import customSlotsCode from "./select-examples/CustomSlots.vue?raw";
</script>

<template>
  <DemoPage
    title="Select"
    description="A feature-rich dropdown select with flat trigger, filtering, multi-select chips, keyboard navigation, and variant coloring."
  >
    <DemoSection
      title="Basic Usage"
      description="Simple single-select with v-model binding, label, and placeholder."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Multi-Select"
      description="Multi-select mode renders selected values as removable chips."
      :code="multiSelectCode"
    />

    <DemoSection
      title="Filterable"
      description="Search input in the dropdown filters options by label."
      :code="filterableCode"
    />

    <DemoSection
      title="Variants"
      description="Color variants apply to both the trigger and the dropdown panel."
      :code="variantsCode"
    />

    <DemoSection
      title="Sizes"
      description="Three sizes: sm, md (default), and lg."
      :code="sizesCode"
    />

    <DemoSection
      title="With Icons"
      description="Options can include icons rendered as DanxChip."
      :code="withIconsCode"
    />

    <DemoSection
      title="Groups"
      description="Options with a group property are organized under group headers."
      :code="groupsCode"
    />

    <DemoSection
      title="States"
      description="Error, helper text, disabled, readonly, and required states."
      :code="statesCode"
    />

    <DemoSection
      title="Clearable"
      description="Shows a clear button to reset the selection."
      :code="clearableCode"
    />

    <DemoSection
      title="Creatable"
      description="When filterable and creatable, users can create new options from filter text."
      :code="creatableCode"
    />

    <DemoSection
      title="Custom Slots"
      description="Header, footer, and option descriptions for custom content."
      :code="customSlotsCode"
    />
  </DemoPage>
</template>
