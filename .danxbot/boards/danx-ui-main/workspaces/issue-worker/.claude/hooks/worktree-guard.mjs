#!/usr/bin/env node
// PreToolUse worktree-guard hook (DX-309 / DX-830).
//
// Mechanical enforcement that agent-bound dispatches stay inside their
// own worktree. Reads the Claude Code PreToolUse JSON envelope from
// stdin, inspects the tool name + input, and either passes through
// (exit 0) or rejects (exit 2 with a stderr reason — Claude Code
// surfaces the reason back to the agent and aborts the tool call).
//
// Policy (DX-830) is BINARY: path inside DANX_AGENT_WORKTREE (literal
// prefix OR realpath) → allow; anything else → reject. Reads and writes
// share the same check. There is no per-card opt-in and no movable
// wall (see root CLAUDE.md Core Principle 5).
//
// Trust boundary:
//   - Activates ONLY when `DANX_AGENT_WORKTREE` is set in the env. The
//     dispatch layer (`src/dispatch/core.ts`) auto-injects this when
//     `input.agent` is resolved; non-agent dispatches leave it unset
//     and the hook passes everything through.
//   - Boundary check is BOTH literal-string prefix AND realpath, with
//     OK if either passes. Literal prefix accepts paths under the
//     `<worktree>/.danxbot/issues/` symlinked subtree (issues are
//     intentionally shared with main — see `provisionIssuesSymlink`);
//     realpath catches paths whose lexical form is suspicious but
//     resolves inside the worktree.
//
// Rejection surface:
//   Edit / Write / MultiEdit / NotebookEdit — file_path must be inside
//     the worktree.
//   Bash — best-effort scan for write-flavored AND read-flavored ops
//     with absolute paths outside the worktree. Catches obvious cases
//     (`> /main/...`, `git checkout`, `rm /main/...`, `grep ...
//     /main/...`); does not pretend to be a sandbox.
//
// Install-root reject (DX-830 / closes DX-755 symptom):
//   When the rejected path resolves under the install-root checkout
//   (the main clone the worktree was cut from — e.g.
//   `/home/newms/web/danxbot/src/...` when the worktree is
//   `/home/newms/web/danxbot/.danxbot/boards/default/worktrees/phil/`), the stderr
//   reason names it explicitly so the agent rewrites the path through
//   its own worktree instead of grepping a stale main-branch checkout
//   (silent zero-hits class).
//
// Failure mode: any unexpected error in the hook prints a diagnostic
// to stderr and exits 0 (allow). A loud-fail on hook crashes would
// brick every dispatch on a transient parse glitch; surface the
// diagnostic instead but don't gate.

import { readFileSync, realpathSync } from "node:fs";
import { resolve, isAbsolute } from "node:path";

const WRITE_TOOLS = new Set(["Edit", "Write", "MultiEdit", "NotebookEdit"]);

// Bash subcommand patterns that mutate a target path. Patterns extract
// an absolute-path argument; the surrounding flow then checks each one
// against the worktree boundary.
const BASH_WRITE_PATTERNS = [
  // Redirections — `cmd > /path`, `cmd >> /path`, `cmd | tee /path`.
  /(?:^|[\s;|&])(?:>>?|tee\s+(?:-a\s+)?)\s*(\/[^\s;|&<>"']+)/g,
  // File-manipulation utilities operating on absolute paths.
  /(?:^|[\s;|&])(?:rm|mv|cp|ln|chmod|chown|touch|mkdir|rmdir|sed\s+-i[^\s]*|truncate)(?:\s+-[a-zA-Z]+)*\s+(\/[^\s;|&<>"']+)/g,
];

// Bash subcommand patterns that READ a target absolute path. Same
// boundary-check semantics as the write patterns; closes the gap that
// let `grep -rn pattern /home/newms/web/danxbot/src/` (the install-root
// checkout, often many commits behind the agent's branch) silently
// return zero hits + false-block the dispatched agent.
//
// Best-effort, NOT a sandbox — same caveat as the write coverage.
// Read utilities with absolute-path arguments fall through here; pipe
// chains and bash builtins that reach outside via non-obvious paths
// stay unguarded.
//
// sed is allowed here only when invoked WITHOUT `-i` (the in-place
// flag — `sed -i` is a WRITE and lives in BASH_WRITE_PATTERNS above).
const BASH_READ_PATTERNS = [
  /(?:^|[\s;|&])(?:grep|egrep|fgrep|rg|ag|find|ls|cat|head|tail|less|more|wc|awk|sed(?!\s+-i\b))\b[^\n;|&]*?\s(\/[^\s;|&<>"']+)/g,
];

// DX-735: destructive-only denylist. The agent owns its branch state and
// runs its own sync (`fetch`, `rebase`, `merge`, `pull`, `push`,
// `cherry-pick`, `revert`, `apply`) — the hook polices destruction, not
// sync. The blocked subcommands here all discard uncommitted work or
// move the worktree off its branch:
//   - reset (--hard discards staged + worktree)
//   - checkout (ref-switch loses branch; `-- <path>` discards worktree)
//   - switch (ref-switch; same loss class as checkout)
//   - restore (path-form discards worktree edits)
//   - clean (deletes untracked files)
//   - stash (hides work into a parallel store that next reset/checkout discards)
//   - worktree (add / remove / move — manipulates the worktree graph)
// The one narrow per-file `git checkout HEAD -- <path>` exception in the
// prep skill's orphan-discard window is an agent-side judgment call; the
// hook stays mechanical and rejects ALL `checkout` invocations.
const BASH_DENIED_GIT_SUBCOMMANDS = new Set([
  "reset",
  "checkout",
  "switch",
  "restore",
  "clean",
  "stash",
  "worktree",
]);

const TOOL_INPUT_FILE_FIELDS = ["file_path", "notebook_path", "path"];

main();

function main() {
  let raw;
  try {
    raw = readFileSync(0, "utf-8");
  } catch (err) {
    diag(`stdin read failed: ${err?.message ?? err}`);
    process.exit(0);
  }

  let envelope;
  try {
    envelope = JSON.parse(raw);
  } catch (err) {
    diag(`envelope parse failed: ${err?.message ?? err}`);
    process.exit(0);
  }

  const worktree = process.env.DANX_AGENT_WORKTREE;
  if (!worktree) {
    // Non-agent dispatch — no boundary to enforce.
    process.exit(0);
  }

  let worktreeReal;
  try {
    worktreeReal = realpathSync(worktree);
  } catch {
    diag(`DANX_AGENT_WORKTREE missing on disk: ${worktree}`);
    process.exit(0);
  }

  // DX-830 — derive the install-root checkout from the worktree path so
  // the reject reason can name it when an agent reaches into a stale
  // main-branch grep. A worktree lives at
  // `<install>/.danxbot/boards/<slug>/worktrees/<agent>` (or its symlink-routed
  // equivalent via `repos/<name>`); strip that suffix to get the
  // install-root checkout. Returns null when the worktree path does
  // not match the canonical shape (operator may have laid the
  // worktrees out manually) — install-root-specific message simply
  // doesn't fire in that case.
  const installRootReal = deriveInstallRoot(worktreeReal);

  const toolName = envelope.tool_name ?? "";
  const toolInput = envelope.tool_input ?? {};

  let denial = null;
  if (WRITE_TOOLS.has(toolName)) {
    denial = checkWritePath(toolInput, worktree, worktreeReal, installRootReal);
  } else if (toolName === "Bash") {
    denial = checkBashCommand(toolInput, worktree, worktreeReal, installRootReal);
  }

  if (denial) {
    process.stderr.write(denial + "\n");
    process.exit(2);
  }
  process.exit(0);
}

function checkWritePath(toolInput, worktreeLiteral, worktreeReal, installRootReal) {
  for (const field of TOOL_INPUT_FILE_FIELDS) {
    const value = toolInput[field];
    if (typeof value !== "string" || value.length === 0) continue;
    const verdict = isPathInsideWorktree(value, worktreeLiteral, worktreeReal);
    if (!verdict.ok) {
      return buildRejectReason({
        kind: "write",
        field,
        path: value,
        verdict,
        worktreeLiteral,
        installRootReal,
      });
    }
  }
  return null;
}

function checkBashCommand(toolInput, worktreeLiteral, worktreeReal, installRootReal) {
  const cmd = toolInput.command;
  if (typeof cmd !== "string") return null;

  // Destructive git subcommands — block outright (regardless of path).
  const gitDenial = findDeniedGitSubcommand(cmd);
  if (gitDenial) {
    return (
      `worktree-guard: agent owns branch state — \`git fetch / rebase / merge / pull / ` +
      `push / cherry-pick / revert\` are allowed, but \`git ${gitDenial}\` discards ` +
      `uncommitted work and is blocked. Commit first, then proceed; use ` +
      `\`git checkout HEAD -- <path>\` (per-file) only inside the orphan-discard window ` +
      `in the prep contract.`
    );
  }

  const checkPatterns = (patterns, kind) => {
    for (const pattern of patterns) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(cmd)) !== null) {
        const path = match[1];
        if (!path || !isAbsolute(path)) continue;
        const verdict = isPathInsideWorktree(path, worktreeLiteral, worktreeReal);
        if (!verdict.ok) {
          return buildRejectReason({
            kind,
            path,
            verdict,
            worktreeLiteral,
            installRootReal,
          });
        }
      }
    }
    return null;
  };

  return (
    checkPatterns(BASH_WRITE_PATTERNS, "bash-write") ||
    checkPatterns(BASH_READ_PATTERNS, "bash-read")
  );
}

function findDeniedGitSubcommand(cmd) {
  const re = /(?:^|[\s;|&(])git\s+([a-z-]+)/g;
  let match;
  while ((match = re.exec(cmd)) !== null) {
    const sub = match[1];
    if (BASH_DENIED_GIT_SUBCOMMANDS.has(sub)) return sub;
  }
  return null;
}

function isPathInsideWorktree(target, worktreeLiteral, worktreeReal) {
  // 1. Literal-string prefix match against the worktree path the
  //    dispatch layer advertised. Accepts paths under the
  //    `<worktree>/.danxbot/issues/` symlinked subtree even though
  //    they realpath into main — that subtree is intentionally shared
  //    (single canonical issue YAML store).
  const abs = isAbsolute(target) ? target : resolve(target);
  if (abs === "/tmp" || abs.startsWith("/tmp/")) return { ok: true };
  const wtNorm = worktreeLiteral.replace(/\/+$/, "");
  if (abs === wtNorm || abs.startsWith(wtNorm + "/")) return { ok: true };

  // 2. realpath comparison — handles paths with symlinks that
  //    ultimately resolve inside the worktree.
  let real;
  try {
    real = realpathSync(abs);
  } catch {
    return { ok: false, reason: "literal-prefix miss + realpath unavailable", real: null };
  }
  const wtRealNorm = worktreeReal.replace(/\/+$/, "");
  if (real === wtRealNorm || real.startsWith(wtRealNorm + "/")) {
    return { ok: true };
  }
  return {
    ok: false,
    reason: `realpath=${real} not under worktree=${wtRealNorm}`,
    real,
  };
}

/**
 * DX-830 / DX-965 — derive the install-root checkout from the
 * worktree path. Worktrees live at
 * `<install-root>/.danxbot/boards/<slug>/worktrees/<agent>` (DX-965
 * board-rooted layout). Strip that suffix to recover the install-
 * root checkout. Returns null when the worktree does not match the
 * canonical shape (no install-root-specific message in that case).
 */
function deriveInstallRoot(worktreeReal) {
  const m = worktreeReal.match(
    /^(.*)\/\.danxbot\/boards\/[^/]+\/worktrees\/[^/]+\/?$/,
  );
  if (!m) return null;
  const candidate = m[1].replace(/\/+$/, "");
  try {
    return realpathSync(candidate);
  } catch {
    return candidate;
  }
}

/**
 * Build the stderr reject reason. When the rejected path resolves
 * under the install-root checkout (not under the agent's worktree),
 * surface the install-root-specific message that closes DX-755's
 * stated symptom — a stale main-branch grep silently returning zero
 * hits.
 */
function buildRejectReason({ kind, field, path, verdict, worktreeLiteral, installRootReal }) {
  const relativeForRewrite = installRootRelative(verdict.real, installRootReal);
  if (relativeForRewrite !== null) {
    return (
      `worktree-guard: ${describeKind(kind, field)} ${path} resolves under the install-root ` +
      `checkout (${installRootReal}), not your worktree — use ${worktreeLiteral}/` +
      `${relativeForRewrite} instead. ` +
      `Reaching into the install-root grep returns stale main-branch results and silently ` +
      `misses changes on your branch.`
    );
  }
  const suffix =
    kind === "write" || kind === "bash-write"
      ? `Operate inside ${worktreeLiteral}/ or under ${worktreeLiteral}/.danxbot/issues/.`
      : `Read inside ${worktreeLiteral}/ — outside-worktree work escalates at the card layer ` +
        `(carve out a new card OR self-block via danxbot_complete({status:"failed"})).`;
  return (
    `worktree-guard: ${describeKind(kind, field)} ${path} is outside ` +
    `DANX_AGENT_WORKTREE=${worktreeLiteral} (${verdict.reason}). ${suffix}`
  );
}

function describeKind(kind, field) {
  if (kind === "write") return `${field}=`;
  if (kind === "bash-write") return `bash command writes to`;
  if (kind === "bash-read") return `bash command reads`;
  return `path`;
}

function installRootRelative(realPath, installRootReal) {
  if (!installRootReal || !realPath) return null;
  const rootNorm = installRootReal.replace(/\/+$/, "");
  if (realPath === rootNorm) return "";
  if (!realPath.startsWith(rootNorm + "/")) return null;
  return realPath.slice(rootNorm.length + 1);
}

function diag(msg) {
  try {
    process.stderr.write(`worktree-guard: ${msg}\n`);
  } catch {
    // best-effort
  }
}
