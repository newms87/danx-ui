<script setup lang="ts">
import { ref } from "vue";
import { DanxFileViewer } from "danx-ui";

// Generate 22 page children for the PDF
const PAGE_NAMES = [
  "Cover",
  "Table of Contents",
  "Executive Summary",
  "Company Overview",
  "Mission & Vision",
  "Leadership Team",
  "Q1 Performance",
  "Q2 Performance",
  "Q3 Performance",
  "Q4 Performance",
  "Revenue Breakdown",
  "Operating Expenses",
  "Balance Sheet",
  "Cash Flow Statement",
  "Market Analysis",
  "Growth Strategy",
  "Product Roadmap",
  "Customer Metrics",
  "Risk Assessment",
  "Sustainability Report",
  "Outlook & Projections",
  "Appendix",
];

const pageChildren = PAGE_NAMES.map((name, i) => ({
  id: `page-${i + 1}`,
  name: `Page ${i + 1} - ${name}`,
  size: 80000 + Math.floor(Math.random() * 40000),
  mime: "image/jpeg",
  url: `https://picsum.photos/seed/report-p${i + 1}/800/1100`,
  thumb: { url: `https://picsum.photos/seed/report-p${i + 1}/200/275` },
  // Every page gets text children (OCR + markdown summary).
  // Page 1 (Cover) also has image crops to demonstrate multi-level breadcrumbs.
  children: [
    // Page 1 gets image crops + text children
    ...(i === 0
      ? [
          {
            id: "crop-logo",
            name: "Cover Logo (crop)",
            size: 51200,
            mime: "image/png",
            url: "https://picsum.photos/seed/crop-logo/400/400",
            thumb: { url: "https://picsum.photos/seed/crop-logo/200/200" },
            children: [],
          },
          {
            id: "crop-title",
            name: "Cover Title (crop)",
            size: 40960,
            mime: "image/png",
            url: "https://picsum.photos/seed/crop-title/600/200",
            thumb: { url: "https://picsum.photos/seed/crop-title/200/67" },
            children: [],
          },
        ]
      : []),
    // Every page gets an OCR transcription and a markdown summary
    {
      id: `page-${i + 1}-ocr`,
      name: `page-${i + 1}-ocr.txt`,
      size: 2400 + Math.floor(Math.random() * 1200),
      mime: "text/plain",
      url: "",
      meta: {
        content: `OCR Transcription — Page ${i + 1}: ${name}\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.`,
      },
      children: [],
    },
    {
      id: `page-${i + 1}-summary`,
      name: `page-${i + 1}-summary.md`,
      size: 1800 + Math.floor(Math.random() * 800),
      mime: "text/markdown",
      url: "",
      meta: {
        content: `# Page ${i + 1}: ${name}\n\n## Summary\n\nThis page covers **${name.toLowerCase()}** with key metrics and analysis.\n\n- Revenue: $1.2M\n- Growth: 15% YoY\n- Status: *On track*`,
      },
      children: [],
    },
  ],
}));

const mainFile = ref({
  id: "doc-1",
  name: "annual-report-2025.pdf",
  size: 4194304,
  mime: "application/pdf",
  url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  thumb: { url: "https://picsum.photos/seed/report-cover/200/275" },
  children: pageChildren,
});

const activeFile = ref(null);
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-sm text-text-muted">
      A 22-page PDF with image children for each page. Every page has text children: an OCR
      transcription (.txt) and a markdown summary (.md) that render as formatted text in preview
      mode. Page 1 (Cover) also has image crop sub-children for multi-level navigation. Click the
      "Pages" button to dive into children. Use the back arrow to return to the parent.
    </p>
    <div class="w-full h-[600px] border border-border rounded-lg overflow-hidden">
      <DanxFileViewer
        :file="mainFile"
        v-model:file-in-preview="activeFile"
        downloadable
        children-label="Pages"
      />
    </div>
  </div>
</template>
