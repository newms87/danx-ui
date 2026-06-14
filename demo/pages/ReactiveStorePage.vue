<script setup lang="ts">
/**
 * ReactiveStorePage
 *
 * Demo page for the reactive data layer: shared-identity object store and the
 * per-field rapid-edit causality merge.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

import reactiveStoreDocs from "../../docs/reactive-store.md?raw";

import sharedIdentityCode from "./reactive-store-examples/SharedIdentity.vue?raw";
import rapidEditCausalityCode from "./reactive-store-examples/RapidEditCausality.vue?raw";
</script>

<template>
  <DemoPage
    title="Reactive Store"
    description="Shared reactive object store with per-field, freshest-wins causality."
    :docs="reactiveStoreDocs"
  >
    <DemoSection
      title="Shared Identity"
      description="storeObject returns one shared reactive instance per identity, so independent views stay in sync."
      :code="sharedIdentityCode"
    />

    <DemoSection
      title="Rapid-Edit Causality"
      description="A late, stale response cannot overwrite a field the user edited after the request was sent."
      :code="rapidEditCausalityCode"
    />
  </DemoPage>
</template>
