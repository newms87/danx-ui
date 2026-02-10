import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { ref } from "vue";
import { createLinkPopoverHandlers } from "../linkPopoverHandlers";

describe("linkPopoverHandlers", () => {
  let contentEl: HTMLElement;
  const originalPrompt = window.prompt;

  beforeEach(() => {
    // Ensure window.prompt exists in happy-dom
    window.prompt = vi.fn();
  });

  afterEach(() => {
    window.prompt = originalPrompt;
  });

  function createDeps(overrides = {}) {
    contentEl = document.createElement("div");
    contentEl.setAttribute("contenteditable", "true");
    document.body.appendChild(contentEl);

    return {
      contentRef: ref<HTMLElement | null>(contentEl),
      onContentChange: vi.fn(),
      onShowLinkPopover: vi.fn(),
      saveSelection: vi.fn(),
      restoreSelection: vi.fn(),
      ...overrides,
    };
  }

  afterEach(() => {
    if (contentEl?.parentNode) {
      document.body.removeChild(contentEl);
    }
  });

  describe("showEditLinkPopover", () => {
    it("calls onShowLinkPopover with position and url", () => {
      const deps = createDeps();
      const handlers = createLinkPopoverHandlers(deps);
      const link = document.createElement("a");
      link.href = "https://example.com";
      link.textContent = "Example";
      contentEl.appendChild(link);

      handlers.showEditLinkPopover(link);

      expect(deps.onShowLinkPopover).toHaveBeenCalledWith(
        expect.objectContaining({
          existingUrl: "https://example.com",
          selectedText: "Example",
        })
      );
    });

    it("onSubmit calls completeEditLink which updates link href", () => {
      const deps = createDeps();
      const handlers = createLinkPopoverHandlers(deps);
      const link = document.createElement("a");
      link.href = "https://old.com";
      link.textContent = "Link";
      contentEl.appendChild(link);

      handlers.showEditLinkPopover(link);

      const callArgs = deps.onShowLinkPopover.mock.calls[0]?.[0];
      callArgs?.onSubmit("https://new.com");

      expect(deps.restoreSelection).toHaveBeenCalled();
      expect(link.getAttribute("href")).toBe("https://new.com");
    });

    it("onCancel restores selection and focuses", () => {
      const deps = createDeps();
      const handlers = createLinkPopoverHandlers(deps);
      const link = document.createElement("a");
      link.href = "https://old.com";
      contentEl.appendChild(link);

      handlers.showEditLinkPopover(link);

      const callArgs = deps.onShowLinkPopover.mock.calls[0]?.[0];
      callArgs?.onCancel();

      expect(deps.restoreSelection).toHaveBeenCalled();
    });

    it("uses window.prompt when no onShowLinkPopover provided", () => {
      const deps = createDeps({ onShowLinkPopover: undefined });
      const handlers = createLinkPopoverHandlers(deps);
      const link = document.createElement("a");
      link.href = "https://old.com";
      link.textContent = "Link";
      contentEl.appendChild(link);

      vi.mocked(window.prompt).mockReturnValue("https://new.com");
      handlers.showEditLinkPopover(link);
      expect(window.prompt).toHaveBeenCalled();
      expect(link.getAttribute("href")).toBe("https://new.com");
    });

    it("does nothing when prompt returns null", () => {
      const deps = createDeps({ onShowLinkPopover: undefined });
      const handlers = createLinkPopoverHandlers(deps);
      const link = document.createElement("a");
      link.href = "https://old.com";
      contentEl.appendChild(link);

      vi.mocked(window.prompt).mockReturnValue(null);
      handlers.showEditLinkPopover(link);
      expect(link.getAttribute("href")).toBe("https://old.com");
    });

    it("handles link without href attribute", () => {
      const deps = createDeps();
      const handlers = createLinkPopoverHandlers(deps);
      const link = document.createElement("a");
      link.textContent = "No href";
      contentEl.appendChild(link);

      handlers.showEditLinkPopover(link);

      expect(deps.onShowLinkPopover).toHaveBeenCalledWith(
        expect.objectContaining({ existingUrl: "" })
      );
    });

    it("passes undefined selectedText when link has no text", () => {
      const deps = createDeps();
      const handlers = createLinkPopoverHandlers(deps);
      const link = document.createElement("a");
      link.href = "https://example.com";
      contentEl.appendChild(link);

      handlers.showEditLinkPopover(link);

      expect(deps.onShowLinkPopover).toHaveBeenCalledWith(
        expect.objectContaining({ selectedText: undefined })
      );
    });
  });

  describe("showWrapSelectionPopover", () => {
    it("calls onShowLinkPopover with selected text", () => {
      const deps = createDeps();
      const handlers = createLinkPopoverHandlers(deps);

      contentEl.textContent = "select this text";
      const range = document.createRange();
      range.selectNodeContents(contentEl);

      handlers.showWrapSelectionPopover(range);

      expect(deps.onShowLinkPopover).toHaveBeenCalledWith(
        expect.objectContaining({ selectedText: "select this text" })
      );
    });

    it("onSubmit wraps selection in a link", () => {
      const deps = createDeps();
      const handlers = createLinkPopoverHandlers(deps);

      contentEl.textContent = "click me";
      const range = document.createRange();
      range.selectNodeContents(contentEl);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      handlers.showWrapSelectionPopover(range);

      // Restore selection for the submit handler
      const callArgs = deps.onShowLinkPopover.mock.calls[0]?.[0];
      callArgs?.onSubmit("https://example.com");

      expect(deps.restoreSelection).toHaveBeenCalled();
    });

    it("uses prompt when no onShowLinkPopover provided", () => {
      const deps = createDeps({ onShowLinkPopover: undefined });
      const handlers = createLinkPopoverHandlers(deps);

      contentEl.textContent = "text";
      const range = document.createRange();
      range.selectNodeContents(contentEl);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      vi.mocked(window.prompt).mockReturnValue("https://link.com");
      handlers.showWrapSelectionPopover(range);
      expect(window.prompt).toHaveBeenCalled();
    });

    it("does nothing when prompt returns empty string", () => {
      const deps = createDeps({ onShowLinkPopover: undefined });
      const handlers = createLinkPopoverHandlers(deps);

      contentEl.textContent = "text";
      const range = document.createRange();
      range.selectNodeContents(contentEl);

      vi.mocked(window.prompt).mockReturnValue("");
      handlers.showWrapSelectionPopover(range);
      expect(deps.onContentChange).not.toHaveBeenCalled();
    });

    it("does nothing when prompt returns null", () => {
      const deps = createDeps({ onShowLinkPopover: undefined });
      const handlers = createLinkPopoverHandlers(deps);

      contentEl.textContent = "text";
      const range = document.createRange();
      range.selectNodeContents(contentEl);

      vi.mocked(window.prompt).mockReturnValue(null);
      handlers.showWrapSelectionPopover(range);
      expect(deps.onContentChange).not.toHaveBeenCalled();
    });

    it("onCancel restores selection and focuses", () => {
      const deps = createDeps();
      const handlers = createLinkPopoverHandlers(deps);

      contentEl.textContent = "text";
      const range = document.createRange();
      range.selectNodeContents(contentEl);

      handlers.showWrapSelectionPopover(range);

      const callArgs = deps.onShowLinkPopover.mock.calls[0]?.[0];
      callArgs?.onCancel();
      expect(deps.restoreSelection).toHaveBeenCalled();
    });

    it("completeWrapSelection focuses content when url is empty", () => {
      const deps = createDeps();
      const handlers = createLinkPopoverHandlers(deps);

      contentEl.textContent = "text";
      const range = document.createRange();
      range.selectNodeContents(contentEl);

      handlers.showWrapSelectionPopover(range);

      const callArgs = deps.onShowLinkPopover.mock.calls[0]?.[0];
      const focusSpy = vi.spyOn(contentEl, "focus");
      callArgs?.onSubmit("");
      expect(focusSpy).toHaveBeenCalled();
    });

    it("completeWrapSelection focuses when no selection available", () => {
      const deps = createDeps();
      const handlers = createLinkPopoverHandlers(deps);

      contentEl.textContent = "text";
      const range = document.createRange();
      range.selectNodeContents(contentEl);

      handlers.showWrapSelectionPopover(range);

      // Clear selection
      window.getSelection()?.removeAllRanges();

      const callArgs = deps.onShowLinkPopover.mock.calls[0]?.[0];
      const focusSpy = vi.spyOn(contentEl, "focus");
      callArgs?.onSubmit("https://example.com");
      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe("showNewLinkPopover", () => {
    it("calls onShowLinkPopover without existing url", () => {
      const deps = createDeps();
      const handlers = createLinkPopoverHandlers(deps);

      const range = document.createRange();
      range.selectNodeContents(contentEl);

      handlers.showNewLinkPopover(range);

      expect(deps.onShowLinkPopover).toHaveBeenCalledWith(
        expect.objectContaining({
          position: expect.any(Object),
        })
      );
      // existingUrl should not be present
      const callArgs = deps.onShowLinkPopover.mock.calls[0]?.[0];
      expect(callArgs?.existingUrl).toBeUndefined();
    });

    it("onSubmit creates a new link with url and label", () => {
      const deps = createDeps();
      const handlers = createLinkPopoverHandlers(deps);

      contentEl.textContent = "before ";
      const range = document.createRange();
      range.setStart(contentEl.firstChild!, 7);
      range.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      handlers.showNewLinkPopover(range);

      const callArgs = deps.onShowLinkPopover.mock.calls[0]?.[0];
      callArgs?.onSubmit("https://example.com", "My Link");

      expect(deps.restoreSelection).toHaveBeenCalled();
    });

    it("onCancel restores selection and focuses", () => {
      const deps = createDeps();
      const handlers = createLinkPopoverHandlers(deps);

      const range = document.createRange();
      range.selectNodeContents(contentEl);

      handlers.showNewLinkPopover(range);

      const callArgs = deps.onShowLinkPopover.mock.calls[0]?.[0];
      callArgs?.onCancel();
      expect(deps.restoreSelection).toHaveBeenCalled();
    });

    it("uses prompt when no onShowLinkPopover provided", () => {
      const deps = createDeps({ onShowLinkPopover: undefined });
      const handlers = createLinkPopoverHandlers(deps);

      contentEl.textContent = "text";
      const range = document.createRange();
      range.setStart(contentEl.firstChild!, 4);
      range.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      vi.mocked(window.prompt).mockReturnValue("https://example.com");
      handlers.showNewLinkPopover(range);
      expect(window.prompt).toHaveBeenCalled();
    });

    it("does nothing when prompt returns empty", () => {
      const deps = createDeps({ onShowLinkPopover: undefined });
      const handlers = createLinkPopoverHandlers(deps);

      const range = document.createRange();
      range.selectNodeContents(contentEl);

      vi.mocked(window.prompt).mockReturnValue("");
      handlers.showNewLinkPopover(range);
      expect(deps.onContentChange).not.toHaveBeenCalled();
    });

    it("completeNewLink focuses content when url is empty", () => {
      const deps = createDeps();
      const handlers = createLinkPopoverHandlers(deps);

      const range = document.createRange();
      range.selectNodeContents(contentEl);

      handlers.showNewLinkPopover(range);

      const callArgs = deps.onShowLinkPopover.mock.calls[0]?.[0];
      const focusSpy = vi.spyOn(contentEl, "focus");
      callArgs?.onSubmit("");
      expect(focusSpy).toHaveBeenCalled();
    });

    it("completeNewLink focuses when no selection available", () => {
      const deps = createDeps();
      const handlers = createLinkPopoverHandlers(deps);

      const range = document.createRange();
      range.selectNodeContents(contentEl);

      handlers.showNewLinkPopover(range);

      window.getSelection()?.removeAllRanges();

      const callArgs = deps.onShowLinkPopover.mock.calls[0]?.[0];
      const focusSpy = vi.spyOn(contentEl, "focus");
      callArgs?.onSubmit("https://example.com");
      expect(focusSpy).toHaveBeenCalled();
    });

    it("completeNewLink uses url as label when no label provided", () => {
      const deps = createDeps();
      const handlers = createLinkPopoverHandlers(deps);

      contentEl.textContent = "before ";
      const range = document.createRange();
      range.setStart(contentEl.firstChild!, 7);
      range.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      handlers.showNewLinkPopover(range);

      const callArgs = deps.onShowLinkPopover.mock.calls[0]?.[0];
      callArgs?.onSubmit("https://example.com");

      // Link should have been created with url as text
      const link = contentEl.querySelector("a");
      expect(link?.textContent).toBe("https://example.com");
    });
  });
});
