/**
 * Sync Converters
 *
 * Pure transformation functions for converting between markdown and HTML
 * editor representations. Handles code block wrappers, token wrappers,
 * and the custom element processor for htmlToMarkdown.
 */

import type { CustomElementProcessor } from "../../shared/markdown";
import { CodeBlockState } from "./useCodeBlocks";
import { TokenRenderer, TokenState } from "./types";

export type CodeBlockLookup = (id: string) => CodeBlockState | undefined;
export type CodeBlockRegister = (id: string, content: string, language: string) => void;
export type TokenLookup = (id: string) => TokenState | undefined;
export type TokenRegister = (id: string, rendererId: string, groups: string[]) => void;

/** Generate a unique ID for code blocks */
export function generateCodeBlockId(): string {
  return `cb-${crypto.randomUUID()}`;
}

/** Generate a unique ID for tokens */
export function generateTokenId(): string {
  return `tok-${crypto.randomUUID()}`;
}

/**
 * Convert <pre><code> elements in HTML string to code block wrapper structure.
 * This allows CodeBlockManager to mount CodeViewer instances.
 */
export function convertCodeBlocksToWrappers(
  html: string,
  registerCodeBlock?: CodeBlockRegister
): string {
  const temp = document.createElement("div");
  temp.innerHTML = html;

  const preElements = temp.querySelectorAll("pre");

  for (const pre of Array.from(preElements)) {
    const codeElement = pre.querySelector("code");
    if (!codeElement) continue;

    const content = codeElement.textContent || "";
    const langMatch = codeElement.className.match(/language-(\w+)/);
    const language = langMatch ? langMatch[1]! : "";
    const isAutoDetected = codeElement.hasAttribute("autodetected");

    const id = generateCodeBlockId();

    if (registerCodeBlock) {
      registerCodeBlock(id, content, language);
    }

    const wrapper = document.createElement("div");
    wrapper.className = "code-block-wrapper";
    wrapper.setAttribute("contenteditable", "false");
    wrapper.setAttribute("data-code-block-id", id);

    const mountPoint = document.createElement("div");
    mountPoint.className = "code-viewer-mount-point";
    mountPoint.setAttribute("data-content", content);
    mountPoint.setAttribute("data-language", language);
    if (isAutoDetected) {
      mountPoint.setAttribute("data-auto-detected", "true");
    }
    wrapper.appendChild(mountPoint);

    pre.parentNode?.replaceChild(wrapper, pre);
  }

  return temp.innerHTML;
}

/**
 * Convert token patterns in HTML string to token wrapper structures.
 * This allows TokenManager to mount custom Vue components for tokens.
 */
export function convertTokensToWrappers(
  html: string,
  tokenRenderers?: TokenRenderer[],
  registerToken?: TokenRegister
): string {
  if (!tokenRenderers || tokenRenderers.length === 0) {
    return html;
  }

  let result = html;

  for (const renderer of tokenRenderers) {
    renderer.pattern.lastIndex = 0;

    const pattern = new RegExp(renderer.pattern.source, renderer.pattern.flags);

    result = result.replace(pattern, (_match, ...args) => {
      const groups = args.slice(0, -2).filter((g) => g !== undefined) as string[];
      const id = generateTokenId();

      if (registerToken) {
        registerToken(id, renderer.id, groups);
      }

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
export function buildEditorElementProcessor(
  getCodeBlockById?: CodeBlockLookup,
  tokenRenderers?: TokenRenderer[],
  getTokenById?: TokenLookup
): CustomElementProcessor | undefined {
  if (!getCodeBlockById && !tokenRenderers?.length) return undefined;

  return (element: Element): string | null => {
    const codeBlockId = element.getAttribute("data-code-block-id");
    if (codeBlockId && getCodeBlockById) {
      const state = getCodeBlockById(codeBlockId);
      if (state) {
        const lang = state.language || "";
        const content = (state.content || "").replace(/\u200B/g, "");
        return `\`\`\`${lang}\n${content}\n\`\`\`\n\n`;
      }
    }

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

    return null;
  };
}
