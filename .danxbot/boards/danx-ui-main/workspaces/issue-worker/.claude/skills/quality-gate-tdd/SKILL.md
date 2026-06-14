---
name: quality-gate-tdd
description: "MANDATORY when the dispatch prompt begins with `/quality-gate-tdd <PREFIX>-N`. Supplies the CRITERIA for the PRE-work TDD quality gate (DX-1178): a DESIGN-TIME review of the card's test plan — is every AC a checkable test, does the work decompose into red→green slices, are the testability seams present BEFORE any code exists (distinct from the post-code `test-reviewer` diff agent that audits coverage of a written diff). The dispatch runs AS the `quality-gate-reviewer` agent, which owns the shared protocol (read the card, read-only, single `quality_gate_complete` sign-off under `gate: \"tdd\"`, autonomous). This skill is the TDD-specific review dimensions + the pass/fail rule."
---

# Quality Gate — TDD (PRE-work test-plan review criteria)

You are running the **tdd** gate. You are the `quality-gate-reviewer` agent —
your agent definition owns the shared protocol (read the card via
`mcp__danx_dashboard__issue_get`, stay read-only on the repo, sign off EXACTLY
ONCE via `mcp__danxbot__quality_gate_complete`, never call `danxbot_complete`,
decide autonomously). This skill supplies the TDD-specific CRITERIA.

This is a **design-time** review — the work has not been implemented. You judge
whether the card can be BUILT test-first, not the coverage of a written diff
(that is the separate `test-reviewer` agent). The TDD gate is registry
`order: 3` — it dispatches only AFTER the Architecture gate (order 2) passes or
isn't required, so the design's soundness is already settled; your lens is
purely the TEST dimension. Ground seam claims in receipts — grep + read the
named files.

## What you review (priority order)

1. **AC-as-tests.** Is every acceptance criterion phrased as an observable,
   checkable behavior a test could pass or fail on? An AC like "the picker is
   robust" or "performance is acceptable" with no assertion handle is a
   blocking finding — name the AC and the checkable restatement it needs.
2. **Vertical-slice decomposition.** Does the work break into increments each
   independently provable by a failing-then-passing test, or is it a monolith
   only verifiable once everything lands? A plan with no incremental test path
   is a blocking finding.
3. **Testability seams.** Does the code the plan will touch sit behind a seam a
   test can reach in the layer the repo tests at — a pure helper that's
   extractable, a route that's hittable, a derivation function that's callable
   — without standing up the world? A seam the plan assumes but the codebase
   does not expose (and the plan does not cut) is a blocking finding with the
   `file:line` receipt.
4. **Fixture / determinism.** Can the behaviors under test be exercised
   deterministically? Unaddressed wall-clock / network / ordering
   nondeterminism that would make the tests flaky is a finding.
5. **Coverage honesty.** Does the plan lean on "verify in production" / "manual
   smoke" / "deploy then check" for anything a local test could assert? That is
   a blocking finding — every backend behavior is locally testable. Legitimate
   UI-frontend test exemptions (per the repo's test rules) are notes, not a
   license to wave through testable backend behavior.

## Decide

- **pass** — the card is buildable test-first: each AC is a checkable behavior,
  the work decomposes into red→green increments, and the seams those tests need
  exist (or are cleanly cut by the plan). A review with only minor notes is a
  pass.
- **fail** — at least one blocking testability problem WITH a receipt: an AC no
  test can assert as written, a monolithic plan with no incremental test path,
  a behavior verifiable only by deploy/manual-smoke when a local test would do,
  or a seam the plan assumes that the codebase does not expose. Style nits
  (test naming, file placement preferences) are NOT fail material — note them
  in the message and pass.

## Detail comment (optional)

For a `fail` with multi-point findings, append ONE comment to the card via
`mcp__danx_dashboard__issue_comment` titled `## TDD gate — findings` with the
numbered findings, so the human reviewing the blocked card sees the full
detail — the sign-off `message` carries the summary.

## Sign off

Sign off once (per your agent protocol) with `gate: "tdd"`. On `fail` the
`message` becomes the card's block reason — name each untestable AC / missing
seam and the restatement or seam each needs, for the human who will unblock.
