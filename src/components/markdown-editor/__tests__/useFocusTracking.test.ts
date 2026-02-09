import { describe, it, expect, vi, afterEach } from "vitest";
import { defineComponent, ref, nextTick } from "vue";
import { mount, VueWrapper } from "@vue/test-utils";
import { useFocusTracking } from "../useFocusTracking";

/**
 * Helper component that wraps useFocusTracking for testing.
 */
const TestComponent = defineComponent({
  props: {
    onSelectionChange: {
      type: Function,
      default: undefined,
    },
    hasMenuContainer: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const contentRef = ref<HTMLElement | null>(null);
    const menuContainerRef = ref<HTMLElement | null>(null);

    const { isEditorFocused } = useFocusTracking({
      contentRef,
      menuContainerRef: props.hasMenuContainer ? menuContainerRef : undefined,
      onSelectionChange: props.onSelectionChange as (() => void) | undefined,
    });

    return { contentRef, menuContainerRef, isEditorFocused };
  },
  template: `
    <div>
      <div ref="contentRef" contenteditable="true" class="content">
        <p>Test content</p>
      </div>
      <div v-if="hasMenuContainer" ref="menuContainerRef" class="menu">Menu</div>
      <div class="outside" tabindex="0">Outside</div>
    </div>
  `,
});

/**
 * Dispatch a real FocusEvent on an element with a specified relatedTarget and target.
 */
function dispatchFocusIn(element: Element, target?: Element): void {
  const event = new FocusEvent("focusin", {
    bubbles: true,
    relatedTarget: null,
  });
  // In jsdom, target is set to the element dispatchEvent is called on
  (target ?? element).dispatchEvent(event);
}

function dispatchFocusOut(element: Element, relatedTarget?: Element | null): void {
  const event = new FocusEvent("focusout", {
    bubbles: true,
    relatedTarget: relatedTarget ?? null,
  });
  element.dispatchEvent(event);
}

describe("useFocusTracking", () => {
  let wrapper: VueWrapper;

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it("starts with isEditorFocused as false", () => {
    wrapper = mount(TestComponent, {
      attachTo: document.body,
    });
    expect(wrapper.vm.isEditorFocused).toBe(false);
  });

  it("sets isEditorFocused to true on focusin from child element", async () => {
    wrapper = mount(TestComponent, {
      attachTo: document.body,
    });
    await nextTick();

    // Dispatch focusin from child <p> - it bubbles up to content div
    const p = wrapper.find(".content p").element;
    dispatchFocusIn(wrapper.find(".content").element, p);
    await nextTick();

    expect(wrapper.vm.isEditorFocused).toBe(true);
  });

  it("sets isEditorFocused to false on focusout to outside element", async () => {
    wrapper = mount(TestComponent, {
      attachTo: document.body,
    });
    await nextTick();

    const content = wrapper.find(".content").element;
    const p = content.querySelector("p")!;
    dispatchFocusIn(content, p);
    await nextTick();
    expect(wrapper.vm.isEditorFocused).toBe(true);

    const outside = wrapper.find(".outside").element;
    dispatchFocusOut(content, outside);
    await nextTick();

    expect(wrapper.vm.isEditorFocused).toBe(false);
  });

  it("keeps isEditorFocused true when focus moves to menu container", async () => {
    wrapper = mount(TestComponent, {
      props: { hasMenuContainer: true },
      attachTo: document.body,
    });
    await nextTick();

    const content = wrapper.find(".content").element;
    const p = content.querySelector("p")!;
    dispatchFocusIn(content, p);
    await nextTick();
    expect(wrapper.vm.isEditorFocused).toBe(true);

    const menu = wrapper.find(".menu").element;
    dispatchFocusOut(content, menu);
    await nextTick();

    expect(wrapper.vm.isEditorFocused).toBe(true);
  });

  it("keeps isEditorFocused true when focus moves within content", async () => {
    wrapper = mount(TestComponent, {
      attachTo: document.body,
    });
    await nextTick();

    const content = wrapper.find(".content").element;
    const p = content.querySelector("p")!;
    dispatchFocusIn(content, p);
    await nextTick();
    expect(wrapper.vm.isEditorFocused).toBe(true);

    // Focus moves to another child of content
    dispatchFocusOut(content, p);
    await nextTick();

    expect(wrapper.vm.isEditorFocused).toBe(true);
  });

  it("registers selectionchange listener on mount", () => {
    const addSpy = vi.spyOn(document, "addEventListener");
    const onSelectionChange = vi.fn();

    wrapper = mount(TestComponent, {
      props: { onSelectionChange },
      attachTo: document.body,
    });

    expect(addSpy).toHaveBeenCalledWith("selectionchange", onSelectionChange);
    addSpy.mockRestore();
  });

  it("removes selectionchange listener on unmount", () => {
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const onSelectionChange = vi.fn();

    wrapper = mount(TestComponent, {
      props: { onSelectionChange },
      attachTo: document.body,
    });

    wrapper.unmount();

    expect(removeSpy).toHaveBeenCalledWith("selectionchange", onSelectionChange);
    removeSpy.mockRestore();
  });

  it("does not register selectionchange listener when callback not provided", () => {
    const addSpy = vi.spyOn(document, "addEventListener");

    wrapper = mount(TestComponent, {
      attachTo: document.body,
    });

    const selectionCalls = addSpy.mock.calls.filter((c) => c[0] === "selectionchange");
    expect(selectionCalls).toHaveLength(0);
    addSpy.mockRestore();
  });

  it("calls onSelectionChange on focusin", async () => {
    const onSelectionChange = vi.fn();

    wrapper = mount(TestComponent, {
      props: { onSelectionChange },
      attachTo: document.body,
    });
    await nextTick();

    const content = wrapper.find(".content").element;
    const p = content.querySelector("p")!;
    dispatchFocusIn(content, p);
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalled();
  });

  it("cleans up content listeners on unmount", async () => {
    wrapper = mount(TestComponent, {
      attachTo: document.body,
    });
    await nextTick();

    const content = wrapper.find(".content").element;
    const removeSpy = vi.spyOn(content, "removeEventListener");

    wrapper.unmount();

    const focusinCalls = removeSpy.mock.calls.filter((c) => c[0] === "focusin");
    const focusoutCalls = removeSpy.mock.calls.filter((c) => c[0] === "focusout");
    expect(focusinCalls).toHaveLength(1);
    expect(focusoutCalls).toHaveLength(1);
    removeSpy.mockRestore();
  });

  it("handles focusout with null relatedTarget", async () => {
    wrapper = mount(TestComponent, {
      attachTo: document.body,
    });
    await nextTick();

    const content = wrapper.find(".content").element;
    const p = content.querySelector("p")!;
    dispatchFocusIn(content, p);
    await nextTick();
    expect(wrapper.vm.isEditorFocused).toBe(true);

    dispatchFocusOut(content, null);
    await nextTick();

    expect(wrapper.vm.isEditorFocused).toBe(false);
  });
});
