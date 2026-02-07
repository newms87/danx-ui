/**
 * Shared utilities for block tokenizers
 */

/**
 * Get indentation level of a line (count leading spaces/tabs)
 * Tabs are counted as 2 spaces for indentation purposes
 */
export function getIndent(line: string): number {
  const match = line.match(/^(\s*)/);
  if (!match) return 0;
  // Count tabs as 2 spaces for indentation purposes
  return match[1]!.replace(/\t/g, "  ").length;
}

/**
 * Parse a pipe-delimited table row into cells
 */
export function parsePipeRow(line: string): string[] {
  // Remove leading/trailing pipes and split
  let trimmed = line.trim();
  if (trimmed.startsWith("|")) trimmed = trimmed.slice(1);
  if (trimmed.endsWith("|")) trimmed = trimmed.slice(0, -1);
  return trimmed.split("|").map((cell) => cell.trim());
}
