# Commit Skill

<command-name>commit</command-name>

## Description

Stage and commit changes to git with a well-formatted commit message.

## Modes

### Mode 1: `/commit now`

Single combined `git add <files> && git commit` operation.

### Mode 2: `/commit`

`git add <files>` and `git commit` as two separate operations.

That is the ONLY difference between modes. Both modes show the summary table. Both modes proceed immediately without asking questions. NEVER ask "Ready to commit?" or any confirmation — `/commit` IS the confirmation.

## Workflow

1. Run `git status`, `git diff`, and `git log --oneline -5` in parallel
2. Show summary table
3. Stage and commit:
   - **Mode 1 (`/commit now`):** Single `git add <files> && git commit` call
   - **Mode 2 (`/commit`):** `git add <files>` then `git commit` as separate calls
4. Run `git status` to verify success

## Summary Table Format

| File | Type | Description |
|------|------|-------------|
| `Dialog.vue` | ✏️ M | Added escape key handling |
| `useDialog.ts` | ➕ A | New composable for dialog state |

**Icons:** ✏️ Modified, ➕ Added, 🗑️ Deleted

## Commit Message Format

```bash
git commit -m "$(cat <<'EOF'
Brief summary of changes (imperative mood)

- Detail 1
- Detail 2

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

## Rules

- NEVER push to remote unless explicitly asked
- NEVER use `--amend` unless explicitly asked
- NEVER skip pre-commit hooks
- Stage specific files, not `git add -A` or `git add .`
- Use imperative mood: "Add feature" not "Added feature"
- Keep summary under 70 characters
