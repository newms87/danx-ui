<template>
  <DanxSplitPanel
    :panels="[
      { id: 'top', label: 'Top', defaultWidth: 40 },
      { id: 'bottom', label: 'Bottom', defaultWidth: 60 },
    ]"
    horizontal
    class="h-[300px] border border-border rounded-lg"
  >
    <template #top>
      <div class="p-4 bg-surface-sunken h-full">
        <h4 class="m-0 mb-2">Top Panel</h4>
        <p class="m-0 text-sm text-text-muted">
          Horizontal orientation stacks panels top-to-bottom.
        </p>
      </div>
    </template>
    <template #bottom>
      <div class="p-4 h-full">
        <h4 class="m-0 mb-2">Bottom Panel</h4>
        <p class="m-0 text-sm text-text-muted">
          Drag the handle vertically to resize.
        </p>
      </div>
    </template>
  </DanxSplitPanel>
</template>
