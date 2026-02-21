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
    <p style="margin: 0 0 0.75rem; font-size: 0.875rem; color: var(--color-text-muted)">
      All components inside this wrapper inherit purple interactive colors:
    </p>
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
      <DanxButton type="primary" label="Primary" />
      <DanxButton type="primary" label="Another" />
      <DanxBadge :count="5">
        <DanxButton label="With Badge" />
      </DanxBadge>
    </div>
  </div>
</template>
