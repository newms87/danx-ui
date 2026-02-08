/**
 * Language Normalization Utility
 *
 * Maps common language aliases (e.g., "js", "ts", "py") to their canonical names
 * used by the syntax highlighting system. Returns "text" as fallback for unknown
 * or empty inputs.
 */

const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  rb: "ruby",
  yml: "yaml",
  md: "markdown",
  sh: "bash",
  shell: "bash",
};

/** Normalize a language alias to its canonical name, falling back to "text" */
export function normalizeLanguage(lang?: string): string {
  if (!lang) return "text";
  return LANGUAGE_ALIASES[lang.toLowerCase()] || lang.toLowerCase();
}
