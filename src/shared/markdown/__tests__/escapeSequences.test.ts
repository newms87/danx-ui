import { describe, it, expect } from "vitest";
import { ESCAPE_MAP, UNESCAPE_MAP, applyEscapes, revertEscapes } from "../escapeSequences";

describe("ESCAPE_MAP", () => {
	it("has entries for all expected escaped characters", () => {
		const expectedKeys = [
			"\\*", "\\_", "\\~", "\\`", "\\[", "\\]",
			"\\#", "\\&gt;", "\\-", "\\+", "\\.", "\\!",
			"\\=", "\\^"
		];
		for (const key of expectedKeys) {
			expect(ESCAPE_MAP).toHaveProperty(key);
		}
	});

	it("maps each escape to a unique Unicode Private Use Area placeholder", () => {
		const values = Object.values(ESCAPE_MAP);
		const unique = new Set(values);
		expect(unique.size).toBe(values.length);

		for (const val of values) {
			const code = val.charCodeAt(0);
			expect(code).toBeGreaterThanOrEqual(0xE000);
			expect(code).toBeLessThanOrEqual(0xF8FF);
		}
	});

	it("has exactly 14 entries", () => {
		expect(Object.keys(ESCAPE_MAP).length).toBe(14);
	});
});

describe("UNESCAPE_MAP", () => {
	it("has the same number of entries as ESCAPE_MAP", () => {
		expect(Object.keys(UNESCAPE_MAP).length).toBe(Object.keys(ESCAPE_MAP).length);
	});

	it("maps each placeholder back to the literal character (without backslash)", () => {
		// \\* placeholder should map to *
		expect(UNESCAPE_MAP[ESCAPE_MAP["\\*"]]).toBe("*");
		expect(UNESCAPE_MAP[ESCAPE_MAP["\\_"]]).toBe("_");
		expect(UNESCAPE_MAP[ESCAPE_MAP["\\~"]]).toBe("~");
		expect(UNESCAPE_MAP[ESCAPE_MAP["\\`"]]).toBe("`");
		expect(UNESCAPE_MAP[ESCAPE_MAP["\\["]]).toBe("[");
		expect(UNESCAPE_MAP[ESCAPE_MAP["\\]"]]).toBe("]");
		expect(UNESCAPE_MAP[ESCAPE_MAP["\\#"]]).toBe("#");
		expect(UNESCAPE_MAP[ESCAPE_MAP["\\-"]]).toBe("-");
		expect(UNESCAPE_MAP[ESCAPE_MAP["\\+"]]).toBe("+");
		expect(UNESCAPE_MAP[ESCAPE_MAP["\\."]]).toBe(".");
		expect(UNESCAPE_MAP[ESCAPE_MAP["\\!"]]).toBe("!");
		expect(UNESCAPE_MAP[ESCAPE_MAP["\\="]!]).toBe("=");
		expect(UNESCAPE_MAP[ESCAPE_MAP["\\^"]!]).toBe("^");
	});

	it("maps the HTML-escaped greater-than placeholder to &gt;", () => {
		// \\&gt; placeholder should map to &gt; (the literal stripped of backslash)
		expect(UNESCAPE_MAP[ESCAPE_MAP["\\&gt;"]!]).toBe("&gt;");
	});

	it("keys are the Unicode placeholders from ESCAPE_MAP values", () => {
		const escapeValues = Object.values(ESCAPE_MAP);
		const unescapeKeys = Object.keys(UNESCAPE_MAP);
		expect(unescapeKeys.sort()).toEqual(escapeValues.sort());
	});
});

describe("applyEscapes", () => {
	it("replaces a single escaped asterisk with its placeholder", () => {
		const result = applyEscapes("\\*");
		expect(result).toBe(ESCAPE_MAP["\\*"]);
	});

	it("replaces each escaped character with its corresponding placeholder", () => {
		for (const [pattern, placeholder] of Object.entries(ESCAPE_MAP)) {
			expect(applyEscapes(pattern)).toBe(placeholder);
		}
	});

	it("handles multiple escape sequences in one string", () => {
		const input = "\\* and \\_ and \\~";
		const result = applyEscapes(input);
		expect(result).toBe(`${ESCAPE_MAP["\\*"]} and ${ESCAPE_MAP["\\_"]} and ${ESCAPE_MAP["\\~"]}`);
	});

	it("leaves non-escaped text unchanged", () => {
		expect(applyEscapes("hello world")).toBe("hello world");
		expect(applyEscapes("no escapes here")).toBe("no escapes here");
	});

	it("leaves a lone backslash unchanged when not followed by a mapped character", () => {
		expect(applyEscapes("\\z")).toBe("\\z");
	});

	it("handles empty string", () => {
		expect(applyEscapes("")).toBe("");
	});

	it("handles text with escape sequences embedded in words", () => {
		const result = applyEscapes("this\\*is\\*escaped");
		expect(result).toBe(`this${ESCAPE_MAP["\\*"]}is${ESCAPE_MAP["\\*"]}escaped`);
	});
});

describe("revertEscapes", () => {
	it("converts a single placeholder back to its literal character", () => {
		expect(revertEscapes(ESCAPE_MAP["\\*"]!)).toBe("*");
		expect(revertEscapes(ESCAPE_MAP["\\_"]!)).toBe("_");
	});

	it("converts all placeholders back to their literal characters", () => {
		for (const [, placeholder] of Object.entries(ESCAPE_MAP)) {
			const expectedLiteral = UNESCAPE_MAP[placeholder];
			expect(revertEscapes(placeholder)).toBe(expectedLiteral);
		}
	});

	it("handles multiple placeholders in one string", () => {
		const input = `${ESCAPE_MAP["\\*"]} and ${ESCAPE_MAP["\\_"]}`;
		expect(revertEscapes(input)).toBe("* and _");
	});

	it("leaves text without placeholders unchanged", () => {
		expect(revertEscapes("hello world")).toBe("hello world");
	});

	it("handles empty string", () => {
		expect(revertEscapes("")).toBe("");
	});

	it("handles mixed text and placeholders", () => {
		const input = `before ${ESCAPE_MAP["\\*"]} middle ${ESCAPE_MAP["\\!"]} after`;
		expect(revertEscapes(input)).toBe("before * middle ! after");
	});
});

describe("round-trip: applyEscapes then revertEscapes", () => {
	it("converts \\* to literal * after round-trip", () => {
		const escaped = applyEscapes("\\*");
		const reverted = revertEscapes(escaped);
		expect(reverted).toBe("*");
	});

	it("converts multiple escapes to their literals after round-trip", () => {
		const input = "\\* \\_ \\~ \\` \\[ \\] \\# \\- \\+ \\. \\! \\= \\^";
		const escaped = applyEscapes(input);
		const reverted = revertEscapes(escaped);
		expect(reverted).toBe("* _ ~ ` [ ] # - + . ! = ^");
	});

	it("preserves non-escaped text through round-trip", () => {
		const input = "hello world 123";
		const escaped = applyEscapes(input);
		const reverted = revertEscapes(escaped);
		expect(reverted).toBe("hello world 123");
	});

	it("handles the HTML-escaped greater-than through round-trip", () => {
		const input = "\\&gt;";
		const escaped = applyEscapes(input);
		const reverted = revertEscapes(escaped);
		expect(reverted).toBe("&gt;");
	});
});
