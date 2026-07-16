# Password Strength

A rule-based password strength scorer, available both as a built-in `DanxInput` meter and as a
headless `passwordStrength()` function. No external dependency (e.g. zxcvbn) — scoring is based on
length, character-class variety, and penalties for common weak patterns.

## Built-in strength meter (DanxInput)

Set `showStrength` on a `DanxInput` with `type="password"` to render a segmented strength bar and
label below the field.

```vue
<template>
  <DanxInput v-model="password" type="password" label="Password" show-strength />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DanxInput } from 'danx-ui';

const password = ref('');
</script>
```

- Only takes effect when `type="password"`.
- Hidden while the field is empty.
- Updates reactively as the user types.
- The strength label is announced to assistive tech via an `aria-live="polite"` region.

## Headless usage

Import `passwordStrength` directly to compute strength without rendering the built-in UI — for
example, to gate a submit button.

```ts
import { passwordStrength } from 'danx-ui';

const result = passwordStrength('Tr0ub4dor&3');
// { score: 3, label: 'Good' }

const canSubmit = passwordStrength(password.value).score >= 2;
```

### `passwordStrength(value: string): PasswordStrengthResult`

| Field | Type | Description |
|-------|------|-------------|
| `score` | `0 \| 1 \| 2 \| 3 \| 4` | Strength score, weakest to strongest |
| `label` | `string` | Human-readable label for the score: `Weak`, `Weak`, `Fair`, `Good`, `Strong` |

### Scoring rules

Points are awarded for:

- Length ≥ 8 characters
- Length ≥ 12 characters
- 3 or more character classes present (lowercase, uppercase, digit, symbol)
- All 4 character classes present

Points are deducted for:

- Matching a common password (e.g. `password1`, `qwerty123`)
- A sequential run of 3+ characters (e.g. `abc`, `321`)
- A repeated run of 3+ identical characters (e.g. `aaaa`)

The result is clamped to the `0`-`4` range.

## Props

| Prop | Type | Default | Description |
|------|------|---------|--------------|
| `showStrength` | `boolean` | `false` | Renders the strength bar/label below the field. Only applies to `type="password"`. |
