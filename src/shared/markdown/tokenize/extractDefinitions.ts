/**
 * Definition extraction for link references and footnotes
 * First-pass processing to collect definitions before tokenization
 */

import { setLinkRef, setFootnote } from "../state";

/**
 * Extract link reference and footnote definitions from lines
 * Returns the filtered lines with definitions removed
 */
export function extractDefinitions(rawLines: string[]): string[] {
  const lines: string[] = [];

  for (const line of rawLines) {
    // Match footnote definition: [^id]: content
    const footnoteDefMatch = line.match(/^\s*\[\^([^\]]+)\]:\s+(.+)$/);
    if (footnoteDefMatch) {
      const [, fnId, content] = footnoteDefMatch;
      setFootnote(fnId!, content!);
      // Don't add this line to filtered output (remove from rendered content)
      continue;
    }

    // Match link definition: [ref-id]: URL "optional title"
    // URL can optionally be wrapped in angle brackets
    const refMatch = line.match(/^\s*\[([^\]]+)\]:\s+<?([^>\s]+)>?(?:\s+["']([^"']+)["'])?\s*$/);

    if (refMatch) {
      const [, refId, url, title] = refMatch;
      setLinkRef(refId!.toLowerCase(), { url: url!, title });
      // Don't add this line to filtered output (remove from rendered content)
    } else {
      lines.push(line);
    }
  }

  return lines;
}
