<script setup lang="ts">
/**
 * DemoSection Component
 *
 * Wrapper for live demo examples with title and description.
 * When a `code` prop is provided, shows a live preview compiled from the template string
 * with a toggleable editable code area. Users can edit the code and see changes in real-time.
 * When no `code` prop is provided, renders the default slot as before.
 *
 * @props
 *   title: string - Section heading
 *   description?: string - Optional description below the heading
 *   code?: string - Optional Vue template string for live editable preview
 *
 * @slots
 *   hint - Optional callout block between description and content for token patterns/usage guidance.
 *          Provides styled treatment for <code> and <strong> elements.
 *   default - Fallback content when no code prop is provided
 */
import { type Component, type Ref, ref, shallowRef, watch } from "vue";
import { DanxButton } from "../../src/components/button";
import { CodeViewer } from "../../src/components/code-viewer";
import { useLivePreview } from "../composables/useLivePreview";

const props = defineProps<{
  title: string;
  description?: string;
  code?: string;
}>();

const editableCode = ref(props.code ?? "");
const isCodeVisible = ref(false);
const codeVersion = ref(0);

watch(
  () => props.code,
  (newCode) => {
    if (newCode !== undefined) {
      editableCode.value = newCode;
    }
  }
);

function useOptionalPreview(): {
  component: Ref<Component | null>;
  error: Ref<string | null>;
} {
  if (props.code !== undefined) {
    return useLivePreview(editableCode);
  }
  return { component: shallowRef(null), error: shallowRef(null) };
}

const { component: liveComponent, error: liveError } = useOptionalPreview();

function resetCode() {
  editableCode.value = props.code ?? "";
  codeVersion.value++;
}

function onCodeInput(event: Event) {
  editableCode.value = (event.target as HTMLElement).innerText;
}
</script>

<template>
  <div class="demo-section">
    <h3 class="demo-section__title">{{ title }}</h3>
    <p v-if="description" class="demo-section__description">{{ description }}</p>

    <div v-if="$slots.hint" class="demo-section__hint">
      <slot name="hint" />
    </div>

    <!-- Live preview mode (when code prop is provided) -->
    <template v-if="code !== undefined">
      <div class="demo-section__content">
        <component :is="liveComponent" v-if="liveComponent" />
      </div>

      <div class="demo-section__toolbar">
        <DanxButton size="sm" variant="muted" @click="isCodeVisible = !isCodeVisible">
          {{ isCodeVisible ? "Hide Code" : "Show Code" }}
        </DanxButton>
        <DanxButton
          v-if="isCodeVisible && editableCode !== code"
          size="sm"
          variant="info"
          @click="resetCode"
        >
          Reset
        </DanxButton>
      </div>

      <div v-if="isCodeVisible" class="demo-section__code-area">
        <CodeViewer
          :key="codeVersion"
          :model-value="editableCode"
          format="vue"
          :can-edit="true"
          :editable="true"
          @input="onCodeInput"
          @update:model-value="(val: unknown) => (editableCode = val as string)"
        />
        <div v-if="liveError" class="demo-section__error">
          {{ liveError }}
        </div>
      </div>
    </template>

    <!-- Slot-based mode (no code prop) -->
    <div v-else class="demo-section__content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.demo-section {
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: var(--color-surface-elevated);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.demo-section__title {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
}

.demo-section__description {
  margin: 0 0 1rem;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  line-height: 1.5;
}

.demo-section__hint {
  margin: 0 0 1rem;
  padding: 0.625rem 0.875rem;
  border-left: 3px solid var(--color-interactive);
  background: var(--color-surface-accent);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  line-height: 1.6;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.demo-section__content {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: start;
}

.demo-section__toolbar {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}

.demo-section__code-area {
  margin-top: 0.75rem;
}

.demo-section__error {
  margin-top: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-family: monospace;
  color: var(--color-destructive);
  background: rgb(239 68 68 / 0.1);
  border: 1px solid rgb(239 68 68 / 0.3);
  border-radius: var(--radius-md);
  white-space: pre-wrap;
}
</style>

<style>
/* Unscoped — targets slotted content inside .demo-section__hint */
.demo-section__hint .pattern {
  display: block;
  font-family: var(--font-mono);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-interactive);
  margin-bottom: 0.375rem;
  padding-bottom: 0.375rem;
  border-bottom: 1px solid var(--color-border-subtle);
}

.demo-section__hint code {
  font-family: var(--font-mono);
  font-size: inherit;
  font-weight: 600;
  padding: 0.1em 0.3em;
  background: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-accent);
}

.demo-section__hint strong {
  font-weight: 600;
  color: var(--color-text);
}
</style>
