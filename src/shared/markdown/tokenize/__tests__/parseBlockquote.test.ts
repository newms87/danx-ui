import { describe, it, expect } from "vitest";
import { parseBlockquote } from "../parseBlockquote";

describe("parseBlockquote", () => {
  it("parses a single blockquote line", () => {
    const lines = ["> Hello world"];
    expect(parseBlockquote(lines, 0)).toEqual({
      token: {
        type: "blockquote",
        content: "Hello world",
      },
      endIndex: 1,
    });
  });

  it("strips > and optional space from content", () => {
    const lines = [">No space"];
    expect(parseBlockquote(lines, 0)).toEqual({
      token: {
        type: "blockquote",
        content: "No space",
      },
      endIndex: 1,
    });
  });

  it("strips > with space from content", () => {
    const lines = ["> With space"];
    expect(parseBlockquote(lines, 0)).toEqual({
      token: {
        type: "blockquote",
        content: "With space",
      },
      endIndex: 1,
    });
  });

  it("collects multiple consecutive > lines", () => {
    const lines = ["> line 1", "> line 2", "> line 3"];
    expect(parseBlockquote(lines, 0)).toEqual({
      token: {
        type: "blockquote",
        content: "line 1\nline 2\nline 3",
      },
      endIndex: 3,
    });
  });

  it("stops at non-> line", () => {
    const lines = ["> quote line", "not a quote", "> another quote"];
    expect(parseBlockquote(lines, 0)).toEqual({
      token: {
        type: "blockquote",
        content: "quote line",
      },
      endIndex: 1,
    });
  });

  it("returns null for non-blockquote lines", () => {
    const lines = ["Just plain text"];
    expect(parseBlockquote(lines, 0)).toBeNull();
  });

  it("returns null for empty lines", () => {
    const lines = [""];
    expect(parseBlockquote(lines, 0)).toBeNull();
  });

  it("handles empty blockquote marker", () => {
    const lines = [">"];
    expect(parseBlockquote(lines, 0)).toEqual({
      token: {
        type: "blockquote",
        content: "",
      },
      endIndex: 1,
    });
  });

  it("starts parsing from given index", () => {
    const lines = ["text", "> quote here", "> more quote"];
    expect(parseBlockquote(lines, 1)).toEqual({
      token: {
        type: "blockquote",
        content: "quote here\nmore quote",
      },
      endIndex: 3,
    });
  });

  it("handles blockquote with special characters", () => {
    const lines = ["> Hello! @#$% **bold** `code`"];
    expect(parseBlockquote(lines, 0)).toEqual({
      token: {
        type: "blockquote",
        content: "Hello! @#$% **bold** `code`",
      },
      endIndex: 1,
    });
  });

  it("stops at empty line between blockquotes", () => {
    const lines = ["> first", "", "> second"];
    expect(parseBlockquote(lines, 0)).toEqual({
      token: {
        type: "blockquote",
        content: "first",
      },
      endIndex: 1,
    });
  });

  it("handles leading whitespace on blockquote lines (trimmed before check)", () => {
    const lines = ["  > indented quote"];
    expect(parseBlockquote(lines, 0)).toEqual({
      token: {
        type: "blockquote",
        content: "indented quote",
      },
      endIndex: 1,
    });
  });
});
