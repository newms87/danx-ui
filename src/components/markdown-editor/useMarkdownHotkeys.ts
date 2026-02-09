/**
 * Markdown Hotkeys Composable
 *
 * Registry-based hotkey system for the markdown editor. Provides
 * registration, unregistration, and keyboard event dispatch.
 *
 * @see hotkeyMatching.ts for key parsing and matching logic
 */

import { Ref, ref } from "vue";
import { ParsedKey, parseKeyCombo, matchesKeyCombo } from "./hotkeyMatching";

/** Hotkey group categories for organization */
export type HotkeyGroup = "headings" | "formatting" | "lists" | "blocks" | "tables" | "other";

/** Definition for a registered hotkey */
export interface HotkeyDefinition {
  /** Key combination string, e.g., 'ctrl+1', 'ctrl+shift+b' */
  key: string;
  /** Action to execute when hotkey is triggered */
  action: () => void;
  /** Human-readable description for help display */
  description: string;
  /** Category group for help organization */
  group: HotkeyGroup;
}

/** Options for useMarkdownHotkeys composable */
export interface UseMarkdownHotkeysOptions {
  contentRef: Ref<HTMLElement | null>;
  onShowHotkeyHelp: () => void;
}

/** Return type for useMarkdownHotkeys composable */
export interface UseMarkdownHotkeysReturn {
  registerHotkey: (def: HotkeyDefinition) => void;
  unregisterHotkey: (key: string) => void;
  handleKeyDown: (event: KeyboardEvent) => boolean;
  getHotkeyDefinitions: () => HotkeyDefinition[];
}

/**
 * Composable for hotkey registration and dispatch in markdown editor
 */
export function useMarkdownHotkeys(options: UseMarkdownHotkeysOptions): UseMarkdownHotkeysReturn {
  const { onShowHotkeyHelp } = options;

  const hotkeys = ref<Map<string, HotkeyDefinition>>(new Map());
  const parsedKeys = new Map<string, ParsedKey>();

  function registerHotkey(def: HotkeyDefinition): void {
    const normalizedKey = def.key.toLowerCase();
    hotkeys.value.set(normalizedKey, def);
    parsedKeys.set(normalizedKey, parseKeyCombo(normalizedKey));
  }

  function unregisterHotkey(key: string): void {
    const normalizedKey = key.toLowerCase();
    hotkeys.value.delete(normalizedKey);
    parsedKeys.delete(normalizedKey);
  }

  function getHotkeyDefinitions(): HotkeyDefinition[] {
    return Array.from(hotkeys.value.values());
  }

  function handleKeyDown(event: KeyboardEvent): boolean {
    if ((event.ctrlKey || event.metaKey) && (event.key === "?" || event.key === "/")) {
      event.preventDefault();
      onShowHotkeyHelp();
      return true;
    }

    for (const [key, def] of hotkeys.value) {
      const parsed = parsedKeys.get(key);

      if (parsed && matchesKeyCombo(event, parsed)) {
        event.preventDefault();
        def.action();
        return true;
      }
    }

    return false;
  }

  return {
    registerHotkey,
    unregisterHotkey,
    handleKeyDown,
    getHotkeyDefinitions,
  };
}
