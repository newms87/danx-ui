<script setup>
import { ref } from "vue";
import { DanxFileUpload } from "danx-ui";

// Phase 1: Upload progress 0-100% using the standard onProgress callback
function runUploadPhase(onProgress, onComplete, file, pct) {
  if (pct >= 100) {
    onProgress(100);
    setTimeout(onComplete, 300);
    return;
  }
  onProgress(Math.round(pct));
  setTimeout(
    function () {
      runUploadPhase(onProgress, onComplete, file, pct + 8 + Math.random() * 12);
    },
    150 + Math.random() * 200
  );
}

// Phase 2: Transcoding — updates the model directly (bypasses useFileUpload's onProgress
// because we need to set both progress AND statusMessage atomically)
function runTranscodePhase(filesRef, tempId, resolve, file, pct) {
  function updateTempFile(updates) {
    filesRef.value = filesRef.value.map(function (f) {
      if (f.id !== tempId) return f;
      return Object.assign({}, f, updates);
    });
  }

  if (pct >= 100) {
    // Transcoding done — resolve with final server file (thumb + optimized)
    resolve({
      id: String(Date.now()) + "-" + Math.random().toString(36).slice(2, 6),
      name: file.name,
      size: file.size,
      mime: file.type,
      url: "https://picsum.photos/seed/" + file.name + "/800/1100",
      thumb: { url: "https://picsum.photos/seed/" + file.name + "-thumb/200/280" },
      optimized: { url: "https://picsum.photos/seed/" + file.name + "-opt/400/560" },
    });
    return;
  }

  updateTempFile({
    progress: Math.round(pct),
    statusMessage: "Transcoding... " + Math.round(pct) + "%",
  });

  setTimeout(
    function () {
      runTranscodePhase(filesRef, tempId, resolve, file, pct + 5 + Math.random() * 10);
    },
    200 + Math.random() * 300
  );
}

function mockUpload(file, onProgress) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      runUploadPhase(
        onProgress,
        function () {
          // Upload done — find the temp file to get its ID for transcoding phase
          var tempFile = files.value.find(function (f) {
            return f.id.indexOf("__upload:") === 0 && f.name === file.name;
          });
          if (!tempFile) {
            resolve({
              id: String(Date.now()),
              name: file.name,
              size: file.size,
              mime: file.type,
              url: "https://picsum.photos/seed/" + file.name + "/800/1100",
            });
            return;
          }
          runTranscodePhase(files, tempFile.id, resolve, file, 0);
        },
        file,
        0
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
      :max-files="3"
      accept=".pdf,image/*"
      :upload-fn="mockUpload"
      label="Upload PDFs (upload + transcode)"
      helper-text="Files upload to 100%, then transcode from 0-100%. After completion, a thumbnail image appears."
      show-filename
      file-size="lg"
    />
    <p class="text-sm text-slate-500">{{ files.length }} file(s) processed</p>
  </div>
</template>
