<script setup>
import { ref } from "vue";
import { DanxFileUpload, setFileUploadHandler } from "danx-ui";

// Simulate upload with progress over ~2 seconds
function simulateProgress(onProgress, resolve, file, pct) {
  if (pct >= 95) {
    onProgress(95);
    setTimeout(function () {
      onProgress(100);
      resolve({
        id: String(Date.now()),
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

function simulateUpload(file, onProgress) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      simulateProgress(onProgress, resolve, file, 0);
    }, 100);
  });
}

// Set as global handler so all instances in this demo use it
setFileUploadHandler(simulateUpload);

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
