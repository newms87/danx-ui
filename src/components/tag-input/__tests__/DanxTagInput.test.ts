import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import DanxTagInput from "../DanxTagInput.vue";

function getInput(wrapper: ReturnType<typeof mount>) {
  return wrapper.find(".danx-tag-input__native");
}

async function pressKey(wrapper: ReturnType<typeof mount>, key: string) {
  await getInput(wrapper).trigger("keydown", { key });
}

describe("DanxTagInput", () => {
  describe("Rendering", () => {
    it("renders no chips when the model is empty", () => {
      const wrapper = mount(DanxTagInput, { props: { modelValue: [] } });

      expect(wrapper.findAllComponents({ name: "DanxChip" })).toHaveLength(0);
    });

    it("renders a chip per tag in the model", () => {
      const wrapper = mount(DanxTagInput, { props: { modelValue: ["a", "b", "c"] } });

      expect(wrapper.findAllComponents({ name: "DanxChip" })).toHaveLength(3);
    });

    it("renders the placeholder on the native input", () => {
      const wrapper = mount(DanxTagInput, {
        props: { modelValue: [], placeholder: "Add a tag" },
      });

      expect(getInput(wrapper).attributes("placeholder")).toBe("Add a tag");
    });

    it("wires label, error, and required through DanxFieldWrapper", () => {
      const wrapper = mount(DanxTagInput, {
        props: { modelValue: [], label: "Tags", error: "Required", required: true },
      });

      expect(wrapper.find(".danx-field-wrapper__label").text()).toContain("Tags");
      expect(wrapper.find(".danx-field-wrapper__message--error").text()).toBe("Required");
      expect(getInput(wrapper).attributes("aria-required")).toBe("true");
    });
  });

  describe("Committing tags", () => {
    it("commits the draft as a tag on Enter", async () => {
      const wrapper = mount(DanxTagInput, { props: { modelValue: [] } });
      const input = getInput(wrapper);

      await input.setValue("hello");
      await pressKey(wrapper, "Enter");

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["hello"]]);
      expect(wrapper.emitted("add")?.[0]).toEqual(["hello"]);
    });

    it("commits the draft as a tag on comma", async () => {
      const wrapper = mount(DanxTagInput, { props: { modelValue: [] } });
      const input = getInput(wrapper);

      await input.setValue("hello");
      await pressKey(wrapper, ",");

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["hello"]]);
    });

    it("trims whitespace around the draft before committing", async () => {
      const wrapper = mount(DanxTagInput, { props: { modelValue: [] } });
      const input = getInput(wrapper);

      await input.setValue("  hello  ");
      await pressKey(wrapper, "Enter");

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["hello"]]);
    });

    it("does not commit a whitespace-only draft", async () => {
      const wrapper = mount(DanxTagInput, { props: { modelValue: [] } });
      const input = getInput(wrapper);

      await input.setValue("   ");
      await pressKey(wrapper, "Enter");

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      expect(wrapper.emitted("add")).toBeUndefined();
    });

    it("does not commit an empty draft", async () => {
      const wrapper = mount(DanxTagInput, { props: { modelValue: [] } });

      await pressKey(wrapper, "Enter");

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("clears the draft input after a successful commit", async () => {
      const wrapper = mount(DanxTagInput, { props: { modelValue: [] } });
      const input = getInput(wrapper);

      await input.setValue("hello");
      await pressKey(wrapper, "Enter");

      expect((input.element as HTMLInputElement).value).toBe("");
    });
  });

  describe("Removing tags", () => {
    it("removes the last tag on Backspace when the draft is empty", async () => {
      const wrapper = mount(DanxTagInput, { props: { modelValue: ["a", "b"] } });

      await pressKey(wrapper, "Backspace");

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["a"]]);
      expect(wrapper.emitted("remove")?.[0]).toEqual(["b"]);
    });

    it("does not remove a tag on Backspace when the draft has text", async () => {
      const wrapper = mount(DanxTagInput, { props: { modelValue: ["a", "b"] } });
      const input = getInput(wrapper);

      await input.setValue("x");
      await pressKey(wrapper, "Backspace");

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("does not remove anything on Backspace when there are no tags", async () => {
      const wrapper = mount(DanxTagInput, { props: { modelValue: [] } });

      await pressKey(wrapper, "Backspace");

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("removes the tag whose chip remove button is clicked", async () => {
      const wrapper = mount(DanxTagInput, { props: { modelValue: ["a", "b", "c"] } });

      const chips = wrapper.findAllComponents({ name: "DanxChip" });
      await chips[1]!.find(".danx-chip__remove").trigger("click");

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["a", "c"]]);
      expect(wrapper.emitted("remove")?.[0]).toEqual(["b"]);
    });
  });

  describe("Duplicate prevention", () => {
    it("does not add a tag that already exists by default", async () => {
      const wrapper = mount(DanxTagInput, { props: { modelValue: ["hello"] } });
      const input = getInput(wrapper);

      await input.setValue("hello");
      await pressKey(wrapper, "Enter");

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      expect(wrapper.emitted("add")).toBeUndefined();
    });

    it("adds a duplicate tag when allowDuplicates is true", async () => {
      const wrapper = mount(DanxTagInput, {
        props: { modelValue: ["hello"], allowDuplicates: true },
      });
      const input = getInput(wrapper);

      await input.setValue("hello");
      await pressKey(wrapper, "Enter");

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["hello", "hello"]]);
    });
  });

  describe("Validate hook", () => {
    it("commits a tag when validate returns true", async () => {
      const validate = vi.fn(() => true);
      const wrapper = mount(DanxTagInput, { props: { modelValue: [], validate } });
      const input = getInput(wrapper);

      await input.setValue("hello");
      await pressKey(wrapper, "Enter");

      expect(validate).toHaveBeenCalledWith("hello");
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["hello"]]);
    });

    it("rejects a tag when validate returns false", async () => {
      const validate = vi.fn(() => false);
      const wrapper = mount(DanxTagInput, { props: { modelValue: [], validate } });
      const input = getInput(wrapper);

      await input.setValue("hello");
      await pressKey(wrapper, "Enter");

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      expect(wrapper.emitted("add")).toBeUndefined();
    });

    it("rejects a tag when validate throws", async () => {
      const validate = vi.fn(() => {
        throw new Error("boom");
      });
      const wrapper = mount(DanxTagInput, { props: { modelValue: [], validate } });
      const input = getInput(wrapper);

      await input.setValue("hello");
      await pressKey(wrapper, "Enter");

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });
  });

  describe("Transform hook", () => {
    it("applies transform to the candidate before committing", async () => {
      const wrapper = mount(DanxTagInput, {
        props: { modelValue: [], transform: (t: string) => t.toLowerCase() },
      });
      const input = getInput(wrapper);

      await input.setValue("HELLO");
      await pressKey(wrapper, "Enter");

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["hello"]]);
    });

    it("applies transform before the duplicate check", async () => {
      const wrapper = mount(DanxTagInput, {
        props: { modelValue: ["hello"], transform: (t: string) => t.toLowerCase() },
      });
      const input = getInput(wrapper);

      await input.setValue("HELLO");
      await pressKey(wrapper, "Enter");

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("does not commit when transform reduces the candidate to empty", async () => {
      const wrapper = mount(DanxTagInput, {
        props: { modelValue: [], transform: () => "" },
      });
      const input = getInput(wrapper);

      await input.setValue("hello");
      await pressKey(wrapper, "Enter");

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });
  });

  describe("Disabled / readonly", () => {
    it("does not commit a tag via Enter when disabled", async () => {
      const wrapper = mount(DanxTagInput, { props: { modelValue: [], disabled: true } });
      const input = getInput(wrapper);

      await input.setValue("hello");
      await pressKey(wrapper, "Enter");

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("does not commit a tag via Enter when readonly", async () => {
      const wrapper = mount(DanxTagInput, { props: { modelValue: [], readonly: true } });
      const input = getInput(wrapper);

      await input.setValue("hello");
      await pressKey(wrapper, "Enter");

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("does not remove a tag on Backspace when disabled", async () => {
      const wrapper = mount(DanxTagInput, {
        props: { modelValue: ["a"], disabled: true },
      });

      await pressKey(wrapper, "Backspace");

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("does not remove a tag via chip click when disabled", async () => {
      const wrapper = mount(DanxTagInput, {
        props: { modelValue: ["a"], disabled: true },
      });

      const chip = wrapper.findComponent({ name: "DanxChip" });
      await chip.find(".danx-chip__remove").trigger("click");

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("disables the native input", () => {
      const wrapper = mount(DanxTagInput, { props: { modelValue: [], disabled: true } });

      expect(getInput(wrapper).attributes("disabled")).toBeDefined();
    });

    it("marks the native input readonly", () => {
      const wrapper = mount(DanxTagInput, { props: { modelValue: [], readonly: true } });

      expect(getInput(wrapper).attributes("readonly")).toBeDefined();
    });
  });

  describe("Focus / blur", () => {
    it("applies the focused class and emits focus", async () => {
      const wrapper = mount(DanxTagInput, { props: { modelValue: [] } });

      await getInput(wrapper).trigger("focus");

      expect(wrapper.find(".danx-tag-input").classes()).toContain("danx-tag-input--focused");
      expect(wrapper.emitted("focus")).toHaveLength(1);
    });

    it("removes the focused class and emits blur", async () => {
      const wrapper = mount(DanxTagInput, { props: { modelValue: [] } });

      await getInput(wrapper).trigger("focus");
      await getInput(wrapper).trigger("blur");

      expect(wrapper.find(".danx-tag-input").classes()).not.toContain("danx-tag-input--focused");
      expect(wrapper.emitted("blur")).toHaveLength(1);
    });
  });

  describe("Sizes", () => {
    it.each(["sm", "md", "lg"] as const)("renders size %s with correct class", (size) => {
      const wrapper = mount(DanxTagInput, { props: { modelValue: [], size } });

      expect(wrapper.find(".danx-tag-input").classes()).toContain(`danx-tag-input--${size}`);
    });

    it("defaults to md size", () => {
      const wrapper = mount(DanxTagInput, { props: { modelValue: [] } });

      expect(wrapper.find(".danx-tag-input").classes()).toContain("danx-tag-input--md");
    });
  });

  describe("Error state", () => {
    it("applies the error class to the container", () => {
      const wrapper = mount(DanxTagInput, { props: { modelValue: [], error: true } });

      expect(wrapper.find(".danx-tag-input").classes()).toContain("danx-tag-input--error");
    });
  });

  describe("Slots", () => {
    it("renders the prefix slot when provided", () => {
      const wrapper = mount(DanxTagInput, {
        props: { modelValue: [] },
        slots: { prefix: '<span class="custom-prefix">@</span>' },
      });

      expect(wrapper.find(".danx-tag-input__prefix").exists()).toBe(true);
      expect(wrapper.find(".custom-prefix").exists()).toBe(true);
    });

    it("does not render the prefix wrapper when the slot is omitted", () => {
      const wrapper = mount(DanxTagInput, { props: { modelValue: [] } });

      expect(wrapper.find(".danx-tag-input__prefix").exists()).toBe(false);
    });

    it("renders the suffix slot when provided", () => {
      const wrapper = mount(DanxTagInput, {
        props: { modelValue: [] },
        slots: { suffix: '<span class="custom-suffix">#</span>' },
      });

      expect(wrapper.find(".danx-tag-input__suffix").exists()).toBe(true);
      expect(wrapper.find(".custom-suffix").exists()).toBe(true);
    });

    it("does not render the suffix wrapper when the slot is omitted", () => {
      const wrapper = mount(DanxTagInput, { props: { modelValue: [] } });

      expect(wrapper.find(".danx-tag-input__suffix").exists()).toBe(false);
    });
  });

  describe("v-model default", () => {
    it("defaults the model to an empty array when unset", () => {
      const wrapper = mount(DanxTagInput, {});

      expect(wrapper.findAllComponents({ name: "DanxChip" })).toHaveLength(0);
    });
  });
});
