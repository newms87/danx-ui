import { reactive, Ref } from "vue";
import { UseMarkdownSelectionReturn } from "./useMarkdownSelection";
import { detectCodeFenceStart } from "../../shared/markdown";
import { positionCursorAtEnd } from "./cursorPosition";
import { isConvertibleBlock, getTargetBlock as getTargetBlockShared } from "./blockUtils";
import { generateCodeBlockId } from "./syncConverters";

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
 * Get the block-level parent element for code block operations.
 * Delegates to the shared getTargetBlock with code block recognition enabled.
 */
function getTargetBlock(
  contentRef: Ref<HTMLElement | null>,
  selection: UseMarkdownSelectionReturn
): Element | null {
  return getTargetBlockShared(contentRef, selection, {
    includeCodeBlocks: true,
    includeLists: true,
  });
}

/**
 * Get the code block wrapper element containing the cursor (if in a code block).
 * Walks up the DOM to find an element with data-code-block-id attribute.
 */
function getCodeBlockWrapper(selection: UseMarkdownSelectionReturn): HTMLElement | null {
  const currentBlock = selection.getCurrentBlock();
  if (!currentBlock) return null;

  let current: Element | null = currentBlock;
  while (current) {
    if (current.hasAttribute("data-code-block-id")) {
      return current as HTMLElement;
    }
    current = current.parentElement;
  }

  return null;
}

/**
 * Create a code block wrapper with non-editable island structure.
 * Returns the wrapper div and the code block ID.
 */
function createCodeBlockWrapper(
  content: string,
  language: string
): { wrapper: HTMLDivElement; id: string } {
  const id = generateCodeBlockId();

  const wrapper = document.createElement("div");
  wrapper.className = "code-block-wrapper";
  wrapper.setAttribute("contenteditable", "false");
  wrapper.setAttribute("data-code-block-id", id);

  // Create mount point for CodeViewer
  const mountPoint = document.createElement("div");
  mountPoint.className = "code-viewer-mount-point";

  // Store initial content and language as data attributes for the manager to read
  mountPoint.setAttribute("data-content", content);
  mountPoint.setAttribute("data-language", language);

  wrapper.appendChild(mountPoint);

  return { wrapper, id };
}

/**
 * Convert a code block wrapper back to a paragraph
 */
function convertCodeBlockToParagraph(
  wrapper: HTMLElement,
  codeBlocks: Map<string, CodeBlockState>
): HTMLParagraphElement {
  const p = document.createElement("p");
  const id = wrapper.getAttribute("data-code-block-id");

  // Get content from state
  const state = id ? codeBlocks.get(id) : null;
  p.textContent = state?.content || "";

  // Remove from state
  if (id) {
    codeBlocks.delete(id);
  }

  // Replace wrapper with paragraph
  wrapper.parentNode?.replaceChild(p, wrapper);

  return p;
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

  /**
   * Toggle code block on the current block
   * - If paragraph/div/heading: convert to code block wrapper
   * - If already in code block: convert back to paragraph
   * - If in a list: convert list item to paragraph first, then to code block
   */
  function toggleCodeBlock(): void {
    if (!contentRef.value) return;

    // Check if already in a code block wrapper
    const wrapper = getCodeBlockWrapper(selection);
    if (wrapper) {
      const p = convertCodeBlockToParagraph(wrapper, codeBlocks);
      positionCursorAtEnd(p);
      onContentChange();
      return;
    }

    // Get the target block
    const block = getTargetBlock(contentRef, selection);
    if (!block) return;

    // If in a list item, we can't directly convert to code block
    // The caller (MarkdownEditor) should handle this by first converting to paragraph
    if (block.tagName === "LI") {
      // For now, just return - the menu handler will deal with this
      return;
    }

    // Convert to code block wrapper
    if (isConvertibleBlock(block)) {
      const content = block.textContent || "";
      const { wrapper, id } = createCodeBlockWrapper(content, "");

      // Register in state
      codeBlocks.set(id, {
        id,
        content,
        language: "",
      });

      // Replace block with wrapper
      block.parentNode?.replaceChild(wrapper, block);

      // Mark this code block for focus when it mounts
      pendingFocusIds.add(id);

      onContentChange();
    }
  }

  /**
   * Check if the current block contains a code fence pattern (``` or ```language)
   * and convert it to the appropriate code block if detected.
   * Only converts paragraphs/divs/headings, not existing code blocks.
   * @returns true if a pattern was detected and converted, false otherwise
   */
  function checkAndConvertCodeBlockPattern(): boolean {
    if (!contentRef.value) return false;

    const block = getTargetBlock(contentRef, selection);
    if (!block) return false;

    // Only convert paragraphs, divs, or headings - not existing code blocks or list items
    if (!isConvertibleBlock(block)) return false;

    // Get the text content of the block
    const textContent = block.textContent || "";

    // Check for code fence pattern
    const pattern = detectCodeFenceStart(textContent);
    if (!pattern) return false;

    // Pattern detected - convert to code block wrapper
    const language = pattern.language || "";

    const { wrapper, id } = createCodeBlockWrapper("", language);

    // Register in state
    codeBlocks.set(id, {
      id,
      content: "",
      language,
    });

    // Replace block with wrapper
    block.parentNode?.replaceChild(wrapper, block);

    // Mark this code block for focus when it mounts
    // The useCodeBlockManager will call handleCodeBlockMounted after mounting
    pendingFocusIds.add(id);

    // Notify of content change
    onContentChange();

    return true;
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
