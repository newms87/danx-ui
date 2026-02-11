/**
 * Code Blocks Composable
 *
 * Manages code block state (content, language) and operations within the
 * markdown editor. Tracks all code blocks via a reactive Map, handles
 * toggling blocks on/off, detecting code fence patterns, and coordinating
 * mount/focus lifecycle through pending focus tracking.
 *
 * @see codeBlockToggle.ts for toggle/pattern extraction
 * @see codeBlockUtils.ts for DOM manipulation helpers
 */

import { reactive, Ref } from "vue";
import { UseMarkdownSelectionReturn } from "./useMarkdownSelection";
import { getCodeBlockWrapper } from "./codeBlockUtils";
import {
  toggleCodeBlock as toggleCodeBlockFn,
  checkAndConvertCodeBlockPattern as checkPatternFn,
  CodeBlockToggleDeps,
} from "./codeBlockToggle";

/**
 * Represents a code block's state
 */
export interface CodeBlockState {
  id: string;
  content: string;
  language: string;
}

/**
 * Options for useCodeBlocks composable
 */
export interface UseCodeBlocksOptions {
  contentRef: Ref<HTMLElement | null>;
  selection: UseMarkdownSelectionReturn;
  onContentChange: () => void;
}

/**
 * Return type for useCodeBlocks composable
 */
export interface UseCodeBlocksReturn {
  /** Reactive map of all code blocks by ID */
  codeBlocks: Map<string, CodeBlockState>;
  /** Toggle code block on current block (Ctrl+Shift+K) */
  toggleCodeBlock: () => void;
  /** Check for code fence pattern (```) and convert if matched */
  checkAndConvertCodeBlockPattern: () => boolean;
  /** Check if cursor is inside a code block */
  isInCodeBlock: () => boolean;
  /** Get current code block's language */
  getCurrentCodeBlockLanguage: () => string | null;
  /** Set language for current code block */
  setCodeBlockLanguage: (language: string) => void;
  /** Get all code blocks */
  getCodeBlocks: () => Map<string, CodeBlockState>;
  /** Update content for a specific code block */
  updateCodeBlockContent: (id: string, content: string) => void;
  /** Update language for a specific code block */
  updateCodeBlockLanguage: (id: string, language: string) => void;
  /** Remove a code block by ID */
  removeCodeBlock: (id: string) => void;
  /** Get code block state by ID */
  getCodeBlockById: (id: string) => CodeBlockState | undefined;
  /** Get current code block ID (if cursor is in one) */
  getCurrentCodeBlockId: () => string | null;
  /** Handle code block mounted event - focuses if pending */
  handleCodeBlockMounted: (id: string, wrapper: HTMLElement) => void;
  /** Register a code block in state (for initial markdown parsing) */
  registerCodeBlock: (id: string, content: string, language: string) => void;
}

/**
 * Composable for code block operations in markdown editor
 */
export function useCodeBlocks(options: UseCodeBlocksOptions): UseCodeBlocksReturn {
  const { contentRef, selection, onContentChange } = options;

  // Reactive map to track all code blocks
  const codeBlocks = reactive(new Map<string, CodeBlockState>());

  // Track code blocks that should be focused when mounted
  const pendingFocusIds = new Set<string>();

  /**
   * Focus the editable pre element inside a code block wrapper
   */
  function focusCodeBlockEditor(wrapper: HTMLElement): void {
    // Find the CodeViewer's contenteditable pre element
    const codeViewerPre = wrapper.querySelector(
      'pre[contenteditable="true"]'
    ) as HTMLElement | null;
    if (codeViewerPre) {
      // Focus the pre element
      codeViewerPre.focus();

      // Position cursor at start
      const range = document.createRange();
      range.selectNodeContents(codeViewerPre);
      range.collapse(true); // Collapse to start
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }

  /**
   * Handle code block mounted event from useCodeBlockManager.
   * If this code block was pending focus, focus it now.
   */
  function handleCodeBlockMounted(id: string, wrapper: HTMLElement): void {
    if (pendingFocusIds.has(id)) {
      pendingFocusIds.delete(id);
      focusCodeBlockEditor(wrapper);
    }
  }

  /**
   * Register a code block in state.
   * Used during initial markdown parsing to register code blocks that are
   * converted from <pre><code> to wrapper structure.
   */
  function registerCodeBlock(id: string, content: string, language: string): void {
    codeBlocks.set(id, {
      id,
      content,
      language,
    });
  }

  /**
   * Get all code blocks
   */
  function getCodeBlocks(): Map<string, CodeBlockState> {
    return codeBlocks;
  }

  /**
   * Get code block state by ID
   */
  function getCodeBlockById(id: string): CodeBlockState | undefined {
    return codeBlocks.get(id);
  }

  /**
   * Update content for a specific code block
   */
  function updateCodeBlockContent(id: string, content: string): void {
    const state = codeBlocks.get(id);
    if (state) {
      state.content = content;
      onContentChange();
    }
  }

  /**
   * Update language for a specific code block
   */
  function updateCodeBlockLanguage(id: string, language: string): void {
    const state = codeBlocks.get(id);
    if (state) {
      state.language = language;
      onContentChange();
    }
  }

  /**
   * Remove a code block by ID
   */
  function removeCodeBlock(id: string): void {
    codeBlocks.delete(id);
    // Also remove from DOM if present
    if (contentRef.value) {
      const wrapper = contentRef.value.querySelector(`[data-code-block-id="${id}"]`);
      if (wrapper) {
        wrapper.remove();
      }
    }
    onContentChange();
  }

  /**
   * Get current code block ID (if cursor is in one)
   */
  function getCurrentCodeBlockId(): string | null {
    const wrapper = getCodeBlockWrapper(selection);
    return wrapper?.getAttribute("data-code-block-id") || null;
  }

  /**
   * Check if cursor is inside a code block
   */
  function isInCodeBlock(): boolean {
    return getCodeBlockWrapper(selection) !== null;
  }

  /**
   * Get current code block's language
   */
  function getCurrentCodeBlockLanguage(): string | null {
    const wrapper = getCodeBlockWrapper(selection);
    if (!wrapper) return null;

    const id = wrapper.getAttribute("data-code-block-id");
    if (!id) return null;

    const state = codeBlocks.get(id);
    return state?.language ?? "";
  }

  /**
   * Set language for current code block
   */
  function setCodeBlockLanguage(language: string): void {
    const wrapper = getCodeBlockWrapper(selection);
    if (!wrapper) return;

    const id = wrapper.getAttribute("data-code-block-id");
    if (id) {
      updateCodeBlockLanguage(id, language);
    }
  }

  // Shared dependency object for extracted toggle/pattern functions
  const toggleDeps: CodeBlockToggleDeps = {
    contentRef,
    selection,
    codeBlocks,
    pendingFocusIds,
    onContentChange,
  };

  function toggleCodeBlock(): void {
    toggleCodeBlockFn(toggleDeps);
  }

  function checkAndConvertCodeBlockPattern(): boolean {
    return checkPatternFn(toggleDeps);
  }

  return {
    codeBlocks,
    toggleCodeBlock,
    checkAndConvertCodeBlockPattern,
    isInCodeBlock,
    getCurrentCodeBlockLanguage,
    setCodeBlockLanguage,
    getCodeBlocks,
    updateCodeBlockContent,
    updateCodeBlockLanguage,
    removeCodeBlock,
    getCodeBlockById,
    getCurrentCodeBlockId,
    handleCodeBlockMounted,
    registerCodeBlock,
  };
}
