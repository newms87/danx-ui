import { describe, it, expect } from "vitest";
import { buildTableItems } from "../contextMenuTableBuilder";
import { createMockEditor } from "./mockEditor";

describe("contextMenuTableBuilder", () => {
  describe("buildTableItems", () => {
    it("returns correct number of items", () => {
      const editor = createMockEditor();
      const items = buildTableItems(editor);
      // format, divider, 4 inserts, divider, 3 deletes, divider, alignment
      expect(items.length).toBe(12);
    });

    it("first item is format submenu", () => {
      const editor = createMockEditor();
      const items = buildTableItems(editor);
      expect(items[0]?.id).toBe("format");
    });

    it("insert-row-above action calls insertRowAbove", () => {
      const editor = createMockEditor();
      const items = buildTableItems(editor);
      const item = items.find((i) => i.id === "insert-row-above");
      item?.action?.();
      expect(editor.tables.insertRowAbove).toHaveBeenCalled();
    });

    it("insert-row-below action calls insertRowBelow", () => {
      const editor = createMockEditor();
      const items = buildTableItems(editor);
      const item = items.find((i) => i.id === "insert-row-below");
      item?.action?.();
      expect(editor.tables.insertRowBelow).toHaveBeenCalled();
    });

    it("insert-col-left action calls insertColumnLeft", () => {
      const editor = createMockEditor();
      const items = buildTableItems(editor);
      const item = items.find((i) => i.id === "insert-col-left");
      item?.action?.();
      expect(editor.tables.insertColumnLeft).toHaveBeenCalled();
    });

    it("insert-col-right action calls insertColumnRight", () => {
      const editor = createMockEditor();
      const items = buildTableItems(editor);
      const item = items.find((i) => i.id === "insert-col-right");
      item?.action?.();
      expect(editor.tables.insertColumnRight).toHaveBeenCalled();
    });

    it("delete-row action calls deleteCurrentRow", () => {
      const editor = createMockEditor();
      const items = buildTableItems(editor);
      const item = items.find((i) => i.id === "delete-row");
      item?.action?.();
      expect(editor.tables.deleteCurrentRow).toHaveBeenCalled();
    });

    it("delete-col action calls deleteCurrentColumn", () => {
      const editor = createMockEditor();
      const items = buildTableItems(editor);
      const item = items.find((i) => i.id === "delete-col");
      item?.action?.();
      expect(editor.tables.deleteCurrentColumn).toHaveBeenCalled();
    });

    it("delete-table action calls deleteTable", () => {
      const editor = createMockEditor();
      const items = buildTableItems(editor);
      const item = items.find((i) => i.id === "delete-table");
      item?.action?.();
      expect(editor.tables.deleteTable).toHaveBeenCalled();
    });

    it("alignment submenu has left, center, right options", () => {
      const editor = createMockEditor();
      const items = buildTableItems(editor);
      const alignment = items.find((i) => i.id === "alignment");
      expect(alignment?.children).toHaveLength(3);
    });

    it("align-left action calls setColumnAlignmentLeft", () => {
      const editor = createMockEditor();
      const items = buildTableItems(editor);
      const alignment = items.find((i) => i.id === "alignment");
      alignment?.children?.find((c) => c.id === "align-left")?.action?.();
      expect(editor.tables.setColumnAlignmentLeft).toHaveBeenCalled();
    });

    it("align-center action calls setColumnAlignmentCenter", () => {
      const editor = createMockEditor();
      const items = buildTableItems(editor);
      const alignment = items.find((i) => i.id === "alignment");
      alignment?.children?.find((c) => c.id === "align-center")?.action?.();
      expect(editor.tables.setColumnAlignmentCenter).toHaveBeenCalled();
    });

    it("align-right action calls setColumnAlignmentRight", () => {
      const editor = createMockEditor();
      const items = buildTableItems(editor);
      const alignment = items.find((i) => i.id === "alignment");
      alignment?.children?.find((c) => c.id === "align-right")?.action?.();
      expect(editor.tables.setColumnAlignmentRight).toHaveBeenCalled();
    });

    it("includes dividers between sections", () => {
      const editor = createMockEditor();
      const items = buildTableItems(editor);
      const dividers = items.filter((i) => i.divider);
      expect(dividers.length).toBe(3);
    });
  });
});
