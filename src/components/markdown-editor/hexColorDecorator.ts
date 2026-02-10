/**
 * Hex Color Decorator
 *
 * Scans the contenteditable DOM for bare hex color codes (#RGB or #RRGGBB)
 * and wraps them in .color-preview spans with a --swatch-color CSS variable.
 * The actual swatch is rendered via a ::before pseudo-element in CSS, making
 * it invisible to the editing model (cannot be selected or deleted).
 *
 * Also validates existing .color-preview spans: removes wrappers for text
 * that is no longer a valid hex color, and updates --swatch-color for valid
 * but edited hex values.
 *
 * Call after content sync (debounced input, blur) to keep swatches current.
 * Skips only the specific hex match the cursor is inside, decorating all
 * other matches in the same text node. Preserves cursor position through
 * DOM replacement.
 */

/** Combined pattern matching 6-digit then 3-digit hex colors */
const HEX_PATTERN =
  /(?<![&\w])#([0-9a-fA-F]{6})(?![0-9a-fA-F])|(?<![&\w])#([0-9a-fA-F]{3})(?![0-9a-fA-F])/g;

/** Validation pattern for a complete hex color string */
const VALID_HEX = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

/** Selectors for elements whose text nodes should not be decorated */
const SKIP_SELECTOR = "pre, code, .code-block-wrapper, .color-preview";

interface HexMatch {
  index: number;
  fullMatch: string;
}

interface CursorPosition {
  node: Node;
  offset: number;
}

/**
 * Validate and clean up existing color-preview wrappers.
 * Removes wrappers for invalid hex values, updates swatch colors for valid ones.
 *
 * When contenteditable absorbs new typed text into an existing .color-preview
 * span, the text is no longer a single valid hex — unwrap it so
 * decorateTextNodes can re-scan and create proper per-color spans.
 */
function cleanupSwatches(
  container: HTMLElement,
  cursorNode: Node | null,
  cursorOffset: number
): void {
  const previews = container.querySelectorAll(".color-preview");

  for (const preview of Array.from(previews)) {
    const text = preview.textContent || "";
    const el = preview as HTMLElement;

    if (VALID_HEX.test(text)) {
      el.style.setProperty("--swatch-color", text);
      continue;
    }

    // Text is no longer a single valid hex color — unwrap regardless of cursor
    const needsCursorRestore = cursorNode && preview.contains(cursorNode);
    const textNode = document.createTextNode(text);
    preview.parentNode?.replaceChild(textNode, preview);

    if (needsCursorRestore) {
      const selection = container.ownerDocument.defaultView?.getSelection();
      selection?.collapse(textNode, Math.min(cursorOffset, text.length));
    }
  }
}

/**
 * Find hex color matches in a text string.
 * Returns matches sorted by index.
 */
function findHexMatches(text: string): HexMatch[] {
  HEX_PATTERN.lastIndex = 0;
  const matches: HexMatch[] = [];
  let match;
  while ((match = HEX_PATTERN.exec(text))) {
    matches.push({ index: match.index, fullMatch: match[0] });
  }
  return matches;
}

/**
 * Build a document fragment replacing a text node's content with
 * color-preview-wrapped hex codes and plain text segments.
 */
function buildDecoratedFragment(text: string, matches: HexMatch[]): DocumentFragment {
  const fragment = document.createDocumentFragment();
  let lastIndex = 0;

  for (const m of matches) {
    if (m.index > lastIndex) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex, m.index)));
    }

    const preview = document.createElement("span");
    preview.className = "color-preview";
    preview.style.setProperty("--swatch-color", m.fullMatch);
    preview.appendChild(document.createTextNode(m.fullMatch));
    fragment.appendChild(preview);

    lastIndex = m.index + m.fullMatch.length;
  }

  if (lastIndex < text.length) {
    fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
  }

  return fragment;
}

/**
 * Build a document fragment that decorates hex matches but skips the match
 * the cursor is inside. Returns the new cursor position for restoration.
 */
function buildCursorAwareFragment(
  text: string,
  matches: HexMatch[],
  cursorOffset: number
): { fragment: DocumentFragment; cursorPosition: CursorPosition | null } {
  const fragment = document.createDocumentFragment();
  let lastIndex = 0;
  let cursorPosition: CursorPosition | null = null;

  function appendTextNode(content: string, startIndex: number): void {
    const node = document.createTextNode(content);
    fragment.appendChild(node);
    if (
      !cursorPosition &&
      cursorOffset >= startIndex &&
      cursorOffset <= startIndex + content.length
    ) {
      cursorPosition = { node, offset: cursorOffset - startIndex };
    }
  }

  for (const m of matches) {
    if (m.index > lastIndex) {
      appendTextNode(text.slice(lastIndex, m.index), lastIndex);
    }

    const cursorInsideMatch =
      cursorOffset >= m.index && cursorOffset < m.index + m.fullMatch.length;

    if (cursorInsideMatch) {
      appendTextNode(m.fullMatch, m.index);
    } else {
      const preview = document.createElement("span");
      preview.className = "color-preview";
      preview.style.setProperty("--swatch-color", m.fullMatch);
      preview.appendChild(document.createTextNode(m.fullMatch));
      fragment.appendChild(preview);
    }

    lastIndex = m.index + m.fullMatch.length;
  }

  // Always create a trailing text node (even empty) so the cursor has an
  // anchor when it sits exactly at the end of the last match.
  if (lastIndex <= text.length) {
    appendTextNode(text.slice(lastIndex), lastIndex);
  }

  return { fragment, cursorPosition };
}

/**
 * Wrap bare hex color codes in text nodes with color-preview spans.
 * For the cursor's text node, only the specific match containing the cursor
 * is skipped — all other matches in that node are still decorated.
 */
function decorateTextNodes(
  container: HTMLElement,
  cursorNode: Node | null,
  cursorOffset: number
): void {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);

  interface PendingDecoration {
    node: Text;
    matches: HexMatch[];
    isCursorNode: boolean;
  }

  const pending: PendingDecoration[] = [];
  let textNode: Text | null;

  while ((textNode = walker.nextNode() as Text | null)) {
    if (textNode.parentElement?.closest(SKIP_SELECTOR)) continue;

    const text = textNode.textContent || "";
    if (!text) continue;

    const matches = findHexMatches(text);
    if (matches.length > 0) {
      pending.push({ node: textNode, matches, isCursorNode: textNode === cursorNode });
    }
  }

  // Replace in reverse to preserve earlier sibling positions.
  // parentNode is always set: nodes were found via TreeWalker (in-DOM) and
  // processing is synchronous, so no node can be detached between walk and replace.
  for (const { node, matches, isCursorNode } of pending.reverse()) {
    const text = node.textContent || "";

    if (isCursorNode) {
      const { fragment, cursorPosition } = buildCursorAwareFragment(text, matches, cursorOffset);
      node.parentNode!.replaceChild(fragment, node);

      if (cursorPosition) {
        const selection = container.ownerDocument.defaultView?.getSelection();
        selection?.collapse(cursorPosition.node, cursorPosition.offset);
      }
    } else {
      const fragment = buildDecoratedFragment(text, matches);
      node.parentNode!.replaceChild(fragment, node);
    }
  }
}

/**
 * Decorate hex color codes in the contenteditable with visual swatches.
 *
 * Safe to call repeatedly — idempotent for already-decorated codes.
 * Skips only the specific hex match the cursor is inside, decorating all
 * other matches in the same text node. Preserves cursor position.
 * Skips entirely when the user has a text selection (non-collapsed).
 */
export function decorateHexColors(container: HTMLElement): void {
  const selection = container.ownerDocument.defaultView?.getSelection() ?? null;

  // Don't decorate while user has text selected
  if (selection && !selection.isCollapsed) return;

  let cursorNode = selection?.focusNode ?? null;
  let cursorOffset = selection?.focusOffset ?? 0;

  cleanupSwatches(container, cursorNode, cursorOffset);

  // Re-read cursor after cleanup — unwrapping a span creates a new text node,
  // so the original cursorNode reference is stale.
  cursorNode = selection?.focusNode ?? null;
  cursorOffset = selection?.focusOffset ?? 0;

  decorateTextNodes(container, cursorNode, cursorOffset);
}

/**
 * Fast cleanup of invalid color-preview spans (e.g., empty copies created
 * when contenteditable splits a line on Enter). Call on every input event
 * for instant visual cleanup. Preserves cursor position.
 */
export function cleanupInvalidSwatches(container: HTMLElement): void {
  for (const preview of Array.from(container.querySelectorAll(".color-preview"))) {
    const text = preview.textContent || "";
    if (VALID_HEX.test(text)) continue;

    // If the text still contains a hex pattern (e.g., "#394 " after typing
    // space), keep the span — the debounced decorator will re-wrap properly.
    HEX_PATTERN.lastIndex = 0;
    if (HEX_PATTERN.test(text)) continue;

    // No hex pattern at all (empty span from Enter, or fully edited away) —
    // move children out to preserve <br> elements that contenteditable uses
    // to keep empty lines from collapsing.
    const parent = preview.parentNode;
    if (!parent) continue;
    while (preview.firstChild) {
      parent.insertBefore(preview.firstChild, preview);
    }
    parent.removeChild(preview);
  }
}
