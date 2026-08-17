/**
 * usePasteFiles - Turn a browser ClipboardEvent into File objects
 *
 * Three outcomes, all generic (nothing chat- or upload-specific):
 *
 * 1. **Pasted files/images** — the clipboard carries `DataTransferItem`s of kind
 *    "file" (a screenshot, a copied file). Those `File` objects are returned.
 * 2. **Large text paste** — plain text longer than `largePasteThreshold` stops
 *    being text and becomes a synthesized `text/plain` `File`, mirroring what
 *    Claude Code and claude.ai do when you paste a wall of text. The original
 *    text is returned alongside it so the host can offer an undo.
 * 3. **Everything else** — nothing to do. `handled` is false and the host's
 *    normal paste behaviour must run untouched.
 *
 * The composable is pure and synchronous: it NEVER calls `preventDefault()` and
 * never uploads. The caller inspects `PasteResult.handled` and decides. Uploading
 * is the app's job via `FileUploadHandler` (see `danx-file-upload`).
 *
 * `handled` means exactly one thing: **at least one `File` was produced**.
 * Rejections (accept/maxFileSize) are always informational — a paste whose files
 * were all rejected reports `handled: false` plus the reasons, so the host can
 * show an error AND let the default paste proceed.
 *
 * @example
 *   const { extractFiles } = usePasteFiles({ accept: "image/*", largePasteThreshold: 2000 });
 *
 *   function onPaste(event: ClipboardEvent) {
 *     const result = extractFiles(event);
 *     if (!result.handled) return;      // let the browser paste normally
 *     event.preventDefault();
 *     attach(result.files);
 *   }
 */

// Direct-path import (not the component barrel): fileValidation.ts has zero
// imports of its own, so pulling it in keeps both the main entry and the
// "./shared" barrel peer-free, and forms no barrel cycle.
import { isAcceptedType } from "../../components/danx-file-upload/fileValidation";

/**
 * Character count above which a plain-text paste is converted into a file.
 * Exported so callers can reference (or deliberately override) the default
 * instead of guessing at a hidden magic number.
 */
export const DEFAULT_LARGE_PASTE_THRESHOLD = 4000;

/** MIME type assigned to files synthesized from a large text paste. */
export const LARGE_PASTE_MIME = "text/plain";

/**
 * What the clipboard turned out to contain.
 *
 * | Kind         | Meaning                                                     |
 * |--------------|-------------------------------------------------------------|
 * | `files`      | The clipboard carried real file items                       |
 * | `large-text` | Plain text over the threshold was converted to a file        |
 * | `none`       | Nothing actionable — let the host's normal paste run         |
 */
export type PasteResultKind = "files" | "large-text" | "none";

/** Why a candidate file was not returned. */
export type PasteRejectionReason = "type" | "size";

/** A file the clipboard offered that failed `accept` or `maxFileSize`. */
export interface PasteRejection {
  /** The rejected file (still a real File — the host may show its name/size) */
  file: File;
  /** Which rule rejected it */
  reason: PasteRejectionReason;
  /** Human-readable explanation, safe to surface directly */
  message: string;
}

/** The outcome of a single paste event. */
export interface PasteResult {
  /** What the clipboard contained */
  kind: PasteResultKind;
  /** True when at least one File was produced — the host should preventDefault() */
  handled: boolean;
  /** Files that passed `accept` and `maxFileSize` (empty when nothing passed) */
  files: File[];
  /** The clipboard's `text/plain` payload, or null when it carried none */
  text: string | null;
  /** Candidate files that failed validation, with reasons */
  rejected: PasteRejection[];
}

/** Options for `usePasteFiles`. */
export interface PasteFilesOptions {
  /**
   * Character count above which pasted plain text becomes a file.
   * Default: `DEFAULT_LARGE_PASTE_THRESHOLD` (4000). Text of exactly this
   * length is still text — the paste must exceed it.
   */
  largePasteThreshold?: number;
  /** Maximum size in bytes for any produced file. Unset = no size limit. */
  maxFileSize?: number;
  /**
   * MIME filter with the same semantics as the `accept` attribute
   * (e.g. `"image/*,.pdf"`). Applies to synthesized text files too, so an
   * images-only target lets a large text paste fall through as text.
   */
  accept?: string;
  /**
   * Names the file synthesized from a large text paste.
   * `index` is a per-composable counter starting at 1, incremented on every
   * conversion attempt. Default: `pasted-text-{index}.txt`.
   */
  nameLargePaste?: (index: number, text: string) => string;
}

/** Return value of `usePasteFiles`. */
export interface UsePasteFilesReturn {
  /** Inspect a paste event and report what it yielded. Never mutates the event. */
  extractFiles: (event: ClipboardEvent) => PasteResult;
}

function defaultNameLargePaste(index: number): string {
  return `pasted-text-${index}.txt`;
}

function emptyResult(kind: PasteResultKind, text: string | null): PasteResult {
  return { kind, handled: false, files: [], text, rejected: [] };
}

/**
 * Collect the `File` objects a clipboard carries.
 *
 * `items` is checked first because some browsers expose a pasted screenshot
 * only through `DataTransferItem.getAsFile()`; `files` is the fallback for the
 * ones that only populate the FileList.
 */
function collectClipboardFiles(data: DataTransfer): File[] {
  const files: File[] = [];
  for (const item of Array.from(data.items)) {
    if (item.kind !== "file") continue;
    const file = item.getAsFile();
    if (file) files.push(file);
  }
  if (files.length > 0) return files;
  return Array.from(data.files);
}

export function usePasteFiles(options: PasteFilesOptions = {}): UsePasteFilesReturn {
  const nameLargePaste = options.nameLargePaste ?? defaultNameLargePaste;
  let largePasteCount = 0;

  function validate(candidates: File[]): { accepted: File[]; rejected: PasteRejection[] } {
    const accepted: File[] = [];
    const rejected: PasteRejection[] = [];

    for (const file of candidates) {
      if (!isAcceptedType(file, options.accept)) {
        rejected.push({
          file,
          reason: "type",
          message: `File type "${file.type || "unknown"}" is not accepted`,
        });
        continue;
      }
      if (options.maxFileSize !== undefined && file.size > options.maxFileSize) {
        rejected.push({
          file,
          reason: "size",
          message: `File "${file.name}" exceeds the maximum size of ${options.maxFileSize} bytes`,
        });
        continue;
      }
      accepted.push(file);
    }

    return { accepted, rejected };
  }

  function extractFiles(event: ClipboardEvent): PasteResult {
    const data = event.clipboardData;
    if (!data) return emptyResult("none", null);

    const text = data.getData("text/plain") || null;

    const pasted = collectClipboardFiles(data);
    if (pasted.length > 0) {
      const { accepted, rejected } = validate(pasted);
      return { kind: "files", handled: accepted.length > 0, files: accepted, text, rejected };
    }

    const threshold = options.largePasteThreshold ?? DEFAULT_LARGE_PASTE_THRESHOLD;
    if (text !== null && text.length > threshold) {
      largePasteCount++;
      const name = nameLargePaste(largePasteCount, text);
      const file = new File([text], name, { type: LARGE_PASTE_MIME });
      const { accepted, rejected } = validate([file]);
      return { kind: "large-text", handled: accepted.length > 0, files: accepted, text, rejected };
    }

    return emptyResult("none", text);
  }

  return { extractFiles };
}
