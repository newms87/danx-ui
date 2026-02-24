<template>
  <DanxSplitPanel
    :panels="[
      { id: 'sidebar', label: 'Sidebar', defaultWidth: 30 },
      { id: 'content', label: 'Content', defaultWidth: 70 },
    ]"
    class="h-[200px] border border-border rounded-lg"
  >
    <template #sidebar>
      <div class="p-4 bg-surface-sunken h-full">
        <h4 class="m-0 mb-2">Sidebar</h4>
        <p class="m-0 text-sm text-text-muted">
          Drag the handle to resize panels.
        </p>
      </div>
    </template>
    <template #content>
      <div class="p-4 h-full">
        <h4 class="m-0 mb-2">Content</h4>
        <p class="m-0 text-sm text-text-muted">
          Main content area. Panels fill the available space proportionally.
        </p>
      </div>
    </template>
  </DanxSplitPanel>
</template>
