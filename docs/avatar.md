# Avatar Component

An image-with-initials-fallback component for rendering user/entity identity.

## Features

- **Image Mode** - Renders an `<img>` when `src` is provided and loads successfully
- **Initials Fallback** - Derives up to two initials from `name` on a deterministic autoColor background
- **Icon Fallback** - Optional icon (or slot) fallback when no `name` is available
- **Runtime Error Handling** - Automatically switches to the fallback when the image fails to load
- **Five Sizes** - `xs`, `sm`, `md`, `lg`, `xl`, or a numeric pixel size
- **Circle / Square** - Two shapes
- **CSS Tokens** - Full customization via component tokens

## Basic Usage

```vue
<template>
  <DanxAvatar src="/user.jpg" name="Ada Lovelace" />
</template>

<script setup lang="ts">
import { DanxAvatar } from 'danx-ui';
</script>
```

## Props

| Prop  | Type                             | Default  | Description                            |
|-------|-----------------------------------|----------|-----------------------------------------|
| `src`   | `string`                        | -        | Image URL                               |
| `name`  | `string`                        | -        | Name for initials + autoColor hashing   |
| `size`  | `AvatarSize \| number`          | `"md"`   | `"xs" \| "sm" \| "md" \| "lg" \| "xl"` or a pixel number |
| `shape` | `AvatarShape`                   | `"circle"` | `"circle"` or `"square"`              |
| `icon`  | `Component \| IconName \| string` | -      | Icon fallback (used when there is no `name`) |
| `alt`   | `string`                        | `name`   | Image alt text override                 |

## Slots

| Slot       | Description                                   |
|------------|------------------------------------------------|
| `fallback` | Override the initials/icon fallback rendering entirely |

## Image with Fallback

When `src` is provided, `DanxAvatar` renders an `<img>`. If the image fails to load at runtime (the `error` event fires), it automatically switches to the initials/icon fallback — no `src` change required.

```vue
<DanxAvatar src="/user.jpg" name="Ada Lovelace" />
```

## Initials Fallback

Without `src` (or on image error), `DanxAvatar` derives up to two initials from `name` — the first letter of the first two words, uppercased — and renders them on a deterministic color background from [`autoColor`](./theming.md).

```vue
<DanxAvatar name="Ada Lovelace" />
<!-- renders "AL" -->

<DanxAvatar name="Madonna" />
<!-- renders "M" -->
```

## Icon Fallback

When there is no `name` to derive initials from, pass `icon` to show an icon instead:

```vue
<DanxAvatar icon="users" />
```

## Sizes

```vue
<DanxAvatar name="Ada Lovelace" size="xs" />
<DanxAvatar name="Ada Lovelace" size="sm" />
<DanxAvatar name="Ada Lovelace" size="md" />
<DanxAvatar name="Ada Lovelace" size="lg" />
<DanxAvatar name="Ada Lovelace" size="xl" />

<!-- Numeric pixel size -->
<DanxAvatar name="Ada Lovelace" :size="72" />
```

## Shape

```vue
<DanxAvatar name="Ada Lovelace" shape="circle" />
<DanxAvatar name="Ada Lovelace" shape="square" />
```

## Custom Fallback Slot

Override the fallback entirely via the `fallback` slot — useful for a custom placeholder graphic:

```vue
<DanxAvatar>
  <template #fallback>
    <MyCustomPlaceholder />
  </template>
</DanxAvatar>
```

## CSS Tokens

Global tokens:

| Token                      | Default        | Description                                            |
|----------------------------|-----------------|--------------------------------------------------------|
| `--dx-avatar-font-family`  | `--font-sans`   | Font family                                             |
| `--dx-avatar-font-weight`  | `--font-medium` | Fallback initials font weight                           |
| `--dx-avatar-border-radius`| `--radius-full` | Circle corner radius                                    |
| `--dx-avatar-square-radius`| `--radius-md`   | Square corner radius                                    |

Size tokens (for each size: `xs`, `sm`, `md`, `lg`, `xl`):

| Token                          | Description         |
|---------------------------------|----------------------|
| `--dx-avatar-{size}-size`       | Width and height     |
| `--dx-avatar-{size}-font-size`  | Initials font size   |
| `--dx-avatar-{size}-icon-size`  | Fallback icon size   |

See the [Theming Guide](./theming.md) for the full three-tier token system.
