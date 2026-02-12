import { describe, expect, it } from "vitest";
import { getAvailableFormats } from "../formatUtils";

describe("formatUtils", () => {
  describe("getAvailableFormats", () => {
    it("json returns yaml and json", () => {
      expect(getAvailableFormats("json")).toEqual(["yaml", "json"]);
    });

    it("yaml returns yaml and json", () => {
      expect(getAvailableFormats("yaml")).toEqual(["yaml", "json"]);
    });

    it("text returns text and markdown", () => {
      expect(getAvailableFormats("text")).toEqual(["text", "markdown"]);
    });

    it("markdown returns text and markdown", () => {
      expect(getAvailableFormats("markdown")).toEqual(["text", "markdown"]);
    });

    it("css returns only css", () => {
      expect(getAvailableFormats("css")).toEqual(["css"]);
    });

    it("javascript returns only javascript", () => {
      expect(getAvailableFormats("javascript")).toEqual(["javascript"]);
    });

    it("html returns only html", () => {
      expect(getAvailableFormats("html")).toEqual(["html"]);
    });

    it("vue returns only vue", () => {
      expect(getAvailableFormats("vue")).toEqual(["vue"]);
    });
  });
});
