/**
 * Structured Data Format Preference
 *
 * Persists the user's preferred display format (JSON or YAML) for auto-detected
 * structured data blocks. Only applies to unfenced blocks — fenced code blocks
 * always render in their declared language.
 *
 * Uses localStorage key "dx-structured-data-format".
 */

const STORAGE_KEY = "dx-structured-data-format";

/** Valid structured data formats */
export type StructuredDataFormat = "json" | "yaml";

/** Type guard: returns true if the format is a structured data format (json or yaml). */
export function isStructuredDataFormat(format: string): format is StructuredDataFormat {
  return format === "json" || format === "yaml";
}

/**
 * Get the user's preferred format for auto-detected structured data blocks.
 * Returns null if no preference has been set.
 */
export function getPreferredStructuredDataFormat(): StructuredDataFormat | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value && isStructuredDataFormat(value)) return value;
    return null;
  } catch {
    return null;
  }
}

/**
 * Set the user's preferred format for auto-detected structured data blocks.
 */
export function setPreferredStructuredDataFormat(format: StructuredDataFormat): void {
  try {
    localStorage.setItem(STORAGE_KEY, format);
  } catch {
    // Silently ignore storage errors (private browsing, quota exceeded)
  }
}
