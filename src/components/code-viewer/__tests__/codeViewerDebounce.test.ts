import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref } from "vue";
import { createDebouncedOperations } from "../codeViewerDebounce";
import type { CodeFormat, ValidationError } from "../types";
import type { DebounceDeps } from "../codeViewerDebounce";

/** Create a minimal HTMLPreElement stub for testing */
function createPreElement(content = ""): HTMLPreElement {
  const el = document.createElement("pre");
  el.innerHTML = content;
  el.setAttribute("contenteditable", "true");
  document.body.appendChild(el);
  return el;
}

function createDeps(overrides: Partial<DebounceDeps> = {}): DebounceDeps {
  return {
    codeRef: ref<HTMLPreElement | null>(null),
    isEditing: ref(true),
    editingContent: ref(""),
    currentFormat: ref<CodeFormat>("yaml"),
    validationError: ref<ValidationError | null>(null),
    validateWithError: vi.fn(() => null),
    emitCurrentValue: vi.fn(),
    debounceMs: 300,
    ...overrides,
  };
}

describe("createDebouncedOperations", () => {
  let preElement: HTMLPreElement | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    if (preElement) {
      document.body.removeChild(preElement);
      preElement = null;
    }
    vi.useRealTimers();
  });

  it("returns debouncedEmit, debouncedValidate, debouncedHighlight, and clearAllTimeouts", () => {
    const deps = createDeps();
    const result = createDebouncedOperations(deps);
    expect(typeof result.debouncedEmit).toBe("function");
    expect(typeof result.debouncedValidate).toBe("function");
    expect(typeof result.debouncedHighlight).toBe("function");
    expect(typeof result.clearAllTimeouts).toBe("function");
  });

  describe("debouncedEmit", () => {
    it("emits after debounceMs delay", () => {
      const deps = createDeps();
      const { debouncedEmit } = createDebouncedOperations(deps);

      debouncedEmit();
      expect(deps.emitCurrentValue).not.toHaveBeenCalled();

      vi.advanceTimersByTime(300);
      expect(deps.emitCurrentValue).toHaveBeenCalledOnce();
    });

    it("respects custom debounceMs", () => {
      const deps = createDeps({ debounceMs: 100 });
      const { debouncedEmit } = createDebouncedOperations(deps);

      debouncedEmit();
      vi.advanceTimersByTime(50);
      expect(deps.emitCurrentValue).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(deps.emitCurrentValue).toHaveBeenCalledOnce();
    });

    it("emits immediately when debounceMs is 0", () => {
      const deps = createDeps({ debounceMs: 0 });
      const { debouncedEmit } = createDebouncedOperations(deps);

      debouncedEmit();
      expect(deps.emitCurrentValue).toHaveBeenCalledOnce();
    });

    it("cancels previous timeout on rapid calls", () => {
      const deps = createDeps();
      const { debouncedEmit } = createDebouncedOperations(deps);

      debouncedEmit();
      vi.advanceTimersByTime(200);
      debouncedEmit();
      vi.advanceTimersByTime(200);
      expect(deps.emitCurrentValue).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(deps.emitCurrentValue).toHaveBeenCalledOnce();
    });
  });

  describe("debouncedValidate", () => {
    it("runs validation after 300ms", () => {
      const error = { message: "invalid" };
      const deps = createDeps({
        validateWithError: vi.fn(() => error),
        editingContent: ref("bad content"),
        currentFormat: ref<CodeFormat>("json"),
      });
      const { debouncedValidate } = createDebouncedOperations(deps);

      debouncedValidate();
      expect(deps.validationError.value).toBeNull();

      vi.advanceTimersByTime(300);
      expect(deps.validationError.value).toEqual(error);
      expect(deps.validateWithError).toHaveBeenCalledWith("bad content", "json");
    });

    it("cancels previous timeout on rapid calls", () => {
      const deps = createDeps({
        validateWithError: vi.fn(() => ({ message: "error" })),
      });
      const { debouncedValidate } = createDebouncedOperations(deps);

      debouncedValidate();
      vi.advanceTimersByTime(200);
      debouncedValidate();
      vi.advanceTimersByTime(200);
      expect(deps.validationError.value).toBeNull();

      vi.advanceTimersByTime(100);
      expect(deps.validationError.value).not.toBeNull();
    });
  });

  describe("debouncedHighlight", () => {
    it("updates innerHTML with syntax-highlighted content after 300ms", () => {
      const deps = createDeps({
        editingContent: ref("name: test"),
        currentFormat: ref<CodeFormat>("yaml"),
      });
      preElement = createPreElement("name: test");
      deps.codeRef.value = preElement;

      preElement.focus();

      const { debouncedHighlight } = createDebouncedOperations(deps);
      debouncedHighlight();

      vi.advanceTimersByTime(300);
      expect(preElement.innerHTML).toBeTruthy();
    });

    it("skips when codeRef is null", () => {
      const deps = createDeps();
      deps.codeRef.value = null;

      const { debouncedHighlight } = createDebouncedOperations(deps);
      debouncedHighlight();

      // Should not throw
      vi.advanceTimersByTime(300);
    });

    it("skips when isEditing is false", () => {
      const deps = createDeps();
      preElement = createPreElement("content");
      deps.codeRef.value = preElement;

      const { debouncedHighlight } = createDebouncedOperations(deps);
      debouncedHighlight();

      const htmlBefore = preElement.innerHTML;
      deps.isEditing.value = false;
      vi.advanceTimersByTime(300);
      expect(preElement.innerHTML).toBe(htmlBefore);
    });

    it("restores focus if element had focus", () => {
      const deps = createDeps({
        editingContent: ref("key: value"),
        currentFormat: ref<CodeFormat>("yaml"),
      });
      preElement = createPreElement("key: value");
      deps.codeRef.value = preElement;

      preElement.focus();
      expect(document.activeElement).toBe(preElement);

      const { debouncedHighlight } = createDebouncedOperations(deps);
      debouncedHighlight();

      vi.advanceTimersByTime(300);
      expect(document.activeElement).toBe(preElement);
    });

    it("calls focus() when element had focus but lost it during innerHTML update", () => {
      const deps = createDeps({
        editingContent: ref("name: test"),
        currentFormat: ref<CodeFormat>("yaml"),
      });
      preElement = createPreElement("name: test");
      deps.codeRef.value = preElement;

      preElement.focus();
      const focusSpy = vi.spyOn(preElement, "focus");

      // Intercept innerHTML setter to simulate focus loss
      const originalDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML");
      Object.defineProperty(preElement, "innerHTML", {
        set(value: string) {
          originalDescriptor!.set!.call(this, value);
          document.body.focus();
        },
        get() {
          return originalDescriptor!.get!.call(this);
        },
        configurable: true,
      });

      const { debouncedHighlight } = createDebouncedOperations(deps);
      debouncedHighlight();

      vi.advanceTimersByTime(300);
      expect(focusSpy).toHaveBeenCalled();

      delete (preElement as unknown as Record<string, unknown>)["innerHTML"];
    });

    it("cancels previous timeout on rapid calls", () => {
      const deps = createDeps({
        editingContent: ref("name: test"),
      });
      preElement = createPreElement("name: test");
      deps.codeRef.value = preElement;

      const { debouncedHighlight } = createDebouncedOperations(deps);

      debouncedHighlight();
      vi.advanceTimersByTime(200);
      debouncedHighlight();
      vi.advanceTimersByTime(200);

      // Only the second timeout should have fired — no errors
    });
  });

  describe("clearAllTimeouts", () => {
    it("clears all pending timeouts", () => {
      const deps = createDeps({
        validateWithError: vi.fn(() => ({ message: "error" })),
      });
      preElement = createPreElement("content");
      deps.codeRef.value = preElement;

      const { debouncedEmit, debouncedValidate, debouncedHighlight, clearAllTimeouts } =
        createDebouncedOperations(deps);

      debouncedEmit();
      debouncedValidate();
      debouncedHighlight();

      clearAllTimeouts();
      vi.advanceTimersByTime(500);

      // None of the debounced callbacks should have fired
      expect(deps.emitCurrentValue).not.toHaveBeenCalled();
      expect(deps.validationError.value).toBeNull();
    });

    it("is safe to call when no timeouts are pending", () => {
      const deps = createDeps();
      const { clearAllTimeouts } = createDebouncedOperations(deps);

      // Should not throw
      clearAllTimeouts();
    });
  });
});
