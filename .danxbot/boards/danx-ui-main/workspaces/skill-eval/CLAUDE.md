# skill-eval workspace

Dispatched cwd for `/skill-eval` probe runs (DX-276). One-shot dispatch whose
only job is to surface what the agent would do in response to a single user
query. Harness inspects the resulting JSONL for a `Skill(<plugin>:<skill>)`
tool-use to assert the trigger landed.

## Why isolated

Probes share `~/.claude/projects/` with `issue-worker` and `system-test`.
Claude encodes cwd into the JSONL directory name, so routing every probe
through this workspace puts probe sessions in their own dir:
`~/.claude/projects/-home-newms-web-danxbot--danxbot-workspaces-skill-eval/` —
keeps probe noise out of operational logs.

## Plugin surface

`.claude/settings.json` enables the same plugin set as `issue-worker`
(`base`, `investigate`, `dev`, `pipeline`, `danxbot`). The harness asserts
those plugin skills load on a given prompt; the plugins must be available.
