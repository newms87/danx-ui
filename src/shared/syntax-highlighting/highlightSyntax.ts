/**
 * Syntax highlighting dispatcher
 *
 * Routes code to the appropriate format-specific highlighter.
 * Each format has its own dedicated module; this file owns only
 * the HighlightFormat type, HighlightOptions interface, and the
 * dispatcher switch.
 */

import { escapeHtml } from "../escapeHtml";
import { decorateHexInHtml } from "./decorateHexInHtml";
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

/** Options for nested JSON toggle support in highlighters */
export interface NestedJsonOptions {
  isExpanded: (id: string) => boolean;
}

export interface HighlightOptions {
  format: HighlightFormat;
  /** When provided, enables nested JSON detection and toggle markup in JSON/YAML highlighting */
  nestedJson?: NestedJsonOptions;
  /** When true, post-processes output to wrap hex color codes with swatch previews */
  colorSwatches?: boolean;
}

/**
 * Highlight code based on format
 */
export function highlightSyntax(code: string, options: HighlightOptions): string {
  if (!code) return "";

  let result: string;

  switch (options.format) {
    case "json":
      result = highlightJSON(code, options.nestedJson);
      break;
    case "yaml":
      result = highlightYAML(code, options.nestedJson);
      break;
    case "vue":
    case "html":
      result = highlightHTML(code);
      break;
    case "css":
      result = highlightCSS(code);
      break;
    case "javascript":
      result = highlightJavaScript(code);
      break;
    case "typescript":
      result = highlightTypeScript(code);
      break;
    case "bash":
      result = highlightBash(code);
      break;
    case "text":
    case "markdown":
    default:
      result = escapeHtml(code);
      break;
  }

  if (options.colorSwatches) {
    result = decorateHexInHtml(result);
  }

  return result;
}
