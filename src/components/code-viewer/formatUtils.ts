/**
 * Format Cycling Utilities
 *
 * Determines which code formats can be cycled between for a given format.
 * YAML/JSON cycle together; text/markdown cycle together; other formats don't cycle.
 */

import type { CodeFormat } from "./types";

/**
 * Get available formats that can be cycled through based on current format.
 * YAML/JSON formats cycle between each other only.
 * Text/Markdown formats cycle between each other only.
 * Other formats don't cycle.
 */
export function getAvailableFormats(format: CodeFormat): CodeFormat[] {
  if (format === "json" || format === "yaml") {
    return ["yaml", "json"];
  }
  if (format === "text" || format === "markdown") {
    return ["text", "markdown"];
  }
  return [format];
}
