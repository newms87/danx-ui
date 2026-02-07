/**
 * Task list parser
 * Handles - [ ] and - [x] style task items
 */

import type { ParseResult } from "../types";

/**
 * Parse a task list section
 */
export function parseTaskList(lines: string[], index: number): ParseResult | null {
  const trimmedLine = lines[index]!.trim();
  const taskListMatch = trimmedLine.match(/^[-*+]\s+\[([ xX])\]\s+(.*)$/);

  if (!taskListMatch) {
    return null;
  }

  const items: Array<{ checked: boolean; content: string }> = [];
  let i = index;

  while (i < lines.length) {
    const taskLine = lines[i]!.trim();
    const itemMatch = taskLine.match(/^[-*+]\s+\[([ xX])\]\s+(.*)$/);

    if (itemMatch) {
      items.push({
        checked: itemMatch[1]!.toLowerCase() === "x",
        content: itemMatch[2]!,
      });
      i++;
    } else if (taskLine === "") {
      i++;
      const nextNonEmpty = lines.slice(i).find((l) => l.trim() !== "");
      if (!nextNonEmpty || !/^[-*+]\s+\[([ xX])\]/.test(nextNonEmpty.trim())) {
        break;
      }
    } else {
      break;
    }
  }

  return {
    token: { type: "task_list", items },
    endIndex: i,
  };
}
