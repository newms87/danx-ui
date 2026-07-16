<script setup lang="ts">
import { DanxAvatar } from "danx-ui";
</script>

<template>
  <div class="flex items-center gap-3">
    <DanxAvatar name="Ada Lovelace" shape="circle" />
    <DanxAvatar name="Ada Lovelace" shape="square" />
    <DanxAvatar icon="users" />
    <DanxAvatar src="https://broken-image-url.invalid/none.jpg" name="Ada Lovelace" />
  </div>
</template>
