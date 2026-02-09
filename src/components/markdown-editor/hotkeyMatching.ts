/**
 * Hotkey Matching
 *
 * Pure functions for parsing key combination strings and matching
 * them against keyboard events. Handles cross-platform modifier
 * differences (Ctrl on Windows/Linux, Cmd on Mac).
 */

/** Parsed key combination for matching */
export interface ParsedKey {
  key: string;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
}

/**
 * Parse a key combination string into its components.
 * Supports: ctrl, shift, alt, meta/cmd
 */
export function parseKeyCombo(combo: string): ParsedKey {
  const parts = combo.toLowerCase().split("+");
  const result: ParsedKey = {
    key: "",
    ctrl: false,
    shift: false,
    alt: false,
    meta: false,
  };

  for (const part of parts) {
    switch (part) {
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

/** Shifted key mappings for matching shifted characters */
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

/**
 * Check if modifier keys match.
 * On Mac, treats Cmd (metaKey) as equivalent to Ctrl.
 */
export function matchesModifiers(event: KeyboardEvent, parsed: ParsedKey): boolean {
  const isMac = navigator.platform.toLowerCase().includes("mac");

  let ctrlMatch: boolean;
  if (parsed.ctrl) {
    if (isMac) {
      ctrlMatch = event.ctrlKey || event.metaKey;
    } else {
      ctrlMatch = event.ctrlKey;
    }
  } else if (parsed.meta) {
    ctrlMatch = event.metaKey;
  } else {
    ctrlMatch = !event.ctrlKey && !event.metaKey;
  }

  const shiftMatch = parsed.shift === event.shiftKey;
  const altMatch = parsed.alt === event.altKey;

  return ctrlMatch && shiftMatch && altMatch;
}

/**
 * Check if a keyboard event matches a parsed key combination.
 * Handles shifted keys, number keys, and cross-platform modifiers.
 */
export function matchesKeyCombo(event: KeyboardEvent, parsed: ParsedKey): boolean {
  let eventKey = event.key.toLowerCase();

  if (eventKey.startsWith("arrow")) {
    eventKey = eventKey.replace("arrow", "");
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
    return matchesModifiers(event, parsed);
  }

  if (/^[0-6]$/.test(parsed.key)) {
    if (
      eventKey !== parsed.key &&
      event.code !== `Digit${parsed.key}` &&
      event.code !== `Numpad${parsed.key}`
    ) {
      return false;
    }
  } else if (eventKey !== parsed.key) {
    return false;
  }

  return matchesModifiers(event, parsed);
}
