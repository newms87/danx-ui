import { Component } from "vue";

// === Component Types ===

export type ContextMenuContext = "table" | "list" | "code" | "text";

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  action?: () => void; // Optional - not needed if has children
  disabled?: boolean;
  children?: ContextMenuItem[]; // For nested submenus
  divider?: boolean; // For visual dividers between items
}

// === Composable Types ===

/**
 * Defines how to render a custom token pattern in the MarkdownEditor.
 *
 * Token renderers allow consumers to define custom inline patterns (like `{{123}}`)
 * that get converted to Vue components during rendering and back to markdown on save.
 *
 * The rendering flow:
 * 1. Pattern matches in HTML after markdown conversion
 * 2. toHtml() is called to create wrapper element markup
 * 3. Vue component is mounted inside the wrapper via useTokenManager
 * 4. On save, toMarkdown() converts the wrapper back to the original pattern
 */
export interface TokenRenderer {
  /** Unique identifier for this renderer (e.g., "prompt-definition") */
  id: string;

  /** Regex pattern to match tokens (e.g., /\{\{(\d+)\}\}/g). Must have global flag. */
  pattern: RegExp;

  /**
   * Returns the HTML representation for the token wrapper.
   * The wrapper will have contenteditable="false" for atomic deletion.
   *
   * @param match - The full matched string
   * @param groups - Captured regex groups
   * @returns HTML string for the wrapper (inner content will be replaced by mounted component)
   */
  toHtml: (match: string, groups: string[]) => string;

  /** Vue component to mount inside the token wrapper */
  component: Component;

  /**
   * Returns props to pass to the mounted component.
   *
   * @param groups - Captured regex groups from the pattern match
   * @returns Props object for the component
   */
  getProps: (groups: string[]) => Record<string, unknown>;

  /**
   * Converts a token wrapper element back to markdown.
   *
   * @param element - The wrapper element containing data attributes
   * @returns The markdown representation (e.g., "{{123}}")
   */
  toMarkdown: (element: HTMLElement) => string;
}

/**
 * Tracks the state of a mounted token instance.
 *
 * Each token in the editor has a unique instance tracked here,
 * allowing proper cleanup and markdown conversion.
 */
export interface TokenState {
  /** Unique instance ID (e.g., "tok-abc123") */
  id: string;

  /** ID of the TokenRenderer that created this instance */
  rendererId: string;

  /** Captured regex groups from the original match */
  groups: string[];
}
