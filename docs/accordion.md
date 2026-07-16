# Accordion Component

Collapsible content sections with a clickable header and an animated panel. Supports single-open (accordion-style, default) or multi-open modes, keyboard toggling, and correct `aria-expanded`/region semantics.

## Basic Usage

```vue
<template>
  <DanxAccordion v-model="openValue" :items="items">
    <template #panel="{ item }"> Content for {{ item.label }} </template>
  </DanxAccordion>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { DanxAccordion } from "danx-ui";
import type { AccordionItem } from "danx-ui";

const openValue = ref<string | null>(null);
const items: AccordionItem[] = [
  { value: "one", label: "Section One" },
  { value: "two", label: "Section Two" },
  { value: "three", label: "Section Three" },
];
</script>
```

## Multi-Open Mode

Set `multiple` to allow any number of items open at once. `v-model` then holds a `string[]` of open item values instead of a single value.

```vue
<template>
  <DanxAccordion v-model="openValues" :items="items" multiple>
    <template #panel="{ item }">Content for {{ item.label }}</template>
  </DanxAccordion>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { DanxAccordion } from "danx-ui";
import type { AccordionItem } from "danx-ui";

const openValues = ref<string[]>(["one"]);
const items: AccordionItem[] = [
  { value: "one", label: "Section One" },
  { value: "two", label: "Section Two" },
];
</script>
```

## Custom Header Content

Use the `header` scoped slot to replace the default `item.label` text — for example to add an icon or badge.

```vue
<template>
  <DanxAccordion v-model="openValue" :items="items">
    <template #header="{ item, isOpen }">
      <span :class="{ 'font-semibold': isOpen }">{{ item.label }}</span>
    </template>
    <template #panel="{ item }">Content for {{ item.label }}</template>
  </DanxAccordion>
</template>
```

## Disabled Items

Set `disabled` on an item to prevent it from being toggled. Disabled items keep their current open/closed state.

```ts
const items: AccordionItem[] = [
  { value: "one", label: "Section One" },
  { value: "two", label: "Section Two", disabled: true },
];
```

## Props

| Prop       | Type              | Default | Description                           |
| ---------- | ----------------- | ------- | ------------------------------------- |
| `items`    | `AccordionItem[]` | —       | Collapsible sections to render        |
| `multiple` | `boolean`         | `false` | Allow more than one item open at once |

### `AccordionItem`

| Field      | Type      | Description                                                  |
| ---------- | --------- | ------------------------------------------------------------ |
| `value`    | `string`  | Unique identifier, matched against `modelValue`              |
| `label`    | `string`  | Convenience header text, used when no `header` slot is given |
| `disabled` | `boolean` | Prevents toggling this item                                  |

## Model

`v-model` is `string | null` in single mode (the open item's value, or `null` if none open) and `string[]` in multiple mode (the open items' values).

## Slots

| Slot     | Scoped Props       | Description                                         |
| -------- | ------------------ | --------------------------------------------------- |
| `header` | `{ item, isOpen }` | Header content; falls back to `item.label`          |
| `panel`  | `{ item, isOpen }` | Panel content, rendered only while the item is open |

## Keyboard & Accessibility

- Each header is a native `<button>`, so `Enter`/`Space` toggle it like any button, and it's reachable via standard Tab order.
- `aria-expanded` on the header reflects open/closed state.
- `aria-controls` on the header points to the panel's `id`; the panel sets `aria-labelledby` back to the header and `role="region"`.
- Disabled items render a native `disabled` button, which is skipped in Tab order like any other disabled control.

## CollapseTransition

`DanxAccordion` panels animate open/closed using the shared `CollapseTransition` component — it measures the panel's natural content height and animates between `0` and that height, then settles to `auto` so dynamic content can resize without re-animating. `CollapseTransition` is exported separately and reusable for any other component needing an auto-height collapse animation:

```vue
<template>
  <button @click="open = !open">Toggle</button>
  <CollapseTransition>
    <div v-if="open">Content that animates open/closed</div>
  </CollapseTransition>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { CollapseTransition } from "danx-ui";

const open = ref(false);
</script>
```

`prefers-reduced-motion` is handled automatically — the library's global reduced-motion override neutralizes the CSS transition duration, so no separate reduced-motion logic is needed.

## CSS Tokens

| Token                               | Default                  | Description                          |
| ----------------------------------- | ------------------------ | ------------------------------------ |
| `--dx-accordion-border`             | `--color-border`         | Divider color between items          |
| `--dx-accordion-border-width`       | `1px`                    | Divider width between items          |
| `--dx-accordion-radius`             | `--radius-component`     | Corner radius of the outer container |
| `--dx-accordion-header-bg`          | `--color-surface`        | Header background                    |
| `--dx-accordion-header-bg-hover`    | `--color-surface-sunken` | Header background on hover           |
| `--dx-accordion-header-text`        | `--color-text`           | Header text color                    |
| `--dx-accordion-header-font-size`   | `--text-sm`              | Header font size                     |
| `--dx-accordion-header-font-weight` | `--font-medium`          | Header font weight                   |
| `--dx-accordion-header-padding-x`   | `1rem`                   | Header horizontal padding            |
| `--dx-accordion-header-padding-y`   | `0.75rem`                | Header vertical padding              |
| `--dx-accordion-panel-bg`           | `--color-surface`        | Panel background                     |
| `--dx-accordion-panel-text`         | `--color-text-muted`     | Panel text color                     |
| `--dx-accordion-panel-padding-x`    | `1rem`                   | Panel horizontal padding             |
| `--dx-accordion-panel-padding-y`    | `0.75rem`                | Panel vertical padding               |
| `--dx-accordion-chevron-size`       | `0.875rem`               | Chevron icon size                    |
| `--dx-accordion-chevron-color`      | `--color-text-muted`     | Chevron icon color                   |
| `--dx-accordion-focus-ring`         | `--color-interactive`    | Focus ring color on header           |
| `--dx-collapse-duration`            | `--duration-200`         | CollapseTransition duration          |
| `--dx-collapse-ease`                | `--ease-out`             | CollapseTransition easing            |
