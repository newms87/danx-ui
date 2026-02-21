<!--
/**
 * DialogBreadcrumbs - Navigation breadcrumbs for stacked dialogs
 *
 * Renders a breadcrumb bar showing all dialogs in the navigation stack.
 * Each previous dialog is a clickable button; the active (topmost) dialog
 * is displayed as plain text. Clicking a breadcrumb navigates back to that
 * dialog by closing all dialogs above it.
 *
 * This component reads from useDialogStack() directly (no props needed).
 * It should only be rendered when stackSize > 1.
 *
 * @slots
 *   (none)
 *
 * @tokens
 *   --dx-dialog-breadcrumb-color           Inactive breadcrumb text color
 *   --dx-dialog-breadcrumb-active-color    Active (current) breadcrumb text color
 *   --dx-dialog-breadcrumb-hover-color     Hover state for clickable breadcrumbs
 *   --dx-dialog-breadcrumb-separator-color Separator character color
 *
 * @example
 *   Rendered automatically by DanxDialog when stacked.
 *   Not intended for direct usage.
 */
-->

<script setup lang="ts">
import { useDialogStack } from "./useDialogStack";

const { stack, navigateTo } = useDialogStack();
</script>

<template>
  <nav class="dialog-breadcrumbs" aria-label="Dialog navigation">
    <template v-for="(entry, index) in stack" :key="entry.id">
      <span v-if="index > 0" class="dialog-breadcrumbs__separator" aria-hidden="true">/</span>
      <button
        v-if="index < stack.length - 1"
        class="dialog-breadcrumbs__item"
        type="button"
        @click="navigateTo(entry.id)"
      >
        {{ entry.title() }}
      </button>
      <span
        v-else
        class="dialog-breadcrumbs__item dialog-breadcrumbs__item--active"
        aria-current="step"
      >
        {{ entry.title() }}
      </span>
    </template>
  </nav>
</template>
