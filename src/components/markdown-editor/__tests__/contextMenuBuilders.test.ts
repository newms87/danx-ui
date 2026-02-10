import { describe, it, expect } from "vitest";
import { buildFormatSubmenu, buildCodeItems, buildListItems } from "../contextMenuBuilders";
import { createMockEditor } from "./mockEditor";

describe("contextMenuBuilders", () => {
  describe("buildFormatSubmenu", () => {
    it("returns a format menu item with children", () => {
      const editor = createMockEditor();
      const item = buildFormatSubmenu(editor);
      expect(item.id).toBe("format");
      expect(item.label).toBe("Format");
      expect(item.children).toHaveLength(5);
    });

    it("bold action calls toggleBold", () => {
      const editor = createMockEditor();
      const item = buildFormatSubmenu(editor);
      item.children?.find((c) => c.id === "bold")?.action?.();
      expect(editor.inlineFormatting.toggleBold).toHaveBeenCalled();
    });

    it("italic action calls toggleItalic", () => {
      const editor = createMockEditor();
      const item = buildFormatSubmenu(editor);
      item.children?.find((c) => c.id === "italic")?.action?.();
      expect(editor.inlineFormatting.toggleItalic).toHaveBeenCalled();
    });

    it("strikethrough action calls toggleStrikethrough", () => {
      const editor = createMockEditor();
      const item = buildFormatSubmenu(editor);
      item.children?.find((c) => c.id === "strikethrough")?.action?.();
      expect(editor.inlineFormatting.toggleStrikethrough).toHaveBeenCalled();
    });

    it("inline-code action calls toggleInlineCode", () => {
      const editor = createMockEditor();
      const item = buildFormatSubmenu(editor);
      item.children?.find((c) => c.id === "inline-code")?.action?.();
      expect(editor.inlineFormatting.toggleInlineCode).toHaveBeenCalled();
    });

    it("link action calls insertLink", () => {
      const editor = createMockEditor();
      const item = buildFormatSubmenu(editor);
      item.children?.find((c) => c.id === "link")?.action?.();
      expect(editor.links.insertLink).toHaveBeenCalled();
    });
  });

  describe("buildCodeItems", () => {
    it("returns single code block toggle item", () => {
      const editor = createMockEditor();
      const items = buildCodeItems(editor);
      expect(items).toHaveLength(1);
      expect(items[0]?.id).toBe("code-block");
    });

    it("code block action calls toggleCodeBlock", () => {
      const editor = createMockEditor();
      const items = buildCodeItems(editor);
      items[0]?.action?.();
      expect(editor.codeBlocks.toggleCodeBlock).toHaveBeenCalled();
    });
  });

  describe("buildListItems", () => {
    it("returns format submenu, lists, and blocks groups", () => {
      const editor = createMockEditor();
      const items = buildListItems(editor);
      expect(items).toHaveLength(3);
      expect(items[0]?.id).toBe("format");
      expect(items[1]?.id).toBe("lists");
      expect(items[2]?.id).toBe("blocks");
    });

    it("bullet list action calls toggleUnorderedList", () => {
      const editor = createMockEditor();
      const items = buildListItems(editor);
      items[1]?.children?.[0]?.action?.();
      expect(editor.lists.toggleUnorderedList).toHaveBeenCalled();
    });

    it("numbered list action calls toggleOrderedList", () => {
      const editor = createMockEditor();
      const items = buildListItems(editor);
      items[1]?.children?.[1]?.action?.();
      expect(editor.lists.toggleOrderedList).toHaveBeenCalled();
    });

    it("blockquote action calls toggleBlockquote", () => {
      const editor = createMockEditor();
      const items = buildListItems(editor);
      items[2]?.children?.[0]?.action?.();
      expect(editor.blockquotes.toggleBlockquote).toHaveBeenCalled();
    });
  });
});
