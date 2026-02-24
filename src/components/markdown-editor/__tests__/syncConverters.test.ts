import { describe, it, expect, vi } from "vitest";
import {
  generateCodeBlockId,
  generateTokenId,
  convertCodeBlocksToWrappers,
  convertTokensToWrappers,
  buildEditorElementProcessor,
} from "../syncConverters";
import type { TokenRenderer } from "../types";

describe("syncConverters", () => {
  describe("generateCodeBlockId", () => {
    it("generates IDs starting with cb- prefix", () => {
      const id = generateCodeBlockId();
      expect(id).toMatch(/^cb-/);
    });

    it("generates unique IDs", () => {
      const id1 = generateCodeBlockId();
      const id2 = generateCodeBlockId();
      expect(id1).not.toBe(id2);
    });
  });

  describe("generateTokenId", () => {
    it("generates IDs starting with tok- prefix", () => {
      const id = generateTokenId();
      expect(id).toMatch(/^tok-/);
    });

    it("generates unique IDs", () => {
      const id1 = generateTokenId();
      const id2 = generateTokenId();
      expect(id1).not.toBe(id2);
    });
  });

  describe("convertCodeBlocksToWrappers", () => {
    it("converts pre>code to wrapper structure", () => {
      const html = '<pre><code class="language-javascript">const x = 1;</code></pre>';
      const result = convertCodeBlocksToWrappers(html);

      const temp = document.createElement("div");
      temp.innerHTML = result;

      const wrapper = temp.querySelector(".code-block-wrapper");
      expect(wrapper).not.toBeNull();
      expect(wrapper?.getAttribute("contenteditable")).toBe("false");
      expect(wrapper?.hasAttribute("data-code-block-id")).toBe(true);

      const mountPoint = wrapper?.querySelector(".code-viewer-mount-point");
      expect(mountPoint?.getAttribute("data-content")).toBe("const x = 1;");
      expect(mountPoint?.getAttribute("data-language")).toBe("javascript");
    });

    it("skips pre elements without code child", () => {
      const html = "<pre>plain preformatted</pre>";
      const result = convertCodeBlocksToWrappers(html);

      const temp = document.createElement("div");
      temp.innerHTML = result;

      expect(temp.querySelector(".code-block-wrapper")).toBeNull();
      expect(temp.querySelector("pre")).not.toBeNull();
    });

    it("handles code without language class", () => {
      const html = "<pre><code>no language</code></pre>";
      const registerCodeBlock = vi.fn();
      convertCodeBlocksToWrappers(html, registerCodeBlock);

      expect(registerCodeBlock).toHaveBeenCalledWith(
        expect.stringMatching(/^cb-/),
        "no language",
        ""
      );
    });

    it("calls registerCodeBlock when provided", () => {
      const html = '<pre><code class="language-python">print("hi")</code></pre>';
      const registerCodeBlock = vi.fn();
      convertCodeBlocksToWrappers(html, registerCodeBlock);

      expect(registerCodeBlock).toHaveBeenCalledTimes(1);
      expect(registerCodeBlock).toHaveBeenCalledWith(
        expect.stringMatching(/^cb-/),
        'print("hi")',
        "python"
      );
    });

    it("does not call registerCodeBlock when not provided", () => {
      const html = '<pre><code class="language-js">code</code></pre>';
      // Should not throw
      const result = convertCodeBlocksToWrappers(html);
      expect(result).toContain("code-block-wrapper");
    });

    it("sets data-auto-detected on mount point when code has autodetected attribute", () => {
      const html = '<pre><code class="language-json" autodetected>{"a": 1}</code></pre>';
      const result = convertCodeBlocksToWrappers(html);

      const temp = document.createElement("div");
      temp.innerHTML = result;

      const mountPoint = temp.querySelector(".code-viewer-mount-point");
      expect(mountPoint?.getAttribute("data-auto-detected")).toBe("true");
    });

    it("does not set data-auto-detected when code lacks autodetected attribute", () => {
      const html = '<pre><code class="language-json">{"a": 1}</code></pre>';
      const result = convertCodeBlocksToWrappers(html);

      const temp = document.createElement("div");
      temp.innerHTML = result;

      const mountPoint = temp.querySelector(".code-viewer-mount-point");
      expect(mountPoint?.hasAttribute("data-auto-detected")).toBe(false);
    });
  });

  describe("convertTokensToWrappers", () => {
    function createRenderer(overrides: Partial<TokenRenderer> = {}): TokenRenderer {
      return {
        id: "test-token",
        pattern: /\{\{(\d+)\}\}/g,
        toHtml: (_match, groups) => `<span>${groups[0]}</span>`,
        component: {} as never,
        getProps: (groups) => ({ id: groups[0] }),
        toMarkdown: (el) => `{{${el.getAttribute("data-token-groups")}}}`,
        ...overrides,
      };
    }

    it("returns html unchanged when no renderers provided", () => {
      const html = "<p>Hello {{42}} world</p>";
      expect(convertTokensToWrappers(html)).toBe(html);
    });

    it("returns html unchanged when renderers is empty array", () => {
      const html = "<p>Hello {{42}} world</p>";
      expect(convertTokensToWrappers(html, [])).toBe(html);
    });

    it("converts token patterns to wrapper spans", () => {
      const renderer = createRenderer();
      const html = "<p>Hello {{42}} world</p>";
      const result = convertTokensToWrappers(html, [renderer]);

      expect(result).toContain("custom-token-wrapper");
      expect(result).toContain("data-token-id");
      expect(result).toContain("data-token-renderer");
      expect(result).toContain("token-mount-point");
    });

    it("calls registerToken for each match", () => {
      const registerToken = vi.fn();
      const renderer = createRenderer();
      convertTokensToWrappers("<p>{{42}}</p>", [renderer], registerToken);

      expect(registerToken).toHaveBeenCalledTimes(1);
      expect(registerToken).toHaveBeenCalledWith(expect.stringMatching(/^tok-/), "test-token", [
        "42",
      ]);
    });

    it("does not call registerToken when not provided", () => {
      const renderer = createRenderer();
      // Should not throw
      const result = convertTokensToWrappers("<p>{{42}}</p>", [renderer]);
      expect(result).toContain("custom-token-wrapper");
    });
  });

  describe("buildEditorElementProcessor", () => {
    it("returns undefined when no getCodeBlockById and no tokenRenderers", () => {
      const processor = buildEditorElementProcessor();
      expect(processor).toBeUndefined();
    });

    it("returns undefined when tokenRenderers is empty and no getCodeBlockById", () => {
      const processor = buildEditorElementProcessor(undefined, []);
      expect(processor).toBeUndefined();
    });

    it("processes code block elements using getCodeBlockById", () => {
      const getCodeBlockById = vi.fn((id: string) =>
        id === "cb-1" ? { id: "cb-1", content: "const x = 1;", language: "javascript" } : undefined
      );
      const processor = buildEditorElementProcessor(getCodeBlockById);
      expect(processor).toBeDefined();

      const el = document.createElement("div");
      el.setAttribute("data-code-block-id", "cb-1");
      const result = processor!(el);
      expect(result).toBe("```javascript\nconst x = 1;\n```\n\n");
    });

    it("returns null for code block not found in state", () => {
      const getCodeBlockById = vi.fn(() => undefined);
      const processor = buildEditorElementProcessor(getCodeBlockById);

      const el = document.createElement("div");
      el.setAttribute("data-code-block-id", "cb-missing");
      const result = processor!(el);
      expect(result).toBeNull();
    });

    it("processes token elements using getTokenById and renderer.toMarkdown", () => {
      const renderer: TokenRenderer = {
        id: "test-token",
        pattern: /\{\{(\d+)\}\}/g,
        toHtml: () => "",
        component: {} as never,
        getProps: () => ({}),
        toMarkdown: (el) => {
          const groups = JSON.parse(el.getAttribute("data-token-groups") || "[]");
          return `{{${groups[0]}}}`;
        },
      };
      const getTokenById = vi.fn((id: string) =>
        id === "tok-1" ? { id: "tok-1", rendererId: "test-token", groups: ["42"] } : undefined
      );

      const processor = buildEditorElementProcessor(undefined, [renderer], getTokenById);
      expect(processor).toBeDefined();

      const el = document.createElement("span");
      el.setAttribute("data-token-id", "tok-1");
      el.setAttribute("data-token-groups", '["42"]');
      const result = processor!(el);
      expect(result).toBe("{{42}}");
    });

    it("returns null for token not found in state", () => {
      const renderer: TokenRenderer = {
        id: "test-token",
        pattern: /\{\{(\d+)\}\}/g,
        toHtml: () => "",
        component: {} as never,
        getProps: () => ({}),
        toMarkdown: () => "unreachable",
      };
      const getTokenById = vi.fn(() => undefined);

      const processor = buildEditorElementProcessor(undefined, [renderer], getTokenById);

      const el = document.createElement("span");
      el.setAttribute("data-token-id", "tok-missing");
      const result = processor!(el);
      expect(result).toBeNull();
    });

    it("returns null for token with renderer not found", () => {
      const renderer: TokenRenderer = {
        id: "test-token",
        pattern: /\{\{(\d+)\}\}/g,
        toHtml: () => "",
        component: {} as never,
        getProps: () => ({}),
        toMarkdown: () => "unreachable",
      };
      const getTokenById = vi.fn(() => ({
        id: "tok-1",
        rendererId: "nonexistent-renderer",
        groups: ["42"],
      }));

      const processor = buildEditorElementProcessor(undefined, [renderer], getTokenById);

      const el = document.createElement("span");
      el.setAttribute("data-token-id", "tok-1");
      const result = processor!(el);
      expect(result).toBeNull();
    });

    it("returns null for elements without data-code-block-id or data-token-id", () => {
      const getCodeBlockById = vi.fn(() => undefined);
      const processor = buildEditorElementProcessor(getCodeBlockById);

      const el = document.createElement("div");
      const result = processor!(el);
      expect(result).toBeNull();
    });

    it("strips zero-width spaces from code block content", () => {
      const getCodeBlockById = vi.fn(() => ({
        id: "cb-1",
        content: "hello\u200Bworld",
        language: "",
      }));
      const processor = buildEditorElementProcessor(getCodeBlockById);

      const el = document.createElement("div");
      el.setAttribute("data-code-block-id", "cb-1");
      const result = processor!(el);
      expect(result).toBe("```\nhelloworld\n```\n\n");
    });
  });
});
