/**
 * CodeViewer Module
 *
 * Exports the CodeViewer component and its composables/types.
 * The main CodeViewer component provides syntax-highlighted code display
 * with inline editing, format switching, collapsible preview, and markdown rendering.
 */

export { default as CodeViewer } from "./CodeViewer.vue";

export { useCodeFormat } from "./useCodeFormat";
export type { UseCodeFormatOptions, UseCodeFormatReturn } from "./useCodeFormat";

export { useCodeViewerEditor } from "./useCodeViewerEditor";
export type { UseCodeViewerEditorOptions, UseCodeViewerEditorReturn } from "./useCodeViewerEditor";

export { useCodeViewerCollapse } from "./useCodeViewerCollapse";
export type { UseCodeViewerCollapseOptions, UseCodeViewerCollapseReturn } from "./useCodeViewerCollapse";

export type {
	CodeFormat,
	CodeViewerCollapsedProps,
	CodeViewerFooterProps,
	DanxCodeViewerEmits,
	DanxCodeViewerProps,
	LanguageBadgeProps,
	MarkdownContentProps,
	ValidationError,
} from "./types";
