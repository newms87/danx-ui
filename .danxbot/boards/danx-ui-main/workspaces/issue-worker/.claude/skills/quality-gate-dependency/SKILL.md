---
name: quality-gate-dependency
description: "MANDATORY when the dispatch prompt begins with `/quality-gate-dependency <PREFIX>-N`. Supplies the CRITERIA for the PRE-work Dependency quality gate (DX-1180, registry order 1 — before Architecture/TDD): compare the card against the CURRENT Ready + In-Progress set and record `depends_on` (one-way sequential precedence) XOR `conflict_on` (symmetric same-file mutex) edges per partner via `mcp__danx_dashboard__issue_dependency`. The dispatch runs AS the `quality-gate-reviewer` agent, which owns the shared protocol (read the card, read-only on the repo, single `quality_gate_complete` sign-off under `gate: \"dependency\"`, autonomous). This skill is the dependency-specific procedure + the pass/fail rule."
---

# Quality Gate — Dependency (PRE-work conflict/dependency detection criteria)

You are running the **dependency** gate. You are the `quality-gate-reviewer`
agent — your agent definition owns the shared protocol (read the candidate via
`mcp__danx_dashboard__issue_get`, stay read-only on the repo, sign off EXACTLY
ONCE via `mcp__danxbot__quality_gate_complete`, never call `danxbot_complete`,
decide autonomously). This skill supplies the dependency-specific procedure.

This gate is **pure issue-level reasoning** — you read cards and write edges
through MCP only. No codebase read, no git. The ONE repo-state mutation this
gate makes (allowed alongside the read-only-on-repo rule) is recording
`issue_dependency` edges (+ an optional summary comment).

## The two edge primitives (pick exactly one per partner, or neither)

| Relationship | Edge | When |
|---|---|---|
| **One-way sequential precedence** | `depends_on` | The candidate consumes a partner's OUTPUT that must LAND FIRST (schema, package, migration, API the partner ships). The reverse is NOT true — the partner could ship without the candidate. |
| **Symmetric file-overlap mutex** | `conflict_on` | Candidate + partner touch the SAME file(s)/region but neither waits on the other's output. Either could ship first; the second rebases on the first. |
| **Unrelated** | none | No shared output dependency and no file overlap. |

`depends_on` and `conflict_on` are **mutually exclusive per pair** — one or the
other or neither, never both. Sequential phase ordering ("Phase 2 needs Phase 1
to ship first") is `depends_on`, NOT `conflict_on`. Same-file overlap between
siblings that could ship in any order is `conflict_on`, NOT `depends_on`.

## Procedure

### Step 1 — Learn the candidate's scope

From the card you read: `description` + `ac[]` + every `comments[]` entry +
`parent_id` (shared-epic context) + every file path named anywhere.

### Step 2 — Read the CURRENT Ready + In-Progress set (freshness — DX-1144)

`mcp__danx_dashboard__issue_list({status_derived: "ToDo"})` and
`mcp__danx_dashboard__issue_list({status_derived: "In Progress"})` (board is
implicit — the dispatch's board). These are the live partners. **Review-status
cards are NOT compared** — each is evaluated when it itself transitions toward
ToDo. Re-derive the partner set FRESH every run (including resume): a partner
that was In Progress earlier may have shipped since; never reuse a verdict from
your own earlier transcript. Defensive cap: read at most ~30 partners; if the
list is larger, prioritize same-epic siblings + cards naming overlapping files.

### Step 3 — Decide + record one edge per related partner

For each partner (skip the candidate's own id), `issue_get` it when you need
its file scope, decide `depends_on` XOR `conflict_on` XOR neither per the table
above, and record any edge via:

```
mcp__danx_dashboard__issue_dependency({
  id: "<PREFIX>-N",                 // the candidate
  action: "add",
  kind: "depends_on" | "conflict_on",
  target_id: "<partner id>",
  reason: "<one sentence naming the shared output or the overlapping file/module>",
})
```

The add is idempotent (re-adding a live triple returns the existing edge) and
cycle-checked (a `depends_on` that would loop is refused — record the other
direction or leave it). **Never REMOVE an edge** because a partner went
terminal or left progress (CP2/DX-810): the edge is a permanent "relates to"
fact; dispatch-freedom is re-derived from the partner's CURRENT status by
`deriveDispatchable`, and a still-set edge whose gate later clears is correct,
not stale.

### Step 4 — Summary comment (optional)

If you recorded ≥1 edge, append ONE comment via
`mcp__danx_dashboard__issue_comment` titled `## Dependency gate — edges`
listing each `{partner, kind, reason}` so the board shows why the card waits.

## Decide

**`pass` is almost always correct** — it means the gate RAN: you evaluated the
live set and recorded the edges. A recorded blocking edge does NOT make this a
`fail`. The edges themselves hold a conflicted card non-dispatchable (the
worker's `pass` release clears the dispatch but `deriveDispatchable` then sees
the `depends_on`/`conflict_on` partner and keeps the card off the picker until
that partner is terminal/idle) — the gate never blocks the card to encode a
conflict.

Reserve **`fail`** for the rare case the candidate's spec is so malformed the
comparison cannot run meaningfully (contradictory AC, references to cards that
cannot exist) — `fail` blocks the card for a human, so use it only for a
genuine human-decision blocker, never to represent a detected conflict.

## Sign off

Sign off once (per your agent protocol) with `gate: "dependency"` — `message`
states which partners were compared + the edges recorded, or "no related live
cards". On a `fail` the `message` becomes the card's block reason.
