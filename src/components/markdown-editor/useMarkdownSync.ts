import { onUnmounted, Ref, ref } from "vue";
import { htmlToMarkdown, renderMarkdown } from "../../shared/markdown";
import type { CustomElementProcessor } from "../../shared/markdown";
import { CodeBlockState } from "./useCodeBlocks";
import { TokenRenderer, TokenState } from "./types";

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

/** Code block state lookup function type */
type CodeBlockLookup = (id: string) => CodeBlockState | undefined;

/** Code block registration function type */
type CodeBlockRegister = (id: string, content: string, language: string) => void;

/** Token state lookup function type */
type TokenLookup = (id: string) => TokenState | undefined;

/** Token registration function type */
type TokenRegister = (id: string, rendererId: string, groups: string[]) => void;

/**
 * Generate a unique ID for code blocks
 */
function generateCodeBlockId(): string {
  return `cb-${crypto.randomUUID()}`;
}

/**
 * Convert <pre><code> elements in HTML string to code block wrapper structure.
 * This allows CodeBlockManager to mount CodeViewer instances.
 */
function convertCodeBlocksToWrappers(html: string, registerCodeBlock?: CodeBlockRegister): string {
  // Parse the HTML
  const temp = document.createElement("div");
  temp.innerHTML = html;

  // Find all <pre> elements (code blocks)
  const preElements = temp.querySelectorAll("pre");

  for (const pre of Array.from(preElements)) {
    // Get the code element inside
    const codeElement = pre.querySelector("code");
    if (!codeElement) continue;

    // Extract content and language
    const content = codeElement.textContent || "";
    const langMatch = codeElement.className.match(/language-(\w+)/);
    const language = langMatch ? langMatch[1]! : "";

    // Generate unique ID
    const id = generateCodeBlockId();

    // Register in state if callback provided
    if (registerCodeBlock) {
      registerCodeBlock(id, content, language);
    }

    // Create wrapper structure
    const wrapper = document.createElement("div");
    wrapper.className = "code-block-wrapper";
    wrapper.setAttribute("contenteditable", "false");
    wrapper.setAttribute("data-code-block-id", id);

    // Create mount point for CodeViewer
    const mountPoint = document.createElement("div");
    mountPoint.className = "code-viewer-mount-point";
    mountPoint.setAttribute("data-content", content);
    mountPoint.setAttribute("data-language", language);
    wrapper.appendChild(mountPoint);

    // Replace the <pre> with the wrapper
    pre.parentNode?.replaceChild(wrapper, pre);
  }

  return temp.innerHTML;
}

/**
 * Generate a unique ID for tokens
 */
function generateTokenId(): string {
  return `tok-${crypto.randomUUID()}`;
}

/**
 * Convert token patterns in HTML string to token wrapper structures.
 * This allows TokenManager to mount custom Vue components for tokens.
 *
 * Tokens are matched against renderer patterns and converted to:
 * <span class="custom-token-wrapper" contenteditable="false"
 *       data-token-id="tok-uuid" data-token-renderer="renderer-id"
 *       data-token-groups='["group1","group2"]'>
 *   <span class="token-mount-point"></span>
 * </span>
 */
function convertTokensToWrappers(
  html: string,
  tokenRenderers?: TokenRenderer[],
  registerToken?: TokenRegister
): string {
  if (!tokenRenderers || tokenRenderers.length === 0) {
    return html;
  }

  let result = html;

  for (const renderer of tokenRenderers) {
    // Reset regex lastIndex since we're using global flag
    renderer.pattern.lastIndex = 0;

    // Create a new regex for each iteration to avoid issues with global flag state
    const pattern = new RegExp(renderer.pattern.source, renderer.pattern.flags);

    result = result.replace(pattern, (_match, ...args) => {
      // Extract captured groups (args before the last two which are offset and full string)
      const groups = args.slice(0, -2).filter((g) => g !== undefined) as string[];

      // Generate unique ID for this token instance
      const id = generateTokenId();

      // Register token in state if callback provided
      if (registerToken) {
        registerToken(id, renderer.id, groups);
      }

      // Create wrapper HTML structure
      const groupsJson = JSON.stringify(groups);
      return `<span class="custom-token-wrapper" contenteditable="false" data-token-id="${id}" data-token-renderer="${renderer.id}" data-token-groups='${groupsJson}'><span class="token-mount-point"></span></span>`;
    });
  }

  return result;
}

/**
 * Build a custom element processor for the editor.
 * Handles code block wrappers (looking up content from reactive state) and
 * token wrappers (looking up token state and calling renderer's toMarkdown).
 */
function buildEditorElementProcessor(
  getCodeBlockById?: CodeBlockLookup,
  tokenRenderers?: TokenRenderer[],
  getTokenById?: TokenLookup
): CustomElementProcessor | undefined {
  if (!getCodeBlockById && !tokenRenderers?.length) return undefined;

  return (element: Element): string | null => {
    // Handle code block wrappers — look up content from reactive state
    const codeBlockId = element.getAttribute("data-code-block-id");
    if (codeBlockId && getCodeBlockById) {
      const state = getCodeBlockById(codeBlockId);
      if (state) {
        const lang = state.language || "";
        const content = (state.content || "").replace(/\u200B/g, "");
        return `\`\`\`${lang}\n${content}\n\`\`\`\n\n`;
      }
    }

    // Handle token wrappers — look up token state and call renderer's toMarkdown
    const tokenId = element.getAttribute("data-token-id");
    if (tokenId && tokenRenderers && getTokenById) {
      const state = getTokenById(tokenId);
      if (state) {
        const renderer = tokenRenderers.find((r) => r.id === state.rendererId);
        if (renderer) {
          return renderer.toMarkdown(element as HTMLElement);
        }
      }
    }

    // Not handled — let the shared htmlToMarkdown process it
    return null;
  };
}

/**
 * Composable for bidirectional markdown <-> HTML synchronization
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
  // Flag to track when changes originate from the editor itself (vs external prop changes)
  // This prevents cursor jumping when the watch triggers setMarkdown after internal edits
  const isInternalUpdate = ref(false);
  let syncTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Convert markdown to HTML and update rendered content.
   * Code blocks are converted to wrapper structures for CodeViewer mounting.
   * Token patterns are converted to wrapper structures for TokenManager mounting.
   */
  function syncFromMarkdown(markdown: string): void {
    let html = renderMarkdown(markdown);
    // Convert <pre><code> to code block wrappers so CodeBlockManager can mount CodeViewer
    html = convertCodeBlocksToWrappers(html, registerCodeBlock);
    // Convert token patterns to wrappers so TokenManager can mount custom components
    html = convertTokensToWrappers(html, tokenRenderers, registerToken);
    renderedHtml.value = html;
  }

  // Build custom element processor for editor-specific elements (code blocks, tokens)
  const customElementProcessor = buildEditorElementProcessor(
    getCodeBlockById,
    tokenRenderers,
    getTokenById
  );

  /**
   * Convert HTML from content element back to markdown and emit
   */
  function syncFromHtml(): void {
    if (!contentRef.value) return;

    const markdown = htmlToMarkdown(contentRef.value, { customElementProcessor });

    // Mark as internal update before emitting to prevent watch from triggering setMarkdown
    isInternalUpdate.value = true;
    onEmitValue(markdown);
  }

  /**
   * Debounced version of syncFromHtml for input handling
   */
  function debouncedSyncFromHtml(): void {
    if (syncTimeout) {
      clearTimeout(syncTimeout);
    }
    syncTimeout = setTimeout(() => {
      syncFromHtml();
    }, debounceMs);
  }

  // Cleanup on unmount
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
