/**
 * CodeViewer Type Definitions
 *
 * Types for the CodeViewer component family: code display with syntax highlighting,
 * inline editing, format switching, collapsible preview, and markdown rendering.
 */

/**
 * Supported code/content formats.
 *
 * - "json" and "yaml": Structured data formats with parsing, validation, and format switching
 * - "text" and "markdown": Freeform text formats (markdown renders to HTML)
 * - "html", "css", "javascript": Code formats with syntax highlighting but no validation
 */
export type CodeFormat =
  | "json"
  | "yaml"
  | "text"
  | "markdown"
  | "html"
  | "css"
  | "javascript"
  | "typescript"
  | "bash"
  | "vue";

/**
 * Validation error returned when content fails format-specific validation.
 * Only applicable to json and yaml formats.
 */
export interface ValidationError {
  /** Human-readable error message */
  message: string;
  /** Line number where the error occurred (1-based) */
  line?: number;
  /** Column number where the error occurred (1-based) */
  column?: number;
}

/**
 * Props for the CodeViewer component.
 */
export interface DanxCodeViewerProps {
  /** The data to display. Objects are formatted per the current format. Strings are displayed as-is. */
  modelValue?: object | string | null;
  /** The display/edit format. Defaults to "yaml". */
  format?: CodeFormat;
  /** Optional label shown above the code viewer. */
  label?: string;
  /** Additional CSS class(es) applied to the code content area. */
  editorClass?: string;
  /** Whether editing is allowed (shows edit toggle in footer). */
  canEdit?: boolean;
  /** Whether the viewer starts in edit mode. */
  editable?: boolean;
  /** Whether the viewer can be collapsed to a single-line preview. */
  collapsible?: boolean;
  /** Whether the viewer starts collapsed when collapsible is true. */
  defaultCollapsed?: boolean;
  /** Default format for code blocks inside markdown content. */
  defaultCodeFormat?: "json" | "yaml";
  /** Whether the language badge allows selecting any language (shows search). */
  allowAnyLanguage?: boolean;
  /** Color theme: "dark" (default) or "light". */
  theme?: "dark" | "light";
  /** Whether to hide the footer entirely. */
  hideFooter?: boolean;
  /** How frequently v-model emits during editing, in milliseconds (default: 300). Set 0 for immediate. */
  debounceMs?: number;
  /** Current validation state via v-model:valid. True when content is valid for the current format. */
  valid?: boolean;
}

/**
 * Events emitted by the CodeViewer component.
 */
export interface DanxCodeViewerEmits {
  /** Emitted when the model value changes (from editing). */
  (e: "update:modelValue", value: object | string | null): void;
  /** Emitted when the display format changes (from format switching). */
  (e: "update:format", format: CodeFormat): void;
  /** Emitted when edit mode is toggled. */
  (e: "update:editable", editable: boolean): void;
  /** Emitted when validation state changes (use v-model:valid). */
  (e: "update:valid", valid: boolean): void;
  /** Emitted when the user exits the code block (Ctrl+Enter). */
  (e: "exit"): void;
  /** Emitted when the user deletes the code block (Backspace/Delete on empty). */
  (e: "delete"): void;
}

/**
 * Props for the CodeViewerFooter subcomponent.
 */
export interface CodeViewerFooterProps {
  /** Number of characters in the displayed content. */
  charCount: number;
  /** Current validation error, if any. */
  validationError: ValidationError | null;
  /** Whether editing is allowed (controls edit button visibility). */
  canEdit: boolean;
  /** Whether currently in edit mode (controls edit button highlight). */
  isEditing: boolean;
}

/**
 * Props for the LanguageBadge subcomponent.
 */
export interface LanguageBadgeProps {
  /** Current format/language being displayed. */
  format: string;
  /** Formats available for quick switching (shown on hover). */
  availableFormats?: string[];
  /** Whether format switching is enabled. */
  toggleable?: boolean;
  /** Whether to show a search panel for selecting any language. */
  allowAnyLanguage?: boolean;
  /** Controls search panel visibility via v-model:searchOpen. */
  searchOpen?: boolean;
}

/**
 * Props for the MarkdownContent subcomponent.
 */
export interface MarkdownContentProps {
  /** Raw markdown string to render. */
  content: string;
  /** Default format for embedded code blocks. */
  defaultCodeFormat?: "json" | "yaml";
}

/**
 * Props for the CodeViewerCollapsed subcomponent.
 */
export interface CodeViewerCollapsedProps {
  /** HTML string showing a collapsed preview of the content. */
  preview: string;
  /** Current format/language. */
  format: string;
  /** Formats available for quick switching. */
  availableFormats?: string[];
  /** Whether to show the language search panel. */
  allowAnyLanguage?: boolean;
}
