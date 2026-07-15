import { describe, expect, it, vi } from "vitest";

// DXUI-35: simulate a clean install where the optional peers are absent — any
// eager (top-level, non-lazy) import of either module throws on evaluation,
// exactly like Node/Vite/Vitest module resolution would when the package isn't
// installed at all.
vi.mock("@vueuse/core", () => {
  throw new Error("@vueuse/core is not installed");
});
vi.mock("luxon", () => {
  throw new Error("luxon is not installed");
});

describe("main entry — peer-free surface", () => {
  it(
    "imports without throwing when @vueuse/core and luxon are absent",
    async () => {
      // First import compiles the entire main-barrel module graph on the fly
      // (dozens of components), which is slower than vitest's default 5s.
      await expect(import("../index")).resolves.toBeDefined();
    },
    15000
  );

  it("exposes the peer-free component surface (DanxButton, DanxDialog)", async () => {
    const mod = await import("../index");
    expect(mod.DanxButton).toBeDefined();
    expect(mod.DanxDialog).toBeDefined();
  });

  it("does not export the @vueuse/core-dependent actions layer from the main barrel", async () => {
    const mod = await import("../index");
    expect((mod as Record<string, unknown>).useActions).toBeUndefined();
  });

  it("does not export the luxon-dependent datetime formatters from the main barrel", async () => {
    const mod = await import("../index");
    expect((mod as Record<string, unknown>).fDateTime).toBeUndefined();
    expect((mod as Record<string, unknown>).parseDateTime).toBeUndefined();
  });

  it("does not export the @vueuse/core-dependent scroll composables from the main barrel", async () => {
    const mod = await import("../index");
    expect((mod as Record<string, unknown>).DanxScroll).toBeUndefined();
    expect((mod as Record<string, unknown>).useScrollInfinite).toBeUndefined();
  });
});
