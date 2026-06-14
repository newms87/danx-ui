# issue-worker workspace

Dispatched cwd for the danxbot poller. Issues live in the dashboard database —
read and write them via the `mcp__danx_dashboard__*` MCP tools (package
`@thehammer/danx-dashboard-mcp`). Full workflow: `danxbot:danx-next` skill.

## Path placeholder — `$DANX_REPO_ROOT`

ONE source of truth for absolute paths. Always populated in agent bash (DX-660).
Use it for every Read / Edit / Write / Bash path.

- Agent-bound dispatch → `<repo>/.danxbot/worktrees/<name>` (worktree).
- Workspace-mode (no `agent` field) → main clone path.

When plugin-skill bodies use `<worktree>`, substitute `$DANX_REPO_ROOT`. Do NOT
walk through `repos/<name>` symlinks — Claude's read-before-edit gate keys on
the literal path string. `$DANX_AGENT_WORKTREE` exists for the worktree-guard
hook only; agents don't reference it.

## Git env — worker owns the PRE-spawn sync; you own the terminal merge (DX-1154)

The worker brought your worktree to `origin/main` deterministically BEFORE
spawning you (`src/dispatch/worktree-ff.ts`: fetch → commit-first if dirty →
ff/rebase). So your tree is **already at `origin/main`** — you run ZERO
pre-task git. No fetch, no rebase, no sync; dive straight into the work.

If the worker could NOT bring the tree across cleanly (a true rebase conflict /
divergence), it would have spawned a separate `worktree-maintenance` dispatch
(the `danxbot:danx-worktree-maintenance` skill) to resolve it FIRST, and only
then dispatched your work on the cleaned tree. You never see a conflicted tree.

The work dispatch is **ZERO-PREP**: your task body is `/danx-next` alone —
dive straight into the work. Conflict / dependency detection is the Dependency
PRE quality gate (DX-1180), card-sanity is the work pass + the Architecture
gate, and env-broken self-block is your own
`danxbot_complete({status:"failed"})`. `agents.<name>.broken` is reachable from
EXACTLY one path: N consecutive agent-emitted `failed` strikes
(`src/agent/strikes.ts`) — a worker git failure never stamps it.

## Quality gate — run a required `code` gate BEFORE finalize (DX-1179, DX-1206)

Some cards carry a required POST **`code`** quality gate. After your code is
complete and tests pass, but BEFORE `agent-finalize.sh`, read the card's gate
state via `mcp__danx_dashboard__issue_get({id})` and look at `quality_gates[]`.
The `required` field is the EFFECTIVE flag — the board master switch AND the
card's own opt-in, already AND-ed server-side — so key strictly on it:

- A `{gate: "code", required: true, status: "pending" | "fail"}` row → invoke
  the **`/quality-gate-code <CARD-ID>`** skill. It runs the `code-reviewer`
  sub-agent over your diff and signs off via
  `quality_gate_complete({gate: "code", …})`. UNLIKE a PRE gate (a separate
  dispatch), this runs **INLINE in your session** — after the sign-off you
  CONTINUE to finalize + complete (the gate call does NOT end your dispatch).
- `required: false` (the board has not enabled `code`, or the card did not opt
  in), OR `status` already `pass` → skip; no code review needed.

`issue_transition({action: "complete"})` REFUSES (409, `failed_gate:
"quality_gate_post"`, `failed_post_gates[]`) while a required `code` gate row is
not `pass` — a required gate is NOT optional, so you cannot complete the card
without a pass sign-off. Run the gate, address any blocking findings, re-run to
a pass, THEN finalize.

**Post-task sync** — before `danxbot_complete`, run the finalize script (this
is STILL your job — the worker owns the pre-spawn sync, you own the terminal
merge to `origin/main`):

```
bash .danxbot/scripts/agent-finalize.sh <AGENT> <CARD-ID> "<title>" "<bullet>" ...
```

It WIP-commits, rebases on `origin/main`, squashes ahead-commits into ONE
`feat(<CARD-ID>): <title>` Conventional Commit, pushes `HEAD:main` with race
retries (5 max), resets local agent branch to the pushed sha, fast-forwards
`origin/<agent>` (DX-644). Capture `PUSHED <sha>` from stdout into
`retro.commits[]`. Exit codes: 0 PUSHED, 1 rebase conflict, 2 push race
exhausted, 64 usage, 65 wrong branch, NO_OP for docs-only.

**Pre-`danxbot_complete` checklist:**

- `git status --porcelain` empty.
- Branch rebased on `origin/main` (finalize exit 0 guarantees), OR candidate
  card carries `waiting_on` / `conflict_on` gate (Done off the table).
- `agent-finalize.sh` stdout has `PUSHED <sha>` matching `retro.commits[]`;
  `git log origin/main --grep=<CARD-ID>` shows it upstream. Hand-rolled
  `git push HEAD:main` skips the squash + race-loop — FORBIDDEN.

Calling complete on a dirty tree or without finalize ships Done with no commit
on `origin/main`. Workflow violation; danx-next Step 11 is the same gate.

## Skill triggers

| Trigger | Skill |
|---|---|
| Set `status: "Blocked"` / populate `blocked: {reason,...}` / append `## Blocked` comment / `danxbot_complete({status:"failed"})` with operator-must-X framing | `danxbot:issue-blocker` |
| Block reason is "pre-existing flaky test" / "manual UI smoke" / "post-`danxbot_complete` self-derived state" | `danxbot:no-false-blockers` |
| Picking up a card whose `status: Blocked` or `waiting_on` is non-null | `danxbot:unblock` |
| Card carries a required `code` quality gate (`issue_get` → `quality_gates[]` `{gate:"code", required:true, status != "pass"}`) — run AFTER code is complete, BEFORE `agent-finalize.sh` | `/quality-gate-code` |

DX-272 retired the legacy `.claude/rules/danx-*.md` + `.claude/skills/{danx-*,issue-blocker}/`
inject paths in favor of the `danxbot@newms-plugins` plugin (enabled in
`.claude/settings.json`).

## Verification tools (use these BEFORE Blocked)

Invoke `danxbot:no-false-blockers` first. Programmatic substitutes exist for
"operator-only-looking" verification:

- **Dashboard auth** (host-mode): bearer at `~/.config/danxbot/dashboard-token`.
  Hit `http://localhost:5566/api/*` (Vite proxy) or `:5555/api/*` (direct).
  Sanity: `curl -H "Authorization: Bearer $(cat ~/.config/danxbot/dashboard-token)" http://localhost:5555/api/auth/me` → `{"user":{"username":"monitor"}}`.
- **Playwright MCP** (`mcp__playwright__*`) for browser-driven smoke. Inject
  bearer/cookie before navigating.
- **Dashboard component tests** for "renders X when Y" ACs:
  `cd dashboard && npx vitest run <path>` — deterministic, browser-free.
