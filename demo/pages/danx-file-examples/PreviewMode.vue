<script setup lang="ts">
import { ref } from "vue";
import { DanxFile } from "danx-ui";

const imageFile = ref({
  id: "1",
  name: "landscape.jpg",
  size: 524288,
  mime: "image/jpeg",
  url: "https://picsum.photos/seed/preview1/800/600",
  thumb: { url: "https://picsum.photos/seed/preview1/200/150" },
});

const videoFile = ref({
  id: "2",
  name: "sample-video.mp4",
  size: 1048576,
  mime: "video/mp4",
  url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  thumb: { url: "https://picsum.photos/seed/preview2/200/150" },
});

const pdfFile = ref({
  id: "3",
  name: "document.pdf",
  size: 204800,
  mime: "application/pdf",
  url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
});
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- Side-by-side: thumb vs preview -->
    <div class="flex flex-col gap-2">
      <h4 class="text-sm font-semibold">Image: thumb vs preview</h4>
      <div class="flex gap-6 items-start">
        <div class="flex flex-col items-center gap-1">
          <DanxFile :file="imageFile" size="lg" />
          <span class="text-xs text-text-muted">thumb (default)</span>
        </div>
        <div class="flex flex-col items-center gap-1" style="width: 20rem; height: 15rem">
          <DanxFile :file="imageFile" mode="preview" size="auto" />
          <span class="text-xs text-text-muted">preview (contain)</span>
        </div>
      </div>
    </div>

    <!-- Video preview -->
    <div class="flex flex-col gap-2">
      <h4 class="text-sm font-semibold">Video: thumb vs preview</h4>
      <div class="flex gap-6 items-start">
        <div class="flex flex-col items-center gap-1">
          <DanxFile :file="videoFile" size="lg" />
          <span class="text-xs text-text-muted">thumb (play icon)</span>
        </div>
        <div class="flex flex-col items-center gap-1" style="width: 20rem; height: 15rem">
          <DanxFile :file="videoFile" mode="preview" size="auto" />
          <span class="text-xs text-text-muted">preview (video player)</span>
        </div>
      </div>
    </div>

    <!-- PDF preview -->
    <div class="flex flex-col gap-2">
      <h4 class="text-sm font-semibold">PDF: thumb vs preview</h4>
      <div class="flex gap-6 items-start">
        <div class="flex flex-col items-center gap-1">
          <DanxFile :file="pdfFile" size="lg" />
          <span class="text-xs text-text-muted">thumb (icon)</span>
        </div>
        <div class="flex flex-col items-center gap-1" style="width: 20rem; height: 20rem">
          <DanxFile :file="pdfFile" mode="preview" size="auto" />
          <span class="text-xs text-text-muted">preview (PDF embed)</span>
        </div>
      </div>
    </div>
  </div>
</template>
