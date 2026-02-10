import { describe, it, expect, vi, afterEach } from "vitest";
import { ref, nextTick } from "vue";
import { createCodeBlockHandlers } from "../editorCodeBlockHandlers";

describe("editorCodeBlockHandlers", () => {
  let contentEl: HTMLElement;

  function createDeps(content = "") {
    contentEl = document.createElement("div");
    contentEl.innerHTML = content;
    document.body.appendChild(contentEl);

    const deps = {
      contentRef: ref<HTMLElement | null>(contentEl),
      codeBlocksMap: new Map<string, unknown>(),
      debouncedSyncFromHtml: vi.fn(),
    };
    return deps;
  }

  afterEach(() => {
    if (contentEl?.parentNode) {
      document.body.removeChild(contentEl);
    }
  });

  describe("handleCodeBlockExit", () => {
    it("creates a paragraph after the code block wrapper", async () => {
      const deps = createDeps('<div data-code-block-id="cb1">code</div>');
      const { handleCodeBlockExit } = createCodeBlockHandlers(deps);

      handleCodeBlockExit("cb1");

      const p = contentEl.querySelector("p");
      expect(p).not.toBeNull();
      expect(p?.querySelector("br")).not.toBeNull();
    });

    it("calls debouncedSyncFromHtml", () => {
      const deps = createDeps('<div data-code-block-id="cb1">code</div>');
      const { handleCodeBlockExit } = createCodeBlockHandlers(deps);

      handleCodeBlockExit("cb1");
      expect(deps.debouncedSyncFromHtml).toHaveBeenCalled();
    });

    it("does nothing when contentRef is null", () => {
      const deps = createDeps('<div data-code-block-id="cb1">code</div>');
      deps.contentRef.value = null;
      const { handleCodeBlockExit } = createCodeBlockHandlers(deps);

      handleCodeBlockExit("cb1");
      expect(deps.debouncedSyncFromHtml).not.toHaveBeenCalled();
    });

    it("does nothing when wrapper not found", () => {
      const deps = createDeps("<div>no code block</div>");
      const { handleCodeBlockExit } = createCodeBlockHandlers(deps);

      handleCodeBlockExit("nonexistent");
      expect(deps.debouncedSyncFromHtml).not.toHaveBeenCalled();
    });

    it("positions cursor in the new paragraph", async () => {
      const deps = createDeps('<div data-code-block-id="cb1">code</div>');
      const { handleCodeBlockExit } = createCodeBlockHandlers(deps);

      handleCodeBlockExit("cb1");
      await nextTick();

      const sel = window.getSelection();
      expect(sel?.rangeCount).toBeGreaterThan(0);
    });
  });

  describe("handleCodeBlockDelete", () => {
    it("removes the code block wrapper from DOM", () => {
      const deps = createDeps('<div data-code-block-id="cb1">code</div>');
      deps.codeBlocksMap.set("cb1", {});
      const { handleCodeBlockDelete } = createCodeBlockHandlers(deps);

      handleCodeBlockDelete("cb1");
      expect(contentEl.querySelector('[data-code-block-id="cb1"]')).toBeNull();
    });

    it("removes id from codeBlocksMap", () => {
      const deps = createDeps('<div data-code-block-id="cb1">code</div>');
      deps.codeBlocksMap.set("cb1", {});
      const { handleCodeBlockDelete } = createCodeBlockHandlers(deps);

      handleCodeBlockDelete("cb1");
      expect(deps.codeBlocksMap.has("cb1")).toBe(false);
    });

    it("calls debouncedSyncFromHtml", () => {
      const deps = createDeps('<div data-code-block-id="cb1">code</div>');
      const { handleCodeBlockDelete } = createCodeBlockHandlers(deps);

      handleCodeBlockDelete("cb1");
      expect(deps.debouncedSyncFromHtml).toHaveBeenCalled();
    });

    it("does nothing when contentRef is null", () => {
      const deps = createDeps('<div data-code-block-id="cb1">code</div>');
      deps.contentRef.value = null;
      const { handleCodeBlockDelete } = createCodeBlockHandlers(deps);

      handleCodeBlockDelete("cb1");
      expect(deps.debouncedSyncFromHtml).not.toHaveBeenCalled();
    });

    it("does nothing when wrapper not found", () => {
      const deps = createDeps("<div>no code block</div>");
      const { handleCodeBlockDelete } = createCodeBlockHandlers(deps);

      handleCodeBlockDelete("nonexistent");
      expect(deps.debouncedSyncFromHtml).not.toHaveBeenCalled();
    });

    it("positions cursor in previous sibling when available", async () => {
      const deps = createDeps('<p>before</p><div data-code-block-id="cb1">code</div>');
      const { handleCodeBlockDelete } = createCodeBlockHandlers(deps);

      handleCodeBlockDelete("cb1");
      await nextTick();

      const sel = window.getSelection();
      expect(sel?.rangeCount).toBeGreaterThan(0);
    });

    it("positions cursor in next sibling when no previous", async () => {
      const deps = createDeps('<div data-code-block-id="cb1">code</div><p>after</p>');
      const { handleCodeBlockDelete } = createCodeBlockHandlers(deps);

      handleCodeBlockDelete("cb1");
      await nextTick();

      const sel = window.getSelection();
      expect(sel?.rangeCount).toBeGreaterThan(0);
    });

    it("creates empty paragraph when no siblings remain", async () => {
      const deps = createDeps('<div data-code-block-id="cb1">code</div>');
      const { handleCodeBlockDelete } = createCodeBlockHandlers(deps);

      handleCodeBlockDelete("cb1");
      await nextTick();

      const p = contentEl.querySelector("p");
      expect(p).not.toBeNull();
      expect(p?.querySelector("br")).not.toBeNull();
    });
  });
});
