<!--
/**
 * DanxKbd Component
 *
 * A generic, presentation-only keyboard-shortcut display primitive. Renders
 * one or more key names as styled key-cap badges (e.g. `<DanxKbd :keys="['ctrl','k']" />`).
 *
 * Standalone: does not depend on any hotkey/composable system - it only formats
 * and displays key labels.
 *
 * ## Features
 * - Renders one or more keys as `<kbd>` key-cap badges
 * - OS-aware modifier labels: Mac glyphs (⌘ ⌥ ⇧ ^) vs word labels (Ctrl, Alt, Shift, Win)
 * - Auto-detects platform via navigator.platform / navigator.userAgent, overridable via `os` prop
 * - Token-driven CSS (`--dx-kbd-*`) matching the markdown-editor hotkey key-cap look
 *
 * ## Props
 * | Prop      | Type       | Default | Description                                  |
 * |-----------|------------|---------|-----------------------------------------------|
 * | keys      | string[]   | -       | Key names to render, e.g. `['ctrl', 'k']`     |
 * | os        | "mac" \| "other" | auto-detected | Overrides OS-aware label mode  |
 * | separator | string     | "+"     | Separator rendered between combo key-caps     |
 *
 * ## CSS Tokens
 * | Token              | Default | Description       |
 * |--------------------|---------|-------------------|
 * | --dx-kbd-bg         | #f1f5f9 | Key-cap background |
 * | --dx-kbd-border     | #cbd5e1 | Key-cap border      |
 * | --dx-kbd-text       | #64748b | Key-cap text color  |
 *
 * ## Usage Examples
 *
 * Single key:
 *   <DanxKbd :keys="['esc']" />
 *
 * Combo:
 *   <DanxKbd :keys="['ctrl', 'k']" />
 *
 * Force platform:
 *   <DanxKbd :keys="['meta', 's']" os="mac" />
 */
-->

<script setup lang="ts">
import { computed } from "vue";
import { detectOs, resolveKeyLabel } from "./kbdKeyLabels";
import type { DanxKbdProps } from "./types";

const props = withDefaults(defineProps<DanxKbdProps>(), {
  os: undefined,
  separator: "+",
});

const activeOs = computed(() => props.os ?? detectOs());

const keyLabels = computed(() => props.keys.map((key) => resolveKeyLabel(key, activeOs.value)));
</script>

<template>
  <span class="danx-kbd">
    <template v-for="(label, index) in keyLabels" :key="`${label}-${index}`">
      <span v-if="index > 0" class="danx-kbd__separator">{{ separator }}</span>
      <kbd class="danx-kbd__key">{{ label }}</kbd>
    </template>
  </span>
</template>
