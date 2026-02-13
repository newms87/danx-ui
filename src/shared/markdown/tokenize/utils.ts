/**
 * Shared utilities for block tokenizers
 */

/**
 * Get indentation level of a line (count leading spaces/tabs)
 * Tabs are counted as 2 spaces for indentation purposes
 */
export function getIndent(line: string): number {
  // /^(\s*)/ always matches any string — capture group 1 is the leading whitespace
  // Count tabs as 2 spaces for indentation purposes
  return line.match(/^(\s*)/)![1]!.replace(/\t/g, "  ").length;
}

/**
 * Parse a pipe-delimited table row into cells.
 * Respects escaped pipes (\|) which are treated as literal pipe characters.
 */
export function parsePipeRow(line: string): string[] {
  // Replace escaped pipes with placeholder before splitting
  const PIPE_PLACEHOLDER = "\uE0FF";
  const escaped = line.trim().split("\\|").join(PIPE_PLACEHOLDER);

  // Remove leading/trailing pipes and split on unescaped pipes
  let trimmed = escaped;
  if (trimmed.startsWith("|")) trimmed = trimmed.slice(1);
  if (trimmed.endsWith("|")) trimmed = trimmed.slice(0, -1);

  // Split, restore escaped pipes, and trim each cell
  return trimmed.split("|").map((cell) => cell.split(PIPE_PLACEHOLDER).join("|").trim());
}
