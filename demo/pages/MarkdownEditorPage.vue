<script setup lang="ts">
/**
 * MarkdownEditorPage
 *
 * Demo page for MarkdownEditor component with live examples.
 */
import DemoSection from "../components/DemoSection.vue";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./markdown-editor-examples/BasicUsage.vue?raw";
import readonlyModeCode from "./markdown-editor-examples/ReadonlyMode.vue?raw";
import customPlaceholderCode from "./markdown-editor-examples/CustomPlaceholder.vue?raw";
import darkAndLightCode from "./markdown-editor-examples/DarkAndLight.vue?raw";
import richContentCode from "./markdown-editor-examples/RichContent.vue?raw";
import heightConstraintsCode from "./markdown-editor-examples/HeightConstraints.vue?raw";
</script>

<template>
  <div class="demo-page">
    <h1>Markdown Editor</h1>
    <p class="demo-page__description">
      A rich contenteditable markdown editor with live preview, code blocks, tables, lists, and keyboard shortcuts.
    </p>

    <h2>Live Examples</h2>

    <DemoSection
      title="Basic Usage"
      description="A simple editor with v-model binding. Expand the raw markdown section to see the source."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Readonly Mode"
      description="Set readonly to render markdown without editing capabilities."
      :code="readonlyModeCode"
    />

    <DemoSection
      title="Custom Placeholder"
      description="Provide custom placeholder text shown when the editor is empty."
      :code="customPlaceholderCode"
    />

    <DemoSection
      title="Dark and Light Themes"
      description="Side-by-side comparison of the dark (default) and light themes."
      :code="darkAndLightCode"
    />

    <DemoSection
      title="Rich Content"
      description="Pre-populated with headings, bold, lists, code blocks, tables, blockquotes, and links."
      :code="richContentCode"
    />

    <DemoSection
      title="Height Constraints"
      description="Use minHeight and maxHeight props to control editor size."
      :code="heightConstraintsCode"
    />
  </div>
</template>
