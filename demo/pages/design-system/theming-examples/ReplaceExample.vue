<template>
  <div
    class="replace-demo"
    class="bg-surface p-6 rounded-xl border border-border"
    style="
      --color-surface: #fef2f2;
      --color-surface-elevated: #ffffff;
      --color-text: #991b1b;
      --color-text-muted: #b91c1c;
      --color-border: #fecaca;
      --color-interactive: #dc2626;
      --color-interactive-hover: #b91c1c;
    "
  >
    <h4 class="mb-1 text-text text-base">Custom Red Theme</h4>
    <p class="mb-4 text-sm text-text-muted">A complete theme replacement using red brand colors.</p>
    <div class="flex gap-2">
      <DanxButton label="Brand Action" />
      <DanxButton label="Secondary" />
    </div>
  </div>
</template>
