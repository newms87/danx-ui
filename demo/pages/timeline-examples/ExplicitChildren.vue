<script setup lang="ts">
import { DanxTimeline, DanxTimelineItem } from "danx-ui";
</script>

<template>
  <DanxTimeline>
    <DanxTimelineItem type="success" timestamp="2 minutes ago">
      Deployment <strong>succeeded</strong>
    </DanxTimelineItem>
    <DanxTimelineItem type="error" timestamp="15 minutes ago">
      Build failed: missing dependency
    </DanxTimelineItem>
    <DanxTimelineItem type="default" timestamp="1 hour ago">
      Commit pushed to main
    </DanxTimelineItem>
  </DanxTimeline>
</template>
