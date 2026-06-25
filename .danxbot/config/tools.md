# Danx UI — Agent Tooling Recipe

`@thehammer/danx-ui` — a Vue 3 + TypeScript + Tailwind CSS v4 component library
built with Vite (library mode). Pure Node toolchain, **no Docker stack, no
database** — every command runs directly in the repo at `$DANX_REPO_ROOT`.

`$DANX_REPO_ROOT` is the repo root — use it for every Read / Edit / Write / Bash path.

## Tests & lint

```bash
npm run test:run                                 # full Vitest suite (run once, non-watch)
npx vitest run <filter>                          # single file / name — prefer while iterating
npm run test:run > /tmp/test-output.txt 2>&1     # capture output to a file
npm run test:coverage                            # coverage report (100% coverage is required)
npm run typecheck                                # vue-tsc --noEmit (no separate build needed)
npm run lint                                     # ESLint with --fix (auto-format)
npm run format                                   # Prettier --write src
```

Tests live beside source under `src/` (`*.test.ts` / `*.spec.ts`). There is no
backend, no migrations, no seed step.

## Build

```bash
npm run build      # vite build + vue-tsc --emitDeclarationOnly + CSS copy → dist/
npm run dev        # Vite dev server (HMR) for manual iteration
```

Edit `.vue` / `.ts` files directly — the repo is mounted locally and Vite HMR
applies changes live under `npm run dev`.

## Publishing (`npm run publish:patch`)

`@thehammer/danx-ui` is published to npm via `scripts/publish.sh`:

```bash
npm run publish:patch     # ./scripts/publish.sh patch  — bump patch, build, publish
npm run publish:minor     # minor bump
npm run publish:major     # major bump
```

A card whose acceptance criteria require the package to be published MUST run
`npm run publish:patch` (or the level the card specifies) as part of finishing
the work, and record the published version in the card's retro / completion
summary. Library consumers (gpt-manager and others) cannot pick up a change
until it is published — "merged to main" is necessary but not sufficient when
the card's deliverable is a published version.

## Key docs

- `$DANX_REPO_ROOT/CLAUDE.md` — project rules, component architecture conventions (read first)
- `$DANX_REPO_ROOT/.danxbot/config/overview.md` — architecture overview
- `$DANX_REPO_ROOT/.danxbot/config/workflow.md` — danxbot workflow + git/publish flow
