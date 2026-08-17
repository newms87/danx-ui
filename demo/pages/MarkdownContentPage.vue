<script setup lang="ts">
/**
 * MarkdownContentPage
 *
 * Demo page for the MarkdownContent component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import markdownContentDocs from "../../docs/markdown-content.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./markdown-content-examples/BasicUsage.vue?raw";
import allBlockTypesCode from "./markdown-content-examples/AllBlockTypes.vue?raw";
import codeBlocksCode from "./markdown-content-examples/CodeBlocks.vue?raw";
import autoDetectedDataCode from "./markdown-content-examples/AutoDetectedData.vue?raw";
import liveEditingCode from "./markdown-content-examples/LiveEditing.vue?raw";
import messageStreamCode from "./markdown-content-examples/MessageStream.vue?raw";
import tokenThemingCode from "./markdown-content-examples/TokenTheming.vue?raw";
</script>

<template>
  <DemoPage
    title="Markdown Content"
    description="A read-only markdown renderer — headings, lists, tables, footnotes, and syntax-highlighted code blocks, with no editing surface."
    :docs="markdownContentDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="Pass a markdown string to content. There is nothing else to configure."
      :code="basicUsageCode"
    />

    <DemoSection
      title="All Block Types"
      description="Headings, nested lists, task lists, aligned tables, definition lists, blockquotes, horizontal rules, and footnotes."
      :code="allBlockTypesCode"
    />

    <DemoSection
      title="Code Blocks"
      description="Fenced blocks are rendered as nested CodeViewer instances with syntax highlighting and a copy button."
      :code="codeBlocksCode"
    />

    <DemoSection
      title="Auto-Detected JSON and YAML"
      description="Unfenced structured data is detected automatically. Switching format on an auto-detected block persists the preference to localStorage; fenced blocks always keep their declared language."
      :code="autoDetectedDataCode"
    />

    <DemoSection
      title="Live Editing"
      description="Re-tokenizing and re-rendering on every keystroke stays smooth — there is no editor machinery to maintain."
      :code="liveEditingCode"
    />

    <DemoSection
      title="Message Stream"
      description="The intended use case: many independent blocks of markdown you did not author in place. MarkdownEditor in readonly mode would mount a contenteditable surface per message."
      :code="messageStreamCode"
    />

    <DemoSection
      title="Token Theming"
      description="MarkdownContent defines no tokens of its own. Override the inherited --dx-mde-content-* and --dx-code-viewer-* tokens on any ancestor."
      :code="tokenThemingCode"
    />
  </DemoPage>
</template>
