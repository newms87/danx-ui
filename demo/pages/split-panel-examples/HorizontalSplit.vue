<template>
  <DanxSplitPanel
    :panels="[
      { id: 'top', label: 'Top', defaultWidth: 40 },
      { id: 'bottom', label: 'Bottom', defaultWidth: 60 },
    ]"
    horizontal
    style="height: 300px; border: 1px solid var(--color-border); border-radius: 0.5rem"
  >
    <template #top>
      <div style="padding: 1rem; background: var(--color-surface-sunken); height: 100%">
        <h4 style="margin: 0 0 0.5rem">Top Panel</h4>
        <p style="margin: 0; font-size: 0.875rem; color: var(--color-text-muted)">
          Horizontal orientation stacks panels top-to-bottom.
        </p>
      </div>
    </template>
    <template #bottom>
      <div style="padding: 1rem; height: 100%">
        <h4 style="margin: 0 0 0.5rem">Bottom Panel</h4>
        <p style="margin: 0; font-size: 0.875rem; color: var(--color-text-muted)">
          Drag the handle vertically to resize.
        </p>
      </div>
    </template>
  </DanxSplitPanel>
</template>
