import { describe, it, expect } from "vitest";
import { parseParagraph } from "../parseParagraph";

describe("parseParagraph", () => {
  it("collects consecutive non-empty, non-block lines", () => {
    const lines = ["Hello world", "This is a paragraph"];
    expect(parseParagraph(lines, 0)).toEqual({
      token: {
        type: "paragraph",
        content: "Hello world\nThis is a paragraph",
      },
      endIndex: 2,
    });
  });

  it("stops at empty lines", () => {
    const lines = ["Line 1", "Line 2", "", "Line 4"];
    const result = parseParagraph(lines, 0);
    expect(result).toEqual({
      token: {
        type: "paragraph",
        content: "Line 1\nLine 2",
      },
      endIndex: 3, // endIndex advances past the empty line
    });
  });

  it("stops at heading block starter", () => {
    const lines = ["Paragraph text", "# Heading"];
    expect(parseParagraph(lines, 0)).toEqual({
      token: {
        type: "paragraph",
        content: "Paragraph text",
      },
      endIndex: 1,
    });
  });

  it("stops at fenced code block starter", () => {
    const lines = ["Paragraph text", "```js"];
    expect(parseParagraph(lines, 0)).toEqual({
      token: {
        type: "paragraph",
        content: "Paragraph text",
      },
      endIndex: 1,
    });
  });

  it("stops at blockquote starter", () => {
    const lines = ["Paragraph text", "> quote"];
    expect(parseParagraph(lines, 0)).toEqual({
      token: {
        type: "paragraph",
        content: "Paragraph text",
      },
      endIndex: 1,
    });
  });

  it("stops at unordered list starter with -", () => {
    const lines = ["Paragraph text", "- list item"];
    expect(parseParagraph(lines, 0)).toEqual({
      token: {
        type: "paragraph",
        content: "Paragraph text",
      },
      endIndex: 1,
    });
  });

  it("stops at unordered list starter with *", () => {
    const lines = ["Paragraph text", "* list item"];
    expect(parseParagraph(lines, 0)).toEqual({
      token: {
        type: "paragraph",
        content: "Paragraph text",
      },
      endIndex: 1,
    });
  });

  it("stops at unordered list starter with +", () => {
    const lines = ["Paragraph text", "+ list item"];
    expect(parseParagraph(lines, 0)).toEqual({
      token: {
        type: "paragraph",
        content: "Paragraph text",
      },
      endIndex: 1,
    });
  });

  it("stops at ordered list starter", () => {
    const lines = ["Paragraph text", "1. list item"];
    expect(parseParagraph(lines, 0)).toEqual({
      token: {
        type: "paragraph",
        content: "Paragraph text",
      },
      endIndex: 1,
    });
  });

  it("stops at horizontal rule", () => {
    const lines = ["Paragraph text", "---"];
    expect(parseParagraph(lines, 0)).toEqual({
      token: {
        type: "paragraph",
        content: "Paragraph text",
      },
      endIndex: 1,
    });
  });

  it("returns null for empty lines at start", () => {
    const lines = ["", "Some text"];
    expect(parseParagraph(lines, 0)).toBeNull();
  });

  it("returns null when first line is a block starter", () => {
    const lines = ["# Heading"];
    expect(parseParagraph(lines, 0)).toBeNull();
  });

  it("returns null for empty input at index", () => {
    const lines: string[] = [];
    expect(parseParagraph(lines, 0)).toBeNull();
  });

  it("joins multiple lines with newlines", () => {
    const lines = ["Line A", "Line B", "Line C"];
    const result = parseParagraph(lines, 0);
    expect(result!.token).toHaveProperty("content", "Line A\nLine B\nLine C");
  });

  it("preserves original line content (no trimming)", () => {
    const lines = ["  indented line"];
    const result = parseParagraph(lines, 0);
    expect(result!.token).toHaveProperty("content", "  indented line");
  });

  it("handles single line paragraph", () => {
    const lines = ["Single line"];
    expect(parseParagraph(lines, 0)).toEqual({
      token: {
        type: "paragraph",
        content: "Single line",
      },
      endIndex: 1,
    });
  });

  it("starts parsing from given index", () => {
    const lines = ["# heading", "paragraph text", "more text"];
    expect(parseParagraph(lines, 1)).toEqual({
      token: {
        type: "paragraph",
        content: "paragraph text\nmore text",
      },
      endIndex: 3,
    });
  });

  it("handles text with special characters", () => {
    const lines = ["Hello! @#$% **bold** `code` [link](url)"];
    const result = parseParagraph(lines, 0);
    expect(result!.token).toHaveProperty("content", "Hello! @#$% **bold** `code` [link](url)");
  });
});
