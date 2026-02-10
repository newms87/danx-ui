/**
 * Markdown Sync Composable
 *
 * Handles bidirectional markdown <-> HTML synchronization.
 * Delegates conversion logic to syncConverters module.
 *
 * @see syncConverters.ts for conversion functions
 */

import { nextTick, onUnmounted, Ref, ref } from "vue";
import { htmlToMarkdown, renderMarkdown } from "../../shared/markdown";
import { CodeBlockState } from "./useCodeBlocks";
import { TokenRenderer, TokenState } from "./types";
import {
  convertCodeBlocksToWrappers,
  convertTokensToWrappers,
  buildEditorElementProcessor,
} from "./syncConverters";

/**
 * Options for useMarkdownSync composable
 */
export interface UseMarkdownSyncOptions {
  contentRef: Ref<HTMLElement | null>;
  onEmitValue: (markdown: string) => void;
  debounceMs?: number;
  /** Optional function to look up code block state by ID */
  getCodeBlockById?: (id: string) => CodeBlockState | undefined;
  /** Optional function to register a new code block in state */
  registerCodeBlock?: (id: string, content: string, language: string) => void;
  /** Optional array of token renderers for custom inline tokens */
  tokenRenderers?: TokenRenderer[];
  /** Optional function to look up token state by ID */
  getTokenById?: (id: string) => TokenState | undefined;
  /** Optional function to register a new token in state */
  registerToken?: (id: string, rendererId: string, groups: string[]) => void;
}

/**
 * Return type for useMarkdownSync composable
 */
export interface UseMarkdownSyncReturn {
  renderedHtml: Ref<string>;
  isInternalUpdate: Ref<boolean>;
  syncFromMarkdown: (markdown: string) => void;
  syncFromHtml: () => void;
  debouncedSyncFromHtml: () => void;
}

/**
 * Composable for bidirectional markdown <-> HTML synchronization.
 * Delegates conversion to syncConverters.
 */
export function useMarkdownSync(options: UseMarkdownSyncOptions): UseMarkdownSyncReturn {
  const {
    contentRef,
    onEmitValue,
    debounceMs = 300,
    getCodeBlockById,
    registerCodeBlock,
    tokenRenderers,
    getTokenById,
    registerToken,
  } = options;

  const renderedHtml = ref("");
  const isInternalUpdate = ref(false);
  let syncTimeout: ReturnType<typeof setTimeout> | null = null;

  function syncFromMarkdown(markdown: string): void {
    let html = renderMarkdown(markdown);
    html = convertCodeBlocksToWrappers(html, registerCodeBlock);
    html = convertTokensToWrappers(html, tokenRenderers, registerToken);
    renderedHtml.value = html;
  }

  const customElementProcessor = buildEditorElementProcessor(
    getCodeBlockById,
    tokenRenderers,
    getTokenById
  );

  function syncFromHtml(): void {
    if (!contentRef.value) return;

    const markdown = htmlToMarkdown(contentRef.value, { customElementProcessor });

    isInternalUpdate.value = true;
    onEmitValue(markdown);

    // Safety: if the emitted value is the same as the current modelValue,
    // the watcher won't fire to reset isInternalUpdate. Schedule a cleanup
    // so the flag doesn't block the next external value change.
    nextTick(() => {
      isInternalUpdate.value = false;
    });
  }

  function debouncedSyncFromHtml(): void {
    if (syncTimeout) {
      clearTimeout(syncTimeout);
    }
    syncTimeout = setTimeout(() => {
      syncFromHtml();
    }, debounceMs);
  }

  onUnmounted(() => {
    if (syncTimeout) {
      clearTimeout(syncTimeout);
    }
  });

  return {
    renderedHtml,
    isInternalUpdate,
    syncFromMarkdown,
    syncFromHtml,
    debouncedSyncFromHtml,
  };
}
