---
name: quality-gate-architecture
description: "MANDATORY when the dispatch prompt begins with `/quality-gate-architecture <PREFIX>-N`. Supplies the CRITERIA for the PRE-work Architecture quality gate (DX-1177): a DESIGN-TIME review of the card's plan — description, AC, comments, and the files the plan names — against the live codebase, BEFORE any code exists (distinct from the post-code `architecture-reviewer` diff agent). The dispatch runs AS the `quality-gate-reviewer` agent, which owns the shared protocol (read the card, read-only, single `quality_gate_complete` sign-off under `gate: \"architecture\"`, autonomous). This skill is the architecture-specific review dimensions + the pass/fail rule."
---

# Quality Gate — Architecture (PRE-work design review criteria)

You are running the **architecture** gate. You are the `quality-gate-reviewer`
agent — your agent definition owns the shared protocol (read the card via
`mcp__danx_dashboard__issue_get`, stay read-only on the repo, sign off EXACTLY
ONCE via `mcp__danxbot__quality_gate_complete`, never call `danxbot_complete`,
decide autonomously). This skill supplies the architecture-specific CRITERIA.

This is a **design-time** review — the work has not been implemented. You judge
what the card SAYS will be built against what the codebase IS. (The post-code
diff review is the separate `architecture-reviewer` agent in the work
pipeline.) Ground every claim in a receipt — grep + read the named files.

## What you review (priority order)

1. **Core-principle conflicts.** Does the plan introduce or preserve a
   fallback, dual-shape branch, back-compat reader, silent default at read
   time, legacy alias, or graceful-degradation path? Does it write derived
   state directly instead of via triggers? Check the repo's CLAUDE.md core
   principles + `.claude/rules/` — a plan that contradicts one fails, with the
   principle named.
2. **Reality check.** Does every file / module / table / route the plan names
   actually exist in the shape the plan assumes? A plan built on a surface
   that was retired or never existed fails, with the `file:line` receipt that
   contradicts it.
3. **Boundary fit.** Does the work land in the right layer (service vs client,
   worker vs dashboard, write path vs read path)? Does it duplicate an
   existing capability instead of extending it (DRY / reuse-before-build)?
4. **Concurrency + lifecycle.** If the plan touches dispatch, pickup,
   busy-tracking, or lifecycle stamps: are the race windows tiled? Who owns
   each clear? Is there a livelock / double-spawn / orphan path the plan
   leaves unaddressed?
5. **Decomposition coherence.** Are the AC items satisfiable as written? Do
   phases cut vertically (each independently shippable)? Is anything so
   ambiguous a work agent would have to guess at the GOAL (not just the
   mechanics)?

## Decide

- **pass** — the plan is implementable as written: it names real files, fits
  the repo's invariants, introduces no fallback / dual-shape / legacy surface,
  and its phase/AC decomposition is coherent. A review with only minor notes
  is a pass.
- **fail** — at least one blocking design problem WITH a receipt: contradicts
  a core principle, builds on a surface that doesn't exist, re-introduces a
  retired pattern, couples layers the repo keeps separate, or is too ambiguous
  to implement without a human decision (goal-changing ambiguity is itself a
  blocking finding — name the question a human must answer). Style nits are
  NOT fail material — note them in the message and pass.

## Detail comment (optional)

For a `fail` with multi-point findings, append ONE comment to the card via
`mcp__danx_dashboard__issue_comment` titled `## Architecture gate — findings`
with the numbered findings (each with its receipt), so the human reviewing the
blocked card sees the full detail — the sign-off `message` carries the summary.

## Sign off

Sign off once (per your agent protocol) with `gate: "architecture"`. On `fail`
the `message` becomes the card's block reason — name each blocking problem and
the change that resolves it, for the human who will unblock.
