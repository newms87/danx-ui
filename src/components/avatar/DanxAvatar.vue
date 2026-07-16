<!--
/**
 * DanxAvatar Component
 *
 * Renders an image for identity display, falling back to initials on a
 * deterministic autoColor background when there is no image, or the image
 * fails to load at runtime.
 *
 * ## Features
 * - Image mode when `src` is provided and loads successfully
 * - Initials fallback derived from `name`, on a deterministic autoColor background
 * - Icon fallback (via prop or slot) when there is no `name` to derive initials from
 * - Runtime image-load-error detection switches to the fallback automatically
 * - Five sizes (xs-xl) or a numeric pixel size
 * - Circle or square shape
 * - CSS token system for complete styling control
 * - Zero external dependencies
 *
 * ## Props
 * | Prop  | Type                         | Default   | Description                          |
 * |-------|------------------------------|-----------|---------------------------------------|
 * | src   | string                       | -         | Image URL                             |
 * | name  | string                       | -         | Name for initials + autoColor hashing |
 * | size  | AvatarSize \| number         | "md"      | Avatar size                           |
 * | shape | AvatarShape                  | "circle"  | Avatar shape                          |
 * | icon  | Component \| IconName \| string | -      | Icon fallback (no name available)     |
 * | alt   | string                       | name      | Image alt text override               |
 *
 * ## Slots
 * | Slot     | Description                              |
 * |----------|-------------------------------------------|
 * | fallback | Override the initials/icon fallback entirely |
 *
 * ## CSS Tokens
 * Global tokens:
 * | Token                      | Default                | Description       |
 * |----------------------------|-------------------------|-------------------|
 * | --dx-avatar-font-family    | --font-sans             | Font family        |
 * | --dx-avatar-font-weight    | --font-medium           | Fallback font weight |
 * | --dx-avatar-border-radius  | 9999px                  | Circle radius (square uses --dx-avatar-square-radius) |
 * | --dx-avatar-square-radius  | --radius-md              | Square corner radius |
 *
 * Size tokens (per size: xs, sm, md, lg, xl):
 * | Token                        | Description        |
 * |------------------------------|---------------------|
 * | --dx-avatar-{size}-size       | Width and height    |
 * | --dx-avatar-{size}-font-size  | Initials font size  |
 * | --dx-avatar-{size}-icon-size  | Fallback icon size  |
 *
 * ## Usage Examples
 *
 * Image with fallback:
 *   <DanxAvatar src="/user.jpg" name="Ada Lovelace" />
 *
 * Initials only:
 *   <DanxAvatar name="Ada Lovelace" />
 *
 * Icon fallback (no name):
 *   <DanxAvatar icon="user" />
 *
 * Square, large:
 *   <DanxAvatar name="Ada Lovelace" shape="square" size="lg" />
 *
 * Numeric size:
 *   <DanxAvatar name="Ada Lovelace" :size="56" />
 */
-->

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useAutoColor } from "../../shared/autoColor";
import { DanxIcon } from "../icon";
import { getInitials } from "./initials";
import type { DanxAvatarProps, DanxAvatarSlots } from "./types";

const props = withDefaults(defineProps<DanxAvatarProps>(), {
  shape: "circle",
  size: "md",
});

defineSlots<DanxAvatarSlots>();

const imageFailed = ref(false);

watch(
  () => props.src,
  () => {
    imageFailed.value = false;
  }
);

const showImage = computed(() => !!props.src && !imageFailed.value);

const initials = computed(() => getInitials(props.name));

const avatarClasses = computed(() => [
  "danx-avatar",
  `danx-avatar--${props.shape}`,
  typeof props.size === "string" ? `danx-avatar--${props.size}` : "",
]);

const avatarStyle = computed(() =>
  typeof props.size === "number"
    ? {
        "--dx-avatar-size": `${props.size}px`,
        "--dx-avatar-font-size": `${props.size * 0.4}px`,
        "--dx-avatar-icon-size": `${props.size * 0.5}px`,
      }
    : {}
);

const { style: autoColorStyle } = useAutoColor(
  computed(() => props.name ?? ""),
  "--dx-avatar"
);

const imageAlt = computed(() => props.alt ?? props.name ?? "");

function handleImageError() {
  imageFailed.value = true;
}
</script>

<template>
  <span :class="avatarClasses" :style="[avatarStyle, !showImage ? autoColorStyle : {}]">
    <img
      v-if="showImage"
      class="danx-avatar__image"
      :src="src"
      :alt="imageAlt"
      @error="handleImageError"
    />
    <span v-else class="danx-avatar__fallback">
      <slot name="fallback">
        <DanxIcon v-if="!initials && icon" :icon="icon" class="danx-avatar__icon" />
        <span v-else-if="initials" class="danx-avatar__initials">{{ initials }}</span>
      </slot>
    </span>
  </span>
</template>
