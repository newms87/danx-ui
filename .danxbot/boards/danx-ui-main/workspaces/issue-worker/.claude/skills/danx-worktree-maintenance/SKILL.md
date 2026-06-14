---
name: danx-worktree-maintenance
description: "MANDATORY when the dispatch prompt is `/danx-worktree-maintenance <PREFIX>-N`. The worker's pre-spawn deterministic sync (`src/dispatch/worktree-ff.ts`) could not bring this agent's worktree to `origin/main` cleanly (true rebase conflict, divergence, or a fetch failure), so it dispatched YOU — a reasoning-only conflict-resolution agent — INSTEAD of the work agent. Your ONLY job: rebase the worktree onto `origin/main`, resolve conflicts in place file-by-file, push the agent branch, then RELEASE the card non-terminally via `issue_transition({action: 'rollback_pickup'})` so the next tick fires the real work dispatch on the now-clean tree. You do ZERO card work and you NEVER run `agent-finalize.sh` (the work agent is the sole `origin/main` finalizer — CP4/DX-944). Destructive git ops (`git stash`, `git reset --hard`, `git checkout <ref>`, `git restore`, `git clean -f`, `git rebase --abort`) are BANNED — commit-first + resolve-in-place are the only primitives. If a conflict region is genuinely unreconcilable, self-block via `danxbot_complete({status: 'failed', summary})` (≥ 30 chars)."
---

# Danx Worktree Maintenance

You were dispatched with `/danx-worktree-maintenance <PREFIX>-N`. The worker's
pre-spawn deterministic sync (DX-1154, `tryBringWorktreeToMain` in
`src/dispatch/worktree-ff.ts`) tried to bring this agent's worktree to
`origin/main` and could NOT do it cleanly — a true rebase conflict,
divergence, or a fetch failure. Rather than abort the spawn or stamp the
agent broken (the real DX-755 bug — never again), the worker handed the
problem to YOU: a reasoning agent that resolves the conflict in place.

**You are NOT the work agent.** You do not read the card's acceptance
criteria, you do not implement anything, you do not call
`agent-finalize.sh`, and you do not move the card to Done. Your entire job
is to leave the worktree cleanly rebased onto `origin/main` and then release
the card so the worker dispatches the real work on the next tick.

The card was picked up with `dispatch_kind: "worktree-maintenance"`, so it is
`In Progress` and holds a live `dispatch_id` that you will clear in Step 5.

## Hard bans (these were the real bug, not git itself)

`git stash` / `git stash push` / `git stash pop`, `git reset --hard`,
`git checkout <ref>`, `git checkout -- <path>`, `git restore`,
`git clean -f`, `git rebase --abort`, `git push --force` (no `--force-with-lease`)
are FORBIDDEN. They destroy uncommitted work irrecoverably or stomp a
concurrent push. The ONLY recovery primitives are **commit-first** and
**resolve-in-place**. `git push --force-with-lease` IS allowed (it refuses to
overwrite remote work you have not seen).

## Step 1 — Fetch + commit any residue

```bash
cd $DANX_REPO_ROOT
git fetch origin --quiet
git status --porcelain
```

If `git status --porcelain` is non-empty, the prior session left residue.
**Commit it on the agent branch** — never stash, never reset:

```bash
git add -A && git commit -m "wip(autosave): pre-sync residue"
```

## Step 2 — Rebase onto origin/main, resolve conflicts IN PLACE

```bash
git rebase origin/main
```

- Clean rebase → skip to Step 3.
- **Conflicts → resolve them, file by file. NEVER `git rebase --abort`.** For
  each conflicted path: open it, read BOTH sides of every `<<<<<<<` /
  `=======` / `>>>>>>>` marker, and produce a merged result that keeps the
  valid intent of BOTH sides. Do not delete one side wholesale unless the two
  edits are semantically identical.

  Inject-pipeline files under `.danxbot/workspaces/*/` take `origin/main`'s
  side (they are regenerated every tick); everything else is resolved on
  merit.

  After editing each file, confirm no markers remain:

  ```bash
  grep -n "<<<<<<< \|======= \|>>>>>>> " <path>   # must be empty
  git add <path>
  git rebase --continue
  ```

  Repeat until git prints `Successfully rebased`.

If a conflict region is genuinely unreconcilable — you cannot tell which side
is correct and cannot reconstruct intent from either — STOP and self-block
(see "Failure path" below). Do NOT `git rebase --abort`.

## Step 3 — Push the agent branch

```bash
git push --force-with-lease origin $(git branch --show-current)
```

`--force-with-lease` only — never `--force`. A concurrent push (rare on an
agent-owned branch) refuses cleanly instead of stomping.

## Step 4 — Verify the tree is on origin/main

```bash
git rev-list --left-right --count origin/main...HEAD
```

The LEFT count (commits on `origin/main` not in HEAD — "behind") MUST be `0`.
A non-zero RIGHT count (local WIP commits ahead of main) is fine — the work
agent continues from there. If `behind` is still non-zero, something went
wrong; self-block (below) rather than release a still-divergent tree.

## Step 5 — Release the card non-terminally, then finalize the dispatch

This is the whole point: hand a clean tree back to the worker WITHOUT marking
the card Done and WITHOUT a strike. Two calls, in order:

1. `mcp__danx_dashboard__issue_transition({id: "<PREFIX>-N", action: "rollback_pickup"})`
   — clears `dispatch_id` / `dispatch_started_at` / `dispatch_kind`. The card
   derives back to `ToDo`; `assigned_agent` stays pinned to you so the next
   tick re-dispatches the WORK agent on the worktree you just cleaned.
2. `mcp__danxbot__danxbot_complete({status: "complete", summary: "Worktree rebased onto origin/main and conflicts resolved; released for the work dispatch (<one-line what you resolved>)."})`
   — ends the dispatch row. Do NOT call `issue_transition({action: 'complete'})`
   (that would stamp the card Done) and do NOT run `agent-finalize.sh`.

Emit NO text after `danxbot_complete`.

## Failure path — self-block (guardrail #4)

If the rebase hits a region you genuinely cannot reconcile, OR `git push`
races itself to exhaustion, OR `git fetch` fails repeatedly — the worktree
needs a human. Do NOT abort the rebase and do NOT clear the dispatch. Instead
self-block:

```
mcp__danxbot__danxbot_complete({
  status: "failed",
  summary: "<≥30-char human-readable reason: name the conflicting path(s) + why neither side reconstructs intent>",
})
```

`danxbot_complete({status: "failed"})` stamps `blocked_at` + `blocked_reason`
on the card (DX-722 — `failed` IS the self-block status; `status_derived`
becomes `Blocked`). A human resolves the worktree and unblocks. This is the
ONLY path to a blocked card from maintenance — the worker NEVER stamps
`agents.<name>.broken` from a git failure (reachable only from N consecutive
agent-emitted `failed` strikes, `src/agent/strikes.ts`).
