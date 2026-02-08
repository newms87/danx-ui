import { describe, it, expect } from "vitest";
import { parseList } from "../parseList";

describe("parseList", () => {
  describe("unordered lists", () => {
    it("parses unordered list with - items", () => {
      const lines = ["- item 1", "- item 2", "- item 3"];
      const result = parseList(lines, 0, 0);
      expect(result.tokens).toEqual([
        {
          type: "ul",
          items: [
            { content: "item 1" },
            { content: "item 2" },
            { content: "item 3" },
          ],
        },
      ]);
      expect(result.endIndex).toBe(3);
    });

    it("parses unordered list with * items", () => {
      const lines = ["* item 1", "* item 2"];
      const result = parseList(lines, 0, 0);
      expect(result.tokens).toEqual([
        {
          type: "ul",
          items: [
            { content: "item 1" },
            { content: "item 2" },
          ],
        },
      ]);
      expect(result.endIndex).toBe(2);
    });

    it("parses unordered list with + items", () => {
      const lines = ["+ item 1", "+ item 2"];
      const result = parseList(lines, 0, 0);
      expect(result.tokens).toEqual([
        {
          type: "ul",
          items: [
            { content: "item 1" },
            { content: "item 2" },
          ],
        },
      ]);
      expect(result.endIndex).toBe(2);
    });
  });

  describe("ordered lists", () => {
    it("parses ordered list with 1. 2. 3. items", () => {
      const lines = ["1. first", "2. second", "3. third"];
      const result = parseList(lines, 0, 0);
      expect(result.tokens).toEqual([
        {
          type: "ol",
          items: [
            { content: "first" },
            { content: "second" },
            { content: "third" },
          ],
          start: 1,
        },
      ]);
      expect(result.endIndex).toBe(3);
    });

    it("handles start number for ordered lists", () => {
      const lines = ["5. fifth", "6. sixth"];
      const result = parseList(lines, 0, 0);
      expect(result.tokens).toEqual([
        {
          type: "ol",
          items: [
            { content: "fifth" },
            { content: "sixth" },
          ],
          start: 5,
        },
      ]);
    });

    it("uses start number from first item only", () => {
      const lines = ["3. three", "4. four"];
      const result = parseList(lines, 0, 0);
      expect(result.tokens[0]).toHaveProperty("start", 3);
    });
  });

  describe("nested lists", () => {
    it("handles nested lists (items indented by 2)", () => {
      const lines = [
        "- parent 1",
        "  - child 1",
        "  - child 2",
        "- parent 2",
      ];
      const result = parseList(lines, 0, 0);
      expect(result.tokens).toEqual([
        {
          type: "ul",
          items: [
            {
              content: "parent 1",
              children: [
                {
                  type: "ul",
                  items: [
                    { content: "child 1" },
                    { content: "child 2" },
                  ],
                },
              ],
            },
            { content: "parent 2" },
          ],
        },
      ]);
    });

    it("handles deeply nested lists", () => {
      const lines = [
        "- level 0",
        "  - level 1",
        "    - level 2",
      ];
      const result = parseList(lines, 0, 0);
      expect(result.tokens).toEqual([
        {
          type: "ul",
          items: [
            {
              content: "level 0",
              children: [
                {
                  type: "ul",
                  items: [
                    {
                      content: "level 1",
                      children: [
                        {
                          type: "ul",
                          items: [{ content: "level 2" }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]);
    });
  });

  describe("mixed and edge cases", () => {
    it("stops at empty lines between different list types", () => {
      const lines = ["- unordered", "", "1. ordered"];
      const result = parseList(lines, 0, 0);
      // Should parse the unordered list only; empty line is skipped
      // but different list type causes break
      expect(result.tokens[0]).toHaveProperty("type", "ul");
    });

    it("returns empty tokens for non-list content", () => {
      const lines = ["Just some text"];
      const result = parseList(lines, 0, 0);
      expect(result.tokens).toEqual([]);
      expect(result.endIndex).toBe(0);
    });

    it("returns empty tokens for empty input", () => {
      const result = parseList([], 0, 0);
      expect(result.tokens).toEqual([]);
      expect(result.endIndex).toBe(0);
    });

    it("skips empty lines within a list", () => {
      const lines = ["- item 1", "", "- item 2"];
      const result = parseList(lines, 0, 0);
      expect(result.tokens).toEqual([
        {
          type: "ul",
          items: [
            { content: "item 1" },
            { content: "item 2" },
          ],
        },
      ]);
    });

    it("stops when indent is less than baseIndent", () => {
      const lines = ["  - nested item", "- top level"];
      const result = parseList(lines, 0, 2);
      expect(result.tokens).toEqual([
        {
          type: "ul",
          items: [{ content: "nested item" }],
        },
      ]);
      // Should stop at "- top level" because indent 0 < baseIndent 2
      expect(result.endIndex).toBe(1);
    });

    it("handles single item list", () => {
      const lines = ["- only item"];
      const result = parseList(lines, 0, 0);
      expect(result.tokens).toEqual([
        {
          type: "ul",
          items: [{ content: "only item" }],
        },
      ]);
    });

    it("starts from given startIndex", () => {
      const lines = ["text", "- item 1", "- item 2"];
      const result = parseList(lines, 1, 0);
      expect(result.tokens).toEqual([
        {
          type: "ul",
          items: [
            { content: "item 1" },
            { content: "item 2" },
          ],
        },
      ]);
      expect(result.endIndex).toBe(3);
    });

    it("handles items with special characters", () => {
      const lines = ["- Hello! @world **bold**", "- `code` and more"];
      const result = parseList(lines, 0, 0);
      expect(result.tokens).toEqual([
        {
          type: "ul",
          items: [
            { content: "Hello! @world **bold**" },
            { content: "`code` and more" },
          ],
        },
      ]);
    });

    it("skips empty lines between items in inner collection loop", () => {
      // This exercises the empty-line handling within the inner while loop (lines 79-82)
      const lines = ["- item 1", "", "", "- item 2"];
      const result = parseList(lines, 0, 0);
      expect(result.tokens).toEqual([
        {
          type: "ul",
          items: [
            { content: "item 1" },
            { content: "item 2" },
          ],
        },
      ]);
    });

    it("breaks when nested content has higher indent than base but is not a list item of same type", () => {
      // This exercises line 102-104: itemIndent > baseIndent causes break
      const lines = ["- item 1", "    non-list content at indent 4"];
      const result = parseList(lines, 0, 0);
      expect(result.tokens[0]).toHaveProperty("type", "ul");
      // The nested non-list line causes the inner loop to delegate to recursion
      // which finds no valid list items and returns
    });
  });
});
