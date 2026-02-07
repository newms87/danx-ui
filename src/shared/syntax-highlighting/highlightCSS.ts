/**
 * Lightweight syntax highlighting for CSS
 * Returns HTML string with syntax highlighting spans
 * Uses character-by-character tokenization for accurate parsing
 */

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
 * CSS parsing context states
 */
type CSSContext = "selector" | "property" | "value" | "at-rule";

/**
 * Highlight CSS syntax by tokenizing character-by-character
 * This prevents issues with regex replacing content inside already-matched strings
 */
export function highlightCSS(code: string): string {
  if (!code) return "";

  const result: string[] = [];
  let i = 0;
  let context: CSSContext = "selector";
  let buffer = "";
  // Track brace depth for nested blocks (e.g., @media)
  let braceDepth = 0;
  // Track if we're inside an at-rule name
  let inAtRuleName = false;

  /**
   * Flush the current buffer with appropriate highlighting
   */
  function flushBuffer(): void {
    if (!buffer) return;

    const trimmed = buffer.trim();
    if (!trimmed) {
      // Whitespace only - just escape and add
      result.push(escapeHtml(buffer));
      buffer = "";
      return;
    }

    // Determine what type of content this is based on context
    switch (context) {
      case "selector":
        result.push(`<span class="syntax-selector">${escapeHtml(buffer)}</span>`);
        break;
      case "property":
        result.push(`<span class="syntax-property">${escapeHtml(buffer)}</span>`);
        break;
      case "value":
        result.push(`<span class="syntax-value">${escapeHtml(buffer)}</span>`);
        break;
      case "at-rule":
        result.push(`<span class="syntax-at-rule">${escapeHtml(buffer)}</span>`);
        break;
    }
    buffer = "";
  }

  while (i < code.length) {
    const char = code[i];

    // Handle comments: /* ... */
    if (char === "/" && code[i + 1] === "*") {
      flushBuffer();
      const startIndex = i;
      i += 2; // Skip /*

      // Find closing */
      while (i < code.length) {
        if (code[i]! === "*" && code[i + 1]! === "/") {
          i += 2; // Include */
          break;
        }
        i++;
      }

      const comment = code.slice(startIndex, i);
      result.push(`<span class="syntax-comment">${escapeHtml(comment)}</span>`);
      continue;
    }

    // Handle strings (single or double quoted)
    if (char === '"' || char === "'") {
      flushBuffer();
      const quoteChar = char;
      const startIndex = i;
      i++; // Skip opening quote

      // Find closing quote, handling escape sequences
      while (i < code.length) {
        if (code[i] === "\\" && i + 1 < code.length) {
          i += 2; // Skip escaped character
        } else if (code[i] === quoteChar) {
          i++; // Include closing quote
          break;
        } else {
          i++;
        }
      }

      const str = code.slice(startIndex, i);
      result.push(`<span class="syntax-string">${escapeHtml(str)}</span>`);
      continue;
    }

    // Handle at-rules: @media, @import, @keyframes, etc.
    if (char === "@") {
      flushBuffer();
      buffer = "@";
      i++;
      inAtRuleName = true;
      context = "at-rule";
      continue;
    }

    // If we're building an at-rule name, continue until whitespace or {
    if (inAtRuleName) {
      if (/\s/.test(char!) || char === "{" || char === ";") {
        flushBuffer();
        inAtRuleName = false;
        // Don't increment i, let the character be processed normally
        // After at-rule name, we're in selector context (for params) until { or ;
        context = "selector";
      } else {
        buffer += char;
        i++;
        continue;
      }
    }

    // Handle opening brace
    if (char === "{") {
      flushBuffer();
      result.push(`<span class="syntax-punctuation">${escapeHtml(char)}</span>`);
      braceDepth++;
      // After {, we're in property context
      context = "property";
      i++;
      continue;
    }

    // Handle closing brace
    if (char === "}") {
      flushBuffer();
      result.push(`<span class="syntax-punctuation">${escapeHtml(char)}</span>`);
      braceDepth--;
      // After }, we're back to selector context
      context = "selector";
      i++;
      continue;
    }

    // Handle colon (property: value separator)
    if (char === ":") {
      // Check if this is a pseudo-selector (::before, :hover, etc.)
      // A colon is a pseudo-selector if we're in selector context
      if (context === "selector") {
        // This is part of a selector (pseudo-class/element)
        buffer += char;
        i++;
        continue;
      }
      // Otherwise it's a property-value separator
      flushBuffer();
      result.push(`<span class="syntax-punctuation">${escapeHtml(char)}</span>`);
      // After :, we're in value context
      context = "value";
      i++;
      continue;
    }

    // Handle semicolon (declaration terminator)
    if (char === ";") {
      flushBuffer();
      result.push(`<span class="syntax-punctuation">${escapeHtml(char)}</span>`);
      // After ;, we're back to property context (still inside braces)
      if (braceDepth > 0) {
        context = "property";
      } else {
        context = "selector";
      }
      i++;
      continue;
    }

    // Handle comma
    if (char === ",") {
      flushBuffer();
      result.push(`<span class="syntax-punctuation">${escapeHtml(char)}</span>`);
      i++;
      continue;
    }

    // Handle parentheses (for functions like url(), rgb(), etc.)
    if (char === "(" || char === ")") {
      flushBuffer();
      result.push(`<span class="syntax-punctuation">${escapeHtml(char)}</span>`);
      i++;
      continue;
    }

    // Handle whitespace
    if (/\s/.test(char!)) {
      // If buffer has content, flush it first
      if (buffer.trim()) {
        flushBuffer();
      }
      // Add whitespace directly
      result.push(escapeHtml(char!));
      i++;
      continue;
    }

    // Accumulate regular characters into buffer
    buffer += char;
    i++;
  }

  // Flush any remaining buffer
  flushBuffer();

  return result.join("");
}
