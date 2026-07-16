import { describe, it, expect, vi, afterEach, beforeEach, afterAll } from "vitest";
import { ref, effectScope } from "vue";
import { useHotkeys, parseHotkey, matchesHotkey, matchesModifiers } from "../useHotkeys";

function fireKeydown(
  target: EventTarget,
  init: KeyboardEventInit & { code?: string } = {}
): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
}

describe("parseHotkey", () => {
  it("parses a plain key", () => {
    expect(parseHotkey("escape")).toEqual({
      key: "escape",
      mod: false,
      ctrl: false,
      shift: false,
      alt: false,
      meta: false,
    });
  });

  it("parses modifiers", () => {
    expect(parseHotkey("mod+shift+s")).toEqual({
      key: "s",
      mod: true,
      ctrl: false,
      shift: true,
      alt: false,
      meta: false,
    });
  });

  it("parses ctrl/control, alt/option, and meta/cmd/command/win/windows synonyms", () => {
    expect(parseHotkey("control+a").ctrl).toBe(true);
    expect(parseHotkey("ctrl+a").ctrl).toBe(true);
    expect(parseHotkey("option+a").alt).toBe(true);
    expect(parseHotkey("alt+a").alt).toBe(true);
    expect(parseHotkey("cmd+a").meta).toBe(true);
    expect(parseHotkey("command+a").meta).toBe(true);
    expect(parseHotkey("win+a").meta).toBe(true);
    expect(parseHotkey("windows+a").meta).toBe(true);
    expect(parseHotkey("meta+a").meta).toBe(true);
  });
});

describe("matchesModifiers", () => {
  const originalPlatform = navigator.platform;

  afterEach(() => {
    Object.defineProperty(navigator, "platform", { value: originalPlatform, configurable: true });
  });

  it("mod maps to metaKey on mac", () => {
    Object.defineProperty(navigator, "platform", { value: "MacIntel", configurable: true });
    const parsed = parseHotkey("mod+s");
    expect(matchesModifiers(new KeyboardEvent("keydown", { metaKey: true }), parsed)).toBe(true);
    expect(matchesModifiers(new KeyboardEvent("keydown", { ctrlKey: true }), parsed)).toBe(false);
  });

  it("mod maps to ctrlKey off mac", () => {
    Object.defineProperty(navigator, "platform", { value: "Win32", configurable: true });
    const parsed = parseHotkey("mod+s");
    expect(matchesModifiers(new KeyboardEvent("keydown", { ctrlKey: true }), parsed)).toBe(true);
    expect(matchesModifiers(new KeyboardEvent("keydown", { metaKey: true }), parsed)).toBe(false);
  });

  it("requires shift and alt to match exactly", () => {
    const parsed = parseHotkey("shift+alt+s");
    expect(
      matchesModifiers(new KeyboardEvent("keydown", { shiftKey: true, altKey: true }), parsed)
    ).toBe(true);
    expect(matchesModifiers(new KeyboardEvent("keydown", { shiftKey: true }), parsed)).toBe(false);
  });

  it("rejects unwanted ctrl/meta when combo has no modifiers", () => {
    const parsed = parseHotkey("s");
    expect(matchesModifiers(new KeyboardEvent("keydown", { ctrlKey: true }), parsed)).toBe(false);
    expect(matchesModifiers(new KeyboardEvent("keydown", { metaKey: true }), parsed)).toBe(false);
  });
});

describe("matchesHotkey", () => {
  it("matches a plain letter key", () => {
    expect(matchesHotkey(new KeyboardEvent("keydown", { key: "s" }), parseHotkey("s"))).toBe(true);
  });

  it("normalizes arrow key names", () => {
    expect(
      matchesHotkey(new KeyboardEvent("keydown", { key: "ArrowUp" }), parseHotkey("up"))
    ).toBe(true);
  });

  it("matches shifted symbol keys directly", () => {
    expect(
      matchesHotkey(new KeyboardEvent("keydown", { key: ">", shiftKey: true }), parseHotkey(">"))
    ).toBe(true);
  });

  it("matches shifted symbol keys via base key + shiftKey", () => {
    expect(
      matchesHotkey(new KeyboardEvent("keydown", { key: ".", shiftKey: true }), parseHotkey(">"))
    ).toBe(true);
  });

  it("matches when event key is the shifted form of the combo's base key", () => {
    expect(
      matchesHotkey(new KeyboardEvent("keydown", { key: ">", shiftKey: true }), parseHotkey("."))
    ).toBe(true);
  });

  it("matches digit keys via event.key", () => {
    expect(matchesHotkey(new KeyboardEvent("keydown", { key: "1" }), parseHotkey("1"))).toBe(true);
  });

  it("matches digit keys via event.code (Digit/Numpad) when event.key differs", () => {
    expect(
      matchesHotkey(new KeyboardEvent("keydown", { key: "!", code: "Digit1" }), parseHotkey("1"))
    ).toBe(true);
    expect(
      matchesHotkey(new KeyboardEvent("keydown", { key: "!", code: "Numpad1" }), parseHotkey("1"))
    ).toBe(true);
  });

  it("rejects digit combo when neither key nor code match", () => {
    expect(
      matchesHotkey(new KeyboardEvent("keydown", { key: "2", code: "Digit2" }), parseHotkey("1"))
    ).toBe(false);
  });

  it("rejects non-matching plain keys", () => {
    expect(matchesHotkey(new KeyboardEvent("keydown", { key: "a" }), parseHotkey("s"))).toBe(
      false
    );
  });

  it("rejects a shifted-symbol combo when shift is not held", () => {
    expect(
      matchesHotkey(new KeyboardEvent("keydown", { key: "." }), parseHotkey(">"))
    ).toBe(false);
  });
});

describe("useHotkeys", () => {
  let scope: ReturnType<typeof effectScope>;

  beforeEach(() => {
    scope = effectScope();
  });

  afterEach(() => {
    scope?.stop();
  });

  it("fires the handler on a matching combo", () => {
    const handler = vi.fn();
    scope.run(() => {
      useHotkeys("mod+s", handler);
    });

    const isMac = navigator.platform.toLowerCase().includes("mac");
    fireKeydown(document, isMac ? { key: "s", metaKey: true } : { key: "s", ctrlKey: true });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not fire on a non-matching combo", () => {
    const handler = vi.fn();
    scope.run(() => {
      useHotkeys("escape", handler);
    });

    fireKeydown(document, { key: "a" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("accepts an array of combos, firing on any match", () => {
    const handler = vi.fn();
    scope.run(() => {
      useHotkeys(["escape", "enter"], handler);
    });

    fireKeydown(document, { key: "Enter" });
    expect(handler).toHaveBeenCalledTimes(1);

    fireKeydown(document, { key: "Escape" });
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it("respects a static enabled: false option", () => {
    const handler = vi.fn();
    scope.run(() => {
      useHotkeys("escape", handler, { enabled: false });
    });

    fireKeydown(document, { key: "Escape" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("toggles listening when a reactive enabled ref changes", () => {
    const handler = vi.fn();
    const enabled = ref(false);
    scope.run(() => {
      useHotkeys("escape", handler, { enabled });
    });

    fireKeydown(document, { key: "Escape" });
    expect(handler).not.toHaveBeenCalled();

    enabled.value = true;
    fireKeydown(document, { key: "Escape" });
    expect(handler).toHaveBeenCalledTimes(1);

    enabled.value = false;
    fireKeydown(document, { key: "Escape" });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("calls preventDefault when the option is set and the combo matches", () => {
    const handler = vi.fn();
    scope.run(() => {
      useHotkeys("escape", handler, { preventDefault: true });
    });

    const event = fireKeydown(document, { key: "Escape" });
    expect(event.defaultPrevented).toBe(true);
  });

  it("does not call preventDefault by default", () => {
    const handler = vi.fn();
    scope.run(() => {
      useHotkeys("escape", handler);
    });

    const event = fireKeydown(document, { key: "Escape" });
    expect(event.defaultPrevented).toBe(false);
  });

  it("scopes the listener to a target element instead of the document", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const target = ref<HTMLElement | null>(el);
    const handler = vi.fn();

    scope.run(() => {
      useHotkeys("escape", handler, { target });
    });

    fireKeydown(document, { key: "Escape" });
    expect(handler).not.toHaveBeenCalled();

    fireKeydown(el, { key: "Escape" });
    expect(handler).toHaveBeenCalledTimes(1);

    el.remove();
  });

  it("rebinds when the target ref changes", () => {
    const elA = document.createElement("div");
    const elB = document.createElement("div");
    document.body.append(elA, elB);
    const target = ref<HTMLElement | null>(elA);
    const handler = vi.fn();

    scope.run(() => {
      useHotkeys("escape", handler, { target });
    });

    fireKeydown(elA, { key: "Escape" });
    expect(handler).toHaveBeenCalledTimes(1);

    target.value = elB;
    fireKeydown(elA, { key: "Escape" });
    expect(handler).toHaveBeenCalledTimes(1);

    fireKeydown(elB, { key: "Escape" });
    expect(handler).toHaveBeenCalledTimes(2);

    elA.remove();
    elB.remove();
  });

  it("does not bind when the target resolves to null", () => {
    const target = ref<HTMLElement | null>(null);
    const handler = vi.fn();

    scope.run(() => {
      useHotkeys("escape", handler, { target });
    });

    fireKeydown(document, { key: "Escape" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("cleans up the listener on scope disposal", () => {
    const handler = vi.fn();
    scope.run(() => {
      useHotkeys("escape", handler);
    });

    scope.stop();

    fireKeydown(document, { key: "Escape" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("is a no-op to dispose when never activated", () => {
    const handler = vi.fn();
    const target = ref<HTMLElement | null>(null);
    scope.run(() => {
      useHotkeys("escape", handler, { target });
    });

    expect(() => scope.stop()).not.toThrow();
  });
});

describe("useHotkeys SSR safety", () => {
  const originalDocument = globalThis.document;

  afterAll(() => {
    globalThis.document = originalDocument;
  });

  it("does not throw and does not touch document during setup when document is undefined", () => {
    // @ts-expect-error simulate an SSR environment with no document global
    delete globalThis.document;

    const handler = vi.fn();
    let threw = false;
    const scope = effectScope();
    try {
      scope.run(() => {
        useHotkeys("escape", handler);
      });
    } catch {
      threw = true;
    } finally {
      globalThis.document = originalDocument;
      scope.stop();
    }

    expect(threw).toBe(false);
  });
});
