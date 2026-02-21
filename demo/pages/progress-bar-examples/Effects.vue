<script setup lang="ts">
import { DanxProgressBar } from "danx-ui";
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1.5rem; width: 100%">
    <div>
      <div style="font-size: 0.75rem; color: gray; margin-bottom: 0.25rem">Striped</div>
      <DanxProgressBar :value="60" size="lg" striped />
    </div>
    <div>
      <div style="font-size: 0.75rem; color: gray; margin-bottom: 0.25rem">Animated Stripes</div>
      <DanxProgressBar :value="60" size="lg" striped animateStripes />
    </div>
    <div>
      <div style="font-size: 0.75rem; color: gray; margin-bottom: 0.25rem">Glow</div>
      <DanxProgressBar :value="60" type="success" size="lg" glow />
    </div>
    <div>
      <div style="font-size: 0.75rem; color: gray; margin-bottom: 0.25rem">Shimmer</div>
      <DanxProgressBar :value="75" size="lg" shimmer />
    </div>
    <div>
      <div style="font-size: 0.75rem; color: gray; margin-bottom: 0.25rem">Gradient (default)</div>
      <DanxProgressBar :value="80" size="lg" gradient />
    </div>
    <div>
      <div style="font-size: 0.75rem; color: gray; margin-bottom: 0.25rem">Gradient + Type</div>
      <DanxProgressBar :value="75" type="danger" size="lg" gradient />
    </div>
    <div>
      <div style="font-size: 0.75rem; color: gray; margin-bottom: 0.25rem">Gradient + Striped</div>
      <DanxProgressBar :value="70" type="success" size="lg" gradient striped />
    </div>
    <div>
      <div style="font-size: 0.75rem; color: gray; margin-bottom: 0.25rem">
        Combined: Striped + Glow + Shimmer
      </div>
      <DanxProgressBar :value="70" type="danger" size="lg" striped animateStripes glow shimmer />
    </div>
  </div>
</template>
