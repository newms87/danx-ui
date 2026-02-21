<template>
  <div class="tweak-demo" style="--dx-button-bg: #7c3aed; --dx-button-hover-bg: #6d28d9">
    <p style="margin: 0 0 0.75rem; font-size: 0.875rem; color: var(--color-text-muted)">
      The button below uses a purple <code>--dx-button-bg</code> override on its wrapper:
    </p>
    <DanxButton label="Tweaked Button" />
    <DanxButton
      label="Normal Button"
      style="
        --dx-button-bg: var(--color-interactive);
        --dx-button-hover-bg: var(--color-interactive-hover);
      "
    />
  </div>
</template>
