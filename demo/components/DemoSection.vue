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
 *   default - Fallback content when no code prop is provided
 */
import { type Component, type Ref, ref, shallowRef, watch } from "vue";
import { DanxButton } from "../../src/components/button";
import { useLivePreview } from "../composables/useLivePreview";

const props = defineProps<{
  title: string;
  description?: string;
  code?: string;
}>();

const editableCode = ref(props.code ?? "");
const isCodeVisible = ref(false);

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
}
</script>

<template>
  <div class="demo-section">
    <h3 class="demo-section__title">{{ title }}</h3>
    <p v-if="description" class="demo-section__description">{{ description }}</p>

    <!-- Live preview mode (when code prop is provided) -->
    <template v-if="code !== undefined">
      <div class="demo-section__content">
        <component :is="liveComponent" v-if="liveComponent" />
      </div>

      <div class="demo-section__toolbar">
        <DanxButton size="sm" type="muted" @click="isCodeVisible = !isCodeVisible">
          {{ isCodeVisible ? "Hide Code" : "Show Code" }}
        </DanxButton>
        <DanxButton
          v-if="isCodeVisible && editableCode !== code"
          size="sm"
          type="info"
          @click="resetCode"
        >
          Reset
        </DanxButton>
      </div>

      <div v-if="isCodeVisible" class="demo-section__code-area">
        <textarea
          v-model="editableCode"
          class="demo-section__textarea"
          spellcheck="false"
          :rows="editableCode.split('\n').length + 1"
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

.demo-section__content {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
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

.demo-section__textarea {
  width: 100%;
  padding: 0.75rem;
  font-family: "Fira Code", "Cascadia Code", "JetBrains Mono", monospace;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--color-text);
  background: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  resize: vertical;
  tab-size: 2;
  box-sizing: border-box;
}

.demo-section__textarea:focus {
  outline: 2px solid var(--color-interactive);
  outline-offset: -1px;
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
