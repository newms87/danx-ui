import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import DanxInput from "../DanxInput.vue";
import type { InputSize } from "../../../shared/form-types";
import type { InputType } from "../types";

/**
 * Helper: mounts DanxInput inside a parent that wires v-model properly.
 * Uses h() render function to avoid needing the runtime template compiler.
 */
function mountWithModel(
  initialValue: string | number | null,
  inputProps: Record<string, unknown> = {}
) {
  const Parent = defineComponent({
    setup() {
      const model = ref(initialValue);
      return () =>
        h(DanxInput, {
          ...inputProps,
          modelValue: model.value,
          "onUpdate:modelValue": (v: string | number | null | undefined) => {
            model.value = v ?? null;
          },
        });
    },
  });

  return mount(Parent);
}

const allSizes: InputSize[] = ["sm", "md", "lg"];

describe("DanxInput", () => {
  describe("Rendering", () => {
    it("renders the input container with default md size", () => {
      const wrapper = mount(DanxInput);

      expect(wrapper.find(".danx-input").exists()).toBe(true);
      expect(wrapper.find(".danx-input--md").exists()).toBe(true);
    });

    it.each(allSizes)("renders size %s with correct class", (size) => {
      const wrapper = mount(DanxInput, { props: { size } });

      expect(wrapper.find(`.danx-input--${size}`).exists()).toBe(true);
    });

    it("renders a native input element", () => {
      const wrapper = mount(DanxInput);

      expect(wrapper.find("input.danx-input__native").exists()).toBe(true);
    });

    it("renders with label via DanxFieldWrapper", () => {
      const wrapper = mount(DanxInput, { props: { label: "Email" } });

      const label = wrapper.find("label");
      expect(label.exists()).toBe(true);
      expect(label.text()).toContain("Email");
    });

    it("renders error message via DanxFieldWrapper", () => {
      const wrapper = mount(DanxInput, { props: { error: "Required" } });

      const errorMsg = wrapper.find(".danx-field-wrapper__message--error");
      expect(errorMsg.exists()).toBe(true);
      expect(errorMsg.text()).toBe("Required");
    });

    it("renders helper text via DanxFieldWrapper", () => {
      const wrapper = mount(DanxInput, { props: { helperText: "Enter your email" } });

      const helper = wrapper.find(".danx-field-wrapper__message--helper");
      expect(helper.exists()).toBe(true);
      expect(helper.text()).toBe("Enter your email");
    });

    it("renders required asterisk when required is true", () => {
      const wrapper = mount(DanxInput, {
        props: { label: "Name", required: true },
      });

      expect(wrapper.find(".danx-field-wrapper__required").exists()).toBe(true);
    });
  });

  describe("v-model", () => {
    it("renders the model value in the input", () => {
      const wrapper = mount(DanxInput, {
        props: { modelValue: "hello" },
      });

      expect(wrapper.find("input").element.value).toBe("hello");
    });

    it("emits update:modelValue on input", async () => {
      const wrapper = mount(DanxInput, {
        props: { modelValue: "" },
      });

      await wrapper.find("input").setValue("world");
      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
      expect(wrapper.emitted("update:modelValue")![0]).toEqual(["world"]);
    });

    it("handles null model value", () => {
      const wrapper = mount(DanxInput, {
        props: { modelValue: null },
      });

      expect(wrapper.find("input").element.value).toBe("");
    });

    it("handles number model value", () => {
      const wrapper = mount(DanxInput, {
        props: { modelValue: 42, type: "number" },
      });

      expect(wrapper.find("input").element.value).toBe("42");
    });
  });

  describe("Input types", () => {
    it("defaults to type text", () => {
      const wrapper = mount(DanxInput);

      expect(wrapper.find("input").attributes("type")).toBe("text");
    });

    const typesToTest: InputType[] = [
      "email",
      "url",
      "tel",
      "number",
      "date",
      "time",
      "datetime-local",
    ];

    it.each(typesToTest)("renders type %s", (type) => {
      const wrapper = mount(DanxInput, { props: { type } });

      expect(wrapper.find("input").attributes("type")).toBe(type);
    });

    it("renders password type with reveal toggle", () => {
      const wrapper = mount(DanxInput, { props: { type: "password" } });

      expect(wrapper.find("input").attributes("type")).toBe("password");
      expect(wrapper.find(".danx-input__reveal").exists()).toBe(true);
    });

    it("toggles password visibility when reveal button is clicked", async () => {
      const wrapper = mount(DanxInput, { props: { type: "password" } });

      const revealBtn = wrapper.find(".danx-input__reveal");
      expect(wrapper.find("input").attributes("type")).toBe("password");
      expect(revealBtn.attributes("aria-label")).toBe("Show password");

      await revealBtn.trigger("click");
      expect(wrapper.find("input").attributes("type")).toBe("text");
      expect(revealBtn.attributes("aria-label")).toBe("Hide password");

      await revealBtn.trigger("click");
      expect(wrapper.find("input").attributes("type")).toBe("password");
    });

    it("does not render reveal button for non-password types", () => {
      const wrapper = mount(DanxInput, { props: { type: "text" } });

      expect(wrapper.find(".danx-input__reveal").exists()).toBe(false);
    });

    it("renders search type with auto search icon prefix", () => {
      const wrapper = mount(DanxInput, { props: { type: "search" } });

      const prefix = wrapper.find(".danx-input__prefix");
      expect(prefix.exists()).toBe(true);
      expect(prefix.find(".danx-icon").exists()).toBe(true);
    });

    it("search type is clearable by default", () => {
      const wrapper = mountWithModel("query", { type: "search" });

      expect(wrapper.find(".danx-input__clear").exists()).toBe(true);
    });

    it("search type hides clear button when value is empty", () => {
      const wrapper = mountWithModel("", { type: "search" });

      expect(wrapper.find(".danx-input__clear").exists()).toBe(false);
    });
  });

  describe("Slots", () => {
    it("renders prefix slot content", () => {
      const wrapper = mount(DanxInput, {
        slots: { prefix: '<span class="test-prefix">$</span>' },
      });

      const prefix = wrapper.find(".danx-input__prefix");
      expect(prefix.exists()).toBe(true);
      expect(prefix.find(".test-prefix").exists()).toBe(true);
    });

    it("renders suffix slot content", () => {
      const wrapper = mount(DanxInput, {
        slots: { suffix: '<span class="test-suffix">.com</span>' },
      });

      const suffix = wrapper.find(".danx-input__suffix");
      expect(suffix.exists()).toBe(true);
      expect(suffix.find(".test-suffix").exists()).toBe(true);
    });

    it("prefix slot takes precedence over search auto-icon", () => {
      const wrapper = mount(DanxInput, {
        props: { type: "search" },
        slots: { prefix: '<span class="custom-prefix">*</span>' },
      });

      const prefixes = wrapper.findAll(".danx-input__prefix");
      expect(prefixes.length).toBe(1);
      expect(prefixes[0]!.find(".custom-prefix").exists()).toBe(true);
    });
  });

  describe("Clearable", () => {
    it("shows clear button when clearable and value is present", () => {
      const wrapper = mount(DanxInput, {
        props: { clearable: true, modelValue: "hello" },
      });

      expect(wrapper.find(".danx-input__clear").exists()).toBe(true);
    });

    it("hides clear button when value is empty", () => {
      const wrapper = mount(DanxInput, {
        props: { clearable: true, modelValue: "" },
      });

      expect(wrapper.find(".danx-input__clear").exists()).toBe(false);
    });

    it("hides clear button when value is null", () => {
      const wrapper = mount(DanxInput, {
        props: { clearable: true, modelValue: null },
      });

      expect(wrapper.find(".danx-input__clear").exists()).toBe(false);
    });

    it("hides clear button when not clearable", () => {
      const wrapper = mount(DanxInput, {
        props: { clearable: false, modelValue: "hello" },
      });

      expect(wrapper.find(".danx-input__clear").exists()).toBe(false);
    });

    it("clears value and emits clear when clear button is clicked", async () => {
      const wrapper = mount(DanxInput, {
        props: { clearable: true, modelValue: "hello" },
      });

      await wrapper.find(".danx-input__clear").trigger("click");
      expect(wrapper.emitted("update:modelValue")![0]).toEqual([""]);
      expect(wrapper.emitted("clear")).toBeTruthy();
    });

    it("clears to null for number type", async () => {
      const wrapper = mount(DanxInput, {
        props: { clearable: true, modelValue: 42, type: "number" },
      });

      await wrapper.find(".danx-input__clear").trigger("click");
      expect(wrapper.emitted("update:modelValue")![0]).toEqual([null]);
    });

    it("clear button has aria-label", () => {
      const wrapper = mount(DanxInput, {
        props: { clearable: true, modelValue: "hello" },
      });

      expect(wrapper.find(".danx-input__clear").attributes("aria-label")).toBe("Clear");
    });

    it("clear button is type=button", () => {
      const wrapper = mount(DanxInput, {
        props: { clearable: true, modelValue: "hello" },
      });

      expect(wrapper.find(".danx-input__clear").attributes("type")).toBe("button");
    });

    it("hides clear button when disabled", () => {
      const wrapper = mount(DanxInput, {
        props: { clearable: true, modelValue: "hello", disabled: true },
      });

      expect(wrapper.find(".danx-input__clear").exists()).toBe(false);
    });

    it("hides clear button when readonly", () => {
      const wrapper = mount(DanxInput, {
        props: { clearable: true, modelValue: "hello", readonly: true },
      });

      expect(wrapper.find(".danx-input__clear").exists()).toBe(false);
    });
  });

  describe("Character count", () => {
    it("shows character count when showCharCount is true", () => {
      const wrapper = mount(DanxInput, {
        props: { showCharCount: true, modelValue: "hello" },
      });

      const charCount = wrapper.find(".danx-input__char-count");
      expect(charCount.exists()).toBe(true);
      expect(charCount.text()).toBe("5");
    });

    it("shows count with maxlength", () => {
      const wrapper = mount(DanxInput, {
        props: { showCharCount: true, modelValue: "hello", maxlength: 20 },
      });

      expect(wrapper.find(".danx-input__char-count").text()).toBe("5/20");
    });

    it("adds limit class when at maxlength", () => {
      const wrapper = mount(DanxInput, {
        props: { showCharCount: true, modelValue: "hello", maxlength: 5 },
      });

      expect(wrapper.find(".danx-input__char-count--limit").exists()).toBe(true);
    });

    it("does not add limit class when under maxlength", () => {
      const wrapper = mount(DanxInput, {
        props: { showCharCount: true, modelValue: "hi", maxlength: 5 },
      });

      expect(wrapper.find(".danx-input__char-count--limit").exists()).toBe(false);
    });

    it("does not show character count when showCharCount is false", () => {
      const wrapper = mount(DanxInput, {
        props: { modelValue: "hello" },
      });

      expect(wrapper.find(".danx-input__char-count").exists()).toBe(false);
    });

    it("shows 0 for empty value", () => {
      const wrapper = mount(DanxInput, {
        props: { showCharCount: true, modelValue: "" },
      });

      expect(wrapper.find(".danx-input__char-count").text()).toBe("0");
    });

    it("shows 0 for null value", () => {
      const wrapper = mount(DanxInput, {
        props: { showCharCount: true, modelValue: null },
      });

      expect(wrapper.find(".danx-input__char-count").text()).toBe("0");
    });

    it("shows 0/maxlength for null value with maxlength", () => {
      const wrapper = mount(DanxInput, {
        props: { showCharCount: true, modelValue: null, maxlength: 100 },
      });

      expect(wrapper.find(".danx-input__char-count").text()).toBe("0/100");
    });
  });

  describe("States", () => {
    it("applies disabled state", () => {
      const wrapper = mount(DanxInput, { props: { disabled: true } });

      expect(wrapper.find(".danx-input--disabled").exists()).toBe(true);
      expect(wrapper.find("input").attributes("disabled")).toBeDefined();
    });

    it("applies readonly state", () => {
      const wrapper = mount(DanxInput, { props: { readonly: true } });

      expect(wrapper.find(".danx-input--readonly").exists()).toBe(true);
      expect(wrapper.find("input").element.readOnly).toBe(true);
    });

    it("applies error state border class", () => {
      const wrapper = mount(DanxInput, { props: { error: "Bad" } });

      expect(wrapper.find(".danx-input--error").exists()).toBe(true);
    });

    it("applies error state for boolean true error", () => {
      const wrapper = mount(DanxInput, { props: { error: true } });

      expect(wrapper.find(".danx-input--error").exists()).toBe(true);
    });

    it("applies focused state on focus", async () => {
      const wrapper = mount(DanxInput);

      await wrapper.find("input").trigger("focus");
      expect(wrapper.find(".danx-input--focused").exists()).toBe(true);
    });

    it("applies multiple state classes simultaneously", async () => {
      const wrapper = mount(DanxInput, {
        props: { error: "Bad", disabled: true, size: "lg" },
      });

      const container = wrapper.find(".danx-input");
      expect(container.classes()).toContain("danx-input--error");
      expect(container.classes()).toContain("danx-input--disabled");
      expect(container.classes()).toContain("danx-input--lg");
    });

    it("removes focused state on blur", async () => {
      const wrapper = mount(DanxInput);

      await wrapper.find("input").trigger("focus");
      expect(wrapper.find(".danx-input--focused").exists()).toBe(true);

      await wrapper.find("input").trigger("blur");
      expect(wrapper.find(".danx-input--focused").exists()).toBe(false);
    });
  });

  describe("Events", () => {
    it("emits focus on input focus", async () => {
      const wrapper = mount(DanxInput);

      await wrapper.find("input").trigger("focus");
      expect(wrapper.emitted("focus")).toBeTruthy();
    });

    it("emits blur on input blur", async () => {
      const wrapper = mount(DanxInput);

      await wrapper.find("input").trigger("blur");
      expect(wrapper.emitted("blur")).toBeTruthy();
    });
  });

  describe("Accessibility", () => {
    it("sets aria-invalid when in error state", () => {
      const wrapper = mount(DanxInput, { props: { error: "Bad" } });

      expect(wrapper.find("input").attributes("aria-invalid")).toBe("true");
    });

    it("does not set aria-invalid when no error", () => {
      const wrapper = mount(DanxInput);

      expect(wrapper.find("input").attributes("aria-invalid")).toBeUndefined();
    });

    it("sets aria-required when required", () => {
      const wrapper = mount(DanxInput, { props: { required: true } });

      expect(wrapper.find("input").attributes("aria-required")).toBe("true");
    });

    it("sets aria-describedby when error message exists", () => {
      const wrapper = mount(DanxInput, {
        props: { error: "Required", id: "test-field" },
      });

      expect(wrapper.find("input").attributes("aria-describedby")).toBe("test-field-message");
    });

    it("label for attribute matches input id", () => {
      const wrapper = mount(DanxInput, {
        props: { label: "Email", id: "email-input" },
      });

      const label = wrapper.find("label");
      expect(label.attributes("for")).toBe("email-input");
      expect(wrapper.find("input").attributes("id")).toBe("email-input");
    });

    it("password reveal button has correct aria-label", () => {
      const wrapper = mount(DanxInput, { props: { type: "password" } });

      expect(wrapper.find(".danx-input__reveal").attributes("aria-label")).toBe("Show password");
    });

    it("reveal button is type=button", () => {
      const wrapper = mount(DanxInput, { props: { type: "password" } });

      expect(wrapper.find(".danx-input__reveal").attributes("type")).toBe("button");
    });
  });

  describe("Native attributes", () => {
    it("passes placeholder to native input", () => {
      const wrapper = mount(DanxInput, { props: { placeholder: "Enter text" } });

      expect(wrapper.find("input").attributes("placeholder")).toBe("Enter text");
    });

    it("passes name to native input", () => {
      const wrapper = mount(DanxInput, { props: { name: "email" } });

      expect(wrapper.find("input").attributes("name")).toBe("email");
    });

    it("passes maxlength to native input", () => {
      const wrapper = mount(DanxInput, { props: { maxlength: 100 } });

      expect(wrapper.find("input").attributes("maxlength")).toBe("100");
    });

    it("passes min/max/step to native input", () => {
      const wrapper = mount(DanxInput, {
        props: { type: "number", min: 0, max: 100, step: 5 },
      });

      const input = wrapper.find("input");
      expect(input.attributes("min")).toBe("0");
      expect(input.attributes("max")).toBe("100");
      expect(input.attributes("step")).toBe("5");
    });

    it("passes autocomplete to native input", () => {
      const wrapper = mount(DanxInput, { props: { autocomplete: "email" } });

      expect(wrapper.find("input").attributes("autocomplete")).toBe("email");
    });
  });
});
