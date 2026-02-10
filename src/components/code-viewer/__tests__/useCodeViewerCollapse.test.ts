import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { useCodeFormat } from "../useCodeFormat";
import {
  formatValuePreview,
  getSyntaxClass,
  useCodeViewerCollapse,
} from "../useCodeViewerCollapse";

function createCollapse(
  value: object | string | null,
  format: "json" | "yaml" | "text" | "markdown"
) {
  const modelValue = ref(value);
  const formatRef = ref(format as any);
  const codeFormat = useCodeFormat({ initialFormat: format, initialValue: value });
  const displayContent = ref(codeFormat.formattedContent.value);
  return useCodeViewerCollapse({ modelValue, format: formatRef, displayContent, codeFormat });
}

describe("useCodeViewerCollapse", () => {
  describe("formatValuePreview", () => {
    it("returns 'null' for null", () => {
      expect(formatValuePreview(null)).toBe("null");
    });

    it("returns quoted short string by default", () => {
      expect(formatValuePreview("hello")).toBe('"hello"');
    });

    it("returns unquoted short string when includeQuotes is false", () => {
      expect(formatValuePreview("hello", false)).toBe("hello");
    });

    it("truncates strings longer than 15 characters", () => {
      const long = "abcdefghijklmnop";
      expect(formatValuePreview(long)).toBe('"abcdefghijklmno..."');
    });

    it("shows item count for arrays", () => {
      expect(formatValuePreview([1, 2, 3])).toBe("[3]");
    });

    it("shows {...} for objects", () => {
      expect(formatValuePreview({ a: 1 })).toBe("{...}");
    });

    it("returns stringified number", () => {
      expect(formatValuePreview(42)).toBe("42");
    });

    it("returns stringified boolean", () => {
      expect(formatValuePreview(true)).toBe("true");
    });
  });

  describe("getSyntaxClass", () => {
    it("returns 'null' for null", () => {
      expect(getSyntaxClass(null)).toBe("null");
    });

    it("returns 'string' for strings", () => {
      expect(getSyntaxClass("hi")).toBe("string");
    });

    it("returns 'number' for numbers", () => {
      expect(getSyntaxClass(7)).toBe("number");
    });

    it("returns 'boolean' for booleans", () => {
      expect(getSyntaxClass(false)).toBe("boolean");
    });

    it("returns 'punctuation' for objects", () => {
      expect(getSyntaxClass({ a: 1 })).toBe("punctuation");
    });
  });

  describe("collapsedPreview", () => {
    it("shows null span when content is empty", () => {
      const modelValue = ref(null);
      const formatRef = ref("json" as any);
      const codeFormat = useCodeFormat({ initialFormat: "json", initialValue: null });
      const displayContent = ref("");
      const { collapsedPreview } = useCodeViewerCollapse({
        modelValue,
        format: formatRef,
        displayContent,
        codeFormat,
      });
      expect(collapsedPreview.value).toBe('<span class="syntax-null">null</span>');
    });

    it("shows first line for text format", () => {
      const { collapsedPreview } = createCollapse("Hello world\nSecond line", "text");
      expect(collapsedPreview.value).toBe("Hello world");
    });

    it("truncates first line over 100 chars for text format", () => {
      const longLine = "a".repeat(120) + "\nSecond line";
      const { collapsedPreview } = createCollapse(longLine, "text");
      expect(collapsedPreview.value).toBe("a".repeat(100) + "...");
    });

    it("shows key-value pairs with syntax spans for JSON object", () => {
      const obj = { name: "Alice", age: 30 };
      const { collapsedPreview } = createCollapse(obj, "json");
      expect(collapsedPreview.value).toContain('class="syntax-key"');
      expect(collapsedPreview.value).toContain('class="syntax-string"');
      expect(collapsedPreview.value).toContain('class="syntax-number"');
      expect(collapsedPreview.value).toContain("name");
      expect(collapsedPreview.value).toContain("age");
    });

    it("shows null span for JSON null value", () => {
      const { collapsedPreview } = createCollapse("null", "json");
      expect(collapsedPreview.value).toBe('<span class="syntax-null">null</span>');
    });

    it("shows item count for JSON array", () => {
      const { collapsedPreview } = createCollapse([1, 2, 3, 4], "json");
      expect(collapsedPreview.value).toBe("[4 items]");
    });

    it("shows keys without quotes for YAML object values", () => {
      const obj = { title: "Test", count: 5 };
      const { collapsedPreview } = createCollapse(obj, "yaml");
      expect(collapsedPreview.value).toContain('class="syntax-key"');
      // YAML uses includeQuotes=false so string values have no quotes
      expect(collapsedPreview.value).toContain('class="syntax-string">Test<');
      expect(collapsedPreview.value).toContain('class="syntax-number">5<');
    });

    it("shows null span for YAML null", () => {
      const modelValue = ref(null);
      const formatRef = ref("yaml" as any);
      const codeFormat = useCodeFormat({ initialFormat: "yaml", initialValue: null });
      const displayContent = ref("null");
      const { collapsedPreview } = useCodeViewerCollapse({
        modelValue,
        format: formatRef,
        displayContent,
        codeFormat,
      });
      // collapsedPreview falls through to YAML branch and tries to parse "null"
      // which returns null -> shows null span
      expect(collapsedPreview.value).toBe('<span class="syntax-null">null</span>');
    });

    it("shows item count for YAML array", () => {
      const { collapsedPreview } = createCollapse([1, 2, 3], "yaml");
      expect(collapsedPreview.value).toBe("[3 items]");
    });

    it("shows ellipsis for JSON object with more than 3 keys", () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const { collapsedPreview } = createCollapse(obj, "json");
      expect(collapsedPreview.value).toContain(", ...");
    });

    it("does not show ellipsis for JSON object with 3 or fewer keys", () => {
      const obj = { a: 1, b: 2, c: 3 };
      const { collapsedPreview } = createCollapse(obj, "json");
      expect(collapsedPreview.value).not.toContain(", ...");
    });

    it("shows ellipsis for YAML object with more than 3 keys", () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const { collapsedPreview } = createCollapse(obj, "yaml");
      expect(collapsedPreview.value).toContain(", ...");
    });

    it("does not show ellipsis for YAML object with 3 or fewer keys", () => {
      const obj = { a: 1, b: 2 };
      const { collapsedPreview } = createCollapse(obj, "yaml");
      expect(collapsedPreview.value).not.toContain(", ...");
    });

    it("shows first line for markdown format", () => {
      const { collapsedPreview } = createCollapse("# Hello\nWorld", "markdown");
      expect(collapsedPreview.value).toBe("# Hello");
    });

    it("highlights JSON primitive (non-object, non-array)", () => {
      const modelValue = ref("42");
      const formatRef = ref("json" as any);
      const codeFormat = useCodeFormat({ initialFormat: "json", initialValue: "42" });
      const displayContent = ref("42");
      const { collapsedPreview } = useCodeViewerCollapse({
        modelValue,
        format: formatRef,
        displayContent,
        codeFormat,
      });
      // 42 is a primitive JSON value - should be highlighted
      expect(collapsedPreview.value).toBeTruthy();
    });

    it("handles YAML primitive (non-object, non-array)", () => {
      const modelValue = ref("hello");
      const formatRef = ref("yaml" as any);
      const codeFormat = useCodeFormat({ initialFormat: "yaml", initialValue: "hello" });
      const displayContent = ref("hello");
      const { collapsedPreview } = useCodeViewerCollapse({
        modelValue,
        format: formatRef,
        displayContent,
        codeFormat,
      });
      expect(collapsedPreview.value).toBeTruthy();
    });

    it("fallback for invalid JSON content shows collapsed text", () => {
      const modelValue = ref("{invalid json");
      const formatRef = ref("json" as any);
      const codeFormat = useCodeFormat({ initialFormat: "json" });
      codeFormat.setContent("{invalid json");
      const displayContent = ref("{invalid json");
      const { collapsedPreview } = useCodeViewerCollapse({
        modelValue,
        format: formatRef,
        displayContent,
        codeFormat,
      });
      expect(collapsedPreview.value).toContain("{invalid json");
    });

    it("JSON catch block truncates content longer than 100 chars", () => {
      const longContent = "{" + "x".repeat(120);
      const modelValue = ref(longContent);
      const formatRef = ref("json" as any);
      const codeFormat = useCodeFormat({ initialFormat: "json" });
      codeFormat.setContent(longContent);
      const displayContent = ref(longContent);
      const { collapsedPreview } = useCodeViewerCollapse({
        modelValue,
        format: formatRef,
        displayContent,
        codeFormat,
      });
      // Content exceeds 100 chars so it should be truncated with "..."
      expect(collapsedPreview.value).toContain("...");
      expect(collapsedPreview.value.length).toBeLessThan(longContent.length);
    });

    it("fallback for invalid YAML content shows first line", () => {
      const modelValue = ref("invalid: yaml: : :");
      const formatRef = ref("yaml" as any);
      const codeFormat = useCodeFormat({ initialFormat: "yaml" });
      codeFormat.setContent("invalid: yaml: : :");
      const displayContent = ref("invalid: yaml: : :");
      const { collapsedPreview } = useCodeViewerCollapse({
        modelValue,
        format: formatRef,
        displayContent,
        codeFormat,
      });
      expect(collapsedPreview.value).toBeTruthy();
    });

    it("shows null span for JSON null when modelValue is non-string null", () => {
      const modelValue = ref(null);
      const formatRef = ref("json" as any);
      const codeFormat = useCodeFormat({ initialFormat: "json" });
      const displayContent = ref("null");
      const { collapsedPreview } = useCodeViewerCollapse({
        modelValue,
        format: formatRef,
        displayContent,
        codeFormat,
      });
      expect(collapsedPreview.value).toBe('<span class="syntax-null">null</span>');
    });

    it("YAML catch block falls back to first line when parse throws", () => {
      const modelValue = ref("some: content");
      const formatRef = ref("yaml" as any);
      const codeFormat = useCodeFormat({ initialFormat: "yaml" });
      // Override parse to throw, triggering the catch block
      codeFormat.parse = () => {
        throw new Error("parse failure");
      };
      const displayContent = ref("first line\nsecond line");
      const { collapsedPreview } = useCodeViewerCollapse({
        modelValue,
        format: formatRef,
        displayContent,
        codeFormat,
      });
      expect(collapsedPreview.value).toBe("first line");
    });

    it("YAML catch block truncates long first line", () => {
      const modelValue = ref("long content");
      const formatRef = ref("yaml" as any);
      const codeFormat = useCodeFormat({ initialFormat: "yaml" });
      codeFormat.parse = () => {
        throw new Error("parse failure");
      };
      const longLine = "x".repeat(120) + "\nsecond";
      const displayContent = ref(longLine);
      const { collapsedPreview } = useCodeViewerCollapse({
        modelValue,
        format: formatRef,
        displayContent,
        codeFormat,
      });
      expect(collapsedPreview.value).toBe("x".repeat(100) + "...");
    });

    it("handles YAML with undefined modelValue (non-object, non-array, non-null)", () => {
      const modelValue = ref(undefined);
      const formatRef = ref("yaml" as any);
      const codeFormat = useCodeFormat({ initialFormat: "yaml" });
      const displayContent = ref("some content");
      const { collapsedPreview } = useCodeViewerCollapse({
        modelValue: modelValue as any,
        format: formatRef,
        displayContent,
        codeFormat,
      });
      // undefined is not null, not array, not object — falls to String(parsed)
      expect(collapsedPreview.value).toBe("undefined");
    });
  });
});
