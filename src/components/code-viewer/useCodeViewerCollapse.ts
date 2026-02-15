/**
 * Code Viewer Collapse Composable
 *
 * Generates a compact inline preview for the collapsed state of CodeViewer.
 * For structured formats (JSON/YAML), shows key-value pairs with syntax highlighting.
 * For text/markdown, shows the truncated first line.
 */

import { computed, Ref } from "vue";
import { isNestedJson, parseNestedJson } from "../../shared/nestedJson";
import { highlightSyntax } from "../../shared/syntax-highlighting";
import type { CodeFormat } from "./types";
import type { UseCodeFormatReturn } from "./useCodeFormat";

export interface UseCodeViewerCollapseOptions {
  modelValue: Ref<object | string | null | undefined>;
  format: Ref<CodeFormat>;
  displayContent: Ref<string>;
  codeFormat: UseCodeFormatReturn;
}

export interface UseCodeViewerCollapseReturn {
  collapsedPreview: Ref<string>;
}

/**
 * Format a value for collapsed preview display.
 *
 * The maxLength parameter controls when string values get truncated.
 * Short values (under maxLength) are shown in full — no ellipsis for
 * values that nearly fit. CSS text-overflow handles final clipping
 * if the overall preview is too wide for the container.
 */
export function formatValuePreview(val: unknown, includeQuotes = true, maxLength = 50): string {
  if (val === null) {
    return "null";
  }
  if (typeof val === "string") {
    // Detect nested JSON strings and show their parsed structure
    if (isNestedJson(val)) {
      const parsed = parseNestedJson(val)!;
      return Array.isArray(parsed) ? `[${parsed.length} items]` : "{...}";
    }
    const truncated = val.length > maxLength ? val.slice(0, maxLength) + "..." : val;
    return includeQuotes ? `"${truncated}"` : truncated;
  }
  if (typeof val === "object") {
    return Array.isArray(val) ? `[${val.length}]` : "{...}";
  }
  return String(val);
}

/** Get syntax highlighting class for a value type */
export function getSyntaxClass(val: unknown): string {
  if (val === null) return "null";
  if (typeof val === "string") return "string";
  if (typeof val === "number") return "number";
  if (typeof val === "boolean") return "boolean";
  return "punctuation";
}

export interface StructuredPreviewOptions {
  wrapInBraces: boolean;
  includeQuotes: boolean;
  format: CodeFormat;
}

/**
 * Build a collapsed preview for a parsed structured value (JSON or YAML).
 * Handles null, arrays, objects (key-value pairs), and primitives.
 */
export function buildStructuredPreview(parsed: unknown, options: StructuredPreviewOptions): string {
  if (parsed === null) return '<span class="syntax-null">null</span>';
  if (Array.isArray(parsed)) return `[${parsed.length} items]`;

  if (typeof parsed === "object") {
    const keys = Object.keys(parsed);
    const keyPreviews = keys.slice(0, 3).map((k) => {
      const val = (parsed as Record<string, unknown>)[k];
      // If the value is a nested JSON string, parse and recursively preview it
      if (typeof val === "string" && isNestedJson(val)) {
        const nestedParsed = parseNestedJson(val);
        if (nestedParsed !== null) {
          const nestedPreview = buildStructuredPreview(nestedParsed, options);
          return `<span class="syntax-key">${k}</span>: ${nestedPreview}`;
        }
      }
      const valStr = formatValuePreview(val, options.includeQuotes);
      return `<span class="syntax-key">${k}</span>: <span class="syntax-${getSyntaxClass(val)}">${valStr}</span>`;
    });
    const ellipsis = keys.length > 3 ? ", ..." : "";
    const joined = keyPreviews.join(", ") + ellipsis;
    return options.wrapInBraces ? `{${joined}}` : joined;
  }

  return options.format === "json"
    ? highlightSyntax(String(parsed), { format: "json" })
    : String(parsed);
}

export function useCodeViewerCollapse(
  options: UseCodeViewerCollapseOptions
): UseCodeViewerCollapseReturn {
  const { modelValue, format, displayContent, codeFormat } = options;

  const collapsedPreview = computed(() => {
    const content = displayContent.value;
    if (!content) return '<span class="syntax-null">null</span>';

    const maxLength = 100;
    let preview = "";

    // For text and markdown formats, just show the first line
    if (format.value === "text" || format.value === "markdown") {
      const firstLine = (content.split("\n")[0] ?? "").trim();
      preview = firstLine.length > maxLength ? firstLine.slice(0, maxLength) + "..." : firstLine;
      return preview;
    }

    if (format.value === "json") {
      try {
        const parsed =
          typeof modelValue.value === "string" ? JSON.parse(modelValue.value) : modelValue.value;
        preview = buildStructuredPreview(parsed, {
          wrapInBraces: true,
          includeQuotes: true,
          format: "json",
        });
      } catch {
        preview = content.replace(/\s+/g, " ").slice(0, maxLength);
        if (content.length > maxLength) preview += "...";
      }
    } else {
      // YAML and other formats
      try {
        const parsed =
          typeof modelValue.value === "string"
            ? codeFormat.parse(modelValue.value)
            : modelValue.value;
        preview = buildStructuredPreview(parsed, {
          wrapInBraces: false,
          includeQuotes: false,
          format: format.value,
        });
      } catch {
        const firstLine = content.split("\n")[0] ?? "";
        preview = firstLine.length > maxLength ? firstLine.slice(0, maxLength) + "..." : firstLine;
      }
    }

    return preview;
  });

  return {
    collapsedPreview,
  };
}
