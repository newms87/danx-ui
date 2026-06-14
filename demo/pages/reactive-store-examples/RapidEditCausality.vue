<script setup lang="ts">
import { ref } from "vue";
import { storeObject } from "danx-ui";

const log = ref([]);
let run = 0;

function rapidEdits() {
  // Fresh identity per click so the demo is repeatable.
  run += 1;
  const id = "doc-" + run;
  const base = Date.now();

  // Baseline server state.
  storeObject({ id, __type: "DemoDoc", title: "v0", __timestamp: base });

  // The user types fast: two optimistic edits in quick succession.
  const doc = storeObject({ id, __type: "DemoDoc", title: "First edit", __timestamp: base + 10 });
  storeObject({ id, __type: "DemoDoc", title: "Second edit (latest)", __timestamp: base + 20 });
  const afterEdits = doc.title;

  // The FIRST request's response now arrives LATE, carrying the pre-second-edit
  // state. A wholesale merge would clobber the user's newer edit. The per-field
  // causality merge keeps it: the stale field is older, so it is skipped.
  storeObject({ id, __type: "DemoDoc", title: "First edit", __timestamp: base + 10 });

  log.value = [
    'After 2 rapid edits → "' + afterEdits + '"',
    'After the stale late response → "' + doc.title + '"',
  ];
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <DanxButton variant="warning" class="self-start" @click="rapidEdits">
      Simulate rapid edits + a stale late response
    </DanxButton>
    <ul v-if="log.length" class="text-sm font-mono flex flex-col gap-1">
      <li v-for="(line, i) in log" :key="i">{{ line }}</li>
    </ul>
    <p class="text-xs text-text-muted">
      The user's newer edit survives — the late response cannot overwrite it.
    </p>
  </div>
</template>
