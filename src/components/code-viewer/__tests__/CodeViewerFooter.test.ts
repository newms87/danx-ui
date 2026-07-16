import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import CodeViewerFooter from "../CodeViewerFooter.vue";
import * as clipboardUtils from "../clipboardUtils";

describe("CodeViewerFooter", () => {
  const defaultProps = {
    charCount: 42,
    validationError: null as null | { message: string; line?: number },
    canEdit: false,
    isEditing: false,
    content: "some code content",
  };

  it("renders footer container", () => {
    const wrapper = mount(CodeViewerFooter, { props: defaultProps });
    expect(wrapper.find(".code-footer").exists()).toBe(true);
  });

  it("shows character count when no error", () => {
    const wrapper = mount(CodeViewerFooter, { props: defaultProps });
    expect(wrapper.text()).toContain("42 chars");
  });

  it("formats large char counts with locale separators", () => {
    const wrapper = mount(CodeViewerFooter, {
      props: { ...defaultProps, charCount: 1234567 },
    });
    // toLocaleString produces "1,234,567" in en-US
    expect(wrapper.text()).toContain("1,234,567");
  });

  it("shows validation error message", () => {
    const wrapper = mount(CodeViewerFooter, {
      props: {
        ...defaultProps,
        validationError: { message: "Unexpected token" },
      },
    });
    expect(wrapper.text()).toContain("Error:");
    expect(wrapper.text()).toContain("Unexpected token");
  });

  it("shows validation error with line number", () => {
    const wrapper = mount(CodeViewerFooter, {
      props: {
        ...defaultProps,
        validationError: { message: "Bad syntax", line: 5 },
      },
    });
    expect(wrapper.text()).toContain("Error (line 5):");
    expect(wrapper.text()).toContain("Bad syntax");
  });

  it("applies has-error class when validation error exists", () => {
    const wrapper = mount(CodeViewerFooter, {
      props: {
        ...defaultProps,
        validationError: { message: "Error" },
      },
    });
    expect(wrapper.find(".code-footer").classes()).toContain("has-error");
  });

  it("does not apply has-error class when no error", () => {
    const wrapper = mount(CodeViewerFooter, { props: defaultProps });
    expect(wrapper.find(".code-footer").classes()).not.toContain("has-error");
  });

  it("hides edit button when canEdit is false", () => {
    const wrapper = mount(CodeViewerFooter, { props: defaultProps });
    expect(wrapper.find(".code-footer-edit-btn").exists()).toBe(false);
  });

  it("shows edit button when canEdit is true", () => {
    const wrapper = mount(CodeViewerFooter, {
      props: { ...defaultProps, canEdit: true },
    });
    expect(wrapper.find(".code-footer-edit-btn").exists()).toBe(true);
  });

  it("emits toggleEdit when edit button is clicked", async () => {
    const wrapper = mount(CodeViewerFooter, {
      props: { ...defaultProps, canEdit: true },
    });
    await wrapper.find(".code-footer-edit-btn").trigger("click");
    expect(wrapper.emitted("toggleEdit")).toHaveLength(1);
  });

  it("applies highlight class to edit button when isEditing", () => {
    const wrapper = mount(CodeViewerFooter, {
      props: { ...defaultProps, canEdit: true, isEditing: true },
    });
    const btn = wrapper.find(".code-footer-edit-btn");
    expect(btn.classes()).toContain("text-sky-500");
  });

  it("does not apply highlight class when not editing", () => {
    const wrapper = mount(CodeViewerFooter, {
      props: { ...defaultProps, canEdit: true, isEditing: false },
    });
    const btn = wrapper.find(".code-footer-edit-btn");
    expect(btn.classes()).not.toContain("text-sky-500");
  });

  it("uses the footer text token class instead of hardcoded Tailwind colors", () => {
    const wrapper = mount(CodeViewerFooter, { props: defaultProps });
    const textEl = wrapper.find(".code-footer-text");
    expect(textEl.exists()).toBe(true);
    expect(textEl.classes()).not.toContain("text-gray-500");
    expect(textEl.classes()).not.toContain("text-red-400");
  });

  it("uses the footer edit button token class instead of hardcoded Tailwind colors", () => {
    const wrapper = mount(CodeViewerFooter, {
      props: { ...defaultProps, canEdit: true },
    });
    const btn = wrapper.find(".code-footer-edit-btn");
    expect(btn.classes()).toContain("code-footer-edit-btn");
    expect(btn.classes()).not.toContain("text-gray-500");
    expect(btn.classes()).not.toContain("hover:text-gray-700");
  });

  it("renders pencil icon in edit button", () => {
    const wrapper = mount(CodeViewerFooter, {
      props: { ...defaultProps, canEdit: true },
    });
    const btn = wrapper.find(".code-footer-edit-btn");
    expect(btn.find("svg").exists()).toBe(true);
  });

  it("renders actions slot content", () => {
    const wrapper = mount(CodeViewerFooter, {
      props: defaultProps,
      slots: {
        actions: '<button class="custom-action">Action</button>',
      },
    });
    expect(wrapper.find(".custom-action").exists()).toBe(true);
    expect(wrapper.find(".custom-action").text()).toBe("Action");
  });

  it("always shows the copy button, regardless of canEdit", () => {
    const wrapper = mount(CodeViewerFooter, { props: defaultProps });
    expect(wrapper.find(".code-footer-copy-btn").exists()).toBe(true);
  });

  it("copies content to the clipboard when the copy button is clicked", async () => {
    const copySpy = vi.spyOn(clipboardUtils, "copyToClipboard").mockResolvedValue(true);
    const wrapper = mount(CodeViewerFooter, { props: defaultProps });
    await wrapper.find(".code-footer-copy-btn").trigger("click");
    await flushPromises();
    expect(copySpy).toHaveBeenCalledWith("some code content");
  });

  it("shows transient 'Copied!' feedback after a successful copy, then reverts", async () => {
    vi.useFakeTimers();
    vi.spyOn(clipboardUtils, "copyToClipboard").mockResolvedValue(true);
    const wrapper = mount(CodeViewerFooter, { props: defaultProps });

    await wrapper.find(".code-footer-copy-btn").trigger("click");
    await flushPromises();

    expect(wrapper.find(".code-footer-copy-btn").classes()).toContain("text-sky-500");

    vi.advanceTimersByTime(1500);
    await flushPromises();

    expect(wrapper.find(".code-footer-copy-btn").classes()).not.toContain("text-sky-500");
    vi.useRealTimers();
  });

  it("does not show 'Copied!' feedback when the copy fails", async () => {
    vi.spyOn(clipboardUtils, "copyToClipboard").mockResolvedValue(false);
    const wrapper = mount(CodeViewerFooter, { props: defaultProps });

    await wrapper.find(".code-footer-copy-btn").trigger("click");
    await flushPromises();

    expect(wrapper.find(".code-footer-copy-btn").classes()).not.toContain("text-sky-500");
  });
});

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}
