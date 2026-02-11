import { describe, it, expect, vi, afterEach } from "vitest";
import { ref } from "vue";
import { createKeyboardHandlers } from "../codeViewerKeyHandlers";
import type { CodeFormat } from "../types";
import type { KeyboardHandlerDeps } from "../codeViewerKeyHandlers";

/** Create a minimal HTMLPreElement stub for testing */
function createPreElement(content = ""): HTMLPreElement {
  const el = document.createElement("pre");
  el.innerHTML = content;
  el.setAttribute("contenteditable", "true");
  document.body.appendChild(el);
  return el;
}

function createKeyEvent(
  key: string,
  modifiers: { ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean; shiftKey?: boolean } = {}
): KeyboardEvent {
  return new KeyboardEvent("keydown", {
    key,
    ctrlKey: modifiers.ctrlKey ?? false,
    metaKey: modifiers.metaKey ?? false,
    altKey: modifiers.altKey ?? false,
    shiftKey: modifiers.shiftKey ?? false,
    bubbles: true,
    cancelable: true,
  });
}

function createDeps(overrides: Partial<KeyboardHandlerDeps> = {}): KeyboardHandlerDeps {
  return {
    codeRef: ref<HTMLPreElement | null>(null),
    currentFormat: ref<CodeFormat>("yaml"),
    editingContent: ref(""),
    isEditing: ref(true),
    parseThenEmit: vi.fn(),
    onEmitFormat: vi.fn(),
    onExit: vi.fn(),
    onDelete: vi.fn(),
    onOpenLanguageSearch: vi.fn(),
    onContentEditableBlur: vi.fn(),
    toggleEdit: vi.fn(),
    ...overrides,
  };
}

describe("createKeyboardHandlers", () => {
  let preElement: HTMLPreElement | null = null;

  afterEach(() => {
    if (preElement) {
      document.body.removeChild(preElement);
      preElement = null;
    }
  });

  it("returns an onKeyDown function", () => {
    const deps = createDeps();
    const { onKeyDown } = createKeyboardHandlers(deps);
    expect(typeof onKeyDown).toBe("function");
  });

  describe("format shortcut (Ctrl+Alt+L)", () => {
    it("cycles format on Ctrl+Alt+L", () => {
      const deps = createDeps();
      deps.currentFormat.value = "yaml";
      const { onKeyDown } = createKeyboardHandlers(deps);

      const event = createKeyEvent("l", { ctrlKey: true, altKey: true });
      onKeyDown(event);
      expect(deps.onEmitFormat).toHaveBeenCalledWith("json");
    });

    it("cycles format with Meta+Alt+L", () => {
      const deps = createDeps();
      deps.currentFormat.value = "json";
      const { onKeyDown } = createKeyboardHandlers(deps);

      const event = createKeyEvent("l", { metaKey: true, altKey: true });
      onKeyDown(event);
      expect(deps.onEmitFormat).toHaveBeenCalledWith("yaml");
    });

    it("opens language search on Ctrl+Alt+Shift+L", () => {
      const deps = createDeps();
      const { onKeyDown } = createKeyboardHandlers(deps);

      const event = createKeyEvent("l", { ctrlKey: true, altKey: true, shiftKey: true });
      onKeyDown(event);
      expect(deps.onOpenLanguageSearch).toHaveBeenCalled();
    });

    it("does not cycle when only one format available", () => {
      const deps = createDeps();
      deps.currentFormat.value = "css";
      const { onKeyDown } = createKeyboardHandlers(deps);

      const event = createKeyEvent("l", { ctrlKey: true, altKey: true });
      onKeyDown(event);
      expect(deps.onEmitFormat).not.toHaveBeenCalled();
    });

    it("works even when not in editing mode", () => {
      const deps = createDeps();
      deps.isEditing.value = false;
      const { onKeyDown } = createKeyboardHandlers(deps);

      const event = createKeyEvent("l", { ctrlKey: true, altKey: true });
      onKeyDown(event);
      expect(deps.onEmitFormat).toHaveBeenCalled();
    });

    it("prevents default on the event", () => {
      const deps = createDeps();
      const { onKeyDown } = createKeyboardHandlers(deps);

      const event = createKeyEvent("l", { ctrlKey: true, altKey: true });
      onKeyDown(event);
      expect(event.defaultPrevented).toBe(true);
    });

    it("does not error when onEmitFormat is undefined", () => {
      const deps = createDeps({ onEmitFormat: undefined });
      deps.currentFormat.value = "yaml";
      const { onKeyDown } = createKeyboardHandlers(deps);

      const event = createKeyEvent("l", { ctrlKey: true, altKey: true });
      onKeyDown(event);
    });

    it("does not error when onOpenLanguageSearch is undefined", () => {
      const deps = createDeps({ onOpenLanguageSearch: undefined });
      const { onKeyDown } = createKeyboardHandlers(deps);

      const event = createKeyEvent("l", { ctrlKey: true, altKey: true, shiftKey: true });
      onKeyDown(event);
    });
  });

  describe("delete on empty (Backspace/Delete)", () => {
    it("calls onDelete when Backspace pressed on empty content", () => {
      const deps = createDeps();
      deps.editingContent.value = "";
      const { onKeyDown } = createKeyboardHandlers(deps);

      const event = createKeyEvent("Backspace");
      onKeyDown(event);
      expect(deps.onDelete).toHaveBeenCalled();
    });

    it("calls onDelete when Delete pressed on whitespace-only content", () => {
      const deps = createDeps();
      deps.editingContent.value = "  ";
      const { onKeyDown } = createKeyboardHandlers(deps);

      const event = createKeyEvent("Delete");
      onKeyDown(event);
      expect(deps.onDelete).toHaveBeenCalled();
    });

    it("does not call onDelete when content is non-empty", () => {
      const deps = createDeps();
      deps.editingContent.value = "some content";
      const { onKeyDown } = createKeyboardHandlers(deps);

      const event = createKeyEvent("Backspace");
      onKeyDown(event);
      expect(deps.onDelete).not.toHaveBeenCalled();
    });

    it("does not call onDelete when no onDelete callback", () => {
      const deps = createDeps({ onDelete: undefined });
      deps.editingContent.value = "";
      const { onKeyDown } = createKeyboardHandlers(deps);

      const event = createKeyEvent("Backspace");
      onKeyDown(event);
      // Should not throw
    });

    it("stops propagation when handled", () => {
      const deps = createDeps();
      deps.editingContent.value = "";
      const { onKeyDown } = createKeyboardHandlers(deps);

      const event = createKeyEvent("Backspace");
      const stopSpy = vi.spyOn(event, "stopPropagation");
      onKeyDown(event);
      expect(stopSpy).toHaveBeenCalled();
    });
  });

  describe("Ctrl+Enter", () => {
    it("calls parseThenEmit and onExit", () => {
      const deps = createDeps();
      deps.editingContent.value = "name: test\n";
      const { onKeyDown } = createKeyboardHandlers(deps);

      const event = createKeyEvent("Enter", { ctrlKey: true });
      onKeyDown(event);
      expect(deps.parseThenEmit).toHaveBeenCalledWith("name: test\n");
      expect(deps.onExit).toHaveBeenCalled();
    });

    it("works with Meta+Enter", () => {
      const deps = createDeps();
      deps.editingContent.value = "content";
      const { onKeyDown } = createKeyboardHandlers(deps);

      const event = createKeyEvent("Enter", { metaKey: true });
      onKeyDown(event);
      expect(deps.onExit).toHaveBeenCalled();
    });

    it("does nothing when no onExit callback", () => {
      const deps = createDeps({ onExit: undefined });
      deps.editingContent.value = "name: test\n";
      const { onKeyDown } = createKeyboardHandlers(deps);

      const event = createKeyEvent("Enter", { ctrlKey: true });
      onKeyDown(event);
      expect(deps.parseThenEmit).not.toHaveBeenCalled();
    });
  });

  describe("Tab", () => {
    it("inserts 2 spaces when Tab pressed", () => {
      const deps = createDeps();
      preElement = createPreElement("hello");
      deps.codeRef.value = preElement;

      // Place cursor at end
      const range = document.createRange();
      range.selectNodeContents(preElement);
      range.collapse(false);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);

      const { onKeyDown } = createKeyboardHandlers(deps);
      const event = createKeyEvent("Tab");
      onKeyDown(event);
      expect(preElement.textContent).toContain("  ");
    });

    it("does nothing when not editing", () => {
      const deps = createDeps();
      deps.isEditing.value = false;
      const { onKeyDown } = createKeyboardHandlers(deps);

      const event = createKeyEvent("Tab");
      onKeyDown(event);
      // Should not throw
    });
  });

  describe("Escape", () => {
    it("calls onContentEditableBlur and toggleEdit", () => {
      const deps = createDeps();
      const { onKeyDown } = createKeyboardHandlers(deps);

      const event = createKeyEvent("Escape");
      onKeyDown(event);
      expect(deps.onContentEditableBlur).toHaveBeenCalled();
      expect(deps.toggleEdit).toHaveBeenCalled();
    });

    it("prevents default", () => {
      const deps = createDeps();
      const { onKeyDown } = createKeyboardHandlers(deps);

      const event = createKeyEvent("Escape");
      onKeyDown(event);
      expect(event.defaultPrevented).toBe(true);
    });
  });

  describe("Ctrl+S", () => {
    it("calls onContentEditableBlur on Ctrl+S", () => {
      const deps = createDeps();
      const { onKeyDown } = createKeyboardHandlers(deps);

      const event = createKeyEvent("s", { ctrlKey: true });
      onKeyDown(event);
      expect(deps.onContentEditableBlur).toHaveBeenCalled();
    });

    it("works with Meta+S", () => {
      const deps = createDeps();
      const { onKeyDown } = createKeyboardHandlers(deps);

      const event = createKeyEvent("s", { metaKey: true });
      onKeyDown(event);
      expect(deps.onContentEditableBlur).toHaveBeenCalled();
    });
  });

  describe("Ctrl+A", () => {
    it("selects all within code element on Ctrl+A", () => {
      const deps = createDeps();
      preElement = createPreElement("some content here");
      deps.codeRef.value = preElement;

      const { onKeyDown } = createKeyboardHandlers(deps);
      const event = createKeyEvent("a", { ctrlKey: true });
      onKeyDown(event);
      const selection = window.getSelection();
      expect(selection?.toString()).toBe("some content here");
    });

    it("stops propagation", () => {
      const deps = createDeps();
      preElement = createPreElement("content");
      deps.codeRef.value = preElement;

      const { onKeyDown } = createKeyboardHandlers(deps);
      const event = createKeyEvent("a", { ctrlKey: true });
      const stopSpy = vi.spyOn(event, "stopPropagation");
      onKeyDown(event);
      // stopPropagation is called twice: once by handleCtrlA and once by the dispatcher
      expect(stopSpy).toHaveBeenCalled();
    });
  });

  describe("Enter (smart indent)", () => {
    it("inserts newline with indent on Enter", () => {
      const deps = createDeps();
      preElement = createPreElement("key:");
      deps.codeRef.value = preElement;

      // Place cursor at end
      const range = document.createRange();
      range.selectNodeContents(preElement);
      range.collapse(false);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);

      const { onKeyDown } = createKeyboardHandlers(deps);
      const event = createKeyEvent("Enter");
      onKeyDown(event);
      expect(preElement.textContent).toContain("\n");
    });

    it("handles Enter when no selection range", () => {
      const deps = createDeps();
      preElement = createPreElement("hello");
      deps.codeRef.value = preElement;

      // Clear selection
      window.getSelection()?.removeAllRanges();

      const { onKeyDown } = createKeyboardHandlers(deps);
      const event = createKeyEvent("Enter");
      onKeyDown(event);
      // Should not throw
    });

    it("handles Enter when selection is outside codeRef", () => {
      const deps = createDeps();
      preElement = createPreElement("hello");
      deps.codeRef.value = preElement;

      // Create an external element and place the selection there
      const externalEl = document.createElement("div");
      externalEl.textContent = "external";
      document.body.appendChild(externalEl);

      const range = document.createRange();
      range.selectNodeContents(externalEl);
      range.collapse(false);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);

      const { onKeyDown } = createKeyboardHandlers(deps);
      const event = createKeyEvent("Enter");
      onKeyDown(event);

      // Should have moved selection into codeRef and inserted a newline
      expect(preElement.textContent).toContain("\n");

      document.body.removeChild(externalEl);
    });
  });

  describe("dispatcher routing", () => {
    it("non-editing keys are ignored when not in edit mode", () => {
      const deps = createDeps();
      deps.isEditing.value = false;
      const { onKeyDown } = createKeyboardHandlers(deps);

      const event = createKeyEvent("Enter");
      onKeyDown(event);
      expect(deps.onExit).not.toHaveBeenCalled();
    });

    it("unhandled keys pass through without action", () => {
      const deps = createDeps();
      deps.editingContent.value = "content";
      const { onKeyDown } = createKeyboardHandlers(deps);

      const event = createKeyEvent("x");
      onKeyDown(event);
      expect(event.defaultPrevented).toBe(false);
    });
  });
});
