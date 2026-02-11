import { describe, it, expect } from "vitest";
import { highlightTypeScript } from "../highlightTypeScript";

describe("highlightTypeScript", () => {
  describe("empty/falsy input", () => {
    it("returns empty string for empty string", () => {
      expect(highlightTypeScript("")).toBe("");
    });
  });

  describe("TypeScript-specific keywords", () => {
    it("highlights type keyword", () => {
      const result = highlightTypeScript("type");
      expect(result).toBe('<span class="syntax-keyword">type</span>');
    });

    it("highlights interface keyword", () => {
      const result = highlightTypeScript("interface");
      expect(result).toBe('<span class="syntax-keyword">interface</span>');
    });

    it("highlights enum keyword", () => {
      const result = highlightTypeScript("enum");
      expect(result).toBe('<span class="syntax-keyword">enum</span>');
    });

    it("highlights namespace keyword", () => {
      const result = highlightTypeScript("namespace");
      expect(result).toBe('<span class="syntax-keyword">namespace</span>');
    });

    it("highlights declare keyword", () => {
      const result = highlightTypeScript("declare");
      expect(result).toBe('<span class="syntax-keyword">declare</span>');
    });

    it("highlights abstract keyword", () => {
      const result = highlightTypeScript("abstract");
      expect(result).toBe('<span class="syntax-keyword">abstract</span>');
    });

    it("highlights implements keyword", () => {
      const result = highlightTypeScript("implements");
      expect(result).toBe('<span class="syntax-keyword">implements</span>');
    });

    it("highlights readonly keyword", () => {
      const result = highlightTypeScript("readonly");
      expect(result).toBe('<span class="syntax-keyword">readonly</span>');
    });

    it("highlights keyof keyword", () => {
      const result = highlightTypeScript("keyof");
      expect(result).toBe('<span class="syntax-keyword">keyof</span>');
    });

    it("highlights infer keyword", () => {
      const result = highlightTypeScript("infer");
      expect(result).toBe('<span class="syntax-keyword">infer</span>');
    });

    it("highlights is keyword", () => {
      const result = highlightTypeScript("is");
      expect(result).toBe('<span class="syntax-keyword">is</span>');
    });

    it("highlights asserts keyword", () => {
      const result = highlightTypeScript("asserts");
      expect(result).toBe('<span class="syntax-keyword">asserts</span>');
    });

    it("highlights override keyword", () => {
      const result = highlightTypeScript("override");
      expect(result).toBe('<span class="syntax-keyword">override</span>');
    });

    it("highlights satisfies keyword", () => {
      const result = highlightTypeScript("satisfies");
      expect(result).toBe('<span class="syntax-keyword">satisfies</span>');
    });

    it("highlights access modifiers", () => {
      for (const kw of ["public", "private", "protected"]) {
        const result = highlightTypeScript(kw);
        expect(result).toBe(`<span class="syntax-keyword">${kw}</span>`);
      }
    });

    it("highlights never keyword", () => {
      const result = highlightTypeScript("never");
      expect(result).toBe('<span class="syntax-keyword">never</span>');
    });

    it("highlights unknown keyword", () => {
      const result = highlightTypeScript("unknown");
      expect(result).toBe('<span class="syntax-keyword">unknown</span>');
    });

    it("highlights any keyword", () => {
      const result = highlightTypeScript("any");
      expect(result).toBe('<span class="syntax-keyword">any</span>');
    });
  });

  describe("inherited JavaScript features", () => {
    it("highlights JS keywords", () => {
      const result = highlightTypeScript("const");
      expect(result).toBe('<span class="syntax-keyword">const</span>');
    });

    it("highlights JS builtins", () => {
      const result = highlightTypeScript("true");
      expect(result).toBe('<span class="syntax-boolean">true</span>');
    });

    it("highlights strings", () => {
      const result = highlightTypeScript('"hello"');
      expect(result).toBe('<span class="syntax-string">&quot;hello&quot;</span>');
    });

    it("highlights numbers", () => {
      const result = highlightTypeScript("42");
      expect(result).toBe('<span class="syntax-number">42</span>');
    });

    it("highlights comments", () => {
      const result = highlightTypeScript("// comment");
      expect(result).toBe('<span class="syntax-comment">// comment</span>');
    });

    it("handles template literals", () => {
      const result = highlightTypeScript("`hello`");
      expect(result).toBe('<span class="syntax-template">`hello`</span>');
    });
  });

  describe("complex TypeScript expressions", () => {
    it("highlights a type alias declaration", () => {
      const result = highlightTypeScript("type Foo = string");
      expect(result).toContain('<span class="syntax-keyword">type</span>');
      expect(result).toContain("Foo");
    });

    it("highlights an interface declaration", () => {
      const result = highlightTypeScript("interface Bar { name: string }");
      expect(result).toContain('<span class="syntax-keyword">interface</span>');
      expect(result).toContain("Bar");
    });

    it("highlights enum declaration", () => {
      const result = highlightTypeScript("enum Direction { Up, Down }");
      expect(result).toContain('<span class="syntax-keyword">enum</span>');
      expect(result).toContain("Direction");
    });

    it("highlights mixed JS and TS keywords", () => {
      const result = highlightTypeScript("export interface Foo extends Bar");
      expect(result).toContain('<span class="syntax-keyword">export</span>');
      expect(result).toContain('<span class="syntax-keyword">interface</span>');
      expect(result).toContain('<span class="syntax-keyword">extends</span>');
    });

    it("highlights abstract class declaration", () => {
      const result = highlightTypeScript("abstract class Base");
      expect(result).toContain('<span class="syntax-keyword">abstract</span>');
      expect(result).toContain('<span class="syntax-keyword">class</span>');
    });

    it("highlights readonly property", () => {
      const result = highlightTypeScript("readonly name: string");
      expect(result).toContain('<span class="syntax-keyword">readonly</span>');
    });

    it("highlights keyof typeof expression", () => {
      const result = highlightTypeScript("keyof typeof obj");
      expect(result).toContain('<span class="syntax-keyword">keyof</span>');
      expect(result).toContain('<span class="syntax-keyword">typeof</span>');
    });

    it("highlights satisfies operator", () => {
      const result = highlightTypeScript("const x = {} satisfies Record");
      expect(result).toContain('<span class="syntax-keyword">const</span>');
      expect(result).toContain('<span class="syntax-keyword">satisfies</span>');
    });
  });

  describe("edge cases", () => {
    it("does not highlight TS keyword substrings in identifiers", () => {
      const result = highlightTypeScript("interfaceValue");
      expect(result).toBe("interfaceValue");
    });

    it("handles regular identifiers without TS keyword match", () => {
      const result = highlightTypeScript("myVar");
      expect(result).toBe("myVar");
    });
  });
});
