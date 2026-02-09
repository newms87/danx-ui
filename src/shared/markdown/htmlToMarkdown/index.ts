/**
 * HTML to Markdown converter
 * Converts HTML content back to markdown source
 */

import { convertHeading, isHeadingElement } from "./convertHeadings";

/**
 * Custom element processor for extending htmlToMarkdown.
 * If the processor returns a string, that string is used as the markdown for the element.
 * If it returns null, the default processing is used.
 */
export type CustomElementProcessor = (element: Element) => string | null;

/**
 * Options for htmlToMarkdown
 */
export interface HtmlToMarkdownOptions {
  /** Optional processor for custom element types (e.g., code block wrappers, token wrappers) */
  customElementProcessor?: CustomElementProcessor;
}

/**
 * Characters that have special meaning in markdown and may need escaping
 */
const MARKDOWN_SPECIAL_CHARS = /([\\`*_{}[\]()#+\-.!])/g;

/**
 * Escape markdown special characters in text
 * @param text - Plain text that may contain special characters
 * @returns Text with special characters escaped
 */
export function escapeMarkdownChars(text: string): string {
  return text.replace(MARKDOWN_SPECIAL_CHARS, "\\$1");
}

/**
 * Strip zero-width spaces from text content
 * These are inserted by the inline formatting toggle to break out of formatting context
 */
function stripZeroWidthSpaces(text: string): string {
  return text.replace(/\u200B/g, "");
}

/**
 * Process inline content (text with inline formatting)
 * Handles nested inline elements like bold, italic, code, links
 */
function processInlineContent(element: Element): string {
  const parts: string[] = [];

  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      // Strip zero-width spaces from text nodes
      parts.push(stripZeroWidthSpaces(child.textContent || ""));
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      const tagName = el.tagName.toLowerCase();

      // Handle color-preview spans - skip the swatch, return only the hex code text
      if (tagName === "span" && el.classList.contains("color-preview")) {
        // Get text content directly, skipping the color-swatch span
        parts.push(el.textContent || "");
        continue;
      }

      // Skip color-swatch spans entirely (they're purely decorative)
      if (tagName === "span" && el.classList.contains("color-swatch")) {
        continue;
      }

      const content = processInlineContent(el);

      // Skip empty formatting elements
      if (
        !content &&
        ["strong", "b", "em", "i", "code", "del", "s", "mark", "sup", "sub"].includes(tagName)
      ) {
        continue;
      }

      switch (tagName) {
        case "strong":
        case "b":
          parts.push(`**${content}**`);
          break;
        case "em":
        case "i":
          parts.push(`*${content}*`);
          break;
        case "code":
          parts.push(`\`${el.textContent || ""}\``);
          break;
        case "a": {
          const href = el.getAttribute("href") || "";
          parts.push(`[${content}](${href})`);
          break;
        }
        case "img": {
          const src = el.getAttribute("src") || "";
          const alt = el.getAttribute("alt") || "";
          parts.push(`![${alt}](${src})`);
          break;
        }
        case "del":
        case "s":
          parts.push(`~~${content}~~`);
          break;
        case "mark":
          parts.push(`==${content}==`);
          break;
        case "sup":
          parts.push(`^${content}^`);
          break;
        case "sub":
          parts.push(`~${content}~`);
          break;
        case "br":
          parts.push("  \n");
          break;
        default:
          parts.push(content);
      }
    }
  }

  return parts.join("");
}

/**
 * Process list items with proper markers
 */
function processListItems(listElement: Element, marker: string): string {
  const items: string[] = [];
  let index = 1;

  for (const child of Array.from(listElement.children)) {
    if (child.tagName.toLowerCase() === "li") {
      const prefix = marker === "1." ? `${index}. ` : `${marker} `;
      const content = processInlineContent(child);

      // Check for nested lists
      const nestedUl = child.querySelector("ul");
      const nestedOl = child.querySelector("ol");

      if (nestedUl || nestedOl) {
        // Get text content before nested list
        const textParts: string[] = [];
        for (const node of Array.from(child.childNodes)) {
          if (node.nodeType === Node.TEXT_NODE) {
            textParts.push(node.textContent || "");
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element;
            if (el.tagName.toLowerCase() !== "ul" && el.tagName.toLowerCase() !== "ol") {
              textParts.push(processInlineContent(el));
            }
          }
        }
        items.push(`${prefix}${textParts.join("").trim()}`);

        // Process nested list with indentation
        if (nestedUl) {
          const nestedItems = processListItems(nestedUl, "-").split("\n").filter(Boolean);
          items.push(...nestedItems.map((item) => `  ${item}`));
        }
        if (nestedOl) {
          const nestedItems = processListItems(nestedOl, "1.").split("\n").filter(Boolean);
          items.push(...nestedItems.map((item) => `  ${item}`));
        }
      } else {
        items.push(`${prefix}${content}`);
      }

      index++;
    }
  }

  return items.join("\n") + "\n\n";
}

/**
 * Process table element to markdown
 */
function processTable(table: Element): string {
  const rows: string[][] = [];
  const alignments: string[] = [];

  // Process thead
  const thead = table.querySelector("thead");
  if (thead) {
    const headerRow = thead.querySelector("tr");
    if (headerRow) {
      const cells: string[] = [];
      for (const th of Array.from(headerRow.querySelectorAll("th"))) {
        cells.push(processInlineContent(th).trim());
        // Detect alignment from style or class
        const style = th.getAttribute("style") || "";
        if (style.includes("text-align: center")) {
          alignments.push(":---:");
        } else if (style.includes("text-align: right")) {
          alignments.push("---:");
        } else {
          alignments.push("---");
        }
      }
      rows.push(cells);
    }
  }

  // Process tbody
  const tbody = table.querySelector("tbody") || table;
  for (const tr of Array.from(tbody.querySelectorAll("tr"))) {
    if (thead && tr.parentElement === thead) continue;
    const cells: string[] = [];
    for (const td of Array.from(tr.querySelectorAll("td, th"))) {
      cells.push(processInlineContent(td).trim());
    }
    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  if (rows.length === 0) return "";

  // Build markdown table
  const lines: string[] = [];

  // Header row
  if (rows.length > 0) {
    lines.push(`| ${rows[0]!.join(" | ")} |`);
    // Separator with alignments
    if (alignments.length > 0) {
      lines.push(`| ${alignments.join(" | ")} |`);
    } else {
      lines.push(`| ${rows[0]!.map(() => "---").join(" | ")} |`);
    }
  }

  // Data rows
  for (let i = 1; i < rows.length; i++) {
    lines.push(`| ${rows[i]!.join(" | ")} |`);
  }

  return lines.join("\n") + "\n\n";
}

/**
 * Convert a single node to markdown
 */
function processNode(node: Node, customProcessor?: CustomElementProcessor): string {
  const parts: string[] = [];

  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      // Strip zero-width spaces from text nodes
      parts.push(stripZeroWidthSpaces(child.textContent || ""));
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const element = child as Element;
      const tagName = element.tagName.toLowerCase();

      // Try custom processor first — allows callers to handle special elements
      if (customProcessor) {
        const result = customProcessor(element);
        if (result !== null) {
          parts.push(result);
          continue;
        }
      }

      // Handle headings
      if (isHeadingElement(element)) {
        parts.push(convertHeading(element));
        continue;
      }

      switch (tagName) {
        // Paragraphs
        case "p":
          parts.push(`${processInlineContent(element)}\n\n`);
          break;

        // Line breaks
        case "br":
          parts.push("  \n");
          break;

        // Bold
        case "strong":
        case "b": {
          const content = processInlineContent(element);
          if (content) {
            parts.push(`**${content}**`);
          }
          break;
        }

        // Italic
        case "em":
        case "i": {
          const content = processInlineContent(element);
          if (content) {
            parts.push(`*${content}*`);
          }
          break;
        }

        // Inline code
        case "code":
          if (element.parentElement?.tagName.toLowerCase() !== "pre") {
            parts.push(`\`${element.textContent || ""}\``);
          } else {
            parts.push(element.textContent || "");
          }
          break;

        // Code blocks
        case "pre": {
          const codeElement = element.querySelector("code");
          const code = codeElement?.textContent || element.textContent || "";
          const langClass = codeElement?.className.match(/language-(\w+)/);
          const lang = langClass ? langClass[1] : "";
          parts.push(`\`\`\`${lang}\n${code}\n\`\`\`\n\n`);
          break;
        }

        // Blockquotes
        case "blockquote": {
          const content = processNode(element, customProcessor).trim();
          const quotedLines = content
            .split("\n")
            .map((line) => `> ${line}`)
            .join("\n");
          parts.push(`${quotedLines}\n\n`);
          break;
        }

        // Unordered lists
        case "ul":
          parts.push(processListItems(element, "-"));
          break;

        // Ordered lists
        case "ol":
          parts.push(processListItems(element, "1."));
          break;

        // List items (handled by processListItems)
        case "li":
          parts.push(processInlineContent(element));
          break;

        // Links
        case "a": {
          const href = element.getAttribute("href") || "";
          const text = processInlineContent(element);
          parts.push(`[${text}](${href})`);
          break;
        }

        // Images
        case "img": {
          const src = element.getAttribute("src") || "";
          const alt = element.getAttribute("alt") || "";
          parts.push(`![${alt}](${src})`);
          break;
        }

        // Horizontal rules
        case "hr":
          parts.push("---\n\n");
          break;

        // Strikethrough
        case "del":
        case "s": {
          const content = processInlineContent(element);
          if (content) {
            parts.push(`~~${content}~~`);
          }
          break;
        }

        // Highlight
        case "mark": {
          const content = processInlineContent(element);
          if (content) {
            parts.push(`==${content}==`);
          }
          break;
        }

        // Superscript
        case "sup": {
          const content = processInlineContent(element);
          if (content) {
            parts.push(`^${content}^`);
          }
          break;
        }

        // Subscript
        case "sub": {
          const content = processInlineContent(element);
          if (content) {
            parts.push(`~${content}~`);
          }
          break;
        }

        // Divs - check for code block wrapper first
        case "div": {
          // Handle code block wrapper structure
          if (element.hasAttribute("data-code-block-id")) {
            const mountPoint = element.querySelector(".code-viewer-mount-point");
            const content = mountPoint?.getAttribute("data-content") || "";
            const language = mountPoint?.getAttribute("data-language") || "";
            parts.push(`\`\`\`${language}\n${content}\n\`\`\`\n\n`);
          } else {
            parts.push(processNode(element, customProcessor));
          }
          break;
        }

        // Spans - handle special cases first
        case "span": {
          // Color preview: return only the hex color text
          if (element.classList.contains("color-preview")) {
            parts.push(element.textContent || "");
          }
          // Color swatch: skip entirely (purely decorative)
          else if (element.classList.contains("color-swatch")) {
            // Skip - don't output anything
          }
          // Default: process children
          else {
            parts.push(processNode(element, customProcessor));
          }
          break;
        }

        // Tables
        case "table":
          parts.push(processTable(element));
          break;

        default:
          // Unknown elements - just get text content
          parts.push(processNode(element, customProcessor));
      }
    }
  }

  return parts.join("");
}

/**
 * Convert HTML content to markdown.
 * Supports custom element processing via options.customElementProcessor for
 * handling application-specific elements (e.g., code block wrappers with reactive state,
 * custom token wrappers).
 * @param html - HTML string or HTMLElement
 * @param options - Optional configuration
 * @returns Markdown string
 */
export function htmlToMarkdown(html: string | HTMLElement, options?: HtmlToMarkdownOptions): string {
  let container: HTMLElement;

  if (typeof html === "string") {
    // Create a temporary element to parse the HTML
    container = document.createElement("div");
    container.innerHTML = html;
  } else {
    container = html;
  }

  const markdown = processNode(container, options?.customElementProcessor);

  // Clean up extra whitespace - normalize multiple newlines to max 2
  // Also strip any remaining zero-width spaces as a safety net
  return stripZeroWidthSpaces(markdown)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Re-export heading utilities
export { convertHeading, isHeadingElement, getHeadingLevel } from "./convertHeadings";
