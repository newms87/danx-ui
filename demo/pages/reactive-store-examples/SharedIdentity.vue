<script setup lang="ts">
import { ref } from "vue";
import { storeObject } from "danx-ui";

// Two independent "views" load the same record (same __type + id).
// storeObject returns the ONE shared reactive instance for that identity.
const viewA = ref(storeObject({ id: 1, __type: "DemoUser", name: "Ada Lovelace", __timestamp: 1 }));
const viewB = ref(storeObject({ id: 1, __type: "DemoUser", __timestamp: 2 }));

function renameFromElsewhere() {
  // Storing an update anywhere mutates the single shared instance, so BOTH
  // views re-render — no manual prop drilling or event bus needed.
  storeObject({ id: 1, __type: "DemoUser", name: "Grace Hopper", __timestamp: Date.now() });
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <p class="text-sm">
      Same identity → one shared instance:
      <b>{{ viewA === viewB }}</b>
    </p>
    <div class="flex gap-6">
      <div class="rounded border border-gray-300 dark:border-gray-700 p-3">
        <div class="text-xs text-text-muted">View A</div>
        <div class="font-medium">{{ viewA.name }}</div>
      </div>
      <div class="rounded border border-gray-300 dark:border-gray-700 p-3">
        <div class="text-xs text-text-muted">View B</div>
        <div class="font-medium">{{ viewB.name }}</div>
      </div>
    </div>
    <DanxButton variant="info" class="self-start" @click="renameFromElsewhere">
      Rename the record
    </DanxButton>
  </div>
</template>
