/**
 * HTML block-level element to markdown converter
 * Main dispatcher that converts block elements (paragraphs, code blocks, blockquotes,
 * lists, tables, divs, spans) by delegating to specialized converters
 */

import type { CustomElementProcessor } from "./index";
import { convertHeading, isHeadingElement } from "./convertHeadings";
import { processInlineContent, stripZeroWidthSpaces } from "./convertInline";
import { processListItems } from "./convertLists";
import { processTable } from "./convertTables";

/**
 * Convert a single DOM node and its children to markdown.
 * Acts as the main dispatcher: identifies each child element's type
 * and delegates to the appropriate specialized converter.
 */
export function processNode(node: Node, customProcessor?: CustomElementProcessor): string {
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
          parts.push(`${processInlineContent(element, customProcessor)}\n\n`);
          break;

        // Line breaks
        case "br":
          parts.push("  \n");
          break;

        // Bold
        case "strong":
        case "b": {
          const content = processInlineContent(element, customProcessor);
          if (content) {
            parts.push(`**${content}**`);
          }
          break;
        }

        // Italic
        case "em":
        case "i": {
          const content = processInlineContent(element, customProcessor);
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
          parts.push(processListItems(element, "-", customProcessor));
          break;

        // Ordered lists
        case "ol":
          parts.push(processListItems(element, "1.", customProcessor));
          break;

        // List items (handled by processListItems)
        case "li":
          parts.push(processInlineContent(element, customProcessor));
          break;

        // Links
        case "a": {
          const href = element.getAttribute("href") || "";
          const text = processInlineContent(element, customProcessor);
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
          const content = processInlineContent(element, customProcessor);
          if (content) {
            parts.push(`~~${content}~~`);
          }
          break;
        }

        // Highlight
        case "mark": {
          const content = processInlineContent(element, customProcessor);
          if (content) {
            parts.push(`==${content}==`);
          }
          break;
        }

        // Superscript
        case "sup": {
          const content = processInlineContent(element, customProcessor);
          if (content) {
            parts.push(`^${content}^`);
          }
          break;
        }

        // Subscript
        case "sub": {
          const content = processInlineContent(element, customProcessor);
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
          // Default: process children
          else {
            parts.push(processNode(element, customProcessor));
          }
          break;
        }

        // Tables
        case "table":
          parts.push(processTable(element, customProcessor));
          break;

        default:
          // Unknown elements - just get text content
          parts.push(processNode(element, customProcessor));
      }
    }
  }

  return parts.join("");
}
