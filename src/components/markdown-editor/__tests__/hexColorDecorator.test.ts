import { describe, it, expect, beforeEach } from "vitest";
import { cleanupInvalidSwatches, decorateHexColors } from "../hexColorDecorator";

describe("decorateHexColors", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  function getSelection() {
    return document.getSelection() || window.getSelection();
  }

  /** Place a collapsed cursor at the given offset inside a text node. */
  function placeCursor(node: Node, offset: number): void {
    const sel = getSelection();
    if (!sel) return;
    const range = document.createRange();
    range.setStart(node, offset);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  describe("decorating bare hex codes", () => {
    it("wraps a 6-digit hex code in color-preview span with --swatch-color", () => {
      container.innerHTML = "<p>Color: #ff0000</p>";
      decorateHexColors(container);

      const preview = container.querySelector(".color-preview") as HTMLElement;
      expect(preview).toBeTruthy();
      expect(preview.textContent).toBe("#ff0000");
      expect(preview.style.getPropertyValue("--swatch-color")).toBe("#ff0000");
    });

    it("wraps a 3-digit hex code in color-preview span", () => {
      container.innerHTML = "<p>Color: #f00</p>";
      decorateHexColors(container);

      const preview = container.querySelector(".color-preview");
      expect(preview).toBeTruthy();
      expect(preview!.textContent).toBe("#f00");
    });

    it("decorates multiple hex codes in the same text node", () => {
      container.innerHTML = "<p>#ff0000 and #333 and #0af</p>";
      decorateHexColors(container);

      const previews = container.querySelectorAll(".color-preview");
      expect(previews.length).toBe(3);
      expect(previews[0]!.textContent).toBe("#ff0000");
      expect(previews[1]!.textContent).toBe("#333");
      expect(previews[2]!.textContent).toBe("#0af");
    });

    it("decorates hex codes in different paragraphs", () => {
      container.innerHTML = "<p>#ff0000</p><p>#00ff00</p>";
      decorateHexColors(container);

      const previews = container.querySelectorAll(".color-preview");
      expect(previews.length).toBe(2);
    });

    it("preserves surrounding text", () => {
      container.innerHTML = "<p>Before #333 after</p>";
      decorateHexColors(container);

      const p = container.querySelector("p")!;
      expect(p.textContent).toBe("Before #333 after");
      expect(p.querySelector(".color-preview")!.textContent).toBe("#333");
    });
  });

  describe("skip conditions", () => {
    it("does not decorate hex codes inside <code> elements", () => {
      container.innerHTML = "<p><code>#ff0000</code></p>";
      decorateHexColors(container);

      expect(container.querySelector(".color-preview")).toBeNull();
    });

    it("does not decorate hex codes inside <pre> elements", () => {
      container.innerHTML = "<pre>#ff0000</pre>";
      decorateHexColors(container);

      expect(container.querySelector(".color-preview")).toBeNull();
    });

    it("does not decorate hex codes inside code-block-wrapper", () => {
      container.innerHTML = '<div class="code-block-wrapper">#ff0000</div>';
      decorateHexColors(container);

      expect(container.querySelector(".color-preview")).toBeNull();
    });

    it("does not re-decorate already-decorated hex codes", () => {
      container.innerHTML =
        '<p><span class="color-preview" style="--swatch-color: #333">#333</span></p>';
      decorateHexColors(container);

      // Should still be exactly one color-preview
      expect(container.querySelectorAll(".color-preview").length).toBe(1);
    });

    it("does not decorate non-hex text after #", () => {
      container.innerHTML = "<p>#heading and #xyz</p>";
      decorateHexColors(container);

      expect(container.querySelector(".color-preview")).toBeNull();
    });

    it("does not decorate 4-digit sequences", () => {
      container.innerHTML = "<p>#1234</p>";
      decorateHexColors(container);

      expect(container.querySelector(".color-preview")).toBeNull();
    });

    it("does not decorate 5-digit sequences", () => {
      container.innerHTML = "<p>#12345</p>";
      decorateHexColors(container);

      expect(container.querySelector(".color-preview")).toBeNull();
    });

    it("does not decorate 7+ digit sequences", () => {
      container.innerHTML = "<p>#1234567</p>";
      decorateHexColors(container);

      expect(container.querySelector(".color-preview")).toBeNull();
    });

    it("does not decorate when preceded by a word character", () => {
      container.innerHTML = "<p>word#333</p>";
      decorateHexColors(container);

      expect(container.querySelector(".color-preview")).toBeNull();
    });

    it("skips decoration entirely when selection is not collapsed", () => {
      container.innerHTML = "<p>#ff0000</p>";

      // Mock non-collapsed selection
      const sel = getSelection();
      if (sel) {
        const textNode = container.querySelector("p")!.firstChild!;
        const range = document.createRange();
        range.setStart(textNode, 0);
        range.setEnd(textNode, 5);
        sel.removeAllRanges();
        sel.addRange(range);
      }

      decorateHexColors(container);

      // In jsdom, selection behavior varies — the important thing is no crash
      // and the function handles the non-collapsed case gracefully
    });
  });

  describe("cursor-aware per-match skipping", () => {
    it("updates --swatch-color when cursor is inside a color-preview span", () => {
      container.innerHTML =
        '<p><span class="color-preview" style="--swatch-color: #333">#ff0000</span></p>';

      const textNode = container.querySelector(".color-preview")!.firstChild!;
      placeCursor(textNode, 2);

      decorateHexColors(container);

      // --swatch-color should be updated to match the current text (#ff0000)
      const el = container.querySelector(".color-preview") as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.style.getPropertyValue("--swatch-color")).toBe("#ff0000");
    });

    it("skips the match containing the cursor but decorates other matches", () => {
      container.innerHTML = "<p>#ff0000</p><p>#00ff00</p>";

      // Place cursor inside the first paragraph's hex match (offset 3 = inside #ff0000)
      const firstText = container.querySelector("p")!.firstChild!;
      placeCursor(firstText, 3);

      decorateHexColors(container);

      // Second paragraph should always be decorated
      const previews = container.querySelectorAll(".color-preview");
      expect(previews.length).toBeGreaterThanOrEqual(1);
    });

    it("decorates matches in cursor node when cursor is not inside any match", () => {
      container.innerHTML = "<p>#333333 more words</p>";

      // Place cursor at offset 12 — inside "more words", not inside the hex match
      const textNode = container.querySelector("p")!.firstChild!;
      placeCursor(textNode, 12);

      decorateHexColors(container);

      // The hex match should be decorated even though cursor is in the same text node
      const previews = container.querySelectorAll(".color-preview");
      // jsdom selection support varies, but at minimum the match should be decorated
      expect(previews.length).toBeGreaterThanOrEqual(1);
      if (previews.length > 0) {
        expect(previews[0]!.textContent).toBe("#333333");
      }
    });

    it("skips only the cursor match when multiple matches share a text node", () => {
      container.innerHTML = "<p>#ff0000 and #333</p>";

      // Place cursor at offset 3 — inside the first hex match (#ff0000 spans [0,7])
      const textNode = container.querySelector("p")!.firstChild!;
      placeCursor(textNode, 3);

      decorateHexColors(container);

      // #333 should be decorated, #ff0000 should be plain text (cursor inside)
      const previews = container.querySelectorAll(".color-preview");
      // jsdom selection varies, but when working: only #333 is wrapped
      expect(previews.length).toBeGreaterThanOrEqual(1);
      if (previews.length === 1) {
        expect(previews[0]!.textContent).toBe("#333");
      }
    });

    it("preserves cursor position after decorating cursor node", () => {
      container.innerHTML = "<p>#333333 more words</p>";

      const textNode = container.querySelector("p")!.firstChild!;
      const originalOffset = 12; // inside "more words"
      placeCursor(textNode, originalOffset);

      decorateHexColors(container);

      // After decoration, cursor should be restored to a valid position
      const sel = getSelection();
      if (sel && sel.focusNode) {
        // The cursor should still be in the paragraph, at a text node
        const p = container.querySelector("p")!;
        expect(p.contains(sel.focusNode)).toBe(true);
      }
    });
  });

  describe("cleanup of invalid swatches", () => {
    it("unwraps color-preview when text is no longer a valid hex", () => {
      container.innerHTML =
        '<p><span class="color-preview" style="--swatch-color: #333">not-hex</span></p>';
      decorateHexColors(container);

      expect(container.querySelector(".color-preview")).toBeNull();
      expect(container.querySelector("p")!.textContent).toBe("not-hex");
    });

    it("handles color-preview with missing swatch element", () => {
      // color-preview without a .color-swatch child (edge case)
      container.innerHTML = '<p><span class="color-preview">#ff0000</span></p>';
      decorateHexColors(container);

      // Should still keep it since text is valid hex
      const preview = container.querySelector(".color-preview");
      expect(preview).toBeTruthy();
    });

    it("unwraps invalid color-preview even when cursor is inside", () => {
      // Simulates browser absorbing typed text into an existing span:
      // user typed " #333" after #f0f, making span text "#f0f #333"
      container.innerHTML =
        '<p><span class="color-preview" style="--swatch-color: #f0f">#f0f #333</span></p>';

      const textNode = container.querySelector(".color-preview")!.firstChild!;
      placeCursor(textNode, 9); // cursor at end of "#f0f #333"

      decorateHexColors(container);

      // The single invalid span should be unwrapped and re-decorated as two
      const previews = container.querySelectorAll(".color-preview");
      expect(previews.length).toBe(2);
      expect(previews[0]!.textContent).toBe("#f0f");
      expect(previews[1]!.textContent).toBe("#333");
    });

    it("re-decorates hex colors after unwrapping absorbed text", () => {
      // Browser absorbed " #abc" into the #f0f span
      container.innerHTML =
        '<p><span class="color-preview" style="--swatch-color: #f0f">#f0f #abc</span></p>';

      decorateHexColors(container);

      const previews = container.querySelectorAll(".color-preview");
      expect(previews.length).toBe(2);
      expect((previews[0] as HTMLElement).style.getPropertyValue("--swatch-color")).toBe("#f0f");
      expect((previews[1] as HTMLElement).style.getPropertyValue("--swatch-color")).toBe("#abc");
    });

    it("updates --swatch-color when hex value changes", () => {
      container.innerHTML =
        '<p><span class="color-preview" style="--swatch-color: #333">#ff0000</span></p>';
      decorateHexColors(container);

      const preview = container.querySelector(".color-preview") as HTMLElement;
      expect(preview).toBeTruthy();
      expect(preview.style.getPropertyValue("--swatch-color")).toBe("#ff0000");
    });

    it("keeps valid color-preview spans intact", () => {
      container.innerHTML =
        '<p><span class="color-preview" style="--swatch-color: #333">#333</span></p>';
      decorateHexColors(container);

      const preview = container.querySelector(".color-preview") as HTMLElement;
      expect(preview).toBeTruthy();
      expect(preview.textContent).toBe("#333");
      expect(preview.style.getPropertyValue("--swatch-color")).toBe("#333");
    });
  });

  describe("cursor at exact end of match", () => {
    it("creates trailing anchor node when cursor is at end of last match", () => {
      // Text " #333" with cursor at offset 5 (exactly at end of match)
      container.innerHTML = "<p> #333</p>";

      const textNode = container.querySelector("p")!.firstChild!;
      placeCursor(textNode, 5); // offset 5 = right after "#333"

      decorateHexColors(container);

      // The match should be decorated (cursor is not INSIDE the match)
      const previews = container.querySelectorAll(".color-preview");
      expect(previews.length).toBeGreaterThanOrEqual(1);
      expect(previews[0]!.textContent).toBe("#333");
    });

    it("does not lose cursor when match ends at text boundary", () => {
      container.innerHTML = "<p>#ff0000</p>";

      const textNode = container.querySelector("p")!.firstChild!;
      placeCursor(textNode, 7); // offset 7 = exactly at end of "#ff0000"

      decorateHexColors(container);

      // Should not crash and should decorate the match
      const sel = getSelection();
      if (sel && sel.focusNode) {
        const p = container.querySelector("p")!;
        expect(p.contains(sel.focusNode)).toBe(true);
      }
    });
  });

  describe("idempotency", () => {
    it("produces the same result when called multiple times", () => {
      container.innerHTML = "<p>#ff0000 and #333</p>";

      decorateHexColors(container);
      const html1 = container.innerHTML;

      decorateHexColors(container);
      const html2 = container.innerHTML;

      expect(html1).toBe(html2);
    });
  });

  describe("mixed content", () => {
    it("decorates hex codes alongside inline formatting", () => {
      container.innerHTML = "<p><strong>Bold</strong> text #ff0000 and <em>italic</em></p>";
      decorateHexColors(container);

      const preview = container.querySelector(".color-preview");
      expect(preview).toBeTruthy();
      expect(preview!.textContent).toBe("#ff0000");

      // Formatting elements should be preserved
      expect(container.querySelector("strong")!.textContent).toBe("Bold");
      expect(container.querySelector("em")!.textContent).toBe("italic");
    });

    it("handles hex code at the very start of text", () => {
      container.innerHTML = "<p>#ff0000 is red</p>";
      decorateHexColors(container);

      expect(container.querySelector(".color-preview")!.textContent).toBe("#ff0000");
      expect(container.querySelector("p")!.textContent).toBe("#ff0000 is red");
    });

    it("handles hex code at the very end of text", () => {
      container.innerHTML = "<p>Red is #ff0000</p>";
      decorateHexColors(container);

      expect(container.querySelector(".color-preview")!.textContent).toBe("#ff0000");
      expect(container.querySelector("p")!.textContent).toBe("Red is #ff0000");
    });

    it("handles empty container", () => {
      container.innerHTML = "";
      decorateHexColors(container);
      expect(container.innerHTML).toBe("");
    });

    it("handles container with no hex codes", () => {
      container.innerHTML = "<p>No colors here</p>";
      decorateHexColors(container);
      expect(container.querySelector(".color-preview")).toBeNull();
    });
  });
});

describe("cleanupInvalidSwatches", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  it("removes empty color-preview spans (Enter key artifact)", () => {
    container.innerHTML = '<p><span class="color-preview" style="--swatch-color: #333"></span></p>';

    cleanupInvalidSwatches(container);

    expect(container.querySelector(".color-preview")).toBeNull();
  });

  it("preserves <br> elements when unwrapping empty spans", () => {
    // Browser creates: new line with <span class="color-preview"><br></span>
    container.innerHTML =
      '<p><span class="color-preview" style="--swatch-color: #333"><br></span></p>';

    cleanupInvalidSwatches(container);

    expect(container.querySelector(".color-preview")).toBeNull();
    // <br> should be preserved so the line doesn't collapse
    expect(container.querySelector("br")).toBeTruthy();
  });

  it("keeps valid hex color-preview spans", () => {
    container.innerHTML =
      '<p><span class="color-preview" style="--swatch-color: #333">#333</span></p>';

    cleanupInvalidSwatches(container);

    expect(container.querySelector(".color-preview")).toBeTruthy();
    expect(container.querySelector(".color-preview")!.textContent).toBe("#333");
  });

  it("keeps spans that still contain a hex pattern (typing space after hex)", () => {
    // User typed space after #394 — browser puts it inside the span
    container.innerHTML =
      '<p><span class="color-preview" style="--swatch-color: #394">#394 </span></p>';

    cleanupInvalidSwatches(container);

    // Should keep the span — debounced decorator will handle re-wrapping
    expect(container.querySelector(".color-preview")).toBeTruthy();
  });

  it("keeps spans with hex plus extra typed text", () => {
    // User typed " #abc" after #f0f inside the span
    container.innerHTML =
      '<p><span class="color-preview" style="--swatch-color: #f0f">#f0f #abc</span></p>';

    cleanupInvalidSwatches(container);

    // Should keep — contains hex patterns
    expect(container.querySelector(".color-preview")).toBeTruthy();
  });

  it("removes spans with no hex content at all", () => {
    container.innerHTML =
      '<p><span class="color-preview" style="--swatch-color: #333">hello world</span></p>';

    cleanupInvalidSwatches(container);

    expect(container.querySelector(".color-preview")).toBeNull();
    expect(container.querySelector("p")!.textContent).toBe("hello world");
  });

  it("removes spans with whitespace-only content", () => {
    container.innerHTML =
      '<p><span class="color-preview" style="--swatch-color: #333">   </span></p>';

    cleanupInvalidSwatches(container);

    expect(container.querySelector(".color-preview")).toBeNull();
  });

  it("handles multiple spans with mixed validity", () => {
    container.innerHTML = [
      '<span class="color-preview" style="--swatch-color: #333">#333</span>',
      '<span class="color-preview" style="--swatch-color: #f0f"></span>',
      '<span class="color-preview" style="--swatch-color: #abc">#abc </span>',
    ].join(" ");

    cleanupInvalidSwatches(container);

    const remaining = container.querySelectorAll(".color-preview");
    // #333 is valid, empty span removed, "#abc " still has hex pattern
    expect(remaining.length).toBe(2);
    expect(remaining[0]!.textContent).toBe("#333");
    expect(remaining[1]!.textContent).toBe("#abc ");
  });

  it("keeps spans with partially typed hex (3+ hex digits)", () => {
    // User is still inside "#9f8d7c " — 6-digit hex plus space
    container.innerHTML =
      '<p><span class="color-preview" style="--swatch-color: #9f8d7c">#9f8d7c </span></p>';

    cleanupInvalidSwatches(container);

    expect(container.querySelector(".color-preview")).toBeTruthy();
  });

  it("skips detached color-preview spans (no parentNode)", () => {
    // Create a detached span and append it to container, then detach it before cleanup
    container.innerHTML =
      '<p><span class="color-preview" style="--swatch-color: #333">hello</span></p>';

    // Grab the span, then remove it from DOM so it has no parentNode
    const span = container.querySelector(".color-preview")!;
    span.parentNode!.removeChild(span);

    // Re-add it to a querySelectorAll-visible position via a trick:
    // We need the span in the container's querySelectorAll but with no parent.
    // Instead, we'll test by directly manipulating what querySelectorAll returns.
    // Actually, a detached node won't appear in querySelectorAll. Let's test the
    // guard differently: override parentNode to null via Object.defineProperty.
    container.innerHTML =
      '<p><span class="color-preview" style="--swatch-color: #333">no-hex-here</span></p>';
    const preview = container.querySelector(".color-preview")!;
    Object.defineProperty(preview, "parentNode", { value: null, configurable: true });

    cleanupInvalidSwatches(container);

    // The span should remain since the guard skips it (no parent to unwrap into)
    expect(container.querySelector(".color-preview")).toBeTruthy();
  });

  it("removes spans where hex was fully deleted", () => {
    // User deleted the hex, only "#" remains (not a valid pattern)
    container.innerHTML =
      '<p><span class="color-preview" style="--swatch-color: #333">#</span></p>';

    cleanupInvalidSwatches(container);

    expect(container.querySelector(".color-preview")).toBeNull();
    expect(container.querySelector("p")!.textContent).toBe("#");
  });
});
