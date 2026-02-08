import { describe, expect, it } from "vitest";
import { normalizeLanguage } from "../normalizeLanguage";

describe("normalizeLanguage", () => {
  it("maps js to javascript", () => {
    expect(normalizeLanguage("js")).toBe("javascript");
    expect(normalizeLanguage("JS")).toBe("javascript");
  });

  it("maps ts to typescript", () => {
    expect(normalizeLanguage("ts")).toBe("typescript");
    expect(normalizeLanguage("TS")).toBe("typescript");
  });

  it("maps py to python", () => {
    expect(normalizeLanguage("py")).toBe("python");
    expect(normalizeLanguage("PY")).toBe("python");
  });

  it("maps yml to yaml", () => {
    expect(normalizeLanguage("yml")).toBe("yaml");
    expect(normalizeLanguage("YML")).toBe("yaml");
  });

  it("maps sh to bash", () => {
    expect(normalizeLanguage("sh")).toBe("bash");
    expect(normalizeLanguage("SH")).toBe("bash");
  });

  it("maps shell to bash", () => {
    expect(normalizeLanguage("shell")).toBe("bash");
    expect(normalizeLanguage("Shell")).toBe("bash");
  });

  it("returns text for empty or undefined input", () => {
    expect(normalizeLanguage()).toBe("text");
    expect(normalizeLanguage("")).toBe("text");
    expect(normalizeLanguage(undefined)).toBe("text");
  });

  it("passes through unknown languages as lowercase", () => {
    expect(normalizeLanguage("Rust")).toBe("rust");
    expect(normalizeLanguage("GO")).toBe("go");
    expect(normalizeLanguage("kotlin")).toBe("kotlin");
  });
});
