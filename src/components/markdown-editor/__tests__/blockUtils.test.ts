import { describe, it, expect, afterEach } from "vitest";
import { ref } from "vue";
import { isConvertibleBlock, getTargetBlock, findLinkAncestor } from "../blockUtils";
import { useMarkdownSelection } from "../useMarkdownSelection";
import { createTestEditor, TestEditorResult } from "./editorTestUtils";

describe("blockUtils", () => {
  describe("isConvertibleBlock", () => {
    it("returns true for P elements", () => {
      const el = document.createElement("p");
      expect(isConvertibleBlock(el)).toBe(true);
    });

    it("returns true for DIV elements", () => {
      const el = document.createElement("div");
      expect(isConvertibleBlock(el)).toBe(true);
    });

    it("returns true for H1-H6 elements", () => {
      for (let i = 1; i <= 6; i++) {
        const el = document.createElement(`h${i}`);
        expect(isConvertibleBlock(el)).toBe(true);
      }
    });

    it("returns false for non-convertible elements", () => {
      const tags = ["span", "li", "ul", "ol", "blockquote", "pre", "table"];
      for (const tag of tags) {
        const el = document.createElement(tag);
        expect(isConvertibleBlock(el)).toBe(false);
      }
    });
  });

  describe("getTargetBlock", () => {
    let editor: TestEditorResult;

    afterEach(() => {
      if (editor) editor.destroy();
    });

    it("returns null when selection has no block", () => {
      editor = createTestEditor("<p>Hello</p>");
      const contentRef = editor.contentRef;
      const selection = useMarkdownSelection(contentRef);

      // Don't set cursor - no selection
      window.getSelection()?.removeAllRanges();

      const result = getTargetBlock(contentRef, selection);
      expect(result).toBeNull();
    });

    it("returns paragraph when cursor is in a paragraph", () => {
      editor = createTestEditor("<p>Hello</p>");
      const contentRef = editor.contentRef;
      const selection = useMarkdownSelection(contentRef);
      editor.setCursorInBlock(0, 3);

      const result = getTargetBlock(contentRef, selection);
      expect(result?.tagName).toBe("P");
    });

    it("returns heading when cursor is in a heading", () => {
      editor = createTestEditor("<h2>Title</h2>");
      const contentRef = editor.contentRef;
      const selection = useMarkdownSelection(contentRef);
      editor.setCursorInBlock(0, 2);

      const result = getTargetBlock(contentRef, selection);
      expect(result?.tagName).toBe("H2");
    });

    it("returns null for LI without includeLists option", () => {
      editor = createTestEditor("<ul><li>Item</li></ul>");
      const contentRef = editor.contentRef;
      const selection = useMarkdownSelection(contentRef);

      // Place cursor inside the LI
      const li = editor.container.querySelector("li")!;
      const textNode = li.firstChild!;
      editor.setCursor(textNode, 2);

      const result = getTargetBlock(contentRef, selection);
      expect(result).toBeNull();
    });

    it("returns LI when includeLists is true", () => {
      editor = createTestEditor("<ul><li>Item</li></ul>");
      const contentRef = editor.contentRef;
      const selection = useMarkdownSelection(contentRef);

      const li = editor.container.querySelector("li")!;
      const textNode = li.firstChild!;
      editor.setCursor(textNode, 2);

      const result = getTargetBlock(contentRef, selection, { includeLists: true });
      expect(result?.tagName).toBe("LI");
    });

    it("returns null for PRE without includeCodeBlocks option", () => {
      editor = createTestEditor("<pre>code</pre>");
      const contentRef = editor.contentRef;
      const selection = useMarkdownSelection(contentRef);

      const pre = editor.container.querySelector("pre")!;
      const textNode = pre.firstChild!;
      editor.setCursor(textNode, 2);

      const result = getTargetBlock(contentRef, selection);
      expect(result).toBeNull();
    });

    it("returns PRE when includeCodeBlocks is true", () => {
      editor = createTestEditor("<pre>code</pre>");
      const contentRef = editor.contentRef;
      const selection = useMarkdownSelection(contentRef);

      const pre = editor.container.querySelector("pre")!;
      const textNode = pre.firstChild!;
      editor.setCursor(textNode, 2);

      const result = getTargetBlock(contentRef, selection, { includeCodeBlocks: true });
      expect(result?.tagName).toBe("PRE");
    });

    it("returns element with data-code-block-id when includeCodeBlocks is true", () => {
      editor = createTestEditor('<div data-code-block-id="abc">code</div>');
      const contentRef = editor.contentRef;
      const selection = useMarkdownSelection(contentRef);

      const codeBlock = editor.container.querySelector("[data-code-block-id]")!;
      const textNode = codeBlock.firstChild!;
      editor.setCursor(textNode, 2);

      const result = getTargetBlock(contentRef, selection, { includeCodeBlocks: true });
      expect(result?.hasAttribute("data-code-block-id")).toBe(true);
    });

    it("returns null when contentRef is null", () => {
      editor = createTestEditor("<p>Hello</p>");
      const nullRef = ref<HTMLElement | null>(null);
      const selection = useMarkdownSelection(nullRef);

      const result = getTargetBlock(nullRef, selection);
      expect(result).toBeNull();
    });

    it("walks up to find a convertible block parent", () => {
      editor = createTestEditor("<p><strong>bold text</strong></p>");
      const contentRef = editor.contentRef;
      const selection = useMarkdownSelection(contentRef);

      // Place cursor inside the strong element
      const strong = editor.container.querySelector("strong")!;
      const textNode = strong.firstChild!;
      editor.setCursor(textNode, 2);

      const result = getTargetBlock(contentRef, selection);
      expect(result?.tagName).toBe("P");
    });

    it("walks up and recognizes code block wrapper in ancestors", () => {
      // A nested structure where we need to walk up to find a code block
      editor = createTestEditor('<div data-code-block-id="x"><span>nested code</span></div>');
      const contentRef = editor.contentRef;
      const selection = useMarkdownSelection(contentRef);

      const span = editor.container.querySelector("span")!;
      const textNode = span.firstChild!;
      editor.setCursor(textNode, 3);

      const result = getTargetBlock(contentRef, selection, { includeCodeBlocks: true });
      expect(result?.hasAttribute("data-code-block-id")).toBe(true);
    });

    it("walks up and recognizes LI in ancestors when includeLists", () => {
      editor = createTestEditor("<ul><li><strong>bold item</strong></li></ul>");
      const contentRef = editor.contentRef;
      const selection = useMarkdownSelection(contentRef);

      const strong = editor.container.querySelector("strong")!;
      const textNode = strong.firstChild!;
      editor.setCursor(textNode, 2);

      const result = getTargetBlock(contentRef, selection, { includeLists: true });
      expect(result?.tagName).toBe("LI");
    });
  });

  describe("findLinkAncestor", () => {
    it("returns null when node is null", () => {
      const container = document.createElement("div");
      expect(findLinkAncestor(null, container)).toBeNull();
    });

    it("returns null when no anchor is found", () => {
      const container = document.createElement("div");
      const p = document.createElement("p");
      const text = document.createTextNode("plain text");
      p.appendChild(text);
      container.appendChild(p);

      expect(findLinkAncestor(text, container)).toBeNull();
    });

    it("returns the anchor element when node is inside an anchor", () => {
      const container = document.createElement("div");
      const a = document.createElement("a");
      a.href = "https://example.com";
      const text = document.createTextNode("link text");
      a.appendChild(text);
      container.appendChild(a);

      const result = findLinkAncestor(text, container);
      expect(result).toBe(a);
      expect(result?.tagName).toBe("A");
    });

    it("returns the anchor when node is deeply nested inside it", () => {
      const container = document.createElement("div");
      const a = document.createElement("a");
      a.href = "https://example.com";
      const strong = document.createElement("strong");
      const text = document.createTextNode("bold link");
      strong.appendChild(text);
      a.appendChild(strong);
      container.appendChild(a);

      const result = findLinkAncestor(text, container);
      expect(result).toBe(a);
    });

    it("returns null when anchor is outside the container", () => {
      const outer = document.createElement("div");
      const a = document.createElement("a");
      const container = document.createElement("div");
      const text = document.createTextNode("text");
      container.appendChild(text);
      a.appendChild(container);
      outer.appendChild(a);

      // The anchor is ABOVE the container, so searching from text within container won't find it
      expect(findLinkAncestor(text, container)).toBeNull();
    });
  });
});
