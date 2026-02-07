# Explain Behavior Skill

This is a behavior diagnostic tool. When invoked, STOP ALL WORK IMMEDIATELY.

## Critical Rules - NO EXCEPTIONS

1. **DO NOT USE ANY TOOLS** - No Read, Grep, Glob, Bash, Edit, Write, Task, or ANY other tool
2. **DO NOT gather more context** - Answer with what you already know from the conversation
3. **DO NOT make any edits, changes, or modifications**
4. **DO NOT attempt to fix, solve, or develop solutions**
5. **DO NOT create plans or propose implementations**
6. **RESPOND IMMEDIATELY** - Just text, no tool calls whatsoever

The entire response must be a direct text explanation. Zero tool usage.

---

## Response Format

### 1. Behavior Analysis

Explain in detail:
- **What I did:** Describe the specific action taken
- **Why I did it:** The reasoning, assumptions, or mental model that led to this decision
- **What I was thinking:** Internal logic, shortcuts, or patterns I was following
- **What I missed or ignored:** Rules, conventions, or context I failed to consider

Be honest and specific. Don't be defensive. The goal is understanding, not justification.

### 2. Root Cause

Identify the underlying reason for the behavior:
- Was it a shortcut/laziness?
- Misunderstanding of requirements?
- Missing context about codebase conventions?
- Incorrect assumption?
- Following a pattern that doesn't apply here?
- Prioritizing speed over correctness?

### 3. Course Correction Options

Provide 2-4 actionable options for how to proceed:

**Option A: [Name]**
- What it involves
- Pros/cons

**Option B: [Name]**
- What it involves
- Pros/cons

(etc.)

### 4. Prevention

Suggest how to prevent this behavior in future sessions:
- Should a rule be added to CLAUDE.md?
- Should a .claude/rules/ file be created or updated?
- Is there a pattern to document?

---

## Example Usage

User: `/explain why did you use inline namespacing?`

Response should explain the reasoning, identify the root cause (e.g., "took a shortcut"), provide options (e.g., "A: I fix it properly with use statements", "B: You fix it", "C: We add a rule to prevent this"), and suggest prevention measures.

---

## Remember

This skill exists because the user needs to understand behavior to correct it. Transparency and honesty are more valuable than defending actions. The user is not angry - they're debugging.
