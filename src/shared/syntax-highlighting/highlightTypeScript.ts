/**
 * Lightweight syntax highlighting for TypeScript
 *
 * Delegates to the JavaScript highlighter with additional TypeScript-specific
 * keywords. This avoids duplicating the entire JS tokenizer while providing
 * accurate highlighting for TS-only constructs.
 */

import { highlightJavaScript } from "./highlightJavaScript";

/**
 * TypeScript-specific keywords not present in the JavaScript keyword set
 */
const TS_EXTRA_KEYWORDS = new Set([
  "type",
  "interface",
  "enum",
  "namespace",
  "declare",
  "abstract",
  "implements",
  "readonly",
  "keyof",
  "infer",
  "is",
  "asserts",
  "override",
  "satisfies",
  "public",
  "private",
  "protected",
  "never",
  "unknown",
  "any",
]);

/**
 * Highlight TypeScript syntax by extending the JavaScript highlighter
 * with TypeScript-specific keywords
 */
export function highlightTypeScript(code: string): string {
  return highlightJavaScript(code, TS_EXTRA_KEYWORDS);
}
