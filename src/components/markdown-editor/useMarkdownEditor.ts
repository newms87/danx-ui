import { computed, nextTick, Ref, ref } from "vue";
import { registerDefaultHotkeys } from "./defaultHotkeys";
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
  onEmitValue: (markdown: string) => void;
  /** Callback to show the link popover UI */
  onShowLinkPopover?: (options: ShowLinkPopoverOptions) => void;
  /** Callback to show the table popover UI */
  onShowTablePopover?: (options: ShowTablePopoverOptions) => void;
  /** Optional array of token renderers for custom inline tokens */
  tokenRenderers?: TokenRenderer[];
}

/**
 * Return type for useMarkdownEditor composable
 */
export interface UseMarkdownEditorReturn {
  // From sync
  renderedHtml: Ref<string>;
  isInternalUpdate: Ref<boolean>;

  // State
  isShowingHotkeyHelp: Ref<boolean>;
  charCount: Ref<number>;

  // Event handlers
  onInput: () => void;
  onKeyDown: (event: KeyboardEvent) => void;
  onBlur: () => void;

  // For external value updates
  setMarkdown: (markdown: string) => void;

  // Formatting actions
  insertHorizontalRule: () => void;

  // Hotkey help
  showHotkeyHelp: () => void;
  hideHotkeyHelp: () => void;
  hotkeyDefinitions: Ref<HotkeyDefinition[]>;

  // Feature access (for custom hotkey registration)
  headings: ReturnType<typeof useHeadings>;
  inlineFormatting: ReturnType<typeof useInlineFormatting>;
  links: ReturnType<typeof useLinks>;
  lists: ReturnType<typeof useLists>;
  codeBlocks: ReturnType<typeof useCodeBlocks>;
  codeBlockManager: ReturnType<typeof useCodeBlockManager>;
  blockquotes: ReturnType<typeof useBlockquotes>;
  tables: ReturnType<typeof useTables>;
  tokenManager: ReturnType<typeof useTokenManager>;

  // Token state
  tokens: Map<string, TokenState>;
}

/**
 * Main orchestrator composable for markdown editor
 * Composes selection, sync, hotkeys, and feature composables
 */
export function useMarkdownEditor(options: UseMarkdownEditorOptions): UseMarkdownEditorReturn {
  const {
    contentRef,
    initialValue,
    onEmitValue,
    onShowLinkPopover,
    onShowTablePopover,
    tokenRenderers,
  } = options;

  // State
  const isShowingHotkeyHelp = ref(false);

  // Token state - tracks all mounted token instances
  const tokens = new Map<string, TokenState>();

  // Initialize selection management
  const selection = useMarkdownSelection(contentRef);

  // Initialize code blocks feature first (sync needs access to getCodeBlockById)
  // Note: onContentChange will be set after sync is created
  let syncCallback: (() => void) | null = null;
  const codeBlocks = useCodeBlocks({
    contentRef,
    selection,
    onContentChange: () => {
      if (syncCallback) syncCallback();
    },
  });

  // Initialize sync with code block lookup for HTML-to-markdown conversion
  // and registration for markdown-to-HTML conversion (initial render)
  // Also includes token renderers for custom inline token handling
  const sync = useMarkdownSync({
    contentRef,
    onEmitValue,
    debounceMs: 300,
    getCodeBlockById: codeBlocks.getCodeBlockById,
    registerCodeBlock: codeBlocks.registerCodeBlock,
    tokenRenderers,
    getTokenById: (id: string) => tokens.get(id),
    registerToken: (id: string, rendererId: string, groups: string[]) => {
      tokens.set(id, { id, rendererId, groups });
    },
  });

  // Now set the sync callback for code blocks
  syncCallback = () => sync.debouncedSyncFromHtml();

  // Initialize hotkeys
  const hotkeys = useMarkdownHotkeys({
    contentRef,
    onShowHotkeyHelp: () => {
      isShowingHotkeyHelp.value = true;
    },
  });

  // Initialize headings feature
  const headings = useHeadings({
    contentRef,
    selection,
    onContentChange: () => {
      sync.debouncedSyncFromHtml();
    },
  });

  // Initialize inline formatting feature
  const inlineFormatting = useInlineFormatting({
    contentRef,
    onContentChange: () => {
      sync.debouncedSyncFromHtml();
    },
  });

  // Initialize lists feature
  const lists = useLists({
    contentRef,
    selection,
    onContentChange: () => {
      sync.debouncedSyncFromHtml();
    },
  });

  // Initialize blockquotes feature
  const blockquotes = useBlockquotes({
    contentRef,
    onContentChange: () => {
      sync.debouncedSyncFromHtml();
    },
  });

  // Initialize links feature
  const links = useLinks({
    contentRef,
    onContentChange: () => {
      sync.debouncedSyncFromHtml();
    },
    onShowLinkPopover,
  });

  // Initialize tables feature
  const tables = useTables({
    contentRef,
    onContentChange: () => {
      sync.debouncedSyncFromHtml();
    },
    onShowTablePopover,
  });

  /**
   * Handle code block exit (double-Enter at end of code block)
   * Creates a new paragraph after the code block and positions cursor there
   */
  function handleCodeBlockExit(id: string): void {
    if (!contentRef.value) return;

    const wrapper = contentRef.value.querySelector(`[data-code-block-id="${id}"]`);
    if (!wrapper) return;

    // Create new paragraph after the code block
    const p = document.createElement("p");
    p.appendChild(document.createElement("br"));
    wrapper.parentNode?.insertBefore(p, wrapper.nextSibling);

    // Position cursor in the new paragraph
    nextTick(() => {
      const range = document.createRange();
      range.selectNodeContents(p);
      range.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      p.focus();
    });

    sync.debouncedSyncFromHtml();
  }

  /**
   * Handle code block delete (Backspace/Delete on empty code block)
   * Removes the code block and positions cursor in the previous or next element
   */
  function handleCodeBlockDelete(id: string): void {
    if (!contentRef.value) return;

    const wrapper = contentRef.value.querySelector(`[data-code-block-id="${id}"]`);
    if (!wrapper) return;

    // Find previous or next sibling to position cursor
    const previousSibling = wrapper.previousElementSibling;
    const nextSibling = wrapper.nextElementSibling;

    // Remove the code block from state (this will trigger MutationObserver cleanup)
    codeBlocks.codeBlocks.delete(id);

    // Remove the wrapper from DOM (MutationObserver will handle unmounting)
    wrapper.remove();

    // Position cursor in the appropriate element
    nextTick(() => {
      let targetElement: Element | null = null;

      if (previousSibling) {
        targetElement = previousSibling;
      } else if (nextSibling) {
        targetElement = nextSibling;
      } else {
        // No siblings - create a new paragraph
        const p = document.createElement("p");
        p.appendChild(document.createElement("br"));
        contentRef.value?.appendChild(p);
        targetElement = p;
      }

      if (targetElement) {
        const range = document.createRange();
        range.selectNodeContents(targetElement);
        range.collapse(previousSibling ? false : true); // End if previous, start if next
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    });

    sync.debouncedSyncFromHtml();
  }

  // Initialize code block manager for mounting CodeViewer instances
  const codeBlockManager = useCodeBlockManager({
    contentRef,
    codeBlocks: codeBlocks.codeBlocks,
    updateCodeBlockContent: codeBlocks.updateCodeBlockContent,
    updateCodeBlockLanguage: codeBlocks.updateCodeBlockLanguage,
    onCodeBlockExit: handleCodeBlockExit,
    onCodeBlockDelete: handleCodeBlockDelete,
    onCodeBlockMounted: codeBlocks.handleCodeBlockMounted,
  });

  // Initialize token manager for mounting custom token components
  const tokenManager = useTokenManager({
    contentRef,
    tokenRenderers: tokenRenderers || [],
    tokens,
  });

  // Character count - updated on each input since textContent is not reactive
  const charCount = ref(0);

  /**
   * Update the character count from the current content
   */
  function updateCharCount(): void {
    charCount.value = contentRef.value?.textContent?.length || 0;
  }

  // Reactive hotkey definitions for UI
  const hotkeyDefinitions = computed(() => {
    return hotkeys.getHotkeyDefinitions();
  });

  /**
   * Insert a horizontal rule after the current block element
   * Creates an <hr> element followed by a new paragraph for continued editing
   */
  function insertHorizontalRule(): void {
    if (!contentRef.value) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    // Find the current block element containing the cursor
    let node: Node | null = sel.getRangeAt(0).startContainer;
    let blockElement: HTMLElement | null = null;

    // Walk up to find a block-level element
    while (node && node !== contentRef.value) {
      const element = node as HTMLElement;
      const tagName = element.tagName?.toUpperCase();

      // Check if this is a block element (p, h1-h6, li, blockquote, etc.)
      if (
        tagName === "P" ||
        /^H[1-6]$/.test(tagName) ||
        tagName === "LI" ||
        tagName === "BLOCKQUOTE"
      ) {
        blockElement = element;
        break;
      }

      // Also check for code block wrapper
      if (element.hasAttribute?.("data-code-block-id")) {
        blockElement = element;
        break;
      }

      node = element.parentElement;
    }

    // If no block element found, use the contentRef itself as reference
    const insertAfter = blockElement || contentRef.value.lastElementChild;

    if (!insertAfter) {
      // Empty editor - just add hr and paragraph
      const hr = document.createElement("hr");
      const p = document.createElement("p");
      p.appendChild(document.createElement("br"));
      contentRef.value.appendChild(hr);
      contentRef.value.appendChild(p);
    } else {
      // Insert hr after the current block
      const hr = document.createElement("hr");
      const p = document.createElement("p");
      p.appendChild(document.createElement("br"));

      // Insert after the block element (or its parent list if in a list item)
      let insertionPoint: Element = insertAfter;
      if (insertAfter.tagName?.toUpperCase() === "LI") {
        // If in a list item, insert after the entire list
        const parentList = insertAfter.closest("ul, ol");
        if (parentList) {
          insertionPoint = parentList;
        }
      }

      insertionPoint.parentNode?.insertBefore(hr, insertionPoint.nextSibling);
      hr.parentNode?.insertBefore(p, hr.nextSibling);
    }

    // Position cursor in the new paragraph
    nextTick(() => {
      const newParagraph = contentRef.value?.querySelector("hr + p");
      if (newParagraph) {
        const range = document.createRange();
        range.selectNodeContents(newParagraph);
        range.collapse(true);
        const newSel = window.getSelection();
        newSel?.removeAllRanges();
        newSel?.addRange(range);
      }
    });

    sync.debouncedSyncFromHtml();
  }

  /**
   * Insert a tab character at the current cursor position
   */
  function insertTabCharacter(): void {
    if (!contentRef.value) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    range.deleteContents();

    const tabNode = document.createTextNode("\t");
    range.insertNode(tabNode);

    // Position cursor AFTER the tab node
    range.setStartAfter(tabNode);
    range.setEndAfter(tabNode);

    sel.removeAllRanges();
    sel.addRange(range);

    // Trigger content sync AFTER cursor is positioned
    sync.debouncedSyncFromHtml();
  }

  /**
   * Handle input events from contenteditable
   * Checks for markdown patterns (e.g., "# " for headings, "- " for lists) and converts immediately
   * Note: Code fence patterns (```) are only converted on Enter key press, not on input
   */
  function onInput(): void {
    // Update character count immediately for responsive UI
    updateCharCount();

    // Check for heading pattern (e.g., "# " -> H1)
    let converted = headings.checkAndConvertHeadingPattern();

    // Check for list pattern (e.g., "- " -> ul, "1. " -> ol)
    if (!converted) {
      converted = lists.checkAndConvertListPattern();
    }

    // If a pattern was converted, the content change callback already triggers sync
    // Otherwise, sync as normal
    if (!converted) {
      sync.debouncedSyncFromHtml();
    }
  }

  /**
   * Check if cursor is at the start of a block element (paragraph, heading, etc.)
   * Returns the block element if cursor is at position 0, null otherwise
   */
  function getCursorBlockAtStart(): HTMLElement | null {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;

    const range = sel.getRangeAt(0);

    // Check if range is collapsed (no selection, just cursor)
    if (!range.collapsed) return null;

    // Get the cursor's offset - must be at position 0
    if (range.startOffset !== 0) return null;

    // Find the containing block element
    let node: Node | null = range.startContainer;

    // If we're in a text node, check if we're at the very beginning
    if (node.nodeType === Node.TEXT_NODE) {
      // Must be at position 0 of the text node
      if (range.startOffset !== 0) return null;

      // Check if this text node is the first content in its parent block
      const parent = node.parentElement;
      if (!parent) return null;

      // Walk up to find a block element
      node = parent;
    }

    // Find the block-level element (p, h1-h6, etc.)
    while (node && node !== contentRef.value) {
      const element = node as HTMLElement;
      const tagName = element.tagName?.toUpperCase();

      // Check if this is a block element
      if (tagName === "P" || /^H[1-6]$/.test(tagName)) {
        // Verify cursor is truly at the start by checking the range position
        const blockRange = document.createRange();
        blockRange.selectNodeContents(element);
        blockRange.collapse(true);

        // Compare the cursor position with the block start
        if (range.compareBoundaryPoints(Range.START_TO_START, blockRange) === 0) {
          return element;
        }
        return null;
      }

      node = element.parentElement;
    }

    return null;
  }

  /**
   * Handle Backspace at the start of a paragraph after a code block
   * Moves cursor into the code block instead of deleting
   */
  function handleBackspaceIntoCodeBlock(): boolean {
    const block = getCursorBlockAtStart();
    if (!block) return false;

    // Check if the previous sibling is a code block wrapper
    const previousSibling = block.previousElementSibling;
    if (!previousSibling?.hasAttribute("data-code-block-id")) return false;

    // Check if the current block is empty (only contains <br> or whitespace)
    const isEmpty = !block.textContent?.trim();

    // Find the CodeViewer's contenteditable pre element inside the wrapper
    const codeViewerPre = previousSibling.querySelector("pre[contenteditable='true']");
    if (!codeViewerPre) return false;

    // If the paragraph is empty, remove it
    if (isEmpty) {
      block.remove();
    }

    // Focus the CodeViewer and position cursor at the end
    nextTick(() => {
      (codeViewerPre as HTMLElement).focus();

      // Position cursor at the end of the code content
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(codeViewerPre);
        range.collapse(false); // Collapse to end
        selection.removeAllRanges();
        selection.addRange(range);
      }
    });

    sync.debouncedSyncFromHtml();
    return true;
  }

  /**
   * Handle keydown events
   * Handles Enter for code block continuation/exit and list continuation, Tab/Shift+Tab for indentation
   */
  function onKeyDown(event: KeyboardEvent): void {
    // Don't handle events that originate from inside code block wrappers
    // (CodeViewer handles its own keyboard events like Ctrl+A for select-all)
    const target = event.target as HTMLElement | null;
    const isInCodeBlock = target?.closest("[data-code-block-id]");

    // SPECIAL CASE: Handle Ctrl+Alt+L for code block language cycling
    // This is a fallback in case the CodeViewer's handler doesn't receive the event
    // (Can happen due to event propagation issues in nested contenteditable elements)
    const isCtrlAltL =
      (event.ctrlKey || event.metaKey) && event.altKey && event.key.toLowerCase() === "l";

    if (isInCodeBlock && isCtrlAltL) {
      event.preventDefault();
      event.stopPropagation();

      // Find the code block ID and cycle its language
      const wrapper = target?.closest("[data-code-block-id]");
      const codeBlockId = wrapper?.getAttribute("data-code-block-id");

      if (codeBlockId) {
        const state = codeBlocks.codeBlocks.get(codeBlockId);

        if (state) {
          // Cycle through available formats based on current language
          const currentLang = state.language || "yaml";
          let nextLang: string;

          if (currentLang === "json" || currentLang === "yaml") {
            // Cycle: yaml -> json -> yaml (YAML/JSON only)
            nextLang = currentLang === "yaml" ? "json" : "yaml";
          } else if (currentLang === "text" || currentLang === "markdown") {
            // Cycle: text -> markdown -> text
            nextLang = currentLang === "text" ? "markdown" : "text";
          } else {
            // For other languages, don't cycle
            nextLang = currentLang;
          }

          if (nextLang !== currentLang) {
            codeBlocks.updateCodeBlockLanguage(codeBlockId, nextLang);
          }
        }
      }
      return;
    }

    if (isInCodeBlock) {
      return;
    }

    // Handle Backspace at the start of a paragraph after a code block
    if (
      event.key === "Backspace" &&
      !event.shiftKey &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      if (handleBackspaceIntoCodeBlock()) {
        event.preventDefault();
        return;
      }
    }

    // Handle arrow keys in tables (without modifiers for simple navigation)
    if (
      (event.key === "ArrowUp" || event.key === "ArrowDown") &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.shiftKey &&
      !event.metaKey
    ) {
      if (tables.isInTable()) {
        // Always navigate to the same column in the adjacent row
        const handled =
          event.key === "ArrowUp" ? tables.navigateToCellAbove() : tables.navigateToCellBelow();
        if (handled) {
          event.preventDefault();
          return;
        }
      }
    }

    // Handle Enter key for code block, table, and list continuation
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      // Check for code fence pattern first (e.g., "```javascript" -> code block)
      // This triggers only on Enter, allowing user to type full language before conversion
      const convertedToCodeBlock = codeBlocks.checkAndConvertCodeBlockPattern();
      if (convertedToCodeBlock) {
        event.preventDefault();
        return;
      }

      // Check existing code block - Enter inserts newline, or exits after double-Enter at end
      const handledByCodeBlock = codeBlocks.handleCodeBlockEnter();
      if (handledByCodeBlock) {
        event.preventDefault();
        return;
      }

      // Check if in a table - Enter moves to cell below or creates new row
      if (tables.isInTable()) {
        event.preventDefault();
        tables.handleTableEnter();
        return;
      }

      // Then check lists
      const handled = lists.handleListEnter();
      if (handled) {
        event.preventDefault();
        return;
      }
    }

    // Handle Tab key - always prevent default to keep focus in editor
    if (event.key === "Tab" && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault();

      // Check if in a table first - Tab navigates between cells
      if (tables.isInTable()) {
        tables.handleTableTab(event.shiftKey);
        return;
      }

      if (event.shiftKey) {
        // Shift+Tab - outdent if in list, otherwise do nothing
        lists.outdentListItem();
      } else {
        // Tab - indent if in list, otherwise insert tab character
        const handled = lists.indentListItem();
        if (!handled) {
          // Not in a list - insert a tab character at cursor position
          insertTabCharacter();
        }
      }
      return;
    }

    // Let hotkeys handle other keys - if not handled, default browser behavior occurs
    hotkeys.handleKeyDown(event);
  }

  /**
   * Handle blur events - sync immediately
   */
  function onBlur(): void {
    sync.syncFromHtml();
  }

  /**
   * Set markdown content from external source
   */
  function setMarkdown(markdown: string): void {
    sync.syncFromMarkdown(markdown);

    // Update the contenteditable element
    nextTick(() => {
      if (contentRef.value) {
        contentRef.value.innerHTML = sync.renderedHtml.value;
        updateCharCount();
      }
    });
  }

  /**
   * Show hotkey help popover
   */
  function showHotkeyHelp(): void {
    isShowingHotkeyHelp.value = true;
  }

  /**
   * Hide hotkey help popover
   */
  function hideHotkeyHelp(): void {
    isShowingHotkeyHelp.value = false;
  }

  // Initialize with initial value
  if (initialValue) {
    sync.syncFromMarkdown(initialValue);
  }

  const editorReturn: UseMarkdownEditorReturn = {
    // From sync
    renderedHtml: sync.renderedHtml,
    isInternalUpdate: sync.isInternalUpdate,

    // State
    isShowingHotkeyHelp,
    charCount,

    // Event handlers
    onInput,
    onKeyDown,
    onBlur,

    // External value updates
    setMarkdown,

    // Formatting actions
    insertHorizontalRule,

    // Hotkey help
    showHotkeyHelp,
    hideHotkeyHelp,
    hotkeyDefinitions,

    // Feature access
    headings,
    inlineFormatting,
    links,
    lists,
    codeBlocks,
    codeBlockManager,
    blockquotes,
    tables,
    tokenManager,

    // Token state
    tokens,
  };

  // Register default hotkeys using the data-driven config
  registerDefaultHotkeys(editorReturn, hotkeys.registerHotkey);

  return editorReturn;
}
