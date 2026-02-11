import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { defineComponent, ref, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { useCodeViewerEditor } from "../useCodeViewerEditor";
import { useCodeFormat } from "../useCodeFormat";
import type { CodeFormat } from "../types";

/** Create a minimal HTMLPreElement stub for testing */
function createPreElement(content = ""): HTMLPreElement {
  const el = document.createElement("pre");
  el.innerHTML = content;
  el.setAttribute("contenteditable", "true");
  document.body.appendChild(el);
  return el;
}

function createEditor(overrides: Record<string, unknown> = {}) {
  const codeRef = ref<HTMLPreElement | null>(null);
  const codeFormat = useCodeFormat({
    initialFormat: "yaml",
    initialValue: { name: "test" },
  });
  const currentFormat = ref<CodeFormat>("yaml");
  const canEdit = ref(true);
  const editable = ref(false);

  const callbacks = {
    onEmitModelValue: vi.fn(),
    onEmitEditable: vi.fn(),
    onEmitFormat: vi.fn(),
    onExit: vi.fn(),
    onDelete: vi.fn(),
    onOpenLanguageSearch: vi.fn(),
  };

  const editor = useCodeViewerEditor({
    codeRef,
    codeFormat,
    currentFormat,
    canEdit,
    editable,
    ...callbacks,
    ...overrides,
  });

  return { codeRef, codeFormat, currentFormat, canEdit, editable, callbacks, editor };
}

describe("useCodeViewerEditor", () => {
  let preElement: HTMLPreElement | null = null;

  afterEach(() => {
    if (preElement) {
      document.body.removeChild(preElement);
      preElement = null;
    }
    vi.restoreAllMocks();
  });

  describe("initial state", () => {
    it("starts with isEditing false when canEdit but not editable", () => {
      const { editor } = createEditor();
      expect(editor.isEditing.value).toBe(false);
    });

    it("starts with isEditing true when both canEdit and editable", () => {
      const { editor } = createEditor({ editable: ref(true) });
      expect(editor.isEditing.value).toBe(true);
    });

    it("isEditing is false when canEdit is false even if editable", () => {
      const { editor } = createEditor({ canEdit: ref(false), editable: ref(true) });
      expect(editor.isEditing.value).toBe(false);
    });

    it("starts with no validation error", () => {
      const { editor } = createEditor();
      expect(editor.validationError.value).toBeNull();
      expect(editor.hasValidationError.value).toBe(false);
    });

    it("starts with isUserEditing false", () => {
      const { editor } = createEditor();
      expect(editor.isUserEditing.value).toBe(false);
    });

    it("charCount reflects display content length", () => {
      const { editor } = createEditor();
      expect(editor.charCount.value).toBeGreaterThan(0);
    });

    it("isValid is true initially for valid content", () => {
      const { editor } = createEditor();
      expect(editor.isValid.value).toBe(true);
    });
  });

  describe("displayContent", () => {
    it("returns formatted content when not user editing", () => {
      const { editor, codeFormat } = createEditor();
      expect(editor.displayContent.value).toBe(codeFormat.formattedContent.value);
    });

    it("returns editing content when user is editing", () => {
      const { editor, codeRef } = createEditor({ editable: ref(true) });
      preElement = createPreElement("custom content");
      codeRef.value = preElement;

      editor.isUserEditing.value = true;
      editor.editingContent.value = "custom content";
      expect(editor.displayContent.value).toBe("custom content");
    });
  });

  describe("highlightedContent", () => {
    it("returns highlighted content when not user editing", () => {
      const { editor } = createEditor();
      // Should contain syntax-highlighted HTML
      expect(editor.highlightedContent.value).toBeTruthy();
    });

    it("returns cached content when user is editing", () => {
      const { editor } = createEditor();
      editor.isUserEditing.value = true;
      editor.cachedHighlightedContent.value = "<span>cached</span>";
      expect(editor.highlightedContent.value).toBe("<span>cached</span>");
    });
  });

  describe("toggleEdit", () => {
    it("toggles internalEditable", () => {
      const { editor } = createEditor();
      expect(editor.internalEditable.value).toBe(false);
      editor.toggleEdit();
      expect(editor.internalEditable.value).toBe(true);
    });

    it("emits editable state on toggle", () => {
      const { editor, callbacks } = createEditor();
      editor.toggleEdit();
      expect(callbacks.onEmitEditable).toHaveBeenCalledWith(true);
    });

    it("sets editing content from formatted content when entering edit", () => {
      const { editor, codeFormat, codeRef } = createEditor();
      preElement = createPreElement();
      codeRef.value = preElement;
      editor.toggleEdit();
      expect(editor.editingContent.value).toBe(codeFormat.formattedContent.value);
    });

    it("clears validation error when entering edit", () => {
      const { editor, codeRef } = createEditor();
      preElement = createPreElement();
      codeRef.value = preElement;
      editor.validationError.value = { message: "error" };
      editor.toggleEdit();
      expect(editor.validationError.value).toBeNull();
    });

    it("clears validation error when exiting edit", () => {
      const { editor, codeRef } = createEditor({ editable: ref(true) });
      preElement = createPreElement();
      codeRef.value = preElement;
      editor.validationError.value = { message: "error" };
      editor.toggleEdit(); // Toggle off
      expect(editor.validationError.value).toBeNull();
    });

    it("focuses codeRef and sets cursor when entering edit", async () => {
      const { editor, codeRef } = createEditor();
      preElement = createPreElement("some code");
      codeRef.value = preElement;
      editor.toggleEdit();
      await nextTick();
      // Focus should be set
      expect(document.activeElement).toBe(preElement);
    });
  });

  describe("onContentEditableInput", () => {
    it("sets isUserEditing to true", () => {
      const { editor, codeRef } = createEditor({ editable: ref(true) });
      preElement = createPreElement("hello");
      codeRef.value = preElement;

      const event = new Event("input", { bubbles: true });
      Object.defineProperty(event, "target", { value: preElement });
      editor.onContentEditableInput(event);
      expect(editor.isUserEditing.value).toBe(true);
    });

    it("updates editingContent from target innerText", () => {
      const { editor, codeRef } = createEditor({ editable: ref(true) });
      preElement = createPreElement("new content");
      codeRef.value = preElement;

      const event = new Event("input", { bubbles: true });
      Object.defineProperty(event, "target", { value: preElement });
      editor.onContentEditableInput(event);
      expect(editor.editingContent.value).toBe("new content");
    });

    it("does nothing when not editing", () => {
      const { editor } = createEditor({ canEdit: ref(false) });
      const event = new Event("input", { bubbles: true });
      Object.defineProperty(event, "target", { value: document.createElement("div") });
      editor.onContentEditableInput(event);
      expect(editor.isUserEditing.value).toBe(false);
    });
  });

  describe("onContentEditableBlur", () => {
    it("sets isUserEditing to false", () => {
      const { editor, codeRef } = createEditor({ editable: ref(true) });
      preElement = createPreElement("content");
      codeRef.value = preElement;
      editor.isUserEditing.value = true;
      editor.editingContent.value = "name: test\n";

      editor.onContentEditableBlur();
      expect(editor.isUserEditing.value).toBe(false);
    });

    it("emits parsed model value on blur", () => {
      const { editor, codeRef, callbacks } = createEditor({ editable: ref(true) });
      preElement = createPreElement();
      codeRef.value = preElement;
      editor.isUserEditing.value = true;
      editor.editingContent.value = '{"key": "value"}';

      editor.onContentEditableBlur();
      expect(callbacks.onEmitModelValue).toHaveBeenCalled();
    });

    it("emits raw string when content is not parseable", () => {
      const { editor, codeRef, callbacks } = createEditor({ editable: ref(true) });
      preElement = createPreElement();
      codeRef.value = preElement;
      editor.isUserEditing.value = true;
      editor.editingContent.value = "not valid json or yaml{{{";

      editor.onContentEditableBlur();
      expect(callbacks.onEmitModelValue).toHaveBeenCalledWith("not valid json or yaml{{{");
    });

    it("does nothing when not editing", () => {
      const { editor, callbacks } = createEditor();
      editor.onContentEditableBlur();
      expect(callbacks.onEmitModelValue).not.toHaveBeenCalled();
    });

    it("does nothing when not user editing", () => {
      const { editor, callbacks } = createEditor({ editable: ref(true) });
      editor.isUserEditing.value = false;
      editor.onContentEditableBlur();
      expect(callbacks.onEmitModelValue).not.toHaveBeenCalled();
    });

    it("validates content on blur", () => {
      const { editor, codeRef, currentFormat } = createEditor({ editable: ref(true) });
      preElement = createPreElement();
      codeRef.value = preElement;
      currentFormat.value = "json";
      editor.isUserEditing.value = true;
      editor.editingContent.value = "{invalid json";

      editor.onContentEditableBlur();
      expect(editor.validationError.value).not.toBeNull();
    });

    it("updates innerHTML with highlighted content on blur", () => {
      const { editor, codeRef } = createEditor({ editable: ref(true) });
      preElement = createPreElement();
      codeRef.value = preElement;
      editor.isUserEditing.value = true;
      editor.editingContent.value = "name: test\n";

      editor.onContentEditableBlur();
      expect(preElement.innerHTML).toBeTruthy();
    });

    it("clears pending highlight timeout on blur", () => {
      const { editor, codeRef } = createEditor({ editable: ref(true) });
      preElement = createPreElement("content");
      codeRef.value = preElement;

      // Trigger input to start debounced highlight (sets highlightTimeout)
      const inputEvent = new Event("input", { bubbles: true });
      Object.defineProperty(inputEvent, "target", { value: preElement });
      editor.onContentEditableInput(inputEvent);

      // Now blur — should clear the pending highlight timeout without error
      editor.onContentEditableBlur();
      expect(editor.isUserEditing.value).toBe(false);
    });
  });

  describe("syncEditableFromProp", () => {
    it("updates internalEditable from prop value", () => {
      const { editor } = createEditor();
      editor.syncEditableFromProp(true);
      expect(editor.internalEditable.value).toBe(true);
    });
  });

  describe("syncEditingContentFromValue", () => {
    it("updates editing content when not user editing", () => {
      const { editor, codeFormat } = createEditor();
      codeFormat.setContent("name: test\nvalue: 42\n");
      editor.syncEditingContentFromValue();
      // Should update to formatted content
      expect(editor.editingContent.value).toBeTruthy();
    });

    it("does not update editing content when user is editing", () => {
      const { editor } = createEditor();
      editor.isUserEditing.value = true;
      editor.editingContent.value = "user content";
      editor.syncEditingContentFromValue();
      expect(editor.editingContent.value).toBe("user content");
    });
  });

  describe("updateEditingContentOnFormatChange", () => {
    it("updates editing content when in edit mode", async () => {
      const { editor, codeRef, codeFormat } = createEditor({ editable: ref(true) });
      preElement = createPreElement();
      codeRef.value = preElement;

      codeFormat.setFormat("json");
      editor.updateEditingContentOnFormatChange();
      // Content should have changed to JSON format
      expect(editor.editingContent.value).toBeTruthy();
    });

    it("updates codeRef innerHTML via nextTick when codeRef is available", async () => {
      const { editor, codeRef, codeFormat } = createEditor({ editable: ref(true) });
      preElement = createPreElement();
      codeRef.value = preElement;

      codeFormat.setFormat("json");
      editor.updateEditingContentOnFormatChange();
      await nextTick();

      // After nextTick, innerHTML should be set (browser may normalize entities)
      expect(preElement.innerHTML).toBeTruthy();
      expect(preElement.innerHTML).toContain("syntax-key");
    });

    it("does nothing when not editing", () => {
      const { editor } = createEditor();
      const content = editor.editingContent.value;
      editor.updateEditingContentOnFormatChange();
      expect(editor.editingContent.value).toBe(content);
    });
  });

  describe("onKeyDown", () => {
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

    describe("format shortcut (Ctrl+Alt+L)", () => {
      it("cycles format on Ctrl+Alt+L", () => {
        const { editor, callbacks, currentFormat } = createEditor();
        currentFormat.value = "yaml";
        const event = createKeyEvent("l", { ctrlKey: true, altKey: true });
        editor.onKeyDown(event);
        expect(callbacks.onEmitFormat).toHaveBeenCalledWith("json");
      });

      it("cycles format with Meta+Alt+L", () => {
        const { editor, callbacks, currentFormat } = createEditor();
        currentFormat.value = "json";
        const event = createKeyEvent("l", { metaKey: true, altKey: true });
        editor.onKeyDown(event);
        expect(callbacks.onEmitFormat).toHaveBeenCalledWith("yaml");
      });

      it("opens language search on Ctrl+Alt+Shift+L", () => {
        const { editor, callbacks } = createEditor();
        const event = createKeyEvent("l", { ctrlKey: true, altKey: true, shiftKey: true });
        editor.onKeyDown(event);
        expect(callbacks.onOpenLanguageSearch).toHaveBeenCalled();
      });

      it("does not cycle when only one format available", () => {
        const { editor, callbacks, currentFormat } = createEditor();
        currentFormat.value = "css";
        const event = createKeyEvent("l", { ctrlKey: true, altKey: true });
        editor.onKeyDown(event);
        expect(callbacks.onEmitFormat).not.toHaveBeenCalled();
      });

      it("works even when not in editing mode", () => {
        const { editor, callbacks } = createEditor();
        const event = createKeyEvent("l", { ctrlKey: true, altKey: true });
        editor.onKeyDown(event);
        expect(callbacks.onEmitFormat).toHaveBeenCalled();
      });
    });

    describe("delete on empty (Backspace/Delete)", () => {
      it("calls onDelete when Backspace pressed on empty content", () => {
        const { editor, callbacks } = createEditor({ editable: ref(true) });
        editor.editingContent.value = "";
        const event = createKeyEvent("Backspace");
        editor.onKeyDown(event);
        expect(callbacks.onDelete).toHaveBeenCalled();
      });

      it("calls onDelete when Delete pressed on empty content", () => {
        const { editor, callbacks } = createEditor({ editable: ref(true) });
        editor.editingContent.value = "  ";
        const event = createKeyEvent("Delete");
        editor.onKeyDown(event);
        expect(callbacks.onDelete).toHaveBeenCalled();
      });

      it("does not call onDelete when content is non-empty", () => {
        const { editor, callbacks } = createEditor({ editable: ref(true) });
        editor.editingContent.value = "some content";
        const event = createKeyEvent("Backspace");
        editor.onKeyDown(event);
        expect(callbacks.onDelete).not.toHaveBeenCalled();
      });

      it("does not call onDelete when no onDelete callback", () => {
        const { editor } = createEditor({
          editable: ref(true),
          onDelete: undefined,
        });
        editor.editingContent.value = "";
        const event = createKeyEvent("Backspace");
        // Should not throw
        editor.onKeyDown(event);
      });
    });

    describe("Ctrl+Enter", () => {
      it("calls onExit and emits value", () => {
        const { editor, callbacks } = createEditor({ editable: ref(true) });
        editor.editingContent.value = "name: test\n";
        const event = createKeyEvent("Enter", { ctrlKey: true });
        editor.onKeyDown(event);
        expect(callbacks.onExit).toHaveBeenCalled();
        expect(callbacks.onEmitModelValue).toHaveBeenCalled();
      });

      it("emits raw string when content is not parseable", () => {
        const { editor, callbacks } = createEditor({ editable: ref(true) });
        editor.editingContent.value = "not valid{{{";
        const event = createKeyEvent("Enter", { ctrlKey: true });
        editor.onKeyDown(event);
        expect(callbacks.onEmitModelValue).toHaveBeenCalledWith("not valid{{{");
      });

      it("does nothing when no onExit callback", () => {
        const { editor, callbacks } = createEditor({
          editable: ref(true),
          onExit: undefined,
        });
        editor.editingContent.value = "name: test\n";
        const event = createKeyEvent("Enter", { ctrlKey: true });
        editor.onKeyDown(event);
        expect(callbacks.onEmitModelValue).not.toHaveBeenCalled();
      });
    });

    describe("Tab", () => {
      it("inserts 2 spaces when Tab pressed", () => {
        const { editor, codeRef } = createEditor({ editable: ref(true) });
        preElement = createPreElement("hello");
        codeRef.value = preElement;

        // Place cursor
        const range = document.createRange();
        range.selectNodeContents(preElement);
        range.collapse(false);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);

        const event = createKeyEvent("Tab");
        editor.onKeyDown(event);
        expect(preElement.textContent).toContain("  ");
      });

      it("does nothing when not editing", () => {
        const { editor } = createEditor();
        const event = createKeyEvent("Tab");
        editor.onKeyDown(event);
        // No error thrown
      });
    });

    describe("Escape", () => {
      it("exits edit mode on Escape", () => {
        const { editor, callbacks, codeRef } = createEditor({ editable: ref(true) });
        preElement = createPreElement();
        codeRef.value = preElement;
        editor.isUserEditing.value = true;
        editor.editingContent.value = "name: test\n";

        const event = createKeyEvent("Escape");
        editor.onKeyDown(event);
        expect(callbacks.onEmitEditable).toHaveBeenCalledWith(false);
      });
    });

    describe("Ctrl+S", () => {
      it("saves (blurs) on Ctrl+S", () => {
        const { editor, codeRef } = createEditor({ editable: ref(true) });
        preElement = createPreElement();
        codeRef.value = preElement;
        editor.isUserEditing.value = true;
        editor.editingContent.value = "name: test\n";

        const event = createKeyEvent("s", { ctrlKey: true });
        editor.onKeyDown(event);
        expect(editor.isUserEditing.value).toBe(false);
      });
    });

    describe("Ctrl+A", () => {
      it("selects all within code element on Ctrl+A", () => {
        const { editor, codeRef } = createEditor({ editable: ref(true) });
        preElement = createPreElement("some content here");
        codeRef.value = preElement;

        const event = createKeyEvent("a", { ctrlKey: true });
        editor.onKeyDown(event);
        const selection = window.getSelection();
        expect(selection?.toString()).toBe("some content here");
      });
    });

    describe("Enter (smart indent)", () => {
      it("inserts newline with indent on Enter", () => {
        const { editor, codeRef } = createEditor({ editable: ref(true) });
        preElement = createPreElement("key:");
        codeRef.value = preElement;

        // Place cursor at end
        const range = document.createRange();
        range.selectNodeContents(preElement);
        range.collapse(false);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);

        const event = createKeyEvent("Enter");
        editor.onKeyDown(event);
        expect(preElement.textContent).toContain("\n");
      });

      it("handles Enter when no selection", () => {
        const { editor, codeRef } = createEditor({ editable: ref(true) });
        preElement = createPreElement("hello");
        codeRef.value = preElement;

        // Clear selection
        window.getSelection()?.removeAllRanges();

        const event = createKeyEvent("Enter");
        // Should not throw
        editor.onKeyDown(event);
      });

      it("handles Enter when selection is outside codeRef", () => {
        const { editor, codeRef } = createEditor({ editable: ref(true) });
        preElement = createPreElement("hello");
        codeRef.value = preElement;

        // Create an external element and place the selection there
        const externalEl = document.createElement("div");
        externalEl.textContent = "external";
        document.body.appendChild(externalEl);

        const range = document.createRange();
        range.selectNodeContents(externalEl);
        range.collapse(false);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);

        const event = createKeyEvent("Enter");
        editor.onKeyDown(event);

        // Should have moved selection into codeRef and inserted a newline
        expect(preElement.textContent).toContain("\n");

        document.body.removeChild(externalEl);
      });
    });

    it("non-editing keys are ignored when not in edit mode", () => {
      const { editor, callbacks } = createEditor();
      const event = createKeyEvent("Enter");
      editor.onKeyDown(event);
      expect(callbacks.onExit).not.toHaveBeenCalled();
    });
  });

  describe("initialization in edit mode", () => {
    it("initializes editing content when starting in edit mode", async () => {
      const { editor, codeRef, codeFormat } = createEditor({ editable: ref(true) });
      preElement = createPreElement();
      codeRef.value = preElement;
      expect(editor.editingContent.value).toBe(codeFormat.formattedContent.value);

      await nextTick();
      // codeRef should have innerHTML set
      expect(preElement.innerHTML).toBeTruthy();
    });
  });

  describe("isValid", () => {
    it("returns false when validation error exists", () => {
      const { editor } = createEditor();
      editor.validationError.value = { message: "error" };
      expect(editor.isValid.value).toBe(false);
    });

    it("returns true when no validation error and format is valid", () => {
      const { editor } = createEditor();
      expect(editor.isValid.value).toBe(true);
    });
  });

  describe("charCount", () => {
    it("returns 0 for empty content", () => {
      const codeFormat = useCodeFormat({ initialFormat: "text", initialValue: "" });
      const codeRef = ref<HTMLPreElement | null>(null);
      const editor = useCodeViewerEditor({
        codeRef,
        codeFormat,
        currentFormat: ref<CodeFormat>("text"),
        canEdit: ref(false),
        editable: ref(false),
        onEmitModelValue: vi.fn(),
        onEmitEditable: vi.fn(),
      });
      expect(editor.charCount.value).toBe(0);
    });
  });

  describe("debounced functions", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("debouncedValidate runs validation after 300ms timeout", () => {
      const { editor, codeRef, currentFormat } = createEditor({ editable: ref(true) });
      preElement = createPreElement('{"invalid json');
      codeRef.value = preElement;
      currentFormat.value = "json";

      // Trigger input to start debounced validate
      const event = new Event("input", { bubbles: true });
      Object.defineProperty(event, "target", { value: preElement });
      editor.onContentEditableInput(event);

      // Validation should not have run yet
      expect(editor.validationError.value).toBeNull();

      // Advance past the 300ms debounce
      vi.advanceTimersByTime(300);

      // Now validation should have run and found an error
      expect(editor.validationError.value).not.toBeNull();
    });

    it("debouncedHighlight updates innerHTML with syntax-highlighted content after 300ms", () => {
      const { editor, codeRef, currentFormat } = createEditor({ editable: ref(true) });
      preElement = createPreElement("name: test");
      codeRef.value = preElement;
      currentFormat.value = "yaml";

      // Focus the element so it's the active element
      preElement.focus();

      // Trigger input
      const event = new Event("input", { bubbles: true });
      Object.defineProperty(event, "target", { value: preElement });
      editor.onContentEditableInput(event);

      // Advance past the 300ms debounce
      vi.advanceTimersByTime(300);

      // innerHTML should have been updated with syntax highlighting
      expect(preElement.innerHTML).toBeTruthy();
    });

    it("debouncedHighlight skips when codeRef is null", () => {
      const { editor, codeRef } = createEditor({ editable: ref(true) });
      preElement = createPreElement("content");
      codeRef.value = preElement;

      // Trigger input to start debounced highlight
      const event = new Event("input", { bubbles: true });
      Object.defineProperty(event, "target", { value: preElement });
      editor.onContentEditableInput(event);

      // Set codeRef to null before debounce fires
      codeRef.value = null;

      // Advance past debounce - should not throw
      vi.advanceTimersByTime(300);
    });

    it("debouncedHighlight restores focus if element had focus", () => {
      const { editor, codeRef, currentFormat } = createEditor({ editable: ref(true) });
      preElement = createPreElement("key: value");
      codeRef.value = preElement;
      currentFormat.value = "yaml";

      // Focus the element
      preElement.focus();
      expect(document.activeElement).toBe(preElement);

      // Trigger input
      const event = new Event("input", { bubbles: true });
      Object.defineProperty(event, "target", { value: preElement });
      editor.onContentEditableInput(event);

      // Advance past debounce
      vi.advanceTimersByTime(300);

      // Focus should be maintained
      expect(document.activeElement).toBe(preElement);
    });

    it("debouncedHighlight calls focus() when element had focus but lost it during innerHTML update", () => {
      const { editor, codeRef, currentFormat } = createEditor({ editable: ref(true) });
      preElement = createPreElement("name: test");
      codeRef.value = preElement;
      currentFormat.value = "yaml";

      // Focus the element initially so hasFocus will be true
      preElement.focus();
      expect(document.activeElement).toBe(preElement);

      // Trigger input to start debounced highlight
      const event = new Event("input", { bubbles: true });
      Object.defineProperty(event, "target", { value: preElement });
      editor.onContentEditableInput(event);

      // Spy on focus to detect if it's called
      const focusSpy = vi.spyOn(preElement, "focus");

      // Intercept the innerHTML setter so that when the debounced highlight
      // sets innerHTML, we move focus away — simulating the browser behavior
      // where setting innerHTML on a focused element causes it to lose focus.
      const originalDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML");
      Object.defineProperty(preElement, "innerHTML", {
        set(value: string) {
          // Call original setter
          originalDescriptor!.set!.call(this, value);
          // Simulate focus loss (browser moves focus to body after innerHTML change)
          document.body.focus();
        },
        get() {
          return originalDescriptor!.get!.call(this);
        },
        configurable: true,
      });

      // Advance past debounce — the highlight callback runs
      vi.advanceTimersByTime(300);

      // The code should have called focus() to restore it
      expect(focusSpy).toHaveBeenCalled();

      // Clean up the property override
      delete (preElement as unknown as Record<string, unknown>)["innerHTML"];
    });

    it("debouncedEmit calls onEmitModelValue after default 300ms debounce", () => {
      const { editor, codeRef, callbacks } = createEditor({ editable: ref(true) });
      preElement = createPreElement("name: changed");
      codeRef.value = preElement;

      const event = new Event("input", { bubbles: true });
      Object.defineProperty(event, "target", { value: preElement });
      editor.onContentEditableInput(event);

      // Should not have emitted yet
      expect(callbacks.onEmitModelValue).not.toHaveBeenCalled();

      // Advance past the 300ms debounce
      vi.advanceTimersByTime(300);

      // Now it should have emitted
      expect(callbacks.onEmitModelValue).toHaveBeenCalled();
    });

    it("debouncedEmit respects custom debounceMs", () => {
      const { editor, codeRef, callbacks } = createEditor({
        editable: ref(true),
        debounceMs: 100,
      });
      preElement = createPreElement("name: fast");
      codeRef.value = preElement;

      const event = new Event("input", { bubbles: true });
      Object.defineProperty(event, "target", { value: preElement });
      editor.onContentEditableInput(event);

      // Should not have emitted at 50ms
      vi.advanceTimersByTime(50);
      expect(callbacks.onEmitModelValue).not.toHaveBeenCalled();

      // Should emit at 100ms
      vi.advanceTimersByTime(50);
      expect(callbacks.onEmitModelValue).toHaveBeenCalled();
    });

    it("debouncedEmit with debounceMs 0 emits immediately", () => {
      const { editor, codeRef, callbacks } = createEditor({
        editable: ref(true),
        debounceMs: 0,
      });
      preElement = createPreElement("name: immediate");
      codeRef.value = preElement;

      const event = new Event("input", { bubbles: true });
      Object.defineProperty(event, "target", { value: preElement });
      editor.onContentEditableInput(event);

      // Should have emitted immediately (no timer needed)
      expect(callbacks.onEmitModelValue).toHaveBeenCalled();
    });

    it("blur clears pending emit timeout and emits immediately", () => {
      const { editor, codeRef, callbacks } = createEditor({ editable: ref(true) });
      preElement = createPreElement("name: blur-test");
      codeRef.value = preElement;

      // Trigger input to start debounced emit
      const event = new Event("input", { bubbles: true });
      Object.defineProperty(event, "target", { value: preElement });
      editor.onContentEditableInput(event);

      // Not yet emitted
      expect(callbacks.onEmitModelValue).not.toHaveBeenCalled();

      // Blur should emit immediately
      editor.onContentEditableBlur();
      expect(callbacks.onEmitModelValue).toHaveBeenCalled();
    });

    it("debouncedValidate clears previous timeout on rapid calls", () => {
      const { editor, codeRef, currentFormat } = createEditor({ editable: ref(true) });
      preElement = createPreElement('{"key": "value"}');
      codeRef.value = preElement;
      currentFormat.value = "json";

      // First input
      const event1 = new Event("input", { bubbles: true });
      Object.defineProperty(event1, "target", { value: preElement });
      editor.onContentEditableInput(event1);

      vi.advanceTimersByTime(200);

      // Second input before first fires
      preElement.innerText = "{invalid json";
      const event2 = new Event("input", { bubbles: true });
      Object.defineProperty(event2, "target", { value: preElement });
      editor.onContentEditableInput(event2);

      vi.advanceTimersByTime(200);
      // First timeout was cleared, second hasn't fired yet
      expect(editor.validationError.value).toBeNull();

      vi.advanceTimersByTime(100);
      // Now second timeout fired
      expect(editor.validationError.value).not.toBeNull();
    });
  });

  describe("format shortcut without callbacks", () => {
    it("does not error when onEmitFormat is undefined", () => {
      const { editor, currentFormat } = createEditor({ onEmitFormat: undefined });
      currentFormat.value = "yaml";
      const event = new KeyboardEvent("keydown", {
        key: "l",
        ctrlKey: true,
        altKey: true,
        bubbles: true,
        cancelable: true,
      });
      // Should not throw
      editor.onKeyDown(event);
    });

    it("does not error when onOpenLanguageSearch is undefined", () => {
      const { editor } = createEditor({ onOpenLanguageSearch: undefined });
      const event = new KeyboardEvent("keydown", {
        key: "l",
        ctrlKey: true,
        altKey: true,
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });
      // Should not throw
      editor.onKeyDown(event);
    });
  });

  describe("onUnmounted cleanup", () => {
    it("clears pending timeouts on unmount", async () => {
      vi.useFakeTimers();
      const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

      const wrapper = mount(
        defineComponent({
          setup() {
            const codeRef = ref<HTMLPreElement | null>(null);
            const codeFormat = useCodeFormat({
              initialFormat: "yaml",
              initialValue: { name: "test" },
            });
            const currentFormat = ref<CodeFormat>("yaml");
            const canEdit = ref(true);
            const editable = ref(true);

            const editor = useCodeViewerEditor({
              codeRef,
              codeFormat,
              currentFormat,
              canEdit,
              editable,
              onEmitModelValue: vi.fn(),
              onEmitEditable: vi.fn(),
            });

            return { editor, codeRef };
          },
          template: "<pre ref='codeRef'>test</pre>",
        })
      );

      const editor = wrapper.vm.editor;
      const pre = wrapper.find("pre").element as HTMLPreElement;

      // Trigger input to create pending timeouts
      const inputEvent = new Event("input", { bubbles: true });
      Object.defineProperty(inputEvent, "target", { value: pre });
      editor.onContentEditableInput(inputEvent);

      clearTimeoutSpy.mockClear();
      wrapper.unmount();

      expect(clearTimeoutSpy.mock.calls.length).toBeGreaterThanOrEqual(3);
      clearTimeoutSpy.mockRestore();
      vi.useRealTimers();
    });
  });
});
