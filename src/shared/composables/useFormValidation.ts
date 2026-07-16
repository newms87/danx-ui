/**
 * useFormValidation - Declarative form validation composable
 *
 * Takes a reactive model plus a set of per-field validation rules and
 * produces reactive error state consumable by `DanxFieldWrapper` /
 * `useFormField` (just bind `errors[name]` to the field's `error` prop).
 *
 * Rules are plain functions `(value, model) => string | null | undefined`
 * (or a `Promise` of one, for async/remote validation such as uniqueness
 * checks). Built-in rule factories cover the common cases; `custom` wraps
 * an arbitrary validator, including cross-field checks that read `model`.
 *
 * @example
 *   const model = reactive({ email: "", password: "", confirm: "" });
 *   const { errors, isValid, validate, validateField } = useFormValidation(model, {
 *     email: [required(), email()],
 *     password: [required(), minLength(8)],
 *     confirm: [
 *       required(),
 *       custom((value, m) => (value !== m.password ? "Passwords must match" : null)),
 *     ],
 *   });
 *
 *   async function onSubmit() {
 *     if (await validate()) submitForm(model);
 *   }
 */

import { computed, reactive, watch, type ComputedRef } from "vue";

/** A single field validator. Returns an error message, or a falsy value when valid. */
export type ValidationRule<T = unknown> = (
  value: T,
  model: Record<string, unknown>
) => string | null | undefined | Promise<string | null | undefined>;

/** Per-field validation rule sets, keyed by field name. */
export type ValidationRules = Record<string, ValidationRule[]>;

export type ValidationTrigger = "submit" | "blur" | "input";

export interface UseFormValidationOptions {
  /**
   * When to auto-validate a field beyond an explicit `validate()`/`validateField()`
   * call. `"submit"` requires no wiring (it's just what `validate()` does).
   * `"input"` watches the model and re-validates a field whenever its value
   * changes. `"blur"` documents intent only — wire the field's `@blur` to call
   * `validateField(name)`. Defaults to `["submit"]`.
   */
  validateOn?: ValidationTrigger[];
}

export interface UseFormValidationReturn {
  /** Reactive per-field error messages. `null` means the field is currently valid. */
  errors: Record<string, string | null>;

  /** Whether any field has an async validator currently in flight. */
  isValidating: ComputedRef<boolean>;

  /** Whether every field with rules is currently free of errors. */
  isValid: ComputedRef<boolean>;

  /** Validates every field with rules. Resolves to the overall validity. */
  validate: () => Promise<boolean>;

  /** Validates a single field. Resolves to that field's validity. */
  validateField: (name: string) => Promise<boolean>;

  /** Clears all errors and pending state without touching the model. */
  reset: () => void;
}

export function useFormValidation(
  model: Record<string, unknown>,
  rules: ValidationRules,
  options: UseFormValidationOptions = {}
): UseFormValidationReturn {
  const fieldNames = Object.keys(rules);
  const validateOn = options.validateOn ?? ["submit"];

  const errors = reactive<Record<string, string | null>>(
    Object.fromEntries(fieldNames.map((name) => [name, null]))
  );

  const pending = reactive<Record<string, boolean>>(
    Object.fromEntries(fieldNames.map((name) => [name, false]))
  );

  const isValidating = computed(() => Object.values(pending).some(Boolean));

  const isValid = computed(() => Object.values(errors).every((error) => !error));

  async function runRules(name: string): Promise<string | null> {
    const fieldRules = rules[name] ?? [];
    for (const rule of fieldRules) {
      const result = rule(model[name], model);
      const resolved = result instanceof Promise ? await result : result;
      if (resolved) return resolved;
    }
    return null;
  }

  async function validateField(name: string): Promise<boolean> {
    pending[name] = true;
    try {
      const error = await runRules(name);
      errors[name] = error;
      return !error;
    } finally {
      pending[name] = false;
    }
  }

  async function validate(): Promise<boolean> {
    const results = await Promise.all(fieldNames.map((name) => validateField(name)));
    return results.every(Boolean);
  }

  function reset(): void {
    for (const name of fieldNames) {
      errors[name] = null;
      pending[name] = false;
    }
  }

  if (validateOn.includes("input")) {
    for (const name of fieldNames) {
      watch(
        () => model[name],
        () => {
          void validateField(name);
        }
      );
    }
  }

  return { errors, isValidating, isValid, validate, validateField, reset };
}

// ---------------------------------------------------------------------------
// Built-in rule factories
// ---------------------------------------------------------------------------

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}

export function required(message = "This field is required"): ValidationRule {
  return (value) =>
    isEmpty(value) || (Array.isArray(value) && value.length === 0) ? message : null;
}

export function min(limit: number, message = `Must be at least ${limit}`): ValidationRule {
  return (value) => {
    if (isEmpty(value)) return null;
    return Number(value) < limit ? message : null;
  };
}

export function max(limit: number, message = `Must be at most ${limit}`): ValidationRule {
  return (value) => {
    if (isEmpty(value)) return null;
    return Number(value) > limit ? message : null;
  };
}

export function minLength(
  limit: number,
  message = `Must be at least ${limit} characters`
): ValidationRule {
  return (value) => {
    if (isEmpty(value)) return null;
    return (value as string | unknown[]).length < limit ? message : null;
  };
}

export function maxLength(
  limit: number,
  message = `Must be at most ${limit} characters`
): ValidationRule {
  return (value) => {
    if (isEmpty(value)) return null;
    return (value as string | unknown[]).length > limit ? message : null;
  };
}

export function pattern(regex: RegExp, message = "Invalid format"): ValidationRule {
  return (value) => {
    if (isEmpty(value)) return null;
    return regex.test(value as string) ? null : message;
  };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function email(message = "Must be a valid email address"): ValidationRule {
  return pattern(EMAIL_PATTERN, message);
}

/** Wraps an arbitrary validator (including cross-field checks) as a named rule. */
export function custom<T = unknown>(validator: ValidationRule<T>): ValidationRule<T> {
  return validator;
}
