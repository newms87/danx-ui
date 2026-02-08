/**
 * Code Viewer Collapse Composable
 *
 * Generates a compact inline preview for the collapsed state of CodeViewer.
 * For structured formats (JSON/YAML), shows key-value pairs with syntax highlighting.
 * For text/markdown, shows the truncated first line.
 */

import { computed, Ref } from "vue";
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

/** Format a value for collapsed preview display */
export function formatValuePreview(val: unknown, includeQuotes = true): string {
	if (val === null) {
		return "null";
	}
	if (typeof val === "string") {
		const truncated = val.length > 15 ? val.slice(0, 15) + "..." : val;
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

export function useCodeViewerCollapse(options: UseCodeViewerCollapseOptions): UseCodeViewerCollapseReturn {
	const { modelValue, format, displayContent, codeFormat } = options;

	const collapsedPreview = computed(() => {
		const content = displayContent.value;
		if (!content) return "<span class=\"syntax-null\">null</span>";

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
				const parsed = typeof modelValue.value === "string"
					? JSON.parse(modelValue.value)
					: modelValue.value;

				if (parsed === null) {
					return "<span class=\"syntax-null\">null</span>";
				}

				if (Array.isArray(parsed)) {
					preview = `[${parsed.length} items]`;
				} else if (typeof parsed === "object") {
					const keys = Object.keys(parsed);
					const keyPreviews = keys.slice(0, 3).map(k => {
						const val = parsed[k];
						const valStr = formatValuePreview(val);
						return `<span class="syntax-key">${k}</span>: <span class="syntax-${getSyntaxClass(val)}">${valStr}</span>`;
					});
					preview = `{${keyPreviews.join(", ")}${keys.length > 3 ? ", ..." : ""}}`;
				} else {
					preview = highlightSyntax(String(parsed), { format: "json" });
				}
			} catch {
				preview = content.replace(/\s+/g, " ").slice(0, maxLength);
				if (content.length > maxLength) preview += "...";
			}
		} else {
			// YAML and other formats
			try {
				const parsed = typeof modelValue.value === "string"
					? codeFormat.parse(modelValue.value)
					: modelValue.value;

				if (parsed === null) {
					return "<span class=\"syntax-null\">null</span>";
				}

				if (Array.isArray(parsed)) {
					preview = `[${parsed.length} items]`;
				} else if (typeof parsed === "object") {
					const keys = Object.keys(parsed);
					const keyPreviews = keys.slice(0, 3).map(k => {
						const val = (parsed as Record<string, unknown>)[k];
						const valStr = formatValuePreview(val, false);
						return `<span class="syntax-key">${k}</span>: <span class="syntax-${getSyntaxClass(val)}">${valStr}</span>`;
					});
					preview = keyPreviews.join(", ") + (keys.length > 3 ? ", ..." : "");
				} else {
					preview = String(parsed);
				}
			} catch {
				const firstLine = content.split("\n")[0] ?? "";
				preview = firstLine.length > maxLength ? firstLine.slice(0, maxLength) + "..." : firstLine;
			}
		}

		return preview;
	});

	return {
		collapsedPreview
	};
}
