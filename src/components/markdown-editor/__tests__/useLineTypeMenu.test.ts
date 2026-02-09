import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref } from "vue";
import { useLineTypeMenu } from "../useLineTypeMenu";
import { createMockEditor } from "./mockEditor";
import { UseMarkdownEditorReturn } from "../useMarkdownEditor";

describe("useLineTypeMenu", () => {
  let editor: UseMarkdownEditorReturn;
  let contentRef: ReturnType<typeof ref<HTMLElement | null>>;
  let isEditorFocused: ReturnType<typeof ref<boolean>>;

  beforeEach(() => {
    editor = createMockEditor();
    contentRef = ref<HTMLElement | null>(null);
    isEditorFocused = ref(false);
  });

  function createMenu() {
    return useLineTypeMenu({ contentRef, editor, isEditorFocused });
  }

  describe("currentLineType", () => {
    it("returns paragraph by default", () => {
      const menu = createMenu();
      expect(menu.currentLineType.value).toBe("paragraph");
    });

    it("returns heading type based on heading level", () => {
      (editor.headings.getCurrentHeadingLevel as ReturnType<typeof vi.fn>).mockReturnValue(2);
      const menu = createMenu();
      menu.updatePositionAndState();
      expect(menu.currentLineType.value).toBe("h2");
    });

    it("returns ul when in unordered list", () => {
      (editor.lists.getCurrentListType as ReturnType<typeof vi.fn>).mockReturnValue("ul");
      const menu = createMenu();
      menu.updatePositionAndState();
      expect(menu.currentLineType.value).toBe("ul");
    });

    it("returns ol when in ordered list", () => {
      (editor.lists.getCurrentListType as ReturnType<typeof vi.fn>).mockReturnValue("ol");
      const menu = createMenu();
      menu.updatePositionAndState();
      expect(menu.currentLineType.value).toBe("ol");
    });

    it("returns code when in code block", () => {
      (editor.codeBlocks.isInCodeBlock as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const menu = createMenu();
      menu.updatePositionAndState();
      expect(menu.currentLineType.value).toBe("code");
    });

    it("code block takes priority over list type", () => {
      (editor.codeBlocks.isInCodeBlock as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (editor.lists.getCurrentListType as ReturnType<typeof vi.fn>).mockReturnValue("ul");
      const menu = createMenu();
      menu.updatePositionAndState();
      expect(menu.currentLineType.value).toBe("code");
    });

    it("list type takes priority over heading level", () => {
      (editor.lists.getCurrentListType as ReturnType<typeof vi.fn>).mockReturnValue("ol");
      (editor.headings.getCurrentHeadingLevel as ReturnType<typeof vi.fn>).mockReturnValue(3);
      const menu = createMenu();
      menu.updatePositionAndState();
      expect(menu.currentLineType.value).toBe("ol");
    });
  });

  describe("menuStyle", () => {
    it("has opacity 0 when editor is not focused", () => {
      isEditorFocused.value = false;
      const menu = createMenu();
      expect(menu.menuStyle.value.opacity).toBe(0);
      expect(menu.menuStyle.value.pointerEvents).toBe("none");
    });

    it("has opacity 1 when editor is focused", () => {
      isEditorFocused.value = true;
      const menu = createMenu();
      expect(menu.menuStyle.value.opacity).toBe(1);
      expect(menu.menuStyle.value.pointerEvents).toBe("auto");
    });

    it("includes top position", () => {
      const menu = createMenu();
      expect(menu.menuStyle.value.top).toBe("0px");
    });
  });

  describe("onLineTypeChange", () => {
    it("changes to code block from text", () => {
      const menu = createMenu();
      menu.onLineTypeChange("code");
      expect(editor.codeBlocks.toggleCodeBlock).toHaveBeenCalled();
    });

    it("does nothing when already in code block and selecting code", () => {
      (editor.codeBlocks.isInCodeBlock as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const menu = createMenu();
      menu.onLineTypeChange("code");
      expect(editor.codeBlocks.toggleCodeBlock).not.toHaveBeenCalled();
    });

    it("converts list item to paragraph before switching to code", () => {
      (editor.lists.getCurrentListType as ReturnType<typeof vi.fn>).mockReturnValue("ul");
      const menu = createMenu();
      menu.onLineTypeChange("code");
      expect(editor.lists.convertCurrentListItemToParagraph).toHaveBeenCalled();
      expect(editor.codeBlocks.toggleCodeBlock).toHaveBeenCalled();
    });

    it("changes to unordered list", () => {
      const menu = createMenu();
      menu.onLineTypeChange("ul");
      expect(editor.lists.toggleUnorderedList).toHaveBeenCalled();
    });

    it("changes to ordered list", () => {
      const menu = createMenu();
      menu.onLineTypeChange("ol");
      expect(editor.lists.toggleOrderedList).toHaveBeenCalled();
    });

    it("exits code block before switching to list", () => {
      (editor.codeBlocks.isInCodeBlock as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const menu = createMenu();
      menu.onLineTypeChange("ul");
      expect(editor.codeBlocks.toggleCodeBlock).toHaveBeenCalled();
      expect(editor.lists.toggleUnorderedList).toHaveBeenCalled();
    });

    it("exits code block before switching to ol", () => {
      (editor.codeBlocks.isInCodeBlock as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const menu = createMenu();
      menu.onLineTypeChange("ol");
      expect(editor.codeBlocks.toggleCodeBlock).toHaveBeenCalled();
      expect(editor.lists.toggleOrderedList).toHaveBeenCalled();
    });

    it("changes to heading level", () => {
      const menu = createMenu();
      menu.onLineTypeChange("h3");
      expect(editor.headings.setHeadingLevel).toHaveBeenCalledWith(3);
    });

    it("changes to paragraph (h0)", () => {
      const menu = createMenu();
      menu.onLineTypeChange("paragraph");
      // level 0 means paragraph - setHeadingLevel should NOT be called for level 0
      expect(editor.headings.setHeadingLevel).not.toHaveBeenCalled();
    });

    it("exits code block before switching to heading", () => {
      (editor.codeBlocks.isInCodeBlock as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const menu = createMenu();
      menu.onLineTypeChange("h2");
      expect(editor.codeBlocks.toggleCodeBlock).toHaveBeenCalled();
      expect(editor.headings.setHeadingLevel).toHaveBeenCalledWith(2);
    });

    it("converts list item to paragraph before switching to heading", () => {
      (editor.lists.getCurrentListType as ReturnType<typeof vi.fn>).mockReturnValue("ol");
      const menu = createMenu();
      menu.onLineTypeChange("h1");
      expect(editor.lists.convertCurrentListItemToParagraph).toHaveBeenCalled();
      expect(editor.headings.setHeadingLevel).toHaveBeenCalledWith(1);
    });

    it("handles all heading levels h1-h6", () => {
      for (let i = 1; i <= 6; i++) {
        const freshEditor = createMockEditor();
        const menu = useLineTypeMenu({
          contentRef,
          editor: freshEditor,
          isEditorFocused,
        });
        menu.onLineTypeChange(`h${i}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6");
        expect(freshEditor.headings.setHeadingLevel).toHaveBeenCalledWith(i);
      }
    });
  });

  describe("setupListeners and cleanupListeners", () => {
    it("adds selectionchange listener on setup", () => {
      const addSpy = vi.spyOn(document, "addEventListener");
      const menu = createMenu();
      menu.setupListeners();

      const selectionCalls = addSpy.mock.calls.filter((c) => c[0] === "selectionchange");
      expect(selectionCalls.length).toBeGreaterThan(0);
      addSpy.mockRestore();
      menu.cleanupListeners();
    });

    it("removes selectionchange listener on cleanup", () => {
      const removeSpy = vi.spyOn(document, "removeEventListener");
      const menu = createMenu();
      menu.setupListeners();
      menu.cleanupListeners();

      const selectionCalls = removeSpy.mock.calls.filter((c) => c[0] === "selectionchange");
      expect(selectionCalls.length).toBeGreaterThan(0);
      removeSpy.mockRestore();
    });

    it("adds focusin and scroll listeners on content element", () => {
      const container = document.createElement("div");
      document.body.appendChild(container);
      contentRef.value = container;

      const addSpy = vi.spyOn(container, "addEventListener");
      const menu = createMenu();
      menu.setupListeners();

      const focusinCalls = addSpy.mock.calls.filter((c) => c[0] === "focusin");
      const scrollCalls = addSpy.mock.calls.filter((c) => c[0] === "scroll");
      expect(focusinCalls.length).toBeGreaterThan(0);
      expect(scrollCalls.length).toBeGreaterThan(0);

      addSpy.mockRestore();
      menu.cleanupListeners();
      container.remove();
    });

    it("removes focusin and scroll listeners on cleanup", () => {
      const container = document.createElement("div");
      document.body.appendChild(container);
      contentRef.value = container;

      const menu = createMenu();
      menu.setupListeners();

      const removeSpy = vi.spyOn(container, "removeEventListener");
      menu.cleanupListeners();

      const focusinCalls = removeSpy.mock.calls.filter((c) => c[0] === "focusin");
      const scrollCalls = removeSpy.mock.calls.filter((c) => c[0] === "scroll");
      expect(focusinCalls.length).toBeGreaterThan(0);
      expect(scrollCalls.length).toBeGreaterThan(0);

      removeSpy.mockRestore();
      container.remove();
    });
  });

  describe("updatePositionAndState", () => {
    it("reads heading level from editor", () => {
      (editor.headings.getCurrentHeadingLevel as ReturnType<typeof vi.fn>).mockReturnValue(4);
      const menu = createMenu();
      menu.updatePositionAndState();
      expect(editor.headings.getCurrentHeadingLevel).toHaveBeenCalled();
      expect(menu.currentLineType.value).toBe("h4");
    });

    it("reads list type from editor", () => {
      (editor.lists.getCurrentListType as ReturnType<typeof vi.fn>).mockReturnValue("ol");
      const menu = createMenu();
      menu.updatePositionAndState();
      expect(editor.lists.getCurrentListType).toHaveBeenCalled();
    });

    it("reads code block state from editor", () => {
      (editor.codeBlocks.isInCodeBlock as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const menu = createMenu();
      menu.updatePositionAndState();
      expect(editor.codeBlocks.isInCodeBlock).toHaveBeenCalled();
    });
  });
});
