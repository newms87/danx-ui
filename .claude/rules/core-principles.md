# Core Engineering Principles

`SOLID / DRY / Zero-Debt / One-Way / Read-First / Flawless`

## The Principles

| Principle | Description |
|-----------|-------------|
| **Zero Tech Debt** | No legacy code, no backwards compatibility, no dead code. NEVER add compatibility layers. |
| **SOLID** | Single responsibility, small files (<150 lines), small methods (<20 lines). |
| **DRY** | Refactor duplication immediately. Never copy-paste code. |
| **One Way** | ONE correct pattern for everything. Fix at source, not caller. |
| **Read First** | Always read existing implementations before writing new code. |
| **Flawless** | Every component perfectly documented, typed, and styled. Library-grade quality. |

## Zero Backwards Compatibility

**NEVER introduce backwards compatibility code. This is a CRITICAL violation.**

### Forbidden Patterns

- Supporting multiple parameter names
- Comments containing "backwards compatibility", "legacy support", "deprecated"
- Code that handles "old format" or "new format" simultaneously
- Fallback logic for old parameter names or data structures

### The Rule

ONE correct way to do everything. If something uses the wrong name, fix it at the source. Never add compatibility layers.

## Library-Grade Quality

This is a public component library. Every file must be:

- **Perfectly documented** - Comprehensive comments for all public APIs
- **Perfectly typed** - Full TypeScript types, no `any`
- **Perfectly styled** - CSS tokens, not inline styles or styling props
- **Perfectly tested** - 100% test coverage for all components and composables
