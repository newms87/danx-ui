import { describe, it, expect } from "vitest";
import { parseDefinitionList } from "../parseDefinitionList";

describe("parseDefinitionList", () => {
  it("parses term followed by : definition", () => {
    const lines = ["Term", ": Definition text"];
    const result = parseDefinitionList(lines, 0);
    expect(result).toEqual({
      token: {
        type: "dl",
        items: [
          { term: "Term", definitions: ["Definition text"] },
        ],
      },
      endIndex: 2,
    });
  });

  it("handles multiple definitions for one term", () => {
    const lines = ["Term", ": Definition 1", ": Definition 2"];
    const result = parseDefinitionList(lines, 0);
    expect(result).toEqual({
      token: {
        type: "dl",
        items: [
          { term: "Term", definitions: ["Definition 1", "Definition 2"] },
        ],
      },
      endIndex: 3,
    });
  });

  it("handles multiple terms with definitions", () => {
    const lines = [
      "First Term",
      ": First definition",
      "Second Term",
      ": Second definition",
    ];
    const result = parseDefinitionList(lines, 0);
    expect(result).toEqual({
      token: {
        type: "dl",
        items: [
          { term: "First Term", definitions: ["First definition"] },
          { term: "Second Term", definitions: ["Second definition"] },
        ],
      },
      endIndex: 4,
    });
  });

  it("returns null when next line does not start with : ", () => {
    const lines = ["Term", "Not a definition"];
    expect(parseDefinitionList(lines, 0)).toBeNull();
  });

  it("returns null for empty current line", () => {
    const lines = ["", ": definition"];
    expect(parseDefinitionList(lines, 0)).toBeNull();
  });

  it("returns null for lines starting with -", () => {
    const lines = ["- list item", ": definition"];
    expect(parseDefinitionList(lines, 0)).toBeNull();
  });

  it("returns null for lines starting with #", () => {
    const lines = ["# heading", ": definition"];
    expect(parseDefinitionList(lines, 0)).toBeNull();
  });

  it("returns null for lines starting with >", () => {
    const lines = ["> blockquote", ": definition"];
    expect(parseDefinitionList(lines, 0)).toBeNull();
  });

  it("returns null for lines starting with a digit", () => {
    const lines = ["1. ordered item", ": definition"];
    expect(parseDefinitionList(lines, 0)).toBeNull();
  });

  it("returns null for lines starting with *", () => {
    const lines = ["* list item", ": definition"];
    expect(parseDefinitionList(lines, 0)).toBeNull();
  });

  it("returns null for lines starting with +", () => {
    const lines = ["+ list item", ": definition"];
    expect(parseDefinitionList(lines, 0)).toBeNull();
  });

  it("returns null when current line starts with :", () => {
    const lines = [": starts with colon", ": definition"];
    expect(parseDefinitionList(lines, 0)).toBeNull();
  });

  it("returns null when there is no next line", () => {
    const lines = ["Term Only"];
    expect(parseDefinitionList(lines, 0)).toBeNull();
  });

  it("starts parsing from given index", () => {
    const lines = ["other text", "Term", ": Definition"];
    const result = parseDefinitionList(lines, 1);
    expect(result).toEqual({
      token: {
        type: "dl",
        items: [
          { term: "Term", definitions: ["Definition"] },
        ],
      },
      endIndex: 3,
    });
  });

  it("stops at lines that are not term or definition", () => {
    const lines = [
      "Term",
      ": Definition",
      "# Heading after",
    ];
    const result = parseDefinitionList(lines, 0);
    expect(result).toEqual({
      token: {
        type: "dl",
        items: [
          { term: "Term", definitions: ["Definition"] },
        ],
      },
      endIndex: 2,
    });
  });

  it("handles terms with special characters", () => {
    const lines = ["My **Term** Here", ": The definition"];
    const result = parseDefinitionList(lines, 0);
    expect(result!.token).toHaveProperty("items", [
      { term: "My **Term** Here", definitions: ["The definition"] },
    ]);
  });

  it("handles definitions with special characters", () => {
    const lines = ["Term", ": Definition with **bold** and `code`"];
    const result = parseDefinitionList(lines, 0);
    expect(result!.token).toHaveProperty("items", [
      { term: "Term", definitions: ["Definition with **bold** and `code`"] },
    ]);
  });

  it("continues parsing when another term-definition pair follows an empty line", () => {
    const lines = ["Term 1", ": Def 1", "", "Term 2", ": Def 2"];
    const result = parseDefinitionList(lines, 0);
    expect(result).not.toBeNull();
    expect(result!.token).toHaveProperty("items", [
      { term: "Term 1", definitions: ["Def 1"] },
      { term: "Term 2", definitions: ["Def 2"] },
    ]);
  });

  it("stops at empty line when no further term-definition pair follows", () => {
    const lines = ["Term", ": Def", "", "Not a term"];
    const result = parseDefinitionList(lines, 0);
    expect(result).not.toBeNull();
    expect(result!.token).toHaveProperty("items", [
      { term: "Term", definitions: ["Def"] },
    ]);
    // endIndex should stop after the empty line
    expect(result!.endIndex).toBeLessThanOrEqual(4);
  });

  it("stops at empty line when next content starts with colon", () => {
    const lines = ["Term", ": Def", "", ": Orphan"];
    const result = parseDefinitionList(lines, 0);
    expect(result).not.toBeNull();
    expect(result!.token).toHaveProperty("items", [
      { term: "Term", definitions: ["Def"] },
    ]);
  });

  it("stops at empty line at end of input", () => {
    const lines = ["Term", ": Def", ""];
    const result = parseDefinitionList(lines, 0);
    expect(result).not.toBeNull();
    expect(result!.token).toHaveProperty("items", [
      { term: "Term", definitions: ["Def"] },
    ]);
  });
});
