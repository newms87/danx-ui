<!--
/**
 * DanxFileViewerHeader - Internal header sub-component for DanxFileViewer
 *
 * Renders the file name, navigation buttons (parent/children), slide counter,
 * metadata toggle, download button, and breadcrumb trail. Not exported publicly.
 *
 * @props
 *   fileName: string - Current file name for display
 *   hasParent: boolean - Whether parent navigation is available
 *   hasChildFiles: boolean - Whether children navigation is available
 *   childCount: number - Number of child files
 *   childrenLabel: string - Label for children button
 *   slideLabel: string - Slide counter text (e.g. "2 / 5")
 *   hasMetadata: boolean - Whether metadata info button should show
 *   infoCount: number - Badge count for metadata button
 *   downloadable: boolean - Whether download button should show
 *   breadcrumbs: Array<{ id: string; name: string }> - Breadcrumb entries
 *
 * @emits
 *   backFromChild - Navigate to parent
 *   diveIntoChildren - Navigate into children
 *   toggleMetadata - Toggle metadata panel
 *   download - Trigger download
 *   navigateToAncestor(id: string) - Navigate to a breadcrumb ancestor
 *
 * @slots
 *   header-actions - Extra buttons in the header bar
 */
-->

<script setup lang="ts">
import { DanxButton } from "../button";
import type { BreadcrumbEntry } from "./types";

defineProps<{
  fileName: string;
  hasParent: boolean;
  hasChildFiles: boolean;
  childCount: number;
  childrenLabel: string;
  slideLabel: string;
  hasMetadata: boolean;
  infoCount: number;
  downloadable: boolean;
  breadcrumbs: BreadcrumbEntry[];
}>();

const emit = defineEmits<{
  backFromChild: [];
  diveIntoChildren: [];
  toggleMetadata: [];
  download: [];
  navigateToAncestor: [id: string];
}>();

defineSlots<{
  "header-actions"(): unknown;
}>();
</script>

<template>
  <div class="danx-file-viewer__header">
    <!-- Navigation buttons (parent / children) -->
    <div v-if="hasParent || hasChildFiles" class="danx-file-viewer__nav-buttons">
      <DanxButton
        v-if="hasParent"
        variant="muted"
        size="sm"
        icon="back"
        tooltip="Go to parent"
        @click="emit('backFromChild')"
      />
      <DanxButton
        v-if="hasChildFiles"
        variant="info"
        size="sm"
        icon="list"
        :label="`${childCount} ${childrenLabel}`"
        @click="emit('diveIntoChildren')"
      />
    </div>

    <span class="danx-file-viewer__filename">{{ fileName }}</span>

    <span v-if="slideLabel" class="danx-file-viewer__counter">{{ slideLabel }}</span>

    <div class="danx-file-viewer__header-actions">
      <slot name="header-actions" />

      <DanxButton
        v-if="hasMetadata"
        variant="muted"
        size="sm"
        icon="info"
        tooltip="Metadata"
        @click="emit('toggleMetadata')"
      >
        <span v-if="infoCount > 0" class="danx-file-viewer__meta-badge">{{ infoCount }}</span>
      </DanxButton>

      <DanxButton
        v-if="downloadable"
        variant="muted"
        size="sm"
        icon="download"
        tooltip="Download"
        @click="emit('download')"
      />
    </div>
  </div>

  <!-- Breadcrumb navigation beneath header -->
  <nav v-if="hasParent" class="danx-file-viewer__breadcrumbs" aria-label="File navigation">
    <template v-for="(entry, index) in breadcrumbs" :key="entry.id">
      <span v-if="index > 0" class="danx-file-viewer__breadcrumb-separator">/</span>
      <span
        v-if="index === breadcrumbs.length - 1"
        class="danx-file-viewer__breadcrumb-item danx-file-viewer__breadcrumb-item--active"
        aria-current="step"
        >{{ entry.name }}</span
      >
      <button
        v-else
        class="danx-file-viewer__breadcrumb-item"
        @click="emit('navigateToAncestor', entry.id)"
      >
        {{ entry.name }}
      </button>
    </template>
  </nav>
</template>
