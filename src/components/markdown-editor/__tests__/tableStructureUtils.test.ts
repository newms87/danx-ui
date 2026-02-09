import { describe, it, expect } from "vitest";
import {
  findTableAncestor,
  findCellAncestor,
  getCellCoordinates,
  getAllTableRows,
  getColumnCount,
  getCellAt,
  createCell,
  createRow,
  setColumnAlignment,
} from "../tableStructureUtils";

/**
 * Helper to create a container with HTML content
 */
function createContainer(html: string): HTMLElement {
  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);
  return container;
}

/**
 * Helper to clean up container
 */
function destroyContainer(container: HTMLElement): void {
  container.remove();
}

describe("tableStructureUtils", () => {
  describe("findTableAncestor", () => {
    it("returns table element when node is inside a table", () => {
      const container = createContainer("<table><tbody><tr><td>Cell</td></tr></tbody></table>");
      const td = container.querySelector("td")!;
      const textNode = td.firstChild!;

      const result = findTableAncestor(textNode, container);

      expect(result).toBeInstanceOf(HTMLTableElement);
      expect(result).toBe(container.querySelector("table"));
      destroyContainer(container);
    });

    it("returns null when node is not inside a table", () => {
      const container = createContainer("<p>Not in table</p>");
      const textNode = container.querySelector("p")!.firstChild!;

      expect(findTableAncestor(textNode, container)).toBeNull();
      destroyContainer(container);
    });

    it("returns null when node is null", () => {
      const container = createContainer("<p>Test</p>");
      expect(findTableAncestor(null, container)).toBeNull();
      destroyContainer(container);
    });

    it("stops traversal at contentRef boundary", () => {
      // The container itself is inside a table, but the function should not walk past contentRef
      const outerTable = document.createElement("table");
      const outerTr = document.createElement("tr");
      const outerTd = document.createElement("td");
      outerTable.appendChild(outerTr);
      outerTr.appendChild(outerTd);
      const container = document.createElement("div");
      const p = document.createElement("p");
      p.textContent = "Not in table";
      container.appendChild(p);
      outerTd.appendChild(container);
      document.body.appendChild(outerTable);

      // The paragraph is inside container which is inside a table,
      // but traversal stops at container boundary so table is not found
      expect(findTableAncestor(p.firstChild!, container)).toBeNull();
      outerTable.remove();
    });

    it("returns nearest table when node is the table element itself", () => {
      const container = createContainer("<table><tbody><tr><td>Cell</td></tr></tbody></table>");
      const table = container.querySelector("table")!;

      expect(findTableAncestor(table, container)).toBe(table);
      destroyContainer(container);
    });
  });

  describe("findCellAncestor", () => {
    it("returns TD element when node is inside a TD", () => {
      const container = createContainer("<table><tbody><tr><td>Cell</td></tr></tbody></table>");
      const td = container.querySelector("td")!;
      const textNode = td.firstChild!;

      const result = findCellAncestor(textNode, container);

      expect(result?.tagName).toBe("TD");
      destroyContainer(container);
    });

    it("returns TH element when node is inside a TH", () => {
      const container = createContainer("<table><thead><tr><th>Header</th></tr></thead></table>");
      const th = container.querySelector("th")!;
      const textNode = th.firstChild!;

      const result = findCellAncestor(textNode, container);

      expect(result?.tagName).toBe("TH");
      destroyContainer(container);
    });

    it("returns null when node is not inside a cell", () => {
      const container = createContainer("<p>Not in cell</p>");
      const textNode = container.querySelector("p")!.firstChild!;

      expect(findCellAncestor(textNode, container)).toBeNull();
      destroyContainer(container);
    });

    it("returns null when node is null", () => {
      const container = createContainer("<p>Test</p>");
      expect(findCellAncestor(null, container)).toBeNull();
      destroyContainer(container);
    });

    it("finds cell ancestor through nested elements", () => {
      const container = createContainer(
        "<table><tbody><tr><td><strong>Bold</strong></td></tr></tbody></table>"
      );
      const strong = container.querySelector("strong")!;
      const textNode = strong.firstChild!;

      const result = findCellAncestor(textNode, container);

      expect(result?.tagName).toBe("TD");
      destroyContainer(container);
    });
  });

  describe("getCellCoordinates", () => {
    it("returns correct coordinates for header cell", () => {
      const container = createContainer(
        "<table><thead><tr><th>H1</th><th>H2</th></tr></thead><tbody><tr><td>C1</td><td>C2</td></tr></tbody></table>"
      );
      const th = container.querySelectorAll("th")[1]!;

      const coords = getCellCoordinates(th);

      expect(coords.row).toBe(0);
      expect(coords.col).toBe(1);
      destroyContainer(container);
    });

    it("returns correct coordinates for body cell", () => {
      const container = createContainer(
        "<table><thead><tr><th>H1</th><th>H2</th></tr></thead><tbody><tr><td>C1</td><td>C2</td></tr><tr><td>D1</td><td>D2</td></tr></tbody></table>"
      );
      const tds = container.querySelectorAll("td");
      const cell = tds[3]!; // D2 - row 2, col 1

      const coords = getCellCoordinates(cell as HTMLTableCellElement);

      expect(coords.row).toBe(2);
      expect(coords.col).toBe(1);
      destroyContainer(container);
    });

    it("returns -1,-1 when cell has no parent row", () => {
      const cell = document.createElement("td");
      const coords = getCellCoordinates(cell);

      expect(coords.row).toBe(-1);
      expect(coords.col).toBe(-1);
    });

    it("returns -1,-1 when row has no parent table", () => {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      row.appendChild(cell);

      const coords = getCellCoordinates(cell);

      expect(coords.row).toBe(-1);
      expect(coords.col).toBe(-1);
    });
  });

  describe("getAllTableRows", () => {
    it("returns all rows including thead and tbody", () => {
      const container = createContainer(
        "<table><thead><tr><th>H</th></tr></thead><tbody><tr><td>1</td></tr><tr><td>2</td></tr></tbody></table>"
      );
      const table = container.querySelector("table")!;

      const rows = getAllTableRows(table);

      expect(rows.length).toBe(3);
      destroyContainer(container);
    });

    it("returns empty array for table with no rows", () => {
      const table = document.createElement("table");

      expect(getAllTableRows(table)).toEqual([]);
    });

    it("returns rows from table without thead/tbody wrappers", () => {
      const container = createContainer("<table><tr><td>1</td></tr><tr><td>2</td></tr></table>");
      const table = container.querySelector("table")!;

      const rows = getAllTableRows(table);

      expect(rows.length).toBe(2);
      destroyContainer(container);
    });
  });

  describe("getColumnCount", () => {
    it("returns number of columns in first row", () => {
      const container = createContainer(
        "<table><thead><tr><th>1</th><th>2</th><th>3</th></tr></thead></table>"
      );
      const table = container.querySelector("table")!;

      expect(getColumnCount(table)).toBe(3);
      destroyContainer(container);
    });

    it("returns 0 for empty table", () => {
      const table = document.createElement("table");

      expect(getColumnCount(table)).toBe(0);
    });
  });

  describe("getCellAt", () => {
    it("returns cell at valid coordinates", () => {
      const container = createContainer(
        "<table><thead><tr><th>H1</th><th>H2</th></tr></thead><tbody><tr><td>C1</td><td>C2</td></tr></tbody></table>"
      );
      const table = container.querySelector("table")!;

      const cell = getCellAt(table, 1, 1);

      expect(cell?.textContent).toBe("C2");
      destroyContainer(container);
    });

    it("returns null for out-of-range row index", () => {
      const container = createContainer("<table><tbody><tr><td>Cell</td></tr></tbody></table>");
      const table = container.querySelector("table")!;

      expect(getCellAt(table, 5, 0)).toBeNull();
      expect(getCellAt(table, -1, 0)).toBeNull();
      destroyContainer(container);
    });

    it("returns null for out-of-range column index", () => {
      const container = createContainer("<table><tbody><tr><td>Cell</td></tr></tbody></table>");
      const table = container.querySelector("table")!;

      expect(getCellAt(table, 0, 5)).toBeNull();
      expect(getCellAt(table, 0, -1)).toBeNull();
      destroyContainer(container);
    });
  });

  describe("createCell", () => {
    it("creates TH when isHeader is true", () => {
      const cell = createCell(true);

      expect(cell.tagName).toBe("TH");
      expect(cell.querySelector("br")).not.toBeNull();
    });

    it("creates TD when isHeader is false", () => {
      const cell = createCell(false);

      expect(cell.tagName).toBe("TD");
      expect(cell.querySelector("br")).not.toBeNull();
    });
  });

  describe("createRow", () => {
    it("creates row with correct number of cells", () => {
      const row = createRow(4, false);

      expect(row.tagName).toBe("TR");
      expect(row.cells.length).toBe(4);
    });

    it("creates header cells when isHeader is true", () => {
      const row = createRow(2, true);

      expect(row.cells[0]!.tagName).toBe("TH");
      expect(row.cells[1]!.tagName).toBe("TH");
    });

    it("creates body cells when isHeader is false", () => {
      const row = createRow(2, false);

      expect(row.cells[0]!.tagName).toBe("TD");
      expect(row.cells[1]!.tagName).toBe("TD");
    });

    it("creates row with zero cells", () => {
      const row = createRow(0, false);

      expect(row.cells.length).toBe(0);
    });
  });

  describe("setColumnAlignment", () => {
    it("sets center alignment on all cells in column", () => {
      const container = createContainer(
        "<table><thead><tr><th>H1</th><th>H2</th></tr></thead><tbody><tr><td>C1</td><td>C2</td></tr></tbody></table>"
      );
      const table = container.querySelector("table")!;

      setColumnAlignment(table, 0, "center");

      const th = container.querySelector("th")!;
      const td = container.querySelector("td")!;
      expect(th.style.textAlign).toBe("center");
      expect(td.style.textAlign).toBe("center");
      destroyContainer(container);
    });

    it("sets right alignment on specified column", () => {
      const container = createContainer(
        "<table><tbody><tr><td>C1</td><td>C2</td></tr></tbody></table>"
      );
      const table = container.querySelector("table")!;

      setColumnAlignment(table, 1, "right");

      const tds = container.querySelectorAll("td");
      expect((tds[0] as HTMLElement).style.textAlign).toBe("");
      expect((tds[1] as HTMLElement).style.textAlign).toBe("right");
      destroyContainer(container);
    });

    it("removes text-align property for left alignment", () => {
      const container = createContainer("<table><tbody><tr><td>C1</td></tr></tbody></table>");
      const table = container.querySelector("table")!;
      const td = container.querySelector("td") as HTMLElement;
      td.style.textAlign = "center";

      setColumnAlignment(table, 0, "left");

      expect(td.style.textAlign).toBe("");
      destroyContainer(container);
    });

    it("handles column index beyond row length gracefully", () => {
      const container = createContainer("<table><tbody><tr><td>Cell</td></tr></tbody></table>");
      const table = container.querySelector("table")!;

      // Should not throw
      setColumnAlignment(table, 5, "center");
      destroyContainer(container);
    });
  });
});
