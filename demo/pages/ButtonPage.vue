<script setup lang="ts">
/**
 * ButtonPage
 *
 * Demo page for DanxButton component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DocSection from "../components/DocSection.vue";

// Load markdown documentation as raw string
import buttonDocs from "../../docs/button.md?raw";

// Code examples for live-editable demos
const semanticTypesCode = `<template>
  <DanxButton icon="edit">Default</DanxButton>
  <DanxButton type="danger" icon="trash">Danger</DanxButton>
  <DanxButton type="success" icon="save">Success</DanxButton>
  <DanxButton type="warning" icon="pause">Warning</DanxButton>
  <DanxButton type="info" icon="view">Info</DanxButton>
  <DanxButton type="muted" icon="edit">Muted</DanxButton>
</template>

<script setup lang="ts">
import { DanxButton } from "danx-ui";
\x3c/script>`;

const allIconsCode = `<template>
  <DanxButton icon="trash" tooltip="trash" />
  <DanxButton icon="stop" tooltip="stop" />
  <DanxButton icon="close" tooltip="close" />
  <DanxButton icon="save" tooltip="save" />
  <DanxButton icon="create" tooltip="create" />
  <DanxButton icon="confirm" tooltip="confirm" />
  <DanxButton icon="check" tooltip="check" />
  <DanxButton icon="pause" tooltip="pause" />
  <DanxButton icon="clock" tooltip="clock" />
  <DanxButton icon="view" tooltip="view" />
  <DanxButton icon="document" tooltip="document" />
  <DanxButton icon="users" tooltip="users" />
  <DanxButton icon="database" tooltip="database" />
  <DanxButton icon="folder" tooltip="folder" />
  <DanxButton icon="cancel" tooltip="cancel" />
  <DanxButton icon="back" tooltip="back" />
  <DanxButton icon="edit" tooltip="edit" />
  <DanxButton icon="copy" tooltip="copy" />
  <DanxButton icon="refresh" tooltip="refresh" />
  <DanxButton icon="export" tooltip="export" />
  <DanxButton icon="import" tooltip="import" />
  <DanxButton icon="minus" tooltip="minus" />
  <DanxButton icon="merge" tooltip="merge" />
  <DanxButton icon="restart" tooltip="restart" />
  <DanxButton icon="play" tooltip="play" />
</template>

<script setup lang="ts">
import { DanxButton } from "danx-ui";
\x3c/script>`;

const textOnlyCode = `<template>
  <DanxButton>Default</DanxButton>
  <DanxButton type="danger">Danger</DanxButton>
  <DanxButton type="success">Success</DanxButton>
  <DanxButton type="warning">Warning</DanxButton>
  <DanxButton type="info">Info</DanxButton>
  <DanxButton type="muted">Muted</DanxButton>
</template>

<script setup lang="ts">
import { DanxButton } from "danx-ui";
\x3c/script>`;

const sizesCode = `<template>
  <DanxButton type="success" icon="save" size="xxs">XXS</DanxButton>
  <DanxButton type="success" icon="save" size="xs">XS</DanxButton>
  <DanxButton type="success" icon="save" size="sm">SM</DanxButton>
  <DanxButton type="success" icon="save" size="md">MD</DanxButton>
  <DanxButton type="success" icon="save" size="lg">LG</DanxButton>
</template>

<script setup lang="ts">
import { DanxButton } from "danx-ui";
\x3c/script>`;

const iconOnlyCode = `<template>
  <DanxButton type="danger" icon="trash" tooltip="Delete" />
  <DanxButton type="muted" icon="edit" tooltip="Edit" />
  <DanxButton type="info" icon="view" tooltip="View" />
  <DanxButton icon="copy" tooltip="Copy" />
  <DanxButton icon="refresh" tooltip="Refresh" />
</template>

<script setup lang="ts">
import { DanxButton } from "danx-ui";
\x3c/script>`;

const disabledCode = `<template>
  <DanxButton type="success" icon="save" disabled>Disabled</DanxButton>
  <DanxButton type="danger" icon="trash" disabled>Disabled</DanxButton>
  <DanxButton icon="edit" disabled>Disabled</DanxButton>
</template>

<script setup lang="ts">
import { DanxButton } from "danx-ui";
\x3c/script>`;

const loadingCode = `<template>
  <DanxButton type="success" icon="save" :loading="isLoading" @click="handleLoadingClick">
    {{ isLoading ? "Saving..." : "Save" }}
  </DanxButton>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { DanxButton } from "danx-ui";

const isLoading = ref(false);

async function handleLoadingClick() {
  isLoading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1500));
  isLoading.value = false;
}
\x3c/script>`;

const customIconCode = `<template>
  <DanxButton type="success">
    <template #icon>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </template>
    Star
  </DanxButton>
</template>

<script setup lang="ts">
import { DanxButton } from "danx-ui";
\x3c/script>`;

const danxIconCode = `<template>
  <DanxButton type="success" :icon="starIcon">Star</DanxButton>
  <DanxButton type="info" :icon="starIcon">Info Star</DanxButton>
  <DanxButton type="danger" :icon="starIcon">Danger Star</DanxButton>
</template>

<script setup lang="ts">
import { DanxButton } from "danx-ui";
import starIcon from "danx-icon/src/fontawesome/solid/star.svg?raw";
\x3c/script>`;
</script>

<template>
  <div class="button-page">
    <h1>Button</h1>
    <p class="button-page__description">
      A button component with semantic color types and built-in icons.
    </p>

    <h2>Live Examples</h2>

    <DemoSection
      title="Semantic Types"
      description="One button per type. Default (blank) has no background color."
      :code="semanticTypesCode"
    />

    <DemoSection
      title="All Icons"
      description='All 24 built-in icons by name. Just use icon="name" — no imports needed.'
      :code="allIconsCode"
    />

    <DemoSection
      title="Text-Only Buttons"
      description="Buttons without icons for each semantic type."
      :code="textOnlyCode"
    />

    <DemoSection title="Button Sizes" description="Buttons in all five sizes." :code="sizesCode" />

    <DemoSection
      title="Icon-Only Buttons"
      description="Buttons without text, using tooltips."
      :code="iconOnlyCode"
    />

    <DemoSection
      title="Loading State"
      description="Button shows spinner during async operations."
      :code="loadingCode"
    />

    <DemoSection
      title="Disabled State"
      description="Disabled buttons cannot be clicked."
      :code="disabledCode"
    />

    <DemoSection
      title="Custom Icon via Slot"
      description="Override the icon using the icon slot."
      :code="customIconCode"
    />

    <DemoSection
      title="External SVG Icon"
      description="Import an SVG as a raw string via ?raw and bind it to :icon. Icons inherit currentColor."
      :code="danxIconCode"
    />

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
</style>
