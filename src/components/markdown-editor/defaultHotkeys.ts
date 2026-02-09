/**
 * Default Hotkeys Registration
 *
 * Registers all default hotkeys from hotkeyDefinitions with the
 * markdown editor's hotkey system.
 *
 * @see hotkeyDefinitions.ts for the hotkey configuration data
 */

import { HotkeyDefinition } from "./useMarkdownHotkeys";
import { UseMarkdownEditorReturn } from "./useMarkdownEditor";
import { DEFAULT_HOTKEYS } from "./hotkeyDefinitions";

/**
 * Register all default hotkeys for the markdown editor.
 * Reads from the data-driven DEFAULT_HOTKEYS config and registers each.
 */
export function registerDefaultHotkeys(
  editor: UseMarkdownEditorReturn,
  registerHotkey: (def: HotkeyDefinition) => void
): void {
  for (const config of DEFAULT_HOTKEYS) {
    registerHotkey({
      key: config.key,
      action: config.action ? () => config.action!(editor) : () => {},
      description: config.description,
      group: config.group,
    });
  }
}
