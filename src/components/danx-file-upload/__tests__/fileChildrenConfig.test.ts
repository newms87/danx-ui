import { describe, it, expect, afterEach, vi } from "vitest";
import {
  setFileChildrenHandler,
  getFileChildrenHandler,
  resetFileChildrenHandler,
} from "../fileChildrenConfig";
import { makeFile } from "../../danx-file/__tests__/test-helpers";

describe("fileChildrenConfig", () => {
  afterEach(() => {
    resetFileChildrenHandler();
  });

  it("returns null before any handler is configured", () => {
    resetFileChildrenHandler();
    expect(getFileChildrenHandler()).toBeNull();
  });

  it("stores and returns the configured handler", () => {
    const handler = vi.fn(() => Promise.resolve());
    setFileChildrenHandler(handler);
    expect(getFileChildrenHandler()).toBe(handler);
  });

  it("invokes the stored handler with the file", async () => {
    const handler = vi.fn(() => Promise.resolve());
    setFileChildrenHandler(handler);
    const file = makeFile("1");
    await getFileChildrenHandler()!(file);
    expect(handler).toHaveBeenCalledWith(file);
  });

  it("resetFileChildrenHandler clears the handler back to null", () => {
    setFileChildrenHandler(vi.fn(() => Promise.resolve()));
    resetFileChildrenHandler();
    expect(getFileChildrenHandler()).toBeNull();
  });
});
