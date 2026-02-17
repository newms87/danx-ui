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
 * Tracks the current path by watching for key patterns and brace depth changes.
 * When the target path is found, determines the end by matching closing braces
 * at the same indent level (for objects/arrays) or the same line (for scalars).
 */
function findJsonRange(lines: string[], path: string): LineRange | null {
  const segments = parsePath(path);
  if (!segments.length) return null;

  // Build a path stack by walking the JSON lines
  const stack: string[] = [];
  const arrayIndexStack: number[] = [];
  // Track whether each depth level is an array
  const isArrayStack: boolean[] = [];

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx]!;
    const trimmed = line.trimStart();

    // Skip empty lines
    if (!trimmed) continue;

    // Check for key: value pattern ("key": ...)
    const keyMatch = trimmed.match(/^"([^"]+)"\s*:/);

    if (keyMatch) {
      // Pop to the correct depth — the indent tells us where we are
      const indent = line.length - trimmed.length;
      const depth = indent / 2;

      // Trim stack to current depth (keys at depth N replace previous keys at depth N)
      while (stack.length > depth) {
        stack.pop();
        if (isArrayStack.length > stack.length) {
          isArrayStack.pop();
          arrayIndexStack.pop();
        }
      }

      stack.push(keyMatch[1]!);

      // Check if this matches our target path
      if (simplePathMatches(stack, segments)) {
        // Found it — determine the end line
        const endLine = findJsonValueEnd(lines, lineIdx);
        return { start: lineIdx, end: endLine };
      }

      // Check if this line opens an array or object
      const afterColon = trimmed.slice(keyMatch[0].length).trim();
      if (afterColon === "[" || afterColon === "[{") {
        isArrayStack.push(true);
        arrayIndexStack.push(0);
      } else if (afterColon === "{") {
        isArrayStack.push(false);
        arrayIndexStack.push(0);
      }
    } else if (trimmed === "{" || trimmed === "[") {
      // Opening brace/bracket without a key (array element or root)
      // If inside an array, this is an array element
    } else if (trimmed.startsWith("}") || trimmed.startsWith("]")) {
      // Closing brace/bracket
      const indent = line.length - trimmed.length;
      const depth = indent / 2;

      while (stack.length > depth) {
        stack.pop();
      }
      if (isArrayStack.length > stack.length) {
        isArrayStack.pop();
        arrayIndexStack.pop();
      }

      // If this closes an array element and there's a comma, increment index
      if (
        trimmed.startsWith("}") &&
        isArrayStack.length > 0 &&
        isArrayStack[isArrayStack.length - 1]
      ) {
        if (trimmed.includes(",")) {
          arrayIndexStack[arrayIndexStack.length - 1]!++;
        }
      }
    } else {
      // Array element (scalar in array)
      if (isArrayStack.length > 0 && isArrayStack[isArrayStack.length - 1]) {
        const currentIdx = arrayIndexStack[arrayIndexStack.length - 1]!;
        const testStack = [...stack, String(currentIdx)];
        if (simplePathMatches(testStack, segments)) {
          return { start: lineIdx, end: lineIdx };
        }
        if (trimmed.endsWith(",")) {
          arrayIndexStack[arrayIndexStack.length - 1]!++;
        }
      }
    }
  }

  return null;
}

function simplePathMatches(stack: string[], segments: string[]): boolean {
  if (stack.length !== segments.length) return false;
  return stack.every((s, i) => s === segments[i]);
}

/**
 * Find where a JSON value ends given its key line.
 * For scalars, returns the same line. For objects/arrays, finds the matching closer.
 */
function findJsonValueEnd(lines: string[], keyLine: number): number {
  const line = lines[keyLine]!;
  const trimmed = line.trimStart();
  const afterColon = trimmed.slice(trimmed.indexOf(":") + 1).trim();

  // Scalar value — same line
  if (!afterColon.startsWith("{") && !afterColon.startsWith("[")) {
    return keyLine;
  }

  // Object or array — find matching closer
  let depth = 0;

  for (let i = keyLine; i < lines.length; i++) {
    const l = lines[i]!;
    for (const ch of l) {
      if (ch === "{" || ch === "[") depth++;
      if (ch === "}" || ch === "]") depth--;
    }
    if (depth === 0) return i;
  }

  // Shouldn't happen with valid JSON, but return key line as fallback
  return keyLine;
}

/**
 * Find the line range for a property path in YAML output.
 *
 * Uses indentation to track depth. Keys are unquoted. Array items start with "- ".
 */
function findYamlRange(lines: string[], path: string): LineRange | null {
  const segments = parsePath(path);
  if (!segments.length) return null;

  const stack: { key: string; indent: number }[] = [];
  let arrayIndex = -1;
  let arrayIndent = -1;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx]!;
    if (!line.trim()) continue;

    const indent = line.length - line.trimStart().length;
    const trimmed = line.trimStart();

    // Pop stack entries at same or deeper indent
    while (stack.length > 0 && stack[stack.length - 1]!.indent >= indent) {
      const popped = stack.pop()!;
      if (popped.indent === arrayIndent) {
        arrayIndex = -1;
        arrayIndent = -1;
      }
    }

    // Array item
    if (trimmed.startsWith("- ")) {
      arrayIndent = indent;
      arrayIndex = 0;

      // Check if the array index matches a segment
      const currentPath = stack.map((s) => s.key);
      currentPath.push(String(arrayIndex));

      // Array item might have an inline key: "- key: value"
      const afterDash = trimmed.slice(2);
      const inlineKeyMatch = afterDash.match(/^([^:]+):\s*(.*)/);

      if (inlineKeyMatch) {
        const inlineKey = inlineKeyMatch[1]!.trim();
        currentPath.push(inlineKey);

        if (simplePathMatches(currentPath, segments)) {
          const endLine = findYamlValueEnd(lines, lineIdx, indent + 2);
          return { start: lineIdx, end: endLine };
        }

        // Push the array index as a stack entry for nested keys
        stack.push({ key: String(arrayIndex), indent: indent });
        stack.push({ key: inlineKey, indent: indent + 2 });
      } else {
        if (simplePathMatches(currentPath, segments)) {
          const endLine = findYamlValueEnd(lines, lineIdx, indent);
          return { start: lineIdx, end: endLine };
        }
        stack.push({ key: String(arrayIndex), indent: indent });
      }

      continue;
    }

    // Regular key: value
    const keyMatch = trimmed.match(/^([^:]+):\s*(.*)/);
    if (keyMatch) {
      const key = keyMatch[1]!.trim().replace(/^["']|["']$/g, "");
      stack.push({ key, indent });

      const currentPath = stack.map((s) => s.key);

      if (simplePathMatches(currentPath, segments)) {
        const value = keyMatch[2]!.trim();
        if (value && !value.startsWith("|") && !value.startsWith(">")) {
          // Scalar on same line
          return { start: lineIdx, end: lineIdx };
        }
        // Block value or nested object — find end by indentation
        const endLine = findYamlValueEnd(lines, lineIdx, indent);
        return { start: lineIdx, end: endLine };
      }
    }
  }

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
    if (!line.trim()) {
      // Blank lines might be part of the block
      continue;
    }

    const indent = line.length - line.trimStart().length;
    if (indent <= keyIndent) {
      break;
    }
    lastLine = i;
  }

  return lastLine;
}
