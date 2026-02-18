/**
 * Path-to-Line Mapping for Code Annotations
 *
 * Maps annotation property paths (e.g. "styles.body", "document[5].type") to
 * the line ranges they occupy in serialized JSON or YAML output. Used by the
 * CodeViewer annotation system to highlight the correct lines.
 */

import type { CodeAnnotation } from "./types";

/**
 * Maps each annotation's property path to the lines it spans in serialized text.
 * Returns a Map from 0-based line number to the annotations covering that line.
 */
export function mapAnnotationsToLines(
  serialized: string,
  format: "json" | "yaml",
  annotations: CodeAnnotation[]
): Map<number, CodeAnnotation[]> {
  if (!annotations.length || !serialized) return new Map();

  const lines = serialized.split("\n");
  const result = new Map<number, CodeAnnotation[]>();

  for (const annotation of annotations) {
    const range =
      format === "json"
        ? findJsonRange(lines, annotation.path)
        : findYamlRange(lines, annotation.path);

    if (range) {
      for (let i = range.start; i <= range.end; i++) {
        const existing = result.get(i);
        if (existing) {
          existing.push(annotation);
        } else {
          result.set(i, [annotation]);
        }
      }
    }
  }

  return result;
}

/**
 * Parses a dot-notation path into segments, handling array indices.
 * "styles.body" => ["styles", "body"]
 * "document[5].type" => ["document", "5", "type"]
 */
function parsePath(path: string): string[] {
  const segments: string[] = [];
  let current = "";

  for (let i = 0; i < path.length; i++) {
    const ch = path[i];
    if (ch === ".") {
      if (current) segments.push(current);
      current = "";
    } else if (ch === "[") {
      if (current) segments.push(current);
      current = "";
    } else if (ch === "]") {
      if (current) segments.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current) segments.push(current);
  return segments;
}

interface LineRange {
  start: number;
  end: number;
}

/**
 * Find the line range for a property path in JSON.stringify(obj, null, 2) output.
 *
 * Uses a sequential-search approach: for each path segment, searches forward from
 * the previous match at the expected indent level. This leverages the deterministic
 * output format of JSON.stringify — each nesting level adds exactly 2 spaces of indent.
 */
function findJsonRange(lines: string[], path: string): LineRange | null {
  const segments = parsePath(path);

  let searchFrom = 0;

  for (let si = 0; si < segments.length; si++) {
    const segment = segments[si]!;
    const isLast = si === segments.length - 1;
    const expectedIndent = (si + 1) * 2;
    const isArrayIndex = /^\d+$/.test(segment);

    let foundLine = -1;

    if (isArrayIndex) {
      const targetIdx = parseInt(segment);
      let elementIdx = 0;

      for (let i = searchFrom; i < lines.length; i++) {
        const line = lines[i]!;
        const trimmed = line.trimStart();
        const indent = line.length - trimmed.length;

        // Left the container scope
        if (indent < expectedIndent && trimmed && i > searchFrom) break;

        // Element at the right indent — skip closers (} and ])
        if (
          indent === expectedIndent &&
          trimmed &&
          !trimmed.startsWith("}") &&
          !trimmed.startsWith("]")
        ) {
          if (elementIdx === targetIdx) {
            foundLine = i;
            break;
          }
          elementIdx++;
        }
      }
    } else {
      const keyPattern = " ".repeat(expectedIndent) + `"${segment}":`;

      for (let i = searchFrom; i < lines.length; i++) {
        if (lines[i]!.startsWith(keyPattern)) {
          foundLine = i;
          break;
        }
        // Scope check — if we see content at lower indent, we've left the scope
        const trimmed = lines[i]!.trimStart();
        const indent = lines[i]!.length - trimmed.length;
        if (indent < expectedIndent && trimmed && i > searchFrom) break;
      }
    }

    if (foundLine === -1) return null;

    if (isLast) {
      return { start: foundLine, end: findJsonValueEnd(lines, foundLine) };
    }

    searchFrom = foundLine + 1;
  }

  return null;
}

/**
 * Find where a JSON value ends starting from the given line.
 * Scalars end on the same line. Objects/arrays end at the matching closer.
 */
function findJsonValueEnd(lines: string[], startLine: number): number {
  let depth = 0;
  for (let i = startLine; i < lines.length; i++) {
    for (const ch of lines[i]!) {
      if (ch === "{" || ch === "[") depth++;
      if (ch === "}" || ch === "]") depth--;
    }
    // Scalars: no braces, depth stays 0 → return immediately
    // Objects/arrays: depth goes positive, then returns to 0 at the matching closer
    if (depth <= 0) return i;
  }
  return startLine;
}

/**
 * Find the line range for a property path in YAML output.
 *
 * Searches sequentially for each path segment. Object keys are found by matching
 * "key:" at the expected indent. Array items are counted by "- " prefixes at the
 * expected indent.
 */
function findYamlRange(lines: string[], path: string): LineRange | null {
  const segments = parsePath(path);

  let searchFrom = 0;
  let currentIndent = 0;

  for (let si = 0; si < segments.length; si++) {
    const segment = segments[si]!;
    const isLast = si === segments.length - 1;
    const isArrayIndex = /^\d+$/.test(segment);

    let foundLine = -1;
    let foundIndent = currentIndent;

    if (isArrayIndex) {
      const targetIdx = parseInt(segment);
      let elementIdx = 0;

      for (let i = searchFrom; i < lines.length; i++) {
        const line = lines[i]!;
        if (!line.trim()) continue;

        const indent = line.length - line.trimStart().length;
        const trimmed = line.trimStart();

        // Left the scope — indent dropped to or below parent level
        if (indent < currentIndent && i > searchFrom) break;

        // Array item at the expected indent
        if (indent === currentIndent && trimmed.startsWith("- ")) {
          if (elementIdx === targetIdx) {
            foundLine = i;
            // Content after "- " is at indent + 2 for nested keys
            foundIndent = indent + 2;

            // Check if the array item itself has an inline key that's the NEXT segment
            if (!isLast) {
              const afterDash = trimmed.slice(2);
              const nextSegment = segments[si + 1];
              const inlineKeyMatch = afterDash.match(/^([^:]+):\s*(.*)/);
              if (inlineKeyMatch && nextSegment && inlineKeyMatch[1]!.trim() === nextSegment) {
                // Found the next segment inline on this same "- key: value" line
                si++; // consume the next segment too
                if (si === segments.length - 1) {
                  // This was the last segment — determine the range
                  const value = inlineKeyMatch[2]!.trim();
                  if (value && !value.startsWith("|") && !value.startsWith(">")) {
                    return { start: i, end: i };
                  }
                  return { start: i, end: findYamlValueEnd(lines, i, foundIndent) };
                }
                // More segments remain — continue searching after this line
                searchFrom = i + 1;
                currentIndent = foundIndent;
                foundLine = -1; // reset — handled via the outer loop continuing
                break;
              }
            }

            break;
          }
          elementIdx++;
        }
      }
    } else {
      for (let i = searchFrom; i < lines.length; i++) {
        const line = lines[i]!;
        if (!line.trim()) continue;

        const indent = line.length - line.trimStart().length;
        const trimmed = line.trimStart();

        // Left the scope
        if (indent < currentIndent && i > searchFrom) break;

        // Match "key:" at the expected indent
        if (indent === currentIndent) {
          const keyMatch = trimmed.match(/^([^:]+):\s*(.*)/);
          if (keyMatch) {
            const key = keyMatch[1]!.trim().replace(/^["']|["']$/g, "");
            if (key === segment) {
              foundLine = i;
              foundIndent = indent + 2;
              break;
            }
          }
        }
      }
    }

    if (foundLine === -1) return null;

    if (isLast) {
      const line = lines[foundLine]!;
      const trimmed = line.trimStart();

      // Check for scalar value on the same line
      if (trimmed.startsWith("- ")) {
        // Array item — check if it's just a scalar (no nested content)
        const afterDash = trimmed.slice(2);
        if (!afterDash.match(/^[^:]+:\s/)) {
          // Scalar array element
          return { start: foundLine, end: foundLine };
        }
      }

      const keyMatch = trimmed.match(/^([^:]+):\s*(.*)/);
      if (keyMatch) {
        const value = keyMatch[2]!.trim();
        if (value && !value.startsWith("|") && !value.startsWith(">")) {
          return { start: foundLine, end: foundLine };
        }
      }

      return { start: foundLine, end: findYamlValueEnd(lines, foundLine, currentIndent) };
    }

    searchFrom = foundLine + 1;
    currentIndent = foundIndent;
  }

  /* istanbul ignore next -- unreachable: loop always returns via isLast or foundLine check */
  return null;
}

/**
 * Find where a YAML value ends based on indentation.
 * Returns the last line that belongs to the value block (indent > keyIndent).
 */
function findYamlValueEnd(lines: string[], keyLine: number, keyIndent: number): number {
  let lastLine = keyLine;

  for (let i = keyLine + 1; i < lines.length; i++) {
    const line = lines[i]!;
    if (!line.trim()) continue;

    const indent = line.length - line.trimStart().length;
    if (indent <= keyIndent) break;
    lastLine = i;
  }

  return lastLine;
}
