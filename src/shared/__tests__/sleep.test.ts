import { afterEach, describe, expect, it, vi } from "vitest";
import { sleep } from "../sleep";

describe("sleep", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves only after the delay elapses", async () => {
    vi.useFakeTimers();
    let resolved = false;
    const promise = sleep(1000).then(() => {
      resolved = true;
    });

    await vi.advanceTimersByTimeAsync(999);
    expect(resolved).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await promise;
    expect(resolved).toBe(true);
  });

  it("returns a promise resolving to undefined", async () => {
    await expect(sleep(0)).resolves.toBeUndefined();
  });
});
