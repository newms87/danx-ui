/**
 * Lightweight syntax highlighting for HTML
 * Returns HTML string with syntax highlighting spans
 * Supports embedded CSS (<style>) and JavaScript (<script>) highlighting
 */

import { highlightCSS } from "./highlightCSS";
import { highlightJavaScript } from "./highlightJavaScript";

/**
 * Escape HTML entities to prevent XSS
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * HTML parsing states
 */
type HTMLState =
  | "text"
  | "tag-open"
  | "tag-name"
  | "attribute-name"
  | "attribute-equals"
  | "attribute-value"
  | "tag-close"
  | "comment"
  | "doctype";

/**
 * Highlight HTML syntax by tokenizing character-by-character
 * Delegates to CSS and JavaScript highlighters for embedded content
 */
export function highlightHTML(code: string): string {
  if (!code) return "";

  const result: string[] = [];
  let i = 0;
  let state: HTMLState = "text";
  let buffer = "";
  let currentTagName = "";
  let inClosingTag = false;
  let quoteChar = "";

  /**
   * Flush the current buffer with appropriate highlighting
   */
  function flushBuffer(className?: string): void {
    if (!buffer) return;

    if (className) {
      result.push(`<span class="${className}">${escapeHtml(buffer)}</span>`);
    } else {
      result.push(escapeHtml(buffer));
    }
    buffer = "";
  }

  /**
   * Find the closing tag for style or script
   * Returns the index of the closing tag or -1 if not found
   */
  function findClosingTag(tagName: string, startIndex: number): number {
    const closePattern = new RegExp(`<\\s*/\\s*${tagName}\\s*>`, "i");
    const remaining = code.slice(startIndex);
    const match = remaining.match(closePattern);
    if (match && match.index !== undefined) {
      return startIndex + match.index;
    }
    return -1;
  }

  while (i < code.length) {
    const char = code[i];

    // Handle comments: <!-- ... -->
    if (state === "text" && code.slice(i, i + 4) === "<!--") {
      flushBuffer();
      const startIndex = i;
      i += 4; // Skip <!--

      // Find closing -->
      while (i < code.length) {
        if (code.slice(i, i + 3) === "-->") {
          i += 3; // Include -->
          break;
        }
        i++;
      }

      const comment = code.slice(startIndex, i);
      result.push(`<span class="syntax-comment">${escapeHtml(comment)}</span>`);
      continue;
    }

    // Handle DOCTYPE: <!DOCTYPE ...>
    if (state === "text" && code.slice(i, i + 9).toUpperCase() === "<!DOCTYPE") {
      flushBuffer();
      const startIndex = i;

      // Find closing >
      while (i < code.length && code[i] !== ">") {
        i++;
      }
      if (code[i] === ">") i++; // Include >

      const doctype = code.slice(startIndex, i);
      result.push(`<span class="syntax-doctype">${escapeHtml(doctype)}</span>`);
      continue;
    }

    // Handle CDATA sections: <![CDATA[ ... ]]>
    if (state === "text" && code.slice(i, i + 9) === "<![CDATA[") {
      flushBuffer();
      const startIndex = i;
      i += 9; // Skip <![CDATA[

      // Find closing ]]>
      while (i < code.length) {
        if (code.slice(i, i + 3) === "]]>") {
          i += 3; // Include ]]>
          break;
        }
        i++;
      }

      const cdata = code.slice(startIndex, i);
      result.push(`<span class="syntax-comment">${escapeHtml(cdata)}</span>`);
      continue;
    }

    // Handle tag opening: <
    if (state === "text" && char === "<") {
      flushBuffer();
      buffer = "<";
      i++;

      // Check for closing tag
      if (code[i] === "/") {
        inClosingTag = true;
        buffer += "/";
        i++;
      } else {
        inClosingTag = false;
      }

      state = "tag-name";
      currentTagName = "";
      continue;
    }

    // Handle tag name
    if (state === "tag-name") {
      if (/[a-zA-Z0-9-]/.test(char!)) {
        buffer += char!;
        currentTagName += char!.toLowerCase();
        i++;
        continue;
      }

      // Tag name complete
      flushBuffer("syntax-tag");

      // Check for style or script tags (only opening tags)
      if (!inClosingTag && (currentTagName === "style" || currentTagName === "script")) {
        // Find the end of the opening tag
        let tagEndIndex = i;
        while (tagEndIndex < code.length && code[tagEndIndex] !== ">") {
          tagEndIndex++;
        }
        tagEndIndex++; // Include >

        // Highlight the rest of the opening tag (attributes)
        const tagRemainder = code.slice(i, tagEndIndex);
        result.push(highlightHTMLAttributes(tagRemainder));
        i = tagEndIndex;

        // Find the closing tag
        const closingTagIndex = findClosingTag(currentTagName, i);

        if (closingTagIndex !== -1) {
          // Extract and highlight the embedded content
          const embeddedContent = code.slice(i, closingTagIndex);

          if (currentTagName === "style") {
            result.push(highlightCSS(embeddedContent));
          } else if (currentTagName === "script") {
            result.push(highlightJavaScript(embeddedContent));
          }

          i = closingTagIndex;
        }

        state = "text";
        continue;
      }

      if (/\s/.test(char!)) {
        result.push(escapeHtml(char!));
        i++;
        state = "attribute-name";
      } else if (char === ">") {
        result.push(`<span class="syntax-tag">${escapeHtml(char!)}</span>`);
        i++;
        state = "text";
      } else if (char === "/" && code[i + 1] === ">") {
        result.push(`<span class="syntax-tag">/&gt;</span>`);
        i += 2;
        state = "text";
      } else {
        state = "attribute-name";
      }
      continue;
    }

    // Handle attribute name
    if (state === "attribute-name") {
      if (/\s/.test(char!)) {
        flushBuffer("syntax-attribute");
        result.push(escapeHtml(char!));
        i++;
        continue;
      }

      if (char === "=") {
        flushBuffer("syntax-attribute");
        result.push(`<span class="syntax-punctuation">=</span>`);
        i++;
        state = "attribute-equals";
        continue;
      }

      if (char === ">") {
        flushBuffer("syntax-attribute");
        result.push(`<span class="syntax-tag">&gt;</span>`);
        i++;
        state = "text";
        continue;
      }

      if (char === "/" && code[i + 1] === ">") {
        flushBuffer("syntax-attribute");
        result.push(`<span class="syntax-tag">/&gt;</span>`);
        i += 2;
        state = "text";
        continue;
      }

      if (/[a-zA-Z0-9\-_:@.]/.test(char!)) {
        buffer += char!;
        i++;
        continue;
      }

      // Unknown character in attribute context
      flushBuffer("syntax-attribute");
      result.push(escapeHtml(char!));
      i++;
      continue;
    }

    // Handle after equals sign (before attribute value)
    if (state === "attribute-equals") {
      if (/\s/.test(char!)) {
        result.push(escapeHtml(char!));
        i++;
        continue;
      }

      if (char === '"' || char === "'") {
        quoteChar = char!;
        buffer = char!;
        i++;
        state = "attribute-value";
        continue;
      }

      // Unquoted attribute value
      if (char !== ">" && char !== "/") {
        buffer = "";
        state = "attribute-value";
        quoteChar = "";
        continue;
      }

      // No value, go back to attribute name state
      state = "attribute-name";
      continue;
    }

    // Handle attribute value
    if (state === "attribute-value") {
      if (quoteChar) {
        // Quoted attribute value
        buffer += char!;
        i++;

        if (char === quoteChar) {
          flushBuffer("syntax-string");
          state = "attribute-name";
          quoteChar = "";
        }
        continue;
      } else {
        // Unquoted attribute value
        if (/\s/.test(char!) || char === ">" || (char === "/" && code[i + 1] === ">")) {
          flushBuffer("syntax-string");
          state = "attribute-name";
          continue;
        }

        buffer += char!;
        i++;
        continue;
      }
    }

    // Default text handling
    if (state === "text") {
      if (char === "<") {
        // Will be handled at the top of the loop
        continue;
      }

      buffer += char;
      i++;
    } else {
      // Unknown state, just advance
      buffer += char;
      i++;
    }
  }

  // Flush any remaining buffer
  if (buffer) {
    if (state === "text") {
      flushBuffer();
    } else if (state === "tag-name") {
      flushBuffer("syntax-tag");
    } else if (state === "attribute-name") {
      flushBuffer("syntax-attribute");
    } else if (state === "attribute-value") {
      flushBuffer("syntax-string");
    } else {
      flushBuffer();
    }
  }

  return result.join("");
}

/**
 * Highlight HTML attributes (everything between tag name and >)
 * This is a helper for processing the remainder of a tag after the name
 */
function highlightHTMLAttributes(code: string): string {
  if (!code) return "";

  const result: string[] = [];
  let i = 0;
  let state: "space" | "attribute-name" | "equals" | "value" = "space";
  let buffer = "";
  let quoteChar = "";

  while (i < code.length) {
    const char = code[i];

    // Handle end of tag
    if (char === ">" || (char === "/" && code[i + 1] === ">")) {
      // Flush buffer
      if (buffer) {
        if (state === "attribute-name") {
          result.push(`<span class="syntax-attribute">${escapeHtml(buffer)}</span>`);
        } else if (state === "value") {
          result.push(`<span class="syntax-string">${escapeHtml(buffer)}</span>`);
        } else {
          result.push(escapeHtml(buffer));
        }
        buffer = "";
      }

      if (char === "/" && code[i + 1] === ">") {
        result.push(`<span class="syntax-tag">/&gt;</span>`);
        i += 2;
      } else {
        result.push(`<span class="syntax-tag">&gt;</span>`);
        i++;
      }
      continue;
    }

    // Handle whitespace
    if (/\s/.test(char!) && state !== "value") {
      if (buffer && state === "attribute-name") {
        result.push(`<span class="syntax-attribute">${escapeHtml(buffer)}</span>`);
        buffer = "";
      }
      result.push(escapeHtml(char!));
      i++;
      state = "space";
      continue;
    }

    // Handle equals sign
    if (char === "=" && state !== "value") {
      if (buffer) {
        result.push(`<span class="syntax-attribute">${escapeHtml(buffer)}</span>`);
        buffer = "";
      }
      result.push(`<span class="syntax-punctuation">=</span>`);
      i++;
      state = "equals";
      continue;
    }

    // Handle quote start
    if ((char === '"' || char === "'") && (state === "equals" || state === "space")) {
      quoteChar = char!;
      buffer = char!;
      i++;
      state = "value";
      continue;
    }

    // Handle quoted value
    if (state === "value" && quoteChar) {
      buffer += char!;
      if (char === quoteChar) {
        result.push(`<span class="syntax-string">${escapeHtml(buffer)}</span>`);
        buffer = "";
        quoteChar = "";
        state = "space";
      }
      i++;
      continue;
    }

    // Handle unquoted value
    if (state === "value" && !quoteChar) {
      if (/\s/.test(char!)) {
        result.push(`<span class="syntax-string">${escapeHtml(buffer)}</span>`);
        buffer = "";
        result.push(escapeHtml(char!));
        state = "space";
        i++;
        continue;
      }
      buffer += char!;
      i++;
      continue;
    }

    // Attribute name
    if (state === "space" || state === "attribute-name") {
      buffer += char!;
      state = "attribute-name";
      i++;
      continue;
    }

    // Unquoted value after equals
    if (state === "equals") {
      buffer += char!;
      state = "value";
      i++;
      continue;
    }

    // Default
    result.push(escapeHtml(char!));
    i++;
  }

  // Flush remaining buffer
  if (buffer) {
    if (state === "attribute-name") {
      result.push(`<span class="syntax-attribute">${escapeHtml(buffer)}</span>`);
    } else if (state === "value") {
      result.push(`<span class="syntax-string">${escapeHtml(buffer)}</span>`);
    } else {
      result.push(escapeHtml(buffer));
    }
  }

  return result.join("");
}
