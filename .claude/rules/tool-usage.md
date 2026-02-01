# Tool Usage Rules

## CRITICAL: File Editing Tools

**ALWAYS use the Write and Edit tools for file operations. NEVER use bash commands.**

### Required Tool Usage

| Operation | Tool | NEVER Use |
|-----------|------|-----------|
| Create new file | Write | `echo >`, `cat <<EOF`, `printf` |
| Edit existing file | Edit | `sed`, `awk`, `perl -i` |
| Read file | Read | `cat`, `head`, `tail` |
| Search files | Glob | `find`, `ls` |
| Search content | Grep | `grep`, `rg` |

### Why This Matters

- **Write/Edit tools are linted automatically** via Claude Code hooks
- **Bash edits bypass linting** and can introduce formatting errors
- **Read tool preserves context** for the Edit tool

### Workflow

1. **Read** the file first (required before Edit)
2. **Edit** with precise old_string/new_string replacement
3. **Linting runs automatically** via PostToolUse hook

### Forbidden Patterns

```bash
# NEVER do these
echo "content" > file.ts
cat <<EOF > file.vue
sed -i 's/old/new/' file.ts
grep -l "pattern" | xargs sed -i 's/old/new/'
```

### Correct Patterns

Use the Write tool to create files, Edit tool to modify them.
