<script setup>
import { ref } from "vue";
import { usePasteFiles } from "danx-ui";

const THRESHOLD = 200;

const message = ref("");
const attachments = ref([]);
const undoableText = ref(null);

const { extractFiles } = usePasteFiles({ largePasteThreshold: THRESHOLD });

function onPaste(event) {
  const result = extractFiles(event);
  if (!result.handled) return;

  event.preventDefault();
  attachments.value.push(result.files[0]);
  undoableText.value = result.kind === "large-text" ? result.text : null;
}

function pasteAsTextInstead() {
  if (undoableText.value === null) return;
  message.value += undoableText.value;
  attachments.value.pop();
  undoableText.value = null;
}

function fill() {
  message.value = "Lorem ipsum dolor sit amet. ".repeat(12);
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <p class="text-xs text-text-muted">
      Threshold is {{ THRESHOLD }} characters. Paste anything longer and it becomes a
      <code>text/plain</code> file instead of message text. Use "Fill the box" then copy it to try
      it quickly.
    </p>

    <div class="flex gap-2">
      <button
        class="rounded border border-gray-300 dark:border-gray-700 px-2 py-1 text-xs"
        @click="fill"
      >
        Fill the box
      </button>
      <button
        v-if="undoableText !== null"
        class="rounded border border-gray-300 dark:border-gray-700 px-2 py-1 text-xs"
        @click="pasteAsTextInstead"
      >
        Paste as text instead
      </button>
    </div>

    <textarea
      v-model="message"
      rows="4"
      placeholder="Paste a long block of text here…"
      class="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent p-3 text-sm focus:outline-none focus:ring-2 focus:ring-info"
      @paste="onPaste"
    />

    <ul v-if="attachments.length" class="list-disc pl-5 text-xs">
      <li v-for="file in attachments" :key="file.name">
        {{ file.name }} — {{ file.type }} — {{ file.size }} bytes
      </li>
    </ul>
    <p v-else class="text-xs text-text-muted">No attachments yet.</p>
  </div>
</template>
