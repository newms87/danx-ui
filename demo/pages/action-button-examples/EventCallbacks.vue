<script setup lang="ts">
import { ref, reactive } from "vue";
import { DanxActionButton } from "danx-ui";

const eventLog = ref([]);

const successAction = reactive({
  isApplying: false,
  name: "event-action",
  trigger: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { id: 1, status: "created" };
  },
});

const failAction = reactive({
  isApplying: false,
  name: "fail-action",
  trigger: async () => {
    await new Promise((_, reject) => setTimeout(() => reject(new Error("Network error")), 500));
  },
});

function onSuccess(response) {
  eventLog.value.push("success: " + JSON.stringify(response));
}
function onError(error) {
  eventLog.value.push("error: " + (error instanceof Error ? error.message : String(error)));
}
function onAlways() {
  eventLog.value.push("always: completed");
}
function clearLog() {
  eventLog.value = [];
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 0.75rem; width: 100%">
    <div style="display: flex; gap: 0.75rem; align-items: center">
      <DanxActionButton
        :action="successAction"
        type="success"
        icon="check"
        @success="onSuccess"
        @error="onError"
        @always="onAlways"
      >
        Succeed
      </DanxActionButton>
      <DanxActionButton
        :action="failAction"
        type="danger"
        icon="close"
        @success="onSuccess"
        @error="onError"
        @always="onAlways"
      >
        Fail
      </DanxActionButton>
      <button
        style="
          font-size: 0.75rem;
          color: gray;
          background: none;
          border: 1px solid #ddd;
          border-radius: 0.375rem;
          padding: 0.25rem 0.5rem;
          cursor: pointer;
        "
        @click="clearLog"
      >
        Clear Log
      </button>
    </div>
    <pre
      v-if="eventLog.length"
      style="
        margin: 0;
        padding: 0.75rem;
        font-size: 0.8125rem;
        font-family: monospace;
        background: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 0.375rem;
        white-space: pre-wrap;
      "
      >{{ eventLog.join("\n") }}</pre
    >
  </div>
</template>
