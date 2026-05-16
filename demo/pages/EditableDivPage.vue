<script setup lang="ts">
/**
 * EditableDivPage
 *
 * Demo page for DanxEditableDiv with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

import editableDivDocs from "../../docs/editable-div.md?raw";

import basicUsageCode from "./editable-div-examples/BasicUsage.vue?raw";
import sizesCode from "./editable-div-examples/Sizes.vue?raw";
import headingCode from "./editable-div-examples/Heading.vue?raw";
import multiLineCode from "./editable-div-examples/MultiLine.vue?raw";
import validationCode from "./editable-div-examples/Validation.vue?raw";
import debounceCode from "./editable-div-examples/Debounce.vue?raw";
import savingCode from "./editable-div-examples/Saving.vue?raw";
import readonlyCode from "./editable-div-examples/Readonly.vue?raw";
</script>

<template>
  <DemoPage
    title="Editable Div"
    description="Inline-edit primitive for plain-text fields. Tab into the surface to edit — there is no hover-pencil or click-to-focus dance."
    :docs="editableDivDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="Default commit-on-blur strategy. Enter also commits in single mode (the default)."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Sizes"
      description="Three sizes (sm, md, lg) affect font-size and padding via CSS tokens."
      :code="sizesCode"
    />

    <DemoSection
      title="Heading Tag"
      description="The `as` prop renders the surface as a heading (h1/h2/h3) or paragraph — useful for drop-in title editors."
      :code="headingCode"
    />

    <DemoSection
      title="Multi-Line"
      description="Multi mode preserves newlines and requires Ctrl/Cmd+Enter to commit. Pair with `layout=block` to stretch."
      :code="multiLineCode"
    />

    <DemoSection
      title="Validation"
      description="Built-in min/max length plus a custom sync validator. Invalid commits set an error ring and emit `invalid` with a message."
      :code="validationCode"
    />

    <DemoSection
      title="Debounce Commit"
      description="`commit=debounce` autocommits after the configured quiet window — good for autosave."
      :code="debounceCode"
    />

    <DemoSection
      title="Saving Spinner"
      description="`saving=true` overlays a spinner and queues commits until the caller's PATCH resolves."
      :code="savingCode"
    />

    <DemoSection
      title="Readonly"
      description="`readonly` renders inert text with no edit affordance. The surface remains tab-focusable for screen readers."
      :code="readonlyCode"
    />
  </DemoPage>
</template>
