<script setup>
import { ref } from "vue";
import { usePasteFiles } from "danx-ui";

const images = ref([]);
const errors = ref([]);
const lastKind = ref("");

// accept also applies to the file synthesized from a large text paste, so a
// giant text paste falls through as text here instead of arriving as a .txt.
const { extractFiles } = usePasteFiles({
  accept: "image/*",
  largePasteThreshold: 200,
});

function onPaste(event) {
  const result = extractFiles(event);
  lastKind.value = result.kind;
  errors.value = result.rejected.map((rejection) => rejection.message);

  if (!result.handled) return;
  event.preventDefault();

  for (const file of result.files) {
    images.value.push({ name: file.name, url: URL.createObjectURL(file) });
  }
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <p class="text-xs text-text-muted">
      Only images are accepted. Paste a screenshot to attach it; paste a PDF or a long block of text
      and you get a rejection message while the normal paste still runs.
    </p>

    <div
      contenteditable="true"
      class="min-h-16 rounded border border-dashed border-gray-300 dark:border-gray-700 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-info"
      @paste="onPaste"
    />

    <p v-if="lastKind" class="text-xs text-text-muted">Last paste kind: {{ lastKind }}</p>

    <ul v-if="errors.length" class="list-disc pl-5 text-xs text-danger">
      <li v-for="(error, i) in errors" :key="i">{{ error }}</li>
    </ul>

    <div v-if="images.length" class="flex flex-wrap gap-2">
      <figure v-for="image in images" :key="image.url" class="w-24">
        <img :src="image.url" :alt="image.name" class="w-24 rounded object-cover" />
        <figcaption class="truncate text-xs text-text-muted">{{ image.name }}</figcaption>
      </figure>
    </div>
  </div>
</template>
