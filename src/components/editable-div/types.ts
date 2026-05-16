/**
 * DanxEditableDiv Type Definitions
 */

/** Commit strategy for emitting `update:modelValue`. */
export type EditableDivCommit = "blur" | "debounce" | "manual";

/** Edit mode — single-line strips newlines, multi-line allows them. */
export type EditableDivMode = "single" | "multi";

/** Visual size affecting font-size and padding. */
export type EditableDivSize = "sm" | "md" | "lg";

/** Layout — inline shrinks to content, block stretches to container. */
export type EditableDivLayout = "inline" | "block";

/** HTML element tag rendered for the editable surface. */
export type EditableDivTag = "div" | "span" | "h1" | "h2" | "h3" | "p";

/** Custom synchronous validator. Return null = OK, string = error message. */
export type EditableDivValidator = (next: string) => string | null;

export interface DanxEditableDivProps {
  /** Two-way bound value. Plain text, NOT html. */
  modelValue: string;

  /** Disable edit; component renders inert text. */
  readonly?: boolean;

  /** Shown when modelValue is empty AND not focused. */
  placeholder?: string;

  /** "single" strips newlines + commits on Enter. "multi" allows newlines. Default "single". */
  mode?: EditableDivMode;

  /** Max length in characters. Validator emits "invalid" when exceeded. */
  maxLength?: number;

  /** Min length. Empty values rejected when set >= 1. */
  minLength?: number;

  /** Sync custom validator. Return null = OK, string = error message. */
  validate?: EditableDivValidator;

  /**
   * Commit strategy:
   *  - "blur"   (default): emit on blur + Enter (single) / Ctrl+Enter (multi)
   *  - "debounce": emit on every keystroke after `debounceMs` of quiet
   *  - "manual": never auto-emit — caller drives via exposed `commit()`
   */
  commit?: EditableDivCommit;

  /** Debounce delay when commit="debounce". Default 400. */
  debounceMs?: number;

  /** Show a spinner overlay (caller-controlled — set during PATCH). */
  saving?: boolean;

  /** Visual size. Default "md". */
  size?: EditableDivSize;

  /** Inline (default) vs block layout. Block stretches to container width. */
  layout?: EditableDivLayout;

  /** Element tag for the editable surface. Default "div". Useful for `h1`/`h2`. */
  as?: EditableDivTag;

  /** Extra class(es) merged onto the editable surface. */
  contentClass?: string | string[] | Record<string, boolean>;

  /** Test id for the editable surface. */
  dataTest?: string;
}

export interface DanxEditableDivEmits {
  /** Fires on commit (per the strategy). NOT on every keystroke unless commit="debounce". */
  (e: "update:modelValue", value: string): void;

  /** Edit committed AND value actually changed (no-op edits suppressed). */
  (e: "change", value: string): void;

  /** Edit cancelled via Escape — value reverted, NO update emitted. */
  (e: "cancel"): void;

  /** Validation failed — message is the validator return OR a built-in (length, required). */
  (e: "invalid", message: string): void;

  /** Focus passthrough. */
  (e: "focus"): void;

  /** Blur passthrough. */
  (e: "blur"): void;
}

export interface DanxEditableDivExpose {
  /** Programmatically focus the surface. selectAll defaults true. */
  focus(selectAll?: boolean): void;

  /** Force a commit with the current buffer (honors validate). */
  commit(): void;

  /** Cancel the in-flight edit, restore modelValue, blur. */
  cancel(): void;
}
