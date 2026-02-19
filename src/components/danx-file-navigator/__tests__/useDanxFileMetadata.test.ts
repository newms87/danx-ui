import { describe, it, expect, beforeEach, vi } from "vitest";
import { useDanxFileMetadata } from "../useDanxFileMetadata";
import type { PreviewFile } from "../../danx-file/types";

function makeFile(meta?: Record<string, unknown>): PreviewFile {
  return {
    id: "1",
    name: "test.jpg",
    size: 1024,
    type: "image/jpeg",
    url: "https://example.com/test.jpg",
    meta,
  };
}

describe("useDanxFileMetadata", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("mode", () => {
    it("defaults to overlay", () => {
      const { mode } = useDanxFileMetadata();
      expect(mode.value).toBe("overlay");
    });

    it("reads stored mode from localStorage", () => {
      localStorage.setItem("danx-file-metadata-mode", "docked");
      const { mode } = useDanxFileMetadata();
      expect(mode.value).toBe("docked");
    });

    it("ignores invalid stored values", () => {
      localStorage.setItem("danx-file-metadata-mode", "invalid");
      const { mode } = useDanxFileMetadata();
      expect(mode.value).toBe("overlay");
    });
  });

  describe("setMode", () => {
    it("updates mode ref", () => {
      const { mode, setMode } = useDanxFileMetadata();
      setMode("docked");
      expect(mode.value).toBe("docked");
    });

    it("persists to localStorage", () => {
      const { setMode } = useDanxFileMetadata();
      setMode("docked");
      expect(localStorage.getItem("danx-file-metadata-mode")).toBe("docked");
    });
  });

  describe("formatMeta", () => {
    it("returns empty object when no meta", () => {
      const { formatMeta } = useDanxFileMetadata();
      expect(formatMeta(makeFile())).toEqual({});
    });

    it("returns meta entries", () => {
      const { formatMeta } = useDanxFileMetadata();
      const meta = { width: 1920, height: 1080, format: "jpeg" };
      expect(formatMeta(makeFile(meta))).toEqual(meta);
    });

    it("filters out children key", () => {
      const { formatMeta } = useDanxFileMetadata();
      const meta = { width: 1920, children: [1, 2, 3] };
      expect(formatMeta(makeFile(meta))).toEqual({ width: 1920 });
    });
  });

  describe("metaCount", () => {
    it("returns 0 for file without meta", () => {
      const { metaCount } = useDanxFileMetadata();
      expect(metaCount(makeFile())).toBe(0);
    });

    it("returns count of displayable entries", () => {
      const { metaCount } = useDanxFileMetadata();
      const meta = { width: 1920, height: 1080, children: [] };
      expect(metaCount(makeFile(meta))).toBe(2);
    });
  });

  describe("localStorage error handling", () => {
    it("defaults to overlay when localStorage.getItem throws", () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("localStorage unavailable");
      });
      const { mode } = useDanxFileMetadata();
      expect(mode.value).toBe("overlay");
      vi.restoreAllMocks();
    });

    it("does not throw when localStorage.setItem throws", () => {
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("localStorage unavailable");
      });
      const { setMode } = useDanxFileMetadata();
      expect(() => setMode("docked")).not.toThrow();
      vi.restoreAllMocks();
    });
  });
});
