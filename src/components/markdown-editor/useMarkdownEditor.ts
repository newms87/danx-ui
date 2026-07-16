/**
 * Main Markdown Editor Composable
 *
 * Orchestrates all editor functionality by composing feature composables
 * and handler modules:
 * - Selection, sync, and hotkey management
 * - Feature composables (headings, lists, tables, links, formatting, etc.)
 * - Key handlers, code block handlers, and editor actions
 *
 * Provides the unified editor interface consumed by MarkdownEditorContent.vue.
 *
 * @see editorKeyHandlers.ts for keyboard event routing
 * @see editorCodeBlockHandlers.ts for code block lifecycle
 * @see editorActions.ts for document structure actions
 */

import { computed, nextTick, onUnmounted, Ref, ref, watch } from "vue";
import { registerDefaultHotkeys } from "./defaultHotkeys";
import { createCodeBlockHandlers } from "./editorCodeBlockHandlers";
import { createEditorActions } from "./editorActions";
import { createKeyHandler } from "./editorKeyHandlers";
import { cleanupInvalidSwatches } from "./hexColorDecorator";
import { normalizePastedHtml } from "./pasteNormalization";
import { HotkeyDefinition, useMarkdownHotkeys } from "./useMarkdownHotkeys";
import { useMarkdownSelection } from "./useMarkdownSelection";
import { useMarkdownSync } from "./useMarkdownSync";
import { useBlockquotes } from "./useBlockquotes";
import { useCodeBlocks } from "./useCodeBlocks";
import { useCodeBlockManager } from "./useCodeBlockManager";
import { useHeadings } from "./useHeadings";
import { useInlineFormatting } from "./useInlineFormatting";
import { ShowLinkPopoverOptions, useLinks } from "./useLinks";
import { useLists } from "./useLists";
import { ShowTablePopoverOptions, useTables } from "./useTables";
import { useTokenManager } from "./useTokenManager";
import { TokenRenderer, TokenState } from "./types";

/**
 * Options for useMarkdownEditor composable
 */
export interface UseMarkdownEditorOptions {
  contentRef: Ref<HTMLElement | null>;
  initialValue: string;
  /** Debounce delay (ms) for v-model emit while editing (default: 300, 0 for immediate) */
  debounceMs?: number;
  onEmitValue: (markdown: string) => void;
  /** Callback to show the link popover UI */
  onShowLinkPopover?: (options: ShowLinkPopoverOptions) => void;
  /** Callback to show the table popover UI */
  onShowTablePopover?: (options: ShowTablePopoverOptions) => void;
  /** Optional array of token renderers for custom inline tokens */
  tokenRenderers?: TokenRenderer[];
  /** When true, embedded CodeViewers are non-editable with hidden footers */
  readonly?: boolean;
}

/**
 * Return type for useMarkdownEditor composable
 */
export interface UseMarkdownEditorReturn {
  renderedHtml: Ref<string>;
  isInternalUpdate: Ref<boolean>;
  isShowingHotkeyHelp: Ref<boolean>;
  charCount: Ref<number>;
  onInput: () => void;
  onKeyDown: (event: KeyboardEvent) => void;
  onPaste: (event: ClipboardEvent) => void;
  onBlur: () => void;
  setMarkdown: (markdown: string) => void;
  insertHorizontalRule: () => void;
  showHotkeyHelp: () => void;
  hideHotkeyHelp: () => void;
  hotkeyDefinitions: Ref<HotkeyDefinition[]>;
  headings: ReturnType<typeof useHeadings>;
  inlineFormatting: ReturnType<typeof useInlineFormatting>;
  links: ReturnType<typeof useLinks>;
  lists: ReturnType<typeof useLists>;
  codeBlocks: ReturnType<typeof useCodeBlocks>;
  codeBlockManager: ReturnType<typeof useCodeBlockManager>;
  blockquotes: ReturnType<typeof useBlockquotes>;
  tables: ReturnType<typeof useTables>;
  tokenManager: ReturnType<typeof useTokenManager>;
  tokens: Map<string, TokenState>;
}

/**
 * Main orchestrator composable for markdown editor.
 * Composes selection, sync, hotkeys, and feature composables.
 */
export function useMarkdownEditor(options: UseMarkdownEditorOptions): UseMarkdownEditorReturn {
  const {
    contentRef,
    initialValue,
    debounceMs,
    onEmitValue,
    onShowLinkPopover,
    onShowTablePopover,
    tokenRenderers,
    readonly,
  } = options;

  const isShowingHotkeyHelp = ref(false);
  const tokens = new Map<string, TokenState>();
  const selection = useMarkdownSelection(contentRef);

  // Initialize code blocks (sync callback set after sync is created)
  let syncCallback: (() => void) | null = null;
  const codeBlocks = useCodeBlocks({
    contentRef,
    selection,
    onContentChange: () => {
      if (syncCallback) syncCallback();
    },
  });

  const sync = useMarkdownSync({
    contentRef,
    onEmitValue,
    debounceMs,
    getCodeBlockById: codeBlocks.getCodeBlockById,
    registerCodeBlock: codeBlocks.registerCodeBlock,
    tokenRenderers,
    getTokenById: (id: string) => tokens.get(id),
    registerToken: (id: string, rendererId: string, groups: string[]) => {
      tokens.set(id, { id, rendererId, groups });
    },
  });

  const onContentChange = () => sync.debouncedSyncFromHtml();
  syncCallback = onContentChange;

  const hotkeys = useMarkdownHotkeys({
    contentRef,
    onShowHotkeyHelp: () => {
      isShowingHotkeyHelp.value = true;
    },
  });

  const headings = useHeadings({
    contentRef,
    selection,
    onContentChange,
  });

  const inlineFormatting = useInlineFormatting({
    contentRef,
    onContentChange,
  });

  const lists = useLists({
    contentRef,
    selection,
    onContentChange,
  });

  const blockquotes = useBlockquotes({
    contentRef,
    onContentChange,
  });

  const links = useLinks({
    contentRef,
    onContentChange,
    onShowLinkPopover,
  });

  const tables = useTables({
    contentRef,
    onContentChange,
    onShowTablePopover,
  });

  // Compose handler modules
  const { handleCodeBlockExit, handleCodeBlockDelete } = createCodeBlockHandlers({
    contentRef,
    codeBlocksMap: codeBlocks.codeBlocks,
    debouncedSyncFromHtml: () => sync.debouncedSyncFromHtml(),
  });

  const { insertHorizontalRule } = createEditorActions({
    contentRef,
    debouncedSyncFromHtml: () => sync.debouncedSyncFromHtml(),
  });

  const { onKeyDown } = createKeyHandler({
    contentRef,
    hotkeys,
    codeBlocks,
    tables,
    lists,
    sync,
  });

  const codeBlockManager = useCodeBlockManager({
    contentRef,
    codeBlocks: codeBlocks.codeBlocks,
    updateCodeBlockContent: codeBlocks.updateCodeBlockContent,
    updateCodeBlockLanguage: codeBlocks.updateCodeBlockLanguage,
    onCodeBlockExit: handleCodeBlockExit,
    onCodeBlockDelete: handleCodeBlockDelete,
    onCodeBlockMounted: codeBlocks.handleCodeBlockMounted,
    readonly,
  });

  const tokenManager = useTokenManager({
    contentRef,
    tokenRenderers: tokenRenderers || [],
    tokens,
  });

  const charCount = ref(0);

  function updateCharCount(): void {
    charCount.value = contentRef.value?.textContent?.length || 0;
  }

  const hotkeyDefinitions = computed(() => hotkeys.getHotkeyDefinitions());

  function onInput(): void {
    updateCharCount();

    // Immediately remove invalid color-preview spans (e.g., empty copies
    // created when Enter splits a line inside a swatch span).
    if (contentRef.value) cleanupInvalidSwatches(contentRef.value);

    let converted = headings.checkAndConvertHeadingPattern();
    if (!converted) {
      converted = lists.checkAndConvertListPattern();
    }
    if (!converted) {
      sync.debouncedSyncFromHtml();
    }
  }

  // Track whether Shift is currently held so onPaste can offer a plain-text
  // paste path. ClipboardEvent has no standard modifier-key properties (it
  // does not extend UIEvent), so the held state is tracked independently via
  // window-level key events rather than read off the paste event itself.
  const isShiftHeld = ref(false);
  function handleGlobalKeyDown(e: KeyboardEvent): void {
    if (e.key === "Shift") isShiftHeld.value = true;
  }
  function handleGlobalKeyUp(e: KeyboardEvent): void {
    if (e.key === "Shift") isShiftHeld.value = false;
  }
  if (typeof window !== "undefined") {
    window.addEventListener("keydown", handleGlobalKeyDown);
    window.addEventListener("keyup", handleGlobalKeyUp);
    onUnmounted(() => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
      window.removeEventListener("keyup", handleGlobalKeyUp);
    });
  }

  /**
   * Handle paste events. Intercepts the clipboard, strips foreign HTML cruft
   * (Word/Docs conditional comments, inline style/class, meta/script tags),
   * and inserts the normalized markup at the caret. Holding Shift while
   * pasting instead inserts the clipboard's plain text verbatim, bypassing
   * HTML conversion entirely.
   */
  function onPaste(event: ClipboardEvent): void {
    event.preventDefault();

    const plainText = event.clipboardData?.getData("text/plain") ?? "";

    if (isShiftHeld.value) {
      document.execCommand("insertText", false, plainText);
      onContentChange();
      return;
    }

    const html = event.clipboardData?.getData("text/html") ?? "";
    if (!html) {
      document.execCommand("insertText", false, plainText);
      onContentChange();
      return;
    }

    const normalizedHtml = normalizePastedHtml(html);
    document.execCommand("insertHTML", false, normalizedHtml);
    onContentChange();
  }

  function onBlur(): void {
    sync.syncFromHtml();
  }

  function setMarkdown(markdown: string): void {
    sync.syncFromMarkdown(markdown);
    nextTick(() => {
      if (contentRef.value) {
        contentRef.value.innerHTML = sync.renderedHtml.value;
        updateCharCount();
      }
    });
  }

  function showHotkeyHelp(): void {
    isShowingHotkeyHelp.value = true;
  }

  function hideHotkeyHelp(): void {
    isShowingHotkeyHelp.value = false;
  }

  if (initialValue) {
    sync.syncFromMarkdown(initialValue);
  }

  // Update char count once the contenteditable element mounts with v-html content
  const stopWatchingContent = watch(contentRef, (el) => {
    if (el) {
      updateCharCount();
      stopWatchingContent();
    }
  });

  const editorReturn: UseMarkdownEditorReturn = {
    renderedHtml: sync.renderedHtml,
    isInternalUpdate: sync.isInternalUpdate,
    isShowingHotkeyHelp,
    charCount,
    onInput,
    onKeyDown,
    onPaste,
    onBlur,
    setMarkdown,
    insertHorizontalRule,
    showHotkeyHelp,
    hideHotkeyHelp,
    hotkeyDefinitions,
    headings,
    inlineFormatting,
    links,
    lists,
    codeBlocks,
    codeBlockManager,
    blockquotes,
    tables,
    tokenManager,
    tokens,
  };

  registerDefaultHotkeys(editorReturn, hotkeys.registerHotkey);

  return editorReturn;
}
