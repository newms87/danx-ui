<script setup lang="ts">
import { ref } from "vue";
import { DanxFileNavigator } from "danx-ui";

const file = ref({
  id: "1",
  name: "photo-with-exif.jpg",
  size: 3145728,
  type: "image/jpeg",
  url: "https://picsum.photos/seed/meta1/800/600",
  children: [],
  meta: {
    width: 4032,
    height: 3024,
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
    style="
      width: 100%;
      height: 500px;
      border: 1px solid var(--color-border);
      border-radius: 0.5rem;
      overflow: hidden;
    "
  >
    <DanxFileNavigator :file="file" downloadable />
  </div>
  <p style="margin-top: 0.5rem; color: var(--color-text-muted); font-size: 0.875rem">
    Click the info button in the header to toggle metadata panel.
  </p>
</template>
