<script setup>
import { ref } from "vue";
import { usePasteFiles } from "danx-ui";

const MAX_BYTES = 500;

const accepted = ref([]);
const rejected = ref([]);

const { extractFiles } = usePasteFiles({
  largePasteThreshold: 100,
  maxFileSize: MAX_BYTES,
  nameLargePaste: (index, text) => "snippet-" + index + "-" + text.length + "chars.txt",
});

function onPaste(event) {
  const result = extractFiles(event);
  rejected.value = result.rejected.map((rejection) => rejection.message);

  if (!result.handled) return;
  event.preventDefault();
  accepted.value = accepted.value.concat(result.files);
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <p class="text-xs text-text-muted">
      Files must be at most {{ MAX_BYTES }} bytes, and converted text pastes get a custom name.
      Paste 100–500 characters to see a named snippet; paste more than {{ MAX_BYTES }} characters
      (or a screenshot) to see a size rejection.
    </p>

    <div
      contenteditable="true"
      class="min-h-16 rounded border border-dashed border-gray-300 dark:border-gray-700 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-info"
      @paste="onPaste"
    />

    <ul v-if="accepted.length" class="list-disc pl-5 text-xs">
      <li v-for="file in accepted" :key="file.name">{{ file.name }} — {{ file.size }} bytes</li>
    </ul>

    <ul v-if="rejected.length" class="list-disc pl-5 text-xs text-danger">
      <li v-for="(message, i) in rejected" :key="i">{{ message }}</li>
    </ul>
  </div>
</template>
