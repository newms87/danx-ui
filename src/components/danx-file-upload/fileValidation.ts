/**
 * File Validation Utilities
 *
 * Pure validation functions for file type checking against accept strings.
 * Extracted from useFileUpload for reuse and testability.
 */

/**
 * Check whether a file's MIME type matches an accept filter string.
 * Supports three patterns:
 *   - Extension match: ".pdf" → file.name ends with ".pdf"
 *   - Wildcard MIME: "image/*" → file.type starts with "image/"
 *   - Exact MIME: "application/pdf" → file.type === "application/pdf"
 *
 * @param file - The browser File to validate
 * @param accept - Comma-separated accept string (e.g. "image/*,.pdf")
 * @returns true if the file matches at least one pattern
 */
export function isAcceptedType(file: File, accept: string | undefined): boolean {
  if (!accept) return true;

  const types = accept.split(",").map((t) => t.trim());
  for (const type of types) {
    if (type.startsWith(".")) {
      if (file.name.toLowerCase().endsWith(type.toLowerCase())) return true;
    } else if (type.endsWith("/*")) {
      const prefix = type.slice(0, -1);
      if (file.type.startsWith(prefix)) return true;
    } else {
      if (file.type === type) return true;
    }
  }
  return false;
}
