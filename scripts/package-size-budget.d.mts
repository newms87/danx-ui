/**
 * Ambient types for package-size-budget.mjs.
 *
 * The budget lives in plain ESM because the prepublish script runs it under
 * bare node, which cannot import TypeScript. This declaration is what lets
 * npmPackOutput.test.ts import the same constants instead of hardcoding its
 * own copy — the drift that made a shared module necessary in the first place.
 */

/** Largest unpacked tarball accepted, in bytes. */
export const MAX_UNPACKED_BYTES: number;

/** Largest file count accepted in the tarball. */
export const MAX_FILE_COUNT: number;
