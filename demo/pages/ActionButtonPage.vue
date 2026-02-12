<script setup lang="ts">
/**
 * ActionButtonPage
 *
 * Demo page for DanxActionButton component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import actionButtonDocs from "../../docs/action-button.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicTriggerCode from "./action-button-examples/BasicTrigger.vue?raw";
import labelPropCode from "./action-button-examples/LabelProp.vue?raw";
import confirmationCode from "./action-button-examples/Confirmation.vue?raw";
import loadingStatesCode from "./action-button-examples/LoadingStates.vue?raw";
import eventCallbacksCode from "./action-button-examples/EventCallbacks.vue?raw";
</script>

<template>
  <DemoPage
    title="Action Button"
    description="A wrapper around DanxButton that integrates with the action system. Handles action triggering, loading states, confirmation dialogs, and event callbacks."
    :docs="actionButtonDocs"
  >
    <DemoSection
      title="Basic Action Trigger"
      description="Click to trigger an async action. The button shows a loading spinner while the action runs."
      :code="basicTriggerCode"
    />

    <DemoSection
      title="Label Prop"
      description="Use the label prop as an alternative to slot content."
      :code="labelPropCode"
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
  </DemoPage>
</template>
