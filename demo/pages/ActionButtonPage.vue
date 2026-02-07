<script setup lang="ts">
/**
 * ActionButtonPage
 *
 * Demo page for DanxActionButton component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DocSection from "../components/DocSection.vue";

// Load markdown documentation as raw string
import actionButtonDocs from "../../docs/action-button.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicTriggerCode from "./action-button-examples/BasicTrigger.vue?raw";
import confirmationCode from "./action-button-examples/Confirmation.vue?raw";
import loadingStatesCode from "./action-button-examples/LoadingStates.vue?raw";
import eventCallbacksCode from "./action-button-examples/EventCallbacks.vue?raw";
</script>

<template>
  <div class="action-button-page">
    <h1>Action Button</h1>
    <p class="action-button-page__description">
      A wrapper around DanxButton that integrates with the action system. Handles action triggering,
      loading states, confirmation dialogs, and event callbacks.
    </p>

    <h2>Live Examples</h2>

    <DemoSection
      title="Basic Action Trigger"
      description="Click to trigger an async action. The button shows a loading spinner while the action runs."
      :code="basicTriggerCode"
    />

    <DemoSection
      title="Confirmation Dialog"
      description="When confirm is set, a dialog appears before the action triggers. Custom confirmText overrides the default message."
      :code="confirmationCode"
    />

    <DemoSection
      title="Loading States"
      description="Three sources of loading state: the saving prop, action.isApplying, and target.isSaving."
      :code="loadingStatesCode"
    />

    <DemoSection
      title="Event Callbacks"
      description="Listen to success, error, and always events. Click each button and watch the log."
      :code="eventCallbacksCode"
    />

    <h2>Documentation</h2>
    <DocSection :content="actionButtonDocs" />
  </div>
</template>

<style scoped>
.action-button-page {
  max-width: 900px;
}

.action-button-page h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: var(--color-text);
}

.action-button-page h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 2rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
}

.action-button-page__description {
  color: var(--color-text-muted);
  margin: 0 0 2rem;
  font-size: 1.125rem;
  line-height: 1.6;
}
</style>
