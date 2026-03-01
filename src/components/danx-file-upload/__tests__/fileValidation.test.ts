import { describe, it, expect } from "vitest";
import { isAcceptedType } from "../fileValidation";

function createFile(name: string, type: string): File {
  return new File([""], name, { type });
}

describe("isAcceptedType", () => {
  it("returns true when accept is undefined", () => {
    expect(isAcceptedType(createFile("test.jpg", "image/jpeg"), undefined)).toBe(true);
  });

  it("returns true when accept is empty string", () => {
    expect(isAcceptedType(createFile("test.jpg", "image/jpeg"), "")).toBe(true);
  });

  it("matches wildcard MIME type", () => {
    expect(isAcceptedType(createFile("photo.png", "image/png"), "image/*")).toBe(true);
  });

  it("rejects non-matching wildcard MIME type", () => {
    expect(isAcceptedType(createFile("doc.pdf", "application/pdf"), "image/*")).toBe(false);
  });

  it("matches exact MIME type", () => {
    expect(isAcceptedType(createFile("doc.pdf", "application/pdf"), "application/pdf")).toBe(true);
  });

  it("rejects non-matching exact MIME type", () => {
    expect(isAcceptedType(createFile("photo.png", "image/png"), "application/pdf")).toBe(false);
  });

  it("matches file extension", () => {
    expect(isAcceptedType(createFile("doc.pdf", "application/pdf"), ".pdf")).toBe(true);
  });

  it("rejects non-matching file extension", () => {
    expect(isAcceptedType(createFile("photo.png", "image/png"), ".pdf")).toBe(false);
  });

  it("matches extension case-insensitively", () => {
    expect(isAcceptedType(createFile("DOC.PDF", "application/pdf"), ".pdf")).toBe(true);
  });

  it("supports multiple accept patterns", () => {
    const accept = "image/*,.pdf,application/json";
    expect(isAcceptedType(createFile("photo.jpg", "image/jpeg"), accept)).toBe(true);
    expect(isAcceptedType(createFile("doc.pdf", "application/pdf"), accept)).toBe(true);
    expect(isAcceptedType(createFile("data.json", "application/json"), accept)).toBe(true);
    expect(isAcceptedType(createFile("video.mp4", "video/mp4"), accept)).toBe(false);
  });

  it("handles whitespace in accept string", () => {
    expect(isAcceptedType(createFile("photo.png", "image/png"), " image/* , .pdf ")).toBe(true);
  });
});
