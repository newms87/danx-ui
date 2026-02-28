<script setup lang="ts">
import { ref } from "vue";
import { DanxFileViewer } from "danx-ui";

const file = ref({
  id: "1",
  name: "photo-with-exif.jpg",
  size: 3145728,
  mime: "image/jpeg",
  url: "https://picsum.photos/seed/meta1/800/600",
  children: [],
  meta: {
    width: 4032,
    height: 3024,
    format: "JPEG",
    colorSpace: "sRGB",
  },
  exif: {
    camera: "Canon EOS R5",
    lens: "RF 24-70mm f/2.8L",
    iso: 400,
    aperture: "f/5.6",
    shutter: "1/250s",
    dateTaken: "2025-06-15T14:30:00Z",
  },
});
</script>

<template>
  <div
    class="w-full h-[500px] border border-border rounded-lg overflow-hidden"
  >
    <DanxFileViewer :file="file" downloadable />
  </div>
  <p class="mt-2 text-sm text-text-muted">
    Click the info button in the header to toggle the metadata/EXIF panel.
  </p>
</template>
