/**
 * Code Format Composable
 *
 * Provides format conversion, validation, and parsing for the CodeViewer component.
 * Supports JSON/YAML as structured formats with bidirectional conversion,
 * and text/markdown/html/css/javascript as pass-through string formats.
 *
 * Depends on the `yaml` npm package for YAML parsing/stringification.
 */

import { computed, ref, Ref } from "vue";
import { parse as parseYAML, stringify as yamlStringify } from "yaml";
import type { CodeFormat, ValidationError } from "./types";

export interface UseCodeFormatOptions {
  initialFormat?: CodeFormat;
  initialValue?: object | string | null;
}

export interface UseCodeFormatReturn {
  format: Ref<CodeFormat>;
  rawContent: Ref<string>;
  parsedValue: Ref<object | null>;
  formattedContent: Ref<string>;
  isValid: Ref<boolean>;
  setFormat: (format: CodeFormat) => void;
  setContent: (content: string) => void;
  setValue: (value: object | string | null) => void;
  parse: (content: string) => object | null;
  formatValue: (value: object | null, targetFormat?: CodeFormat) => string;
  validate: (content: string, targetFormat?: CodeFormat) => boolean;
  validateWithError: (content: string, targetFormat?: CodeFormat) => ValidationError | null;
}

/** Formats that are always valid (no structural validation). */
const STRING_FORMATS: CodeFormat[] = ["text", "markdown", "css", "javascript", "html", "vue"];

/** Pretty-print a JSON value with 2-space indentation. Only called with non-null objects from formatValueToString. */
function fJSON(value: object): string {
  return JSON.stringify(value, null, 2);
}

/** Strip optional markdown code fence wrappers from a string. */
function stripMarkdownCodeFence(str: string): string {
  return str.replace(/^```[a-z0-9]{0,6}\s/, "").replace(/```$/, "");
}

/** Try to parse a string as JSON (stripping markdown fences first). Returns false on failure. */
function parseMarkdownJSON(str: string): object | false {
  try {
    return JSON.parse(stripMarkdownCodeFence(str));
  } catch {
    return false;
  }
}

/** Try to parse a string as YAML (stripping markdown fences first). Returns false on failure. */
function parseMarkdownYAML(str: string): object | undefined | false {
  try {
    return parseYAML(stripMarkdownCodeFence(str)) || undefined;
  } catch {
    return false;
  }
}

function isStringFormat(fmt: CodeFormat): boolean {
  return STRING_FORMATS.includes(fmt);
}

export function useCodeFormat(options: UseCodeFormatOptions = {}): UseCodeFormatReturn {
  const format = ref<CodeFormat>(options.initialFormat ?? "yaml");
  const rawContent = ref("");

  /** Parse any string (JSON or YAML) to object */
  function parseContent(content: string): object | null {
    if (!content) return null;

    const jsonResult = parseMarkdownJSON(content);
    if (jsonResult !== false && typeof jsonResult === "object" && jsonResult !== null) {
      return jsonResult;
    }

    const yamlResult = parseMarkdownYAML(content);
    if (typeof yamlResult === "object" && yamlResult !== null && yamlResult !== undefined) {
      return yamlResult;
    }

    return null;
  }

  /** Format object to string in the specified format */
  function formatValueToString(
    value: object | string | null,
    targetFormat: CodeFormat = format.value
  ): string {
    if (!value) return "";

    if (isStringFormat(targetFormat)) {
      return typeof value === "string" ? value : JSON.stringify(value, null, 2);
    }

    try {
      const obj = typeof value === "string" ? parseContent(value) : value;
      // When !obj, value is always a string (objects pass through as obj=value which is truthy)
      if (!obj) return value as string;

      if (targetFormat === "json") {
        return fJSON(obj);
      } else {
        return yamlStringify(obj as object);
      }
    } catch {
      return typeof value === "string" ? value : JSON.stringify(value, null, 2);
    }
  }

  /** Validate string content for a format */
  function validateContent(content: string, targetFormat: CodeFormat = format.value): boolean {
    if (!content) return true;
    if (isStringFormat(targetFormat)) return true;

    try {
      if (targetFormat === "json") {
        JSON.parse(content);
      } else {
        parseYAML(content);
      }
      return true;
    } catch {
      return false;
    }
  }

  /** Validate and return error details if invalid */
  function validateContentWithError(
    content: string,
    targetFormat: CodeFormat = format.value
  ): ValidationError | null {
    if (!content) return null;
    if (isStringFormat(targetFormat)) return null;

    try {
      if (targetFormat === "json") {
        JSON.parse(content);
      } else {
        parseYAML(content);
      }
      return null;
    } catch (e: unknown) {
      const error = e as Error & { linePos?: { line: number; col: number }[] };
      let line: number | undefined;
      let column: number | undefined;

      // YAML errors from 'yaml' library have linePos
      if (error.linePos && error.linePos[0]) {
        line = error.linePos[0].line;
        column = error.linePos[0].col;
      }

      // JSON parse errors - try to extract position from message
      if (targetFormat === "json" && error.message) {
        const posMatch = error.message.match(/position\s+(\d+)/i);
        if (posMatch?.[1]) {
          const pos = parseInt(posMatch[1], 10);
          const lines = content.substring(0, pos).split("\n");
          line = lines.length;
          const lastLine = lines[lines.length - 1];
          column = lastLine.length + 1;
        }
      }

      return {
        message: error.message,
        line,
        column,
      };
    }
  }

  // Initialize with value if provided
  if (options.initialValue) {
    rawContent.value = formatValueToString(options.initialValue, format.value);
  }

  const parsedValue = computed(() => parseContent(rawContent.value));

  const formattedContent = computed(() => {
    if (isStringFormat(format.value)) {
      return rawContent.value;
    }
    return formatValueToString(parsedValue.value, format.value);
  });

  const isValid = computed(() => validateContent(rawContent.value, format.value));

  function setFormat(newFormat: CodeFormat) {
    if (format.value === newFormat) return;
    const obj = parsedValue.value;
    format.value = newFormat;
    if (obj) {
      rawContent.value = formatValueToString(obj, newFormat);
    }
  }

  function setContent(content: string) {
    rawContent.value = content;
  }

  function setValue(value: object | string | null) {
    rawContent.value = formatValueToString(value, format.value);
  }

  return {
    format,
    rawContent,
    parsedValue,
    formattedContent,
    isValid,
    setFormat,
    setContent,
    setValue,
    parse: parseContent,
    formatValue: formatValueToString,
    validate: validateContent,
    validateWithError: validateContentWithError,
  };
}
