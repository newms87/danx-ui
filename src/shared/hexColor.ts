/**
 * Hex Color Utilities
 *
 * Shared regex patterns and match-finding for hex color codes (#RGB or #RRGGBB).
 * Used by the markdown editor's DOM decorator and the CodeViewer's HTML
 * post-processor to locate hex colors in text.
 */

/** Combined pattern matching 6-digit then 3-digit hex colors */
export const HEX_PATTERN =
  /(?<![&\w])#([0-9a-fA-F]{6})(?![0-9a-fA-F])|(?<![&\w])#([0-9a-fA-F]{3})(?![0-9a-fA-F])/g;

/** Validation pattern for a complete hex color string */
export const VALID_HEX = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

export interface HexMatch {
  index: number;
  fullMatch: string;
}

/**
 * Find hex color matches in a text string.
 * Returns matches sorted by index.
 */
export function findHexMatches(text: string): HexMatch[] {
  HEX_PATTERN.lastIndex = 0;
  const matches: HexMatch[] = [];
  let match;
  while ((match = HEX_PATTERN.exec(text))) {
    matches.push({ index: match.index, fullMatch: match[0] });
  }
  return matches;
}
