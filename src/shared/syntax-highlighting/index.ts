/**
 * Syntax Highlighting Module
 *
 * Lightweight syntax highlighting for JSON, YAML, HTML, CSS, and JavaScript.
 * Returns HTML strings with syntax highlighting spans. Zero external dependencies.
 *
 * Exports:
 * - highlightSyntax: Main entry point for all formats
 * - highlightCSS: CSS-specific highlighter
 * - highlightJavaScript: JavaScript-specific highlighter
 * - highlightHTML: HTML-specific highlighter (with embedded CSS/JS support)
 * - Types: HighlightFormat, HighlightOptions
 */

export { highlightSyntax } from "./highlightSyntax";
export type { HighlightFormat, HighlightOptions } from "./highlightSyntax";
export { highlightCSS } from "./highlightCSS";
export { highlightJavaScript } from "./highlightJavaScript";
export { highlightBash } from "./highlightBash";
export { highlightHTML } from "./highlightHTML";
export { highlightTypeScript } from "./highlightTypeScript";
