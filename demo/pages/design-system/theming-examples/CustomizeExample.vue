<template>
  <div
    class="customize-demo"
    style="
      --color-interactive: #7c3aed;
      --color-interactive-hover: #6d28d9;
      --color-interactive-active: #5b21b6;
      --color-interactive-subtle: #f5f3ff;
    "
  >
    <p class="mb-3 text-sm text-text-muted">
      All components inside this wrapper inherit purple interactive colors:
    </p>
    <div class="flex gap-2 flex-wrap">
      <DanxButton label="Primary" />
      <DanxButton label="Another" />
      <DanxBadge :count="5">
        <DanxButton label="With Badge" />
      </DanxBadge>
    </div>
  </div>
</template>
