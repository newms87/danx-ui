import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_LARGE_PASTE_THRESHOLD,
  LARGE_PASTE_MIME,
  usePasteFiles,
  type PasteRejection,
  type PasteResult,
} from "../usePasteFiles";

/**
 * happy-dom does not provide a faithful ClipboardEvent/DataTransfer pair
 * (constructing one with items is not supported), so these tests stub the exact
 * surface the composable reads: `clipboardData.items`, `clipboardData.files`,
 * and `clipboardData.getData`. The stubs are structurally typed so a change to
 * what the composable reads breaks the tests loudly.
 */
interface StubItem {
  kind: string;
  type: string;
  getAsFile: () => File | null;
}

interface StubClipboard {
  items?: StubItem[];
  files?: File[];
  text?: string;
}

function makeEvent(clipboard: StubClipboard | null): ClipboardEvent {
  const clipboardData =
    clipboard === null
      ? null
      : {
          items: clipboard.items ?? [],
          files: clipboard.files ?? [],
          getData: () => clipboard.text ?? "",
        };

  return {
    clipboardData,
    preventDefault: vi.fn(),
  } as unknown as ClipboardEvent;
}

function fileItem(file: File | null, type = "image/png"): StubItem {
  return { kind: "file", type, getAsFile: () => file };
}

function stringItem(): StubItem {
  return { kind: "string", type: "text/plain", getAsFile: () => null };
}

function imageFile(name = "screenshot.png", size = 10): File {
  return new File(["x".repeat(size)], name, { type: "image/png" });
}

function textOfLength(length: number): string {
  return "a".repeat(length);
}

/** Narrowing accessors — the result arrays are typed as possibly-empty. */
function firstFile(result: PasteResult): File {
  const file = result.files[0];
  if (!file) throw new Error("expected at least one extracted file");
  return file;
}

function firstRejection(result: PasteResult): PasteRejection {
  const rejection = result.rejected[0];
  if (!rejection) throw new Error("expected at least one rejection");
  return rejection;
}

describe("usePasteFiles", () => {
  describe("pasted files", () => {
    it("extracts a pasted image from clipboard items", () => {
      const file = imageFile();
      const { extractFiles } = usePasteFiles();

      const result = extractFiles(makeEvent({ items: [fileItem(file)] }));

      expect(result.kind).toBe("files");
      expect(result.handled).toBe(true);
      expect(result.files).toEqual([file]);
      expect(result.rejected).toEqual([]);
      expect(result.text).toBeNull();
    });

    it("extracts multiple pasted files", () => {
      const a = imageFile("a.png");
      const b = imageFile("b.png");
      const { extractFiles } = usePasteFiles();

      const result = extractFiles(makeEvent({ items: [fileItem(a), fileItem(b)] }));

      expect(result.files).toEqual([a, b]);
      expect(result.handled).toBe(true);
    });

    it("ignores non-file items when collecting", () => {
      const file = imageFile();
      const { extractFiles } = usePasteFiles();

      const result = extractFiles(
        makeEvent({ items: [stringItem(), fileItem(file)], text: "hello" })
      );

      expect(result.files).toEqual([file]);
    });

    it("falls back to clipboardData.files when items yield nothing", () => {
      const file = imageFile();
      const { extractFiles } = usePasteFiles();

      const result = extractFiles(makeEvent({ items: [], files: [file] }));

      expect(result.kind).toBe("files");
      expect(result.files).toEqual([file]);
    });

    it("falls back to clipboardData.files when a file item returns null", () => {
      const file = imageFile();
      const { extractFiles } = usePasteFiles();

      const result = extractFiles(makeEvent({ items: [fileItem(null)], files: [file] }));

      expect(result.files).toEqual([file]);
    });

    it("reports both the files and the text when the clipboard carries both", () => {
      const file = imageFile();
      const { extractFiles } = usePasteFiles();

      const result = extractFiles(makeEvent({ items: [fileItem(file)], text: "caption" }));

      expect(result.kind).toBe("files");
      expect(result.files).toEqual([file]);
      expect(result.text).toBe("caption");
    });

    it("never calls preventDefault on the event", () => {
      const event = makeEvent({ items: [fileItem(imageFile())] });
      const { extractFiles } = usePasteFiles();

      extractFiles(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe("text under the threshold", () => {
    it("falls through with the text preserved", () => {
      const { extractFiles } = usePasteFiles();

      const result = extractFiles(makeEvent({ text: "short note" }));

      expect(result.kind).toBe("none");
      expect(result.handled).toBe(false);
      expect(result.files).toEqual([]);
      expect(result.text).toBe("short note");
    });

    it("treats text of exactly the threshold length as text", () => {
      const { extractFiles } = usePasteFiles({ largePasteThreshold: 10 });

      const result = extractFiles(makeEvent({ text: textOfLength(10) }));

      expect(result.kind).toBe("none");
      expect(result.handled).toBe(false);
    });

    it("uses the documented default threshold when none is given", () => {
      const { extractFiles } = usePasteFiles();

      const under = extractFiles(makeEvent({ text: textOfLength(DEFAULT_LARGE_PASTE_THRESHOLD) }));
      const over = extractFiles(
        makeEvent({ text: textOfLength(DEFAULT_LARGE_PASTE_THRESHOLD + 1) })
      );

      expect(under.kind).toBe("none");
      expect(over.kind).toBe("large-text");
    });
  });

  describe("text over the threshold", () => {
    it("converts the paste into a text/plain file", async () => {
      const text = textOfLength(50);
      const { extractFiles } = usePasteFiles({ largePasteThreshold: 20 });

      const result = extractFiles(makeEvent({ text }));

      expect(result.kind).toBe("large-text");
      expect(result.handled).toBe(true);
      expect(result.files).toHaveLength(1);
      expect(firstFile(result).name).toBe("pasted-text-1.txt");
      expect(firstFile(result).type).toBe(LARGE_PASTE_MIME);
      expect(firstFile(result).size).toBe(50);
      await expect(firstFile(result).text()).resolves.toBe(text);
    });

    it("returns the original text so the host can offer an undo", () => {
      const text = textOfLength(50);
      const { extractFiles } = usePasteFiles({ largePasteThreshold: 20 });

      expect(extractFiles(makeEvent({ text })).text).toBe(text);
    });

    it("increments the generated name index across pastes", () => {
      const { extractFiles } = usePasteFiles({ largePasteThreshold: 5 });

      const first = extractFiles(makeEvent({ text: textOfLength(10) }));
      const second = extractFiles(makeEvent({ text: textOfLength(10) }));

      expect(firstFile(first).name).toBe("pasted-text-1.txt");
      expect(firstFile(second).name).toBe("pasted-text-2.txt");
    });

    it("keeps the counter per composable instance", () => {
      const a = usePasteFiles({ largePasteThreshold: 5 });
      const b = usePasteFiles({ largePasteThreshold: 5 });

      a.extractFiles(makeEvent({ text: textOfLength(10) }));
      const fromB = b.extractFiles(makeEvent({ text: textOfLength(10) }));

      expect(firstFile(fromB).name).toBe("pasted-text-1.txt");
    });

    it("uses a custom nameLargePaste with the index and the text", () => {
      const nameLargePaste = vi.fn(
        (index: number, text: string) => `snippet-${index}-${text.length}.txt`
      );
      const { extractFiles } = usePasteFiles({ largePasteThreshold: 5, nameLargePaste });

      const result = extractFiles(makeEvent({ text: textOfLength(12) }));

      expect(nameLargePaste).toHaveBeenCalledWith(1, textOfLength(12));
      expect(firstFile(result).name).toBe("snippet-1-12.txt");
    });
  });

  describe("validation", () => {
    it("rejects a pasted file over maxFileSize", () => {
      const file = imageFile("big.png", 100);
      const { extractFiles } = usePasteFiles({ maxFileSize: 50 });

      const result = extractFiles(makeEvent({ items: [fileItem(file)] }));

      expect(result.kind).toBe("files");
      expect(result.handled).toBe(false);
      expect(result.files).toEqual([]);
      expect(result.rejected).toHaveLength(1);
      expect(firstRejection(result).reason).toBe("size");
      expect(firstRejection(result).file).toBe(file);
      expect(firstRejection(result).message).toContain("big.png");
      expect(firstRejection(result).message).toContain("50");
    });

    it("keeps accepted files and reports rejected ones side by side", () => {
      const ok = imageFile("ok.png", 10);
      const tooBig = imageFile("big.png", 100);
      const { extractFiles } = usePasteFiles({ maxFileSize: 50 });

      const result = extractFiles(makeEvent({ items: [fileItem(ok), fileItem(tooBig)] }));

      expect(result.files).toEqual([ok]);
      expect(result.handled).toBe(true);
      expect(result.rejected.map((r) => r.file)).toEqual([tooBig]);
    });

    it("rejects files that do not match accept", () => {
      const pdf = new File(["x"], "doc.pdf", { type: "application/pdf" });
      const { extractFiles } = usePasteFiles({ accept: "image/*" });

      const result = extractFiles(makeEvent({ items: [fileItem(pdf, "application/pdf")] }));

      expect(result.handled).toBe(false);
      expect(firstRejection(result).reason).toBe("type");
      expect(firstRejection(result).message).toContain("application/pdf");
    });

    it("describes a typeless file as unknown in the rejection message", () => {
      const blob = new File(["x"], "mystery");
      const { extractFiles } = usePasteFiles({ accept: "image/*" });

      const result = extractFiles(makeEvent({ items: [fileItem(blob, "")] }));

      expect(firstRejection(result).message).toContain("unknown");
    });

    it("accepts files matching an accept filter", () => {
      const file = imageFile();
      const { extractFiles } = usePasteFiles({ accept: "image/*" });

      const result = extractFiles(makeEvent({ items: [fileItem(file)] }));

      expect(result.files).toEqual([file]);
    });

    it("applies accept to the synthesized large-text file", () => {
      const text = textOfLength(50);
      const { extractFiles } = usePasteFiles({ largePasteThreshold: 10, accept: "image/*" });

      const result = extractFiles(makeEvent({ text }));

      expect(result.kind).toBe("large-text");
      expect(result.handled).toBe(false);
      expect(result.files).toEqual([]);
      expect(firstRejection(result).reason).toBe("type");
      expect(result.text).toBe(text);
    });

    it("applies maxFileSize to the synthesized large-text file", () => {
      const { extractFiles } = usePasteFiles({ largePasteThreshold: 10, maxFileSize: 20 });

      const result = extractFiles(makeEvent({ text: textOfLength(50) }));

      expect(result.handled).toBe(false);
      expect(firstRejection(result).reason).toBe("size");
    });
  });

  describe("nothing to handle", () => {
    it("reports none for an empty clipboard", () => {
      const { extractFiles } = usePasteFiles();

      const result = extractFiles(makeEvent({}));

      expect(result).toEqual({
        kind: "none",
        handled: false,
        files: [],
        text: null,
        rejected: [],
      });
    });

    it("reports none when clipboardData is null", () => {
      const { extractFiles } = usePasteFiles();

      const result = extractFiles(makeEvent(null));

      expect(result).toEqual({
        kind: "none",
        handled: false,
        files: [],
        text: null,
        rejected: [],
      });
    });
  });
});
