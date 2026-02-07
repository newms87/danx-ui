/**
 * Line pattern detection for markdown
 * Detects markdown patterns at the start of lines
 * Used for character sequence triggering in live editing
 */

export interface LinePattern {
  type: "heading" | "unordered-list" | "ordered-list" | "blockquote" | "code-block" | "hr";
  level?: number; // For headings (1-6)
  language?: string; // For code blocks
}

export interface HeadingPattern {
  level: number;
  content: string;
}

export interface ListPattern {
  type: "unordered" | "ordered";
  content: string;
}

export interface BlockquotePattern {
  content: string;
}

export interface CodeFencePattern {
  language: string;
}

/**
 * Check if a line starts with a heading pattern (# to ######)
 * Requires at least one space after the hash marks AND at least one character of content.
 * This ensures conversion happens after content is typed, not just on "# ".
 * @param line - The line to check
 * @returns Pattern info with level and content, or null if no pattern
 */
export function detectHeadingPattern(line: string): HeadingPattern | null {
  // Require at least one non-whitespace character after "# " to avoid cursor issues
  const match = line.match(/^(#{1,6})\s+(\S.*)$/);
  if (!match) {
    return null;
  }

  return {
    level: match[1]!.length,
    content: match[2]!,
  };
}

/**
 * Check if a line starts with a list pattern (-, *, +, or 1.)
 * Requires a space after the marker
 * @param line - The line to check
 * @returns Pattern info with type and content, or null if no pattern
 */
export function detectListPattern(line: string): ListPattern | null {
  // Unordered list: -, *, + followed by space
  const unorderedMatch = line.match(/^[-*+]\s+(.*)$/);
  if (unorderedMatch) {
    return {
      type: "unordered",
      content: unorderedMatch[1]!,
    };
  }

  // Ordered list: number followed by . and space
  const orderedMatch = line.match(/^\d+\.\s+(.*)$/);
  if (orderedMatch) {
    return {
      type: "ordered",
      content: orderedMatch[1]!,
    };
  }

  return null;
}

/**
 * Check if a line starts with a blockquote pattern (>)
 * @param line - The line to check
 * @returns Pattern info with content, or null if no pattern
 */
export function detectBlockquotePattern(line: string): BlockquotePattern | null {
  // Blockquote: > optionally followed by space and content
  const match = line.match(/^>\s?(.*)$/);
  if (!match) {
    return null;
  }

  return {
    content: match[1]!,
  };
}

/**
 * Check if a line is a code fence start (```) with a language identifier
 * Requires at least one character in the language identifier to avoid triggering
 * on just "```" before the user finishes typing the language.
 * @param line - The line to check
 * @returns Pattern info with language, or null if not a code fence with language
 */
export function detectCodeFenceStart(line: string): CodeFencePattern | null {
  // Code fence: ``` followed by required language identifier (at least 1 char)
  // This prevents triggering on just "```" before user types the language
  const match = line.match(/^```(\w+)$/);
  if (!match) {
    return null;
  }

  return {
    language: match[1]!,
  };
}

/**
 * Check if a line is a horizontal rule (---, ***, ___)
 * Must be at least 3 characters of the same type
 * @param line - The line to check (should be trimmed)
 * @returns True if the line is a horizontal rule
 */
export function isHorizontalRule(line: string): boolean {
  const trimmed = line.trim();
  // Must be 3+ of same character (-, *, _) with optional spaces between
  return /^([-*_]\s*){3,}$/.test(trimmed) && /^[-*_\s]+$/.test(trimmed);
}

/**
 * Detect if a line starts with a markdown pattern
 * @param line - The line to check
 * @returns Pattern info or null if no pattern detected
 */
export function detectLinePattern(line: string): LinePattern | null {
  // Check for horizontal rule first (before list patterns)
  if (isHorizontalRule(line)) {
    return { type: "hr" };
  }

  // Check heading
  const headingPattern = detectHeadingPattern(line);
  if (headingPattern) {
    return {
      type: "heading",
      level: headingPattern.level,
    };
  }

  // Check list
  const listPattern = detectListPattern(line);
  if (listPattern) {
    return {
      type: listPattern.type === "unordered" ? "unordered-list" : "ordered-list",
    };
  }

  // Check blockquote
  const blockquotePattern = detectBlockquotePattern(line);
  if (blockquotePattern) {
    return { type: "blockquote" };
  }

  // Check code fence
  const codeFencePattern = detectCodeFenceStart(line);
  if (codeFencePattern) {
    return {
      type: "code-block",
      language: codeFencePattern.language,
    };
  }

  return null;
}
