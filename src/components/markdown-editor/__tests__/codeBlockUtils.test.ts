import { describe, it, expect, afterEach } from "vitest";
import { ref } from "vue";
import {
  getTargetBlock,
  getCodeBlockWrapper,
  createCodeBlockWrapper,
  convertCodeBlockToParagraph,
  isConvertibleBlock,
} from "../codeBlockUtils";
import { useMarkdownSelection } from "../useMarkdownSelection";
import { createTestEditor, TestEditorResult } from "./editorTestUtils";

describe("codeBlockUtils", () => {
  let editor: TestEditorResult;

  afterEach(() => {
    if (editor) editor.destroy();
  });

  describe("getTargetBlock", () => {
    it("returns paragraph element when cursor is in a paragraph", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const contentRef = editor.contentRef;
      const selection = useMarkdownSelection(contentRef);
      editor.setCursorInBlock(0, 3);

      const result = getTargetBlock(contentRef, selection);
      expect(result?.tagName).toBe("P");
    });

    it("returns null when contentRef is null", () => {
      editor = createTestEditor("<p>Hello</p>");
      const nullRef = ref<HTMLElement | null>(null);
      const selection = useMarkdownSelection(nullRef);

      const result = getTargetBlock(nullRef, selection);
      expect(result).toBeNull();
    });

    it("returns LI when cursor is in a list item", () => {
      editor = createTestEditor("<ul><li>Item one</li></ul>");
      const contentRef = editor.contentRef;
      const selection = useMarkdownSelection(contentRef);

      const li = editor.container.querySelector("li")!;
      editor.setCursor(li.firstChild!, 2);

      const result = getTargetBlock(contentRef, selection);
      expect(result?.tagName).toBe("LI");
    });

    it("returns code block wrapper when cursor is in a code block", () => {
      editor = createTestEditor('<div data-code-block-id="cb1"><span>code</span></div>');
      const contentRef = editor.contentRef;
      const selection = useMarkdownSelection(contentRef);

      const span = editor.container.querySelector("span")!;
      editor.setCursor(span.firstChild!, 2);

      const result = getTargetBlock(contentRef, selection);
      expect(result?.hasAttribute("data-code-block-id")).toBe(true);
    });
  });

  describe("getCodeBlockWrapper", () => {
    it("returns the code block wrapper when cursor is inside one", () => {
      editor = createTestEditor('<div data-code-block-id="cb1"><p>code content</p></div>');
      const contentRef = editor.contentRef;
      const selection = useMarkdownSelection(contentRef);

      const p = editor.container.querySelector("p")!;
      editor.setCursor(p.firstChild!, 2);

      const result = getCodeBlockWrapper(selection);
      expect(result).not.toBeNull();
      expect(result?.getAttribute("data-code-block-id")).toBe("cb1");
    });

    it("returns null when cursor is not in a code block", () => {
      editor = createTestEditor("<p>Regular paragraph</p>");
      const contentRef = editor.contentRef;
      const selection = useMarkdownSelection(contentRef);
      editor.setCursorInBlock(0, 3);

      const result = getCodeBlockWrapper(selection);
      expect(result).toBeNull();
    });

    it("returns null when there is no current block", () => {
      editor = createTestEditor("<p>Text</p>");
      const selection = useMarkdownSelection(ref<HTMLElement | null>(null));

      const result = getCodeBlockWrapper(selection);
      expect(result).toBeNull();
    });
  });

  describe("createCodeBlockWrapper", () => {
    it("creates a wrapper with correct structure", () => {
      const { wrapper, id } = createCodeBlockWrapper("console.log('hi')", "javascript");

      expect(wrapper.tagName).toBe("DIV");
      expect(wrapper.className).toBe("code-block-wrapper");
      expect(wrapper.getAttribute("contenteditable")).toBe("false");
      expect(wrapper.getAttribute("data-code-block-id")).toBe(id);
      expect(id).toMatch(/^cb-/);
    });

    it("creates a mount point with data attributes", () => {
      const { wrapper } = createCodeBlockWrapper("const x = 1;", "typescript");

      const mountPoint = wrapper.querySelector(".code-viewer-mount-point");
      expect(mountPoint).not.toBeNull();
      expect(mountPoint?.getAttribute("data-content")).toBe("const x = 1;");
      expect(mountPoint?.getAttribute("data-language")).toBe("typescript");
    });

    it("handles empty content and language", () => {
      const { wrapper } = createCodeBlockWrapper("", "");

      const mountPoint = wrapper.querySelector(".code-viewer-mount-point");
      expect(mountPoint?.getAttribute("data-content")).toBe("");
      expect(mountPoint?.getAttribute("data-language")).toBe("");
    });

    it("generates unique IDs for each call", () => {
      const { id: id1 } = createCodeBlockWrapper("a", "js");
      const { id: id2 } = createCodeBlockWrapper("b", "js");
      expect(id1).not.toBe(id2);
    });
  });

  describe("convertCodeBlockToParagraph", () => {
    it("replaces wrapper with a paragraph containing the content", () => {
      const container = document.createElement("div");
      const wrapper = document.createElement("div");
      wrapper.setAttribute("data-code-block-id", "cb1");
      container.appendChild(wrapper);

      const codeBlocks = new Map([["cb1", { content: "hello world" }]]);
      const p = convertCodeBlockToParagraph(wrapper, codeBlocks);

      expect(p.tagName).toBe("P");
      expect(p.textContent).toBe("hello world");
      expect(container.contains(p)).toBe(true);
      expect(container.contains(wrapper)).toBe(false);
    });

    it("removes the code block from the map", () => {
      const container = document.createElement("div");
      const wrapper = document.createElement("div");
      wrapper.setAttribute("data-code-block-id", "cb1");
      container.appendChild(wrapper);

      const codeBlocks = new Map([["cb1", { content: "test" }]]);
      convertCodeBlockToParagraph(wrapper, codeBlocks);

      expect(codeBlocks.has("cb1")).toBe(false);
    });

    it("handles wrapper without data-code-block-id", () => {
      const container = document.createElement("div");
      const wrapper = document.createElement("div");
      container.appendChild(wrapper);

      const codeBlocks = new Map<string, { content: string }>();
      const p = convertCodeBlockToParagraph(wrapper, codeBlocks);

      expect(p.tagName).toBe("P");
      expect(p.textContent).toBe("");
    });

    it("handles wrapper with id not found in codeBlocks map", () => {
      const container = document.createElement("div");
      const wrapper = document.createElement("div");
      wrapper.setAttribute("data-code-block-id", "cb-missing");
      container.appendChild(wrapper);

      const codeBlocks = new Map<string, { content: string }>();
      const p = convertCodeBlockToParagraph(wrapper, codeBlocks);

      expect(p.textContent).toBe("");
    });

    it("handles wrapper with no parent node gracefully", () => {
      const wrapper = document.createElement("div");
      wrapper.setAttribute("data-code-block-id", "cb1");

      const codeBlocks = new Map([["cb1", { content: "orphan" }]]);
      const p = convertCodeBlockToParagraph(wrapper, codeBlocks);

      expect(p.tagName).toBe("P");
      expect(p.textContent).toBe("orphan");
    });
  });

  describe("isConvertibleBlock (re-export)", () => {
    it("returns true for P elements", () => {
      expect(isConvertibleBlock(document.createElement("p"))).toBe(true);
    });

    it("returns false for non-convertible elements", () => {
      expect(isConvertibleBlock(document.createElement("ul"))).toBe(false);
    });
  });
});
