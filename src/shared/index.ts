/**
 * Shared Module Exports
 *
 * Re-exports shared types and utilities.
 */

export type * from "./types";
export * from "./composables/useVariant";
export * from "./syntax-highlighting";
export * from "./markdown";
// DXUI-35: formatters/index.ts eagerly imports luxon (datetime.ts/dateTimeParsers.ts/
// dateTimeTimezone.ts) — dropped from this barrel so "./shared" stays peer-free;
// consumers get all formatters (including datetime) via "danx-ui/formatters".
export type * from "./formatters/types";
export * from "./dataFormat";
export * from "./arrayUtils";
export * from "./nestedJson";
export * from "./hexColor";
export * from "./autoColor";
export * from "./uid";
export * from "./passwordStrength";
