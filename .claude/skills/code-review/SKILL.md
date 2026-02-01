# Code Review Skill

<command-name>code-review</command-name>

## Description

Full code quality review and refactoring workflow. Analyzes code for SOLID, DRY, and Zero-Debt violations, then creates a prioritized refactoring plan.

## Workflow

1. **Enter plan mode first** - This is a planning activity
2. **Run test-reviewer agent** - Audit test coverage
3. **Run code-reviewer agent** - Analyze code quality
4. **Consolidate findings** into single plan with:
   - Test inventory table
   - Violation findings by priority
   - Refactoring steps

## Priority Order

Findings are prioritized in this order:

1. **Test Coverage** - Missing tests come first
2. **Large Files** - Files over 150 lines
3. **SOLID Violations** - Single responsibility issues
4. **DRY Violations** - Code duplication
5. **Dead Code** - Unused exports, functions

## Test Inventory Table

| File | Coverage | Missing Tests |
|------|----------|---------------|
| `Dialog.vue` | 80% | Escape key, focus trap |
| `useDialog.ts` | 100% | ✅ Complete |

## Code Review Checklist

### Vue-Specific Anti-Patterns

- Manual prop/emit instead of `defineModel`
- `defineExpose` for imperative methods
- Options API usage
- Default exports
- Styling props instead of CSS tokens
- `v-show` for dialogs instead of `v-if`

### General Anti-Patterns

- Files over 150 lines
- Methods over 20 lines
- Duplicated code blocks
- Unused imports/exports
- Missing TypeScript types
- Missing documentation

## Output

The plan should include:

1. **Test Inventory** - What tests exist, what's missing
2. **Violations Found** - Categorized by priority
3. **Refactoring Steps** - Specific, actionable tasks

## Rules

- Tests come FIRST, then refactoring
- Never refactor untested code
- Plan file contains prose only, no code
- Each violation must reference exact file and line
