/**
 * Markdown escape sequence handling
 * Maps backslash-escaped characters to Unicode placeholders and back
 * Using Private Use Area characters (U+E000-U+F8FF) to avoid conflicts
 */

/**
 * Escape sequences mapping - character to Unicode placeholder
 */
export const ESCAPE_MAP: Record<string, string> = {
  "\\*": "\uE000",
  "\\_": "\uE001",
  "\\~": "\uE002",
  "\\`": "\uE003",
  "\\[": "\uE004",
  "\\]": "\uE005",
  "\\#": "\uE006",
  "\\&gt;": "\uE007", // Escaped > becomes &gt; after HTML escaping
  "\\-": "\uE008",
  "\\+": "\uE009",
  "\\.": "\uE00A",
  "\\!": "\uE00B",
  "\\=": "\uE00C",
  "\\^": "\uE00D",
};

/**
 * Reverse mapping - placeholder back to literal character
 * Generated from ESCAPE_MAP for DRY compliance
 */
export const UNESCAPE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(ESCAPE_MAP).map(([escaped, placeholder]) => {
    // Extract the literal character from the escape sequence
    // "\\*" -> "*", "\\&gt;" -> "&gt;" (special case for HTML-escaped >)
    const literal = escaped.startsWith("\\&") ? escaped.slice(1) : escaped.slice(1);
    return [placeholder, literal];
  })
);

/**
 * Apply escape sequences - convert backslash-escaped characters to placeholders
 */
export function applyEscapes(text: string): string {
  let result = text;
  for (const [pattern, placeholder] of Object.entries(ESCAPE_MAP)) {
    result = result.split(pattern).join(placeholder);
  }
  return result;
}

/**
 * Revert escape sequences - convert placeholders back to literal characters
 */
export function revertEscapes(text: string): string {
  let result = text;
  for (const [placeholder, literal] of Object.entries(UNESCAPE_MAP)) {
    result = result.split(placeholder).join(literal);
  }
  return result;
}
