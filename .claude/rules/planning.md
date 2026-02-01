# Planning Rules

## Plan File is Sacred - NEVER Overwrite

**The plan file is a persistent document spanning multiple sessions. NEVER erase it.**

### Editing the Plan File

In plan mode, you edit the plan file using the `Edit` tool. **NEVER use `Write` tool** - it replaces the entire file and destroys all existing content.

## Plans Are Prose - NEVER Code

**CRITICAL: Plan files must contain ZERO code blocks.** This is a blocking rule.

### What Is Forbidden

- Vue/React templates
- TypeScript/JavaScript (including interfaces)
- PHP, Python, or any programming language
- CSS/SCSS
- Config files
- "Example" snippets to "help clarify"

### Why This Rule Exists

- **Code in plans is never executed** - it's pure waste
- **Users scan plans quickly** - code blocks slow reading and hide the actual plan
- **Premature implementation** - writing code locks in details before the user approves the approach
- **Forces clear thinking** - if you can't describe it in prose, you don't understand it yet

### What To Write Instead

Describe behavior in plain language:
- "The component accepts width and height props. Numbers become viewport units, strings pass through as-is."
- "The dialog exposes open() and close() methods for parent components to call."
- "Clicking the confirm button emits a confirm event and shows a loading spinner when isSaving is true."

## Zero-Context Test

**Write plans as if you have amnesia.** The plan must be executable with zero memory of prior conversation.

For each task, include:
- **Exact file paths** being modified
- **Specific method/class names** (not "the scope methods")
- **What changes** in plain language
- **Why** if non-obvious

## Phase-by-Phase Development

**All multi-step features MUST use phase-by-phase development:**

1. **Create a plan** with numbered phases (Phase 0, Phase 1, etc.)
2. **Complete one phase at a time** - implement, test, validate
3. **Pause for user validation** after each phase
4. **Commit the phase** when approved
5. **Mark phase complete** with brief summary of what was accomplished
6. **Move to next phase**
