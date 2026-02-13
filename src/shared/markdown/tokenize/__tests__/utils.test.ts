import { describe, it, expect } from "vitest";
import { getIndent, parsePipeRow } from "../utils";

describe("utils", () => {
  describe("getIndent", () => {
    it("returns 0 for no indentation", () => {
      expect(getIndent("hello")).toBe(0);
    });

    it("returns number of leading spaces", () => {
      expect(getIndent("  hello")).toBe(2);
    });

    it("returns correct count for 4 spaces", () => {
      expect(getIndent("    hello")).toBe(4);
    });

    it("counts tabs as 2 spaces", () => {
      expect(getIndent("\thello")).toBe(2);
    });

    it("counts multiple tabs", () => {
      expect(getIndent("\t\thello")).toBe(4);
    });

    it("handles mixed tabs and spaces", () => {
      expect(getIndent("\t  hello")).toBe(4); // tab(2) + 2 spaces = 4
    });

    it("returns 0 for empty string", () => {
      expect(getIndent("")).toBe(0);
    });

    it("handles string of only spaces", () => {
      expect(getIndent("   ")).toBe(3);
    });

    it("handles string of only tabs", () => {
      expect(getIndent("\t\t")).toBe(4);
    });

    it("counts only leading whitespace, not trailing", () => {
      expect(getIndent("  hello  ")).toBe(2);
    });
  });

  describe("parsePipeRow", () => {
    it("splits pipe-delimited row into cells", () => {
      expect(parsePipeRow("| A | B | C |")).toEqual(["A", "B", "C"]);
    });

    it("removes leading and trailing pipes", () => {
      expect(parsePipeRow("| Hello | World |")).toEqual(["Hello", "World"]);
    });

    it("trims cell content", () => {
      expect(parsePipeRow("|  padded  |  cells  |")).toEqual(["padded", "cells"]);
    });

    it("handles row without leading pipe", () => {
      expect(parsePipeRow("A | B | C |")).toEqual(["A", "B", "C"]);
    });

    it("handles row without trailing pipe", () => {
      expect(parsePipeRow("| A | B | C")).toEqual(["A", "B", "C"]);
    });

    it("handles row without leading or trailing pipes", () => {
      expect(parsePipeRow("A | B | C")).toEqual(["A", "B", "C"]);
    });

    it("handles single cell", () => {
      expect(parsePipeRow("| only |")).toEqual(["only"]);
    });

    it("handles separator row", () => {
      expect(parsePipeRow("| --- | --- |")).toEqual(["---", "---"]);
    });

    it("handles alignment separator row", () => {
      expect(parsePipeRow("| :--- | :---: | ---: |")).toEqual([":---", ":---:", "---:"]);
    });

    it("handles cells with spaces in content", () => {
      expect(parsePipeRow("| First Name | Last Name |")).toEqual(["First Name", "Last Name"]);
    });

    it("handles empty cells", () => {
      expect(parsePipeRow("| | |")).toEqual(["", ""]);
    });

    it("handles leading/trailing whitespace on line", () => {
      expect(parsePipeRow("  | A | B |  ")).toEqual(["A", "B"]);
    });

    it("handles escaped pipes in cell content", () => {
      expect(parsePipeRow("| A \\| B | C |")).toEqual(["A | B", "C"]);
    });

    it("handles multiple escaped pipes in one cell", () => {
      expect(parsePipeRow("| A \\| B \\| C | D |")).toEqual(["A | B | C", "D"]);
    });

    it("handles escaped pipe at start of cell", () => {
      expect(parsePipeRow("| \\|leading | B |")).toEqual(["|leading", "B"]);
    });

    it("handles escaped pipe at end of cell", () => {
      expect(parsePipeRow("| trailing\\| | B |")).toEqual(["trailing|", "B"]);
    });
  });
});
