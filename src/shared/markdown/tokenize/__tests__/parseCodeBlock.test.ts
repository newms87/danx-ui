import { describe, it, expect } from "vitest";
import { parseFencedCodeBlock, parseIndentedCodeBlock } from "../parseCodeBlock";

describe("parseCodeBlock", () => {
  describe("parseFencedCodeBlock", () => {
    it("parses a basic fenced code block", () => {
      const lines = ["```", "console.log('hello');", "```"];
      expect(parseFencedCodeBlock(lines, 0)).toEqual({
        token: {
          type: "code_block",
          language: "",
          content: "console.log('hello');",
        },
        endIndex: 3,
      });
    });

    it("captures language after opening backticks", () => {
      const lines = ["```javascript", "const x = 1;", "```"];
      expect(parseFencedCodeBlock(lines, 0)).toEqual({
        token: {
          type: "code_block",
          language: "javascript",
          content: "const x = 1;",
        },
        endIndex: 3,
      });
    });

    it("captures language with trailing spaces trimmed", () => {
      const lines = ["```python  ", "print('hi')", "```"];
      expect(parseFencedCodeBlock(lines, 0)).toEqual({
        token: {
          type: "code_block",
          language: "python",
          content: "print('hi')",
        },
        endIndex: 3,
      });
    });

    it("captures multi-line content between fences", () => {
      const lines = ["```", "line 1", "line 2", "line 3", "```"];
      expect(parseFencedCodeBlock(lines, 0)).toEqual({
        token: {
          type: "code_block",
          language: "",
          content: "line 1\nline 2\nline 3",
        },
        endIndex: 5,
      });
    });

    it("handles empty code blocks", () => {
      const lines = ["```", "```"];
      expect(parseFencedCodeBlock(lines, 0)).toEqual({
        token: {
          type: "code_block",
          language: "",
          content: "",
        },
        endIndex: 2,
      });
    });

    it("handles unclosed code blocks (reads to end)", () => {
      const lines = ["```", "no closing fence", "still going"];
      expect(parseFencedCodeBlock(lines, 0)).toEqual({
        token: {
          type: "code_block",
          language: "",
          content: "no closing fence\nstill going",
        },
        endIndex: 3,
      });
    });

    it("returns null for lines not starting with ```", () => {
      const lines = ["not a code block", "```", "```"];
      expect(parseFencedCodeBlock(lines, 0)).toBeNull();
    });

    it("returns null for plain text", () => {
      const lines = ["Hello world"];
      expect(parseFencedCodeBlock(lines, 0)).toBeNull();
    });

    it("starts parsing from given index", () => {
      const lines = ["text before", "```ts", "code here", "```", "text after"];
      expect(parseFencedCodeBlock(lines, 1)).toEqual({
        token: {
          type: "code_block",
          language: "ts",
          content: "code here",
        },
        endIndex: 4,
      });
    });

    it("preserves indentation within code block", () => {
      const lines = ["```", "  indented", "    more indented", "```"];
      expect(parseFencedCodeBlock(lines, 0)).toEqual({
        token: {
          type: "code_block",
          language: "",
          content: "  indented\n    more indented",
        },
        endIndex: 4,
      });
    });

    it("preserves empty lines within code block", () => {
      const lines = ["```", "line 1", "", "line 3", "```"];
      expect(parseFencedCodeBlock(lines, 0)).toEqual({
        token: {
          type: "code_block",
          language: "",
          content: "line 1\n\nline 3",
        },
        endIndex: 5,
      });
    });

    it("handles leading whitespace on the fence line", () => {
      const lines = ["  ```js", "code", "  ```"];
      expect(parseFencedCodeBlock(lines, 0)).toEqual({
        token: {
          type: "code_block",
          language: "js",
          content: "code",
        },
        endIndex: 3,
      });
    });
  });

  describe("parseIndentedCodeBlock", () => {
    it("parses lines indented with 4 spaces as code", () => {
      const lines = ["    console.log('hi');"];
      expect(parseIndentedCodeBlock(lines, 0)).toEqual({
        token: {
          type: "code_block",
          language: "",
          content: "console.log('hi');",
        },
        endIndex: 1,
      });
    });

    it("parses tab-indented lines as code", () => {
      const lines = ["\tconsole.log('hi');"];
      expect(parseIndentedCodeBlock(lines, 0)).toEqual({
        token: {
          type: "code_block",
          language: "",
          content: "console.log('hi');",
        },
        endIndex: 1,
      });
    });

    it("strips the 4-space prefix from content", () => {
      const lines = ["    line 1", "    line 2"];
      expect(parseIndentedCodeBlock(lines, 0)).toEqual({
        token: {
          type: "code_block",
          language: "",
          content: "line 1\nline 2",
        },
        endIndex: 2,
      });
    });

    it("strips tab prefix from content", () => {
      const lines = ["\tline 1", "\tline 2"];
      expect(parseIndentedCodeBlock(lines, 0)).toEqual({
        token: {
          type: "code_block",
          language: "",
          content: "line 1\nline 2",
        },
        endIndex: 2,
      });
    });

    it("handles empty lines within indented block", () => {
      const lines = ["    line 1", "", "    line 3"];
      expect(parseIndentedCodeBlock(lines, 0)).toEqual({
        token: {
          type: "code_block",
          language: "",
          content: "line 1\n\nline 3",
        },
        endIndex: 3,
      });
    });

    it("removes trailing empty lines", () => {
      const lines = ["    code", "", ""];
      expect(parseIndentedCodeBlock(lines, 0)).toEqual({
        token: {
          type: "code_block",
          language: "",
          content: "code",
        },
        endIndex: 3,
      });
    });

    it("stops at non-indented, non-empty lines", () => {
      const lines = ["    code line 1", "    code line 2", "not code"];
      expect(parseIndentedCodeBlock(lines, 0)).toEqual({
        token: {
          type: "code_block",
          language: "",
          content: "code line 1\ncode line 2",
        },
        endIndex: 2,
      });
    });

    it("returns null for non-indented lines", () => {
      const lines = ["not indented"];
      expect(parseIndentedCodeBlock(lines, 0)).toBeNull();
    });

    it("returns null for lines indented with fewer than 4 spaces", () => {
      const lines = ["   only 3 spaces"];
      expect(parseIndentedCodeBlock(lines, 0)).toBeNull();
    });

    it("returns null if all lines are empty after stripping trailing", () => {
      const lines = ["    ", "    "];
      // After stripping 4-space prefix, content is empty strings.
      // After removing trailing empty lines, contentLines is empty.
      // The implementation strips prefix then checks trailing empties.
      // "    " matches the 4-space prefix pattern, so prefix is stripped yielding "".
      // Then trailing empty lines are removed, leaving empty array -> returns null.
      expect(parseIndentedCodeBlock(lines, 0)).toBeNull();
    });

    it("starts parsing from given index", () => {
      const lines = ["text", "    code here", "more text"];
      expect(parseIndentedCodeBlock(lines, 1)).toEqual({
        token: {
          type: "code_block",
          language: "",
          content: "code here",
        },
        endIndex: 2,
      });
    });

    it("always sets language to empty string", () => {
      const lines = ["    code"];
      const result = parseIndentedCodeBlock(lines, 0);
      expect(result!.token).toHaveProperty("language", "");
    });
  });
});
