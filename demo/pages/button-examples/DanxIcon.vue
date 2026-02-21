<script setup lang="ts">
import { DanxButton } from "danx-ui";
import starIcon from "danx-icon/src/fontawesome/solid/star.svg?raw";
</script>

<template>
  <DanxButton variant="success" :icon="starIcon">Star</DanxButton>
  <DanxButton variant="info" :icon="starIcon">Info Star</DanxButton>
  <DanxButton variant="danger" :icon="starIcon">Danger Star</DanxButton>
</template>
