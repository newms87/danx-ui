# Paths and Commands

## CRITICAL: Always cd First

**Before running git, yarn, or any project command, ALWAYS cd into the expected directory first.**

Working directory state is unreliable. Previous commands may have changed it. Always be explicit:

```bash
cd /home/newms/web/danx-ui && git status
cd /home/newms/web/danx-ui && yarn build
```

Never assume you're in the right directory. Never run project commands without the `cd &&` prefix.

## CRITICAL: RELATIVE PATHS ONLY - NO EXCEPTIONS

**ABSOLUTE PATHS ARE FORBIDDEN IN ALL BASH COMMANDS**

This is a blocking requirement - absolute paths require manual approval and break autonomous operation.

### ALWAYS use relative paths:
- `yarn dev`
- `yarn build`
- `yarn lint`
- `yarn test`

### NEVER use absolute paths:
- `/home/user/project/...`
- Any path starting with `/home/`, `/Users/`, `/var/`, etc.

## Tool Usage

**Always use specialized tools instead of bash commands:**
- Read tool (not cat/head/tail)
- Glob tool (not find)
- Grep tool (not grep/rg commands)
- Output text directly (not bash echo)

See `tool-usage.md` for complete rules.

## Common Commands

| Command | Purpose |
|---------|---------|
| `yarn dev` | Start Vite dev server |
| `yarn build` | Build for production |
| `yarn typecheck` | Run TypeScript type checking |
| `yarn lint` | Run ESLint with auto-fix |
| `yarn format` | Run Prettier |
| `yarn test` | Run Vitest in watch mode |
| `yarn test:run` | Run Vitest once |
| `yarn test:coverage` | Run with coverage report |

## Development Environment

All code changes are reflected immediately:

- **Vue/TypeScript**: Vite HMR - changes apply instantly
- **CSS**: Tailwind v4 + Vite - instant updates

**No production build needed during development.** Only run `yarn build` for final validation before committing.
