<script setup>
import { ref } from "vue";
import { DanxFileUpload } from "danx-ui";

// Recursive progress simulation
function simulateProgress(onProgress, resolve, file, pct) {
  if (pct >= 95) {
    onProgress(95);
    setTimeout(function () {
      onProgress(100);
      resolve({
        id: String(Date.now()) + "-" + Math.random().toString(36).slice(2, 6),
        name: file.name,
        size: file.size,
        mime: file.type,
        url: "https://picsum.photos/seed/" + Date.now() + "/400/400",
      });
    }, 200);
    return;
  }
  onProgress(Math.round(pct));
  setTimeout(
    function () {
      simulateProgress(onProgress, resolve, file, pct + 10 + Math.random() * 15);
    },
    150 + Math.random() * 200
  );
}

function mockUpload(file, onProgress) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      simulateProgress(onProgress, resolve, file, 0);
    }, 100);
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
