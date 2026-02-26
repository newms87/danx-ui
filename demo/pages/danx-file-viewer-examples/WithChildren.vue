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
  type: "image/jpeg",
  url: `https://picsum.photos/seed/report-p${i + 1}/800/1100`,
  thumb: { url: `https://picsum.photos/seed/report-p${i + 1}/200/275` },
  // Page 1 (Cover) has sub-children to demonstrate multi-level breadcrumbs
  children:
    i === 0
      ? [
          {
            id: "crop-logo",
            name: "Cover Logo (crop)",
            size: 51200,
            type: "image/png",
            url: "https://picsum.photos/seed/crop-logo/400/400",
            thumb: { url: "https://picsum.photos/seed/crop-logo/200/200" },
            children: [],
          },
          {
            id: "crop-title",
            name: "Cover Title (crop)",
            size: 40960,
            type: "image/png",
            url: "https://picsum.photos/seed/crop-title/600/200",
            thumb: { url: "https://picsum.photos/seed/crop-title/200/67" },
            children: [],
          },
        ]
      : [],
}));

const mainFile = ref({
  id: "doc-1",
  name: "annual-report-2025.pdf",
  size: 4194304,
  type: "application/pdf",
  url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  thumb: { url: "https://picsum.photos/seed/report-cover/200/275" },
  children: pageChildren,
});

const activeFile = ref(null);
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-sm text-text-muted">
      A 22-page PDF with image children for each page. Click the "Pages" button in the header to
      dive into the children carousel. Use the back arrow to return to the parent. Breadcrumbs below
      the header show the ancestor chain. "Page 1 - Cover" has sub-children (logo and title crops)
      for multi-level navigation.
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
