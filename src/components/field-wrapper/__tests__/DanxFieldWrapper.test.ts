import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DanxFieldWrapper from "../DanxFieldWrapper.vue";

describe("DanxFieldWrapper", () => {
  describe("Label rendering", () => {
    it("renders a label when label prop is provided", () => {
      const wrapper = mount(DanxFieldWrapper, {
        props: { fieldId: "test-input", label: "Email" },
        slots: { default: "<input />" },
      });

      const label = wrapper.find("label");
      expect(label.exists()).toBe(true);
      expect(label.text()).toContain("Email");
    });

    it("label has for attribute matching fieldId", () => {
      const wrapper = mount(DanxFieldWrapper, {
        props: { fieldId: "my-input", label: "Name" },
        slots: { default: "<input />" },
      });

      expect(wrapper.find("label").attributes("for")).toBe("my-input");
    });

    it("does not render a label when label prop is absent", () => {
      const wrapper = mount(DanxFieldWrapper, {
        props: { fieldId: "test-input" },
        slots: { default: "<input />" },
      });

      expect(wrapper.find("label").exists()).toBe(false);
    });

    it("shows required asterisk when required is true", () => {
      const wrapper = mount(DanxFieldWrapper, {
        props: { fieldId: "test-input", label: "Name", required: true },
        slots: { default: "<input />" },
      });

      const asterisk = wrapper.find(".danx-field-wrapper__required");
      expect(asterisk.exists()).toBe(true);
      expect(asterisk.text()).toBe("*");
      expect(asterisk.attributes("aria-hidden")).toBe("true");
    });

    it("does not show asterisk when required is true but no label", () => {
      const wrapper = mount(DanxFieldWrapper, {
        props: { fieldId: "test-input", required: true },
        slots: { default: "<input />" },
      });

      // No label renders, so no asterisk either
      expect(wrapper.find("label").exists()).toBe(false);
      expect(wrapper.find(".danx-field-wrapper__required").exists()).toBe(false);
    });

    it("does not show asterisk when required is false", () => {
      const wrapper = mount(DanxFieldWrapper, {
        props: { fieldId: "test-input", label: "Name" },
        slots: { default: "<input />" },
      });

      expect(wrapper.find(".danx-field-wrapper__required").exists()).toBe(false);
    });
  });

  describe("Error message rendering", () => {
    it("renders error message when error is a string", () => {
      const wrapper = mount(DanxFieldWrapper, {
        props: { fieldId: "test-input", error: "This field is required" },
        slots: { default: "<input />" },
      });

      const message = wrapper.find(".danx-field-wrapper__message--error");
      expect(message.exists()).toBe(true);
      expect(message.text()).toBe("This field is required");
      expect(message.attributes("role")).toBe("alert");
    });

    it("error message has correct id for aria-describedby", () => {
      const wrapper = mount(DanxFieldWrapper, {
        props: { fieldId: "email-input", error: "Invalid" },
        slots: { default: "<input />" },
      });

      expect(wrapper.find(".danx-field-wrapper__message--error").attributes("id")).toBe(
        "email-input-message"
      );
    });

    it("does not render error message when error is boolean true", () => {
      const wrapper = mount(DanxFieldWrapper, {
        props: { fieldId: "test-input", error: true },
        slots: { default: "<input />" },
      });

      expect(wrapper.find(".danx-field-wrapper__message--error").exists()).toBe(false);
    });

    it("does not render any message when no error and no helperText", () => {
      const wrapper = mount(DanxFieldWrapper, {
        props: { fieldId: "test-input" },
        slots: { default: "<input />" },
      });

      expect(wrapper.find(".danx-field-wrapper__message").exists()).toBe(false);
    });
  });

  describe("Helper text rendering", () => {
    it("renders helper text when helperText is provided", () => {
      const wrapper = mount(DanxFieldWrapper, {
        props: { fieldId: "test-input", helperText: "Enter your email address" },
        slots: { default: "<input />" },
      });

      const message = wrapper.find(".danx-field-wrapper__message--helper");
      expect(message.exists()).toBe(true);
      expect(message.text()).toBe("Enter your email address");
    });

    it("helper text has correct id for aria-describedby", () => {
      const wrapper = mount(DanxFieldWrapper, {
        props: { fieldId: "email-input", helperText: "Help" },
        slots: { default: "<input />" },
      });

      expect(wrapper.find(".danx-field-wrapper__message--helper").attributes("id")).toBe(
        "email-input-message"
      );
    });

    it("error takes precedence over helper when both exist", () => {
      const wrapper = mount(DanxFieldWrapper, {
        props: {
          fieldId: "test-input",
          error: "Required",
          helperText: "This is helpful",
        },
        slots: { default: "<input />" },
      });

      expect(wrapper.find(".danx-field-wrapper__message--error").exists()).toBe(true);
      expect(wrapper.find(".danx-field-wrapper__message--helper").exists()).toBe(false);
    });

    it("does not render helper when error is boolean true", () => {
      const wrapper = mount(DanxFieldWrapper, {
        props: {
          fieldId: "test-input",
          error: true,
          helperText: "This is helpful",
        },
        slots: { default: "<input />" },
      });

      // error=true means hasError is true, so helper is hidden
      expect(wrapper.find(".danx-field-wrapper__message--helper").exists()).toBe(false);
    });
  });

  describe("Slot rendering", () => {
    it("renders default slot content", () => {
      const wrapper = mount(DanxFieldWrapper, {
        props: { fieldId: "test-input" },
        slots: { default: '<input id="test-input" />' },
      });

      expect(wrapper.find("input").exists()).toBe(true);
    });
  });

  describe("Structure", () => {
    it("has the root danx-field-wrapper class", () => {
      const wrapper = mount(DanxFieldWrapper, {
        props: { fieldId: "test-input" },
        slots: { default: "<input />" },
      });

      expect(wrapper.find(".danx-field-wrapper").exists()).toBe(true);
    });
  });
});
