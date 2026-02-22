<script setup lang="ts">
import { DanxButton, DanxChip, DanxBadge, DanxProgressBar, DanxTooltip } from "danx-ui";
</script>

<template>
  <div class="variant-grid">
    <div class="variant-grid__header">
      <span />
      <span>Button</span>
      <span>Chip</span>
      <span>Badge</span>
      <span>Progress Bar</span>
      <span>Tooltip</span>
    </div>

    <div class="variant-grid__row">
      <span class="variant-grid__label">danger</span>
      <DanxButton variant="danger" icon="trash">Delete</DanxButton>
      <DanxChip variant="danger">Error</DanxChip>
      <DanxBadge variant="danger" :value="3"><DanxButton>Alerts</DanxButton></DanxBadge>
      <DanxProgressBar variant="danger" :value="65" />
      <DanxTooltip variant="danger" tooltip="Something went wrong" triggerIcon="info" />
    </div>

    <div class="variant-grid__row">
      <span class="variant-grid__label">success</span>
      <DanxButton variant="success" icon="save">Save</DanxButton>
      <DanxChip variant="success">Active</DanxChip>
      <DanxBadge variant="success" :value="1"><DanxButton>Done</DanxButton></DanxBadge>
      <DanxProgressBar variant="success" :value="100" />
      <DanxTooltip variant="success" tooltip="Operation succeeded" triggerIcon="info" />
    </div>

    <div class="variant-grid__row">
      <span class="variant-grid__label">warning</span>
      <DanxButton variant="warning" icon="pause">Pause</DanxButton>
      <DanxChip variant="warning">Pending</DanxChip>
      <DanxBadge variant="warning" :value="5"><DanxButton>Review</DanxButton></DanxBadge>
      <DanxProgressBar variant="warning" :value="40" />
      <DanxTooltip variant="warning" tooltip="Proceed with caution" triggerIcon="info" />
    </div>

    <div class="variant-grid__row">
      <span class="variant-grid__label">info</span>
      <DanxButton variant="info" icon="view">View</DanxButton>
      <DanxChip variant="info">New</DanxChip>
      <DanxBadge variant="info" :value="12"><DanxButton>Messages</DanxButton></DanxBadge>
      <DanxProgressBar variant="info" :value="80" />
      <DanxTooltip variant="info" tooltip="Additional details here" triggerIcon="info" />
    </div>

    <div class="variant-grid__row">
      <span class="variant-grid__label">muted</span>
      <DanxButton variant="muted" icon="edit">Edit</DanxButton>
      <DanxChip variant="muted">Archived</DanxChip>
      <DanxBadge variant="muted" :value="0"><DanxButton>Old</DanxButton></DanxBadge>
      <DanxProgressBar variant="muted" :value="20" />
      <DanxTooltip variant="muted" tooltip="Low priority item" triggerIcon="info" />
    </div>
  </div>
</template>

<style>
.variant-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;

  .variant-grid__header {
    display: grid;
    grid-template-columns: 5rem 1fr 1fr 1fr 1fr 1fr;
    gap: 1rem;
    align-items: center;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-subtle);
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--color-border);
  }

  .variant-grid__row {
    display: grid;
    grid-template-columns: 5rem 1fr 1fr 1fr 1fr 1fr;
    gap: 1rem;
    align-items: center;
  }

  .variant-grid__label {
    font-family: monospace;
    font-size: 0.875rem;
    color: var(--color-text-accent);
  }
}
</style>
