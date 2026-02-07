/**
 * Table renderer
 * Handles alignment styles and cell rendering
 */

import type { BlockToken, TableAlignment } from "../types";
import { parseInline } from "../parseInline";

/**
 * Generate style attribute for alignment
 */
function alignStyle(align: TableAlignment): string {
  if (!align) return "";
  return ` style="text-align: ${align}"`;
}

/**
 * Render a table token
 */
export function renderTable(
  token: Extract<BlockToken, { type: "table" }>,
  sanitize: boolean
): string {
  const headerCells = token.headers
    .map(
      (h, idx) => `<th${alignStyle(token.alignments[idx] ?? null)}>${parseInline(h, sanitize)}</th>`
    )
    .join("");

  const bodyRows = token.rows
    .map((row) => {
      const cells = row
        .map(
          (cell, idx) =>
            `<td${alignStyle(token.alignments[idx] ?? null)}>${parseInline(cell, sanitize)}</td>`
        )
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  return `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
}
