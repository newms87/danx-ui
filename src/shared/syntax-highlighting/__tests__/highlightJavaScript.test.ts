import { describe, it, expect } from "vitest";
import { highlightJavaScript } from "../highlightJavaScript";

describe("highlightJavaScript", () => {
  describe("empty/falsy input", () => {
    it("returns empty string for empty string", () => {
      expect(highlightJavaScript("")).toBe("");
    });

    it("returns empty string for null", () => {
      // @ts-expect-error testing falsy input
      expect(highlightJavaScript(null)).toBe("");
    });

    it("returns empty string for undefined", () => {
      // @ts-expect-error testing falsy input
      expect(highlightJavaScript(undefined)).toBe("");
    });
  });

  describe("keywords", () => {
    it("highlights declaration keywords", () => {
      for (const kw of ["const", "let", "var", "function", "class"]) {
        const result = highlightJavaScript(kw);
        expect(result).toBe(`<span class="syntax-keyword">${kw}</span>`);
      }
    });

    it("highlights control flow keywords", () => {
      for (const kw of [
        "if",
        "else",
        "return",
        "for",
        "while",
        "switch",
        "case",
        "break",
        "continue",
      ]) {
        const result = highlightJavaScript(kw);
        expect(result).toBe(`<span class="syntax-keyword">${kw}</span>`);
      }
    });

    it("highlights async keywords", () => {
      for (const kw of ["async", "await", "yield"]) {
        const result = highlightJavaScript(kw);
        expect(result).toBe(`<span class="syntax-keyword">${kw}</span>`);
      }
    });

    it("highlights module keywords", () => {
      for (const kw of ["import", "export", "from", "as"]) {
        const result = highlightJavaScript(kw);
        expect(result).toBe(`<span class="syntax-keyword">${kw}</span>`);
      }
    });

    it("highlights other keywords", () => {
      for (const kw of [
        "new",
        "delete",
        "typeof",
        "instanceof",
        "in",
        "of",
        "void",
        "this",
        "super",
        "throw",
        "try",
        "catch",
        "finally",
      ]) {
        const result = highlightJavaScript(kw);
        expect(result).toBe(`<span class="syntax-keyword">${kw}</span>`);
      }
    });

    it("does not highlight keyword-like substrings in identifiers", () => {
      const result = highlightJavaScript("constValue");
      // Should be a plain identifier, not highlighted as keyword
      expect(result).toBe("constValue");
    });
  });

  describe("booleans", () => {
    it("highlights true", () => {
      const result = highlightJavaScript("true");
      expect(result).toBe('<span class="syntax-boolean">true</span>');
    });

    it("highlights false", () => {
      const result = highlightJavaScript("false");
      expect(result).toBe('<span class="syntax-boolean">false</span>');
    });
  });

  describe("null/undefined/NaN/Infinity", () => {
    it("highlights null", () => {
      const result = highlightJavaScript("null");
      expect(result).toBe('<span class="syntax-null">null</span>');
    });

    it("highlights undefined", () => {
      const result = highlightJavaScript("undefined");
      expect(result).toBe('<span class="syntax-null">undefined</span>');
    });

    it("highlights NaN", () => {
      const result = highlightJavaScript("NaN");
      expect(result).toBe('<span class="syntax-null">NaN</span>');
    });

    it("highlights Infinity", () => {
      const result = highlightJavaScript("Infinity");
      expect(result).toBe('<span class="syntax-null">Infinity</span>');
    });
  });

  describe("strings", () => {
    it("highlights double-quoted strings", () => {
      const result = highlightJavaScript('"hello"');
      expect(result).toBe('<span class="syntax-string">&quot;hello&quot;</span>');
    });

    it("highlights single-quoted strings", () => {
      const result = highlightJavaScript("'hello'");
      expect(result).toBe('<span class="syntax-string">&#039;hello&#039;</span>');
    });

    it("handles escape sequences in strings", () => {
      const result = highlightJavaScript('"hello\\nworld"');
      expect(result).toContain('class="syntax-string"');
      expect(result).toContain("hello\\nworld");
    });

    it("handles escaped quotes in strings", () => {
      const result = highlightJavaScript('"hello\\"world"');
      expect(result).toContain('class="syntax-string"');
      // The entire string including escaped quote should be one token
      expect(result).toContain("hello\\&quot;world");
    });

    it("stops at newline for unterminated strings", () => {
      const result = highlightJavaScript('"unterminated\nvar x');
      // The string should stop at the newline
      expect(result).toContain('class="syntax-string"');
      expect(result).toContain('<span class="syntax-keyword">var</span>');
    });
  });

  describe("template literals", () => {
    it("highlights template literals with syntax-template class", () => {
      const result = highlightJavaScript("`hello`");
      expect(result).toBe('<span class="syntax-template">`hello`</span>');
    });

    it("handles template expressions ${}", () => {
      const result = highlightJavaScript("`hello ${name}`");
      expect(result).toContain('class="syntax-template"');
      expect(result).toContain("${name}");
    });

    it("handles nested braces in template expressions", () => {
      const result = highlightJavaScript("`${obj.fn({a: 1})}`");
      expect(result).toContain('class="syntax-template"');
    });

    it("handles escape sequences in template literals", () => {
      const result = highlightJavaScript("`hello\\`world`");
      expect(result).toContain('class="syntax-template"');
    });
  });

  describe("single-line comments", () => {
    it("highlights // comments", () => {
      const result = highlightJavaScript("// this is a comment");
      expect(result).toBe('<span class="syntax-comment">// this is a comment</span>');
    });

    it("highlights comment after code on same line", () => {
      const result = highlightJavaScript("x // comment");
      expect(result).toContain("x");
      expect(result).toContain('<span class="syntax-comment">// comment</span>');
    });

    it("stops at newline", () => {
      const result = highlightJavaScript("// comment\nvar x");
      expect(result).toContain('<span class="syntax-comment">// comment</span>');
      expect(result).toContain('<span class="syntax-keyword">var</span>');
    });
  });

  describe("multi-line comments", () => {
    it("highlights /* */ comments", () => {
      const result = highlightJavaScript("/* comment */");
      expect(result).toBe('<span class="syntax-comment">/* comment */</span>');
    });

    it("handles multi-line content", () => {
      const result = highlightJavaScript("/* line1\nline2 */");
      expect(result).toContain('class="syntax-comment"');
      expect(result).toContain("line1\nline2");
    });
  });

  describe("regex literals", () => {
    it("highlights regex after operator", () => {
      const result = highlightJavaScript("= /pattern/gi");
      expect(result).toContain('<span class="syntax-regex">/pattern/gi</span>');
    });

    it("highlights regex after opening paren", () => {
      const result = highlightJavaScript("(/foo/)");
      expect(result).toContain('<span class="syntax-regex">/foo/</span>');
    });

    it("highlights regex after return keyword", () => {
      const result = highlightJavaScript("return /test/");
      expect(result).toContain('<span class="syntax-keyword">return</span>');
      expect(result).toContain('<span class="syntax-regex">/test/</span>');
    });

    it("handles escape sequences in regex", () => {
      const result = highlightJavaScript("= /\\.test/");
      expect(result).toContain('class="syntax-regex"');
    });

    it("handles character classes in regex", () => {
      const result = highlightJavaScript("= /[a-z]/");
      expect(result).toContain('class="syntax-regex"');
    });

    it("does not treat division as regex", () => {
      // After an identifier, / should be division, not regex
      const result = highlightJavaScript("a / b");
      // Division is an operator
      expect(result).toContain('<span class="syntax-operator">/</span>');
      expect(result).not.toContain('class="syntax-regex"');
    });
  });

  describe("numbers", () => {
    it("highlights integer numbers", () => {
      const result = highlightJavaScript("42");
      expect(result).toBe('<span class="syntax-number">42</span>');
    });

    it("highlights decimal numbers", () => {
      const result = highlightJavaScript("3.14");
      expect(result).toBe('<span class="syntax-number">3.14</span>');
    });

    it("highlights hex numbers", () => {
      const result = highlightJavaScript("0xFF");
      expect(result).toBe('<span class="syntax-number">0xFF</span>');
    });

    it("highlights binary numbers", () => {
      const result = highlightJavaScript("0b1010");
      expect(result).toBe('<span class="syntax-number">0b1010</span>');
    });

    it("highlights octal numbers", () => {
      const result = highlightJavaScript("0o77");
      expect(result).toBe('<span class="syntax-number">0o77</span>');
    });

    it("highlights BigInt numbers", () => {
      const result = highlightJavaScript("42n");
      expect(result).toBe('<span class="syntax-number">42n</span>');
    });

    it("highlights exponent notation", () => {
      const result = highlightJavaScript("1e10");
      expect(result).toBe('<span class="syntax-number">1e10</span>');
    });

    it("highlights negative exponent", () => {
      const result = highlightJavaScript("1e-5");
      expect(result).toBe('<span class="syntax-number">1e-5</span>');
    });

    it("highlights numbers starting with dot", () => {
      const result = highlightJavaScript(".5");
      expect(result).toBe('<span class="syntax-number">.5</span>');
    });
  });

  describe("operators", () => {
    it("highlights strict equality", () => {
      const result = highlightJavaScript("===");
      expect(result).toBe('<span class="syntax-operator">===</span>');
    });

    it("highlights strict inequality", () => {
      const result = highlightJavaScript("!==");
      expect(result).toBe('<span class="syntax-operator">!==</span>');
    });

    it("highlights arrow function operator", () => {
      const result = highlightJavaScript("=>");
      expect(result).toBe('<span class="syntax-operator">=&gt;</span>');
    });

    it("highlights spread operator", () => {
      const result = highlightJavaScript("...");
      expect(result).toBe('<span class="syntax-operator">...</span>');
    });

    it("highlights exponentiation operator", () => {
      const result = highlightJavaScript("**");
      expect(result).toBe('<span class="syntax-operator">**</span>');
    });

    it("highlights nullish coalescing", () => {
      const result = highlightJavaScript("??");
      expect(result).toBe('<span class="syntax-operator">??</span>');
    });

    it("matches longest operator first", () => {
      // === should be matched as one operator, not = then == or = = =
      const result = highlightJavaScript("===");
      expect(result).toBe('<span class="syntax-operator">===</span>');
    });

    it("highlights assignment operators", () => {
      // /= is excluded because at the start of input, / is treated as regex start
      for (const op of ["+=", "-=", "*=", "%="]) {
        const result = highlightJavaScript(op);
        expect(result).toContain('class="syntax-operator"');
      }
    });

    it("highlights /= after an identifier", () => {
      // /= after an identifier is correctly parsed as division-assignment
      const result = highlightJavaScript("x /= 2");
      expect(result).toContain('<span class="syntax-operator">/=</span>');
    });

    it("highlights comparison operators", () => {
      for (const op of ["==", "!=", "<=", ">="]) {
        const result = highlightJavaScript(op);
        expect(result).toContain('class="syntax-operator"');
      }
    });

    it("highlights logical operators", () => {
      for (const op of ["&&", "||"]) {
        const result = highlightJavaScript(op);
        expect(result).toContain('class="syntax-operator"');
      }
    });

    it("highlights ternary operator", () => {
      const result = highlightJavaScript("?");
      expect(result).toBe('<span class="syntax-operator">?</span>');
    });

    it("highlights colon operator", () => {
      const result = highlightJavaScript(":");
      expect(result).toBe('<span class="syntax-operator">:</span>');
    });
  });

  describe("punctuation", () => {
    it("highlights braces", () => {
      const result = highlightJavaScript("{}");
      expect(result).toContain('<span class="syntax-punctuation">{</span>');
      expect(result).toContain('<span class="syntax-punctuation">}</span>');
    });

    it("highlights parentheses", () => {
      const result = highlightJavaScript("()");
      expect(result).toContain('<span class="syntax-punctuation">(</span>');
      expect(result).toContain('<span class="syntax-punctuation">)</span>');
    });

    it("highlights brackets", () => {
      const result = highlightJavaScript("[]");
      expect(result).toContain('<span class="syntax-punctuation">[</span>');
      expect(result).toContain('<span class="syntax-punctuation">]</span>');
    });

    it("highlights semicolon", () => {
      const result = highlightJavaScript(";");
      expect(result).toBe('<span class="syntax-punctuation">;</span>');
    });

    it("highlights comma", () => {
      const result = highlightJavaScript(",");
      expect(result).toBe('<span class="syntax-punctuation">,</span>');
    });

    it("highlights dot", () => {
      const result = highlightJavaScript(".");
      expect(result).toBe('<span class="syntax-punctuation">.</span>');
    });
  });

  describe("regular identifiers", () => {
    it("escapes identifiers without adding a class", () => {
      const result = highlightJavaScript("myVar");
      expect(result).toBe("myVar");
    });

    it("handles identifiers starting with underscore", () => {
      const result = highlightJavaScript("_private");
      expect(result).toBe("_private");
    });

    it("handles identifiers starting with $", () => {
      const result = highlightJavaScript("$element");
      expect(result).toBe("$element");
    });

    it("handles identifiers with numbers", () => {
      const result = highlightJavaScript("item2");
      expect(result).toBe("item2");
    });
  });

  describe("HTML entity escaping", () => {
    it("escapes ampersand in identifiers", () => {
      // Ampersand is not an identifier char, but escaping should still work in strings
      const result = highlightJavaScript('"a&b"');
      expect(result).toContain("a&amp;b");
    });

    it("escapes < in strings", () => {
      const result = highlightJavaScript('"<div>"');
      expect(result).toContain("&lt;div&gt;");
    });

    it("escapes > in strings", () => {
      const result = highlightJavaScript('"a>b"');
      expect(result).toContain("a&gt;b");
    });
  });

  describe("whitespace handling", () => {
    it("preserves whitespace between tokens", () => {
      const result = highlightJavaScript("const x = 5");
      expect(result).toContain('<span class="syntax-keyword">const</span>');
      expect(result).toContain(" x ");
      expect(result).toContain('<span class="syntax-number">5</span>');
    });

    it("preserves newlines", () => {
      const result = highlightJavaScript("const x\nlet y");
      expect(result).toContain("\n");
    });
  });

  describe("complex expressions", () => {
    it("highlights a complete variable declaration", () => {
      const result = highlightJavaScript('const name = "hello";');
      expect(result).toContain('<span class="syntax-keyword">const</span>');
      expect(result).toContain("name");
      expect(result).toContain('<span class="syntax-operator">=</span>');
      expect(result).toContain('<span class="syntax-string">&quot;hello&quot;</span>');
      expect(result).toContain('<span class="syntax-punctuation">;</span>');
    });

    it("highlights an arrow function", () => {
      const result = highlightJavaScript("const fn = (x) => x + 1");
      expect(result).toContain('<span class="syntax-keyword">const</span>');
      expect(result).toContain('<span class="syntax-operator">=&gt;</span>');
      expect(result).toContain('<span class="syntax-number">1</span>');
    });

    it("highlights a function declaration", () => {
      const result = highlightJavaScript("function greet(name) { return name; }");
      expect(result).toContain('<span class="syntax-keyword">function</span>');
      expect(result).toContain('<span class="syntax-keyword">return</span>');
    });

    it("highlights an if/else block", () => {
      const result = highlightJavaScript("if (true) { x } else { y }");
      expect(result).toContain('<span class="syntax-keyword">if</span>');
      expect(result).toContain('<span class="syntax-boolean">true</span>');
      expect(result).toContain('<span class="syntax-keyword">else</span>');
    });
  });

  describe("additional edge cases", () => {
    it("handles unterminated regex at newline", () => {
      // Regex /pattern followed by newline without closing / (line 270-271)
      const result = highlightJavaScript("x = /unterminated\nvar y");
      expect(result).toContain('class="syntax-regex"');
      expect(result).toContain('class="syntax-keyword"');
    });

    it("handles legacy number starting with 0 followed by non-hex/bin/oct", () => {
      // Number like 09 - starts with 0 but next char is not x/b/o (line 304-305)
      const result = highlightJavaScript("09");
      expect(result).toContain('<span class="syntax-number">09</span>');
    });

    it("handles unknown/special characters like @", () => {
      // Characters that are not identifiers, operators, punctuation, or whitespace (line 444-446)
      const result = highlightJavaScript("@decorator");
      expect(result).toContain("@");
      expect(result).toContain("decorator");
    });

    it("handles unicode characters", () => {
      const result = highlightJavaScript("const \u00e9 = 1");
      expect(result).toContain('<span class="syntax-keyword">const</span>');
      expect(result).toContain('<span class="syntax-number">1</span>');
    });

    it("handles regex at start of code (empty lastToken)", () => {
      // canPrecedeRegex("") returns true immediately (line 96)
      const result = highlightJavaScript("/pattern/gi");
      expect(result).toContain('class="syntax-regex"');
    });

    it("handles / as division after identifier (not regex)", () => {
      // canPrecedeRegex("identifier") returns false, so / is treated as operator
      const result = highlightJavaScript("a / b");
      expect(result).toContain('class="syntax-operator"');
    });

    it("handles integer without decimal or exponent", () => {
      // Tests that number parsing skips decimal/exponent sub-expressions (lines 315, 321)
      const result = highlightJavaScript("x = 42;");
      expect(result).toContain('<span class="syntax-number">42</span>');
    });
  });
});
