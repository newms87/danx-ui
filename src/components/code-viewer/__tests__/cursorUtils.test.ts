import { describe, expect, it } from "vitest";
import { getAvailableFormats, getSmartIndent } from "../cursorUtils";
import type { LineInfo } from "../cursorUtils";

describe("cursorUtils", () => {
	describe("getSmartIndent", () => {
		it("YAML: line ending with colon adds indent", () => {
			const lineInfo: LineInfo = { indent: "", lineContent: "key:" };
			expect(getSmartIndent(lineInfo, "yaml")).toBe("  ");
		});

		it("YAML: block scalar adds indent", () => {
			const lineInfo: LineInfo = { indent: "", lineContent: "description: |" };
			expect(getSmartIndent(lineInfo, "yaml")).toBe("  ");
		});

		it("YAML: list item adds indent", () => {
			const lineInfo: LineInfo = { indent: "", lineContent: "- item" };
			expect(getSmartIndent(lineInfo, "yaml")).toBe("  ");
		});

		it("YAML: bare dash keeps indent", () => {
			const lineInfo: LineInfo = { indent: "", lineContent: "-" };
			expect(getSmartIndent(lineInfo, "yaml")).toBe("");
		});

		it("JSON: opening brace adds indent", () => {
			const lineInfo: LineInfo = { indent: "", lineContent: "{" };
			expect(getSmartIndent(lineInfo, "json")).toBe("  ");
		});

		it("JSON: comma keeps indent", () => {
			const lineInfo: LineInfo = { indent: "  ", lineContent: "  \"key\": \"val\"," };
			expect(getSmartIndent(lineInfo, "json")).toBe("  ");
		});

		it("default keeps current indent", () => {
			const lineInfo: LineInfo = { indent: "  ", lineContent: "  some text" };
			expect(getSmartIndent(lineInfo, "yaml")).toBe("  ");
		});
	});

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
	});
});
