<script setup lang="ts">
/**
 * DialogPage
 *
 * Demo page for DanxDialog component with live examples and documentation.
 */
import { ref } from "vue";
import DemoSection from "../components/DemoSection.vue";
import DocSection from "../components/DocSection.vue";
import { DanxDialog, useDialog } from "../../src/components/dialog";

// Load markdown documentation as raw string
import dialogDocs from "../../docs/dialog.md?raw";

// Basic dialog state
const basicDialog = useDialog();

// Dialog with subtitle
const subtitleDialog = useDialog();

// Close button variations
const closeButtonBool = useDialog();
const closeButtonCustom = useDialog();

// Confirm dialog with loading
const confirmDialog = useDialog();
const isSaving = ref(false);

async function handleConfirm() {
  isSaving.value = true;
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 1500));
  isSaving.value = false;
  confirmDialog.close();
}

// Persistent dialog
const persistentDialog = useDialog();

// Custom sizing
const customSizeDialog = useDialog();

// Slot customization
const slotDialog = useDialog();
</script>

<template>
  <div class="dialog-page">
    <h1>Dialog</h1>
    <p class="dialog-page__description">
      A fully declarative dialog component built on the native &lt;dialog&gt; element.
    </p>

    <h2>Live Examples</h2>

    <DemoSection title="Basic Dialog" description="Simple dialog with title only.">
      <button class="demo-button" @click="basicDialog.open()">Open Basic Dialog</button>
      <DanxDialog v-model="basicDialog.isOpen.value" title="Basic Dialog">
        <p>This is a basic dialog with just a title.</p>
      </DanxDialog>
    </DemoSection>

    <DemoSection title="Dialog with Subtitle" description="Dialog with both title and subtitle.">
      <button class="demo-button" @click="subtitleDialog.open()">Open Dialog</button>
      <DanxDialog
        v-model="subtitleDialog.isOpen.value"
        title="Important Notice"
        subtitle="Please read carefully"
      >
        <p>This dialog has both a title and subtitle in the header.</p>
      </DanxDialog>
    </DemoSection>

    <DemoSection
      title="Close Button Variations"
      description="Close button with default and custom text."
    >
      <button class="demo-button" @click="closeButtonBool.open()">Default Close</button>
      <button class="demo-button" @click="closeButtonCustom.open()">Custom Close</button>

      <DanxDialog v-model="closeButtonBool.isOpen.value" title="Close Button" close-button>
        <p>This dialog has a close button with default "Close" text.</p>
      </DanxDialog>

      <DanxDialog
        v-model="closeButtonCustom.isOpen.value"
        title="Custom Close"
        close-button="Cancel"
      >
        <p>This dialog has a close button with custom "Cancel" text.</p>
      </DanxDialog>
    </DemoSection>

    <DemoSection
      title="Confirm Dialog with Loading"
      description="Dialog with confirm button that shows loading state."
    >
      <button class="demo-button" @click="confirmDialog.open()">Open Confirm Dialog</button>
      <DanxDialog
        v-model="confirmDialog.isOpen.value"
        title="Confirm Action"
        close-button="Cancel"
        confirm-button="Save Changes"
        :is-saving="isSaving"
        @confirm="handleConfirm"
      >
        <p>Click "Save Changes" to see the loading state.</p>
      </DanxDialog>
    </DemoSection>

    <DemoSection
      title="Persistent Mode"
      description="Dialog that can't be closed by ESC or backdrop click."
    >
      <button class="demo-button" @click="persistentDialog.open()">Open Persistent</button>
      <DanxDialog
        v-model="persistentDialog.isOpen.value"
        title="Persistent Dialog"
        subtitle="You must use the button to close"
        persistent
        close-button="I Understand"
      >
        <p>Try pressing ESC or clicking the backdrop - it won't close!</p>
        <p>Only the close button works.</p>
      </DanxDialog>
    </DemoSection>

    <DemoSection title="Custom Sizing" description="Dialog with explicit width and height.">
      <button class="demo-button" @click="customSizeDialog.open()">Open Sized Dialog</button>
      <DanxDialog
        v-model="customSizeDialog.isOpen.value"
        title="Custom Size"
        :width="60"
        :height="50"
        close-button
      >
        <p>This dialog is 60vw × 50vh.</p>
        <p>Numbers become viewport units (vw/vh).</p>
        <p>Strings like "400px" or "30rem" pass through unchanged.</p>
      </DanxDialog>
    </DemoSection>

    <DemoSection title="Slot Customization" description="Using slots for custom content.">
      <button class="demo-button" @click="slotDialog.open()">Open Custom Dialog</button>
      <DanxDialog v-model="slotDialog.isOpen.value">
        <template #title>
          <span style="color: #0077cc">🎨 Custom Title</span>
        </template>
        <template #subtitle>
          <em>Styled subtitle via slot</em>
        </template>
        <p>The title and subtitle are customized using named slots.</p>
        <template #actions>
          <button class="demo-button demo-button--secondary" @click="slotDialog.close()">
            Custom Close Button
          </button>
        </template>
      </DanxDialog>
    </DemoSection>

    <h2>Documentation</h2>
    <DocSection :content="dialogDocs" />
  </div>
</template>

<style scoped>
.dialog-page {
  max-width: 900px;
}

.dialog-page h1 {
  font-size: 2rem;
  margin: 0 0 0.5rem;
}

.dialog-page h2 {
  font-size: 1.5rem;
  margin: 2rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
}

:global(.dark) .dialog-page h2 {
  border-color: #0f3460;
}

.dialog-page__description {
  color: #666;
  margin: 0 0 2rem;
}

:global(.dark) .dialog-page__description {
  color: #aaa;
}

.demo-button {
  padding: 0.5rem 1rem;
  background: #0077cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.demo-button:hover {
  background: #005fa3;
}

.demo-button--secondary {
  background: #666;
}

.demo-button--secondary:hover {
  background: #555;
}
</style>
