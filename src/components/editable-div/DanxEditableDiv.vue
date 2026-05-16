<!--
/**
 * DanxEditableDiv - Inline-edit primitive for plain-text fields
 *
 * A focusable contenteditable surface for editing a single plain-text value
 * in place. Drop-in replacement for bespoke click-to-edit patterns on title
 * rows, table cells, sidebar labels. Tabbing into the surface enters edit
 * mode directly — there is no hover-pencil or click-to-focus dance.
 *
 * Features:
 * - Three commit strategies: blur (default), debounce, manual
 * - Single-line strips newlines on paste + Enter commits
 * - Multi-line preserves newlines + Ctrl/Cmd+Enter commits
 * - Escape reverts the buffer + emits cancel
 * - Built-in length validation + custom sync validator
 * - External modelValue updates respected only when surface is NOT focused
 *   (so an SSE patch arriving mid-edit does NOT clobber the user's typing)
 * - Saving overlay queues commits until the caller's PATCH resolves
 * - Renders as any heading tag (h1/h2/h3) or div/span/p via `as` prop
 *
 * Imperative API (exposed for programmatic control — focus/commit/cancel):
 * - `focus(selectAll = true)` — focus surface, optionally select all text
 * - `commit()` — force commit current buffer (honors validate)
 * - `cancel()` — revert buffer, blur, emit cancel
 *
 * @props
 *   modelValue: string - Two-way bound value (plain text, NOT html)
 *   readonly?: boolean - Disable editing
 *   placeholder?: string - Shown when empty AND not focused
 *   mode?: "single" | "multi" - Newline handling (default "single")
 *   maxLength?: number - Character cap; over-cap emits "invalid"
 *   minLength?: number - Minimum length; values shorter emit "invalid"
 *   validate?: (next: string) => string | null - Custom sync validator
 *   commit?: "blur" | "debounce" | "manual" - Commit strategy (default "blur")
 *   debounceMs?: number - Debounce window when commit="debounce" (default 400)
 *   saving?: boolean - Render spinner overlay; queues commits until cleared
 *   size?: "sm" | "md" | "lg" - Visual size (default "md")
 *   layout?: "inline" | "block" - Container layout (default "inline")
 *   as?: "div" | "span" | "h1" | "h2" | "h3" | "p" - Surface tag (default "div")
 *   contentClass?: string | string[] | Record<string, boolean> - Extra classes on surface
 *   dataTest?: string - data-test attribute on the editable surface
 *
 * @emits
 *   update:modelValue - Fires on commit per the strategy
 *   change - Fires on commit AND value actually changed
 *   cancel - Fires on Escape; value reverted, NO update emitted
 *   invalid - Validation failed; message is the validator return OR a built-in
 *   focus - Surface received focus
 *   blur - Surface lost focus
 *
 * @tokens
 *   --dx-editable-div-bg              Resting background
 *   --dx-editable-div-bg-hover        Hover background tint
 *   --dx-editable-div-bg-focus        Focus background
 *   --dx-editable-div-text            Text color
 *   --dx-editable-div-placeholder     Placeholder color
 *   --dx-editable-div-ring-hover      Hover ring color
 *   --dx-editable-div-ring-focus      Focus ring color
 *   --dx-editable-div-ring-invalid    Invalid ring color
 *   --dx-editable-div-border-radius   Corner radius
 *   --dx-editable-div-transition      Transition timing
 *   --dx-editable-div-spinner-color   Spinner glyph color
 *   --dx-editable-div-{size}-font-size  Font size per size
 *   --dx-editable-div-{size}-padding    Padding per size
 *
 * @example
 *   Basic title-edit:
 *     <DanxEditableDiv v-model="issue.title" as="h2" size="lg" :min-length="1" />
 *
 *   Debounced autosave:
 *     <DanxEditableDiv v-model="note" commit="debounce" :debounce-ms="600" />
 *
 *   With saving spinner:
 *     <DanxEditableDiv v-model="title" :saving="patching" @update:model-value="patch" />
 */
-->

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import spinnerSvg from "danx-icon/src/fontawesome/solid/spinner.svg?raw";
import { DanxIcon } from "../icon";
import type { DanxEditableDivEmits, DanxEditableDivExpose, DanxEditableDivProps } from "./types";

const props = withDefaults(defineProps<DanxEditableDivProps>(), {
  readonly: false,
  placeholder: "",
  mode: "single",
  commit: "blur",
  debounceMs: 400,
  saving: false,
  size: "md",
  layout: "inline",
  as: "div",
});

const emit = defineEmits<DanxEditableDivEmits>();

const surfaceRef = ref<HTMLElement | null>(null);
const buffer = ref<string>(props.modelValue);
const focused = ref(false);
const errorMessage = ref<string | null>(null);
const pendingCommit = ref(false);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let cancelling = false;

const editable = computed(() => !props.readonly);

const isEmpty = computed(() => !focused.value && props.modelValue === "");

const wrapClasses = computed(() => [
  "danx-editable-div-wrap",
  { "danx-editable-div-wrap--block": props.layout === "block" },
]);

const surfaceClasses = computed(() => [
  "danx-editable-div",
  `danx-editable-div--${props.size}`,
  {
    "danx-editable-div--focused": focused.value,
    "danx-editable-div--readonly": props.readonly,
    "danx-editable-div--invalid": errorMessage.value !== null,
    "danx-editable-div--saving": props.saving,
  },
  props.contentClass,
]);

/** Mirror the buffer into the DOM surface (only when external sync, not user typing). */
function syncSurfaceText() {
  const el = surfaceRef.value as HTMLElement;
  if (el.textContent !== buffer.value) {
    el.textContent = buffer.value;
  }
}

/** Validate a candidate value. Returns error message or null. */
function runValidation(next: string): string | null {
  if ((props.minLength ?? 0) >= 1 && next.length === 0) {
    return "Value is required";
  }
  if (props.maxLength !== undefined && next.length > props.maxLength) {
    return `Maximum length is ${props.maxLength}`;
  }
  if (props.validate) {
    return props.validate(next);
  }
  return null;
}

function clearDebounce() {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

function emitCommit(next: string) {
  errorMessage.value = null;
  pendingCommit.value = false;
  const changed = next !== props.modelValue;
  emit("update:modelValue", next);
  if (changed) emit("change", next);
}

/** Force a commit using the current buffer. Honors validate + saving queue. */
function commit() {
  const next = buffer.value;
  const error = runValidation(next);
  if (error !== null) {
    errorMessage.value = error;
    emit("invalid", error);
    return;
  }
  if (props.saving) {
    pendingCommit.value = true;
    errorMessage.value = null;
    return;
  }
  emitCommit(next);
}

/** Revert buffer to modelValue, blur, emit cancel. */
function cancel() {
  buffer.value = props.modelValue;
  errorMessage.value = null;
  pendingCommit.value = false;
  clearDebounce();
  syncSurfaceText();
  emit("cancel");
  cancelling = true;
  surfaceRef.value?.blur();
  cancelling = false;
}

/** Programmatically focus the surface and optionally select all text. */
function focus(selectAll = true) {
  const el = surfaceRef.value as HTMLElement;
  el.focus();
  if (selectAll && el.textContent && el.textContent.length > 0) {
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }
}

function handleFocus() {
  focused.value = true;
  emit("focus");
}

function handleBlur() {
  focused.value = false;
  if (!cancelling && (props.commit === "blur" || props.commit === "debounce")) {
    clearDebounce();
    commit();
  }
  emit("blur");
  // Restore placeholder if buffer empty by re-syncing DOM
  nextTick(syncSurfaceText);
}

function handleInput(event: Event) {
  const target = event.target as HTMLElement;
  let text = target.textContent as string;
  if (props.mode === "single" && text.includes("\n")) {
    text = text.replace(/\n/g, "");
    target.textContent = text;
    // Move caret to end after sanitising
    const range = document.createRange();
    range.selectNodeContents(target);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }
  buffer.value = text;
  if (props.commit === "debounce") {
    clearDebounce();
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      commit();
    }, props.debounceMs);
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    event.preventDefault();
    cancel();
    return;
  }
  if (event.key === "Enter") {
    if (props.mode === "single") {
      event.preventDefault();
      clearDebounce();
      commit();
      surfaceRef.value?.blur();
      return;
    }
    if (props.mode === "multi" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      clearDebounce();
      commit();
      surfaceRef.value?.blur();
    }
  }
}

function handlePaste(event: ClipboardEvent) {
  if (props.mode !== "single") return;
  event.preventDefault();
  const text = (event.clipboardData?.getData("text") ?? "").replace(/[\r\n]+/g, " ");
  // Insert sanitised text at the caret. document.execCommand is deprecated but
  // remains the simplest way to insert text into a contenteditable while
  // preserving the undo stack across browsers.
  document.execCommand("insertText", false, text);
}

/** External modelValue change — apply only when not focused so we don't clobber typing. */
watch(
  () => props.modelValue,
  (next) => {
    if (focused.value) return;
    buffer.value = next;
    errorMessage.value = null;
    syncSurfaceText();
  }
);

/** When saving flips false, flush a queued commit. */
watch(
  () => props.saving,
  (saving) => {
    if (!saving && pendingCommit.value) {
      pendingCommit.value = false;
      commit();
    }
  }
);

onMounted(syncSurfaceText);

onBeforeUnmount(() => {
  clearDebounce();
});

defineExpose<DanxEditableDivExpose>({ focus, commit, cancel });
</script>

<template>
  <span :class="wrapClasses">
    <component
      :is="as"
      ref="surfaceRef"
      :class="surfaceClasses"
      :contenteditable="editable ? 'plaintext-only' : 'false'"
      :tabindex="readonly ? -1 : 0"
      :data-empty="isEmpty ? 'true' : 'false'"
      :data-placeholder="placeholder"
      :data-test="dataTest"
      role="textbox"
      :aria-multiline="mode === 'multi'"
      :aria-invalid="errorMessage !== null"
      :aria-readonly="readonly"
      :spellcheck="!readonly"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
      @paste="handlePaste"
    />
    <DanxIcon v-if="saving" :icon="spinnerSvg" class="danx-editable-div__spinner" />
  </span>
</template>
