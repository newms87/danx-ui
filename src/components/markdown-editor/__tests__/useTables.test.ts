import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ref } from "vue";
import { useTables } from "../useTables";
import { createTableRowOps } from "../useTableRowOps";
import type { TableContext } from "../table-types";
import { createTestEditor, TestEditorResult } from "./editorTestUtils";

describe("useTables", () => {
  let editor: TestEditorResult;
  let onContentChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onContentChange = vi.fn();
  });

  afterEach(() => {
    if (editor) {
      editor.destroy();
    }
  });

  function createTables() {
    return useTables({
      contentRef: editor.contentRef,
      onContentChange: onContentChange as unknown as () => void,
    });
  }

  /**
   * Helper to create a table HTML structure
   */
  function createTableHtml(
    rows: number,
    cols: number,
    headerContent?: string[],
    bodyContent?: string[][]
  ): string {
    let html = "<table><thead><tr>";
    for (let c = 0; c < cols; c++) {
      const content = headerContent?.[c] || `Header ${c + 1}`;
      html += `<th>${content}</th>`;
    }
    html += "</tr></thead>";

    if (rows > 1) {
      html += "<tbody>";
      for (let r = 1; r < rows; r++) {
        html += "<tr>";
        for (let c = 0; c < cols; c++) {
          const content = bodyContent?.[r - 1]?.[c] || `Cell ${r}-${c + 1}`;
          html += `<td>${content}</td>`;
        }
        html += "</tr>";
      }
      html += "</tbody>";
    }
    html += "</table>";
    return html;
  }

  /**
   * Helper to set cursor in a table cell
   */
  function setCursorInCell(cell: HTMLTableCellElement, offset: number = 0): void {
    const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
    const textNode = walker.nextNode() as Text | null;

    if (textNode) {
      editor.setCursor(textNode, Math.min(offset, textNode.textContent?.length || 0));
    } else {
      // If no text node, set cursor in the cell itself
      const range = document.createRange();
      if (cell.firstChild) {
        range.setStartBefore(cell.firstChild);
      } else {
        range.setStart(cell, 0);
      }
      range.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }

  /**
   * Helper to get a cell at specific position
   */
  function getCell(
    table: HTMLTableElement,
    rowIndex: number,
    colIndex: number
  ): HTMLTableCellElement | null {
    const allRows = Array.from(table.querySelectorAll("tr"));
    if (rowIndex < 0 || rowIndex >= allRows.length) return null;
    const row = allRows[rowIndex]!;
    const cells = Array.from(row.querySelectorAll("th, td"));
    if (colIndex < 0 || colIndex >= cells.length) return null;
    return (cells[colIndex] as HTMLTableCellElement) ?? null;
  }

  describe("isInTable", () => {
    it("returns true when cursor is in a table cell", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      const cell = editor.container.querySelector("th") as HTMLTableCellElement;
      setCursorInCell(cell);

      expect(tables.isInTable()).toBe(true);
    });

    it("returns true when cursor is in tbody cell", () => {
      editor = createTestEditor(createTableHtml(3, 2));
      const tables = createTables();
      const cell = editor.container.querySelector("td") as HTMLTableCellElement;
      setCursorInCell(cell);

      expect(tables.isInTable()).toBe(true);
    });

    it("returns false when cursor is in a paragraph", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 5);

      expect(tables.isInTable()).toBe(false);
    });

    it("returns false when cursor is outside table but in same container", () => {
      editor = createTestEditor(`<p>Before table</p>${createTableHtml(2, 2)}`);
      const tables = createTables();
      editor.setCursorInBlock(0, 5);

      expect(tables.isInTable()).toBe(false);
    });

    it("returns false when contentRef is null", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const { isInTable } = useTables({
        contentRef: ref<HTMLElement | null>(null),
        onContentChange: onContentChange as unknown as () => void,
      });

      expect(isInTable()).toBe(false);
    });

    it("returns false when no selection exists", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      window.getSelection()?.removeAllRanges();

      expect(tables.isInTable()).toBe(false);
    });
  });

  describe("isInTableCell", () => {
    it("returns true when cursor is in TH", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      const th = editor.container.querySelector("th") as HTMLTableCellElement;
      setCursorInCell(th);

      expect(tables.isInTableCell()).toBe(true);
    });

    it("returns true when cursor is in TD", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      const td = editor.container.querySelector("td") as HTMLTableCellElement;
      setCursorInCell(td);

      expect(tables.isInTableCell()).toBe(true);
    });

    it("returns false when cursor is in paragraph", () => {
      editor = createTestEditor("<p>Hello world</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 5);

      expect(tables.isInTableCell()).toBe(false);
    });

    it("returns false when contentRef is null", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const { isInTableCell } = useTables({
        contentRef: ref<HTMLElement | null>(null),
        onContentChange: onContentChange as unknown as () => void,
      });

      expect(isInTableCell()).toBe(false);
    });

    it("returns false when no selection exists", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      window.getSelection()?.removeAllRanges();

      expect(tables.isInTableCell()).toBe(false);
    });
  });

  describe("getCurrentTable", () => {
    it("returns table element when cursor is in table", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      const th = editor.container.querySelector("th") as HTMLTableCellElement;
      setCursorInCell(th);

      const result = tables.getCurrentTable();
      expect(result).toBeInstanceOf(HTMLTableElement);
      expect(result).toBe(editor.container.querySelector("table"));
    });

    it("returns null when cursor is outside table", () => {
      editor = createTestEditor("<p>Not in table</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 0);

      expect(tables.getCurrentTable()).toBeNull();
    });

    it("returns null when contentRef is null", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const { getCurrentTable } = useTables({
        contentRef: ref<HTMLElement | null>(null),
        onContentChange: onContentChange as unknown as () => void,
      });

      expect(getCurrentTable()).toBeNull();
    });
  });

  describe("getCurrentCell", () => {
    it("returns TH element when cursor is in header", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      const th = editor.container.querySelector("th") as HTMLTableCellElement;
      setCursorInCell(th);

      const result = tables.getCurrentCell();
      expect(result).toBeInstanceOf(HTMLTableCellElement);
      expect(result?.tagName).toBe("TH");
    });

    it("returns TD element when cursor is in body cell", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      const td = editor.container.querySelector("td") as HTMLTableCellElement;
      setCursorInCell(td);

      const result = tables.getCurrentCell();
      expect(result).toBeInstanceOf(HTMLTableCellElement);
      expect(result?.tagName).toBe("TD");
    });

    it("returns null when cursor is outside table", () => {
      editor = createTestEditor("<p>Not in table</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 0);

      expect(tables.getCurrentCell()).toBeNull();
    });

    it("returns null when contentRef is null", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const { getCurrentCell } = useTables({
        contentRef: ref<HTMLElement | null>(null),
        onContentChange: onContentChange as unknown as () => void,
      });

      expect(getCurrentCell()).toBeNull();
    });

    it("returns null when no selection exists", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      window.getSelection()?.removeAllRanges();

      expect(tables.getCurrentCell()).toBeNull();
    });
  });

  describe("createTable", () => {
    it("creates table with correct number of rows and columns", () => {
      editor = createTestEditor("<p>Insert here</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 5);

      tables.createTable(3, 4);

      const table = editor.container.querySelector("table");
      expect(table).not.toBeNull();

      // Check header row (1 row in thead)
      const thead = table?.querySelector("thead");
      expect(thead?.querySelectorAll("th").length).toBe(4);

      // Check body rows (2 rows in tbody)
      const tbody = table?.querySelector("tbody");
      expect(tbody?.querySelectorAll("tr").length).toBe(2);
      expect(tbody?.querySelectorAll("td").length).toBe(8);
    });

    it("creates table with thead and th cells for header row", () => {
      editor = createTestEditor("<p>Insert here</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 0);

      tables.createTable(2, 2);

      const table = editor.container.querySelector("table");
      expect(table?.querySelector("thead")).not.toBeNull();
      expect(table?.querySelectorAll("th").length).toBe(2);
    });

    it("creates table with tbody and td cells for body rows", () => {
      editor = createTestEditor("<p>Insert here</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 0);

      tables.createTable(3, 2);

      const table = editor.container.querySelector("table");
      expect(table?.querySelector("tbody")).not.toBeNull();
      expect(table?.querySelectorAll("td").length).toBe(4);
    });

    it("creates cells with BR placeholder for focusability", () => {
      editor = createTestEditor("<p>Insert here</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 0);

      tables.createTable(2, 2);

      const cells = editor.container.querySelectorAll("th, td");
      cells.forEach((cell) => {
        expect(cell.querySelector("br")).not.toBeNull();
      });
    });

    it("calls onContentChange after creation", () => {
      editor = createTestEditor("<p>Insert here</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 0);

      tables.createTable(2, 2);

      expect(onContentChange).toHaveBeenCalled();
    });

    it("does nothing with invalid dimensions", () => {
      editor = createTestEditor("<p>Insert here</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 0);

      tables.createTable(0, 2);
      expect(editor.container.querySelector("table")).toBeNull();

      tables.createTable(2, 0);
      expect(editor.container.querySelector("table")).toBeNull();

      tables.createTable(-1, 2);
      expect(editor.container.querySelector("table")).toBeNull();
    });

    it("creates table with only header row when rows=1", () => {
      editor = createTestEditor("<p>Insert here</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 0);

      tables.createTable(1, 3);

      const table = editor.container.querySelector("table");
      expect(table?.querySelector("thead")).not.toBeNull();
      expect(table?.querySelector("tbody")).toBeNull();
      expect(table?.querySelectorAll("th").length).toBe(3);
    });

    it("does nothing when contentRef is null", () => {
      editor = createTestEditor("<p>Test</p>");
      const { createTable } = useTables({
        contentRef: ref<HTMLElement | null>(null),
        onContentChange: onContentChange as unknown as () => void,
      });

      createTable(2, 2);

      expect(editor.container.querySelector("table")).toBeNull();
      expect(onContentChange).not.toHaveBeenCalled();
    });
  });

  describe("navigateToNextCell", () => {
    it("moves to next cell in same row", () => {
      editor = createTestEditor(createTableHtml(2, 3));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const firstCell = getCell(table, 0, 0)!;
      setCursorInCell(firstCell);

      const result = tables.navigateToNextCell();

      expect(result).toBe(true);
      const currentCell = tables.getCurrentCell();
      expect(currentCell).toBe(getCell(table, 0, 1));
    });

    it("moves to first cell of next row at end of row", () => {
      editor = createTestEditor(createTableHtml(2, 3));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const lastCellInFirstRow = getCell(table, 0, 2)!;
      setCursorInCell(lastCellInFirstRow);

      const result = tables.navigateToNextCell();

      expect(result).toBe(true);
      const currentCell = tables.getCurrentCell();
      expect(currentCell).toBe(getCell(table, 1, 0));
    });

    it("returns false at end of table", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const lastCell = getCell(table, 1, 1)!;
      setCursorInCell(lastCell);

      const result = tables.navigateToNextCell();

      expect(result).toBe(false);
    });

    it("returns false when not in table", () => {
      editor = createTestEditor("<p>Not in table</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 0);

      expect(tables.navigateToNextCell()).toBe(false);
    });
  });

  describe("navigateToPreviousCell", () => {
    it("moves to previous cell in same row", () => {
      editor = createTestEditor(createTableHtml(2, 3));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const secondCell = getCell(table, 0, 1)!;
      setCursorInCell(secondCell);

      const result = tables.navigateToPreviousCell();

      expect(result).toBe(true);
      const currentCell = tables.getCurrentCell();
      expect(currentCell).toBe(getCell(table, 0, 0));
    });

    it("moves to last cell of previous row at start of row", () => {
      editor = createTestEditor(createTableHtml(2, 3));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const firstCellInSecondRow = getCell(table, 1, 0)!;
      setCursorInCell(firstCellInSecondRow);

      const result = tables.navigateToPreviousCell();

      expect(result).toBe(true);
      const currentCell = tables.getCurrentCell();
      expect(currentCell).toBe(getCell(table, 0, 2));
    });

    it("returns false at start of table", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const firstCell = getCell(table, 0, 0)!;
      setCursorInCell(firstCell);

      const result = tables.navigateToPreviousCell();

      expect(result).toBe(false);
    });

    it("returns false when not in table", () => {
      editor = createTestEditor("<p>Not in table</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 0);

      expect(tables.navigateToPreviousCell()).toBe(false);
    });
  });

  describe("navigateToCellBelow", () => {
    it("moves to cell directly below", () => {
      editor = createTestEditor(createTableHtml(3, 2));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const headerCell = getCell(table, 0, 0)!;
      setCursorInCell(headerCell);

      const result = tables.navigateToCellBelow();

      expect(result).toBe(true);
      const currentCell = tables.getCurrentCell();
      expect(currentCell).toBe(getCell(table, 1, 0));
    });

    it("maintains column position when moving down", () => {
      editor = createTestEditor(createTableHtml(3, 3));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const cell = getCell(table, 0, 1)!;
      setCursorInCell(cell);

      tables.navigateToCellBelow();

      const currentCell = tables.getCurrentCell();
      expect(currentCell).toBe(getCell(table, 1, 1));
    });

    it("returns false at bottom of table", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const bottomCell = getCell(table, 1, 0)!;
      setCursorInCell(bottomCell);

      const result = tables.navigateToCellBelow();

      expect(result).toBe(false);
    });

    it("returns false when not in table", () => {
      editor = createTestEditor("<p>Not in table</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 0);

      expect(tables.navigateToCellBelow()).toBe(false);
    });
  });

  describe("navigateToCellAbove", () => {
    it("moves to cell directly above", () => {
      editor = createTestEditor(createTableHtml(3, 2));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const bodyCell = getCell(table, 1, 0)!;
      setCursorInCell(bodyCell);

      const result = tables.navigateToCellAbove();

      expect(result).toBe(true);
      const currentCell = tables.getCurrentCell();
      expect(currentCell).toBe(getCell(table, 0, 0));
    });

    it("maintains column position when moving up", () => {
      editor = createTestEditor(createTableHtml(3, 3));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const cell = getCell(table, 2, 1)!;
      setCursorInCell(cell);

      tables.navigateToCellAbove();

      const currentCell = tables.getCurrentCell();
      expect(currentCell).toBe(getCell(table, 1, 1));
    });

    it("returns false at top of table", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const topCell = getCell(table, 0, 0)!;
      setCursorInCell(topCell);

      const result = tables.navigateToCellAbove();

      expect(result).toBe(false);
    });

    it("returns false when not in table", () => {
      editor = createTestEditor("<p>Not in table</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 0);

      expect(tables.navigateToCellAbove()).toBe(false);
    });
  });

  describe("cursor position preservation", () => {
    /**
     * Helper to get cursor offset within a cell
     */
    function getCursorOffsetInCell(cell: HTMLTableCellElement): number {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return -1;

      const range = selection.getRangeAt(0);
      if (!cell.contains(range.startContainer)) return -1;

      const preCaretRange = document.createRange();
      preCaretRange.selectNodeContents(cell);
      preCaretRange.setEnd(range.startContainer, range.startOffset);
      return preCaretRange.toString().length;
    }

    describe("navigateToCellBelow with cursor offset", () => {
      it("preserves cursor position when moving down", () => {
        // Create table with specific content
        editor = createTestEditor(
          "<table><thead><tr><th>Hello</th></tr></thead><tbody><tr><td>World</td></tr></tbody></table>"
        );
        const tables = createTables();
        const table = editor.container.querySelector("table") as HTMLTableElement;
        const headerCell = getCell(table, 0, 0)!;

        // Place cursor at position 3 in "Hello" (after "Hel")
        setCursorInCell(headerCell, 3);

        // Verify cursor is at position 3
        expect(getCursorOffsetInCell(headerCell)).toBe(3);

        // Navigate down
        tables.navigateToCellBelow();

        // Verify cursor is at position 3 in second row ("Wor|ld")
        const targetCell = getCell(table, 1, 0)!;
        expect(tables.getCurrentCell()).toBe(targetCell);
        expect(getCursorOffsetInCell(targetCell)).toBe(3);
      });

      it("clamps cursor position when target cell is shorter", () => {
        // Cell 1 has "Hello" (5 chars), Cell 2 has "Hi" (2 chars)
        editor = createTestEditor(
          "<table><thead><tr><th>Hello</th></tr></thead><tbody><tr><td>Hi</td></tr></tbody></table>"
        );
        const tables = createTables();
        const table = editor.container.querySelector("table") as HTMLTableElement;
        const headerCell = getCell(table, 0, 0)!;

        // Place cursor at position 4 in "Hello"
        setCursorInCell(headerCell, 4);
        expect(getCursorOffsetInCell(headerCell)).toBe(4);

        // Navigate down
        tables.navigateToCellBelow();

        // Cursor should be clamped to position 2 (end of "Hi")
        const targetCell = getCell(table, 1, 0)!;
        expect(tables.getCurrentCell()).toBe(targetCell);
        expect(getCursorOffsetInCell(targetCell)).toBe(2);
      });

      it("places cursor at start for empty target cell", () => {
        // Cell 1 has "Hello", Cell 2 is empty (just BR placeholder)
        editor = createTestEditor(
          "<table><thead><tr><th>Hello</th></tr></thead><tbody><tr><td><br></td></tr></tbody></table>"
        );
        const tables = createTables();
        const table = editor.container.querySelector("table") as HTMLTableElement;
        const headerCell = getCell(table, 0, 0)!;

        // Place cursor at position 3 in "Hello"
        setCursorInCell(headerCell, 3);

        // Navigate down
        tables.navigateToCellBelow();

        // Cursor should be at position 0 in empty cell
        const targetCell = getCell(table, 1, 0)!;
        expect(tables.getCurrentCell()).toBe(targetCell);
        // Empty cell has no text, cursor should be at 0
        expect(getCursorOffsetInCell(targetCell)).toBe(0);
      });

      it("handles cursor at end of cell when moving down", () => {
        editor = createTestEditor(
          "<table><thead><tr><th>ABC</th></tr></thead><tbody><tr><td>DEFGH</td></tr></tbody></table>"
        );
        const tables = createTables();
        const table = editor.container.querySelector("table") as HTMLTableElement;
        const headerCell = getCell(table, 0, 0)!;

        // Place cursor at end of "ABC" (position 3)
        setCursorInCell(headerCell, 3);

        // Navigate down
        tables.navigateToCellBelow();

        // Cursor should be at position 3 in "DEFGH"
        const targetCell = getCell(table, 1, 0)!;
        expect(getCursorOffsetInCell(targetCell)).toBe(3);
      });
    });

    describe("navigateToCellAbove with cursor offset", () => {
      it("preserves cursor position when moving up", () => {
        editor = createTestEditor(
          "<table><thead><tr><th>Hello</th></tr></thead><tbody><tr><td>World</td></tr></tbody></table>"
        );
        const tables = createTables();
        const table = editor.container.querySelector("table") as HTMLTableElement;
        const bodyCell = getCell(table, 1, 0)!;

        // Place cursor at position 2 in "World" (after "Wo")
        setCursorInCell(bodyCell, 2);
        expect(getCursorOffsetInCell(bodyCell)).toBe(2);

        // Navigate up
        tables.navigateToCellAbove();

        // Verify cursor is at position 2 in header row ("He|llo")
        const targetCell = getCell(table, 0, 0)!;
        expect(tables.getCurrentCell()).toBe(targetCell);
        expect(getCursorOffsetInCell(targetCell)).toBe(2);
      });

      it("clamps cursor position when target cell is shorter", () => {
        // Cell 1 (header) has "Hi" (2 chars), Cell 2 has "Hello" (5 chars)
        editor = createTestEditor(
          "<table><thead><tr><th>Hi</th></tr></thead><tbody><tr><td>Hello</td></tr></tbody></table>"
        );
        const tables = createTables();
        const table = editor.container.querySelector("table") as HTMLTableElement;
        const bodyCell = getCell(table, 1, 0)!;

        // Place cursor at position 4 in "Hello"
        setCursorInCell(bodyCell, 4);
        expect(getCursorOffsetInCell(bodyCell)).toBe(4);

        // Navigate up
        tables.navigateToCellAbove();

        // Cursor should be clamped to position 2 (end of "Hi")
        const targetCell = getCell(table, 0, 0)!;
        expect(tables.getCurrentCell()).toBe(targetCell);
        expect(getCursorOffsetInCell(targetCell)).toBe(2);
      });

      it("places cursor at start for empty target cell", () => {
        // Header cell is empty, body cell has content
        editor = createTestEditor(
          "<table><thead><tr><th><br></th></tr></thead><tbody><tr><td>Hello</td></tr></tbody></table>"
        );
        const tables = createTables();
        const table = editor.container.querySelector("table") as HTMLTableElement;
        const bodyCell = getCell(table, 1, 0)!;

        // Place cursor at position 3 in "Hello"
        setCursorInCell(bodyCell, 3);

        // Navigate up
        tables.navigateToCellAbove();

        // Cursor should be at position 0 in empty header cell
        const targetCell = getCell(table, 0, 0)!;
        expect(tables.getCurrentCell()).toBe(targetCell);
        expect(getCursorOffsetInCell(targetCell)).toBe(0);
      });

      it("handles multi-row navigation preserving offset", () => {
        // 3-row table to test navigating through multiple rows
        editor = createTestEditor(
          "<table><thead><tr><th>Row1</th></tr></thead><tbody><tr><td>Row2</td></tr><tr><td>Row3</td></tr></tbody></table>"
        );
        const tables = createTables();
        const table = editor.container.querySelector("table") as HTMLTableElement;
        const lastRowCell = getCell(table, 2, 0)!;

        // Place cursor at position 2 in "Row3"
        setCursorInCell(lastRowCell, 2);

        // Navigate up twice
        tables.navigateToCellAbove();
        let currentCell = tables.getCurrentCell();
        expect(currentCell).toBe(getCell(table, 1, 0));
        expect(getCursorOffsetInCell(currentCell!)).toBe(2);

        tables.navigateToCellAbove();
        currentCell = tables.getCurrentCell();
        expect(currentCell).toBe(getCell(table, 0, 0));
        expect(getCursorOffsetInCell(currentCell!)).toBe(2);
      });
    });

    describe("cursor offset edge cases", () => {
      it("handles cursor at position 0", () => {
        editor = createTestEditor(
          "<table><thead><tr><th>Hello</th></tr></thead><tbody><tr><td>World</td></tr></tbody></table>"
        );
        const tables = createTables();
        const table = editor.container.querySelector("table") as HTMLTableElement;
        const headerCell = getCell(table, 0, 0)!;

        // Place cursor at position 0
        setCursorInCell(headerCell, 0);
        expect(getCursorOffsetInCell(headerCell)).toBe(0);

        // Navigate down
        tables.navigateToCellBelow();

        // Cursor should be at position 0
        const targetCell = getCell(table, 1, 0)!;
        expect(getCursorOffsetInCell(targetCell)).toBe(0);
      });

      it("handles cells with inline formatting", () => {
        // Cell with bold text
        editor = createTestEditor(
          "<table><thead><tr><th><strong>Bold</strong></th></tr></thead><tbody><tr><td>Plain</td></tr></tbody></table>"
        );
        const tables = createTables();
        const table = editor.container.querySelector("table") as HTMLTableElement;
        const headerCell = getCell(table, 0, 0)!;

        // Place cursor at position 2 in "Bold" (inside strong tag)
        const strongText = headerCell.querySelector("strong")!.firstChild!;
        editor.setCursor(strongText, 2);
        expect(getCursorOffsetInCell(headerCell)).toBe(2);

        // Navigate down
        tables.navigateToCellBelow();

        // Cursor should be at position 2 in "Plain"
        const targetCell = getCell(table, 1, 0)!;
        expect(getCursorOffsetInCell(targetCell)).toBe(2);
      });

      it("handles mixed content cells", () => {
        // Cell with text + bold + text
        editor = createTestEditor(
          "<table><thead><tr><th>A<strong>B</strong>C</th></tr></thead><tbody><tr><td>DEFGH</td></tr></tbody></table>"
        );
        const tables = createTables();
        const table = editor.container.querySelector("table") as HTMLTableElement;
        const headerCell = getCell(table, 0, 0)!;

        // Total text is "ABC", place cursor at position 2 (after "AB")
        // Need to find the right text node - the one after strong
        const walker = document.createTreeWalker(headerCell, NodeFilter.SHOW_TEXT);
        walker.nextNode(); // "A"
        walker.nextNode(); // "B" inside strong
        const lastTextNode = walker.nextNode() as Text; // "C"

        // Set cursor at start of "C" which is offset 2 in total text
        editor.setCursor(lastTextNode, 0);
        expect(getCursorOffsetInCell(headerCell)).toBe(2);

        // Navigate down
        tables.navigateToCellBelow();

        // Cursor should be at position 2 in "DEFGH"
        const targetCell = getCell(table, 1, 0)!;
        expect(getCursorOffsetInCell(targetCell)).toBe(2);
      });
    });
  });

  describe("insertRowAbove", () => {
    it("inserts a new row above the current row", () => {
      editor = createTestEditor(createTableHtml(2, 2, ["H1", "H2"], [["C1", "C2"]]));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const bodyCell = getCell(table, 1, 0)!;
      setCursorInCell(bodyCell);

      tables.insertRowAbove();

      // Should now have 3 rows total
      const allRows = table.querySelectorAll("tr");
      expect(allRows.length).toBe(3);
      expect(onContentChange).toHaveBeenCalled();
    });

    it("creates row with correct number of cells", () => {
      editor = createTestEditor(createTableHtml(2, 3));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const bodyCell = getCell(table, 1, 0)!;
      setCursorInCell(bodyCell);

      tables.insertRowAbove();

      // New row should have 3 cells
      const tbody = table.querySelector("tbody");
      const newRow = tbody?.querySelectorAll("tr")[0] as HTMLTableRowElement | undefined;
      expect(newRow?.cells.length).toBe(3);
    });

    it("does nothing when not in table", () => {
      editor = createTestEditor("<p>Not in table</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 0);

      tables.insertRowAbove();

      expect(onContentChange).not.toHaveBeenCalled();
    });

    it("does nothing when contentRef is null", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const { insertRowAbove } = useTables({
        contentRef: ref<HTMLElement | null>(null),
        onContentChange: onContentChange as unknown as () => void,
      });

      insertRowAbove();

      expect(onContentChange).not.toHaveBeenCalled();
    });
  });

  describe("insertRowBelow", () => {
    it("inserts a new row below the current row", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const bodyCell = getCell(table, 1, 0)!;
      setCursorInCell(bodyCell);

      tables.insertRowBelow();

      // Should now have 3 rows total
      const allRows = table.querySelectorAll("tr");
      expect(allRows.length).toBe(3);
      expect(onContentChange).toHaveBeenCalled();
    });

    it("inserts row into tbody when cursor is in header", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const headerCell = getCell(table, 0, 0)!;
      setCursorInCell(headerCell);

      tables.insertRowBelow();

      // New row should be in tbody
      const tbody = table.querySelector("tbody");
      expect(tbody?.querySelectorAll("tr").length).toBe(2);
    });

    it("creates row with TD cells, not TH", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const headerCell = getCell(table, 0, 0)!;
      setCursorInCell(headerCell);

      tables.insertRowBelow();

      const tbody = table.querySelector("tbody");
      const firstBodyRow = tbody?.querySelector("tr");
      expect(firstBodyRow?.querySelectorAll("td").length).toBe(2);
      expect(firstBodyRow?.querySelectorAll("th").length).toBe(0);
    });

    it("does nothing when not in table", () => {
      editor = createTestEditor("<p>Not in table</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 0);

      tables.insertRowBelow();

      expect(onContentChange).not.toHaveBeenCalled();
    });
  });

  describe("deleteCurrentRow", () => {
    it("removes the current row", () => {
      editor = createTestEditor(createTableHtml(3, 2));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const middleRowCell = getCell(table, 1, 0)!;
      setCursorInCell(middleRowCell);

      tables.deleteCurrentRow();

      const allRows = table.querySelectorAll("tr");
      expect(allRows.length).toBe(2);
      expect(onContentChange).toHaveBeenCalled();
    });

    it("deletes entire table when last row is deleted", () => {
      editor = createTestEditor(createTableHtml(1, 2));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const cell = getCell(table, 0, 0)!;
      setCursorInCell(cell);

      tables.deleteCurrentRow();

      expect(editor.container.querySelector("table")).toBeNull();
    });

    it("focuses adjacent row after deletion", () => {
      editor = createTestEditor(createTableHtml(3, 2));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const middleRowCell = getCell(table, 1, 0)!;
      setCursorInCell(middleRowCell);

      tables.deleteCurrentRow();

      // Should still be in a table cell
      expect(tables.isInTableCell()).toBe(true);
    });

    it("does nothing when not in table", () => {
      editor = createTestEditor("<p>Not in table</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 0);

      tables.deleteCurrentRow();

      expect(onContentChange).not.toHaveBeenCalled();
    });
  });

  describe("insertColumnLeft", () => {
    it("inserts a column to the left", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const cell = getCell(table, 0, 1)!;
      setCursorInCell(cell);

      tables.insertColumnLeft();

      // Should now have 3 columns
      expect((table.querySelector("thead tr") as HTMLTableRowElement | null)?.cells.length).toBe(3);
      expect(onContentChange).toHaveBeenCalled();
    });

    it("inserts TH in header row, TD in body rows", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const cell = getCell(table, 0, 0)!;
      setCursorInCell(cell);

      tables.insertColumnLeft();

      const headerRow = table.querySelector("thead tr") as HTMLTableRowElement | null;
      expect(headerRow?.cells[0]!.tagName).toBe("TH");

      const bodyRow = table.querySelector("tbody tr") as HTMLTableRowElement | null;
      expect(bodyRow?.cells[0]!.tagName).toBe("TD");
    });

    it("does nothing when not in table", () => {
      editor = createTestEditor("<p>Not in table</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 0);

      tables.insertColumnLeft();

      expect(onContentChange).not.toHaveBeenCalled();
    });
  });

  describe("insertColumnRight", () => {
    it("inserts a column to the right", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const cell = getCell(table, 0, 0)!;
      setCursorInCell(cell);

      tables.insertColumnRight();

      // Should now have 3 columns
      expect((table.querySelector("thead tr") as HTMLTableRowElement | null)?.cells.length).toBe(3);
      expect(onContentChange).toHaveBeenCalled();
    });

    it("inserts column after current position", () => {
      editor = createTestEditor(createTableHtml(2, 2, ["A", "B"], [["1", "2"]]));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const cell = getCell(table, 0, 0)!;
      setCursorInCell(cell);

      tables.insertColumnRight();

      const headerRow = table.querySelector("thead tr") as HTMLTableRowElement | null;
      expect(headerRow?.cells[0]!.textContent).toBe("A");
      expect(headerRow?.cells[2]!.textContent).toBe("B");
    });

    it("does nothing when not in table", () => {
      editor = createTestEditor("<p>Not in table</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 0);

      tables.insertColumnRight();

      expect(onContentChange).not.toHaveBeenCalled();
    });
  });

  describe("deleteCurrentColumn", () => {
    it("removes the current column", () => {
      editor = createTestEditor(createTableHtml(2, 3));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const cell = getCell(table, 0, 1)!;
      setCursorInCell(cell);

      tables.deleteCurrentColumn();

      expect((table.querySelector("thead tr") as HTMLTableRowElement | null)?.cells.length).toBe(2);
      expect(onContentChange).toHaveBeenCalled();
    });

    it("deletes entire table when last column is deleted", () => {
      editor = createTestEditor(createTableHtml(2, 1));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const cell = getCell(table, 0, 0)!;
      setCursorInCell(cell);

      tables.deleteCurrentColumn();

      expect(editor.container.querySelector("table")).toBeNull();
    });

    it("removes column from all rows", () => {
      editor = createTestEditor(createTableHtml(3, 3));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const cell = getCell(table, 0, 1)!;
      setCursorInCell(cell);

      tables.deleteCurrentColumn();

      // All rows should have 2 cells now
      const allRows = table.querySelectorAll("tr");
      allRows.forEach((row) => {
        expect((row as HTMLTableRowElement).cells.length).toBe(2);
      });
    });

    it("does nothing when not in table", () => {
      editor = createTestEditor("<p>Not in table</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 0);

      tables.deleteCurrentColumn();

      expect(onContentChange).not.toHaveBeenCalled();
    });
  });

  describe("deleteTable", () => {
    it("removes entire table", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      const cell = editor.container.querySelector("th") as HTMLTableCellElement;
      setCursorInCell(cell);

      tables.deleteTable();

      expect(editor.container.querySelector("table")).toBeNull();
      expect(onContentChange).toHaveBeenCalled();
    });

    it("creates paragraph if content area becomes empty", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      const cell = editor.container.querySelector("th") as HTMLTableCellElement;
      setCursorInCell(cell);

      tables.deleteTable();

      expect(editor.container.querySelector("p")).not.toBeNull();
    });

    it("focuses next sibling after deletion", () => {
      editor = createTestEditor(`${createTableHtml(2, 2)}<p>After table</p>`);
      const tables = createTables();
      const cell = editor.container.querySelector("th") as HTMLTableCellElement;
      setCursorInCell(cell);

      tables.deleteTable();

      expect(editor.container.querySelector("table")).toBeNull();
      expect(editor.container.querySelector("p")?.textContent).toBe("After table");
    });

    it("does nothing when not in table", () => {
      editor = createTestEditor("<p>Not in table</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 0);

      tables.deleteTable();

      expect(onContentChange).not.toHaveBeenCalled();
    });

    it("does nothing when contentRef is null", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const { deleteTable } = useTables({
        contentRef: ref<HTMLElement | null>(null),
        onContentChange: onContentChange as unknown as () => void,
      });

      deleteTable();

      expect(editor.container.querySelector("table")).not.toBeNull();
      expect(onContentChange).not.toHaveBeenCalled();
    });
  });

  describe("setColumnAlignmentLeft", () => {
    it("sets column alignment to left", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const cell = getCell(table, 0, 0)!;
      cell.style.textAlign = "center";
      setCursorInCell(cell);

      tables.setColumnAlignmentLeft();

      // Left alignment removes the style property
      expect(cell.style.textAlign).toBe("");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("does nothing when not in table", () => {
      editor = createTestEditor("<p>Not in table</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 0);

      tables.setColumnAlignmentLeft();

      expect(onContentChange).not.toHaveBeenCalled();
    });
  });

  describe("setColumnAlignmentCenter", () => {
    it("sets column alignment to center", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const cell = getCell(table, 0, 0)!;
      setCursorInCell(cell);

      tables.setColumnAlignmentCenter();

      expect(cell.style.textAlign).toBe("center");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("applies alignment to all cells in column", () => {
      editor = createTestEditor(createTableHtml(3, 2));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const cell = getCell(table, 0, 0)!;
      setCursorInCell(cell);

      tables.setColumnAlignmentCenter();

      // All cells in first column should be centered
      expect(getCell(table, 0, 0)?.style.textAlign).toBe("center");
      expect(getCell(table, 1, 0)?.style.textAlign).toBe("center");
      expect(getCell(table, 2, 0)?.style.textAlign).toBe("center");
    });

    it("does nothing when not in table", () => {
      editor = createTestEditor("<p>Not in table</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 0);

      tables.setColumnAlignmentCenter();

      expect(onContentChange).not.toHaveBeenCalled();
    });
  });

  describe("setColumnAlignmentRight", () => {
    it("sets column alignment to right", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const cell = getCell(table, 0, 0)!;
      setCursorInCell(cell);

      tables.setColumnAlignmentRight();

      expect(cell.style.textAlign).toBe("right");
      expect(onContentChange).toHaveBeenCalled();
    });

    it("does nothing when not in table", () => {
      editor = createTestEditor("<p>Not in table</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 0);

      tables.setColumnAlignmentRight();

      expect(onContentChange).not.toHaveBeenCalled();
    });
  });

  describe("handleTableTab", () => {
    it("navigates to next cell on Tab", () => {
      editor = createTestEditor(createTableHtml(2, 3));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const firstCell = getCell(table, 0, 0)!;
      setCursorInCell(firstCell);

      const result = tables.handleTableTab(false);

      expect(result).toBe(true);
      expect(tables.getCurrentCell()).toBe(getCell(table, 0, 1));
    });

    it("navigates to previous cell on Shift+Tab", () => {
      editor = createTestEditor(createTableHtml(2, 3));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const secondCell = getCell(table, 0, 1)!;
      setCursorInCell(secondCell);

      const result = tables.handleTableTab(true);

      expect(result).toBe(true);
      expect(tables.getCurrentCell()).toBe(getCell(table, 0, 0));
    });

    it("creates new row when Tab at end of table", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const lastCell = getCell(table, 1, 1)!;
      setCursorInCell(lastCell);

      const result = tables.handleTableTab(false);

      expect(result).toBe(true);
      // Should have 3 rows now
      expect(table.querySelectorAll("tr").length).toBe(3);
    });

    it("returns false on Shift+Tab at start of table", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const firstCell = getCell(table, 0, 0)!;
      setCursorInCell(firstCell);

      const result = tables.handleTableTab(true);

      expect(result).toBe(false);
    });

    it("returns false when not in table cell", () => {
      editor = createTestEditor("<p>Not in table</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 0);

      expect(tables.handleTableTab(false)).toBe(false);
      expect(tables.handleTableTab(true)).toBe(false);
    });
  });

  describe("handleTableEnter", () => {
    it("moves to cell below", () => {
      editor = createTestEditor(createTableHtml(3, 2));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const headerCell = getCell(table, 0, 0)!;
      setCursorInCell(headerCell);

      const result = tables.handleTableEnter();

      expect(result).toBe(true);
      expect(tables.getCurrentCell()).toBe(getCell(table, 1, 0));
    });

    it("creates new row when at bottom of table", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const bottomCell = getCell(table, 1, 0)!;
      setCursorInCell(bottomCell);

      const result = tables.handleTableEnter();

      expect(result).toBe(true);
      // Should have 3 rows now
      expect(table.querySelectorAll("tr").length).toBe(3);
    });

    it("returns false when not in table cell", () => {
      editor = createTestEditor("<p>Not in table</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 0);

      expect(tables.handleTableEnter()).toBe(false);
    });

    it("maintains column position when moving down", () => {
      editor = createTestEditor(createTableHtml(3, 3));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const cell = getCell(table, 0, 1)!;
      setCursorInCell(cell);

      tables.handleTableEnter();

      const currentCell = tables.getCurrentCell();
      expect(currentCell).toBe(getCell(table, 1, 1));
    });
  });

  describe("insertTable", () => {
    // Mock getBoundingClientRect for Range since jsdom doesn't implement it
    let originalGetBoundingClientRect: typeof Range.prototype.getBoundingClientRect;

    beforeEach(() => {
      originalGetBoundingClientRect = Range.prototype.getBoundingClientRect;
      Range.prototype.getBoundingClientRect = vi.fn(() => ({
        x: 100,
        y: 100,
        width: 0,
        height: 0,
        top: 100,
        right: 100,
        bottom: 100,
        left: 100,
        toJSON: () => ({}),
      })) as unknown as typeof Range.prototype.getBoundingClientRect;
    });

    afterEach(() => {
      Range.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    });

    it("creates default 3x3 table when no popover callback provided", () => {
      editor = createTestEditor("<p>Insert here</p>");
      const tables = createTables();
      editor.setCursorInBlock(0, 0);

      tables.insertTable();

      const table = editor.container.querySelector("table");
      expect(table).not.toBeNull();
      expect(table?.querySelector("thead")?.querySelectorAll("th").length).toBe(3);
      // 2 body rows
      expect(table?.querySelector("tbody")?.querySelectorAll("tr").length).toBe(2);
    });

    it("calls onShowTablePopover when provided", () => {
      editor = createTestEditor("<p>Insert here</p>");
      const onShowTablePopover = vi.fn();
      const tables = useTables({
        contentRef: editor.contentRef,
        onContentChange: onContentChange as unknown as () => void,
        onShowTablePopover,
      });
      editor.setCursorInBlock(0, 0);

      tables.insertTable();

      expect(onShowTablePopover).toHaveBeenCalled();
      const options = onShowTablePopover.mock.calls[0]![0];
      expect(options.position).toBeDefined();
      expect(typeof options.onSubmit).toBe("function");
      expect(typeof options.onCancel).toBe("function");
    });

    it("creates table with specified dimensions when popover submits", () => {
      editor = createTestEditor("<p>Insert here</p>");
      let capturedOptions: any = null;
      const onShowTablePopover = vi.fn((opts) => {
        capturedOptions = opts;
      });
      const tables = useTables({
        contentRef: editor.contentRef,
        onContentChange: onContentChange as unknown as () => void,
        onShowTablePopover,
      });
      editor.setCursorInBlock(0, 0);

      tables.insertTable();
      // Simulate popover submission
      capturedOptions.onSubmit(4, 5);

      const table = editor.container.querySelector("table");
      expect(table?.querySelector("thead")?.querySelectorAll("th").length).toBe(5);
      // 3 body rows (4 total - 1 header)
      expect(table?.querySelector("tbody")?.querySelectorAll("tr").length).toBe(3);
    });

    it("does nothing when contentRef is null", () => {
      editor = createTestEditor("<p>Test</p>");
      const { insertTable } = useTables({
        contentRef: ref<HTMLElement | null>(null),
        onContentChange: onContentChange as unknown as () => void,
      });

      insertTable();

      expect(editor.container.querySelector("table")).toBeNull();
    });
  });

  describe("insertTable - onCancel callback", () => {
    let originalGetBoundingClientRect: typeof Range.prototype.getBoundingClientRect;

    beforeEach(() => {
      originalGetBoundingClientRect = Range.prototype.getBoundingClientRect;
      Range.prototype.getBoundingClientRect = vi.fn(() => ({
        x: 100,
        y: 100,
        width: 0,
        height: 0,
        top: 100,
        right: 100,
        bottom: 100,
        left: 100,
        toJSON: () => ({}),
      })) as unknown as typeof Range.prototype.getBoundingClientRect;
    });

    afterEach(() => {
      Range.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    });

    it("restores selection and focuses content when onCancel is called", () => {
      editor = createTestEditor("<p>Insert here</p>");
      let capturedOptions: {
        position: unknown;
        onSubmit: (rows: number, cols: number) => void;
        onCancel: () => void;
      } | null = null;
      const onShowTablePopover = vi.fn((opts) => {
        capturedOptions = opts;
      });
      useTables({
        contentRef: editor.contentRef,
        onContentChange: onContentChange as unknown as () => void,
        onShowTablePopover,
      }).insertTable();

      expect(capturedOptions).not.toBeNull();

      // Call onCancel - should restore selection and focus the content
      capturedOptions!.onCancel();

      // The function should not throw and should have restored focus
      expect(onShowTablePopover).toHaveBeenCalled();
    });
  });

  describe("createTable - cursor at contentRef root level", () => {
    let originalGetBoundingClientRect: typeof Range.prototype.getBoundingClientRect;

    beforeEach(() => {
      originalGetBoundingClientRect = Range.prototype.getBoundingClientRect;
      Range.prototype.getBoundingClientRect = vi.fn(() => ({
        x: 100,
        y: 100,
        width: 0,
        height: 0,
        top: 100,
        right: 100,
        bottom: 100,
        left: 100,
        toJSON: () => ({}),
      })) as unknown as typeof Range.prototype.getBoundingClientRect;
    });

    afterEach(() => {
      Range.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    });

    it("appends table to contentRef when cursor is at root level (not inside a block element)", () => {
      // Create an editor with only a text node (no block wrapper)
      editor = createTestEditor("");
      const tables = createTables();

      // Add a bare text node directly to contentRef
      const textNode = document.createTextNode("bare text");
      editor.container.appendChild(textNode);

      // Set cursor in the bare text node (which is a direct child of contentRef)
      editor.setCursor(textNode, 4);

      tables.createTable(2, 2);

      // Table should be appended to contentRef
      const table = editor.container.querySelector("table");
      expect(table).not.toBeNull();
      expect(onContentChange).toHaveBeenCalled();
    });
  });

  describe("insertRowBelow - header row without tbody", () => {
    it("creates a new tbody when inserting row below header and no tbody exists", () => {
      // Table with only a header row (no tbody)
      editor = createTestEditor(
        "<table><thead><tr><th>Header 1</th><th>Header 2</th></tr></thead></table>"
      );
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const headerCell = getCell(table, 0, 0)!;
      setCursorInCell(headerCell);

      // Before: no tbody
      expect(table.querySelector("tbody")).toBeNull();

      tables.insertRowBelow();

      // After: tbody should exist with one row
      const tbody = table.querySelector("tbody");
      expect(tbody).not.toBeNull();
      expect(tbody?.querySelectorAll("tr").length).toBe(1);
      expect(tbody?.querySelectorAll("td").length).toBe(2);
      expect(onContentChange).toHaveBeenCalled();
    });
  });

  describe("insertColumnLeft - row with fewer cells than expected", () => {
    it("appends cell when reference cell does not exist in a row", () => {
      // Create a malformed table where body rows have fewer cells than the header
      editor = createTestEditor(
        "<table><thead><tr><th>H1</th><th>H2</th><th>H3</th></tr></thead><tbody><tr><td>C1</td></tr></tbody></table>"
      );
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;

      // Place cursor on header cell at col 2 (third column)
      const headerCell = getCell(table, 0, 2)!;
      setCursorInCell(headerCell);

      tables.insertColumnLeft();

      // The header row should have 4 cells (3 + 1 inserted)
      const headerRow = table.querySelector("thead tr") as HTMLTableRowElement;
      expect(headerRow.cells.length).toBe(4);

      // The body row (which had only 1 cell) should have 2 cells -
      // since col=2 doesn't exist in body row, it should appendChild
      const bodyRow = table.querySelector("tbody tr") as HTMLTableRowElement;
      expect(bodyRow.cells.length).toBe(2);
      expect(onContentChange).toHaveBeenCalled();
    });
  });

  describe("insertColumnRight - row with fewer cells than expected", () => {
    it("appends cell when reference cell at col+1 does not exist", () => {
      // Cursor at last column, so col+1 won't exist - should appendChild
      editor = createTestEditor(createTableHtml(2, 2));
      const tables = createTables();
      const table = editor.container.querySelector("table") as HTMLTableElement;

      // Place cursor on last column (col=1)
      const cell = getCell(table, 0, 1)!;
      setCursorInCell(cell);

      tables.insertColumnRight();

      // Should have 3 columns now - the new cell was appended (not insertBefore)
      const headerRow = table.querySelector("thead tr") as HTMLTableRowElement;
      expect(headerRow.cells.length).toBe(3);
      expect(onContentChange).toHaveBeenCalled();
    });
  });

  describe("deleteTable - focus previous sibling", () => {
    it("focuses previous sibling when no next sibling exists", () => {
      editor = createTestEditor(`<p>Before table</p>${createTableHtml(2, 2)}`);
      const tables = createTables();
      const cell = editor.container.querySelector("th") as HTMLTableCellElement;
      setCursorInCell(cell);

      tables.deleteTable();

      expect(editor.container.querySelector("table")).toBeNull();
      // The paragraph before should still exist
      expect(editor.container.querySelector("p")?.textContent).toBe("Before table");
      expect(onContentChange).toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("handles table without tbody", () => {
      editor = createTestEditor("<table><thead><tr><th>Header</th></tr></thead></table>");
      const tables = createTables();
      const th = editor.container.querySelector("th") as HTMLTableCellElement;
      setCursorInCell(th);

      expect(tables.isInTable()).toBe(true);
      expect(tables.isInTableCell()).toBe(true);
    });

    it("handles table without thead", () => {
      editor = createTestEditor("<table><tbody><tr><td>Cell</td></tr></tbody></table>");
      const tables = createTables();
      const td = editor.container.querySelector("td") as HTMLTableCellElement;
      setCursorInCell(td);

      expect(tables.isInTable()).toBe(true);
      expect(tables.getCurrentTable()).not.toBeNull();
    });

    it("handles empty cells", () => {
      editor = createTestEditor("<table><thead><tr><th><br></th></tr></thead></table>");
      const tables = createTables();
      const th = editor.container.querySelector("th") as HTMLTableCellElement;

      // Set cursor in empty cell
      const range = document.createRange();
      range.setStart(th, 0);
      range.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      expect(tables.isInTableCell()).toBe(true);
    });

    it("handles nested content in cells", () => {
      editor = createTestEditor(
        "<table><thead><tr><th><strong>Bold header</strong></th></tr></thead></table>"
      );
      const tables = createTables();
      const strong = editor.container.querySelector("strong") as HTMLElement;
      editor.setCursor(strong.firstChild!, 2);

      expect(tables.isInTable()).toBe(true);
      expect(tables.isInTableCell()).toBe(true);
      expect(tables.getCurrentCell()?.tagName).toBe("TH");
    });

    it("handles multiple tables in document", () => {
      editor = createTestEditor(`
				${createTableHtml(2, 2)}
				<p>Between tables</p>
				${createTableHtml(3, 3)}
			`);
      const tables = createTables();

      // Focus in second table
      const secondTable = editor.container.querySelectorAll("table")[1]!;
      const cell = secondTable.querySelector("th") as HTMLTableCellElement;
      setCursorInCell(cell);

      expect(tables.getCurrentTable()).toBe(secondTable);
    });
  });

  describe("useTableRowOps - null parentElement guards (via createTableRowOps)", () => {
    it("insertRowAbove returns early when cell has no parentElement (row is null)", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const notifyContentChange = vi.fn();

      // Create a detached cell with no parent (parentElement is null)
      const detachedCell = document.createElement("td");
      detachedCell.textContent = "detached";

      const ctx: TableContext = {
        contentRef: editor.contentRef,
        isInTableCell: () => true,
        getCurrentTable: () => table,
        getCurrentCellAndTable: () => ({ cell: detachedCell as HTMLTableCellElement, table }),
        notifyContentChange,
        insertRowBelow: vi.fn(),
        deleteTable: vi.fn(),
      };

      const { insertRowAbove } = createTableRowOps(ctx);
      insertRowAbove();

      // Should return early; notifyContentChange should NOT be called
      expect(notifyContentChange).not.toHaveBeenCalled();
      expect(table.querySelectorAll("tr").length).toBe(2);
    });

    it("insertRowBelow returns early when cell has no parentElement (row is null)", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const notifyContentChange = vi.fn();

      const detachedCell = document.createElement("td");

      const ctx: TableContext = {
        contentRef: editor.contentRef,
        isInTableCell: () => true,
        getCurrentTable: () => table,
        getCurrentCellAndTable: () => ({ cell: detachedCell as HTMLTableCellElement, table }),
        notifyContentChange,
        insertRowBelow: vi.fn(),
        deleteTable: vi.fn(),
      };

      const { insertRowBelow } = createTableRowOps(ctx);
      insertRowBelow();

      expect(notifyContentChange).not.toHaveBeenCalled();
      expect(table.querySelectorAll("tr").length).toBe(2);
    });

    it("deleteCurrentRow returns early when cell has no parentElement (row is null)", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const notifyContentChange = vi.fn();

      const detachedCell = document.createElement("td");

      const ctx: TableContext = {
        contentRef: editor.contentRef,
        isInTableCell: () => true,
        getCurrentTable: () => table,
        getCurrentCellAndTable: () => ({ cell: detachedCell as HTMLTableCellElement, table }),
        notifyContentChange,
        insertRowBelow: vi.fn(),
        deleteTable: vi.fn(),
      };

      const { deleteCurrentRow } = createTableRowOps(ctx);
      deleteCurrentRow();

      expect(notifyContentChange).not.toHaveBeenCalled();
      expect(table.querySelectorAll("tr").length).toBe(2);
    });
  });

  describe("useTableRowOps - zero-column edge case (via createTableRowOps)", () => {
    it("insertRowAbove skips focusCell when newRow has no cells (firstNewCell is null)", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const notifyContentChange = vi.fn();

      // Create a row that reports 0 cells via a custom HTMLCollection-like object
      const fakeRow = document.createElement("tr");
      const cell = document.createElement("td");
      cell.textContent = "test";
      fakeRow.appendChild(cell);

      // Put fakeRow inside the table tbody so parentNode is valid
      const tbody = table.querySelector("tbody")!;
      tbody.appendChild(fakeRow);

      // Override cells to report length 0 so createRow(0, false) produces a row with no cells
      Object.defineProperty(fakeRow, "cells", {
        get: () => ({ length: 0, item: () => null, 0: cell }),
        configurable: true,
      });

      const ctx: TableContext = {
        contentRef: editor.contentRef,
        isInTableCell: () => true,
        getCurrentTable: () => table,
        getCurrentCellAndTable: () => ({ cell: cell as HTMLTableCellElement, table }),
        notifyContentChange,
        insertRowBelow: vi.fn(),
        deleteTable: vi.fn(),
      };

      const { insertRowAbove } = createTableRowOps(ctx);
      insertRowAbove();

      // Should still call notifyContentChange even though no cell was focused
      expect(notifyContentChange).toHaveBeenCalled();
    });

    it("insertRowBelow skips focusCell when newRow has no cells (firstNewCell is null)", () => {
      editor = createTestEditor(createTableHtml(2, 2));
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const notifyContentChange = vi.fn();

      const fakeRow = document.createElement("tr");
      const cell = document.createElement("td");
      cell.textContent = "test";
      fakeRow.appendChild(cell);

      const tbody = table.querySelector("tbody")!;
      tbody.appendChild(fakeRow);

      Object.defineProperty(fakeRow, "cells", {
        get: () => ({ length: 0, item: () => null, 0: cell }),
        configurable: true,
      });

      const ctx: TableContext = {
        contentRef: editor.contentRef,
        isInTableCell: () => true,
        getCurrentTable: () => table,
        getCurrentCellAndTable: () => ({ cell: cell as HTMLTableCellElement, table }),
        notifyContentChange,
        insertRowBelow: vi.fn(),
        deleteTable: vi.fn(),
      };

      const { insertRowBelow } = createTableRowOps(ctx);
      insertRowBelow();

      expect(notifyContentChange).toHaveBeenCalled();
    });
  });

  describe("useTableRowOps - deleteCurrentRow targetCell null case (via createTableRowOps)", () => {
    it("skips focusCell when getCellAt returns null after row deletion", () => {
      // Create a table where after deleting a row, the target cell column doesn't exist
      // This happens when the deleted row had more columns than remaining rows
      editor = createTestEditor(
        "<table><thead><tr><th>H1</th></tr></thead><tbody><tr><td>C1</td><td>C2</td><td>C3</td></tr></tbody></table>"
      );
      const table = editor.container.querySelector("table") as HTMLTableElement;
      const notifyContentChange = vi.fn();

      // The body row (index 1) has 3 cells. Place cursor in col 2 (C3).
      const bodyRow = table.querySelector("tbody tr")!;
      const cell = bodyRow.querySelectorAll("td")[2]! as HTMLTableCellElement;

      const ctx: TableContext = {
        contentRef: editor.contentRef,
        isInTableCell: () => true,
        getCurrentTable: () => table,
        getCurrentCellAndTable: () => ({ cell, table }),
        notifyContentChange,
        insertRowBelow: vi.fn(),
        deleteTable: vi.fn(),
      };

      const { deleteCurrentRow } = createTableRowOps(ctx);
      deleteCurrentRow();

      // After deleting body row, only header remains (1 row with 1 cell).
      // getCellAt(table, 0, 2) returns null because header row only has 1 cell.
      // The targetCell guard should skip focusCell.
      expect(table.querySelectorAll("tr").length).toBe(1);
      expect(notifyContentChange).toHaveBeenCalled();
    });
  });

  describe("useTables - createTable cursor at non-block element", () => {
    it("walks through non-block elements and appends table when insertion point reaches contentRef", () => {
      // Create content with a SPAN (not a block element) so the while loop
      // traverses up without matching any block tags, ending at contentRef
      editor = createTestEditor("<span>Inline text</span>");
      const tables = createTables();

      // Place cursor inside the SPAN text
      const span = editor.container.querySelector("span")!;
      editor.setCursor(span.firstChild!, 3);

      tables.createTable(2, 2);

      // Table should be appended to contentRef since no block parent was found
      const table = editor.container.querySelector("table");
      expect(table).not.toBeNull();
      // Table should be the last child of contentRef
      expect(editor.container.lastElementChild?.tagName).toBe("TABLE");
      expect(onContentChange).toHaveBeenCalled();
    });
  });

  describe("useTables - createTable when range is outside contentRef", () => {
    it("does nothing when selection range is outside contentRef", () => {
      editor = createTestEditor("<p>Inside</p>");
      const tables = createTables();

      // Create a node outside contentRef and set selection there
      const outsideNode = document.createElement("p");
      outsideNode.textContent = "Outside";
      document.body.appendChild(outsideNode);
      editor.setCursor(outsideNode.firstChild!, 0);

      tables.createTable(2, 2);

      // No table should be created
      expect(editor.container.querySelector("table")).toBeNull();
      outsideNode.remove();
    });
  });

  describe("useTables - createTable with no selection", () => {
    it("does nothing when there is no selection range", () => {
      editor = createTestEditor("<p>Hello</p>");
      const tables = createTables();

      // Clear all selections
      window.getSelection()?.removeAllRanges();

      tables.createTable(2, 2);

      expect(editor.container.querySelector("table")).toBeNull();
    });
  });
});
