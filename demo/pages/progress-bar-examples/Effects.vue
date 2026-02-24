<script setup lang="ts">
import { DanxProgressBar } from "danx-ui";
</script>

<template>
  <div class="flex flex-col gap-6 w-full">
    <div>
      <div class="text-xs text-text-muted mb-1">Striped</div>
      <DanxProgressBar :value="60" size="lg" striped />
    </div>
    <div>
      <div class="text-xs text-text-muted mb-1">Animated Stripes</div>
      <DanxProgressBar :value="60" size="lg" striped animateStripes />
    </div>
    <div>
      <div class="text-xs text-text-muted mb-1">Glow</div>
      <DanxProgressBar :value="60" variant="success" size="lg" glow />
    </div>
    <div>
      <div class="text-xs text-text-muted mb-1">Shimmer</div>
      <DanxProgressBar :value="75" size="lg" shimmer />
    </div>
    <div>
      <div class="text-xs text-text-muted mb-1">Gradient (default)</div>
      <DanxProgressBar :value="80" size="lg" gradient />
    </div>
    <div>
      <div class="text-xs text-text-muted mb-1">Gradient + Variant</div>
      <DanxProgressBar :value="75" variant="danger" size="lg" gradient />
    </div>
    <div>
      <div class="text-xs text-text-muted mb-1">Gradient + Striped</div>
      <DanxProgressBar :value="70" variant="success" size="lg" gradient striped />
    </div>
    <div>
      <div class="text-xs text-text-muted mb-1">Combined: Striped + Glow + Shimmer</div>
      <DanxProgressBar :value="70" variant="danger" size="lg" striped animateStripes glow shimmer />
    </div>
  </div>
</template>
