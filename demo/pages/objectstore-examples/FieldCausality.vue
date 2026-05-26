<script setup lang="ts">
/**
 * FieldCausality - per-field, freshest-wins merge
 *
 * Simulates the classic stale-overwrite race: the user edits a field locally
 * while a request is in flight, then the request's (now-stale) response arrives
 * carrying the OLD value for that field. With per-field causality the user's
 * edit survives, while genuinely-newer fields from the response are still
 * applied. `__fieldTimestamps` carries the per-field clock (Unix ms).
 */
import { ref, storeObject } from "danx-ui";

const t0 = Date.now();

// Initial server state at t0.
const doc = ref(
  storeObject({
    __type: "Doc",
    id: 99,
    title: "Draft",
    status: "open",
    __timestamp: t0,
    __fieldTimestamps: { title: t0, status: t0 },
  })
);

const log = ref([]);

function userEditsTitle() {
  // Local edit stamps a NEWER per-field timestamp for `title`.
  const now = Date.now();
  storeObject({
    __type: "Doc",
    id: 99,
    title: "Draft (my edit)",
    __timestamp: now,
    __fieldTimestamps: { title: now },
  });
  log.value.unshift(`user edited title @ +${now - t0}ms → "${doc.value.title}"`);
}

function staleResponseArrives() {
  // A delayed response carrying the PRE-edit title (stamped at t0) plus a
  // genuinely newer status. title is rejected (older), status is applied.
  const newerStatus = Date.now();
  storeObject({
    __type: "Doc",
    id: 99,
    title: "Draft",
    status: "in-review",
    __timestamp: newerStatus,
    __fieldTimestamps: { title: t0, status: newerStatus },
  });
  log.value.unshift(
    `stale response → title kept "${doc.value.title}", status applied "${doc.value.status}"`
  );
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-sm text-foreground-muted">
      Click <strong>Edit title</strong> first, then <strong>Stale response</strong>. The edited
      title survives because its per-field timestamp is newer; the status still updates.
    </p>

    <div class="flex gap-3">
      <DanxButton @click="userEditsTitle"> 1. Edit title locally </DanxButton>
      <DanxButton variant="warning" @click="staleResponseArrives">
        2. Stale response arrives
      </DanxButton>
    </div>

    <pre class="p-3 rounded bg-surface-raised text-[0.8rem]">{{
      JSON.stringify({ title: doc.title, status: doc.status }, null, 2)
    }}</pre>

    <ul class="text-[0.8rem] font-mono flex flex-col gap-1">
      <li v-for="(line, i) in log" :key="i">{{ line }}</li>
    </ul>
  </div>
</template>
