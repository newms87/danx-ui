<template>
  <div
    class="replace-demo"
    style="
      --color-surface: #fef2f2;
      --color-surface-elevated: #ffffff;
      --color-text: #991b1b;
      --color-text-muted: #b91c1c;
      --color-border: #fecaca;
      --color-interactive: #dc2626;
      --color-interactive-hover: #b91c1c;
      background: var(--color-surface);
      padding: 1.5rem;
      border-radius: 0.75rem;
      border: 1px solid var(--color-border);
    "
  >
    <h4 style="margin: 0 0 0.25rem; color: var(--color-text); font-size: 1rem">Custom Red Theme</h4>
    <p style="margin: 0 0 1rem; font-size: 0.875rem; color: var(--color-text-muted)">
      A complete theme replacement using red brand colors.
    </p>
    <div style="display: flex; gap: 0.5rem">
      <DanxButton label="Brand Action" />
      <DanxButton label="Secondary" />
    </div>
  </div>
</template>
