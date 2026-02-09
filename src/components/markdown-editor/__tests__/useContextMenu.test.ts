import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useContextMenu } from "../useContextMenu";
import { createMockEditor } from "./mockEditor";
import { UseMarkdownEditorReturn } from "../useMarkdownEditor";

describe("useContextMenu", () => {
  let editor: UseMarkdownEditorReturn;

  beforeEach(() => {
    editor = createMockEditor();
  });

  function createMouseEvent(x = 100, y = 200): MouseEvent {
    const event = new MouseEvent("contextmenu", {
      clientX: x,
      clientY: y,
      bubbles: true,
      cancelable: true,
    });
    return event;
  }

  describe("initial state", () => {
    it("starts with isVisible false", () => {
      const menu = useContextMenu({ editor });
      expect(menu.isVisible.value).toBe(false);
    });

    it("starts with default position", () => {
      const menu = useContextMenu({ editor });
      expect(menu.position.value).toEqual({ x: 0, y: 0 });
    });

    it("starts with empty items", () => {
      const menu = useContextMenu({ editor });
      expect(menu.items.value).toEqual([]);
    });
  });

  describe("show", () => {
    it("sets isVisible to true", () => {
      const menu = useContextMenu({ editor });
      menu.show(createMouseEvent());
      expect(menu.isVisible.value).toBe(true);
    });

    it("sets position from mouse event", () => {
      const menu = useContextMenu({ editor });
      menu.show(createMouseEvent(150, 250));
      expect(menu.position.value).toEqual({ x: 150, y: 250 });
    });

    it("prevents default event behavior", () => {
      const menu = useContextMenu({ editor });
      const event = createMouseEvent();
      const preventSpy = vi.spyOn(event, "preventDefault");
      menu.show(event);
      expect(preventSpy).toHaveBeenCalled();
    });

    it("does not show in readonly mode", () => {
      const readonly = ref(true);
      const menu = useContextMenu({ editor, readonly });
      menu.show(createMouseEvent());
      expect(menu.isVisible.value).toBe(false);
    });

    it("shows when readonly is false", () => {
      const readonly = ref(false);
      const menu = useContextMenu({ editor, readonly });
      menu.show(createMouseEvent());
      expect(menu.isVisible.value).toBe(true);
    });
  });

  describe("hide", () => {
    it("sets isVisible to false", () => {
      const menu = useContextMenu({ editor });
      menu.show(createMouseEvent());
      expect(menu.isVisible.value).toBe(true);

      menu.hide();
      expect(menu.isVisible.value).toBe(false);
    });
  });

  describe("context detection and items", () => {
    it("builds code context menu when in code block", () => {
      (editor.codeBlocks.isInCodeBlock as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const menu = useContextMenu({ editor });
      menu.show(createMouseEvent());

      // Code context should have minimal menu - just toggle code block
      expect(menu.items.value.length).toBe(1);
      expect(menu.items.value[0].id).toBe("code-block");
      expect(menu.items.value[0].label).toBe("Toggle Code Block");
    });

    it("code context toggle action calls toggleCodeBlock", () => {
      (editor.codeBlocks.isInCodeBlock as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const menu = useContextMenu({ editor });
      menu.show(createMouseEvent());

      menu.items.value[0].action!();
      expect(editor.codeBlocks.toggleCodeBlock).toHaveBeenCalled();
    });

    it("builds table context menu when in table", () => {
      (editor.tables.isInTable as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const menu = useContextMenu({ editor });
      menu.show(createMouseEvent());

      const ids = menu.items.value.map((i) => i.id);
      expect(ids).toContain("format");
      expect(ids).toContain("insert-row-above");
      expect(ids).toContain("insert-row-below");
      expect(ids).toContain("insert-col-left");
      expect(ids).toContain("insert-col-right");
      expect(ids).toContain("delete-row");
      expect(ids).toContain("delete-col");
      expect(ids).toContain("delete-table");
      expect(ids).toContain("alignment");
    });

    it("table context includes alignment submenu with items", () => {
      (editor.tables.isInTable as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const menu = useContextMenu({ editor });
      menu.show(createMouseEvent());

      const alignmentItem = menu.items.value.find((i) => i.id === "alignment");
      expect(alignmentItem?.children).toBeDefined();
      expect(alignmentItem!.children!.length).toBe(3);

      const childIds = alignmentItem!.children!.map((c) => c.id);
      expect(childIds).toContain("align-left");
      expect(childIds).toContain("align-center");
      expect(childIds).toContain("align-right");
    });

    it("table context actions call correct editor methods", () => {
      (editor.tables.isInTable as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const menu = useContextMenu({ editor });
      menu.show(createMouseEvent());

      const findItem = (id: string) => menu.items.value.find((i) => i.id === id);

      findItem("insert-row-above")!.action!();
      expect(editor.tables.insertRowAbove).toHaveBeenCalled();

      findItem("insert-row-below")!.action!();
      expect(editor.tables.insertRowBelow).toHaveBeenCalled();

      findItem("insert-col-left")!.action!();
      expect(editor.tables.insertColumnLeft).toHaveBeenCalled();

      findItem("insert-col-right")!.action!();
      expect(editor.tables.insertColumnRight).toHaveBeenCalled();

      findItem("delete-row")!.action!();
      expect(editor.tables.deleteCurrentRow).toHaveBeenCalled();

      findItem("delete-col")!.action!();
      expect(editor.tables.deleteCurrentColumn).toHaveBeenCalled();

      findItem("delete-table")!.action!();
      expect(editor.tables.deleteTable).toHaveBeenCalled();
    });

    it("builds list context menu when in list", () => {
      (editor.lists.getCurrentListType as ReturnType<typeof vi.fn>).mockReturnValue("ul");
      const menu = useContextMenu({ editor });
      menu.show(createMouseEvent());

      const ids = menu.items.value.map((i) => i.id);
      expect(ids).toContain("format");
      expect(ids).toContain("lists");
      expect(ids).toContain("blocks");
      // Lists context should NOT have headings or tables
      expect(ids).not.toContain("headings");
    });

    it("list context lists submenu has correct items", () => {
      (editor.lists.getCurrentListType as ReturnType<typeof vi.fn>).mockReturnValue("ul");
      const menu = useContextMenu({ editor });
      menu.show(createMouseEvent());

      const listsItem = menu.items.value.find((i) => i.id === "lists");
      expect(listsItem?.children).toBeDefined();
      const childIds = listsItem!.children!.map((c) => c.id);
      expect(childIds).toContain("bullet-list");
      expect(childIds).toContain("numbered-list");
    });

    it("list context blocks submenu only has blockquote", () => {
      (editor.lists.getCurrentListType as ReturnType<typeof vi.fn>).mockReturnValue("ul");
      const menu = useContextMenu({ editor });
      menu.show(createMouseEvent());

      const blocksItem = menu.items.value.find((i) => i.id === "blocks");
      expect(blocksItem?.children).toBeDefined();
      expect(blocksItem!.children!.length).toBe(1);
      expect(blocksItem!.children![0].id).toBe("blockquote");
    });

    it("builds text context menu (full menu) when in normal text", () => {
      const menu = useContextMenu({ editor });
      menu.show(createMouseEvent());

      const ids = menu.items.value.map((i) => i.id);
      expect(ids).toContain("headings");
      expect(ids).toContain("format");
      expect(ids).toContain("lists");
      expect(ids).toContain("blocks");
    });

    it("text context headings submenu has paragraph and H1-H6", () => {
      const menu = useContextMenu({ editor });
      menu.show(createMouseEvent());

      const headingsItem = menu.items.value.find((i) => i.id === "headings");
      expect(headingsItem?.children).toBeDefined();
      expect(headingsItem!.children!.length).toBe(7); // paragraph + h1-h6

      const childIds = headingsItem!.children!.map((c) => c.id);
      expect(childIds).toContain("paragraph");
      expect(childIds).toContain("h1");
      expect(childIds).toContain("h6");
    });

    it("text context blocks submenu has code block, blockquote, and insert table", () => {
      const menu = useContextMenu({ editor });
      menu.show(createMouseEvent());

      const blocksItem = menu.items.value.find((i) => i.id === "blocks");
      expect(blocksItem?.children).toBeDefined();

      const childIds = blocksItem!.children!.map((c) => c.id);
      expect(childIds).toContain("code-block");
      expect(childIds).toContain("blockquote");
      expect(childIds).toContain("insert-table");
    });
  });

  describe("format submenu", () => {
    it("includes bold, italic, strikethrough, inline code, and link", () => {
      const menu = useContextMenu({ editor });
      menu.show(createMouseEvent());

      const formatItem = menu.items.value.find((i) => i.id === "format");
      expect(formatItem?.children).toBeDefined();

      const childIds = formatItem!.children!.map((c) => c.id);
      expect(childIds).toContain("bold");
      expect(childIds).toContain("italic");
      expect(childIds).toContain("strikethrough");
      expect(childIds).toContain("inline-code");
      expect(childIds).toContain("link");
    });

    it("format actions call correct editor methods", () => {
      const menu = useContextMenu({ editor });
      menu.show(createMouseEvent());

      const formatItem = menu.items.value.find((i) => i.id === "format")!;
      const findChild = (id: string) => formatItem.children!.find((c) => c.id === id);

      findChild("bold")!.action!();
      expect(editor.inlineFormatting.toggleBold).toHaveBeenCalled();

      findChild("italic")!.action!();
      expect(editor.inlineFormatting.toggleItalic).toHaveBeenCalled();

      findChild("strikethrough")!.action!();
      expect(editor.inlineFormatting.toggleStrikethrough).toHaveBeenCalled();

      findChild("inline-code")!.action!();
      expect(editor.inlineFormatting.toggleInlineCode).toHaveBeenCalled();

      findChild("link")!.action!();
      expect(editor.links.insertLink).toHaveBeenCalled();
    });
  });

  describe("context priority", () => {
    it("table context takes priority over code", () => {
      (editor.tables.isInTable as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (editor.codeBlocks.isInCodeBlock as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const menu = useContextMenu({ editor });
      menu.show(createMouseEvent());

      // Should be table context since isInTable is checked first
      const ids = menu.items.value.map((i) => i.id);
      expect(ids).toContain("insert-row-above");
    });

    it("code context takes priority over list", () => {
      (editor.codeBlocks.isInCodeBlock as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (editor.lists.getCurrentListType as ReturnType<typeof vi.fn>).mockReturnValue("ul");
      const menu = useContextMenu({ editor });
      menu.show(createMouseEvent());

      expect(menu.items.value.length).toBe(1);
      expect(menu.items.value[0].id).toBe("code-block");
    });
  });

  describe("dividers in table context", () => {
    it("includes divider items in table context", () => {
      (editor.tables.isInTable as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const menu = useContextMenu({ editor });
      menu.show(createMouseEvent());

      const dividers = menu.items.value.filter((i) => i.divider === true);
      expect(dividers.length).toBeGreaterThan(0);
    });
  });
});
