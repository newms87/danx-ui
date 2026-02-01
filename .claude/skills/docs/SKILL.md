# Documentation Update Skill

<command-name>docs</command-name>

## Description

Stop current work and update documentation based on what was done incorrectly. Use when Claude made a mistake due to missing or unclear documentation.

## Trigger

Use this skill when:
- You made an error that better docs would have prevented
- You discovered a pattern that should be documented
- You found yourself repeatedly explaining the same thing

## Workflow

1. **Stop current work** - Don't continue with the original task
2. **Understand what went wrong** - What did you do incorrectly?
3. **Choose the right location:**
   - `CLAUDE.md` - Quick reference, high-level rules
   - `.claude/rules/*.md` - Detailed rules for specific domains
   - `docs/*.md` - User documentation
4. **Write succinct documentation** - Clear, actionable, with examples
5. **Show the user what changed** - Brief summary of the update

## Documentation Locations

| Location | Purpose |
|----------|---------|
| `CLAUDE.md` | Quick reference, gotchas, commands |
| `.claude/rules/core-principles.md` | SOLID, DRY, Zero-Debt |
| `.claude/rules/component-architecture.md` | Vue component patterns |
| `.claude/rules/tailwind-v4.md` | Tailwind v4 specifics |
| `.claude/rules/vue-patterns.md` | Vue 3 best practices |
| `.claude/rules/testing.md` | Test coverage requirements |
| `docs/*.md` | User-facing documentation |

## Writing Style

- **Succinct** - No filler words
- **Actionable** - Tell me what to do
- **Examples** - Show, don't just tell
- **Tables** - For quick reference

## Output

After updating docs, show:
1. Which file was updated
2. What was added/changed
3. Why this prevents future errors
