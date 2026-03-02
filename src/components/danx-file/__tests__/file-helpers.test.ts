import { describe, it, expect } from "vitest";
import {
  isInProgress,
  hasChildren,
  formatFileSize,
  sortByPageNumber,
  fileDisplayNumber,
} from "../file-helpers";
import { makeFile } from "./test-helpers";

describe("isInProgress", () => {
  it("returns true when progress is non-null and < 100", () => {
    expect(isInProgress(makeFile({ progress: 0 }))).toBe(true);
    expect(isInProgress(makeFile({ progress: 50 }))).toBe(true);
    expect(isInProgress(makeFile({ progress: 99 }))).toBe(true);
  });

  it("returns false when progress is 100", () => {
    expect(isInProgress(makeFile({ progress: 100 }))).toBe(false);
  });

  it("returns false when progress is null or undefined", () => {
    expect(isInProgress(makeFile({ progress: null }))).toBe(false);
    expect(isInProgress(makeFile())).toBe(false);
  });
});

describe("hasChildren", () => {
  it("returns true when file has non-empty children array", () => {
    const child = makeFile({ id: "2", name: "child.jpg" });
    expect(hasChildren(makeFile({ children: [child] }))).toBe(true);
  });

  it("returns false when children is empty", () => {
    expect(hasChildren(makeFile({ children: [] }))).toBe(false);
  });

  it("returns false when children is undefined", () => {
    expect(hasChildren(makeFile())).toBe(false);
  });
});

describe("formatFileSize", () => {
  it("formats zero bytes", () => {
    expect(formatFileSize(0)).toBe("0 B");
  });

  it("formats bytes", () => {
    expect(formatFileSize(500)).toBe("500 B");
    expect(formatFileSize(1023)).toBe("1023 B");
  });

  it("formats kilobytes", () => {
    expect(formatFileSize(1024)).toBe("1.0 KiB");
    expect(formatFileSize(1536)).toBe("1.5 KiB");
  });

  it("formats megabytes", () => {
    expect(formatFileSize(1024 * 1024)).toBe("1.0 MiB");
    expect(formatFileSize(2.5 * 1024 * 1024)).toBe("2.5 MiB");
  });

  it("formats gigabytes", () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe("1.0 GiB");
  });
});

describe("sortByPageNumber", () => {
  it("sorts files with page_number ascending", () => {
    const files = [
      makeFile("a", { page_number: 3 }),
      makeFile("b", { page_number: 1 }),
      makeFile("c", { page_number: 2 }),
    ];
    const sorted = sortByPageNumber(files);
    expect(sorted.map((f) => f.id)).toEqual(["b", "c", "a"]);
  });

  it("places files without page_number after those with", () => {
    const files = [
      makeFile("a"),
      makeFile("b", { page_number: 2 }),
      makeFile("c", { page_number: 1 }),
    ];
    const sorted = sortByPageNumber(files);
    expect(sorted.map((f) => f.id)).toEqual(["c", "b", "a"]);
  });

  it("preserves original order for files without page_number", () => {
    const files = [makeFile("a"), makeFile("b"), makeFile("c")];
    const sorted = sortByPageNumber(files);
    expect(sorted.map((f) => f.id)).toEqual(["a", "b", "c"]);
  });

  it("returns empty array for empty input", () => {
    expect(sortByPageNumber([])).toEqual([]);
  });
});

describe("fileDisplayNumber", () => {
  it("returns page_number when present", () => {
    expect(fileDisplayNumber(makeFile({ page_number: 5 }), 0)).toBe(5);
  });

  it("returns index + 1 when page_number is absent", () => {
    expect(fileDisplayNumber(makeFile(), 3)).toBe(4);
  });

  it("returns index + 1 when page_number is undefined", () => {
    expect(fileDisplayNumber(makeFile({ page_number: undefined }), 7)).toBe(8);
  });
});
