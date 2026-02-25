import { describe, it, expect } from "vitest";
import {
  formatMeta,
  metaCount,
  formatExif,
  exifCount,
  hasAnyInfo,
  FILTERED_KEYS,
} from "../file-metadata-helpers";
import { makeFile } from "../../danx-file/__tests__/test-helpers";

describe("file-metadata-helpers", () => {
  describe("FILTERED_KEYS", () => {
    it("contains expected internal keys", () => {
      expect(FILTERED_KEYS).toContain("children");
    });
  });

  describe("formatMeta", () => {
    it("returns empty object when no meta", () => {
      expect(formatMeta(makeFile())).toEqual({});
    });

    it("returns meta entries", () => {
      const meta = { width: 1920, height: 1080, format: "jpeg" };
      expect(formatMeta(makeFile({ meta }))).toEqual(meta);
    });

    it("filters out children key", () => {
      const meta = { width: 1920, children: [1, 2, 3] };
      expect(formatMeta(makeFile({ meta }))).toEqual({ width: 1920 });
    });
  });

  describe("metaCount", () => {
    it("returns 0 for file without meta", () => {
      expect(metaCount(makeFile())).toBe(0);
    });

    it("returns count of displayable entries", () => {
      const meta = { width: 1920, height: 1080, children: [] };
      expect(metaCount(makeFile({ meta }))).toBe(2);
    });
  });

  describe("formatExif", () => {
    it("returns empty object when no exif", () => {
      expect(formatExif(makeFile())).toEqual({});
    });

    it("returns exif entries as-is", () => {
      const exif = { camera: "Canon", iso: 400, aperture: "f/5.6" };
      expect(formatExif(makeFile({ exif }))).toEqual(exif);
    });
  });

  describe("exifCount", () => {
    it("returns 0 for file without exif", () => {
      expect(exifCount(makeFile())).toBe(0);
    });

    it("returns count of exif entries", () => {
      const exif = { camera: "Canon", iso: 400 };
      expect(exifCount(makeFile({ exif }))).toBe(2);
    });
  });

  describe("hasAnyInfo", () => {
    it("returns false when neither meta nor exif", () => {
      expect(hasAnyInfo(makeFile())).toBe(false);
    });

    it("returns true when only meta has entries", () => {
      expect(hasAnyInfo(makeFile({ meta: { width: 800 } }))).toBe(true);
    });

    it("returns true when only exif has entries", () => {
      expect(hasAnyInfo(makeFile({ exif: { camera: "Canon" } }))).toBe(true);
    });

    it("returns true when both meta and exif have entries", () => {
      expect(hasAnyInfo(makeFile({ meta: { width: 800 }, exif: { camera: "Canon" } }))).toBe(true);
    });

    it("returns false when meta only has filtered keys", () => {
      expect(hasAnyInfo(makeFile({ meta: { children: [] } }))).toBe(false);
    });

    it("returns true when meta has only filtered keys but exif has entries", () => {
      expect(hasAnyInfo(makeFile({ meta: { children: [] }, exif: { camera: "Canon" } }))).toBe(
        true
      );
    });
  });
});
