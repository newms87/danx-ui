<script setup lang="ts">
import { DanxButton } from "danx-ui";
import starIcon from "danx-icon/src/fontawesome/solid/star.svg?raw";
</script>

<template>
  <DanxButton type="success" :icon="starIcon">Star</DanxButton>
  <DanxButton type="info" :icon="starIcon">Info Star</DanxButton>
  <DanxButton type="danger" :icon="starIcon">Danger Star</DanxButton>
</template>
