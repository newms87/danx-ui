/**
 * Lightweight syntax highlighting for Bash/Shell scripts
 *
 * Character-by-character tokenizer following the same pattern as
 * highlightJavaScript. Uses positional detection to highlight commands:
 * the first word after a line start, pipe, or logical operator is a command.
 * This means ANY word in command position gets highlighted, not just known commands.
 */

import { escapeHtml } from "../escapeHtml";

/**
 * Bash keywords — shell syntax words that are always highlighted regardless of position
 */
const BASH_KEYWORDS = new Set([
  "if",
  "then",
  "else",
  "elif",
  "fi",
  "for",
  "while",
  "until",
  "do",
  "done",
  "case",
  "esac",
  "in",
  "function",
  "return",
  "local",
  "export",
  "source",
  "eval",
  "exec",
  "select",
]);

/**
 * Check if character can start an identifier (word)
 */
function isWordStart(char: string): boolean {
  return /[a-zA-Z_]/.test(char);
}

/**
 * Check if character can be part of an identifier (word)
 */
function isWordPart(char: string): boolean {
  return /[a-zA-Z0-9_]/.test(char);
}

/**
 * Characters that also appear in command names (paths, dotfiles, etc.)
 * e.g., ./script.sh, /usr/bin/env, docker-compose
 */
function isCommandPart(char: string): boolean {
  return isWordPart(char) || char === "-" || char === "." || char === "/" || char === ":";
}

/**
 * Highlight Bash syntax by tokenizing character-by-character.
 * Tracks "command position" to highlight any word as a command when it appears
 * as the first word on a line or after a pipe/operator.
 */
export function highlightBash(code: string): string {
  if (!code) return "";

  const result: string[] = [];
  let i = 0;
  // Whether the next word is in command position (start of statement)
  let expectCommand = true;

  while (i < code.length) {
    const char = code[i]!;

    // Newlines reset to command position
    if (char === "\n") {
      result.push("\n");
      i++;
      expectCommand = true;
      continue;
    }

    // Skip whitespace (preserve command position state)
    if (char === " " || char === "\t") {
      result.push(char);
      i++;
      continue;
    }

    // Handle comments: # to end of line (including shebangs #!)
    if (char === "#") {
      const startIndex = i;
      while (i < code.length && code[i] !== "\n") {
        i++;
      }
      const comment = code.slice(startIndex, i);
      result.push(`<span class="syntax-comment">${escapeHtml(comment)}</span>`);
      // Don't change expectCommand — next line will reset it
      continue;
    }

    // Handle double-quoted strings with escape sequences
    if (char === '"') {
      const startIndex = i;
      i++; // Skip opening quote

      while (i < code.length) {
        if (code[i] === "\\" && i + 1 < code.length) {
          i += 2; // Skip escaped character
        } else if (code[i] === '"') {
          i++; // Include closing quote
          break;
        } else {
          i++;
        }
      }

      const str = code.slice(startIndex, i);
      result.push(`<span class="syntax-string">${escapeHtml(str)}</span>`);
      expectCommand = false;
      continue;
    }

    // Handle single-quoted strings (literal, no escapes)
    if (char === "'") {
      const startIndex = i;
      i++; // Skip opening quote

      while (i < code.length) {
        if (code[i] === "'") {
          i++; // Include closing quote
          break;
        }
        i++;
      }

      const str = code.slice(startIndex, i);
      result.push(`<span class="syntax-string">${escapeHtml(str)}</span>`);
      expectCommand = false;
      continue;
    }

    // Handle variables: $VAR, ${VAR}, $0-$9, $@, $?, $#, $$, $!, $*, $_
    if (char === "$") {
      const startIndex = i;
      i++; // Skip $

      if (i < code.length) {
        if (code[i] === "{") {
          // ${VAR} form
          i++; // Skip {
          while (i < code.length && code[i] !== "}") {
            i++;
          }
          if (i < code.length) i++; // Include closing }
        } else if (/[0-9@?#$!*_]/.test(code[i]!)) {
          // Special variables: $0-$9, $@, $?, $#, $$, $!, $*, $_
          i++;
        } else if (isWordStart(code[i]!)) {
          // $VAR form
          while (i < code.length && isWordPart(code[i]!)) {
            i++;
          }
        }
      }

      const variable = code.slice(startIndex, i);
      result.push(`<span class="syntax-variable">${escapeHtml(variable)}</span>`);
      expectCommand = false;
      continue;
    }

    // Handle multi-character operators: ||, &&, ;;, >>, <<, 2>, &>
    const twoChar = code.slice(i, i + 2);
    if (
      twoChar === "||" ||
      twoChar === "&&" ||
      twoChar === ";;" ||
      twoChar === ">>" ||
      twoChar === "<<" ||
      twoChar === "2>" ||
      twoChar === "&>"
    ) {
      result.push(`<span class="syntax-operator">${escapeHtml(twoChar)}</span>`);
      i += 2;
      // Pipe and logical operators start a new command
      if (twoChar === "||" || twoChar === "&&" || twoChar === ";;") {
        expectCommand = true;
      }
      continue;
    }

    // Handle single-character operators: | > < & ;
    if (char === "|" || char === ">" || char === "<" || char === "&" || char === ";") {
      result.push(`<span class="syntax-operator">${escapeHtml(char)}</span>`);
      i++;
      // Pipe and semicolon start a new command
      if (char === "|" || char === ";") {
        expectCommand = true;
      }
      continue;
    }

    // Handle numbers: integers and hex (0x...)
    if (/\d/.test(char)) {
      const startIndex = i;

      if (char === "0" && i + 1 < code.length && (code[i + 1] === "x" || code[i + 1] === "X")) {
        // Hex number
        i += 2;
        while (i < code.length && /[0-9a-fA-F]/.test(code[i]!)) i++;
      } else {
        // Decimal integer
        while (i < code.length && /\d/.test(code[i]!)) i++;
      }

      // Only treat as number if not followed by a word character
      if (i < code.length && isWordPart(code[i]!)) {
        // It's part of an identifier like "var2" — rewind and handle as word
        i = startIndex;
      } else {
        const num = code.slice(startIndex, i);
        result.push(`<span class="syntax-number">${escapeHtml(num)}</span>`);
        expectCommand = false;
        continue;
      }
    }

    // Handle path-starting commands: ./script.sh, /usr/bin/env
    if (expectCommand && (char === "." || char === "/")) {
      const startIndex = i;
      while (i < code.length && isCommandPart(code[i]!)) {
        i++;
      }
      const command = code.slice(startIndex, i);
      result.push(`<span class="syntax-keyword">${escapeHtml(command)}</span>`);
      expectCommand = false;
      continue;
    }

    // Handle identifiers (words), keywords, and commands
    if (isWordStart(char)) {
      const startIndex = i;

      if (expectCommand) {
        // In command position: consume the full command token including
        // path separators, dots, and hyphens (e.g., ./script.sh, docker-compose)
        while (i < code.length && isCommandPart(code[i]!)) {
          i++;
        }
        const command = code.slice(startIndex, i);
        result.push(`<span class="syntax-keyword">${escapeHtml(command)}</span>`);
        // Keywords like "then", "do", "else" start a new command context
        expectCommand = BASH_KEYWORDS.has(command);
      } else {
        // Not in command position: consume a normal word
        while (i < code.length && isWordPart(code[i]!)) {
          i++;
        }
        const word = code.slice(startIndex, i);

        if (BASH_KEYWORDS.has(word)) {
          result.push(`<span class="syntax-keyword">${escapeHtml(word)}</span>`);
          // Keywords like "then", "do", "else" start a new command context
          expectCommand = true;
        } else {
          result.push(escapeHtml(word));
        }
      }
      continue;
    }

    // Handle punctuation: (){}[]
    if (/[(){}\[\]]/.test(char)) {
      result.push(`<span class="syntax-punctuation">${escapeHtml(char)}</span>`);
      i++;
      // Opening paren/brace can start a subshell/block with a new command
      if (char === "(" || char === "{") {
        expectCommand = true;
      }
      continue;
    }

    // Handle whitespace and other characters
    result.push(escapeHtml(char));
    i++;
  }

  return result.join("");
}
