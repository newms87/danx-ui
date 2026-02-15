/**
 * Syntax Highlighting Module
 *
 * Lightweight syntax highlighting for JSON, YAML, HTML, CSS, JavaScript,
 * TypeScript, and Bash. Returns HTML strings with syntax highlighting spans.
 * Zero external dependencies.
 *
 * Exports:
 * - highlightSyntax: Main entry point (dispatcher for all formats)
 * - highlightJSON: JSON-specific highlighter
 * - highlightYAML: YAML-specific highlighter
 * - highlightCSS: CSS-specific highlighter
 * - highlightJavaScript: JavaScript-specific highlighter
 * - highlightTypeScript: TypeScript-specific highlighter
 * - highlightHTML: HTML-specific highlighter (with embedded CSS/JS support)
 * - highlightBash: Bash/Shell-specific highlighter
 * - decorateHexInHtml: Post-processor for hex color swatch previews
 * - Types: HighlightFormat, HighlightOptions
 */

export { highlightSyntax } from "./highlightSyntax";
export type { HighlightFormat, HighlightOptions, NestedJsonOptions } from "./highlightSyntax";
export { highlightJSON } from "./highlightJSON";
export { highlightYAML } from "./highlightYAML";
export { highlightCSS } from "./highlightCSS";
export { highlightJavaScript } from "./highlightJavaScript";
export { highlightBash } from "./highlightBash";
export { highlightHTML } from "./highlightHTML";
export { highlightTypeScript } from "./highlightTypeScript";
export { decorateHexInHtml } from "./decorateHexInHtml";
