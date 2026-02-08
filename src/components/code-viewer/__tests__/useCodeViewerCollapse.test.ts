import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { useCodeFormat } from "../useCodeFormat";
import { formatValuePreview, getSyntaxClass, useCodeViewerCollapse } from "../useCodeViewerCollapse";

function createCollapse(value: object | string | null, format: "json" | "yaml" | "text" | "markdown") {
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
			const { collapsedPreview } = useCodeViewerCollapse({ modelValue, format: formatRef, displayContent, codeFormat });
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
	});
});
