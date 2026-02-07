/**
 * Token renderer orchestrator
 * Renders block tokens to HTML
 */

import type { BlockToken } from "../types";
import { parseInline } from "../parseInline";
import { escapeHtml } from "../escapeHtml";
import { tokenizeBlocks } from "../tokenize";
import { renderUnorderedList, renderOrderedList, renderTaskList } from "./renderList";
import { renderTable } from "./renderTable";

/**
 * Render tokens to HTML
 */
export function renderTokens(tokens: BlockToken[], sanitize: boolean): string {
  const htmlParts: string[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case "heading": {
        const content = parseInline(token.content, sanitize);
        htmlParts.push(`<h${token.level}>${content}</h${token.level}>`);
        break;
      }

      case "code_block": {
        // Always escape code block content for safety
        const escapedContent = escapeHtml(token.content);
        const langAttr = token.language ? ` class="language-${escapeHtml(token.language)}"` : "";
        htmlParts.push(`<pre><code${langAttr}>${escapedContent}</code></pre>`);
        break;
      }

      case "blockquote": {
        // Recursively parse blockquote content
        const innerTokens = tokenizeBlocks(token.content);
        const innerHtml = renderTokens(innerTokens, sanitize);
        htmlParts.push(`<blockquote>${innerHtml}</blockquote>`);
        break;
      }

      case "ul": {
        htmlParts.push(renderUnorderedList(token, sanitize, renderTokens));
        break;
      }

      case "ol": {
        htmlParts.push(renderOrderedList(token, sanitize, renderTokens));
        break;
      }

      case "task_list": {
        htmlParts.push(renderTaskList(token, sanitize));
        break;
      }

      case "table": {
        htmlParts.push(renderTable(token, sanitize));
        break;
      }

      case "dl": {
        let dlHtml = "<dl>";
        for (const item of token.items) {
          dlHtml += `<dt>${parseInline(item.term, sanitize)}</dt>`;
          for (const def of item.definitions) {
            dlHtml += `<dd>${parseInline(def, sanitize)}</dd>`;
          }
        }
        dlHtml += "</dl>";
        htmlParts.push(dlHtml);
        break;
      }

      case "hr": {
        htmlParts.push("<hr />");
        break;
      }

      case "paragraph": {
        const content = parseInline(token.content, sanitize);
        // Convert single newlines to <br> within paragraphs
        const withBreaks = content.replace(/\n/g, "<br />");
        htmlParts.push(`<p>${withBreaks}</p>`);
        break;
      }
    }
  }

  return htmlParts.join("\n");
}
