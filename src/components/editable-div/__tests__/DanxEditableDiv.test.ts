import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import DanxEditableDiv, { __resetPlaintextOnlySupportCache } from "../DanxEditableDiv.vue";

function getSurface(wrapper: ReturnType<typeof mount>) {
  return wrapper.find(".danx-editable-div");
}

function setText(el: HTMLElement, text: string) {
  el.textContent = text;
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

describe("DanxEditableDiv", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // happy-dom does not implement document.execCommand; stub for paste tests.
    (
      document as unknown as { execCommand: (cmd: string, ui?: boolean, value?: string) => boolean }
    ).execCommand = vi.fn().mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  describe("Rendering", () => {
    it("renders the surface with default md size and div tag", () => {
      const wrapper = mount(DanxEditableDiv, { props: { modelValue: "hello" } });
      const surface = wrapper.find(".danx-editable-div");
      expect(surface.exists()).toBe(true);
      expect(surface.element.tagName).toBe("DIV");
      expect(surface.classes()).toContain("danx-editable-div--md");
    });

    it("renders the modelValue as textContent", () => {
      const wrapper = mount(DanxEditableDiv, { props: { modelValue: "hello world" } });
      expect(wrapper.find(".danx-editable-div").element.textContent).toBe("hello world");
    });

    it.each(["sm", "md", "lg"] as const)("applies size class %s", (size) => {
      const wrapper = mount(DanxEditableDiv, { props: { modelValue: "x", size } });
      expect(wrapper.find(`.danx-editable-div--${size}`).exists()).toBe(true);
    });

    it("renders the surface with as=h2 when configured", () => {
      const wrapper = mount(DanxEditableDiv, { props: { modelValue: "title", as: "h2" } });
      expect(wrapper.find(".danx-editable-div").element.tagName).toBe("H2");
    });

    it("applies block layout class", () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "x", layout: "block" },
      });
      expect(wrapper.find(".danx-editable-div-wrap--block").exists()).toBe(true);
    });

    it("merges contentClass onto the surface", () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "x", contentClass: "my-extra" },
      });
      expect(wrapper.find(".danx-editable-div").classes()).toContain("my-extra");
    });

    it("propagates dataTest to the surface", () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "x", dataTest: "title-edit" },
      });
      expect(wrapper.find('[data-test="title-edit"]').exists()).toBe(true);
    });

    it("renders placeholder via data attribute when empty and not focused", () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "", placeholder: "Untitled" },
      });
      const surface = wrapper.find(".danx-editable-div");
      expect(surface.attributes("data-empty")).toBe("true");
      expect(surface.attributes("data-placeholder")).toBe("Untitled");
    });

    it("clears data-empty when value present", () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "x", placeholder: "Untitled" },
      });
      expect(wrapper.find(".danx-editable-div").attributes("data-empty")).toBe("false");
    });

    it("sets contenteditable=false when readonly", () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "x", readonly: true },
      });
      expect(wrapper.find(".danx-editable-div").attributes("contenteditable")).toBe("false");
      expect(wrapper.find(".danx-editable-div").classes()).toContain("danx-editable-div--readonly");
    });

    it("applies saving class and renders spinner when saving", () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "x", saving: true },
      });
      expect(wrapper.find(".danx-editable-div--saving").exists()).toBe(true);
      expect(wrapper.find(".danx-editable-div__spinner").exists()).toBe(true);
    });
  });

  describe("plaintext-only feature detection (DXUI-82)", () => {
    // Simulate a browser that rejects the "plaintext-only" keyword and falls
    // back to the spec-default "inherit" rather than throwing.
    function forceUnsupported() {
      const proto = HTMLElement.prototype;
      const original = Object.getOwnPropertyDescriptor(proto, "contentEditable")!;
      Object.defineProperty(proto, "contentEditable", {
        configurable: true,
        get() {
          return "inherit";
        },
        set() {
          /* no-op: unsupported keyword is silently ignored by the browser */
        },
      });
      return () => Object.defineProperty(proto, "contentEditable", original);
    }

    afterEach(() => {
      __resetPlaintextOnlySupportCache();
    });

    it("sets contenteditable=plaintext-only when feature detection reports support", () => {
      __resetPlaintextOnlySupportCache();
      const wrapper = mount(DanxEditableDiv, { props: { modelValue: "hello" } });
      expect(getSurface(wrapper).attributes("contenteditable")).toBe("plaintext-only");
    });

    it("forces the unsupported path and renders contenteditable=true instead of plaintext-only or false", () => {
      __resetPlaintextOnlySupportCache();
      const restore = forceUnsupported();
      try {
        const wrapper = mount(DanxEditableDiv, { props: { modelValue: "hello" } });
        expect(getSurface(wrapper).attributes("contenteditable")).toBe("true");
      } finally {
        restore();
      }
    });

    it("on the forced-unsupported fallback path, typing updates the buffer and commits on blur", async () => {
      __resetPlaintextOnlySupportCache();
      const restore = forceUnsupported();
      try {
        const wrapper = mount(DanxEditableDiv, {
          props: { modelValue: "old" },
          attachTo: document.body,
        });
        const surface = getSurface(wrapper).element as HTMLElement;
        setText(surface, "new");
        expect(surface.textContent).toBe("new");
        surface.dispatchEvent(new Event("blur"));
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["new"]);
      } finally {
        restore();
      }
    });

    it("on the forced-unsupported fallback path, handlePaste still strips newlines from pasted text", () => {
      __resetPlaintextOnlySupportCache();
      const restore = forceUnsupported();
      try {
        const wrapper = mount(DanxEditableDiv, {
          props: { modelValue: "" },
          attachTo: document.body,
        });
        const surface = getSurface(wrapper).element as HTMLElement;
        surface.focus();
        const execSpy = document.execCommand as unknown as ReturnType<typeof vi.fn>;
        execSpy.mockClear();
        const data = new DataTransfer();
        data.setData("text", "line1\nline2\rline3");
        const evt = new ClipboardEvent("paste", { clipboardData: data, cancelable: true });
        surface.dispatchEvent(evt);
        expect(execSpy).toHaveBeenCalledWith("insertText", false, "line1 line2 line3");
      } finally {
        restore();
      }
    });

    it("readonly still renders contenteditable=false regardless of the forced-unsupported detection result", () => {
      __resetPlaintextOnlySupportCache();
      const restore = forceUnsupported();
      try {
        const wrapper = mount(DanxEditableDiv, {
          props: { modelValue: "x", readonly: true },
        });
        expect(getSurface(wrapper).attributes("contenteditable")).toBe("false");
      } finally {
        restore();
      }
    });
  });

  describe("Accessibility", () => {
    it("sets role=textbox and aria-multiline=false by default", () => {
      const wrapper = mount(DanxEditableDiv, { props: { modelValue: "x" } });
      const el = wrapper.find(".danx-editable-div");
      expect(el.attributes("role")).toBe("textbox");
      expect(el.attributes("aria-multiline")).toBe("false");
    });

    it("aria-multiline=true in multi mode", () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "x", mode: "multi" },
      });
      expect(wrapper.find(".danx-editable-div").attributes("aria-multiline")).toBe("true");
    });

    it("aria-readonly true when readonly", () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "x", readonly: true },
      });
      expect(wrapper.find(".danx-editable-div").attributes("aria-readonly")).toBe("true");
    });

    it("tabindex=-1 when readonly, 0 otherwise", () => {
      const wrap1 = mount(DanxEditableDiv, { props: { modelValue: "x", readonly: true } });
      expect(wrap1.find(".danx-editable-div").attributes("tabindex")).toBe("-1");
      const wrap2 = mount(DanxEditableDiv, { props: { modelValue: "x" } });
      expect(wrap2.find(".danx-editable-div").attributes("tabindex")).toBe("0");
    });
  });

  describe("Commit on blur (default)", () => {
    it("emits update:modelValue + change on blur when value changed", async () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "old" },
        attachTo: document.body,
      });
      const surface = getSurface(wrapper).element as HTMLElement;
      surface.focus();
      setText(surface, "new");
      surface.dispatchEvent(new Event("blur"));
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["new"]);
      expect(wrapper.emitted("change")?.[0]).toEqual(["new"]);
    });

    it("emits update:modelValue but NOT change when value unchanged", async () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "same" },
        attachTo: document.body,
      });
      const surface = getSurface(wrapper).element as HTMLElement;
      surface.focus();
      setText(surface, "same");
      surface.dispatchEvent(new Event("blur"));
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["same"]);
      expect(wrapper.emitted("change")).toBeUndefined();
    });

    it("emits focus and blur passthrough events", async () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "x" },
        attachTo: document.body,
      });
      const surface = getSurface(wrapper).element as HTMLElement;
      surface.focus();
      surface.dispatchEvent(new Event("blur"));
      expect(wrapper.emitted("focus")).toHaveLength(1);
      expect(wrapper.emitted("blur")).toHaveLength(1);
    });
  });

  describe("Enter / Escape keys", () => {
    it("Enter in single mode commits and blurs", async () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "old" },
        attachTo: document.body,
      });
      const surface = getSurface(wrapper).element as HTMLElement;
      surface.focus();
      setText(surface, "new");
      surface.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })
      );
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["new"]);
    });

    it("Enter in multi mode does NOT commit (allows newline)", async () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "old", mode: "multi", commit: "manual" },
        attachTo: document.body,
      });
      const surface = getSurface(wrapper).element as HTMLElement;
      surface.focus();
      setText(surface, "new");
      surface.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })
      );
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("Ctrl+Enter in multi mode commits", async () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "old", mode: "multi", commit: "manual" },
        attachTo: document.body,
      });
      const surface = getSurface(wrapper).element as HTMLElement;
      surface.focus();
      setText(surface, "new");
      surface.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        })
      );
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["new"]);
    });

    it("Cmd+Enter in multi mode commits", async () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "old", mode: "multi", commit: "manual" },
        attachTo: document.body,
      });
      const surface = getSurface(wrapper).element as HTMLElement;
      surface.focus();
      setText(surface, "new");
      surface.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          metaKey: true,
          bubbles: true,
          cancelable: true,
        })
      );
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["new"]);
    });

    it("non-Enter/Escape keys do not commit or cancel", async () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "old" },
        attachTo: document.body,
      });
      const surface = getSurface(wrapper).element as HTMLElement;
      surface.focus();
      setText(surface, "new");
      surface.dispatchEvent(
        new KeyboardEvent("keydown", { key: "a", bubbles: true, cancelable: true })
      );
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      expect(wrapper.emitted("cancel")).toBeUndefined();
    });

    it("Escape reverts buffer, emits cancel, suppresses update:modelValue", async () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "old" },
        attachTo: document.body,
      });
      const surface = getSurface(wrapper).element as HTMLElement;
      surface.focus();
      setText(surface, "edited");
      surface.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })
      );
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("cancel")).toHaveLength(1);
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      expect(surface.textContent).toBe("old");
    });
  });

  describe("Paste sanitisation", () => {
    it("strips newlines from pasted text in single mode", () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "" },
        attachTo: document.body,
      });
      const surface = getSurface(wrapper).element as HTMLElement;
      surface.focus();
      const execSpy = document.execCommand as unknown as ReturnType<typeof vi.fn>;
      execSpy.mockClear();
      const data = new DataTransfer();
      data.setData("text", "line1\nline2\rline3");
      const evt = new ClipboardEvent("paste", { clipboardData: data, cancelable: true });
      surface.dispatchEvent(evt);
      expect(execSpy).toHaveBeenCalledWith("insertText", false, "line1 line2 line3");
    });

    it("does NOT intercept paste in multi mode", () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "", mode: "multi" },
        attachTo: document.body,
      });
      const surface = getSurface(wrapper).element as HTMLElement;
      surface.focus();
      const execSpy = document.execCommand as unknown as ReturnType<typeof vi.fn>;
      execSpy.mockClear();
      const data = new DataTransfer();
      data.setData("text", "a\nb");
      surface.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, cancelable: true }));
      expect(execSpy).not.toHaveBeenCalled();
    });

    it("handles paste with missing clipboardData (defensive)", () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "" },
        attachTo: document.body,
      });
      const surface = getSurface(wrapper).element as HTMLElement;
      surface.focus();
      const execSpy = document.execCommand as unknown as ReturnType<typeof vi.fn>;
      execSpy.mockClear();
      const evt = new Event("paste", { cancelable: true }) as ClipboardEvent;
      surface.dispatchEvent(evt);
      expect(execSpy).toHaveBeenCalledWith("insertText", false, "");
    });
  });

  describe("Single-mode newline stripping on input", () => {
    it("strips newlines that appear in the surface textContent", async () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "" },
        attachTo: document.body,
      });
      const surface = getSurface(wrapper).element as HTMLElement;
      surface.focus();
      setText(surface, "abc\ndef");
      expect(surface.textContent).toBe("abcdef");
    });
  });

  describe("Validation", () => {
    it("rejects empty when minLength >= 1, emits invalid, suppresses commit", async () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "hi", minLength: 1 },
        attachTo: document.body,
      });
      const surface = getSurface(wrapper).element as HTMLElement;
      surface.focus();
      setText(surface, "");
      surface.dispatchEvent(new Event("blur"));
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("invalid")?.[0]).toEqual(["Value is required"]);
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      expect(surface.classList.contains("danx-editable-div--invalid")).toBe(true);
      expect(surface.getAttribute("aria-invalid")).toBe("true");
    });

    it("rejects over-cap when maxLength set, emits invalid", async () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "", maxLength: 3 },
        attachTo: document.body,
      });
      const surface = getSurface(wrapper).element as HTMLElement;
      surface.focus();
      setText(surface, "abcd");
      surface.dispatchEvent(new Event("blur"));
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("invalid")?.[0]).toEqual(["Maximum length is 3"]);
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("custom validator returning a string blocks commit, emits invalid", async () => {
      const wrapper = mount(DanxEditableDiv, {
        props: {
          modelValue: "ok",
          validate: (v: string) => (v.startsWith("a") ? null : "must start with a"),
        },
        attachTo: document.body,
      });
      const surface = getSurface(wrapper).element as HTMLElement;
      surface.focus();
      setText(surface, "bad");
      surface.dispatchEvent(new Event("blur"));
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("invalid")?.[0]).toEqual(["must start with a"]);
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("custom validator returning null allows commit", async () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "ok", validate: () => null },
        attachTo: document.body,
      });
      const surface = getSurface(wrapper).element as HTMLElement;
      surface.focus();
      setText(surface, "new");
      surface.dispatchEvent(new Event("blur"));
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["new"]);
    });
  });

  describe("External modelValue sync", () => {
    it("applies external modelValue change when not focused", async () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "old" },
        attachTo: document.body,
      });
      await wrapper.setProps({ modelValue: "external" });
      const surface = getSurface(wrapper).element as HTMLElement;
      expect(surface.textContent).toBe("external");
    });

    it("does NOT clobber buffer when focused", async () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "old" },
        attachTo: document.body,
      });
      const surface = getSurface(wrapper).element as HTMLElement;
      surface.focus();
      setText(surface, "typing");
      await wrapper.setProps({ modelValue: "external" });
      expect(surface.textContent).toBe("typing");
    });
  });

  describe("Saving queue", () => {
    it("queues commit while saving=true, flushes when saving becomes false", async () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "old", saving: true },
        attachTo: document.body,
      });
      const surface = getSurface(wrapper).element as HTMLElement;
      surface.focus();
      setText(surface, "new");
      surface.dispatchEvent(new Event("blur"));
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      await wrapper.setProps({ saving: false });
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["new"]);
    });

    it("saving=false → true → false does NOT flush when no commit queued", async () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "x", saving: false },
        attachTo: document.body,
      });
      await wrapper.setProps({ saving: true });
      await wrapper.setProps({ saving: false });
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });
  });

  describe("Debounce mode", () => {
    it("schedules commit after debounceMs of quiet, emits update:modelValue", async () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "", commit: "debounce", debounceMs: 200 },
        attachTo: document.body,
      });
      const surface = getSurface(wrapper).element as HTMLElement;
      surface.focus();
      setText(surface, "a");
      setText(surface, "ab");
      vi.advanceTimersByTime(199);
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      vi.advanceTimersByTime(2);
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["ab"]);
    });
  });

  describe("Manual mode", () => {
    it("does NOT commit on blur when commit=manual", async () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "old", commit: "manual" },
        attachTo: document.body,
      });
      const surface = getSurface(wrapper).element as HTMLElement;
      surface.focus();
      setText(surface, "new");
      surface.dispatchEvent(new Event("blur"));
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("exposes commit() that emits update:modelValue", async () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "old", commit: "manual" },
        attachTo: document.body,
      });
      const surface = getSurface(wrapper).element as HTMLElement;
      surface.focus();
      setText(surface, "new");
      (wrapper.vm as unknown as { commit: () => void }).commit();
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["new"]);
    });

    it("exposes cancel() that reverts and emits cancel", async () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "old", commit: "manual" },
        attachTo: document.body,
      });
      const surface = getSurface(wrapper).element as HTMLElement;
      surface.focus();
      setText(surface, "new");
      (wrapper.vm as unknown as { cancel: () => void }).cancel();
      expect(wrapper.emitted("cancel")).toHaveLength(1);
      expect(surface.textContent).toBe("old");
    });
  });

  describe("focus() expose", () => {
    it("focuses the surface and selects all text by default", () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "hello" },
        attachTo: document.body,
      });
      (wrapper.vm as unknown as { focus: (selectAll?: boolean) => void }).focus();
      const surface = getSurface(wrapper).element as HTMLElement;
      expect(document.activeElement).toBe(surface);
      const sel = window.getSelection();
      expect(sel?.rangeCount).toBeGreaterThan(0);
    });

    it("focuses without selecting when selectAll=false", () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "hello" },
        attachTo: document.body,
      });
      window.getSelection()?.removeAllRanges();
      (wrapper.vm as unknown as { focus: (selectAll?: boolean) => void }).focus(false);
      const surface = getSurface(wrapper).element as HTMLElement;
      expect(document.activeElement).toBe(surface);
      expect(window.getSelection()?.toString()).toBe("");
    });

    it("focus() on empty value does not throw", () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "" },
        attachTo: document.body,
      });
      expect(() =>
        (wrapper.vm as unknown as { focus: (s?: boolean) => void }).focus()
      ).not.toThrow();
    });
  });

  describe("Cleanup", () => {
    it("clears pending debounce timer on unmount", async () => {
      const wrapper = mount(DanxEditableDiv, {
        props: { modelValue: "", commit: "debounce", debounceMs: 200 },
        attachTo: document.body,
      });
      const surface = getSurface(wrapper).element as HTMLElement;
      surface.focus();
      setText(surface, "a");
      wrapper.unmount();
      vi.advanceTimersByTime(500);
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });
  });
});
