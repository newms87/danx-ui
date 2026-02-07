/**
 * Unified list renderer for ordered and unordered lists
 * DRY implementation handling both list types
 */

import type { BlockToken, ListItem } from "../types";
import { parseInline } from "../parseInline";

/**
 * Render list items recursively
 */
function renderListItems(
  items: ListItem[],
  sanitize: boolean,
  renderTokensFn: (tokens: BlockToken[], sanitize: boolean) => string
): string {
  return items
    .map((item) => {
      let content = parseInline(item.content, sanitize);
      if (item.children && item.children.length > 0) {
        content += renderTokensFn(item.children, sanitize);
      }
      return `<li>${content}</li>`;
    })
    .join("");
}

/**
 * Render an unordered list token
 */
export function renderUnorderedList(
  token: Extract<BlockToken, { type: "ul" }>,
  sanitize: boolean,
  renderTokensFn: (tokens: BlockToken[], sanitize: boolean) => string
): string {
  const items = renderListItems(token.items, sanitize, renderTokensFn);
  return `<ul>${items}</ul>`;
}

/**
 * Render an ordered list token
 */
export function renderOrderedList(
  token: Extract<BlockToken, { type: "ol" }>,
  sanitize: boolean,
  renderTokensFn: (tokens: BlockToken[], sanitize: boolean) => string
): string {
  const items = renderListItems(token.items, sanitize, renderTokensFn);
  const startAttr = token.start !== 1 ? ` start="${token.start}"` : "";
  return `<ol${startAttr}>${items}</ol>`;
}

/**
 * Render a task list token
 */
export function renderTaskList(
  token: Extract<BlockToken, { type: "task_list" }>,
  sanitize: boolean
): string {
  const items = token.items
    .map((item) => {
      const checkbox = item.checked
        ? '<input type="checkbox" checked disabled />'
        : '<input type="checkbox" disabled />';
      return `<li class="task-list-item">${checkbox} ${parseInline(item.content, sanitize)}</li>`;
    })
    .join("");
  return `<ul class="task-list">${items}</ul>`;
}
