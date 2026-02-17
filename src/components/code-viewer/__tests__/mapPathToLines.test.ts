import { describe, it, expect } from "vitest";
import { mapAnnotationsToLines } from "../mapPathToLines";
import type { CodeAnnotation } from "../types";

/**
 * Helper — parsePath is not exported, but we test it indirectly through
 * mapAnnotationsToLines by verifying that various path formats resolve
 * to the correct lines.
 */

function ann(path: string, message = "err"): CodeAnnotation {
  return { path, message };
}

describe("mapAnnotationsToLines", () => {
  describe("empty inputs", () => {
    it("returns empty map for empty annotations", () => {
      const result = mapAnnotationsToLines('{"a": 1}', "json", []);
      expect(result.size).toBe(0);
    });

    it("returns empty map for empty serialized text", () => {
      const result = mapAnnotationsToLines("", "json", [ann("a")]);
      expect(result.size).toBe(0);
    });
  });

  describe("JSON format", () => {
    it("maps a simple top-level key", () => {
      const json = JSON.stringify({ name: "test", age: 30 }, null, 2);
      const result = mapAnnotationsToLines(json, "json", [ann("name")]);

      // "name" should be on a single line
      expect(result.size).toBe(1);
      const lines = [...result.keys()];
      const jsonLines = json.split("\n");
      expect(jsonLines[lines[0]!]).toContain('"name"');
    });

    it("maps a nested key", () => {
      const obj = { config: { theme: "dark", debug: false } };
      const json = JSON.stringify(obj, null, 2);
      const result = mapAnnotationsToLines(json, "json", [ann("config.theme")]);

      expect(result.size).toBe(1);
      const line = json.split("\n")[[...result.keys()][0]!];
      expect(line).toContain('"theme"');
    });

    it("maps a scalar in an array", () => {
      const obj = { items: ["alpha", "beta", "gamma"] };
      const json = JSON.stringify(obj, null, 2);
      const result = mapAnnotationsToLines(json, "json", [ann("items.1")]);

      expect(result.size).toBe(1);
      const line = json.split("\n")[[...result.keys()][0]!];
      expect(line).toContain('"beta"');
    });

    it("maps an object value spanning multiple lines", () => {
      const obj = { outer: { inner: { a: 1, b: 2 } } };
      const json = JSON.stringify(obj, null, 2);
      const result = mapAnnotationsToLines(json, "json", [ann("outer.inner")]);

      // Should span from the "inner": { line to its closing }
      expect(result.size).toBeGreaterThan(1);
    });

    it("returns null for non-existent path", () => {
      const json = JSON.stringify({ a: 1 }, null, 2);
      const result = mapAnnotationsToLines(json, "json", [ann("nonexistent")]);
      expect(result.size).toBe(0);
    });

    it("scans past closing braces and brackets for non-existent path", () => {
      // Exercises closing brace/bracket handler: stack popping, isArrayStack cleanup,
      // and comma-based array index increment for objects in arrays
      const obj = { a: { b: [{ x: 1 }, { x: 2 }] } };
      const json = JSON.stringify(obj, null, 2);
      const result = mapAnnotationsToLines(json, "json", [ann("nonexistent")]);
      expect(result.size).toBe(0);
    });

    it("handles JSON with blank lines", () => {
      // Manually crafted JSON with blank lines — exercises empty line skip
      const json = '{\n\n  "a": 1\n}';
      const result = mapAnnotationsToLines(json, "json", [ann("a")]);
      expect(result.size).toBe(1);
    });

    it("does not match sibling keys as nested paths in malformed JSON", () => {
      // Malformed JSON: "b" is at root indent (sibling of "a"), not a child of "a"
      const json = '{\n  "a": [\n    "x": {\n      "y": 1\n  "b": 2\n}';
      const result = mapAnnotationsToLines(json, "json", [ann("a.b")]);
      // "b" is at indent 2 (depth 1), not inside "a" — should not match "a.b"
      expect(result.size).toBe(0);
    });

    it("exercises closing brace and bracket code paths", () => {
      // JSON with arrays of objects exercises the closing brace handler
      const obj = { items: [{ id: 1 }, { id: 2 }] };
      const json = JSON.stringify(obj, null, 2);
      // Whole array key works — exercises opening brackets inside key values
      const result = mapAnnotationsToLines(json, "json", [ann("items")]);
      expect(result.size).toBeGreaterThan(1);
    });

    it("maps array value spanning multiple lines", () => {
      const obj = { tags: ["a", "b", "c"] };
      const json = JSON.stringify(obj, null, 2);
      const result = mapAnnotationsToLines(json, "json", [ann("tags")]);
      // Should span from "tags": [ to ]
      expect(result.size).toBeGreaterThan(1);
    });

    it("handles standalone opening braces and brackets", () => {
      // Root-level { and [ are standalone, not preceded by a key
      const json = JSON.stringify({ a: { b: 1 } }, null, 2);
      const result = mapAnnotationsToLines(json, "json", [ann("a.b")]);
      expect(result.size).toBe(1);
    });

    it("maps last scalar in array (no trailing comma)", () => {
      const obj = { items: ["first", "last"] };
      const json = JSON.stringify(obj, null, 2);
      // "last" is items[1], the last element (no comma after it)
      const result = mapAnnotationsToLines(json, "json", [ann("items.1")]);
      expect(result.size).toBe(1);
      const line = json.split("\n")[[...result.keys()][0]!];
      expect(line).toContain('"last"');
    });

    it("handles malformed JSON with unclosed braces", () => {
      // Exercises the fallback return in findJsonValueEnd
      const json = '{\n  "a": {\n    "b": 1\n';
      const result = mapAnnotationsToLines(json, "json", [ann("a")]);
      // Should match "a" key line even though braces don't close
      expect(result.size).toBeGreaterThanOrEqual(1);
    });

    it("handles key with nested object value (opening {)", () => {
      const obj = { config: { nested: { deep: true } } };
      const json = JSON.stringify(obj, null, 2);
      const result = mapAnnotationsToLines(json, "json", [ann("config")]);
      // Should span from "config": { to its closing }
      expect(result.size).toBeGreaterThan(1);
    });

    it("returns empty path segments for empty path string", () => {
      const json = JSON.stringify({ a: 1 }, null, 2);
      const result = mapAnnotationsToLines(json, "json", [ann("")]);
      expect(result.size).toBe(0);
    });

    it("handles path with bracket notation", () => {
      const obj = { items: ["alpha", "beta"] };
      const json = JSON.stringify(obj, null, 2);
      const result = mapAnnotationsToLines(json, "json", [ann("items[0]")]);
      expect(result.size).toBe(1);
      const line = json.split("\n")[[...result.keys()][0]!];
      expect(line).toContain('"alpha"');
    });

    it("exercises closing bracket with depth tracking", () => {
      // Deeply nested structure — exercises stack depth management
      const obj = { a: { b: { c: 1 } } };
      const json = JSON.stringify(obj, null, 2);
      const result = mapAnnotationsToLines(json, "json", [ann("a.b.c")]);
      expect(result.size).toBe(1);
      const line = json.split("\n")[[...result.keys()][0]!];
      expect(line).toContain('"c"');
    });

    it("finds first scalar in array after key with array value", () => {
      // This exercises the array index tracking for scalar elements
      const obj = { list: ["x", "y", "z"] };
      const json = JSON.stringify(obj, null, 2);
      const result = mapAnnotationsToLines(json, "json", [ann("list.0")]);
      expect(result.size).toBe(1);
      const line = json.split("\n")[[...result.keys()][0]!];
      expect(line).toContain('"x"');
    });
  });

  describe("YAML format", () => {
    it("maps a simple top-level key", () => {
      const yaml = "name: test\nage: 30";
      const result = mapAnnotationsToLines(yaml, "yaml", [ann("name")]);

      expect(result.size).toBe(1);
      expect(result.has(0)).toBe(true);
    });

    it("maps a nested key", () => {
      const yaml = "config:\n  theme: dark\n  debug: false";
      const result = mapAnnotationsToLines(yaml, "yaml", [ann("config.theme")]);

      expect(result.size).toBe(1);
      const line = yaml.split("\n")[[...result.keys()][0]!];
      expect(line).toContain("theme");
    });

    it("maps block values spanning multiple lines", () => {
      const yaml = "description: |\n  Line one\n  Line two\nother: val";
      const result = mapAnnotationsToLines(yaml, "yaml", [ann("description")]);

      // Should span from the description: line through the indented block
      expect(result.size).toBeGreaterThan(1);
    });

    it("returns empty map for non-existent path", () => {
      const yaml = "a: 1";
      const result = mapAnnotationsToLines(yaml, "yaml", [ann("nonexistent")]);
      expect(result.size).toBe(0);
    });

    it("skips blank lines while scanning for target key", () => {
      const yaml = "a: 1\n\nb: 2";
      const result = mapAnnotationsToLines(yaml, "yaml", [ann("b")]);
      expect(result.size).toBe(1);
      expect(result.has(2)).toBe(true);
    });

    it("maps first array item by index", () => {
      const yaml = "items:\n  - alpha\n  - beta\n  - gamma";
      const result = mapAnnotationsToLines(yaml, "yaml", [ann("items.0")]);
      expect(result.size).toBe(1);
      const line = yaml.split("\n")[[...result.keys()][0]!];
      expect(line).toContain("alpha");
    });

    it("maps inline key within first array item", () => {
      const yaml = "users:\n  - name: Alice\n    age: 30\n  - name: Bob\n    age: 25";
      const result = mapAnnotationsToLines(yaml, "yaml", [ann("users.0.name")]);
      expect(result.size).toBe(1);
      const line = yaml.split("\n")[[...result.keys()][0]!];
      expect(line).toContain("Alice");
    });

    it("maps nested key after array item with sub-keys", () => {
      // Exercises the stack push for inline key that doesn't match,
      // then finds a sibling key within the same array item
      const yaml = "users:\n  - name: Alice\n    age: 30";
      const result = mapAnnotationsToLines(yaml, "yaml", [ann("users.0.age")]);
      expect(result.size).toBe(1);
      const line = yaml.split("\n")[[...result.keys()][0]!];
      expect(line).toContain("age");
    });

    it("handles blank lines inside block values", () => {
      const yaml = "text: |\n  Line one\n\n  Line three\nother: val";
      const result = mapAnnotationsToLines(yaml, "yaml", [ann("text")]);
      // Should span the block value lines (blank line is part of block)
      expect(result.size).toBeGreaterThanOrEqual(3);
    });

    it("resets array tracking at different indent level", () => {
      const yaml = "items:\n  - one\n  - two\nafter: val";
      const result = mapAnnotationsToLines(yaml, "yaml", [ann("after")]);
      expect(result.size).toBe(1);
      expect(result.has(3)).toBe(true);
    });

    it("handles nested object value (no inline scalar)", () => {
      const yaml = "config:\n  db:\n    host: localhost\n    port: 5432";
      const result = mapAnnotationsToLines(yaml, "yaml", [ann("config.db")]);
      // "db:" has no inline value — spans to the indented block
      expect(result.size).toBeGreaterThan(1);
    });

    it("returns empty path segments for empty path string", () => {
      const yaml = "a: 1";
      const result = mapAnnotationsToLines(yaml, "yaml", [ann("")]);
      expect(result.size).toBe(0);
    });
  });

  describe("multiple annotations", () => {
    it("merges overlapping annotations on the same line", () => {
      const json = JSON.stringify({ a: 1 }, null, 2);
      const result = mapAnnotationsToLines(json, "json", [
        { path: "a", message: "first", type: "error" },
        { path: "a", message: "second", type: "warning" },
      ]);

      // Both annotations should appear on the same line
      const lineAnnotations = [...result.values()][0]!;
      expect(lineAnnotations).toHaveLength(2);
      expect(lineAnnotations[0]!.message).toBe("first");
      expect(lineAnnotations[1]!.message).toBe("second");
    });
  });
});
