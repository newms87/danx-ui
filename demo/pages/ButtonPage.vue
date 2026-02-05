<script setup lang="ts">
/**
 * ButtonPage
 *
 * Demo page for DanxButton component with live examples and documentation.
 */
import { ref } from "vue";
import DemoSection from "../components/DemoSection.vue";
import DocSection from "../components/DocSection.vue";
import { DanxButton } from "../../src/components/button";
import type { ButtonType, ButtonSize } from "../../src/components/button";

// Load markdown documentation as raw string
import buttonDocs from "../../docs/button.md?raw";

// Destructive types
const destructiveTypes: ButtonType[] = ["trash", "stop", "close"];

// Constructive types
const constructiveTypes: ButtonType[] = ["save", "create", "confirm", "check"];

// Warning types
const warningTypes: ButtonType[] = ["pause", "clock"];

// Informational types
const informationalTypes: ButtonType[] = ["view", "document", "users", "database", "folder"];

// Neutral types
const neutralTypes: ButtonType[] = [
  "cancel",
  "back",
  "edit",
  "copy",
  "refresh",
  "export",
  "import",
  "minus",
  "merge",
  "restart",
  "play",
];

// All sizes
const sizes: ButtonSize[] = ["xxs", "xs", "sm", "md", "lg"];

// Loading state demo
const isLoading = ref(false);

async function handleLoadingClick() {
  isLoading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1500));
  isLoading.value = false;
}
</script>

<template>
  <div class="button-page">
    <h1>Button</h1>
    <p class="button-page__description">
      A semantic button component where the type determines both icon and color.
    </p>

    <h2>Live Examples</h2>

    <DemoSection
      title="Destructive Buttons"
      description="Danger-colored buttons for destructive actions."
    >
      <div class="button-grid">
        <DanxButton v-for="type in destructiveTypes" :key="type" :type="type">
          {{ type }}
        </DanxButton>
      </div>
    </DemoSection>

    <DemoSection
      title="Constructive Buttons"
      description="Success-colored buttons for constructive actions."
    >
      <div class="button-grid">
        <DanxButton v-for="type in constructiveTypes" :key="type" :type="type">
          {{ type }}
        </DanxButton>
      </div>
    </DemoSection>

    <DemoSection
      title="Warning Buttons"
      description="Warning-colored buttons for cautionary actions."
    >
      <div class="button-grid">
        <DanxButton v-for="type in warningTypes" :key="type" :type="type">
          {{ type }}
        </DanxButton>
      </div>
    </DemoSection>

    <DemoSection
      title="Informational Buttons"
      description="Interactive-colored buttons for informational actions."
    >
      <div class="button-grid">
        <DanxButton v-for="type in informationalTypes" :key="type" :type="type">
          {{ type }}
        </DanxButton>
      </div>
    </DemoSection>

    <DemoSection
      title="Neutral Buttons"
      description="Muted buttons for neutral or secondary actions."
    >
      <div class="button-grid">
        <DanxButton v-for="type in neutralTypes" :key="type" :type="type">
          {{ type }}
        </DanxButton>
      </div>
    </DemoSection>

    <DemoSection title="Button Sizes" description="Buttons in all five sizes.">
      <div class="button-grid button-grid--sizes">
        <DanxButton v-for="size in sizes" :key="size" type="save" :size="size">
          {{ size.toUpperCase() }}
        </DanxButton>
      </div>
    </DemoSection>

    <DemoSection title="Icon-Only Buttons" description="Buttons without text, using tooltips.">
      <div class="button-grid">
        <DanxButton type="trash" tooltip="Delete" />
        <DanxButton type="edit" tooltip="Edit" />
        <DanxButton type="view" tooltip="View" />
        <DanxButton type="copy" tooltip="Copy" />
        <DanxButton type="refresh" tooltip="Refresh" />
      </div>
    </DemoSection>

    <DemoSection title="Loading State" description="Button shows spinner during async operations.">
      <DanxButton type="save" :loading="isLoading" @click="handleLoadingClick">
        {{ isLoading ? "Saving..." : "Save" }}
      </DanxButton>
    </DemoSection>

    <DemoSection title="Disabled State" description="Disabled buttons cannot be clicked.">
      <div class="button-grid">
        <DanxButton type="save" disabled>Disabled</DanxButton>
        <DanxButton type="trash" disabled>Disabled</DanxButton>
        <DanxButton type="edit" disabled>Disabled</DanxButton>
      </div>
    </DemoSection>

    <DemoSection
      title="Custom Icon via Slot"
      description="Override the default icon using the icon slot."
    >
      <DanxButton type="save">
        <template #icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
        </template>
        Star
      </DanxButton>
    </DemoSection>

    <h2>Documentation</h2>
    <DocSection :content="buttonDocs" />
  </div>
</template>

<style scoped>
.button-page {
  max-width: 900px;
}

.button-page h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: var(--color-text);
}

.button-page h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 2rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
}

.button-page__description {
  color: var(--color-text-muted);
  margin: 0 0 2rem;
  font-size: 1.125rem;
  line-height: 1.6;
}

.button-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.button-grid--sizes {
  align-items: flex-end;
}
</style>
