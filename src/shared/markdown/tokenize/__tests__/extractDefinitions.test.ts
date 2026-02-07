import { describe, it, expect, beforeEach } from "vitest";
import { extractDefinitions } from "../extractDefinitions";
import { getLinkRefs, getFootnotes, resetParserState } from "../../state";

describe("extractDefinitions", () => {
  beforeEach(() => {
    resetParserState();
  });

  describe("link references", () => {
    it("extracts link references [ref]: URL and sets them in state", () => {
      const lines = ["[google]: https://google.com", "Some text"];
      const result = extractDefinitions(lines);
      expect(getLinkRefs()).toEqual({
        google: { url: "https://google.com", title: undefined },
      });
      expect(result).toEqual(["Some text"]);
    });

    it("extracts link references with title", () => {
      const lines = ['[example]: https://example.com "Example Site"'];
      const result = extractDefinitions(lines);
      expect(getLinkRefs()).toEqual({
        example: { url: "https://example.com", title: "Example Site" },
      });
      expect(result).toEqual([]);
    });

    it("extracts link references with single-quoted title", () => {
      const lines = ["[site]: https://site.com 'My Site'"];
      const result = extractDefinitions(lines);
      expect(getLinkRefs()).toEqual({
        site: { url: "https://site.com", title: "My Site" },
      });
      expect(result).toEqual([]);
    });

    it("lowercases reference IDs", () => {
      const lines = ["[MyRef]: https://example.com"];
      extractDefinitions(lines);
      expect(getLinkRefs()).toHaveProperty("myref");
      expect(getLinkRefs()).not.toHaveProperty("MyRef");
    });

    it("handles URL wrapped in angle brackets", () => {
      const lines = ["[ref]: <https://example.com>"];
      extractDefinitions(lines);
      expect(getLinkRefs()).toEqual({
        ref: { url: "https://example.com", title: undefined },
      });
    });

    it("handles multiple link references", () => {
      const lines = [
        "[first]: https://first.com",
        "[second]: https://second.com",
        "Normal text",
      ];
      const result = extractDefinitions(lines);
      const refs = getLinkRefs();
      expect(refs).toHaveProperty("first");
      expect(refs).toHaveProperty("second");
      expect(result).toEqual(["Normal text"]);
    });

    it("removes link reference lines from output", () => {
      const lines = [
        "Before",
        "[ref]: https://example.com",
        "After",
      ];
      const result = extractDefinitions(lines);
      expect(result).toEqual(["Before", "After"]);
    });

    it("handles leading whitespace on reference lines", () => {
      const lines = ["  [ref]: https://example.com"];
      extractDefinitions(lines);
      expect(getLinkRefs()).toHaveProperty("ref");
    });
  });

  describe("footnote definitions", () => {
    it("extracts footnote definitions [^id]: content and sets them in state", () => {
      const lines = ["[^1]: This is a footnote", "Some text"];
      const result = extractDefinitions(lines);
      const footnotes = getFootnotes();
      expect(footnotes).toHaveProperty("1");
      expect(footnotes["1"]!.content).toBe("This is a footnote");
      expect(footnotes["1"]!.index).toBe(1);
      expect(result).toEqual(["Some text"]);
    });

    it("extracts multiple footnotes with incrementing indices", () => {
      const lines = [
        "[^first]: First footnote",
        "[^second]: Second footnote",
      ];
      extractDefinitions(lines);
      const footnotes = getFootnotes();
      expect(footnotes["first"]!.index).toBe(1);
      expect(footnotes["second"]!.index).toBe(2);
    });

    it("removes footnote definition lines from output", () => {
      const lines = [
        "Before",
        "[^fn]: Footnote content",
        "After",
      ];
      const result = extractDefinitions(lines);
      expect(result).toEqual(["Before", "After"]);
    });

    it("handles footnote IDs with letters and numbers", () => {
      const lines = ["[^note1]: A footnote"];
      extractDefinitions(lines);
      expect(getFootnotes()).toHaveProperty("note1");
    });

    it("handles leading whitespace on footnote lines", () => {
      const lines = ["  [^fn]: Footnote content"];
      extractDefinitions(lines);
      expect(getFootnotes()).toHaveProperty("fn");
    });
  });

  describe("mixed definitions", () => {
    it("extracts both link references and footnotes", () => {
      const lines = [
        "Text before",
        "[ref]: https://example.com",
        "[^note]: A footnote",
        "Text after",
      ];
      const result = extractDefinitions(lines);
      expect(getLinkRefs()).toHaveProperty("ref");
      expect(getFootnotes()).toHaveProperty("note");
      expect(result).toEqual(["Text before", "Text after"]);
    });
  });

  describe("non-definition lines", () => {
    it("keeps non-definition lines in output", () => {
      const lines = [
        "Line 1",
        "Line 2",
        "Line 3",
      ];
      const result = extractDefinitions(lines);
      expect(result).toEqual(["Line 1", "Line 2", "Line 3"]);
    });

    it("returns empty array for empty input", () => {
      expect(extractDefinitions([])).toEqual([]);
    });

    it("keeps lines that look like references but are not", () => {
      const lines = ["[not a ref] without colon-space-url"];
      const result = extractDefinitions(lines);
      expect(result).toEqual(["[not a ref] without colon-space-url"]);
    });
  });
});
