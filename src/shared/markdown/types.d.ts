/**
 * Markdown parser and renderer type definitions
 */

/**
 * Options for markdown rendering
 */
export interface MarkdownRenderOptions {
  sanitize?: boolean; // XSS protection (default: true)
  preserveState?: boolean; // Don't reset link refs and footnotes (for nested rendering)
}

/**
 * Link reference for reference-style links
 */
export interface LinkReference {
  url: string;
  title?: string;
}

/**
 * Footnote definition for footnote references
 */
export interface FootnoteDefinition {
  content: string;
  index: number; // For numbered display
}

/**
 * List item type supporting nested content
 */
export interface ListItem {
  content: string;
  children?: BlockToken[]; // Nested lists or other block content
}

/**
 * Token types for block-level parsing
 */
export type BlockToken =
  | { type: "heading"; level: number; content: string }
  | { type: "code_block"; language: string; content: string }
  | { type: "blockquote"; content: string }
  | { type: "ul"; items: ListItem[] }
  | { type: "ol"; items: ListItem[]; start: number }
  | { type: "task_list"; items: Array<{ checked: boolean; content: string }> }
  | { type: "table"; headers: string[]; alignments: TableAlignment[]; rows: string[][] }
  | { type: "dl"; items: Array<{ term: string; definitions: string[] }> }
  | { type: "hr" }
  | { type: "paragraph"; content: string };

/**
 * Table column alignment
 */
export type TableAlignment = "left" | "center" | "right" | null;

/**
 * Result from a block parser function
 */
export interface ParseResult {
  token: BlockToken;
  endIndex: number;
}
