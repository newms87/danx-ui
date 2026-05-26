<script setup lang="ts">
/**
 * StoreReactivity - storeObject identity + reactive merge
 *
 * Demonstrates that storeObject returns ONE canonical reactive instance per
 * `__type + id`. Storing the same logical entity again merges into that same
 * instance rather than creating a new one, so every reference stays live.
 */
import { ref, storeObject } from "danx-ui";

// Two separate references that resolve to the SAME stored instance.
const userA = ref(storeObject({ __type: "User", id: 1, name: "Ada", role: "admin" }));
const userB = ref(null);
const sameInstance = ref(null);
const log = ref([]);

function storeAgain() {
  // A second payload for the same id+type merges into the existing instance.
  userB.value = storeObject({ __type: "User", id: 1, role: "owner", __timestamp: Date.now() });
  sameInstance.value = userA.value === userB.value;
  log.value.unshift(
    `stored again → same instance: ${sameInstance.value}, role now "${userA.value.role}"`
  );
}

function renameViaB() {
  // Mutating through one reference is visible through every reference.
  if (userB.value) {
    userB.value.name = "Ada Lovelace";
    log.value.unshift(`renamed via userB → userA.name = "${userA.value.name}"`);
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex gap-3">
      <DanxButton @click="storeAgain"> Store same id again </DanxButton>
      <DanxButton variant="info" :disabled="!userB" @click="renameViaB">
        Rename via second ref
      </DanxButton>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <pre class="p-3 rounded bg-surface-raised text-[0.8rem] overflow-auto">
userA: {{ JSON.stringify({ id: userA.id, name: userA.name, role: userA.role }, null, 2) }}</pre
      >
      <pre class="p-3 rounded bg-surface-raised text-[0.8rem] overflow-auto">
userB: {{
          userB
            ? JSON.stringify({ id: userB.id, name: userB.name, role: userB.role }, null, 2)
            : "(not stored yet)"
        }}</pre
      >
    </div>

    <p v-if="sameInstance !== null" class="text-sm">
      <strong>userA === userB:</strong> {{ sameInstance }}
    </p>

    <ul class="text-[0.8rem] font-mono flex flex-col gap-1">
      <li v-for="(line, i) in log" :key="i">{{ line }}</li>
    </ul>
  </div>
</template>
