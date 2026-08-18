/**
 * Published-tarball size budgets (DXUI-39).
 *
 * These are REGRESSION TRIPWIRES, not product limits: each is an observed
 * baseline plus headroom, so an unexplained jump trips them while ordinary
 * growth does not. Recalibrating is legitimate when the library has genuinely
 * grown; silently raising them to hide bloat is not. Whenever you move a
 * number, re-derive it from a fresh `npm pack --dry-run --json` and update the
 * baseline note below with what it covers.
 *
 * Baseline as of the agent-chat release: ~2.08MB unpacked / ~1132 files,
 * covering ~60 components that each ship their own entry point and
 * declarations. The previous baseline (DXUI-170) was ~1.2MB / ~1130 files,
 * which predates roughly fifteen components — including the ones that pushed
 * past it.
 *
 * Single-sourced here because the budget is enforced twice: by the
 * `check:package-size` prepublish script and by npmPackOutput.test.ts. Those
 * two had already drifted apart (1150 vs 1100 files) before this module
 * existed.
 */

export const MAX_UNPACKED_BYTES = 2.5 * 1024 * 1024; // ~2.08MB observed + headroom
export const MAX_FILE_COUNT = 1300; // ~1132 observed + headroom
