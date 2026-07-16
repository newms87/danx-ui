/**
 * Paste HTML normalization
 *
 * Strips Word/Google Docs paste cruft (conditional comments, MS Office XML
 * namespaced elements, inline `style`/`class` attributes, `<meta>`/`<script>`/
 * `<link>` tags) so the existing `htmlToMarkdown` pipeline converts pasted
 * content the same way it converts editor-generated markup.
 */

/** Tags that carry no convertible content and are unsafe or noisy to keep */
const STRIPPED_TAGS = ["script", "style", "meta", "link", "title", "xml"];

/** Attributes that leak source-app styling/metadata rather than semantic markup */
const STRIPPED_ATTRS = ["style", "class", "lang", "id"];

/**
 * Remove HTML comments, including Word's conditional comments
 * (`<!--[if gte mso 9]>...<![endif]-->`), which `DOMParser` otherwise
 * preserves as comment nodes that `htmlToMarkdown` ignores but that can
 * still wrap live markup on some Word exports.
 */
function stripComments(root: Node): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
  const comments: Comment[] = [];
  let node = walker.nextNode();
  while (node) {
    comments.push(node as Comment);
    node = walker.nextNode();
  }
  comments.forEach((comment) => comment.parentNode?.removeChild(comment));
}

/**
 * Remove MS Office namespaced elements (`<o:p>`, `<w:sdt>`, etc.) while
 * keeping their text content, since browsers parse them as opaque
 * HTMLUnknownElements rather than dropping them.
 */
function unwrapNamespacedElements(root: Element): void {
  const all = Array.from(root.querySelectorAll("*"));
  for (const element of all) {
    if (element.tagName.includes(":")) {
      const parent = element.parentNode;
      if (!parent) continue;
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }
      parent.removeChild(element);
    }
  }
}

/**
 * Normalize HTML pasted from an external source (Word, Google Docs, a web
 * page) into clean markup that the editor's `htmlToMarkdown` conversion
 * pipeline can round-trip. Returns plain text escaped as a single paragraph
 * if the input contains no usable markup.
 */
export function normalizePastedHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body;

  stripComments(body);
  unwrapNamespacedElements(body);

  for (const tag of STRIPPED_TAGS) {
    for (const el of Array.from(body.getElementsByTagName(tag))) {
      el.remove();
    }
  }

  const all = Array.from(body.querySelectorAll("*"));
  for (const element of all) {
    for (const attr of STRIPPED_ATTRS) {
      element.removeAttribute(attr);
    }
    // Strip on* event handler attributes defensively (paste is untrusted input)
    for (const attr of Array.from(element.attributes)) {
      if (attr.name.toLowerCase().startsWith("on")) {
        element.removeAttribute(attr.name);
      }
    }
  }

  return body.innerHTML;
}
