import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import CodeViewerFooter from "../CodeViewerFooter.vue";

describe("CodeViewerFooter", () => {
  const defaultProps = {
    charCount: 42,
    validationError: null as null | { message: string; line?: number },
    canEdit: false,
    isEditing: false,
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
    expect(wrapper.findComponent({ name: "DanxButton" }).exists()).toBe(false);
  });

  it("shows edit button when canEdit is true", () => {
    const wrapper = mount(CodeViewerFooter, {
      props: { ...defaultProps, canEdit: true },
    });
    expect(wrapper.findComponent({ name: "DanxButton" }).exists()).toBe(true);
  });

  it("emits toggle-edit when edit button is clicked", async () => {
    const wrapper = mount(CodeViewerFooter, {
      props: { ...defaultProps, canEdit: true },
    });
    await wrapper.findComponent({ name: "DanxButton" }).trigger("click");
    expect(wrapper.emitted("toggle-edit")).toHaveLength(1);
  });

  it("applies highlight class to edit button when isEditing", () => {
    const wrapper = mount(CodeViewerFooter, {
      props: { ...defaultProps, canEdit: true, isEditing: true },
    });
    const btn = wrapper.findComponent({ name: "DanxButton" });
    expect(btn.classes()).toContain("text-sky-500");
  });

  it("does not apply highlight class when not editing", () => {
    const wrapper = mount(CodeViewerFooter, {
      props: { ...defaultProps, canEdit: true, isEditing: false },
    });
    const btn = wrapper.findComponent({ name: "DanxButton" });
    expect(btn.classes()).not.toContain("text-sky-500");
  });

  it("renders pencil icon in edit button", () => {
    const wrapper = mount(CodeViewerFooter, {
      props: { ...defaultProps, canEdit: true },
    });
    const btn = wrapper.findComponent({ name: "DanxButton" });
    expect(btn.find("svg").exists()).toBe(true);
  });
});
