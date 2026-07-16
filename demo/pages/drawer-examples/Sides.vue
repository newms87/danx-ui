<script setup lang="ts">
import { ref } from "vue";
import { DanxButton, DanxDrawer } from "danx-ui";

const open = ref(false);
const side = ref("right");

function show(s) {
  side.value = s;
  open.value = true;
}
</script>

<template>
  <DanxButton variant="info" @click="show('left')">Left</DanxButton>
  <DanxButton variant="info" @click="show('right')">Right</DanxButton>
  <DanxButton variant="info" @click="show('top')">Top</DanxButton>
  <DanxButton variant="info" @click="show('bottom')">Bottom</DanxButton>

  <DanxDrawer v-model="open" :side="side" title="Drawer">
    <p>
      Sliding in from the <strong>{{ side }}</strong> edge.
    </p>
  </DanxDrawer>
</template>
