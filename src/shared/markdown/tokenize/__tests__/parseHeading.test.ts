import { describe, it, expect } from "vitest";
import { parseAtxHeading, parseSetextHeading } from "../parseHeading";

describe("parseHeading", () => {
  describe("parseAtxHeading", () => {
    it("parses H1 heading", () => {
      expect(parseAtxHeading("# Hello", 0)).toEqual({
        token: { type: "heading", level: 1, content: "Hello" },
        endIndex: 1,
      });
    });

    it("parses H2 heading", () => {
      expect(parseAtxHeading("## Title", 0)).toEqual({
        token: { type: "heading", level: 2, content: "Title" },
        endIndex: 1,
      });
    });

    it("parses H3 heading", () => {
      expect(parseAtxHeading("### Subtitle", 0)).toEqual({
        token: { type: "heading", level: 3, content: "Subtitle" },
        endIndex: 1,
      });
    });

    it("parses H4 heading", () => {
      expect(parseAtxHeading("#### Section", 0)).toEqual({
        token: { type: "heading", level: 4, content: "Section" },
        endIndex: 1,
      });
    });

    it("parses H5 heading", () => {
      expect(parseAtxHeading("##### Deep", 0)).toEqual({
        token: { type: "heading", level: 5, content: "Deep" },
        endIndex: 1,
      });
    });

    it("parses H6 heading", () => {
      expect(parseAtxHeading("###### Deepest", 0)).toEqual({
        token: { type: "heading", level: 6, content: "Deepest" },
        endIndex: 1,
      });
    });

    it("returns endIndex as index + 1", () => {
      expect(parseAtxHeading("# Test", 5)).toEqual({
        token: { type: "heading", level: 1, content: "Test" },
        endIndex: 6,
      });
    });

    it("returns null for too many hashes (7)", () => {
      expect(parseAtxHeading("####### Too many", 0)).toBeNull();
    });

    it("returns null for no space after hashes", () => {
      expect(parseAtxHeading("#Hello", 0)).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(parseAtxHeading("", 0)).toBeNull();
    });

    it("returns null for plain text", () => {
      expect(parseAtxHeading("Hello World", 0)).toBeNull();
    });

    it("returns null for hash in middle of line", () => {
      expect(parseAtxHeading("text # heading", 0)).toBeNull();
    });

    it("handles content with special characters", () => {
      expect(parseAtxHeading("## Hello! @#$% & more", 0)).toEqual({
        token: { type: "heading", level: 2, content: "Hello! @#$% & more" },
        endIndex: 1,
      });
    });

    it("handles content with markdown-like characters", () => {
      expect(parseAtxHeading("# **bold** and *italic*", 0)).toEqual({
        token: { type: "heading", level: 1, content: "**bold** and *italic*" },
        endIndex: 1,
      });
    });

    it("handles multiple spaces after hashes", () => {
      expect(parseAtxHeading("#  Multiple spaces", 0)).toEqual({
        token: { type: "heading", level: 1, content: "Multiple spaces" },
        endIndex: 1,
      });
    });

    it("returns null for just hashes and space with no content", () => {
      expect(parseAtxHeading("# ", 0)).toBeNull();
    });

    it("returns null for only hashes", () => {
      expect(parseAtxHeading("###", 0)).toBeNull();
    });
  });

  describe("parseSetextHeading", () => {
    it("parses level 1 heading with === underline", () => {
      const lines = ["My Heading", "==="];
      expect(parseSetextHeading(lines, 0)).toEqual({
        token: { type: "heading", level: 1, content: "My Heading" },
        endIndex: 2,
      });
    });

    it("parses level 1 heading with multiple = characters", () => {
      const lines = ["Title", "=========="];
      expect(parseSetextHeading(lines, 0)).toEqual({
        token: { type: "heading", level: 1, content: "Title" },
        endIndex: 2,
      });
    });

    it("parses level 2 heading with --- underline", () => {
      const lines = ["Subtitle", "---"];
      expect(parseSetextHeading(lines, 0)).toEqual({
        token: { type: "heading", level: 2, content: "Subtitle" },
        endIndex: 2,
      });
    });

    it("parses level 2 heading with multiple - characters", () => {
      const lines = ["Another Title", "----------"];
      expect(parseSetextHeading(lines, 0)).toEqual({
        token: { type: "heading", level: 2, content: "Another Title" },
        endIndex: 2,
      });
    });

    it("returns endIndex as index + 2", () => {
      const lines = ["before", "Heading", "===", "after"];
      expect(parseSetextHeading(lines, 1)).toEqual({
        token: { type: "heading", level: 1, content: "Heading" },
        endIndex: 3,
      });
    });

    it("returns null if at end of array (no next line)", () => {
      const lines = ["Only Line"];
      expect(parseSetextHeading(lines, 0)).toBeNull();
    });

    it("returns null if next line is not === or ---", () => {
      const lines = ["Text", "more text"];
      expect(parseSetextHeading(lines, 0)).toBeNull();
    });

    it("returns null if current line is empty", () => {
      const lines = ["", "==="];
      expect(parseSetextHeading(lines, 0)).toBeNull();
    });

    it("returns null if current line is only whitespace", () => {
      const lines = ["   ", "==="];
      expect(parseSetextHeading(lines, 0)).toBeNull();
    });

    it("must not parse list items followed by ---", () => {
      const lines = ["- list item", "---"];
      expect(parseSetextHeading(lines, 0)).toBeNull();
    });

    it("must not parse * list items followed by ---", () => {
      const lines = ["* list item", "---"];
      expect(parseSetextHeading(lines, 0)).toBeNull();
    });

    it("must not parse + list items followed by ---", () => {
      const lines = ["+ list item", "---"];
      expect(parseSetextHeading(lines, 0)).toBeNull();
    });

    it("trims whitespace from the heading content", () => {
      const lines = ["  Padded Heading  ", "==="];
      expect(parseSetextHeading(lines, 0)).toEqual({
        token: { type: "heading", level: 1, content: "Padded Heading" },
        endIndex: 2,
      });
    });

    it("handles heading with special characters", () => {
      const lines = ["Hello! @#$% World", "---"];
      expect(parseSetextHeading(lines, 0)).toEqual({
        token: { type: "heading", level: 2, content: "Hello! @#$% World" },
        endIndex: 2,
      });
    });

    it("returns null when index + 1 equals lines.length", () => {
      const lines = ["Last"];
      expect(parseSetextHeading(lines, 0)).toBeNull();
    });

    it("handles single = character", () => {
      const lines = ["Heading", "="];
      expect(parseSetextHeading(lines, 0)).toEqual({
        token: { type: "heading", level: 1, content: "Heading" },
        endIndex: 2,
      });
    });

    it("handles single - character for level 2", () => {
      const lines = ["Heading", "-"];
      expect(parseSetextHeading(lines, 0)).toEqual({
        token: { type: "heading", level: 2, content: "Heading" },
        endIndex: 2,
      });
    });
  });
});
