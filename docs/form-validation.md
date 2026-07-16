# useFormValidation

Declarative validation composable. Takes a reactive model plus per-field rule
sets and produces reactive error state that pairs directly with
`DanxFieldWrapper` / `useFormField` — bind `errors.<field>` to the field's
`error` prop and validation just works.

## Installation

```vue
<script setup lang="ts">
import { useFormValidation, required, email } from "danx-ui";
</script>
```

## Basic Usage

```vue
<script setup lang="ts">
import { reactive } from "vue";
import { DanxInput, useFormValidation, required, email } from "danx-ui";

const model = reactive({ name: "", email: "" });

const { errors, isValid, validate } = useFormValidation(model, {
  name: [required()],
  email: [required(), email()],
});

async function onSubmit() {
  if (await validate()) {
    // submit model
  }
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <DanxInput v-model="model.name" label="Name" :error="errors.name" />
    <DanxInput v-model="model.email" label="Email" :error="errors.email" />
    <button type="submit" :disabled="!isValid">Submit</button>
  </form>
</template>
```

## Built-in Rules

Every rule is a factory that returns a `ValidationRule` — `(value, model) => string | null`
(or a `Promise` of one). Import the ones you need and combine them per field.

| Rule | Signature | Description |
|------|-----------|-------------|
| `required` | `required(message?)` | Fails on `null`, `undefined`, `""`, or an empty array. |
| `min` | `min(limit, message?)` | Fails when the numeric value is below `limit`. |
| `max` | `max(limit, message?)` | Fails when the numeric value is above `limit`. |
| `minLength` | `minLength(limit, message?)` | Fails when a string/array's `length` is below `limit`. |
| `maxLength` | `maxLength(limit, message?)` | Fails when a string/array's `length` is above `limit`. |
| `pattern` | `pattern(regex, message?)` | Fails when the string doesn't match `regex`. |
| `email` | `email(message?)` | Fails when the string isn't a valid email address. |
| `custom` | `custom(fn)` | Wraps an arbitrary validator — including cross-field checks that read `model`. |

`min`/`max`/`minLength`/`maxLength`/`pattern`/`email` all treat an empty value as
valid — pair them with `required()` when the field is mandatory.

```ts
const { errors } = useFormValidation(model, {
  password: [required(), minLength(8)],
  confirm: [
    required(),
    custom((value, m) => (value !== m.password ? "Passwords must match" : null)),
  ],
});
```

## Async Validators

Any rule may return a `Promise<string | null>` — useful for uniqueness checks
against a server. `isValidating` reflects whether any field currently has an
async validator in flight.

```ts
const { errors, isValidating, validateField } = useFormValidation(model, {
  username: [
    required(),
    async (value) => ((await checkUsernameTaken(value)) ? "Username is taken" : null),
  ],
});
```

## API

```ts
function useFormValidation(
  model: Record<string, unknown>,
  rules: Record<string, ValidationRule[]>,
  options?: { validateOn?: Array<"submit" | "blur" | "input"> }
): {
  errors: Record<string, string | null>;
  isValidating: ComputedRef<boolean>;
  isValid: ComputedRef<boolean>;
  validate: () => Promise<boolean>;
  validateField: (name: string) => Promise<boolean>;
  reset: () => void;
};
```

| Return value | Description |
|---|---|
| `errors` | Reactive per-field error messages. `null` means the field currently has no error. |
| `isValidating` | `true` while any field's async validator is in flight. |
| `isValid` | `true` when every field with rules is currently free of errors. |
| `validate()` | Runs every field's rules. Resolves to overall validity. Call this on submit. |
| `validateField(name)` | Runs a single field's rules. Resolves to that field's validity. |
| `reset()` | Clears all errors and pending state. Does not touch the model. |

### `validateOn` options

- `"submit"` (default) — no wiring needed; this is just what `validate()` does.
- `"input"` — the composable watches the model and re-validates a field the
  moment its value changes.
- `"blur"` — wire the field's `@blur` handler to call `validateField(name)`.

```ts
const { errors, validateField } = useFormValidation(
  model,
  { email: [required(), email()] },
  { validateOn: ["input"] }
);
```

```vue
<DanxInput v-model="model.email" :error="errors.email" @blur="validateField('email')" />
```
