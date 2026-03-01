<script setup>
import { ref } from "vue";
import { DanxFileUpload, setFileUploadHandler } from "danx-ui";

// Set a global mock upload handler for the demo
setFileUploadHandler(function (file) {
  return Promise.resolve({
    id: String(Date.now()),
    name: file.name,
    size: file.size,
    mime: file.type,
    url: "https://picsum.photos/200",
  });
});

var files = ref([]);
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxFileUpload v-model="files" label="Avatar" accept="image/*" file-size="lg" />
    <p class="text-sm text-slate-500">
      Files:
      {{
        files.length
          ? files
              .map(function (f) {
                return f.name;
              })
              .join(", ")
          : "None"
      }}
    </p>
  </div>
</template>
