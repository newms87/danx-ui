# Paths and Commands (Project-Specific)

## Common Commands

| Command | Purpose |
|---------|---------|
| `yarn dev` | Start Vite dev server |
| `yarn dev:check` | Check dev server compiles (returns HTTP status) |
| `yarn build` | Build for production |
| `yarn typecheck` | Run TypeScript type checking |
| `yarn lint` | Run ESLint with auto-fix |
| `yarn format` | Run Prettier |
| `yarn test` | Run Vitest in watch mode |
| `yarn test:run` | Run Vitest once |
| `yarn test:coverage` | Run with coverage report |

## Validating Changes

| Method | When to Use |
|--------|-------------|
| `yarn dev:check` | After any code change (fast, checks dev server) |
| `yarn test:run` | After logic changes |
| `yarn typecheck` | After type signature changes |
| `yarn build` | Only before committing (user must request) |

**NEVER run `yarn build` to validate during development.** `yarn dev:check` returns the HTTP status from the running Vite dev server — `200` means it compiled successfully.
