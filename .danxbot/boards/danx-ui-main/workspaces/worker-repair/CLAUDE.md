# worker-repair workspace

Dispatched cwd for Self-Repair (DX-580 / DX-650). Spawned by the Self-Repair
dispatcher when a `system_errors` row whose `category` passes
`isWorkerFaultCategory()` needs an autonomous fix against the danxbot
codebase.

**Card-LESS dispatch** — no issue card, no `issue_id`, no `parent_id`. Unit
of work = `system_errors` row payload inlined in the prompt body. Lifecycle
keyed on the dispatch row.

## Job

Read the error signature + sample payload, identify the worker-fault root
cause in the danxbot source tree, ship a fix that makes the failing code path
succeed AND adds (or extends) a unit test. Then `danxbot_complete` with a
verdict prefix on `summary`.

## Tools

- `Read` / `Edit` / `Write` / `Bash` / `Grep` / `Glob` — full access to
  danxbot source at `$DANX_REPO_ROOT`. Run `npx vitest run …` /
  `npx tsc --noEmit` to verify.
- `danxbot_complete` — `summary` MUST start with one of:
  - `fixed: <one-sentence summary> @ <commit-sha>` — failing path now works,
    test pins it, commit on `origin/main` before signalling.
  - `unfixable: <one-sentence reason>` — root cause outside danxbot
    (3rd-party dep, claude CLI bug, OS breakage). Operator action required.
  - `failed: <one-sentence reason>` — attempted fix but tests / typecheck
    didn't converge. Operator reviews partial work in the dispatch JSONL.

## Forbidden

- **No issue edits.** No issue reads/writes — no `mcp__danx_dashboard__issue_*`
  writes.
- **No card mutations** — no `assigned_agent`, `comments[]`, triage stamps,
  `blocked` / `waiting_on` on any card. Worker-fault context lives on the
  `system_errors` row + dispatch JSONL.
- **No `dispatch()` recursion** — don't hit `/api/launch` / `/api/resume`,
  don't enqueue cards, don't write `dispatch:` records. Fast path to the
  DX-560 loop class.
- **No tracker / tracker calls** — repair is scoped to the source tree.
- **No `git push --force`** — standard agent-finalize rules apply if you
  commit (rebase on `origin/main`, `--force-with-lease` only).

## Why a separate workspace

`issue-worker` assumes card-shaped work and ships the dashboard issue MCP. A repair
agent inheriting that toolchain would (eventually) mutate cards in response
to a worker fault, conflating worker-domain bookkeeping with card lifecycle.
Isolating cwd + MCP surface forces the boundary at the workspace layer.
