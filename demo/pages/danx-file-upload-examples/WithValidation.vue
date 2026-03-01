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
      accept="image/*,.pdf"
      :max-file-size="2097152"
      :upload-fn="mockUpload"
      label="Documents (images and PDFs only, max 2 MiB)"
      helper-text="Drag and drop files or click the + button"
      show-filename
    />
    <p class="text-sm text-slate-500">
      Try uploading a non-image/PDF file or a file larger than 2 MiB to see validation errors.
    </p>
  </div>
</template>
