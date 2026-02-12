/**
 * Syntax highlighting dispatcher
 *
 * Routes code to the appropriate format-specific highlighter.
 * Each format has its own dedicated module; this file owns only
 * the HighlightFormat type, HighlightOptions interface, and the
 * dispatcher switch.
 */

import { escapeHtml } from "../escapeHtml";
import { highlightBash } from "./highlightBash";
import { highlightCSS } from "./highlightCSS";
import { highlightHTML } from "./highlightHTML";
import { highlightJSON } from "./highlightJSON";
import { highlightJavaScript } from "./highlightJavaScript";
import { highlightTypeScript } from "./highlightTypeScript";
import { highlightYAML } from "./highlightYAML";

export type HighlightFormat =
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

export interface HighlightOptions {
  format: HighlightFormat;
}

/**
 * Highlight code based on format
 */
export function highlightSyntax(code: string, options: HighlightOptions): string {
  if (!code) return "";

  switch (options.format) {
    case "json":
      return highlightJSON(code);
    case "yaml":
      return highlightYAML(code);
    case "vue":
    case "html":
      return highlightHTML(code);
    case "css":
      return highlightCSS(code);
    case "javascript":
      return highlightJavaScript(code);
    case "typescript":
      return highlightTypeScript(code);
    case "bash":
      return highlightBash(code);
    case "text":
    case "markdown":
    default:
      return escapeHtml(code);
  }
}
