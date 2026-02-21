<script setup lang="ts">
import { DanxProgressBar } from "danx-ui";
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1.5rem; width: 100%">
    <div>
      <div style="font-size: 0.75rem; color: gray; margin-bottom: 0.25rem">Inside (default)</div>
      <DanxProgressBar :value="65" size="lg" textPosition="inside" />
    </div>
    <div>
      <div style="font-size: 0.75rem; color: gray; margin-bottom: 0.25rem">Above</div>
      <DanxProgressBar :value="65" textPosition="above" />
    </div>
    <div>
      <div style="font-size: 0.75rem; color: gray; margin-bottom: 0.25rem">Beside</div>
      <DanxProgressBar :value="65" textPosition="beside" />
    </div>
    <div>
      <div style="font-size: 0.75rem; color: gray; margin-bottom: 0.25rem">Custom label</div>
      <DanxProgressBar :value="3" :max="10" label="3 of 10 files" size="lg" />
    </div>
  </div>
</template>
