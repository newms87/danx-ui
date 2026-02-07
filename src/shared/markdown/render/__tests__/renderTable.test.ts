import { describe, it, expect, beforeEach } from "vitest";
import { renderTable } from "../renderTable";
import type { BlockToken } from "../../types";
import { resetParserState } from "../../state";

describe("renderTable", () => {
	beforeEach(() => {
		resetParserState();
	});

	it("renders basic table with headers and rows", () => {
		const token: Extract<BlockToken, { type: "table" }> = {
			type: "table",
			headers: ["Name", "Age"],
			alignments: [null, null],
			rows: [
				["Alice", "30"],
				["Bob", "25"]
			]
		};
		const result = renderTable(token, true);
		expect(result).toBe(
			"<table>" +
			"<thead><tr><th>Name</th><th>Age</th></tr></thead>" +
			"<tbody>" +
			"<tr><td>Alice</td><td>30</td></tr>" +
			"<tr><td>Bob</td><td>25</td></tr>" +
			"</tbody></table>"
		);
	});

	it("applies left alignment style", () => {
		const token: Extract<BlockToken, { type: "table" }> = {
			type: "table",
			headers: ["Left"],
			alignments: ["left"],
			rows: [["data"]]
		};
		const result = renderTable(token, true);
		expect(result).toContain('<th style="text-align: left">Left</th>');
		expect(result).toContain('<td style="text-align: left">data</td>');
	});

	it("applies center alignment style", () => {
		const token: Extract<BlockToken, { type: "table" }> = {
			type: "table",
			headers: ["Center"],
			alignments: ["center"],
			rows: [["data"]]
		};
		const result = renderTable(token, true);
		expect(result).toContain('<th style="text-align: center">Center</th>');
		expect(result).toContain('<td style="text-align: center">data</td>');
	});

	it("applies right alignment style", () => {
		const token: Extract<BlockToken, { type: "table" }> = {
			type: "table",
			headers: ["Right"],
			alignments: ["right"],
			rows: [["data"]]
		};
		const result = renderTable(token, true);
		expect(result).toContain('<th style="text-align: right">Right</th>');
		expect(result).toContain('<td style="text-align: right">data</td>');
	});

	it("has no style attribute for null alignment", () => {
		const token: Extract<BlockToken, { type: "table" }> = {
			type: "table",
			headers: ["Default"],
			alignments: [null],
			rows: [["data"]]
		};
		const result = renderTable(token, true);
		expect(result).toContain("<th>Default</th>");
		expect(result).toContain("<td>data</td>");
		expect(result).not.toContain("style=");
	});

	it("applies mixed alignments across columns", () => {
		const token: Extract<BlockToken, { type: "table" }> = {
			type: "table",
			headers: ["Left", "Center", "Right", "Default"],
			alignments: ["left", "center", "right", null],
			rows: [["a", "b", "c", "d"]]
		};
		const result = renderTable(token, true);
		expect(result).toContain('<th style="text-align: left">Left</th>');
		expect(result).toContain('<th style="text-align: center">Center</th>');
		expect(result).toContain('<th style="text-align: right">Right</th>');
		expect(result).toContain("<th>Default</th>");
		expect(result).toContain('<td style="text-align: left">a</td>');
		expect(result).toContain('<td style="text-align: center">b</td>');
		expect(result).toContain('<td style="text-align: right">c</td>');
		expect(result).toContain("<td>d</td>");
	});

	it("parses inline markdown in header cells", () => {
		const token: Extract<BlockToken, { type: "table" }> = {
			type: "table",
			headers: ["**Bold Header**", "*Italic Header*"],
			alignments: [null, null],
			rows: [["cell1", "cell2"]]
		};
		const result = renderTable(token, true);
		expect(result).toContain("<th><strong>Bold Header</strong></th>");
		expect(result).toContain("<th><em>Italic Header</em></th>");
	});

	it("parses inline markdown in body cells", () => {
		const token: Extract<BlockToken, { type: "table" }> = {
			type: "table",
			headers: ["Header"],
			alignments: [null],
			rows: [
				["`code value`"],
				["**bold value**"],
				["[link](http://example.com)"]
			]
		};
		const result = renderTable(token, true);
		expect(result).toContain("<td><code>code value</code></td>");
		expect(result).toContain("<td><strong>bold value</strong></td>");
		expect(result).toContain('<td><a href="http://example.com">link</a></td>');
	});

	it("handles empty cells", () => {
		const token: Extract<BlockToken, { type: "table" }> = {
			type: "table",
			headers: ["Col A", "Col B"],
			alignments: [null, null],
			rows: [
				["", "has content"],
				["has content", ""]
			]
		};
		const result = renderTable(token, true);
		expect(result).toContain("<td></td>");
		expect(result).toContain("<td>has content</td>");
	});

	it("uses thead/tbody structure", () => {
		const token: Extract<BlockToken, { type: "table" }> = {
			type: "table",
			headers: ["H"],
			alignments: [null],
			rows: [["D"]]
		};
		const result = renderTable(token, true);
		expect(result).toMatch(/^<table><thead>.*<\/thead><tbody>.*<\/tbody><\/table>$/);
	});

	it("renders table with multiple rows", () => {
		const token: Extract<BlockToken, { type: "table" }> = {
			type: "table",
			headers: ["ID", "Name"],
			alignments: [null, null],
			rows: [
				["1", "Alice"],
				["2", "Bob"],
				["3", "Charlie"]
			]
		};
		const result = renderTable(token, true);
		expect(result).toContain("<tr><td>1</td><td>Alice</td></tr>");
		expect(result).toContain("<tr><td>2</td><td>Bob</td></tr>");
		expect(result).toContain("<tr><td>3</td><td>Charlie</td></tr>");
	});

	it("renders table with no body rows", () => {
		const token: Extract<BlockToken, { type: "table" }> = {
			type: "table",
			headers: ["Empty Table"],
			alignments: [null],
			rows: []
		};
		const result = renderTable(token, true);
		expect(result).toBe(
			"<table><thead><tr><th>Empty Table</th></tr></thead><tbody></tbody></table>"
		);
	});

	it("falls back to null alignment when alignments array is shorter than headers", () => {
		const token: Extract<BlockToken, { type: "table" }> = {
			type: "table",
			headers: ["A", "B", "C"],
			alignments: ["left"],
			rows: [["1", "2", "3"]]
		};
		const result = renderTable(token, true);
		// First column has left alignment
		expect(result).toContain('<th style="text-align: left">A</th>');
		// Remaining columns have no style (fallback to null via ?? null)
		expect(result).toContain("<th>B</th>");
		expect(result).toContain("<th>C</th>");
	});

	it("escapes HTML in cells when sanitize is true", () => {
		const token: Extract<BlockToken, { type: "table" }> = {
			type: "table",
			headers: ["Header"],
			alignments: [null],
			rows: [['<script>alert("xss")</script>']]
		};
		const result = renderTable(token, true);
		expect(result).not.toContain("<script>");
		expect(result).toContain("&lt;script&gt;");
	});
});
