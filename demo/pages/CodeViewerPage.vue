<script setup lang="ts">
/**
 * CodeViewerPage
 *
 * Demo page for CodeViewer component with live examples.
 */
import DemoSection from "../components/DemoSection.vue";

// Load SFC examples as raw strings for live-editable demos
import basicJsonCode from "./code-viewer-examples/BasicJson.vue?raw";
import editableYamlCode from "./code-viewer-examples/EditableYaml.vue?raw";
import markdownContentCode from "./code-viewer-examples/MarkdownContent.vue?raw";
import collapsiblePreviewCode from "./code-viewer-examples/CollapsiblePreview.vue?raw";
import darkAndLightCode from "./code-viewer-examples/DarkAndLight.vue?raw";
import allLanguagesCode from "./code-viewer-examples/AllLanguages.vue?raw";
</script>

<template>
  <div class="demo-page">
    <h1>Code Viewer</h1>
    <p class="demo-page__description">
      A syntax-highlighted code display with inline editing, format switching, and collapsible preview.
    </p>

    <h2>Live Examples</h2>

    <DemoSection
      title="Basic JSON/YAML Display"
      description="Pass an object and it renders as YAML by default. Click the language badge to switch formats."
      :code="basicJsonCode"
    />

    <DemoSection
      title="Editable YAML"
      description="Enable editing with canEdit and editable props. Edit inline then toggle the format via the language badge."
      :code="editableYamlCode"
    />

    <DemoSection
      title="Markdown Content"
      description='Use format="markdown" to render rich markdown with headings, code blocks, tables, and more.'
      :code="markdownContentCode"
    />

    <DemoSection
      title="Collapsible Preview"
      description="Collapsible mode shows a single-line preview. Click to expand the full content."
      :code="collapsiblePreviewCode"
    />

    <DemoSection
      title="Dark and Light Themes"
      description="Side-by-side comparison of the dark (default) and light themes."
      :code="darkAndLightCode"
    />

    <DemoSection
      title="All Supported Languages"
      description="CodeViewer supports JSON, YAML, HTML, CSS, JavaScript, and plain text formats."
      :code="allLanguagesCode"
    />
  </div>
</template>
