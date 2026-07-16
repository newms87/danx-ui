/**
 * Diff Utilities
 *
 * Line-level diff computation between two text blobs using the classic
 * LCS (longest common subsequence) algorithm. Produces a unified sequence
 * of added/removed/unchanged lines, plus a split-view row pairing derived
 * from that same sequence.
 */

import type { DiffLine, DiffRow } from "./types";

function splitLines(value: string): string[] {
  return value === "" ? [] : value.split("\n");
}

/**
 * Computes a unified line-level diff between two text blobs.
 * Each returned line is tagged "added", "removed", or "unchanged" and
 * carries the 1-based line number(s) it corresponds to in the old/new text.
 */
export function computeLineDiff(oldValue: string, newValue: string): DiffLine[] {
  const oldLines = splitLines(oldValue);
  const newLines = splitLines(newValue);
  const m = oldLines.length;
  const n = newLines.length;

  // lcs[i][j] = length of the longest common subsequence of oldLines[i:] and newLines[j:]
  const lcs: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      lcs[i]![j] =
        oldLines[i] === newLines[j]
          ? lcs[i + 1]![j + 1]! + 1
          : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  let oldNum = 1;
  let newNum = 1;

  while (i < m && j < n) {
    if (oldLines[i] === newLines[j]) {
      result.push({
        type: "unchanged",
        content: oldLines[i]!,
        oldLineNumber: oldNum++,
        newLineNumber: newNum++,
      });
      i++;
      j++;
    } else if (lcs[i + 1]![j]! >= lcs[i]![j + 1]!) {
      result.push({
        type: "removed",
        content: oldLines[i]!,
        oldLineNumber: oldNum++,
        newLineNumber: null,
      });
      i++;
    } else {
      result.push({
        type: "added",
        content: newLines[j]!,
        oldLineNumber: null,
        newLineNumber: newNum++,
      });
      j++;
    }
  }

  while (i < m) {
    result.push({
      type: "removed",
      content: oldLines[i]!,
      oldLineNumber: oldNum++,
      newLineNumber: null,
    });
    i++;
  }

  while (j < n) {
    result.push({
      type: "added",
      content: newLines[j]!,
      oldLineNumber: null,
      newLineNumber: newNum++,
    });
    j++;
  }

  return result;
}

/**
 * Computes aligned rows for a split (side-by-side) diff view.
 * Unchanged lines pair with themselves; consecutive removed/added runs are
 * zipped row-by-row so the two columns stay visually aligned, with `null`
 * filling the shorter side.
 */
export function computeSplitDiff(oldValue: string, newValue: string): DiffRow[] {
  const diff = computeLineDiff(oldValue, newValue);
  const rows: DiffRow[] = [];
  let idx = 0;

  while (idx < diff.length) {
    const line = diff[idx]!;

    if (line.type === "unchanged") {
      rows.push({ left: line, right: line });
      idx++;
      continue;
    }

    const removed: DiffLine[] = [];
    while (idx < diff.length && diff[idx]!.type === "removed") {
      removed.push(diff[idx]!);
      idx++;
    }

    const added: DiffLine[] = [];
    while (idx < diff.length && diff[idx]!.type === "added") {
      added.push(diff[idx]!);
      idx++;
    }

    const max = Math.max(removed.length, added.length);
    for (let k = 0; k < max; k++) {
      rows.push({ left: removed[k] ?? null, right: added[k] ?? null });
    }
  }

  return rows;
}
