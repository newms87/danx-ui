/**
 * Kbd Component Module
 *
 * Exports:
 * - DanxKbd: The keyboard-shortcut display component
 * - Types: TypeScript interfaces
 * - detectOs/resolveKeyLabel: pure helpers for OS-aware key label resolution
 */

export { default as DanxKbd } from "./DanxKbd.vue";
export { detectOs, resolveKeyLabel } from "./kbdKeyLabels";
export type { DanxKbdOs, DanxKbdProps } from "./types";
