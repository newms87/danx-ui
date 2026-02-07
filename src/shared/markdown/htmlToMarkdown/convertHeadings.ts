/**
 * HTML heading to markdown converter
 * Converts h1-h6 elements to markdown # syntax
 */

/**
 * Check if an element is a heading element (h1-h6)
 */
export function isHeadingElement(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();
  return /^h[1-6]$/.test(tagName);
}

/**
 * Get the heading level from an element (1-6, or 0 if not a heading)
 */
export function getHeadingLevel(element: Element): number {
  const tagName = element.tagName.toLowerCase();
  const match = tagName.match(/^h([1-6])$/);
  return match ? parseInt(match[1]!, 10) : 0;
}

/**
 * Convert an HTML heading element to markdown
 * @param element - The heading element (h1-h6)
 * @returns Markdown string with appropriate # prefix
 */
export function convertHeading(element: Element): string {
  const level = getHeadingLevel(element);
  if (level === 0) {
    return "";
  }

  const content = element.textContent?.trim() || "";
  if (!content) {
    return "";
  }

  const prefix = "#".repeat(level);
  return `${prefix} ${content}\n\n`;
}
