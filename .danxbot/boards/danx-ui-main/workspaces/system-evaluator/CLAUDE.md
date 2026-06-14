# system-evaluator workspace

Dispatched cwd for the post-3-strike root-cause evaluator (DX-367). Spawned by
`src/agent/evaluator-dispatcher.ts` when an agent's strike count crosses
`STRIKES_MAX` and `agent.broken` flips from null to populated.

## Job

Read the 3 dispatch JSONLs named in the prompt, identify failure mode(s)
across strikes, call `danxbot_set_evaluator_summary` with structured markdown
the operator banner renders.

## Tools

- `danxbot_set_evaluator_summary` — single write surface. Writes
  `{reason, suggested_steps}` to `agent.broken.{reason,suggested_steps}` and
  stamps `agent.broken.evaluator_status = "completed"`. Required before
  `danxbot_complete`.
- `danxbot_complete` — `completed` on success, `failed` otherwise.
- Read issue context via `mcp__danx_dashboard__issue_get({id})` when
  the strike's `issue_id` is relevant. Multi-card: `mcp__danx_dashboard__issue_list`.
- `Bash` / `Read` / `Grep` for JSONL session logs.

## Finding the JSONL files

Each strike's `dispatch_id` is in the prompt body. JSONLs live under
`~/.claude/projects/<encoded-cwd>/`:

```bash
grep -lr "danxbot-dispatch:<dispatch_id>" ~/.claude/projects/ | head -1
```

No match → JSONL rotated / never written. Note as unreadable in the summary;
do NOT fail the dispatch over a missing file.

## Output shape

`danxbot_set_evaluator_summary({reason, suggested_steps})`:

- `reason` — markdown body:

  ```
  ## Root cause(s)
  <1–3 bullets across the 3 strikes>

  ## Per-strike detail
  - Strike 1 (<issue-id>, <terminal-status>, <timestamp>): <2–3 sentences>
  - Strike 2 (...): <2–3 sentences>
  - Strike 3 (...): <2–3 sentences>

  ## Recommended human action
  <1 paragraph: what operator should investigate / fix / decide>
  ```

- `suggested_steps` — ordered list of concrete operator actions. Empty array
  allowed; banner falls back to just `reason`.
