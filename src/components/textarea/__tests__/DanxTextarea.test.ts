import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import DanxTextarea from "../DanxTextarea.vue";
import type { InputSize } from "../../../shared/form-types";
import type { TextareaResize } from "../types";

/**
 * Helper: mounts DanxTextarea inside a parent that wires v-model properly.
 * Uses h() render function to avoid needing the runtime template compiler.
 */
function mountWithModel(initialValue: string | null, textareaProps: Record<string, unknown> = {}) {
  const Parent = defineComponent({
    setup() {
      const model = ref(initialValue);
      return () =>
        h(DanxTextarea, {
          ...textareaProps,
          modelValue: model.value,
          "onUpdate:modelValue": (v: string | null | undefined) => {
            model.value = v ?? null;
          },
        });
    },
  });

  return mount(Parent);
}

const allSizes: InputSize[] = ["sm", "md", "lg"];

describe("DanxTextarea", () => {
  describe("Rendering", () => {
    it("renders the textarea container with default md size", () => {
      const wrapper = mount(DanxTextarea);

      expect(wrapper.find(".danx-textarea").exists()).toBe(true);
      expect(wrapper.find(".danx-textarea--md").exists()).toBe(true);
    });

    it.each(allSizes)("renders size %s with correct class", (size) => {
      const wrapper = mount(DanxTextarea, { props: { size } });

      expect(wrapper.find(`.danx-textarea--${size}`).exists()).toBe(true);
    });

    it("renders a native textarea element", () => {
      const wrapper = mount(DanxTextarea);

      expect(wrapper.find("textarea.danx-textarea__native").exists()).toBe(true);
    });

    it("renders with label via DanxFieldWrapper", () => {
      const wrapper = mount(DanxTextarea, { props: { label: "Description" } });

      const label = wrapper.find("label");
      expect(label.exists()).toBe(true);
      expect(label.text()).toContain("Description");
    });

    it("renders error message via DanxFieldWrapper", () => {
      const wrapper = mount(DanxTextarea, { props: { error: "Required" } });

      const errorMsg = wrapper.find(".danx-field-wrapper__message--error");
      expect(errorMsg.exists()).toBe(true);
      expect(errorMsg.text()).toBe("Required");
    });

    it("renders helper text via DanxFieldWrapper", () => {
      const wrapper = mount(DanxTextarea, { props: { helperText: "Max 500 chars" } });

      const helper = wrapper.find(".danx-field-wrapper__message--helper");
      expect(helper.exists()).toBe(true);
      expect(helper.text()).toBe("Max 500 chars");
    });

    it("renders required asterisk when required is true", () => {
      const wrapper = mount(DanxTextarea, {
        props: { label: "Bio", required: true },
      });

      expect(wrapper.find(".danx-field-wrapper__required").exists()).toBe(true);
    });
  });

  describe("v-model", () => {
    it("renders the model value in the textarea", () => {
      const wrapper = mount(DanxTextarea, {
        props: { modelValue: "hello" },
      });

      expect(wrapper.find("textarea").element.value).toBe("hello");
    });

    it("emits update:modelValue on input", async () => {
      const wrapper = mount(DanxTextarea, {
        props: { modelValue: "" },
      });

      await wrapper.find("textarea").setValue("world");
      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
      expect(wrapper.emitted("update:modelValue")![0]).toEqual(["world"]);
    });

    it("handles null model value", () => {
      const wrapper = mount(DanxTextarea, {
        props: { modelValue: null },
      });

      expect(wrapper.find("textarea").element.value).toBe("");
    });
  });

  describe("Rows", () => {
    it("renders rows attribute with default value of 3", () => {
      const wrapper = mount(DanxTextarea);

      expect(wrapper.find("textarea").attributes("rows")).toBe("3");
    });

    it("renders custom rows attribute", () => {
      const wrapper = mount(DanxTextarea, { props: { rows: 6 } });

      expect(wrapper.find("textarea").attributes("rows")).toBe("6");
    });
  });

  describe("Resize", () => {
    it("defaults to vertical resize", () => {
      const wrapper = mount(DanxTextarea);

      expect(wrapper.find("textarea").element.style.resize).toBe("vertical");
    });

    const resizeValues: TextareaResize[] = ["none", "vertical", "both"];

    it.each(resizeValues)("sets resize to %s", (resize) => {
      const wrapper = mount(DanxTextarea, { props: { resize } });

      expect(wrapper.find("textarea").element.style.resize).toBe(resize);
    });
  });

  describe("Auto-resize", () => {
    it("sets textarea height on mount via adjustHeight", async () => {
      const wrapper = mountWithModel("short", { autoResize: true });

      const textarea = wrapper.find("textarea").element;
      // After mount + nextTick, height should have been set
      await nextTick();
      await nextTick();

      // scrollHeight is 0 in jsdom, so auto-resize sets height to "0px"
      expect(textarea.style.height).toBe("0px");
    });

    it("adjusts height on input event", async () => {
      const wrapper = mount(DanxTextarea, {
        props: { autoResize: true, modelValue: "initial" },
      });
      await nextTick();
      await nextTick();

      const textarea = wrapper.find("textarea");
      // Reset height to verify input triggers adjustHeight
      textarea.element.style.height = "";
      await textarea.trigger("input");

      // scrollHeight is 0 in jsdom, so auto-resize sets height to "0px"
      expect(textarea.element.style.height).toBe("0px");
    });

    it("does not adjust height on input when autoResize is false", async () => {
      const wrapper = mount(DanxTextarea, {
        props: { modelValue: "hello" },
      });

      const textarea = wrapper.find("textarea");
      await textarea.trigger("input");

      expect(textarea.element.style.height).toBe("");
    });

    it("sets overflow to hidden when autoResize is true", () => {
      const wrapper = mount(DanxTextarea, {
        props: { autoResize: true },
      });

      expect(wrapper.find("textarea").element.style.overflow).toBe("hidden");
    });

    it("does not set overflow when autoResize is false", () => {
      const wrapper = mount(DanxTextarea, {
        props: { modelValue: "hello" },
      });

      expect(wrapper.find("textarea").element.style.overflow).toBe("");
    });

    it("overrides resize to none when autoResize is true", () => {
      const wrapper = mount(DanxTextarea, {
        props: { autoResize: true, resize: "both" },
      });

      expect(wrapper.find("textarea").element.style.resize).toBe("none");
    });
  });

  describe("Clearable", () => {
    it("shows clear button when clearable and value is present", () => {
      const wrapper = mount(DanxTextarea, {
        props: { clearable: true, modelValue: "hello" },
      });

      expect(wrapper.find(".danx-textarea__clear").exists()).toBe(true);
    });

    it("hides clear button when value is empty", () => {
      const wrapper = mount(DanxTextarea, {
        props: { clearable: true, modelValue: "" },
      });

      expect(wrapper.find(".danx-textarea__clear").exists()).toBe(false);
    });

    it("hides clear button when value is null", () => {
      const wrapper = mount(DanxTextarea, {
        props: { clearable: true, modelValue: null },
      });

      expect(wrapper.find(".danx-textarea__clear").exists()).toBe(false);
    });

    it("hides clear button when not clearable", () => {
      const wrapper = mount(DanxTextarea, {
        props: { clearable: false, modelValue: "hello" },
      });

      expect(wrapper.find(".danx-textarea__clear").exists()).toBe(false);
    });

    it("clears value and emits clear when clear button is clicked", async () => {
      const wrapper = mount(DanxTextarea, {
        props: { clearable: true, modelValue: "hello" },
      });

      await wrapper.find(".danx-textarea__clear").trigger("click");
      expect(wrapper.emitted("update:modelValue")![0]).toEqual([""]);
      expect(wrapper.emitted("clear")).toBeTruthy();
    });

    it("clear button has aria-label", () => {
      const wrapper = mount(DanxTextarea, {
        props: { clearable: true, modelValue: "hello" },
      });

      expect(wrapper.find(".danx-textarea__clear").attributes("aria-label")).toBe("Clear");
    });

    it("clear button is type=button", () => {
      const wrapper = mount(DanxTextarea, {
        props: { clearable: true, modelValue: "hello" },
      });

      expect(wrapper.find(".danx-textarea__clear").attributes("type")).toBe("button");
    });

    it("hides clear button when disabled", () => {
      const wrapper = mount(DanxTextarea, {
        props: { clearable: true, modelValue: "hello", disabled: true },
      });

      expect(wrapper.find(".danx-textarea__clear").exists()).toBe(false);
    });

    it("hides clear button when readonly", () => {
      const wrapper = mount(DanxTextarea, {
        props: { clearable: true, modelValue: "hello", readonly: true },
      });

      expect(wrapper.find(".danx-textarea__clear").exists()).toBe(false);
    });
  });

  describe("Character count", () => {
    it("shows character count when showCharCount is true", () => {
      const wrapper = mount(DanxTextarea, {
        props: { showCharCount: true, modelValue: "hello" },
      });

      const charCount = wrapper.find(".danx-textarea__char-count");
      expect(charCount.exists()).toBe(true);
      expect(charCount.text()).toBe("5");
      expect(wrapper.find(".danx-textarea__char-count--limit").exists()).toBe(false);
    });

    it("shows count with maxlength", () => {
      const wrapper = mount(DanxTextarea, {
        props: { showCharCount: true, modelValue: "hello", maxlength: 20 },
      });

      expect(wrapper.find(".danx-textarea__char-count").text()).toBe("5/20");
    });

    it("adds limit class when at maxlength", () => {
      const wrapper = mount(DanxTextarea, {
        props: { showCharCount: true, modelValue: "hello", maxlength: 5 },
      });

      expect(wrapper.find(".danx-textarea__char-count--limit").exists()).toBe(true);
    });

    it("does not add limit class when under maxlength", () => {
      const wrapper = mount(DanxTextarea, {
        props: { showCharCount: true, modelValue: "hi", maxlength: 5 },
      });

      expect(wrapper.find(".danx-textarea__char-count--limit").exists()).toBe(false);
    });

    it("does not show character count when showCharCount is false", () => {
      const wrapper = mount(DanxTextarea, {
        props: { modelValue: "hello" },
      });

      expect(wrapper.find(".danx-textarea__char-count").exists()).toBe(false);
    });

    it("shows 0 for empty value", () => {
      const wrapper = mount(DanxTextarea, {
        props: { showCharCount: true, modelValue: "" },
      });

      expect(wrapper.find(".danx-textarea__char-count").text()).toBe("0");
    });

    it("shows 0 for null value", () => {
      const wrapper = mount(DanxTextarea, {
        props: { showCharCount: true, modelValue: null },
      });

      expect(wrapper.find(".danx-textarea__char-count").text()).toBe("0");
    });

    it("shows 0/maxlength for null value with maxlength", () => {
      const wrapper = mount(DanxTextarea, {
        props: { showCharCount: true, modelValue: null, maxlength: 100 },
      });

      expect(wrapper.find(".danx-textarea__char-count").text()).toBe("0/100");
    });
  });

  describe("Footer visibility", () => {
    it("shows footer when showCharCount is true", () => {
      const wrapper = mount(DanxTextarea, {
        props: { showCharCount: true, modelValue: "hi" },
      });

      expect(wrapper.find(".danx-textarea__footer").exists()).toBe(true);
    });

    it("does not show footer when only clearable (clear is overlay, not footer)", () => {
      const wrapper = mount(DanxTextarea, {
        props: { clearable: true, modelValue: "hi" },
      });

      expect(wrapper.find(".danx-textarea__footer").exists()).toBe(false);
      expect(wrapper.find(".danx-textarea__clear").exists()).toBe(true);
    });

    it("shows footer with char count and clear as separate overlay", () => {
      const wrapper = mount(DanxTextarea, {
        props: { showCharCount: true, clearable: true, modelValue: "hi" },
      });

      expect(wrapper.find(".danx-textarea__footer").exists()).toBe(true);
      expect(wrapper.find(".danx-textarea__char-count").exists()).toBe(true);
      // Clear button is an overlay, not inside the footer
      expect(wrapper.find(".danx-textarea__footer .danx-textarea__clear").exists()).toBe(false);
      expect(wrapper.find(".danx-textarea__clear").exists()).toBe(true);
    });

    it("hides footer when neither char count nor clear visible", () => {
      const wrapper = mount(DanxTextarea, {
        props: { modelValue: "hi" },
      });

      expect(wrapper.find(".danx-textarea__footer").exists()).toBe(false);
    });

    it("hides footer when clearable but value is empty", () => {
      const wrapper = mount(DanxTextarea, {
        props: { clearable: true, modelValue: "" },
      });

      expect(wrapper.find(".danx-textarea__footer").exists()).toBe(false);
    });

    it("shows footer for char count even when value is empty", () => {
      const wrapper = mount(DanxTextarea, {
        props: { showCharCount: true, modelValue: "" },
      });

      expect(wrapper.find(".danx-textarea__footer").exists()).toBe(true);
      expect(wrapper.find(".danx-textarea__char-count").text()).toBe("0");
    });
  });

  describe("States", () => {
    it("applies disabled state", () => {
      const wrapper = mount(DanxTextarea, { props: { disabled: true } });

      expect(wrapper.find(".danx-textarea--disabled").exists()).toBe(true);
      expect(wrapper.find("textarea").attributes("disabled")).toBeDefined();
    });

    it("applies readonly state", () => {
      const wrapper = mount(DanxTextarea, { props: { readonly: true } });

      expect(wrapper.find(".danx-textarea--readonly").exists()).toBe(true);
      expect(wrapper.find("textarea").element.readOnly).toBe(true);
    });

    it("applies error state border class", () => {
      const wrapper = mount(DanxTextarea, { props: { error: "Bad" } });

      expect(wrapper.find(".danx-textarea--error").exists()).toBe(true);
    });

    it("applies error state for boolean true error", () => {
      const wrapper = mount(DanxTextarea, { props: { error: true } });

      expect(wrapper.find(".danx-textarea--error").exists()).toBe(true);
    });

    it("applies focused state on focus", async () => {
      const wrapper = mount(DanxTextarea);

      await wrapper.find("textarea").trigger("focus");
      expect(wrapper.find(".danx-textarea--focused").exists()).toBe(true);
    });

    it("applies multiple state classes simultaneously", () => {
      const wrapper = mount(DanxTextarea, {
        props: { error: "Bad", disabled: true, size: "lg" },
      });

      const container = wrapper.find(".danx-textarea");
      expect(container.classes()).toContain("danx-textarea--error");
      expect(container.classes()).toContain("danx-textarea--disabled");
      expect(container.classes()).toContain("danx-textarea--lg");
    });

    it("removes focused state on blur", async () => {
      const wrapper = mount(DanxTextarea);

      await wrapper.find("textarea").trigger("focus");
      expect(wrapper.find(".danx-textarea--focused").exists()).toBe(true);

      await wrapper.find("textarea").trigger("blur");
      expect(wrapper.find(".danx-textarea--focused").exists()).toBe(false);
    });
  });

  describe("Events", () => {
    it("emits focus on textarea focus", async () => {
      const wrapper = mount(DanxTextarea);

      await wrapper.find("textarea").trigger("focus");
      expect(wrapper.emitted("focus")).toBeTruthy();
    });

    it("emits blur on textarea blur", async () => {
      const wrapper = mount(DanxTextarea);

      await wrapper.find("textarea").trigger("blur");
      expect(wrapper.emitted("blur")).toBeTruthy();
    });
  });

  describe("Accessibility", () => {
    it("sets aria-invalid when in error state", () => {
      const wrapper = mount(DanxTextarea, { props: { error: "Bad" } });

      expect(wrapper.find("textarea").attributes("aria-invalid")).toBe("true");
    });

    it("does not set aria-invalid when no error", () => {
      const wrapper = mount(DanxTextarea);

      expect(wrapper.find("textarea").attributes("aria-invalid")).toBeUndefined();
    });

    it("sets aria-required when required", () => {
      const wrapper = mount(DanxTextarea, { props: { required: true } });

      expect(wrapper.find("textarea").attributes("aria-required")).toBe("true");
    });

    it("sets aria-describedby when error message exists", () => {
      const wrapper = mount(DanxTextarea, {
        props: { error: "Required", id: "test-field" },
      });

      expect(wrapper.find("textarea").attributes("aria-describedby")).toBe("test-field-message");
    });

    it("label for attribute matches textarea id", () => {
      const wrapper = mount(DanxTextarea, {
        props: { label: "Description", id: "desc-textarea" },
      });

      const label = wrapper.find("label");
      expect(label.attributes("for")).toBe("desc-textarea");
      expect(wrapper.find("textarea").attributes("id")).toBe("desc-textarea");
    });
  });

  describe("Native attributes", () => {
    it("passes placeholder to native textarea", () => {
      const wrapper = mount(DanxTextarea, { props: { placeholder: "Enter text" } });

      expect(wrapper.find("textarea").attributes("placeholder")).toBe("Enter text");
    });

    it("passes name to native textarea", () => {
      const wrapper = mount(DanxTextarea, { props: { name: "description" } });

      expect(wrapper.find("textarea").attributes("name")).toBe("description");
    });

    it("passes maxlength to native textarea", () => {
      const wrapper = mount(DanxTextarea, { props: { maxlength: 100 } });

      expect(wrapper.find("textarea").attributes("maxlength")).toBe("100");
    });

    it("passes autocomplete to native textarea", () => {
      const wrapper = mount(DanxTextarea, { props: { autocomplete: "off" } });

      expect(wrapper.find("textarea").attributes("autocomplete")).toBe("off");
    });

    it("passes required to native textarea", () => {
      const wrapper = mount(DanxTextarea, { props: { required: true } });

      expect(wrapper.find("textarea").attributes("required")).toBeDefined();
    });
  });
});
