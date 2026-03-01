<script setup>
import { ref } from "vue";
import { DanxFileUpload } from "danx-ui";

// Per-instance upload handler via uploadFn prop
function mockUpload(file) {
  return Promise.resolve({
    id: String(Date.now()),
    name: file.name,
    size: file.size,
    mime: file.type,
    url: "https://picsum.photos/200",
  });
}

var files = ref([]);
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxFileUpload
      v-model="files"
      multiple
      :max-files="5"
      :upload-fn="mockUpload"
      label="Attachments (max 5)"
      show-filename
      show-file-size
    />
    <p class="text-sm text-slate-500">{{ files.length }} file(s) uploaded</p>
  </div>
</template>
