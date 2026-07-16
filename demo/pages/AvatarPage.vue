<script setup lang="ts">
/**
 * AvatarPage
 *
 * Demo page for DanxAvatar component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import avatarDocs from "../../docs/avatar.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicCode from "./avatar-examples/Basic.vue?raw";
import sizesCode from "./avatar-examples/Sizes.vue?raw";
import shapesAndFallbackCode from "./avatar-examples/ShapesAndFallback.vue?raw";
</script>

<template>
  <DemoPage
    title="Avatar"
    description="An image-with-initials-fallback component for rendering user/entity identity, backed by autoColor."
    :docs="avatarDocs"
  >
    <DemoSection
      title="Basic"
      description="Image mode, initials from name, and the empty (no name/src) state."
      :code="basicCode"
    />

    <DemoSection
      title="Sizes"
      description="Five size tokens (xs-xl) plus a numeric pixel size."
      :code="sizesCode"
    />

    <DemoSection
      title="Shapes & Fallback"
      description="Circle vs square shape, icon fallback, and automatic fallback on image load error."
      :code="shapesAndFallbackCode"
    />
  </DemoPage>
</template>
