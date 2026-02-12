/**
 * HTML table to markdown converter
 * Converts table elements with thead/tbody, alignment detection, and cell content
 */

import type { CustomElementProcessor } from "./index";
import { processInlineContent } from "./convertInline";

/**
 * Process a table element to markdown.
 * Supports header rows, column alignment detection, and inline content in cells.
 */
export function processTable(table: Element, customProcessor?: CustomElementProcessor): string {
  const rows: string[][] = [];
  const alignments: string[] = [];

  // Process thead
  const thead = table.querySelector("thead");
  if (thead) {
    const headerRow = thead.querySelector("tr");
    if (headerRow) {
      const cells: string[] = [];
      for (const th of Array.from(headerRow.querySelectorAll("th"))) {
        cells.push(processInlineContent(th, customProcessor).trim());
        // Detect alignment from style or class
        const style = th.getAttribute("style") || "";
        if (style.includes("text-align: center")) {
          alignments.push(":---:");
        } else if (style.includes("text-align: right")) {
          alignments.push("---:");
        } else {
          alignments.push("---");
        }
      }
      rows.push(cells);
    }
  }

  // Process tbody
  const tbody = table.querySelector("tbody") || table;
  for (const tr of Array.from(tbody.querySelectorAll("tr"))) {
    if (thead && tr.parentElement === thead) continue;
    const cells: string[] = [];
    for (const td of Array.from(tr.querySelectorAll("td, th"))) {
      cells.push(processInlineContent(td, customProcessor).trim());
    }
    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  if (rows.length === 0) return "";

  // Build markdown table
  const lines: string[] = [];

  // Header row
  if (rows.length > 0) {
    lines.push(`| ${rows[0]!.join(" | ")} |`);
    // Separator with alignments
    if (alignments.length > 0) {
      lines.push(`| ${alignments.join(" | ")} |`);
    } else {
      lines.push(`| ${rows[0]!.map(() => "---").join(" | ")} |`);
    }
  }

  // Data rows
  for (let i = 1; i < rows.length; i++) {
    lines.push(`| ${rows[i]!.join(" | ")} |`);
  }

  return lines.join("\n") + "\n\n";
}
