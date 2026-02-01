# Commit Skill

<command-name>commit</command-name>

## Description

Stage and commit changes to git with a well-formatted commit message.

## Modes

### Mode 1: `/commit now`

Instant commit without showing a summary first. Use when you already know what changed.

### Mode 2: `/commit`

Show a summary of changes, then commit. Use when you want to review before committing.

## Workflow

1. Run `git status` to see all changes
2. Run `git diff` to see the actual changes
3. Run `git log --oneline -5` to see recent commit style
4. (Mode 2 only) Show summary table and wait for confirmation
5. Stage specific files with `git add <files>`
6. Commit with HEREDOC format

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
