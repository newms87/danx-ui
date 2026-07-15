/**
 * Sanitize a raw SVG string for safe injection as HTML markup.
 *
 * Unlike `escapeHtml`, which entity-escapes all markup (correct for plain
 * text, but useless for SVG that must render as markup), this validates
 * that the input is a single well-formed `<svg>` element and strips
 * known-dangerous content: `<script>`/`<style>`/`<foreignObject>` elements,
 * `on*` event attributes, and `javascript:`/`data:` URI schemes in
 * `href`/`xlink:href` attributes.
 *
 * Returns `null` if the input does not parse to a single `<svg>` root
 * element — callers must not render raw HTML in that case.
 */
export function sanitizeSvg(input: string): string | null {
  const doc = new DOMParser().parseFromString(input, "image/svg+xml");

  if (doc.querySelector("parsererror")) {
    return null;
  }

  const root = doc.documentElement;
  if (!root || root.nodeName.toLowerCase() !== "svg" || root.tagName === "parsererror") {
    return null;
  }

  for (const tag of ["script", "style", "foreignObject"]) {
    for (const el of Array.from(root.getElementsByTagName(tag))) {
      el.remove();
    }
  }

  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  const elements: Element[] = [root];
  let node = walker.nextNode();
  while (node) {
    elements.push(node as Element);
    node = walker.nextNode();
  }

  for (const el of elements) {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on")) {
        el.removeAttribute(attr.name);
        continue;
      }
      if (name === "href" || name === "xlink:href") {
        const value = attr.value.trim().toLowerCase();
        if (value.startsWith("javascript:") || value.startsWith("data:")) {
          el.removeAttribute(attr.name);
        }
      }
    }
  }

  return new XMLSerializer().serializeToString(root);
}
