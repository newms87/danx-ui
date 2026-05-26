<script setup lang="ts">
/**
 * ObjectStorePage
 *
 * Demo page for the reactive object store: identity-based caching and the
 * per-field causality merge that prevents stale responses from clobbering
 * recent local edits.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

import objectStoreDocs from "../../docs/object-store.md?raw";

import reactivityCode from "./objectstore-examples/StoreReactivity.vue?raw";
import causalityCode from "./objectstore-examples/FieldCausality.vue?raw";
</script>

<template>
  <DemoPage
    title="Object Store"
    description="Identity-based reactive caching with per-field causality merging."
    :docs="objectStoreDocs"
  >
    <DemoSection
      title="Identity & Reactivity"
      description="storeObject returns one canonical reactive instance per __type + id. Re-storing merges into the same instance, so every reference stays live."
      :code="reactivityCode"
    />

    <DemoSection
      title="Per-Field Causality"
      description="A field the user edited after a request was sent is not overwritten by that request's later (stale) response; genuinely-newer fields are still applied."
      :code="causalityCode"
    />
  </DemoPage>
</template>
