import { describe, it, expect } from "vitest";
import { computePageWindow } from "../usePageWindow";

describe("computePageWindow", () => {
  it("returns an empty window for 0 pages", () => {
    expect(computePageWindow(1, 0, 7)).toEqual([]);
  });

  it("returns an empty window for negative totalPages", () => {
    expect(computePageWindow(1, -3, 7)).toEqual([]);
  });

  it("returns a single page for 1 total page", () => {
    expect(computePageWindow(1, 1, 7)).toEqual([1]);
  });

  it("shows every page with no ellipsis when totalPages <= maxVisiblePages", () => {
    expect(computePageWindow(3, 5, 7)).toEqual([1, 2, 3, 4, 5]);
  });

  it("shows every page with no ellipsis when totalPages === maxVisiblePages exactly", () => {
    expect(computePageWindow(4, 7, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("centers the window around the current page with both ellipses for a large page count", () => {
    expect(computePageWindow(10, 20, 7)).toEqual([1, "ellipsis", 8, 9, 10, 11, 12, "ellipsis", 20]);
  });

  it("shows only the right ellipsis when current page is near the start", () => {
    expect(computePageWindow(2, 20, 7)).toEqual([1, 2, 3, 4, 5, 6, "ellipsis", 20]);
  });

  it("shows only the right ellipsis when current page is 1", () => {
    expect(computePageWindow(1, 20, 7)).toEqual([1, 2, 3, 4, 5, 6, "ellipsis", 20]);
  });

  it("shows only the left ellipsis when current page is near the end", () => {
    expect(computePageWindow(19, 20, 7)).toEqual([1, "ellipsis", 15, 16, 17, 18, 19, 20]);
  });

  it("shows only the left ellipsis when current page is the last page", () => {
    expect(computePageWindow(20, 20, 7)).toEqual([1, "ellipsis", 15, 16, 17, 18, 19, 20]);
  });

  it("handles a huge page count", () => {
    const result = computePageWindow(5000, 10000, 7);
    expect(result).toEqual([1, "ellipsis", 4998, 4999, 5000, 5001, 5002, "ellipsis", 10000]);
  });

  it("handles maxVisiblePages smaller than 3 by clamping the side width to 1", () => {
    expect(computePageWindow(5, 10, 2)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
  });

  it("treats a maxVisiblePages of 0 the same as 1", () => {
    expect(computePageWindow(5, 10, 0)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
  });

  it("has no left gap (no ellipsis) when the window start lands on page 2", () => {
    // start computed to exactly 2 should skip the left ellipsis
    expect(computePageWindow(3, 10, 5)).toEqual([1, 2, 3, 4, "ellipsis", 10]);
  });

  it("has no right gap (no ellipsis) when the window end lands on totalPages - 1", () => {
    expect(computePageWindow(8, 10, 5)).toEqual([1, "ellipsis", 7, 8, 9, 10]);
  });
});
