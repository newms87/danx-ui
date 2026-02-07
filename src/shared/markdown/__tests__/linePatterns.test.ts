import { describe, it, expect } from "vitest";
import {
  detectHeadingPattern,
  detectListPattern,
  detectBlockquotePattern,
  detectCodeFenceStart,
  isHorizontalRule,
  detectLinePattern,
} from "../linePatterns";

describe("linePatterns", () => {
  describe("detectHeadingPattern", () => {
    it("detects H1 pattern", () => {
      expect(detectHeadingPattern("# Hello")).toEqual({ level: 1, content: "Hello" });
    });

    it("detects H2 pattern", () => {
      expect(detectHeadingPattern("## Title")).toEqual({ level: 2, content: "Title" });
    });

    it("detects H3 pattern", () => {
      expect(detectHeadingPattern("### Subtitle")).toEqual({ level: 3, content: "Subtitle" });
    });

    it("detects H4 pattern", () => {
      expect(detectHeadingPattern("#### Section")).toEqual({ level: 4, content: "Section" });
    });

    it("detects H5 pattern", () => {
      expect(detectHeadingPattern("##### Subsection")).toEqual({ level: 5, content: "Subsection" });
    });

    it("detects H6 pattern", () => {
      expect(detectHeadingPattern("###### Small heading")).toEqual({
        level: 6,
        content: "Small heading",
      });
    });

    it("returns null for hash without space", () => {
      expect(detectHeadingPattern("#Hello")).toBeNull();
    });

    it("returns null for just hash and space with no content", () => {
      expect(detectHeadingPattern("# ")).toBeNull();
    });

    it("returns null for hash with only whitespace after", () => {
      expect(detectHeadingPattern("#   ")).toBeNull();
    });

    it("returns null for too many hashes (7+)", () => {
      expect(detectHeadingPattern("####### Too many")).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(detectHeadingPattern("")).toBeNull();
    });

    it("returns null for plain text", () => {
      expect(detectHeadingPattern("Hello World")).toBeNull();
    });

    it("handles content with multiple spaces after hash", () => {
      // The regex \s+ consumes all whitespace, so extra spaces are not in content
      expect(detectHeadingPattern("#  Multiple spaces")).toEqual({
        level: 1,
        content: "Multiple spaces",
      });
    });

    it("handles content with special characters", () => {
      expect(detectHeadingPattern("## Hello! @#$%")).toEqual({ level: 2, content: "Hello! @#$%" });
    });

    it("handles content with numbers", () => {
      expect(detectHeadingPattern("### Chapter 1")).toEqual({ level: 3, content: "Chapter 1" });
    });

    it("returns null for hash in middle of line", () => {
      expect(detectHeadingPattern("Text # Hello")).toBeNull();
    });
  });

  describe("detectListPattern", () => {
    describe("unordered lists", () => {
      it("detects dash list item", () => {
        expect(detectListPattern("- item")).toEqual({ type: "unordered", content: "item" });
      });

      it("detects asterisk list item", () => {
        expect(detectListPattern("* item")).toEqual({ type: "unordered", content: "item" });
      });

      it("detects plus list item", () => {
        expect(detectListPattern("+ item")).toEqual({ type: "unordered", content: "item" });
      });

      it("returns null for dash without space", () => {
        expect(detectListPattern("-item")).toBeNull();
      });

      it("returns null for asterisk without space", () => {
        expect(detectListPattern("*item")).toBeNull();
      });

      it("returns null for plus without space", () => {
        expect(detectListPattern("+item")).toBeNull();
      });

      it("handles empty content after marker", () => {
        expect(detectListPattern("- ")).toEqual({ type: "unordered", content: "" });
      });

      it("handles content with special characters", () => {
        expect(detectListPattern("- Hello! @world")).toEqual({
          type: "unordered",
          content: "Hello! @world",
        });
      });

      it("handles multiple spaces after marker", () => {
        // The regex \s+ consumes all whitespace, so extra spaces are not in content
        expect(detectListPattern("-  two spaces")).toEqual({
          type: "unordered",
          content: "two spaces",
        });
      });
    });

    describe("ordered lists", () => {
      it("detects single digit ordered list", () => {
        expect(detectListPattern("1. item")).toEqual({ type: "ordered", content: "item" });
      });

      it("detects double digit ordered list", () => {
        expect(detectListPattern("23. item")).toEqual({ type: "ordered", content: "item" });
      });

      it("detects triple digit ordered list", () => {
        expect(detectListPattern("100. item")).toEqual({ type: "ordered", content: "item" });
      });

      it("returns null for number with dot but no space", () => {
        expect(detectListPattern("1.item")).toBeNull();
      });

      it("handles empty content after number", () => {
        expect(detectListPattern("1. ")).toEqual({ type: "ordered", content: "" });
      });

      it("handles zero as list number", () => {
        expect(detectListPattern("0. item")).toEqual({ type: "ordered", content: "item" });
      });

      it("handles large numbers", () => {
        expect(detectListPattern("99999. item")).toEqual({ type: "ordered", content: "item" });
      });
    });

    it("returns null for empty string", () => {
      expect(detectListPattern("")).toBeNull();
    });

    it("returns null for plain text", () => {
      expect(detectListPattern("Hello World")).toBeNull();
    });

    it("returns null for marker in middle of line", () => {
      expect(detectListPattern("Text - item")).toBeNull();
    });
  });

  describe("detectBlockquotePattern", () => {
    it("detects blockquote with content", () => {
      expect(detectBlockquotePattern("> quote")).toEqual({ content: "quote" });
    });

    it("detects empty blockquote", () => {
      expect(detectBlockquotePattern(">")).toEqual({ content: "" });
    });

    it("detects blockquote without space after marker", () => {
      // The regex `^>\s?(.*)$` should still match ">quote" since space is optional
      expect(detectBlockquotePattern(">quote")).toEqual({ content: "quote" });
    });

    it("detects blockquote with space but no content", () => {
      expect(detectBlockquotePattern("> ")).toEqual({ content: "" });
    });

    it("handles content with special characters", () => {
      expect(detectBlockquotePattern("> Hello! @world #tag")).toEqual({
        content: "Hello! @world #tag",
      });
    });

    it("handles multiple spaces after marker", () => {
      expect(detectBlockquotePattern(">  two spaces")).toEqual({ content: " two spaces" });
    });

    it("handles long quote content", () => {
      const longContent =
        "This is a very long quote that contains many words and characters to test the pattern detection.";
      expect(detectBlockquotePattern(`> ${longContent}`)).toEqual({ content: longContent });
    });

    it("returns null for empty string", () => {
      expect(detectBlockquotePattern("")).toBeNull();
    });

    it("returns null for plain text", () => {
      expect(detectBlockquotePattern("Hello World")).toBeNull();
    });

    it("returns null for marker in middle of line", () => {
      expect(detectBlockquotePattern("Text > quote")).toBeNull();
    });
  });

  describe("detectCodeFenceStart", () => {
    it("returns null for code fence without language (requires language identifier)", () => {
      // Implementation intentionally requires at least one character in language identifier
      // to avoid triggering on just "```" before user finishes typing the language
      expect(detectCodeFenceStart("```")).toBeNull();
    });

    it("detects code fence with javascript language", () => {
      expect(detectCodeFenceStart("```javascript")).toEqual({ language: "javascript" });
    });

    it("detects code fence with ts language", () => {
      expect(detectCodeFenceStart("```ts")).toEqual({ language: "ts" });
    });

    it("detects code fence with python language", () => {
      expect(detectCodeFenceStart("```python")).toEqual({ language: "python" });
    });

    it("detects code fence with vue language", () => {
      expect(detectCodeFenceStart("```vue")).toEqual({ language: "vue" });
    });

    it("returns null for code fence with trailing space", () => {
      expect(detectCodeFenceStart("``` ")).toBeNull();
    });

    it("returns null for code fence with space before language", () => {
      expect(detectCodeFenceStart("``` javascript")).toBeNull();
    });

    it("returns null for code fence with non-word characters in language", () => {
      // The regex requires word characters only (\w*)
      expect(detectCodeFenceStart("```java-script")).toBeNull();
    });

    it("returns null for only two backticks", () => {
      expect(detectCodeFenceStart("``")).toBeNull();
    });

    it("returns null for single backtick", () => {
      expect(detectCodeFenceStart("`")).toBeNull();
    });

    it("returns null for four backticks", () => {
      // The regex specifically matches exactly 3 backticks at start
      expect(detectCodeFenceStart("````")).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(detectCodeFenceStart("")).toBeNull();
    });

    it("returns null for plain text", () => {
      expect(detectCodeFenceStart("Hello World")).toBeNull();
    });

    it("returns null for backticks in middle of line", () => {
      expect(detectCodeFenceStart("Text ```javascript")).toBeNull();
    });

    it("handles uppercase language identifiers", () => {
      expect(detectCodeFenceStart("```JavaScript")).toEqual({ language: "JavaScript" });
    });

    it("handles language with numbers", () => {
      expect(detectCodeFenceStart("```php7")).toEqual({ language: "php7" });
    });

    it("handles language with underscores", () => {
      expect(detectCodeFenceStart("```c_plus_plus")).toEqual({ language: "c_plus_plus" });
    });
  });

  describe("isHorizontalRule", () => {
    describe("dashes", () => {
      it("detects three dashes", () => {
        expect(isHorizontalRule("---")).toBe(true);
      });

      it("detects four dashes", () => {
        expect(isHorizontalRule("----")).toBe(true);
      });

      it("detects dashes with spaces between", () => {
        expect(isHorizontalRule("- - -")).toBe(true);
      });

      it("detects many dashes", () => {
        expect(isHorizontalRule("----------")).toBe(true);
      });
    });

    describe("asterisks", () => {
      it("detects three asterisks", () => {
        expect(isHorizontalRule("***")).toBe(true);
      });

      it("detects four asterisks", () => {
        expect(isHorizontalRule("****")).toBe(true);
      });

      it("detects asterisks with spaces between", () => {
        expect(isHorizontalRule("* * *")).toBe(true);
      });

      it("detects many asterisks", () => {
        expect(isHorizontalRule("**********")).toBe(true);
      });
    });

    describe("underscores", () => {
      it("detects three underscores", () => {
        expect(isHorizontalRule("___")).toBe(true);
      });

      it("detects four underscores", () => {
        expect(isHorizontalRule("____")).toBe(true);
      });

      it("detects underscores with spaces between", () => {
        expect(isHorizontalRule("_ _ _")).toBe(true);
      });

      it("detects many underscores", () => {
        expect(isHorizontalRule("__________")).toBe(true);
      });
    });

    describe("edge cases", () => {
      it("returns false for two dashes", () => {
        expect(isHorizontalRule("--")).toBe(false);
      });

      it("returns false for two asterisks", () => {
        expect(isHorizontalRule("**")).toBe(false);
      });

      it("returns false for two underscores", () => {
        expect(isHorizontalRule("__")).toBe(false);
      });

      it("returns true for mixed characters (allowed by regex)", () => {
        // The regex ^([-*_]\s*){3,}$ allows mixed characters as long as each is -, *, or _
        expect(isHorizontalRule("-*_")).toBe(true);
      });

      it("returns false for dashes with text", () => {
        expect(isHorizontalRule("---text")).toBe(false);
      });

      it("returns false for empty string", () => {
        expect(isHorizontalRule("")).toBe(false);
      });

      it("returns false for plain text", () => {
        expect(isHorizontalRule("abc")).toBe(false);
      });

      it("handles leading whitespace", () => {
        expect(isHorizontalRule("  ---")).toBe(true);
      });

      it("handles trailing whitespace", () => {
        expect(isHorizontalRule("---  ")).toBe(true);
      });

      it("handles both leading and trailing whitespace", () => {
        expect(isHorizontalRule("  ---  ")).toBe(true);
      });

      it("returns false for single dash", () => {
        expect(isHorizontalRule("-")).toBe(false);
      });
    });
  });

  describe("detectLinePattern", () => {
    describe("heading patterns", () => {
      it("detects H1 as heading pattern", () => {
        expect(detectLinePattern("# Hello")).toEqual({ type: "heading", level: 1 });
      });

      it("detects H2 as heading pattern", () => {
        expect(detectLinePattern("## Title")).toEqual({ type: "heading", level: 2 });
      });

      it("detects H6 as heading pattern", () => {
        expect(detectLinePattern("###### Small")).toEqual({ type: "heading", level: 6 });
      });
    });

    describe("list patterns", () => {
      it("detects unordered list with dash", () => {
        expect(detectLinePattern("- item")).toEqual({ type: "unordered-list" });
      });

      it("detects unordered list with asterisk", () => {
        expect(detectLinePattern("* item")).toEqual({ type: "unordered-list" });
      });

      it("detects unordered list with plus", () => {
        expect(detectLinePattern("+ item")).toEqual({ type: "unordered-list" });
      });

      it("detects ordered list", () => {
        expect(detectLinePattern("1. item")).toEqual({ type: "ordered-list" });
      });

      it("detects ordered list with large number", () => {
        expect(detectLinePattern("99. item")).toEqual({ type: "ordered-list" });
      });
    });

    describe("blockquote patterns", () => {
      it("detects blockquote", () => {
        expect(detectLinePattern("> quote")).toEqual({ type: "blockquote" });
      });

      it("detects empty blockquote", () => {
        expect(detectLinePattern(">")).toEqual({ type: "blockquote" });
      });
    });

    describe("code block patterns", () => {
      it("returns null for code block without language (requires language identifier)", () => {
        // Implementation intentionally requires language identifier
        expect(detectLinePattern("```")).toBeNull();
      });

      it("detects code block with language", () => {
        expect(detectLinePattern("```javascript")).toEqual({
          type: "code-block",
          language: "javascript",
        });
      });
    });

    describe("horizontal rule patterns", () => {
      it("detects hr with dashes", () => {
        expect(detectLinePattern("---")).toEqual({ type: "hr" });
      });

      it("detects hr with asterisks", () => {
        expect(detectLinePattern("***")).toEqual({ type: "hr" });
      });

      it("detects hr with underscores", () => {
        expect(detectLinePattern("___")).toEqual({ type: "hr" });
      });

      it("detects hr with spaces between dashes", () => {
        expect(detectLinePattern("- - -")).toEqual({ type: "hr" });
      });
    });

    describe("no pattern detected", () => {
      it("returns null for empty string", () => {
        expect(detectLinePattern("")).toBeNull();
      });

      it("returns null for plain text", () => {
        expect(detectLinePattern("Hello World")).toBeNull();
      });

      it("returns null for text starting with number but no dot", () => {
        expect(detectLinePattern("123 items")).toBeNull();
      });

      it("returns null for hash without space", () => {
        expect(detectLinePattern("#nospace")).toBeNull();
      });

      it("returns null for incomplete code fence", () => {
        expect(detectLinePattern("``")).toBeNull();
      });
    });

    describe("pattern priority", () => {
      it("detects hr before unordered list for dashes", () => {
        // "---" should be hr, not list
        expect(detectLinePattern("---")).toEqual({ type: "hr" });
      });

      it("detects hr before unordered list for asterisks", () => {
        // "***" should be hr, not list
        expect(detectLinePattern("***")).toEqual({ type: "hr" });
      });

      it("detects list when dash has content", () => {
        // "- item" should be list, not hr
        expect(detectLinePattern("- item")).toEqual({ type: "unordered-list" });
      });
    });
  });
});
