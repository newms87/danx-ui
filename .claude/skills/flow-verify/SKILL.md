---
name: flow-verify
description: Pre-commit verification gate. Ensures tests, docs, and demos are complete before committing.
---

# Verify Completeness Gate

**Run this AFTER `/flow-quality-check` and BEFORE `/flow-commit`.** This is a mandatory pipeline step for danx-ui that verifies the Feature Completion Checklist before any code is committed.

Pipeline position: implement → review → quality-check → **VERIFY** → commit → report → self-improve

---

## Step 1: Identify What Changed

Run `git diff --name-only` to get all changed files. Categorize them:

| Category | Detection |
|----------|-----------|
| **New component** | New `.vue` file in `src/components/` |
| **New composable** | New `use*.ts` file in `src/components/` |
| **New export** | New entry in `src/index.ts` |
| **Modified component** | Changed `.vue` file in `src/components/` |
| **Modified composable** | Changed `use*.ts` file in `src/components/` |
| **Non-code change** | Docs, tests, config, demo files only — skip verification |

If ALL changes are non-code (only docs, tests, config, demo files), output "No source changes — verification not required" and proceed to `/flow-commit`.

## Step 2: Verify Tests

For each changed source file in `src/components/`:

1. **Check test file exists** — Glob for `__tests__/{ComponentName}.test.ts` or `__tests__/use{Name}.test.ts` in the same component directory
2. **Check tests cover new behavior** — Read the test file and verify that new/changed props, emits, models, and public API are tested
3. **Run coverage** — Execute `yarn test:coverage` and verify it passes (100% thresholds enforced by vitest.config.ts)

### Verdict format

| File | Tests Exist | New Behavior Covered | Coverage |
|------|-------------|---------------------|----------|
| `DanxVirtualScroll.vue` | ✅ | ❌ scrollPosition model untested | — |
| `useScrollWindow.ts` | ✅ | ✅ | — |

Coverage row (from `yarn test:coverage` output):

| Metric | Threshold | Actual | Status |
|--------|-----------|--------|--------|
| Lines | 100% | 98.5% | ❌ |
| Functions | 100% | 100% | ✅ |
| Branches | 100% | 97.2% | ❌ |
| Statements | 100% | 98.5% | ❌ |

## Step 3: Verify Documentation

For each changed component/composable:

1. **Component docblock** — Read the `.vue` file and verify it has the comprehensive comment block documenting all props, emits, slots, tokens, and examples (per component-architecture.md)
2. **User docs** — Check if a corresponding `docs/*.md` file exists. If it does, verify it documents any new props, emits, models, or API surface added in this session.
3. **New public API** — If `src/index.ts` was changed to add new exports, verify docs mention them.

### Verdict format

| File | Docblock | User Docs |
|------|----------|-----------|
| `DanxVirtualScroll.vue` | ✅ scrollPosition documented | ❌ `docs/scroll.md` missing scrollPosition |

## Step 4: Verify Demo

For each NEW component (skip for modifications to existing components unless new significant user-facing behavior was added):

1. **Demo page exists** — Glob for a demo file in `demo/pages/` that showcases the component
2. **Route registered** — Grep `demo/main.ts` for the route
3. **Sidebar link** — Grep `demo/App.vue` for the navigation link
4. **Live preview registry** — Grep `demo/composables/useLivePreview.ts` for the component in `REGISTERED_COMPONENTS` and `AVAILABLE_VALUES`

For MODIFIED components with new significant user-facing behavior (new prop, new model, new slot):

1. **Demo example exists** — Check if an existing demo example demonstrates the new behavior
2. **If not** — A new demo example should be added showing the feature

### Verdict format

| Component | Demo Page | Route | Sidebar | Live Preview | New Behavior Demo |
|-----------|-----------|-------|---------|--------------|-------------------|
| `DanxVirtualScroll` | ✅ | ✅ | ✅ | ✅ | ❌ scrollPosition not demoed |

## Step 5: Verdict

Output a summary table:

| Gate | Status | Details |
|------|--------|---------|
| Tests | ✅ or ❌ | What's missing |
| Docs | ✅ or ❌ | What's missing |
| Demo | ✅ or ❌ | What's missing |
| Coverage | ✅ or ❌ | Threshold failures |

### If ALL gates pass

Output: "All verification gates passed." Proceed to `/flow-commit`.

### If ANY gate fails

**DO NOT proceed to `/flow-commit`.** Instead:

1. List every gap as a concrete action item
2. Fix all gaps immediately (write tests, update docs, add demo examples)
3. Re-run this skill to confirm all gates now pass
4. Only then proceed to `/flow-commit`

---

## Rules

- **This step is NOT optional.** Every commit in danx-ui must pass through this gate.
- **Non-code changes are exempt.** If you only changed docs/tests/config/demos, skip to commit.
- **Modifications to existing components** only require demo verification when new user-facing behavior was added (new prop, model, slot, or significant behavioral change). Bug fixes and internal refactors don't need new demos.
- **Coverage must be run, not assumed.** "I wrote tests" is not the same as "coverage passes."
- **Never weaken thresholds to pass.** If coverage fails, write more tests — don't touch vitest.config.ts.
