<script setup lang="ts">
import { ref } from "vue";
import { DanxButtonGroup } from "danx-ui";

const selected = ref(null);
const log = ref([]);

function onButtonClick(name) {
  log.value.push("onClick: " + name);
  if (log.value.length > 5) log.value.shift();
}

const buttons = [
  {
    value: "save",
    label: "Save",
    onClick: function () {
      onButtonClick("Save");
    },
  },
  {
    value: "delete",
    label: "Delete",
    onClick: function () {
      onButtonClick("Delete");
    },
  },
  {
    value: "archive",
    label: "Archive",
    onClick: function () {
      onButtonClick("Archive");
    },
  },
];
</script>

<template>
  <DanxButtonGroup
    v-model="selected"
    :buttons="buttons"
    @select="(v) => log.push('select: ' + v)"
    @deselect="(v) => log.push('deselect: ' + v)"
  />
  <div style="margin-top: 1rem; font-size: 0.875rem; color: var(--color-text-muted)">
    <p>Selected: {{ selected }}</p>
    <p v-for="(entry, i) in log" :key="i">{{ entry }}</p>
  </div>
</template>
