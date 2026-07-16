import { describe, it, expect } from "vitest";
import { computeLineDiff, computeSplitDiff } from "../diffUtils";

describe("computeLineDiff", () => {
  it("marks every line unchanged when both values are identical", () => {
    const result = computeLineDiff("a\nb\nc", "a\nb\nc");
    expect(result).toHaveLength(3);
    expect(result.every((line) => line.type === "unchanged")).toBe(true);
    expect(result.map((line) => line.content)).toEqual(["a", "b", "c"]);
    expect(result.map((line) => line.oldLineNumber)).toEqual([1, 2, 3]);
    expect(result.map((line) => line.newLineNumber)).toEqual([1, 2, 3]);
  });

  it("marks every line added when old value is empty", () => {
    const result = computeLineDiff("", "a\nb");
    expect(result).toEqual([
      { type: "added", content: "a", oldLineNumber: null, newLineNumber: 1 },
      { type: "added", content: "b", oldLineNumber: null, newLineNumber: 2 },
    ]);
  });

  it("marks every line removed when new value is empty", () => {
    const result = computeLineDiff("a\nb", "");
    expect(result).toEqual([
      { type: "removed", content: "a", oldLineNumber: 1, newLineNumber: null },
      { type: "removed", content: "b", oldLineNumber: 2, newLineNumber: null },
    ]);
  });

  it("returns an empty diff when both values are empty", () => {
    expect(computeLineDiff("", "")).toEqual([]);
  });

  it("detects a single changed line as a removed+added pair", () => {
    const result = computeLineDiff("a\nb\nc", "a\nx\nc");
    expect(result.map((line) => [line.type, line.content])).toEqual([
      ["unchanged", "a"],
      ["removed", "b"],
      ["added", "x"],
      ["unchanged", "c"],
    ]);
  });

  it("detects an inserted line in the middle", () => {
    const result = computeLineDiff("a\nc", "a\nb\nc");
    expect(result.map((line) => [line.type, line.content])).toEqual([
      ["unchanged", "a"],
      ["added", "b"],
      ["unchanged", "c"],
    ]);
  });

  it("detects a deleted line in the middle", () => {
    const result = computeLineDiff("a\nb\nc", "a\nc");
    expect(result.map((line) => [line.type, line.content])).toEqual([
      ["unchanged", "a"],
      ["removed", "b"],
      ["unchanged", "c"],
    ]);
  });
});

describe("computeSplitDiff", () => {
  it("pairs unchanged lines with themselves on both sides", () => {
    const rows = computeSplitDiff("a\nb", "a\nb");
    expect(rows).toHaveLength(2);
    expect(rows[0]!.left).toBe(rows[0]!.right);
    expect(rows[0]!.left?.content).toBe("a");
  });

  it("aligns a changed line as a left(removed)/right(added) row", () => {
    const rows = computeSplitDiff("a\nb\nc", "a\nx\nc");
    expect(rows).toHaveLength(3);
    expect(rows[1]!.left).toMatchObject({ type: "removed", content: "b" });
    expect(rows[1]!.right).toMatchObject({ type: "added", content: "x" });
  });

  it("fills the shorter side with null when removed/added run lengths differ", () => {
    const rows = computeSplitDiff("a\nx\ny\nc", "a\nx\nc");
    expect(rows).toHaveLength(4);
    expect(rows[2]!.left).toMatchObject({ type: "removed", content: "y" });
    expect(rows[2]!.right).toBeNull();
  });

  it("fills the left side with null for a pure insertion", () => {
    const rows = computeSplitDiff("a\nc", "a\nb\nc");
    expect(rows).toHaveLength(3);
    expect(rows[1]!.left).toBeNull();
    expect(rows[1]!.right).toMatchObject({ type: "added", content: "b" });
  });

  it("returns an empty array when both values are empty", () => {
    expect(computeSplitDiff("", "")).toEqual([]);
  });
});
