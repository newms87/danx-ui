<script setup lang="ts">
import { ref } from "vue";
import { DanxFileViewer } from "danx-ui";

const mainFile = ref({
  id: "doc-1",
  name: "annual-report.pdf",
  size: 2097152,
  type: "application/pdf",
  url: "https://picsum.photos/seed/pdfmain/800/600",
  thumb: { url: "https://picsum.photos/seed/pdfmain/200/150" },
  children: [
    {
      id: "page-1",
      name: "Page 1 - Cover",
      size: 102400,
      type: "image/jpeg",
      url: "https://picsum.photos/seed/page1/800/600",
      thumb: { url: "https://picsum.photos/seed/page1/200/150" },
      children: [
        {
          id: "crop-1a",
          name: "Cover Logo (crop)",
          size: 51200,
          type: "image/png",
          url: "https://picsum.photos/seed/crop1a/400/400",
          thumb: { url: "https://picsum.photos/seed/crop1a/200/200" },
          children: [],
        },
        {
          id: "crop-1b",
          name: "Cover Title (crop)",
          size: 40960,
          type: "image/png",
          url: "https://picsum.photos/seed/crop1b/600/200",
          thumb: { url: "https://picsum.photos/seed/crop1b/200/67" },
          children: [],
        },
      ],
    },
    {
      id: "page-2",
      name: "Page 2 - Summary",
      size: 81920,
      type: "image/jpeg",
      url: "https://picsum.photos/seed/page2/800/600",
      thumb: { url: "https://picsum.photos/seed/page2/200/150" },
      children: [],
    },
    {
      id: "page-3",
      name: "Page 3 - Financials",
      size: 92160,
      type: "image/jpeg",
      url: "https://picsum.photos/seed/page3/800/600",
      thumb: { url: "https://picsum.photos/seed/page3/200/150" },
      children: [],
    },
  ],
});

const activeFile = ref(null);
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-sm text-text-muted">
      Click the children menu (pages icon) in the header to see child files. Select a child to
      navigate into it — breadcrumbs appear showing the ancestor chain. "Page 1" has sub-children
      for multi-level navigation.
    </p>
    <div class="w-full h-[500px] border border-border rounded-lg overflow-hidden">
      <DanxFileViewer :file="mainFile" v-model:file-in-preview="activeFile" downloadable />
    </div>
  </div>
</template>
