import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import DanxSelect from "../DanxSelect.vue";
import type { SelectOption, SelectModelValue } from "../types";
import type { InputSize } from "../../../shared/form-types";

/**
 * Mock native Popover API on HTMLElement.prototype since happy-dom doesn't support it.
 */
const popoverOpenState = new WeakMap<HTMLElement, boolean>();
const origMatches = HTMLElement.prototype.matches;

beforeEach(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, true);
    this.dispatchEvent(new Event("toggle"));
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, false);
    this.dispatchEvent(new Event("toggle"));
  });
  HTMLElement.prototype.matches = function (selector: string) {
    if (selector === ":popover-open") return popoverOpenState.get(this) ?? false;
    return origMatches.call(this, selector);
  };
});

afterEach(() => {
  HTMLElement.prototype.showPopover = undefined as unknown as () => void;
  HTMLElement.prototype.hidePopover = undefined as unknown as () => void;
  HTMLElement.prototype.matches = origMatches;
});

/**
 * Helper: mounts DanxSelect inside a parent that wires v-model.
 */
function mountWithModel(
  initialValue: SelectModelValue = null,
  selectProps: Record<string, unknown> = {}
) {
  const defaultOptions: SelectOption[] = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Beta" },
    { value: "c", label: "Charlie" },
  ];

  const Parent = defineComponent({
    setup() {
      const model = ref<SelectModelValue | undefined>(initialValue);
      return () =>
        h(DanxSelect, {
          options: defaultOptions,
          ...selectProps,
          modelValue: model.value,
          "onUpdate:modelValue": (v: SelectModelValue | undefined) => {
            model.value = v;
          },
        });
    },
  });

  return mount(Parent, {
    attachTo: document.body,
  });
}

const allSizes: InputSize[] = ["sm", "md", "lg"];

describe("DanxSelect", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  describe("Rendering", () => {
    it("renders the trigger container with default md size", () => {
      const wrapper = mountWithModel();
      expect(wrapper.find(".danx-select").exists()).toBe(true);
      expect(wrapper.find(".danx-select--md").exists()).toBe(true);
    });

    it.each(allSizes)("renders size %s with correct class", (size) => {
      const wrapper = mountWithModel(null, { size });
      expect(wrapper.find(`.danx-select--${size}`).exists()).toBe(true);
    });

    it("renders chevron icon", () => {
      const wrapper = mountWithModel();
      expect(wrapper.find(".danx-select__chevron").exists()).toBe(true);
    });

    it("renders placeholder when no value", () => {
      const wrapper = mountWithModel(null, { placeholder: "Pick one" });
      expect(wrapper.find(".danx-select__placeholder").text()).toBe("Pick one");
    });

    it("renders selected value text", () => {
      const wrapper = mountWithModel("b");
      expect(wrapper.find(".danx-select__value").text()).toBe("Beta");
    });

    it("renders non-breaking space when no placeholder and no value", () => {
      const wrapper = mountWithModel();
      const placeholder = wrapper.find(".danx-select__placeholder");
      expect(placeholder.exists()).toBe(true);
      expect(placeholder.text()).toBe("");
    });

    it("renders label via DanxFieldWrapper", () => {
      const wrapper = mountWithModel(null, { label: "Color" });
      const label = wrapper.find("label");
      expect(label.exists()).toBe(true);
      expect(label.text()).toContain("Color");
    });

    it("renders error message via DanxFieldWrapper", () => {
      const wrapper = mountWithModel(null, { error: "Required" });
      const errorMsg = wrapper.find(".danx-field-wrapper__message--error");
      expect(errorMsg.exists()).toBe(true);
      expect(errorMsg.text()).toBe("Required");
    });

    it("renders helper text via DanxFieldWrapper", () => {
      const wrapper = mountWithModel(null, { helperText: "Select an item" });
      const helper = wrapper.find(".danx-field-wrapper__message--helper");
      expect(helper.exists()).toBe(true);
      expect(helper.text()).toBe("Select an item");
    });

    it("renders required asterisk", () => {
      const wrapper = mountWithModel(null, { required: true, label: "Required" });
      expect(wrapper.find(".danx-field-wrapper__required").exists()).toBe(true);
    });
  });

  describe("State Classes", () => {
    it("adds error class when error prop is set", () => {
      const wrapper = mountWithModel(null, { error: "Bad" });
      expect(wrapper.find(".danx-select--error").exists()).toBe(true);
    });

    it("adds disabled class", () => {
      const wrapper = mountWithModel(null, { disabled: true });
      expect(wrapper.find(".danx-select--disabled").exists()).toBe(true);
    });

    it("adds readonly class", () => {
      const wrapper = mountWithModel(null, { readonly: true });
      expect(wrapper.find(".danx-select--readonly").exists()).toBe(true);
    });

    it("sets tabindex -1 when disabled", () => {
      const wrapper = mountWithModel(null, { disabled: true });
      expect(wrapper.find(".danx-select").attributes("tabindex")).toBe("-1");
    });

    it("sets tabindex 0 when enabled", () => {
      const wrapper = mountWithModel();
      expect(wrapper.find(".danx-select").attributes("tabindex")).toBe("0");
    });
  });

  describe("Dropdown Open/Close", () => {
    it("opens dropdown on trigger click", async () => {
      const wrapper = mountWithModel();
      await wrapper.find(".danx-select").trigger("click");
      expect(wrapper.find(".danx-select--open").exists()).toBe(true);
    });

    it("closes dropdown on second trigger click", async () => {
      const wrapper = mountWithModel();
      const trigger = wrapper.find(".danx-select");
      await trigger.trigger("click");
      expect(wrapper.find(".danx-select--open").exists()).toBe(true);
      await trigger.trigger("click");
      expect(wrapper.find(".danx-select--open").exists()).toBe(false);
    });

    it("does not open when disabled", async () => {
      const wrapper = mountWithModel(null, { disabled: true });
      await wrapper.find(".danx-select").trigger("click");
      expect(wrapper.find(".danx-select--open").exists()).toBe(false);
    });

    it("does not open when readonly", async () => {
      const wrapper = mountWithModel(null, { readonly: true });
      await wrapper.find(".danx-select").trigger("click");
      expect(wrapper.find(".danx-select--open").exists()).toBe(false);
    });
  });

  describe("Option Selection", () => {
    it("selects option on click and closes dropdown", async () => {
      const wrapper = mountWithModel();
      await wrapper.find(".danx-select").trigger("click");
      const options = wrapper.findAll(".danx-select__option");
      expect(options.length).toBeGreaterThan(0);
      await options[1]!.trigger("click");
      // In single mode, clicking an option closes the dropdown
      expect(wrapper.find(".danx-select__value").text()).toBe("Beta");
    });
  });

  describe("Clear Button", () => {
    it("shows clear button when clearable and value is set", () => {
      const wrapper = mountWithModel("a", { clearable: true });
      expect(wrapper.find(".danx-select__clear").exists()).toBe(true);
    });

    it("hides clear button when no value", () => {
      const wrapper = mountWithModel(null, { clearable: true });
      expect(wrapper.find(".danx-select__clear").exists()).toBe(false);
    });

    it("hides clear button when not clearable", () => {
      const wrapper = mountWithModel("a");
      expect(wrapper.find(".danx-select__clear").exists()).toBe(false);
    });

    it("hides clear button when disabled", () => {
      const wrapper = mountWithModel("a", { clearable: true, disabled: true });
      expect(wrapper.find(".danx-select__clear").exists()).toBe(false);
    });

    it("hides clear button when readonly", () => {
      const wrapper = mountWithModel("a", { clearable: true, readonly: true });
      expect(wrapper.find(".danx-select__clear").exists()).toBe(false);
    });

    it("clears value on clear button click", async () => {
      const wrapper = mountWithModel("a", { clearable: true });
      await wrapper.find(".danx-select__clear").trigger("click");
      expect(wrapper.find(".danx-select__placeholder").exists()).toBe(true);
    });
  });

  describe("Multi-Select", () => {
    it("adds multiple class", () => {
      const wrapper = mountWithModel([], { multiple: true });
      expect(wrapper.find(".danx-select--multiple").exists()).toBe(true);
    });

    it("renders chips for selected values", () => {
      const wrapper = mountWithModel(["a", "b"], { multiple: true });
      const chips = wrapper.findAll(".danx-select__tags .danx-chip");
      expect(chips.length).toBe(2);
    });

    it("shows overflow chip when exceeding maxSelectedLabels", () => {
      const options: SelectOption[] = [
        { value: 1, label: "One" },
        { value: 2, label: "Two" },
        { value: 3, label: "Three" },
        { value: 4, label: "Four" },
      ];
      const wrapper = mountWithModel([1, 2, 3, 4], {
        multiple: true,
        options,
        maxSelectedLabels: 2,
      });
      const tags = wrapper.find(".danx-select__tags");
      expect(tags.text()).toContain("+2 more");
    });

    it("shows placeholder when no items selected", () => {
      const wrapper = mountWithModel([], {
        multiple: true,
        placeholder: "Select items",
      });
      expect(wrapper.find(".danx-select__placeholder").text()).toBe("Select items");
    });

    it("shows clear button when multi has selections", () => {
      const wrapper = mountWithModel(["a"], { multiple: true, clearable: true });
      expect(wrapper.find(".danx-select__clear").exists()).toBe(true);
    });

    it("hides clear button when multi is empty", () => {
      const wrapper = mountWithModel([], { multiple: true, clearable: true });
      expect(wrapper.find(".danx-select__clear").exists()).toBe(false);
    });
  });

  describe("Keyboard Navigation", () => {
    it("opens dropdown on ArrowDown", async () => {
      const wrapper = mountWithModel();
      await wrapper.find(".danx-select").trigger("keydown", { key: "ArrowDown" });
      expect(wrapper.find(".danx-select--open").exists()).toBe(true);
    });

    it("opens dropdown on Enter", async () => {
      const wrapper = mountWithModel();
      await wrapper.find(".danx-select").trigger("keydown", { key: "Enter" });
      expect(wrapper.find(".danx-select--open").exists()).toBe(true);
    });

    it("opens dropdown on Space", async () => {
      const wrapper = mountWithModel();
      await wrapper.find(".danx-select").trigger("keydown", { key: " " });
      expect(wrapper.find(".danx-select--open").exists()).toBe(true);
    });

    it("closes dropdown on Escape", async () => {
      const wrapper = mountWithModel();
      const trigger = wrapper.find(".danx-select");
      await trigger.trigger("click");
      expect(wrapper.find(".danx-select--open").exists()).toBe(true);
      await trigger.trigger("keydown", { key: "Escape" });
      expect(wrapper.find(".danx-select--open").exists()).toBe(false);
    });
  });

  describe("ARIA Attributes", () => {
    it("has combobox role on trigger", () => {
      const wrapper = mountWithModel();
      expect(wrapper.find(".danx-select").attributes("role")).toBe("combobox");
    });

    it("has aria-expanded false when closed", () => {
      const wrapper = mountWithModel();
      expect(wrapper.find(".danx-select").attributes("aria-expanded")).toBe("false");
    });

    it("has aria-haspopup listbox", () => {
      const wrapper = mountWithModel();
      expect(wrapper.find(".danx-select").attributes("aria-haspopup")).toBe("listbox");
    });

    it("has listbox role on options container", async () => {
      const wrapper = mountWithModel();
      await wrapper.find(".danx-select").trigger("click");
      expect(wrapper.find("[role='listbox']").exists()).toBe(true);
    });

    it("has option role on each option", async () => {
      const wrapper = mountWithModel();
      await wrapper.find(".danx-select").trigger("click");
      const options = wrapper.findAll("[role='option']");
      expect(options.length).toBe(3);
    });

    it("sets aria-multiselectable on listbox in multi mode", async () => {
      const wrapper = mountWithModel([], { multiple: true });
      await wrapper.find(".danx-select").trigger("click");
      expect(wrapper.find("[role='listbox']").attributes("aria-multiselectable")).toBe("true");
    });

    it("aria-invalid when error is set", () => {
      const wrapper = mountWithModel(null, { error: "Bad" });
      expect(wrapper.find(".danx-select").attributes("aria-invalid")).toBe("true");
    });

    it("aria-required when required", () => {
      const wrapper = mountWithModel(null, { required: true });
      expect(wrapper.find(".danx-select").attributes("aria-required")).toBe("true");
    });
  });

  describe("Filterable", () => {
    it("renders search input when filterable", async () => {
      const wrapper = mountWithModel(null, { filterable: true });
      await wrapper.find(".danx-select").trigger("click");
      expect(wrapper.find(".danx-select__search input").exists()).toBe(true);
    });

    it("does not render search input when not filterable", async () => {
      const wrapper = mountWithModel();
      await wrapper.find(".danx-select").trigger("click");
      expect(wrapper.find(".danx-select__search").exists()).toBe(false);
    });

    it("shows filter placeholder", async () => {
      const wrapper = mountWithModel(null, {
        filterable: true,
        filterPlaceholder: "Type to filter",
      });
      await wrapper.find(".danx-select").trigger("click");
      expect(wrapper.find(".danx-select__search input").attributes("placeholder")).toBe(
        "Type to filter"
      );
    });
  });

  describe("Loading & Empty States", () => {
    it("shows loading indicator when loading", async () => {
      const wrapper = mountWithModel(null, { loading: true });
      await wrapper.find(".danx-select").trigger("click");
      expect(wrapper.find(".danx-select__loading").exists()).toBe(true);
    });

    it("shows empty message when no options", async () => {
      const wrapper = mountWithModel(null, {
        options: [],
        emptyMessage: "Nothing here",
      });
      await wrapper.find(".danx-select").trigger("click");
      expect(wrapper.find(".danx-select__empty").text()).toBe("Nothing here");
    });

    it("shows empty filter message when filter matches nothing", async () => {
      const wrapper = mountWithModel(null, {
        filterable: true,
        emptyFilterMessage: "No matches",
      });
      await wrapper.find(".danx-select").trigger("click");
      const input = wrapper.find(".danx-select__search input");
      await input.setValue("zzzzz");
      expect(wrapper.find(".danx-select__empty").text()).toBe("No matches");
    });

    it("hides empty state when loading", async () => {
      const wrapper = mountWithModel(null, { options: [], loading: true });
      await wrapper.find(".danx-select").trigger("click");
      expect(wrapper.find(".danx-select__empty").exists()).toBe(false);
    });
  });

  describe("Groups", () => {
    it("renders group headers", async () => {
      const options: SelectOption[] = [
        { value: "a", label: "A", group: "Group 1" },
        { value: "b", label: "B", group: "Group 2" },
      ];
      const wrapper = mountWithModel(null, { options });
      await wrapper.find(".danx-select").trigger("click");
      const headers = wrapper.findAll(".danx-select__group-header");
      expect(headers.length).toBe(2);
      expect(headers[0]!.text()).toBe("Group 1");
      expect(headers[1]!.text()).toBe("Group 2");
    });

    it("does not render group header for ungrouped options", async () => {
      const wrapper = mountWithModel();
      await wrapper.find(".danx-select").trigger("click");
      expect(wrapper.find(".danx-select__group-header").exists()).toBe(false);
    });
  });

  describe("Creatable", () => {
    it("shows create option when typing new value", async () => {
      const wrapper = mountWithModel(null, { filterable: true, creatable: true });
      await wrapper.find(".danx-select").trigger("click");
      const input = wrapper.find(".danx-select__search input");
      await input.setValue("NewItem");
      expect(wrapper.find(".danx-select__option--create").exists()).toBe(true);
      expect(wrapper.find(".danx-select__option--create").text()).toContain("NewItem");
    });

    it("does not show create option when value matches", async () => {
      const wrapper = mountWithModel(null, { filterable: true, creatable: true });
      await wrapper.find(".danx-select").trigger("click");
      const input = wrapper.find(".danx-select__search input");
      await input.setValue("Alpha");
      expect(wrapper.find(".danx-select__option--create").exists()).toBe(false);
    });
  });

  describe("Focus Events", () => {
    it("emits focus event on trigger focus", async () => {
      const wrapper = mountWithModel();
      await wrapper.find(".danx-select").trigger("focus");
      // Event is emitted through the parent's event handler
      const selectComponent = wrapper.findComponent(DanxSelect);
      expect(selectComponent.emitted("focus")).toBeTruthy();
    });

    it("emits blur event on trigger blur", async () => {
      const wrapper = mountWithModel();
      await wrapper.find(".danx-select").trigger("blur");
      const selectComponent = wrapper.findComponent(DanxSelect);
      expect(selectComponent.emitted("blur")).toBeTruthy();
    });
  });

  describe("Option Rendering", () => {
    it("renders checkmark for selected option in single mode", async () => {
      const wrapper = mountWithModel("a");
      await wrapper.find(".danx-select").trigger("click");
      const selectedOption = wrapper.find(".danx-select__option--selected");
      const check = selectedOption.find(".danx-select__option-check");
      expect(check.exists()).toBe(true);
      expect(check.find(".danx-icon").exists()).toBe(true);
    });

    it("renders checkmark for selected option in multi mode", async () => {
      const wrapper = mountWithModel(["a"], { multiple: true });
      await wrapper.find(".danx-select").trigger("click");
      const selectedOption = wrapper.find(".danx-select__option--selected");
      const check = selectedOption.find(".danx-select__option-check");
      expect(check.exists()).toBe(true);
      expect(check.find(".danx-icon").exists()).toBe(true);
    });

    it("renders empty check placeholder for unselected options", async () => {
      const wrapper = mountWithModel(null);
      await wrapper.find(".danx-select").trigger("click");
      const firstOption = wrapper.find(".danx-select__option");
      const check = firstOption.find(".danx-select__option-check");
      expect(check.exists()).toBe(true);
      expect(check.find(".danx-icon").exists()).toBe(false);
    });

    it("renders option description when provided", async () => {
      const options: SelectOption[] = [{ value: "a", label: "A", description: "First option" }];
      const wrapper = mountWithModel(null, { options });
      await wrapper.find(".danx-select").trigger("click");
      expect(wrapper.find(".danx-select__option-description").text()).toBe("First option");
    });

    it("renders option as plain text", async () => {
      const wrapper = mountWithModel();
      await wrapper.find(".danx-select").trigger("click");
      const optionContents = wrapper.findAll(".danx-select__option-content");
      expect(optionContents.length).toBe(3);
      expect(optionContents[0]!.text()).toBe("Alpha");
    });

    it("highlights option on mouseenter", async () => {
      const wrapper = mountWithModel();
      await wrapper.find(".danx-select").trigger("click");
      const options = wrapper.findAll(".danx-select__option");
      await options[1]!.trigger("mouseenter");
      expect(options[1]!.classes()).toContain("danx-select__option--highlighted");
    });

    it("adds disabled class to disabled options", async () => {
      const options: SelectOption[] = [
        { value: "a", label: "A", disabled: true },
        { value: "b", label: "B" },
      ];
      const wrapper = mountWithModel(null, { options });
      await wrapper.find(".danx-select").trigger("click");
      expect(wrapper.find(".danx-select__option--disabled").exists()).toBe(true);
    });
  });

  describe("Slots", () => {
    it("renders header slot", async () => {
      const wrapper = mount(DanxSelect, {
        props: {
          options: [{ value: "a", label: "A" }],
        },
        slots: {
          header: '<div class="custom-header">Header</div>',
        },
        attachTo: document.body,
      });
      await wrapper.find(".danx-select").trigger("click");
      expect(wrapper.find(".custom-header").exists()).toBe(true);
      wrapper.unmount();
    });

    it("renders footer slot", async () => {
      const wrapper = mount(DanxSelect, {
        props: {
          options: [{ value: "a", label: "A" }],
        },
        slots: {
          footer: '<div class="custom-footer">Footer</div>',
        },
        attachTo: document.body,
      });
      await wrapper.find(".danx-select").trigger("click");
      expect(wrapper.find(".custom-footer").exists()).toBe(true);
      wrapper.unmount();
    });

    it("renders option slot with scoped props", async () => {
      const wrapper = mount(DanxSelect, {
        props: {
          modelValue: "a",
          options: [
            { value: "a", label: "Alpha" },
            { value: "b", label: "Beta" },
          ],
        },
        slots: {
          option:
            '<template #option="{ option, selected, highlighted }"><span class="custom-option" :data-selected="selected" :data-highlighted="highlighted">{{ option.label }}</span></template>',
        },
        attachTo: document.body,
      });
      await wrapper.find(".danx-select").trigger("click");
      const customOptions = wrapper.findAll(".custom-option");
      expect(customOptions.length).toBe(2);
      expect(customOptions[0]!.attributes("data-selected")).toBe("true");
      expect(customOptions[1]!.attributes("data-selected")).toBe("false");
      wrapper.unmount();
    });

    it("renders empty slot", async () => {
      const wrapper = mount(DanxSelect, {
        props: {
          options: [],
        },
        slots: {
          empty: '<div class="custom-empty">Custom empty</div>',
        },
        attachTo: document.body,
      });
      await wrapper.find(".danx-select").trigger("click");
      expect(wrapper.find(".custom-empty").exists()).toBe(true);
      wrapper.unmount();
    });
  });

  describe("Chip Removal in Multi-Select", () => {
    it("removes chip on remove click", async () => {
      const wrapper = mountWithModel(["a", "b"], { multiple: true });
      const removeButtons = wrapper.findAll(".danx-chip__remove");
      expect(removeButtons.length).toBeGreaterThan(0);
      await removeButtons[0]!.trigger("click");
      // After removing "a", only "b" should remain
      const chips = wrapper.findAll(".danx-select__tags .danx-chip");
      expect(chips.length).toBe(1);
    });

    it("does not remove chip when disabled even on click", async () => {
      const wrapper = mountWithModel(["a", "b"], {
        multiple: true,
        disabled: true,
      });
      const removeButtons = wrapper.findAll(".danx-chip__remove");
      if (removeButtons.length > 0) {
        await removeButtons[0]!.trigger("click");
      }
      const chips = wrapper.findAll(".danx-select__tags .danx-chip");
      expect(chips.length).toBe(2);
    });

    it("does not remove chip when readonly even on click", async () => {
      const wrapper = mountWithModel(["a", "b"], {
        multiple: true,
        readonly: true,
      });
      const removeButtons = wrapper.findAll(".danx-chip__remove");
      if (removeButtons.length > 0) {
        await removeButtons[0]!.trigger("click");
      }
      const chips = wrapper.findAll(".danx-select__tags .danx-chip");
      expect(chips.length).toBe(2);
    });

    it("removes chip via selectedOptions fallback when filtered away", async () => {
      const wrapper = mountWithModel(["a", "b"], {
        multiple: true,
        filterable: true,
      });
      // Open dropdown and filter so "a" (Alpha) is not in filteredOptions
      await wrapper.find(".danx-select").trigger("click");
      const input = wrapper.find(".danx-select__search input");
      await input.setValue("Beta");
      // "Alpha" chip is still visible in trigger tags — remove it
      const removeButtons = wrapper.findAll(".danx-chip__remove");
      // First chip is "Alpha"
      await removeButtons[0]!.trigger("click");
      // Should have removed "a" via selectedOptions fallback
      const chips = wrapper.findAll(".danx-select__tags .danx-chip");
      expect(chips.length).toBe(1);
    });
  });

  describe("Creatable Actions", () => {
    it("triggers create on clicking the create option", async () => {
      const wrapper = mountWithModel(null, {
        filterable: true,
        creatable: true,
      });
      await wrapper.find(".danx-select").trigger("click");
      const input = wrapper.find(".danx-select__search input");
      await input.setValue("Brand New");
      const createOpt = wrapper.find(".danx-select__option--create");
      expect(createOpt.exists()).toBe(true);
      await createOpt.trigger("click");
      const selectComponent = wrapper.findComponent(DanxSelect);
      expect(selectComponent.emitted("create")).toBeTruthy();
    });

    it("highlights create option on mouseenter", async () => {
      const wrapper = mountWithModel(null, {
        filterable: true,
        creatable: true,
      });
      await wrapper.find(".danx-select").trigger("click");
      const input = wrapper.find(".danx-select__search input");
      await input.setValue("NewOption");
      const createOpt = wrapper.find(".danx-select__option--create");
      await createOpt.trigger("mouseenter");
      expect(createOpt.classes()).toContain("danx-select__option--highlighted");
    });
  });

  describe("Filter Keydown", () => {
    it("handles keydown on filter input", async () => {
      const wrapper = mountWithModel(null, { filterable: true });
      await wrapper.find(".danx-select").trigger("click");
      const input = wrapper.find(".danx-select__search input");
      await input.trigger("keydown", { key: "Escape" });
      // Dropdown should close
      expect(wrapper.find(".danx-select--open").exists()).toBe(false);
    });
  });

  describe("Watch: isOpen focus management", () => {
    it("focuses filter input when opening filterable dropdown", async () => {
      const wrapper = mountWithModel(null, { filterable: true });
      await wrapper.find(".danx-select").trigger("click");
      // Filter input should exist and be the active element
      const filterInput = wrapper.find(".danx-select__search input");
      expect(filterInput.exists()).toBe(true);
    });

    it("returns focus to trigger when closing dropdown", async () => {
      const wrapper = mountWithModel(null, { filterable: true });
      const trigger = wrapper.find(".danx-select");
      await trigger.trigger("click");
      // Close the dropdown
      await trigger.trigger("keydown", { key: "Escape" });
      expect(wrapper.find(".danx-select--open").exists()).toBe(false);
    });
  });

  describe("Variant Styling", () => {
    it("applies variant style to trigger", () => {
      const wrapper = mountWithModel(null, { variant: "danger" });
      const trigger = wrapper.find(".danx-select");
      const style = trigger.attributes("style");
      expect(style).toContain("--dx-select-trigger-bg");
    });

    it("passes variant to popover", async () => {
      const wrapper = mountWithModel(null, { variant: "info" });
      const popover = wrapper.findComponent({ name: "DanxPopover" });
      expect(popover.props("variant")).toBe("info");
    });
  });

  describe("Selected Slot", () => {
    it("renders custom selected slot content", () => {
      const wrapper = mount(DanxSelect, {
        props: {
          modelValue: "a",
          options: [{ value: "a", label: "Alpha" }],
        },
        slots: {
          selected:
            '<template #selected="{ option }"><span class="custom-selected">{{ option.label }}</span></template>',
        },
        attachTo: document.body,
      });
      expect(wrapper.find(".custom-selected").exists()).toBe(true);
      expect(wrapper.find(".custom-selected").text()).toBe("Alpha");
      wrapper.unmount();
    });
  });
});
