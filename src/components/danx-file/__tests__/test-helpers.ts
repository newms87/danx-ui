/**
 * Shared test helpers for DanxFile and DanxFileViewer tests.
 *
 * Provides a unified factory for creating PreviewFile test fixtures.
 */

import type { PreviewFile } from "../types";

/**
 * Create a test PreviewFile with sensible defaults.
 * Accepts either `(overrides?)` or `(id, overrides?)`.
 */
export function makeFile(overrides?: Partial<PreviewFile>): PreviewFile;
export function makeFile(id: string, overrides?: Partial<PreviewFile>): PreviewFile;
export function makeFile(
  idOrOverrides?: string | Partial<PreviewFile>,
  maybeOverrides?: Partial<PreviewFile>
): PreviewFile {
  const id = typeof idOrOverrides === "string" ? idOrOverrides : "1";
  const overrides = typeof idOrOverrides === "string" ? maybeOverrides : idOrOverrides;
  return {
    id,
    name: `file-${id}.jpg`,
    size: 1024,
    type: "image/jpeg",
    url: `https://example.com/${id}.jpg`,
    ...overrides,
  };
}

/** Create multiple test files with sequential IDs. */
export function makeFiles(count: number): PreviewFile[] {
  return Array.from({ length: count }, (_, i) => makeFile(String(i + 1)));
}

/** Create a child file variant. */
export function makeChild(id: string, overrides?: Partial<PreviewFile>): PreviewFile {
  return makeFile(id, { name: `child-${id}.jpg`, size: 512, ...overrides });
}
