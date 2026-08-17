import { afterEach, describe, expect, it, vi } from "vitest";
import { useChatAttachments } from "../useChatAttachments";
import { resetFileUploadHandler, setFileUploadHandler } from "../../danx-file-upload";
import type { PreviewFile } from "../../danx-file";

/** An upload handler that resolves immediately with a server-shaped file. */
function handler(overrides: Partial<PreviewFile> = {}) {
  return vi.fn(
    async (file: File): Promise<PreviewFile> => ({
      id: `server-${file.name}`,
      name: file.name,
      size: file.size,
      mime: file.type,
      url: `https://cdn.example.com/${file.name}`,
      ...overrides,
    })
  );
}

/**
 * happy-dom cannot populate a real ClipboardEvent's DataTransfer, so the
 * clipboard is stubbed the same way usePasteFiles' own tests stub it.
 */
function pasteEvent({ files = [] as File[], text = "" }): ClipboardEvent {
  const event = {
    preventDefault: vi.fn(),
    clipboardData: {
      items: files.map((file) => ({ kind: "file", type: file.type, getAsFile: () => file })),
      files,
      getData: () => text,
    },
  };
  return event as unknown as ClipboardEvent;
}

afterEach(() => {
  resetFileUploadHandler();
});

describe("useChatAttachments availability", () => {
  // Accepting a file with nowhere to put it would strand it on a message that
  // can never carry it, so the affordance switches off instead.
  it("is disabled when no upload handler exists anywhere", () => {
    expect(useChatAttachments().enabled.value).toBe(false);
  });

  it("is enabled by a per-instance handler", () => {
    expect(useChatAttachments({ uploadHandler: handler() }).enabled.value).toBe(true);
  });

  it("is enabled by the app-wide handler", () => {
    setFileUploadHandler(handler());
    expect(useChatAttachments().enabled.value).toBe(true);
  });

  it("ignores files while disabled", () => {
    const attachments = useChatAttachments();
    attachments.add([new File(["x"], "a.png", { type: "image/png" })]);
    expect(attachments.pending.value).toEqual([]);
  });
});

describe("useChatAttachments paste", () => {
  it("stages a pasted image and consumes the event", () => {
    const attachments = useChatAttachments({ uploadHandler: handler() });
    const event = pasteEvent({ files: [new File(["x"], "shot.png", { type: "image/png" })] });

    expect(attachments.handlePaste(event)).toBe(true);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(attachments.pending.value.map((f) => f.name)).toEqual(["shot.png"]);
  });

  // Ordinary text must reach the editor — swallowing it would break typing.
  it("lets a short text paste fall through untouched", () => {
    const attachments = useChatAttachments({ uploadHandler: handler() });
    const event = pasteEvent({ text: "just a few words" });

    expect(attachments.handlePaste(event)).toBe(false);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(attachments.pending.value).toEqual([]);
  });

  it("turns an oversized text paste into a file attachment", () => {
    const attachments = useChatAttachments({
      uploadHandler: handler(),
      largePasteThreshold: 10,
    });
    const event = pasteEvent({ text: "x".repeat(50) });

    expect(attachments.handlePaste(event)).toBe(true);

    expect(attachments.pending.value).toHaveLength(1);
    expect(attachments.pending.value[0]!.name).toMatch(/\.txt$/);
  });

  it("leaves a paste alone when attachments are switched off", () => {
    const attachments = useChatAttachments();
    const event = pasteEvent({ files: [new File(["x"], "a.png", { type: "image/png" })] });

    expect(attachments.handlePaste(event)).toBe(false);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});

describe("useChatAttachments staging", () => {
  it("removes a staged file before it is sent", () => {
    const attachments = useChatAttachments({ uploadHandler: handler() });
    attachments.add([new File(["x"], "a.png", { type: "image/png" })]);
    const id = attachments.pending.value[0]!.id;

    attachments.remove(id);

    expect(attachments.pending.value).toEqual([]);
  });

  it("take() hands over the staged files and empties the tray", () => {
    const attachments = useChatAttachments({ uploadHandler: handler() });
    attachments.add([new File(["x"], "a.png", { type: "image/png" })]);

    const taken = attachments.take();

    expect(taken).toHaveLength(1);
    expect(attachments.pending.value).toEqual([]);
  });

  it("reports an upload still in flight", () => {
    const attachments = useChatAttachments({ uploadHandler: handler() });
    attachments.add([new File(["x"], "a.png", { type: "image/png" })]);

    // useFileUpload stages the file at progress 0 before the handler resolves.
    expect(attachments.isUploading.value).toBe(true);
  });

  it("ignores an empty add", () => {
    const attachments = useChatAttachments({ uploadHandler: handler() });
    attachments.add([]);
    expect(attachments.pending.value).toEqual([]);
  });
});
