import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getPreferredStructuredDataFormat,
  setPreferredStructuredDataFormat,
  isStructuredDataFormat,
} from "../useStructuredDataPreference";

const STORAGE_KEY = "dx-structured-data-format";

describe("useStructuredDataPreference", () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  describe("getPreferredStructuredDataFormat", () => {
    it("returns null when no preference is set", () => {
      expect(getPreferredStructuredDataFormat()).toBeNull();
    });

    it("returns json when preference is json", () => {
      localStorage.setItem(STORAGE_KEY, "json");
      expect(getPreferredStructuredDataFormat()).toBe("json");
    });

    it("returns yaml when preference is yaml", () => {
      localStorage.setItem(STORAGE_KEY, "yaml");
      expect(getPreferredStructuredDataFormat()).toBe("yaml");
    });

    it("returns null for invalid stored values", () => {
      localStorage.setItem(STORAGE_KEY, "xml");
      expect(getPreferredStructuredDataFormat()).toBeNull();
    });
  });

  describe("setPreferredStructuredDataFormat", () => {
    it("stores json preference", () => {
      setPreferredStructuredDataFormat("json");
      expect(localStorage.getItem(STORAGE_KEY)).toBe("json");
    });

    it("stores yaml preference", () => {
      setPreferredStructuredDataFormat("yaml");
      expect(localStorage.getItem(STORAGE_KEY)).toBe("yaml");
    });

    it("overwrites previous preference", () => {
      setPreferredStructuredDataFormat("json");
      setPreferredStructuredDataFormat("yaml");
      expect(localStorage.getItem(STORAGE_KEY)).toBe("yaml");
    });
  });

  describe("round-trip", () => {
    it("get returns what set stored", () => {
      setPreferredStructuredDataFormat("json");
      expect(getPreferredStructuredDataFormat()).toBe("json");

      setPreferredStructuredDataFormat("yaml");
      expect(getPreferredStructuredDataFormat()).toBe("yaml");
    });
  });

  describe("localStorage error handling", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("get returns null when localStorage.getItem throws", () => {
      vi.spyOn(localStorage, "getItem").mockImplementation(() => {
        throw new DOMException("SecurityError");
      });
      expect(getPreferredStructuredDataFormat()).toBeNull();
    });

    it("set does not throw when localStorage.setItem throws", () => {
      vi.spyOn(localStorage, "setItem").mockImplementation(() => {
        throw new DOMException("QuotaExceededError");
      });
      expect(() => setPreferredStructuredDataFormat("json")).not.toThrow();
    });
  });

  describe("isStructuredDataFormat", () => {
    it("returns true for json", () => {
      expect(isStructuredDataFormat("json")).toBe(true);
    });

    it("returns true for yaml", () => {
      expect(isStructuredDataFormat("yaml")).toBe(true);
    });

    it("returns false for text", () => {
      expect(isStructuredDataFormat("text")).toBe(false);
    });

    it("returns false for empty string", () => {
      expect(isStructuredDataFormat("")).toBe(false);
    });

    it("returns false for arbitrary string", () => {
      expect(isStructuredDataFormat("javascript")).toBe(false);
    });
  });
});
