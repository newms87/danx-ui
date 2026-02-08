import { describe, it, expect } from "vitest";
import { parseTable } from "../parseTable";

describe("parseTable", () => {
  it("parses simple table with header, separator, and body rows", () => {
    const lines = ["| Name | Age |", "| --- | --- |", "| Alice | 30 |", "| Bob | 25 |"];
    const result = parseTable(lines, 0);
    expect(result).toEqual({
      token: {
        type: "table",
        headers: ["Name", "Age"],
        alignments: [null, null],
        rows: [
          ["Alice", "30"],
          ["Bob", "25"],
        ],
      },
      endIndex: 4,
    });
  });

  it("detects left alignment from separator", () => {
    const lines = ["| Col | Other |", "| :--- | --- |", "| val | x |"];
    const result = parseTable(lines, 0);
    expect(result!.token).toHaveProperty("alignments", ["left", null]);
  });

  it("detects right alignment from separator", () => {
    const lines = ["| Col | Other |", "| ---: | --- |", "| val | x |"];
    const result = parseTable(lines, 0);
    expect(result!.token).toHaveProperty("alignments", ["right", null]);
  });

  it("detects center alignment from separator", () => {
    const lines = ["| Col | Other |", "| :---: | --- |", "| val | x |"];
    const result = parseTable(lines, 0);
    expect(result!.token).toHaveProperty("alignments", ["center", null]);
  });

  it("detects mixed alignments", () => {
    const lines = [
      "| Left | Center | Right | Default |",
      "| :--- | :---: | ---: | --- |",
      "| a | b | c | d |",
    ];
    const result = parseTable(lines, 0);
    expect(result!.token).toHaveProperty("alignments", ["left", "center", "right", null]);
  });

  it("returns null for non-table content", () => {
    const lines = ["Just a paragraph of text"];
    expect(parseTable(lines, 0)).toBeNull();
  });

  it("returns null when no separator line follows", () => {
    const lines = ["| Header |", "| Not a separator |"];
    expect(parseTable(lines, 0)).toBeNull();
  });

  it("returns null when there is no next line", () => {
    const lines = ["| Header |"];
    expect(parseTable(lines, 0)).toBeNull();
  });

  it("handles multiple body rows", () => {
    const lines = ["| A | B |", "| --- | --- |", "| 1 | 2 |", "| 3 | 4 |", "| 5 | 6 |"];
    const result = parseTable(lines, 0);
    expect(result!.token).toHaveProperty("rows", [
      ["1", "2"],
      ["3", "4"],
      ["5", "6"],
    ]);
    expect(result!.endIndex).toBe(5);
  });

  it("handles cells with spaces", () => {
    const lines = ["| First Name | Last Name |", "| --- | --- |", "| John Doe | Jane Smith |"];
    const result = parseTable(lines, 0);
    expect(result!.token).toHaveProperty("headers", ["First Name", "Last Name"]);
    expect(result!.token).toHaveProperty("rows", [["John Doe", "Jane Smith"]]);
  });

  it("stops at non-table lines after body", () => {
    const lines = ["| H1 | H2 |", "| --- | --- |", "| a | b |", "", "Some text after"];
    const result = parseTable(lines, 0);
    expect(result!.endIndex).toBe(3);
    expect(result!.token).toHaveProperty("rows", [["a", "b"]]);
  });

  it("handles table with no body rows", () => {
    const lines = ["| H1 | H2 |", "| --- | --- |", ""];
    const result = parseTable(lines, 0);
    expect(result!.token).toHaveProperty("rows", []);
    expect(result!.endIndex).toBe(2);
  });

  it("starts parsing from given index", () => {
    const lines = ["text before", "| Col1 | Col2 |", "| --- | --- |", "| val1 | val2 |"];
    const result = parseTable(lines, 1);
    expect(result).not.toBeNull();
    expect(result!.token).toHaveProperty("headers", ["Col1", "Col2"]);
    expect(result!.endIndex).toBe(4);
  });

  it("handles table rows without leading/trailing pipes using space-pipe-space", () => {
    const lines = ["Col1 | Col2", "--- | ---", "a | b"];
    const result = parseTable(lines, 0);
    expect(result).not.toBeNull();
    expect(result!.token).toHaveProperty("headers", ["Col1", "Col2"]);
    expect(result!.token).toHaveProperty("rows", [["a", "b"]]);
  });

  it("handles separator without leading/trailing pipes", () => {
    const lines = ["| H1 | H2 |", "--- | ---", "| a | b |"];
    const result = parseTable(lines, 0);
    expect(result).not.toBeNull();
  });
});
