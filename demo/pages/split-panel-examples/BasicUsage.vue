<template>
  <DanxSplitPanel
    :panels="[
      { id: 'sidebar', label: 'Sidebar', defaultWidth: 30 },
      { id: 'content', label: 'Content', defaultWidth: 70 },
    ]"
    style="height: 200px; border: 1px solid var(--color-border); border-radius: 0.5rem"
  >
    <template #sidebar>
      <div style="padding: 1rem; background: var(--color-surface-sunken); height: 100%">
        <h4 style="margin: 0 0 0.5rem">Sidebar</h4>
        <p style="margin: 0; font-size: 0.875rem; color: var(--color-text-muted)">
          Drag the handle to resize panels.
        </p>
      </div>
    </template>
    <template #content>
      <div style="padding: 1rem; height: 100%">
        <h4 style="margin: 0 0 0.5rem">Content</h4>
        <p style="margin: 0; font-size: 0.875rem; color: var(--color-text-muted)">
          Main content area. Panels fill the available space proportionally.
        </p>
      </div>
    </template>
  </DanxSplitPanel>
</template>
