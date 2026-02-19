<script setup lang="ts">
import { ref } from "vue";
import { DanxFile, DanxFileNavigator, DanxDialog, useDialog } from "danx-ui";

const dialog = useDialog();

const mainFile = ref({
  id: "1",
  name: "landscape.jpg",
  size: 524288,
  type: "image/jpeg",
  url: "https://picsum.photos/seed/dlg1/800/600",
  children: [],
});

const relatedFiles = ref([
  {
    id: "2",
    name: "portrait.jpg",
    size: 409600,
    type: "image/jpeg",
    url: "https://picsum.photos/seed/dlg2/800/600",
    children: [],
  },
]);
</script>

<template>
  <div style="width: 160px; height: 120px">
    <DanxFile :file="mainFile" @click="dialog.open()" />
  </div>

  <DanxDialog v-model="dialog.isOpen.value" :width="90" :height="90">
    <DanxFileNavigator
      :file="mainFile"
      :related-files="relatedFiles"
      downloadable
      closable
      @close="dialog.close()"
    />
  </DanxDialog>
</template>
