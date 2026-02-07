/**
 * Lightweight syntax highlighting for JavaScript
 * Returns HTML string with syntax highlighting spans
 * Uses character-by-character tokenization for accurate parsing
 */

/**
 * Escape HTML entities to prevent XSS
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * JavaScript keywords that should be highlighted
 */
const JS_KEYWORDS = new Set([
  // Declarations
  "const",
  "let",
  "var",
  "function",
  "class",
  "extends",
  "static",
  // Control flow
  "if",
  "else",
  "switch",
  "case",
  "default",
  "for",
  "while",
  "do",
  "break",
  "continue",
  "return",
  "throw",
  "try",
  "catch",
  "finally",
  // Operators/values
  "new",
  "delete",
  "typeof",
  "instanceof",
  "in",
  "of",
  "void",
  // Async
  "async",
  "await",
  "yield",
  // Module
  "import",
  "export",
  "from",
  "as",
  // Other
  "this",
  "super",
  "debugger",
  "with",
]);

/**
 * JavaScript built-in values
 */
const JS_BUILTINS = new Set(["true", "false", "null", "undefined", "NaN", "Infinity"]);

/**
 * Check if character can start an identifier
 */
function isIdentifierStart(char: string): boolean {
  return /[a-zA-Z_$]/.test(char);
}

/**
 * Check if character can be part of an identifier
 */
function isIdentifierPart(char: string): boolean {
  return /[a-zA-Z0-9_$]/.test(char);
}

/**
 * Check if a character could precede a regex literal
 * Regex can appear after: ( [ { , ; : ! & | = + - * / ? ~ ^ %
 * or at the start of a statement (after newline, return, etc.)
 */
function canPrecedeRegex(lastToken: string): boolean {
  if (!lastToken) return true;
  const operators = [
    "(",
    "[",
    "{",
    ",",
    ";",
    ":",
    "!",
    "&",
    "|",
    "=",
    "+",
    "-",
    "*",
    "/",
    "?",
    "~",
    "^",
    "%",
    "<",
    ">",
  ];
  const keywords = [
    "return",
    "throw",
    "case",
    "delete",
    "void",
    "typeof",
    "instanceof",
    "in",
    "of",
    "new",
  ];
  return operators.includes(lastToken) || keywords.includes(lastToken);
}

/**
 * Highlight JavaScript syntax by tokenizing character-by-character
 */
export function highlightJavaScript(code: string): string {
  if (!code) return "";

  const result: string[] = [];
  let i = 0;
  let lastToken = ""; // Track last significant token for regex detection

  while (i < code.length) {
    const char = code[i];

    // Handle single-line comments: // ...
    if (char === "/" && code[i + 1] === "/") {
      const startIndex = i;
      i += 2; // Skip //

      // Find end of line
      while (i < code.length && code[i] !== "\n") {
        i++;
      }

      const comment = code.slice(startIndex, i);
      result.push(`<span class="syntax-comment">${escapeHtml(comment)}</span>`);
      lastToken = "";
      continue;
    }

    // Handle multi-line comments: /* ... */
    if (char === "/" && code[i + 1] === "*") {
      const startIndex = i;
      i += 2; // Skip /*

      // Find closing */
      while (i < code.length) {
        if (code[i] === "*" && code[i + 1] === "/") {
          i += 2; // Include */
          break;
        }
        i++;
      }

      const comment = code.slice(startIndex, i);
      result.push(`<span class="syntax-comment">${escapeHtml(comment)}</span>`);
      lastToken = "";
      continue;
    }

    // Handle template literals: `...`
    if (char === "`") {
      const startIndex = i;
      i++; // Skip opening backtick

      // Find closing backtick, handling escape sequences and ${} expressions
      while (i < code.length) {
        if (code[i] === "\\" && i + 1 < code.length) {
          i += 2; // Skip escaped character
        } else if (code[i] === "$" && code[i + 1] === "{") {
          // Template expression - for now, just include it in the string
          // A more sophisticated approach would recursively highlight the expression
          let braceDepth = 1;
          i += 2; // Skip ${
          while (i < code.length && braceDepth > 0) {
            if (code[i] === "{") braceDepth++;
            else if (code[i] === "}") braceDepth--;
            i++;
          }
        } else if (code[i] === "`") {
          i++; // Include closing backtick
          break;
        } else {
          i++;
        }
      }

      const str = code.slice(startIndex, i);
      result.push(`<span class="syntax-template">${escapeHtml(str)}</span>`);
      lastToken = "string";
      continue;
    }

    // Handle strings (single or double quoted)
    if (char === '"' || char === "'") {
      const quoteChar = char;
      const startIndex = i;
      i++; // Skip opening quote

      // Find closing quote, handling escape sequences
      while (i < code.length) {
        if (code[i] === "\\" && i + 1 < code.length) {
          i += 2; // Skip escaped character
        } else if (code[i] === quoteChar) {
          i++; // Include closing quote
          break;
        } else if (code[i] === "\n") {
          // Unterminated string - stop at newline
          break;
        } else {
          i++;
        }
      }

      const str = code.slice(startIndex, i);
      result.push(`<span class="syntax-string">${escapeHtml(str)}</span>`);
      lastToken = "string";
      continue;
    }

    // Handle regex literals: /pattern/flags
    if (char === "/" && canPrecedeRegex(lastToken)) {
      // Check if this looks like a regex (not division)
      // A regex must be followed by at least one character that's not / or *
      if (code[i + 1]! && code[i + 1]! !== "/" && code[i + 1]! !== "*") {
        const startIndex = i;
        i++; // Skip opening /

        // Find closing / handling escape sequences and character classes
        let inCharClass = false;
        while (i < code.length) {
          if (code[i] === "\\" && i + 1 < code.length) {
            i += 2; // Skip escaped character
          } else if (code[i] === "[" && !inCharClass) {
            inCharClass = true;
            i++;
          } else if (code[i] === "]" && inCharClass) {
            inCharClass = false;
            i++;
          } else if (code[i] === "/" && !inCharClass) {
            i++; // Include closing /
            // Include flags (g, i, m, s, u, y, d)
            while (i < code.length && /[gimsuy]/.test(code[i]!)) {
              i++;
            }
            break;
          } else if (code[i] === "\n") {
            // Unterminated regex - stop at newline
            break;
          } else {
            i++;
          }
        }

        const regex = code.slice(startIndex, i);
        result.push(`<span class="syntax-regex">${escapeHtml(regex)}</span>`);
        lastToken = "regex";
        continue;
      }
    }

    // Handle numbers
    if (/\d/.test(char!) || (char === "." && /\d/.test(code[i + 1] || ""))) {
      const startIndex = i;

      // Check for hex, octal, binary
      if (char === "0" && code[i + 1]) {
        const next = code[i + 1]!.toLowerCase();
        if (next === "x") {
          // Hex: 0x[0-9a-f]+
          i += 2;
          while (i < code.length && /[0-9a-fA-F_]/.test(code[i]!)) i++;
        } else if (next === "b") {
          // Binary: 0b[01]+
          i += 2;
          while (i < code.length && /[01_]/.test(code[i]!)) i++;
        } else if (next === "o") {
          // Octal: 0o[0-7]+
          i += 2;
          while (i < code.length && /[0-7_]/.test(code[i]!)) i++;
        } else {
          // Regular number or legacy octal
          i++;
        }
      } else {
        i++;
      }

      // Continue with decimal part
      while (i < code.length && /[\d_]/.test(code[i]!)) i++;

      // Decimal point
      if (code[i] === "." && /\d/.test(code[i + 1] || "")) {
        i++;
        while (i < code.length && /[\d_]/.test(code[i]!)) i++;
      }

      // Exponent
      if ((code[i] === "e" || code[i] === "E") && /[\d+-]/.test(code[i + 1] || "")) {
        i++;
        if (code[i]! === "+" || code[i]! === "-") i++;
        while (i < code.length && /[\d_]/.test(code[i]!)) i++;
      }

      // BigInt suffix
      if (code[i] === "n") i++;

      const num = code.slice(startIndex, i);
      result.push(`<span class="syntax-number">${escapeHtml(num)}</span>`);
      lastToken = "number";
      continue;
    }

    // Handle identifiers and keywords
    if (isIdentifierStart(char!)) {
      const startIndex = i;
      while (i < code.length && isIdentifierPart(code[i]!)) {
        i++;
      }

      const identifier = code.slice(startIndex, i);

      if (JS_KEYWORDS.has(identifier)) {
        result.push(`<span class="syntax-keyword">${escapeHtml(identifier)}</span>`);
        lastToken = identifier;
      } else if (JS_BUILTINS.has(identifier)) {
        if (identifier === "true" || identifier === "false") {
          result.push(`<span class="syntax-boolean">${escapeHtml(identifier)}</span>`);
        } else {
          result.push(`<span class="syntax-null">${escapeHtml(identifier)}</span>`);
        }
        lastToken = identifier;
      } else {
        // Regular identifier
        result.push(escapeHtml(identifier));
        lastToken = "identifier";
      }
      continue;
    }

    // Handle operators
    const operators = [
      "===",
      "!==",
      "==",
      "!=",
      "<=",
      ">=",
      "&&",
      "||",
      "??",
      "++",
      "--",
      "+=",
      "-=",
      "*=",
      "/=",
      "%=",
      "**=",
      "&=",
      "|=",
      "^=",
      "<<=",
      ">>=",
      ">>>=",
      "=>",
      "...",
      "**",
      "<<",
      ">>",
      ">>>",
      "+",
      "-",
      "*",
      "/",
      "%",
      "&",
      "|",
      "^",
      "~",
      "!",
      "<",
      ">",
      "=",
      "?",
      ":",
    ];

    let matchedOp = "";
    for (const op of operators) {
      if (code.slice(i, i + op.length) === op) {
        if (op.length > matchedOp.length) {
          matchedOp = op;
        }
      }
    }

    if (matchedOp) {
      result.push(`<span class="syntax-operator">${escapeHtml(matchedOp)}</span>`);
      lastToken = matchedOp;
      i += matchedOp.length;
      continue;
    }

    // Handle punctuation
    if (/[{}()\[\];,.]/.test(char!)) {
      result.push(`<span class="syntax-punctuation">${escapeHtml(char!)}</span>`);
      lastToken = char!;
      i++;
      continue;
    }

    // Handle whitespace
    if (/\s/.test(char!)) {
      result.push(escapeHtml(char!));
      // Don't reset lastToken for whitespace
      i++;
      continue;
    }

    // Default: just escape and add
    result.push(escapeHtml(char!));
    lastToken = char!;
    i++;
  }

  return result.join("");
}
