import { describe, it, expect, afterEach } from "vitest";
import { effectScope, nextTick } from "vue";
import { useColorScheme } from "../useColorScheme";

describe("useColorScheme", () => {
  let scope: ReturnType<typeof effectScope>;
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    scope?.stop();
    window.matchMedia = originalMatchMedia;
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  function stubMatchMedia(matches: boolean) {
    window.matchMedia = (query: string) =>
      ({
        matches,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList;
  }

  it("toggle() applies .dark to documentElement and flips isDark", async () => {
    stubMatchMedia(false);
    let result: ReturnType<typeof useColorScheme> | undefined;
    scope = effectScope();
    scope.run(() => {
      result = useColorScheme({ storageKey: "test-toggle" });
    });
    await nextTick();

    expect(result!.mode.value).toBe("auto");
    expect(result!.isDark.value).toBe(false);

    result!.toggle();
    await nextTick();

    expect(result!.mode.value).toBe("dark");
    expect(result!.isDark.value).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    result!.toggle();
    await nextTick();

    expect(result!.mode.value).toBe("light");
    expect(result!.isDark.value).toBe(false);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("'auto' mode follows prefers-color-scheme", async () => {
    stubMatchMedia(true);
    let result: ReturnType<typeof useColorScheme> | undefined;
    scope = effectScope();
    scope.run(() => {
      result = useColorScheme({ storageKey: "test-auto" });
    });
    await nextTick();

    expect(result!.mode.value).toBe("auto");
    expect(result!.isDark.value).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("persists the selected mode to localStorage and restores it on init", async () => {
    stubMatchMedia(false);
    const storageKey = "test-persist";
    let result: ReturnType<typeof useColorScheme> | undefined;
    scope = effectScope();
    scope.run(() => {
      result = useColorScheme({ storageKey });
    });
    await nextTick();

    result!.toggle();
    await nextTick();
    expect(window.localStorage.getItem(storageKey)).toBe("dark");
    scope.stop();

    let restored: ReturnType<typeof useColorScheme> | undefined;
    scope = effectScope();
    scope.run(() => {
      restored = useColorScheme({ storageKey });
    });
    await nextTick();

    expect(restored!.mode.value).toBe("dark");
    expect(restored!.isDark.value).toBe(true);
  });

  it("does not crash when document is undefined (SSR guard)", async () => {
    const originalDocument = globalThis.document;
    // @ts-expect-error - simulate an SSR environment with no document
    delete globalThis.document;

    let result: ReturnType<typeof useColorScheme> | undefined;
    expect(() => {
      scope = effectScope();
      scope.run(() => {
        result = useColorScheme({ storageKey: "test-ssr" });
      });
    }).not.toThrow();

    expect(result!.mode.value).toBe("auto");
    expect(result!.isDark.value).toBe(false);
    expect(() => result!.toggle()).not.toThrow();

    globalThis.document = originalDocument;
  });
});
