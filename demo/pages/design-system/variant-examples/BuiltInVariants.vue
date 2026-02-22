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
      <DanxBadge variant="danger" :count="3"><DanxButton>Alerts</DanxButton></DanxBadge>
      <DanxProgressBar variant="danger" :percent="65" />
      <DanxTooltip variant="danger" tooltip="Something went wrong" position="right">
        <span class="hover-target">Hover me</span>
      </DanxTooltip>
    </div>

    <div class="variant-grid__row">
      <span class="variant-grid__label">success</span>
      <DanxButton variant="success" icon="save">Save</DanxButton>
      <DanxChip variant="success">Active</DanxChip>
      <DanxBadge variant="success" :count="1"><DanxButton>Done</DanxButton></DanxBadge>
      <DanxProgressBar variant="success" :percent="100" />
      <DanxTooltip variant="success" tooltip="Operation succeeded" position="right">
        <span class="hover-target">Hover me</span>
      </DanxTooltip>
    </div>

    <div class="variant-grid__row">
      <span class="variant-grid__label">warning</span>
      <DanxButton variant="warning" icon="pause">Pause</DanxButton>
      <DanxChip variant="warning">Pending</DanxChip>
      <DanxBadge variant="warning" :count="5"><DanxButton>Review</DanxButton></DanxBadge>
      <DanxProgressBar variant="warning" :percent="40" />
      <DanxTooltip variant="warning" tooltip="Proceed with caution" position="right">
        <span class="hover-target">Hover me</span>
      </DanxTooltip>
    </div>

    <div class="variant-grid__row">
      <span class="variant-grid__label">info</span>
      <DanxButton variant="info" icon="view">View</DanxButton>
      <DanxChip variant="info">New</DanxChip>
      <DanxBadge variant="info" :count="12"><DanxButton>Messages</DanxButton></DanxBadge>
      <DanxProgressBar variant="info" :percent="80" />
      <DanxTooltip variant="info" tooltip="Additional details here" position="right">
        <span class="hover-target">Hover me</span>
      </DanxTooltip>
    </div>

    <div class="variant-grid__row">
      <span class="variant-grid__label">muted</span>
      <DanxButton variant="muted" icon="edit">Edit</DanxButton>
      <DanxChip variant="muted">Archived</DanxChip>
      <DanxBadge variant="muted" :count="0"><DanxButton>Old</DanxButton></DanxBadge>
      <DanxProgressBar variant="muted" :percent="20" />
      <DanxTooltip variant="muted" tooltip="Low priority item" position="right">
        <span class="hover-target">Hover me</span>
      </DanxTooltip>
    </div>
  </div>
</template>

<style scoped>
.variant-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

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

.hover-target {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  cursor: help;
  text-decoration: underline dotted;
}
</style>
