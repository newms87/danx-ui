---
name: quality-gate-code
description: "MANDATORY when the dispatch prompt invokes `/quality-gate-code <PREFIX>-N`, AND auto-invoked by the work agent when a card carries a required POST `code` quality gate (DX-1179). Runs the POST-work Code-review gate INLINE in the work session — AFTER the code is complete and tests pass, BEFORE `agent-finalize.sh`. Dispatches the existing `code-reviewer` sub-agent over your own diff, fixes any blocking findings, then signs off exactly once via `mcp__danxbot__quality_gate_complete({gate: \"code\", status: \"pass\"|\"fail\", message, findings})`. UNLIKE the PRE architecture gate, this sign-off is NOT terminal — it stamps the gate row + stores the findings and your dispatch KEEPS RUNNING; you CONTINUE to `agent-finalize.sh` and `issue_transition complete` (which refuses while the required `code` gate row is not `pass`). NEVER call `danxbot_complete` from this skill."
---

# Quality Gate — Code review (POST-work, inline in the work session)

You are the WORK agent, partway through a `/danx-next` dispatch. The card
named in `/quality-gate-code <PREFIX>-N` carries a required POST **`code`**
quality gate. Your code is written and your tests pass; now — BEFORE
`agent-finalize.sh` — you run the code-review gate over your own diff and
sign it off.

This is a **post-code diff review** (the existing `code-reviewer` agent's
home turf), distinct from the PRE design-time `architecture` gate. And
unlike a PRE gate, it runs **inline in your work session** — there is no
separate gate dispatch, and the sign-off does NOT end your dispatch.

## When this gate applies (and when to skip)

Read the card via `mcp__danx_dashboard__issue_get({id: "<PREFIX>-N"})` and
inspect `quality_gates[]`. The `required` field on each row is the
**EFFECTIVE** requirement — the server has already AND-ed the board master
switch with the card's own opt-in (`board-enabled AND card-flagged`). Key
STRICTLY on it; never re-derive from "the board has the gate enabled" alone
(a board-enabled gate is silent on a card that did not opt in).

- A `{gate: "code", required: true, status: "pending" | "fail"}` row → run
  this gate.
- `required: false` (the board has not enabled `code`, OR the card did not
  opt in), OR `status` already `pass` → SKIP. Return to the `/danx-next`
  flow and finalize as normal. Do not sign off a gate the card does not owe.

## Hard boundaries

- **NOT terminal.** `quality_gate_complete` here stamps the gate row +
  stores the findings and RETURNS — your work dispatch keeps running. After
  it, CONTINUE the `/danx-next` flow: `agent-finalize.sh`, then
  `issue_transition({action: "complete"})`, then `danxbot_complete`. Do NOT
  call `danxbot_complete` from inside this skill, and do NOT stop output.
- **Sign off `pass` only when clean.** If the reviewer finds blocking
  problems, FIX them in this session, re-run the reviewer, and only then
  sign `pass`. A `fail` sign-off does NOT block the card by itself, but
  `issue_transition complete` will REFUSE while the row is not `pass`
  (`failed_gate: "quality_gate_post"`), so an unfixed `fail` leaves you
  unable to complete — sign `fail` only when you genuinely cannot resolve
  the findings and intend to self-block (`danxbot:issue-blocker`).
- **No interactive prompts** — `danxbot:autonomous-mode` applies. Decide
  pass/fix-then-pass/self-block unilaterally.

## Procedure

### Step 1 — Run the review over your diff

Preferred mode: launch the **`code-reviewer`** sub-agent via the Agent tool
(`subagent_type: "code-reviewer"`). Point it at your working-tree diff
(`git diff origin/main...HEAD` plus uncommitted changes) and the card's
goal. It reads read-only and returns findings.

Inline mode: when `code-reviewer` is not resolvable in this session
(connected repos whose `.claude/agents/` does not carry the definition —
danxbot never writes into a connected repo's `.claude/`), run the SAME
review yourself against the repo's quality bar (CLAUDE.md core principles —
fallbacks / dual shapes / legacy / dead code; DRY/SOLID; test coverage;
fail-loud error handling).

### Step 2 — Address blocking findings

For every BLOCKING finding, fix it now (you are the work agent — you own the
diff). Re-run the reviewer until no blocking findings remain. Advisory /
nice-to-have findings may stay as recorded notes.

### Step 3 — Sign off (NON-terminal)

```
mcp__danxbot__quality_gate_complete({
  gate: "code",
  status: "pass",          // "fail" only when self-blocking on unresolved findings
  message: "<one-line verdict summary>",
  findings: [
    { title: "<short label>", description: "<what>", status: "<blocking|advisory|resolved>", reasoning: "<why / what changed>" },
    ...
  ],
})
```

- `findings` is the structured reviewer output — it lands on the card
  (`issue_code_review_items`) and renders in the drawer. Pass `[]` (or omit)
  for a clean review with nothing worth recording.
- `message` is the one-line verdict the gate chip shows.

The tool returns `{phase: "post", findingsStored: N}` and your dispatch
keeps running.

### Step 4 — Continue the work flow

Return to `/danx-next`: run `bash .danxbot/scripts/agent-finalize.sh …`,
then `issue_transition({action: "complete"})` (now unblocked — the `code`
gate row is `pass`), fill the retro, and call `danxbot_complete`. The
code-review gate is one step inside that flow, not a replacement for it.
