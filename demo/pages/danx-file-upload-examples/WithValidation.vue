<script setup>
import { ref } from "vue";
import { DanxFileUpload } from "danx-ui";

// Recursive progress simulation with optional failure
function simulateProgress(onProgress, resolve, reject, file, pct, shouldFail) {
  if (pct >= 95) {
    onProgress(95);
    setTimeout(function () {
      if (shouldFail) {
        reject(new Error("Server rejected: " + file.name));
        return;
      }
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
      simulateProgress(
        onProgress,
        resolve,
        reject,
        file,
        pct + 10 + Math.random() * 15,
        shouldFail
      );
    },
    150 + Math.random() * 200
  );
}

function mockUpload(file, onProgress) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      simulateProgress(
        onProgress,
        resolve,
        reject,
        file,
        0,
        file.name.toLowerCase().indexOf("fail") !== -1
      );
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
      accept="image/*,.pdf"
      :max-file-size="2097152"
      :upload-fn="mockUpload"
      label="Documents (images and PDFs only, max 2 MiB)"
      helper-text="Drag and drop files or click the + button"
      show-filename
    />
    <p class="text-sm text-slate-500">
      Try uploading a non-image/PDF file or a file larger than 2 MiB to see validation errors. Name
      a file with "fail" in it to trigger a server error (retry available).
    </p>
  </div>
</template>
