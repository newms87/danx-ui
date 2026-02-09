import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Ref, ref } from "vue";
import { useMarkdownSync } from "../useMarkdownSync";
import type { TokenRenderer } from "../types";
import type { CodeBlockState } from "../useCodeBlocks";

describe("useMarkdownSync", () => {
  let contentRef: Ref<HTMLElement | null>;
  let onEmitValue: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    contentRef = ref(el) as Ref<HTMLElement | null>;
    onEmitValue = vi.fn();
  });

  afterEach(() => {
    contentRef.value?.remove();
  });

  /**
   * Create a useMarkdownSync instance with default options.
   * Accepts optional overrides for code block and token support.
   */
  function createSync(overrides: Partial<Parameters<typeof useMarkdownSync>[0]> = {}) {
    return useMarkdownSync({
      contentRef,
      onEmitValue: onEmitValue as unknown as (markdown: string) => void,
      ...overrides,
    });
  }

  // =========================================================================
  // syncFromMarkdown
  // =========================================================================

  describe("syncFromMarkdown", () => {
    it("converts a basic paragraph", () => {
      const { syncFromMarkdown, renderedHtml } = createSync();
      syncFromMarkdown("Hello world");
      expect(renderedHtml.value).toContain("<p>Hello world</p>");
    });

    it("converts headings", () => {
      const { syncFromMarkdown, renderedHtml } = createSync();
      syncFromMarkdown("# Heading 1\n\n## Heading 2\n\n### Heading 3");
      expect(renderedHtml.value).toContain("<h1>Heading 1</h1>");
      expect(renderedHtml.value).toContain("<h2>Heading 2</h2>");
      expect(renderedHtml.value).toContain("<h3>Heading 3</h3>");
    });

    it("converts bold and italic text", () => {
      const { syncFromMarkdown, renderedHtml } = createSync();
      syncFromMarkdown("**bold** and *italic*");
      expect(renderedHtml.value).toContain("<strong>bold</strong>");
      expect(renderedHtml.value).toContain("<em>italic</em>");
    });

    it("converts unordered lists", () => {
      const { syncFromMarkdown, renderedHtml } = createSync();
      syncFromMarkdown("- item one\n- item two\n- item three");
      expect(renderedHtml.value).toContain("<ul>");
      expect(renderedHtml.value).toContain("<li>");
      expect(renderedHtml.value).toContain("item one");
      expect(renderedHtml.value).toContain("item two");
      expect(renderedHtml.value).toContain("item three");
    });

    it("converts ordered lists", () => {
      const { syncFromMarkdown, renderedHtml } = createSync();
      syncFromMarkdown("1. first\n2. second\n3. third");
      expect(renderedHtml.value).toContain("<ol>");
      expect(renderedHtml.value).toContain("<li>");
      expect(renderedHtml.value).toContain("first");
    });

    it("converts blockquotes", () => {
      const { syncFromMarkdown, renderedHtml } = createSync();
      syncFromMarkdown("> This is a quote");
      expect(renderedHtml.value).toContain("<blockquote>");
      expect(renderedHtml.value).toContain("This is a quote");
    });

    it("converts tables", () => {
      const { syncFromMarkdown, renderedHtml } = createSync();
      syncFromMarkdown("| A | B |\n| --- | --- |\n| 1 | 2 |");
      expect(renderedHtml.value).toContain("<table>");
      expect(renderedHtml.value).toContain("<th>");
      expect(renderedHtml.value).toContain("<td>");
    });

    it("converts inline code", () => {
      const { syncFromMarkdown, renderedHtml } = createSync();
      syncFromMarkdown("Use `console.log()`");
      expect(renderedHtml.value).toContain("<code>console.log()</code>");
    });

    it("handles empty string input", () => {
      const { syncFromMarkdown, renderedHtml } = createSync();
      syncFromMarkdown("");
      expect(renderedHtml.value).toBe("");
    });

    it("handles multiple paragraphs", () => {
      const { syncFromMarkdown, renderedHtml } = createSync();
      syncFromMarkdown("First paragraph\n\nSecond paragraph");
      expect(renderedHtml.value).toContain("<p>First paragraph</p>");
      expect(renderedHtml.value).toContain("<p>Second paragraph</p>");
    });

    describe("code block wrappers", () => {
      it("converts <pre><code> to code-block-wrapper divs", () => {
        const { syncFromMarkdown, renderedHtml } = createSync();
        syncFromMarkdown("```javascript\nconst x = 1;\n```");

        const temp = document.createElement("div");
        temp.innerHTML = renderedHtml.value;

        // Should NOT have <pre><code> in the output
        expect(temp.querySelectorAll("pre").length).toBe(0);
        expect(temp.querySelectorAll("code").length).toBe(0);

        // Should have wrapper structure
        const wrapper = temp.querySelector(".code-block-wrapper");
        expect(wrapper).not.toBeNull();
        expect(wrapper?.getAttribute("contenteditable")).toBe("false");
        expect(wrapper?.hasAttribute("data-code-block-id")).toBe(true);

        const mountPoint = wrapper?.querySelector(".code-viewer-mount-point");
        expect(mountPoint).not.toBeNull();
        expect(mountPoint?.getAttribute("data-content")).toBe("const x = 1;");
        expect(mountPoint?.getAttribute("data-language")).toBe("javascript");
      });

      it("generates unique IDs for each code block", () => {
        const { syncFromMarkdown, renderedHtml } = createSync();
        syncFromMarkdown("```js\na\n```\n\n```py\nb\n```");

        const temp = document.createElement("div");
        temp.innerHTML = renderedHtml.value;

        const wrappers = temp.querySelectorAll(".code-block-wrapper");
        expect(wrappers.length).toBe(2);

        const id1 = wrappers[0]?.getAttribute("data-code-block-id");
        const id2 = wrappers[1]?.getAttribute("data-code-block-id");
        expect(id1).toBeTruthy();
        expect(id2).toBeTruthy();
        expect(id1).not.toBe(id2);
      });

      it("calls registerCodeBlock for each code block", () => {
        const registerCodeBlock = vi.fn();
        const { syncFromMarkdown } = createSync({ registerCodeBlock });
        syncFromMarkdown("```python\nprint('hi')\n```");

        expect(registerCodeBlock).toHaveBeenCalledTimes(1);
        expect(registerCodeBlock).toHaveBeenCalledWith(
          expect.stringMatching(/^cb-/),
          "print('hi')",
          "python"
        );
      });

      it("handles code block with no language", () => {
        const registerCodeBlock = vi.fn();
        const { syncFromMarkdown } = createSync({ registerCodeBlock });
        syncFromMarkdown("```\nsome code\n```");

        expect(registerCodeBlock).toHaveBeenCalledTimes(1);
        expect(registerCodeBlock).toHaveBeenCalledWith(
          expect.stringMatching(/^cb-/),
          "some code",
          ""
        );
      });

      it("does not call registerCodeBlock when callback is not provided", () => {
        const { syncFromMarkdown, renderedHtml } = createSync();
        syncFromMarkdown("```js\ncode\n```");

        // Should still convert to wrappers even without the callback
        const temp = document.createElement("div");
        temp.innerHTML = renderedHtml.value;
        expect(temp.querySelector(".code-block-wrapper")).not.toBeNull();
      });
    });

    describe("token wrappers", () => {
      function createTokenRenderer(overrides: Partial<TokenRenderer> = {}): TokenRenderer {
        return {
          id: "test-token",
          pattern: /\{\{(\d+)\}\}/g,
          toHtml: (_match, groups) => `<span>${groups[0]}</span>`,
          component: {} as any,
          getProps: (groups) => ({ id: groups[0] }),
          toMarkdown: (el) => `{{${el.getAttribute("data-token-groups")}}}`,
          ...overrides,
        };
      }

      it("converts token patterns to wrapper spans", () => {
        const renderer = createTokenRenderer();
        const { syncFromMarkdown, renderedHtml } = createSync({ tokenRenderers: [renderer] });
        syncFromMarkdown("Hello {{42}} world");

        const temp = document.createElement("div");
        temp.innerHTML = renderedHtml.value;

        const wrapper = temp.querySelector(".custom-token-wrapper");
        expect(wrapper).not.toBeNull();
        expect(wrapper?.getAttribute("contenteditable")).toBe("false");
        expect(wrapper?.hasAttribute("data-token-id")).toBe(true);
        expect(wrapper?.getAttribute("data-token-renderer")).toBe("test-token");

        const mountPoint = wrapper?.querySelector(".token-mount-point");
        expect(mountPoint).not.toBeNull();
      });

      it("calls registerToken for each token match", () => {
        const registerToken = vi.fn();
        const renderer = createTokenRenderer();
        const { syncFromMarkdown } = createSync({
          tokenRenderers: [renderer],
          registerToken,
        });
        syncFromMarkdown("Hello {{42}} world");

        expect(registerToken).toHaveBeenCalledTimes(1);
        expect(registerToken).toHaveBeenCalledWith(expect.stringMatching(/^tok-/), "test-token", [
          "42",
        ]);
      });

      it("handles multiple token matches", () => {
        const registerToken = vi.fn();
        const renderer = createTokenRenderer();
        const { syncFromMarkdown, renderedHtml } = createSync({
          tokenRenderers: [renderer],
          registerToken,
        });
        syncFromMarkdown("{{1}} and {{2}} and {{3}}");

        expect(registerToken).toHaveBeenCalledTimes(3);

        const temp = document.createElement("div");
        temp.innerHTML = renderedHtml.value;
        expect(temp.querySelectorAll(".custom-token-wrapper").length).toBe(3);
      });

      it("generates unique IDs for each token", () => {
        const renderer = createTokenRenderer();
        const { syncFromMarkdown, renderedHtml } = createSync({
          tokenRenderers: [renderer],
        });
        syncFromMarkdown("{{1}} and {{2}}");

        const temp = document.createElement("div");
        temp.innerHTML = renderedHtml.value;
        const wrappers = temp.querySelectorAll(".custom-token-wrapper");
        const id1 = wrappers[0]?.getAttribute("data-token-id");
        const id2 = wrappers[1]?.getAttribute("data-token-id");
        expect(id1).toBeTruthy();
        expect(id2).toBeTruthy();
        expect(id1).not.toBe(id2);
      });

      it("stores captured groups as JSON in data attribute", () => {
        const renderer = createTokenRenderer();
        const { syncFromMarkdown, renderedHtml } = createSync({
          tokenRenderers: [renderer],
        });
        syncFromMarkdown("{{99}}");

        const temp = document.createElement("div");
        temp.innerHTML = renderedHtml.value;
        const wrapper = temp.querySelector(".custom-token-wrapper");
        const groups = wrapper?.getAttribute("data-token-groups");
        expect(groups).toBe('["99"]');
      });

      it("does nothing when no tokenRenderers provided", () => {
        const { syncFromMarkdown, renderedHtml } = createSync();
        syncFromMarkdown("Hello {{42}} world");

        // The raw pattern should remain in the text (no wrappers created)
        expect(renderedHtml.value).not.toContain("custom-token-wrapper");
      });

      it("does nothing when tokenRenderers is empty array", () => {
        const { syncFromMarkdown, renderedHtml } = createSync({ tokenRenderers: [] });
        syncFromMarkdown("Hello {{42}} world");

        expect(renderedHtml.value).not.toContain("custom-token-wrapper");
      });
    });
  });

  // =========================================================================
  // syncFromHtml
  // =========================================================================

  describe("syncFromHtml", () => {
    it("converts HTML content to markdown and calls onEmitValue", () => {
      const { syncFromHtml } = createSync();
      contentRef.value!.innerHTML = "<p>Hello world</p>";

      syncFromHtml();

      expect(onEmitValue).toHaveBeenCalledTimes(1);
      expect(onEmitValue).toHaveBeenCalledWith("Hello world");
    });

    it("sets isInternalUpdate to true before emitting", () => {
      const { syncFromHtml, isInternalUpdate } = createSync();
      contentRef.value!.innerHTML = "<p>Test</p>";

      expect(isInternalUpdate.value).toBe(false);

      syncFromHtml();

      expect(isInternalUpdate.value).toBe(true);
    });

    it("does nothing when contentRef is null", () => {
      contentRef.value = null;
      const { syncFromHtml } = createSync();

      syncFromHtml();

      expect(onEmitValue).not.toHaveBeenCalled();
    });

    it("converts heading HTML to markdown", () => {
      const { syncFromHtml } = createSync();
      contentRef.value!.innerHTML = "<h2>Title</h2>";

      syncFromHtml();

      expect(onEmitValue).toHaveBeenCalledWith("## Title");
    });

    it("converts bold and italic HTML to markdown", () => {
      const { syncFromHtml } = createSync();
      contentRef.value!.innerHTML = "<p><strong>bold</strong> and <em>italic</em></p>";

      syncFromHtml();

      expect(onEmitValue).toHaveBeenCalledWith("**bold** and *italic*");
    });

    it("converts list HTML to markdown", () => {
      const { syncFromHtml } = createSync();
      contentRef.value!.innerHTML = "<ul><li>one</li><li>two</li></ul>";

      syncFromHtml();

      expect(onEmitValue).toHaveBeenCalledWith("- one\n- two");
    });

    describe("code block wrappers via customElementProcessor", () => {
      it("uses getCodeBlockById to look up content from reactive state", () => {
        const codeBlockState: CodeBlockState = {
          id: "cb-test-1",
          content: "const x = 42;",
          language: "javascript",
        };
        const getCodeBlockById = vi.fn((id: string) =>
          id === "cb-test-1" ? codeBlockState : undefined
        );

        const { syncFromHtml } = createSync({ getCodeBlockById });

        // Build code block wrapper in DOM
        contentRef.value!.innerHTML = `
					<div class="code-block-wrapper" contenteditable="false" data-code-block-id="cb-test-1">
						<div class="code-viewer-mount-point" data-content="stale content" data-language="javascript"></div>
					</div>
				`;

        syncFromHtml();

        expect(getCodeBlockById).toHaveBeenCalledWith("cb-test-1");
        expect(onEmitValue).toHaveBeenCalledWith("```javascript\nconst x = 42;\n```");
      });

      it("strips zero-width spaces from code block content", () => {
        const codeBlockState: CodeBlockState = {
          id: "cb-test-2",
          content: "hello\u200Bworld",
          language: "",
        };
        const getCodeBlockById = vi.fn((id: string) =>
          id === "cb-test-2" ? codeBlockState : undefined
        );

        const { syncFromHtml } = createSync({ getCodeBlockById });

        contentRef.value!.innerHTML = `
					<div class="code-block-wrapper" contenteditable="false" data-code-block-id="cb-test-2">
						<div class="code-viewer-mount-point"></div>
					</div>
				`;

        syncFromHtml();

        expect(onEmitValue).toHaveBeenCalledWith("```\nhelloworld\n```");
      });

      it("falls back to default processing when code block not found in state", () => {
        const getCodeBlockById = vi.fn(() => undefined);
        const { syncFromHtml } = createSync({ getCodeBlockById });

        contentRef.value!.innerHTML = `
					<div class="code-block-wrapper" contenteditable="false" data-code-block-id="cb-missing">
						<div class="code-viewer-mount-point" data-content="fallback" data-language="js"></div>
					</div>
				`;

        syncFromHtml();

        // Should fall through to default htmlToMarkdown processing (div handler for code-block-wrapper)
        expect(onEmitValue).toHaveBeenCalledTimes(1);
        const result = onEmitValue.mock.calls[0]![0] as string;
        expect(result).toContain("```");
      });
    });

    describe("token wrappers via customElementProcessor", () => {
      it("uses getTokenById and renderer.toMarkdown for token conversion", () => {
        const toMarkdown = vi.fn((el: HTMLElement) => {
          const groups = JSON.parse(el.getAttribute("data-token-groups") || "[]");
          return `{{${groups[0]}}}`;
        });
        const renderer: TokenRenderer = {
          id: "test-token",
          pattern: /\{\{(\d+)\}\}/g,
          toHtml: () => "",
          component: {} as any,
          getProps: () => ({}),
          toMarkdown,
        };
        const getTokenById = vi.fn((id: string) =>
          id === "tok-1" ? { id: "tok-1", rendererId: "test-token", groups: ["42"] } : undefined
        );

        const { syncFromHtml } = createSync({
          tokenRenderers: [renderer],
          getTokenById,
        });

        // Token wrapper as a block-level element (customElementProcessor is invoked
        // by processNode for direct children, not by processInlineContent inside <p>)
        contentRef.value!.innerHTML = `<span class="custom-token-wrapper" contenteditable="false" data-token-id="tok-1" data-token-renderer="test-token" data-token-groups='["42"]'><span class="token-mount-point"></span></span>`;

        syncFromHtml();

        expect(getTokenById).toHaveBeenCalledWith("tok-1");
        expect(toMarkdown).toHaveBeenCalledTimes(1);
        expect(onEmitValue).toHaveBeenCalledWith("{{42}}");
      });

      it("falls back to default processing when token not found in state", () => {
        const renderer: TokenRenderer = {
          id: "test-token",
          pattern: /\{\{(\d+)\}\}/g,
          toHtml: () => "",
          component: {} as any,
          getProps: () => ({}),
          toMarkdown: () => "unreachable",
        };
        const getTokenById = vi.fn(() => undefined);

        const { syncFromHtml } = createSync({
          tokenRenderers: [renderer],
          getTokenById,
        });

        contentRef.value!.innerHTML = `<span class="custom-token-wrapper" data-token-id="tok-missing" data-token-renderer="test-token"><span class="token-mount-point"></span></span>`;

        syncFromHtml();

        // Should not crash; falls through to default processing
        expect(onEmitValue).toHaveBeenCalledTimes(1);
      });
    });
  });

  // =========================================================================
  // debouncedSyncFromHtml
  // =========================================================================

  describe("debouncedSyncFromHtml", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("does not call onEmitValue immediately", () => {
      const { debouncedSyncFromHtml } = createSync();
      contentRef.value!.innerHTML = "<p>Test</p>";

      debouncedSyncFromHtml();

      expect(onEmitValue).not.toHaveBeenCalled();
    });

    it("calls onEmitValue after the debounce period", () => {
      const { debouncedSyncFromHtml } = createSync({ debounceMs: 300 });
      contentRef.value!.innerHTML = "<p>Test</p>";

      debouncedSyncFromHtml();
      vi.advanceTimersByTime(300);

      expect(onEmitValue).toHaveBeenCalledTimes(1);
      expect(onEmitValue).toHaveBeenCalledWith("Test");
    });

    it("resets the debounce when called again within the period", () => {
      const { debouncedSyncFromHtml } = createSync({ debounceMs: 300 });
      contentRef.value!.innerHTML = "<p>First</p>";

      debouncedSyncFromHtml();
      vi.advanceTimersByTime(200);

      // Update content and call again before the first debounce fires
      contentRef.value!.innerHTML = "<p>Second</p>";
      debouncedSyncFromHtml();

      vi.advanceTimersByTime(200);
      // Should not have fired yet (200ms after second call)
      expect(onEmitValue).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      // Now 300ms after the second call
      expect(onEmitValue).toHaveBeenCalledTimes(1);
      expect(onEmitValue).toHaveBeenCalledWith("Second");
    });

    it("uses custom debounce delay", () => {
      const { debouncedSyncFromHtml } = createSync({ debounceMs: 100 });
      contentRef.value!.innerHTML = "<p>Fast</p>";

      debouncedSyncFromHtml();
      vi.advanceTimersByTime(99);
      expect(onEmitValue).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(onEmitValue).toHaveBeenCalledTimes(1);
    });

    it("uses default 300ms debounce when not specified", () => {
      const { debouncedSyncFromHtml } = createSync();
      contentRef.value!.innerHTML = "<p>Default</p>";

      debouncedSyncFromHtml();
      vi.advanceTimersByTime(299);
      expect(onEmitValue).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(onEmitValue).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // buildEditorElementProcessor (tested indirectly via syncFromHtml)
  // =========================================================================

  describe("customElementProcessor construction", () => {
    it("returns no processor when neither getCodeBlockById nor tokenRenderers provided", () => {
      const { syncFromHtml } = createSync();

      // A code block wrapper in the DOM should be handled by the default htmlToMarkdown
      // behavior (which recognizes data-code-block-id on divs)
      contentRef.value!.innerHTML = `
				<div class="code-block-wrapper" data-code-block-id="cb-1">
					<div class="code-viewer-mount-point" data-content="hello" data-language="js"></div>
				</div>
			`;

      syncFromHtml();

      // Default htmlToMarkdown div handler picks up data-code-block-id
      expect(onEmitValue).toHaveBeenCalledWith("```js\nhello\n```");
    });

    it("processes code blocks but passes through other elements", () => {
      const codeBlockState: CodeBlockState = {
        id: "cb-mixed",
        content: "x = 1",
        language: "py",
      };
      const getCodeBlockById = vi.fn((id: string) =>
        id === "cb-mixed" ? codeBlockState : undefined
      );

      const { syncFromHtml } = createSync({ getCodeBlockById });

      contentRef.value!.innerHTML = `
				<p>Before</p>
				<div class="code-block-wrapper" contenteditable="false" data-code-block-id="cb-mixed">
					<div class="code-viewer-mount-point" data-content="stale" data-language="py"></div>
				</div>
				<p>After</p>
			`;

      syncFromHtml();

      const result = onEmitValue.mock.calls[0]![0] as string;
      expect(result).toContain("Before");
      expect(result).toContain("```py\nx = 1\n```");
      expect(result).toContain("After");
    });
  });

  // =========================================================================
  // isInternalUpdate flag behavior
  // =========================================================================

  describe("isInternalUpdate", () => {
    it("starts as false", () => {
      const { isInternalUpdate } = createSync();
      expect(isInternalUpdate.value).toBe(false);
    });

    it("is set to true by syncFromHtml", () => {
      const { syncFromHtml, isInternalUpdate } = createSync();
      contentRef.value!.innerHTML = "<p>Test</p>";

      syncFromHtml();

      expect(isInternalUpdate.value).toBe(true);
    });

    it("is not affected by syncFromMarkdown", () => {
      const { syncFromMarkdown, isInternalUpdate } = createSync();

      syncFromMarkdown("Test");

      expect(isInternalUpdate.value).toBe(false);
    });

    it("is set to true by debouncedSyncFromHtml after debounce", () => {
      vi.useFakeTimers();
      const { debouncedSyncFromHtml, isInternalUpdate } = createSync({ debounceMs: 100 });
      contentRef.value!.innerHTML = "<p>Test</p>";

      debouncedSyncFromHtml();
      expect(isInternalUpdate.value).toBe(false);

      vi.advanceTimersByTime(100);
      expect(isInternalUpdate.value).toBe(true);

      vi.useRealTimers();
    });
  });

  // =========================================================================
  // renderedHtml ref behavior
  // =========================================================================

  describe("renderedHtml", () => {
    it("starts as empty string", () => {
      const { renderedHtml } = createSync();
      expect(renderedHtml.value).toBe("");
    });

    it("is updated by syncFromMarkdown", () => {
      const { syncFromMarkdown, renderedHtml } = createSync();

      syncFromMarkdown("Hello");
      expect(renderedHtml.value).not.toBe("");

      syncFromMarkdown("");
      expect(renderedHtml.value).toBe("");
    });

    it("is not affected by syncFromHtml", () => {
      const { syncFromHtml, renderedHtml } = createSync();
      contentRef.value!.innerHTML = "<p>Test</p>";

      syncFromHtml();

      // syncFromHtml only emits markdown via onEmitValue; it does not update renderedHtml
      expect(renderedHtml.value).toBe("");
    });
  });
});
