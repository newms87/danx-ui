<script setup>
import { ref } from "vue";
import { usePasteFiles, DEFAULT_LARGE_PASTE_THRESHOLD } from "danx-ui";

const message = ref("");
const result = ref(null);

const { extractFiles } = usePasteFiles();

function onPaste(event) {
  const outcome = extractFiles(event);
  result.value = outcome;

  // Only take over the paste when files were actually produced.
  if (outcome.handled) {
    event.preventDefault();
  }
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <p class="text-xs text-text-muted">
      Paste a screenshot (or any copied file) into the box. Plain text under
      {{ DEFAULT_LARGE_PASTE_THRESHOLD }} characters pastes normally.
    </p>

    <textarea
      v-model="message"
      rows="3"
      placeholder="Paste here…"
      class="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent p-3 text-sm focus:outline-none focus:ring-2 focus:ring-info"
      @paste="onPaste"
    />

    <div v-if="result" class="flex flex-col gap-1 text-sm">
      <p>
        <strong>kind:</strong> {{ result.kind }} &middot; <strong>handled:</strong>
        {{ result.handled }}
      </p>
      <ul v-if="result.files.length" class="list-disc pl-5 text-xs">
        <li v-for="file in result.files" :key="file.name">
          {{ file.name }} — {{ file.type || "unknown" }} — {{ file.size }} bytes
        </li>
      </ul>
      <p v-else class="text-xs text-text-muted">
        No files extracted — the browser's normal paste ran.
      </p>
    </div>
  </div>
</template>
