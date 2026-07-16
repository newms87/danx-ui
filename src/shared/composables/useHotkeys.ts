/**
 * useHotkeys - Register keyboard shortcuts with normalized key syntax
 *
 * Parses combo strings like "mod+s", "shift+enter", "escape" and binds a
 * keydown listener (on a target element or the document) that fires the
 * handler when the combo matches. "mod" resolves to Cmd on Mac and Ctrl
 * elsewhere. Listener registration is lazy (deferred to an isActive watch,
 * never touching `document` during setup) so the composable is SSR-safe,
 * and cleans up automatically on scope disposal.
 */
import { type MaybeRefOrGetter, onScopeDispose, toValue, watch } from "vue";

export interface ParsedHotkey {
  key: string;
  mod: boolean;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
}

export interface HotkeyOptions {
  /** Ref/getter to an element to scope the listener to. Defaults to the document. */
  target?: MaybeRefOrGetter<HTMLElement | null | undefined>;
  /** Ref/getter controlling whether the listener is active. Defaults to always active. */
  enabled?: MaybeRefOrGetter<boolean>;
  /** Call event.preventDefault() when the combo matches. Defaults to false. */
  preventDefault?: boolean;
}

const SHIFTED_KEYS: Record<string, string> = {
  ">": ".",
  "<": ",",
  "?": "/",
  "!": "1",
  "@": "2",
  "#": "3",
  $: "4",
  "%": "5",
  "^": "6",
  "&": "7",
  "*": "8",
  "(": "9",
  ")": "0",
  "{": "[",
  "}": "]",
};

/** Parse a key combination string (e.g. "mod+shift+s") into its components. */
export function parseHotkey(combo: string): ParsedHotkey {
  const parts = combo.toLowerCase().split("+");
  const result: ParsedHotkey = {
    key: "",
    mod: false,
    ctrl: false,
    shift: false,
    alt: false,
    meta: false,
  };

  for (const part of parts) {
    switch (part) {
      case "mod":
        result.mod = true;
        break;
      case "ctrl":
      case "control":
        result.ctrl = true;
        break;
      case "shift":
        result.shift = true;
        break;
      case "alt":
      case "option":
        result.alt = true;
        break;
      case "meta":
      case "cmd":
      case "command":
      case "win":
      case "windows":
        result.meta = true;
        break;
      default:
        result.key = part;
    }
  }

  return result;
}

function isMac(): boolean {
  return typeof navigator !== "undefined" && navigator.platform.toLowerCase().includes("mac");
}

/** Check whether a keyboard event's modifier keys match a parsed hotkey. */
export function matchesModifiers(event: KeyboardEvent, parsed: ParsedHotkey): boolean {
  const mac = isMac();

  const wantsCtrl = parsed.ctrl || (parsed.mod && !mac);
  const wantsMeta = parsed.meta || (parsed.mod && mac);

  const ctrlMatch = wantsCtrl ? event.ctrlKey : !event.ctrlKey;
  const metaMatch = wantsMeta ? event.metaKey : !event.metaKey;
  const shiftMatch = parsed.shift === event.shiftKey;
  const altMatch = parsed.alt === event.altKey;

  return ctrlMatch && metaMatch && shiftMatch && altMatch;
}

/** Check whether a keyboard event matches a parsed hotkey combination. */
export function matchesHotkey(event: KeyboardEvent, parsed: ParsedHotkey): boolean {
  let eventKey = event.key.toLowerCase();

  if (eventKey.startsWith("arrow")) {
    eventKey = eventKey.replace("arrow", "");
  }

  if (/^[0-9]$/.test(parsed.key)) {
    if (
      eventKey !== parsed.key &&
      event.code !== `Digit${parsed.key}` &&
      event.code !== `Numpad${parsed.key}`
    ) {
      return false;
    }
    return matchesModifiers(event, parsed);
  }

  if (SHIFTED_KEYS[parsed.key]) {
    if (eventKey === parsed.key) {
      return matchesModifiers(event, { ...parsed, shift: true });
    }
    if (event.shiftKey && eventKey === SHIFTED_KEYS[parsed.key]) {
      return matchesModifiers(event, { ...parsed, shift: true });
    }
  }

  if (SHIFTED_KEYS[eventKey] && SHIFTED_KEYS[eventKey] === parsed.key) {
    return matchesModifiers(event, { ...parsed, shift: true });
  }

  if (eventKey !== parsed.key) {
    return false;
  }

  return matchesModifiers(event, parsed);
}

/**
 * Register a keyboard shortcut. Accepts a single combo string or an array
 * of combos that all trigger the same handler.
 */
export function useHotkeys(
  combos: string | string[],
  handler: (event: KeyboardEvent) => void,
  options: HotkeyOptions = {}
): void {
  const parsed = (Array.isArray(combos) ? combos : [combos]).map(parseHotkey);
  const enabled = options.enabled ?? true;

  function onKeydown(event: KeyboardEvent): void {
    if (!parsed.some((combo) => matchesHotkey(event, combo))) return;
    if (options.preventDefault) event.preventDefault();
    handler(event);
  }

  let listening = false;
  let listeningTarget: HTMLElement | Document | null = null;

  function removeListener(): void {
    if (listening && listeningTarget) {
      listeningTarget.removeEventListener("keydown", onKeydown as EventListener);
    }
    listening = false;
    listeningTarget = null;
  }

  function addListener(): void {
    removeListener();
    const target: HTMLElement | Document | null | undefined = options.target
      ? toValue(options.target)
      : typeof document !== "undefined"
        ? document
        : null;
    if (!target) return;
    target.addEventListener("keydown", onKeydown as EventListener);
    listening = true;
    listeningTarget = target;
  }

  watch(
    [() => toValue(enabled), () => (options.target ? toValue(options.target) : true)],
    ([isEnabled]) => {
      if (isEnabled) {
        addListener();
      } else {
        removeListener();
      }
    },
    { immediate: true, flush: "sync" }
  );

  onScopeDispose(() => {
    removeListener();
  });
}
