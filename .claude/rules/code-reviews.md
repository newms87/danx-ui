# Code Reviews (Project-Specific)

## Available Reviewer Agents

This project has two reviewer agents. Launch them via the Task tool with `subagent_type`:

| Agent | `subagent_type` | Purpose |
|-------|-----------------|---------|
| `code-reviewer` | `code-reviewer` | SOLID/DRY violations, file size, anti-patterns |
| `test-reviewer` | `test-reviewer` | Test coverage audit, missing scenarios, test quality |

Both are **read-only** — they analyze and report, they do not write code.

## Running Reviews

For post-implementation reviews, launch both agents in parallel in a single message:

1. **test-reviewer** — point it at the test files and source files in scope
2. **code-reviewer** — point it at the source files you changed

Tell each agent exactly which files to review. They will read the code and report findings.

## When to Run Which

| Situation | Agents to Run |
|-----------|---------------|
| New feature or component | Both |
| Bug fix with test changes | Both |
| Refactoring (no new tests) | code-reviewer only |
| Test-only changes | test-reviewer only |

## Full Refactoring Reviews

For comprehensive refactoring workflows, use the `/code-review` skill which orchestrates both agents, consolidates findings into a plan, and follows the full review-then-fix workflow.
