import { describe, it, expect } from "vitest";
import { buildTextItems } from "../contextMenuTextBuilder";
import { createMockEditor } from "./mockEditor";

describe("contextMenuTextBuilder", () => {
  describe("buildTextItems", () => {
    it("returns an array of menu item groups", () => {
      const editor = createMockEditor();
      const items = buildTextItems(editor);
      expect(items.length).toBe(4);
    });

    it("first group is headings with 7 items (paragraph + h1-h6)", () => {
      const editor = createMockEditor();
      const items = buildTextItems(editor);
      const headings = items[0];
      expect(headings?.id).toBe("headings");
      expect(headings?.children).toHaveLength(7);
    });

    it("paragraph heading item calls setHeadingLevel(0)", () => {
      const editor = createMockEditor();
      const items = buildTextItems(editor);
      const paragraph = items[0]?.children?.[0];
      expect(paragraph?.id).toBe("paragraph");
      paragraph?.action?.();
      expect(editor.headings.setHeadingLevel).toHaveBeenCalledWith(0);
    });

    it("heading items call setHeadingLevel with correct levels", () => {
      const editor = createMockEditor();
      const items = buildTextItems(editor);
      const headingItems = items[0]?.children ?? [];

      for (let level = 1; level <= 6; level++) {
        headingItems[level]?.action?.();
        expect(editor.headings.setHeadingLevel).toHaveBeenCalledWith(level);
      }
    });

    it("second group is format submenu", () => {
      const editor = createMockEditor();
      const items = buildTextItems(editor);
      expect(items[1]?.id).toBe("format");
    });

    it("format submenu bold action calls toggleBold", () => {
      const editor = createMockEditor();
      const items = buildTextItems(editor);
      const bold = items[1]?.children?.find((c) => c.id === "bold");
      bold?.action?.();
      expect(editor.inlineFormatting.toggleBold).toHaveBeenCalled();
    });

    it("format submenu italic action calls toggleItalic", () => {
      const editor = createMockEditor();
      const items = buildTextItems(editor);
      const italic = items[1]?.children?.find((c) => c.id === "italic");
      italic?.action?.();
      expect(editor.inlineFormatting.toggleItalic).toHaveBeenCalled();
    });

    it("format submenu strikethrough action calls toggleStrikethrough", () => {
      const editor = createMockEditor();
      const items = buildTextItems(editor);
      const strikethrough = items[1]?.children?.find((c) => c.id === "strikethrough");
      strikethrough?.action?.();
      expect(editor.inlineFormatting.toggleStrikethrough).toHaveBeenCalled();
    });

    it("format submenu inline-code action calls toggleInlineCode", () => {
      const editor = createMockEditor();
      const items = buildTextItems(editor);
      const inlineCode = items[1]?.children?.find((c) => c.id === "inline-code");
      inlineCode?.action?.();
      expect(editor.inlineFormatting.toggleInlineCode).toHaveBeenCalled();
    });

    it("format submenu link action calls insertLink", () => {
      const editor = createMockEditor();
      const items = buildTextItems(editor);
      const link = items[1]?.children?.find((c) => c.id === "link");
      link?.action?.();
      expect(editor.links.insertLink).toHaveBeenCalled();
    });

    it("third group is lists with bullet and numbered", () => {
      const editor = createMockEditor();
      const items = buildTextItems(editor);
      const lists = items[2];
      expect(lists?.id).toBe("lists");
      expect(lists?.children).toHaveLength(2);
    });

    it("bullet list action calls toggleUnorderedList", () => {
      const editor = createMockEditor();
      const items = buildTextItems(editor);
      const bullet = items[2]?.children?.[0];
      bullet?.action?.();
      expect(editor.lists.toggleUnorderedList).toHaveBeenCalled();
    });

    it("numbered list action calls toggleOrderedList", () => {
      const editor = createMockEditor();
      const items = buildTextItems(editor);
      const numbered = items[2]?.children?.[1];
      numbered?.action?.();
      expect(editor.lists.toggleOrderedList).toHaveBeenCalled();
    });

    it("fourth group is blocks with code, blockquote, table", () => {
      const editor = createMockEditor();
      const items = buildTextItems(editor);
      const blocks = items[3];
      expect(blocks?.id).toBe("blocks");
      expect(blocks?.children).toHaveLength(3);
    });

    it("code block action calls toggleCodeBlock", () => {
      const editor = createMockEditor();
      const items = buildTextItems(editor);
      const code = items[3]?.children?.[0];
      code?.action?.();
      expect(editor.codeBlocks.toggleCodeBlock).toHaveBeenCalled();
    });

    it("blockquote action calls toggleBlockquote", () => {
      const editor = createMockEditor();
      const items = buildTextItems(editor);
      const blockquote = items[3]?.children?.[1];
      blockquote?.action?.();
      expect(editor.blockquotes.toggleBlockquote).toHaveBeenCalled();
    });

    it("insert table action calls insertTable", () => {
      const editor = createMockEditor();
      const items = buildTextItems(editor);
      const table = items[3]?.children?.[2];
      table?.action?.();
      expect(editor.tables.insertTable).toHaveBeenCalled();
    });

    it("all items have correct shortcuts", () => {
      const editor = createMockEditor();
      const items = buildTextItems(editor);
      // Spot-check some shortcuts
      expect(items[0]?.children?.[0]?.shortcut).toBe("Ctrl+0");
      expect(items[0]?.children?.[1]?.shortcut).toBe("Ctrl+1");
      expect(items[2]?.children?.[0]?.shortcut).toBe("Ctrl+Shift+[");
      expect(items[3]?.children?.[0]?.shortcut).toBe("Ctrl+Shift+K");
    });
  });
});
