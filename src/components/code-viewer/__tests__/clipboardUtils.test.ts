import { describe, it, expect, vi, afterEach } from "vitest";
import { copyToClipboard } from "../clipboardUtils";

describe("copyToClipboard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses navigator.clipboard.writeText when available and returns true on success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    const result = await copyToClipboard("hello world");

    expect(writeText).toHaveBeenCalledWith("hello world");
    expect(result).toBe(true);
  });

  it("falls back to execCommand when navigator.clipboard is unavailable", async () => {
    vi.stubGlobal("navigator", {});
    const execCommand = vi.fn().mockReturnValue(true);
    document.execCommand = execCommand;

    const result = await copyToClipboard("fallback text");

    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(result).toBe(true);
  });

  it("falls back to execCommand when navigator.clipboard.writeText rejects", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const execCommand = vi.fn().mockReturnValue(true);
    document.execCommand = execCommand;

    const result = await copyToClipboard("retry text");

    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(result).toBe(true);
  });

  it("returns false when the execCommand fallback fails", async () => {
    vi.stubGlobal("navigator", {});
    document.execCommand = vi.fn().mockReturnValue(false);

    const result = await copyToClipboard("nope");

    expect(result).toBe(false);
  });

  it("returns false when execCommand throws", async () => {
    vi.stubGlobal("navigator", {});
    document.execCommand = vi.fn().mockImplementation(() => {
      throw new Error("not supported");
    });

    const result = await copyToClipboard("throws");

    expect(result).toBe(false);
  });

  it("removes the temporary textarea from the document after the fallback runs", async () => {
    vi.stubGlobal("navigator", {});
    document.execCommand = vi.fn().mockReturnValue(true);

    await copyToClipboard("cleanup check");

    expect(document.querySelectorAll("textarea").length).toBe(0);
  });
});
