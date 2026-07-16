# Hotkeys

`useHotkeys` registers keyboard shortcuts with a normalized combo syntax, cross-platform
modifier handling, and automatic listener cleanup. It's the shared building block behind
`useEscapeKey` and any future keybinding needs (e.g. a CommandPalette).

## Basic Usage

```ts
import { useHotkeys } from "danx-ui";

useHotkeys("mod+s", (event) => {
  event.preventDefault();
  save();
});
```

`mod` resolves to `Cmd` on macOS and `Ctrl` everywhere else.

## Combo Syntax

Combos are `+`-joined, case-insensitive strings: `"shift+enter"`, `"mod+k"`, `"escape"`.

| Token | Matches |
|---|---|
| `mod` | Cmd (mac) / Ctrl (other platforms) |
| `ctrl` / `control` | Ctrl key |
| `meta` / `cmd` / `command` / `win` / `windows` | Meta key |
| `shift` | Shift key |
| `alt` / `option` | Alt key |
| any other token | The base key (`s`, `enter`, `escape`, `up`, `1`, ...) |

Arrow keys can be written without the `Arrow` prefix (`up`, `down`, `left`, `right`).
Shifted symbol keys (`>`, `?`, `!`, etc.) are matched whether the combo names the
symbol or its unshifted base key plus `shift`.

## Multiple Combos

Pass an array to bind several combos to the same handler:

```ts
useHotkeys(["escape", "mod+w"], closePanel);
```

## Options

```ts
useHotkeys("mod+k", openCommandPalette, {
  target: panelRef, // scope to an element instead of the document
  enabled: isOpen, // ref/getter controlling whether the listener is active
  preventDefault: true, // call event.preventDefault() on match
});
```

| Option | Type | Default | Description |
|---|---|---|---|
| `target` | `MaybeRefOrGetter<HTMLElement \| null \| undefined>` | `document` | Element to bind the listener to instead of the document. |
| `enabled` | `MaybeRefOrGetter<boolean>` | `true` | Toggles the listener on/off reactively. |
| `preventDefault` | `boolean` | `false` | Calls `event.preventDefault()` when the combo matches. |

## SSR Safety & Cleanup

`useHotkeys` never touches `document` during setup — the listener is registered lazily
inside a `watch`, so it's safe to call during server-side rendering. The listener is
automatically removed when the owning effect scope is disposed (e.g. on component unmount).

## Escape Shortcut

`useEscapeKey` (used by `DanxPopover` and friends) is a thin wrapper:

```ts
useHotkeys("escape", callback, { enabled: isActive });
```
