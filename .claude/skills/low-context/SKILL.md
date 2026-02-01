# Low Context Skill

<command-name>low-context</command-name>

## Description

Emergency context preservation. When context is running low, stop all work and create a handoff document for the next agent or session.

## Trigger

Use this skill when:
- You receive a warning about context limits
- The user says "low context" or "running out of context"
- You sense you're near the end of a session

## Workflow

1. **STOP all code writing immediately**
2. **Enter plan mode** if not already
3. **Update plan file** with complete handoff context:
   - What was accomplished
   - What is in progress
   - What still needs to be done
   - Critical decisions made
   - Gotchas discovered
4. **Exit plan mode**

## Handoff Document Structure

```markdown
## Handoff Context

### Accomplished
- [Completed task 1]
- [Completed task 2]

### In Progress
- [Current task] - [Exact state]

### Remaining
- [Task 1]
- [Task 2]

### Critical Context
- [Important decision or discovery]
- [Gotcha that was encountered]

### Files Modified
- `path/to/file.vue` - [What was changed]
```

## Rules

- **Don't try to finish** - Stop immediately
- **Be specific** - Include exact file paths and line numbers
- **Preserve decisions** - Document why, not just what
- **Include gotchas** - What would trip up the next agent?

## Output

After creating handoff:
1. Tell user the handoff is ready
2. Suggest they start a new session
3. Point to the plan file location
