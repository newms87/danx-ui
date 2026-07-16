import { describe, it, expect, afterEach } from "vitest";
import { effectScope } from "vue";
import { useBreakpoints, DANX_BREAKPOINTS } from "../useBreakpoints";

describe("useBreakpoints", () => {
  let scope: ReturnType<typeof effectScope>;
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    scope?.stop();
    window.matchMedia = originalMatchMedia;
  });

  function stubMatchMedia(matchingWidth: number) {
    window.matchMedia = (query: string) => {
      const minMatch = /\(min-width:\s*([\d.]+)px\)/.exec(query);
      const maxMatch = /\(max-width:\s*([\d.]+)px\)/.exec(query);
      const satisfiesMin = minMatch ? matchingWidth >= Number(minMatch[1]) : true;
      const satisfiesMax = maxMatch ? matchingWidth <= Number(maxMatch[1]) : true;
      return {
        matches: satisfiesMin && satisfiesMax,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      } as MediaQueryList;
    };
  }

  it("exposes the danx-ui breakpoint token values", () => {
    expect(DANX_BREAKPOINTS).toEqual({ sm: 640, md: 768, lg: 1024, xl: 1280 });
  });

  it("reports mobile viewport as smAndDown", () => {
    stubMatchMedia(375);
    let result: ReturnType<typeof useBreakpoints> | undefined;
    scope = effectScope();
    scope.run(() => {
      result = useBreakpoints();
    });

    expect(result!.smAndDown.value).toBe(true);
    expect(result!.smAndUp.value).toBe(false);
    expect(result!.mdAndUp.value).toBe(false);
    expect(result!.lgAndUp.value).toBe(false);
    expect(result!.xlAndUp.value).toBe(false);
  });

  it("reports a desktop viewport as lgAndUp / xlAndUp", () => {
    stubMatchMedia(1440);
    let result: ReturnType<typeof useBreakpoints> | undefined;
    scope = effectScope();
    scope.run(() => {
      result = useBreakpoints();
    });

    expect(result!.smAndUp.value).toBe(true);
    expect(result!.mdAndUp.value).toBe(true);
    expect(result!.lgAndUp.value).toBe(true);
    expect(result!.xlAndUp.value).toBe(true);
    expect(result!.smAndDown.value).toBe(false);
    expect(result!.mdAndDown.value).toBe(false);
    expect(result!.lgAndDown.value).toBe(false);
  });

  it("reports a tablet viewport as between md and lg", () => {
    stubMatchMedia(800);
    let result: ReturnType<typeof useBreakpoints> | undefined;
    scope = effectScope();
    scope.run(() => {
      result = useBreakpoints();
    });

    expect(result!.mdAndUp.value).toBe(true);
    expect(result!.lgAndUp.value).toBe(false);
    expect(result!.lgAndDown.value).toBe(true);
    expect(result!.current().value).toContain("md");
    expect(result!.active().value).toBe("md");
  });

  it("falls back to safe defaults when matchMedia is unavailable (SSR-like environment)", () => {
    // @ts-expect-error - simulate an environment with no matchMedia support
    window.matchMedia = undefined;

    let result: ReturnType<typeof useBreakpoints> | undefined;
    scope = effectScope();
    scope.run(() => {
      result = useBreakpoints();
    });

    expect(result!.smAndUp.value).toBe(false);
    expect(result!.mdAndUp.value).toBe(false);
    expect(result!.lgAndUp.value).toBe(false);
    expect(result!.xlAndUp.value).toBe(false);
    expect(result!.smAndDown.value).toBe(false);
    expect(() => result!.current().value).not.toThrow();
  });
});
