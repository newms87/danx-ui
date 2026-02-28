import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import { useSelect } from "../useSelect";
import type { DanxSelectEmits, DanxSelectProps, SelectModelValue, SelectOption } from "../types";

const mountedWrappers: ReturnType<typeof mount>[] = [];

function createSelect(
  initialValue: SelectModelValue = null,
  propsOverrides: Partial<DanxSelectProps> = {},
  emitSpy?: Record<string, ReturnType<typeof vi.fn>>
) {
  const model = ref<SelectModelValue | undefined>(initialValue);
  const defaultOptions: SelectOption[] = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Beta" },
    { value: "c", label: "Charlie" },
  ];

  const emits = {
    focus: emitSpy?.focus ?? vi.fn(),
    blur: emitSpy?.blur ?? vi.fn(),
    clear: emitSpy?.clear ?? vi.fn(),
    filter: emitSpy?.filter ?? vi.fn(),
    create: emitSpy?.create ?? vi.fn(),
  };

  const emit = ((event: string, ...args: unknown[]) => {
    const fn = emits[event as keyof typeof emits] as ((...a: unknown[]) => void) | undefined;
    if (fn) fn(...args);
  }) as unknown as DanxSelectEmits;

  const props: DanxSelectProps = {
    options: defaultOptions,
    optionLabel: "label",
    optionValue: "value",
    maxSelectedLabels: 3,
    filterPlaceholder: "Search...",
    emptyMessage: "No options",
    emptyFilterMessage: "No results",
    placement: "bottom",
    size: "md",
    variant: "",
    ...propsOverrides,
  };

  let result!: ReturnType<typeof useSelect>;
  const wrapper = mount(
    defineComponent({
      setup() {
        result = useSelect({ model, props, emit: emit as any });
        return {};
      },
      template: "<div />",
    })
  );
  mountedWrappers.push(wrapper);

  return { result, model, emits, props };
}

afterEach(() => {
  for (const w of mountedWrappers) w.unmount();
  mountedWrappers.length = 0;
});

describe("useSelect", () => {
  describe("Option Normalization", () => {
    it("normalizes options using default label/value keys", () => {
      const { result } = createSelect(null);
      expect(result.normalizedOptions.value).toHaveLength(3);
      expect(result.normalizedOptions.value[0]).toMatchObject({
        value: "a",
        label: "Alpha",
      });
    });

    it("normalizes options using custom label/value keys", () => {
      const { result } = createSelect(null, {
        options: [{ id: 1, name: "One" } as any, { id: 2, name: "Two" } as any],
        optionLabel: "name",
        optionValue: "id",
      });
      expect(result.normalizedOptions.value[0]).toMatchObject({
        value: 1,
        label: "One",
      });
    });

    it("falls back label to valueKey when labelKey is missing", () => {
      const { result } = createSelect(null, {
        options: [{ value: "x" } as SelectOption],
      });
      expect(result.normalizedOptions.value[0]!.label).toBe("x");
    });

    it("falls back label to empty string when both keys are missing", () => {
      const { result } = createSelect(null, {
        options: [{} as SelectOption],
      });
      expect(result.normalizedOptions.value[0]!.label).toBe("");
    });

    it("preserves optional fields (icon, description, disabled, group)", () => {
      const { result } = createSelect(null, {
        options: [
          {
            value: "x",
            label: "X",
            icon: "edit",
            description: "Desc",
            disabled: true,
            group: "G",
          },
        ],
      });
      const opt = result.normalizedOptions.value[0]!;
      expect(opt.icon).toBe("edit");
      expect(opt.description).toBe("Desc");
      expect(opt.disabled).toBe(true);
      expect(opt.group).toBe("G");
    });
  });

  describe("Model Coercion", () => {
    it("coerces single value to array when multiple is true", () => {
      const { model } = createSelect("a", { multiple: true });
      expect(model.value).toEqual(["a"]);
    });

    it("coerces array to first element when multiple is false", () => {
      const { model } = createSelect(["a", "b"] as any, { multiple: false });
      expect(model.value).toBe("a");
    });

    it("coerces array to null when empty and multiple is false", () => {
      const { model } = createSelect([] as any, { multiple: false });
      expect(model.value).toBeNull();
    });

    it("leaves null as null in single mode", () => {
      const { model } = createSelect(null);
      expect(model.value).toBeNull();
    });
  });

  describe("Selection", () => {
    it("returns selected option objects for single value", () => {
      const { result } = createSelect("b");
      expect(result.selectedOptions.value).toHaveLength(1);
      expect(result.selectedOptions.value[0]!.label).toBe("Beta");
    });

    it("returns selected option objects for multiple values", () => {
      const { result } = createSelect(["a", "c"], { multiple: true });
      expect(result.selectedOptions.value).toHaveLength(2);
    });

    it("returns empty array when model is null", () => {
      const { result } = createSelect(null);
      expect(result.selectedOptions.value).toEqual([]);
    });

    it("isSelected returns true for selected option", () => {
      const { result } = createSelect("a");
      expect(result.isSelected({ value: "a", label: "Alpha" })).toBe(true);
      expect(result.isSelected({ value: "b", label: "Beta" })).toBe(false);
    });

    it("isSelected returns false when model is null", () => {
      const { result } = createSelect(null);
      expect(result.isSelected({ value: "a", label: "Alpha" })).toBe(false);
    });

    it("isSelected checks array in multi mode", () => {
      const { result } = createSelect(["a", "b"], { multiple: true });
      expect(result.isSelected({ value: "a", label: "Alpha" })).toBe(true);
      expect(result.isSelected({ value: "c", label: "Charlie" })).toBe(false);
    });

    it("displayLabel returns label of first selected option", () => {
      const { result } = createSelect("b");
      expect(result.displayLabel.value).toBe("Beta");
    });

    it("displayLabel returns empty string when nothing selected", () => {
      const { result } = createSelect(null);
      expect(result.displayLabel.value).toBe("");
    });
  });

  describe("toggleOption", () => {
    it("sets value and closes dropdown in single mode", () => {
      const { result, model } = createSelect(null);
      result.openDropdown();
      result.toggleOption({ value: "b", label: "Beta" });
      expect(model.value).toBe("b");
      expect(result.isOpen.value).toBe(false);
    });

    it("adds value to array in multi mode", () => {
      const { result, model } = createSelect(["a"], { multiple: true });
      result.toggleOption({ value: "b", label: "Beta" });
      expect(model.value).toEqual(["a", "b"]);
    });

    it("removes value from array in multi mode", () => {
      const { result, model } = createSelect(["a", "b"], { multiple: true });
      result.toggleOption({ value: "a", label: "Alpha" });
      expect(model.value).toEqual(["b"]);
    });

    it("does not toggle disabled options", () => {
      const { result, model } = createSelect(null);
      result.toggleOption({ value: "a", label: "Alpha", disabled: true });
      expect(model.value).toBeNull();
    });

    it("handles multi mode when current model is not array", () => {
      const { result, model } = createSelect(null, { multiple: true });
      // After coercion, null stays null for multi mode
      result.toggleOption({ value: "a", label: "Alpha" });
      expect(model.value).toEqual(["a"]);
    });
  });

  describe("Filtering", () => {
    it("returns all options when filter is empty", () => {
      const { result } = createSelect(null);
      expect(result.filteredOptions.value).toHaveLength(3);
    });

    it("filters options by label case-insensitively", () => {
      const { result } = createSelect(null);
      result.filterText.value = "al";
      expect(result.filteredOptions.value).toHaveLength(1);
      expect(result.filteredOptions.value[0]!.label).toBe("Alpha");
    });

    it("handles filter input events", () => {
      const { result, emits } = createSelect(null);
      const event = { target: { value: "be" } } as unknown as Event;
      result.handleFilterInput(event);
      expect(result.filterText.value).toBe("be");
      expect(result.highlightedIndex.value).toBe(0);
      expect(emits.filter).toHaveBeenCalledWith("be");
    });
  });

  describe("Grouped Options", () => {
    it("groups options by group property", () => {
      const { result } = createSelect(null, {
        options: [
          { value: "a", label: "A", group: "Group 1" },
          { value: "b", label: "B", group: "Group 1" },
          { value: "c", label: "C", group: "Group 2" },
        ],
      });
      const groups = result.groupedOptions.value;
      expect(groups.size).toBe(2);
      expect(groups.get("Group 1")).toHaveLength(2);
      expect(groups.get("Group 2")).toHaveLength(1);
    });

    it("uses null key for ungrouped options", () => {
      const { result } = createSelect(null);
      const groups = result.groupedOptions.value;
      expect(groups.has(null)).toBe(true);
      expect(groups.get(null)).toHaveLength(3);
    });
  });

  describe("Dropdown State", () => {
    it("opens dropdown and resets filter", () => {
      const { result } = createSelect(null);
      result.filterText.value = "test";
      result.openDropdown();
      expect(result.isOpen.value).toBe(true);
      expect(result.filterText.value).toBe("");
      expect(result.highlightedIndex.value).toBe(0);
    });

    it("closes dropdown and resets highlight", () => {
      const { result } = createSelect(null);
      result.openDropdown();
      result.closeDropdown();
      expect(result.isOpen.value).toBe(false);
      expect(result.highlightedIndex.value).toBe(-1);
    });

    it("does not open when disabled", () => {
      const { result } = createSelect(null, { disabled: true });
      result.openDropdown();
      expect(result.isOpen.value).toBe(false);
    });

    it("does not open when readonly", () => {
      const { result } = createSelect(null, { readonly: true });
      result.openDropdown();
      expect(result.isOpen.value).toBe(false);
    });

    it("highlights first enabled option when opening", () => {
      const { result } = createSelect(null, {
        options: [
          { value: "a", label: "A", disabled: true },
          { value: "b", label: "B" },
        ],
      });
      result.openDropdown();
      expect(result.highlightedIndex.value).toBe(1);
    });
  });

  describe("Keyboard Navigation", () => {
    it("ArrowDown opens dropdown when closed", () => {
      const { result } = createSelect(null);
      result.handleKeydown(new KeyboardEvent("keydown", { key: "ArrowDown" }));
      expect(result.isOpen.value).toBe(true);
    });

    it("ArrowDown moves highlight down when open", () => {
      const { result } = createSelect(null);
      result.openDropdown();
      const initial = result.highlightedIndex.value;
      result.handleKeydown(new KeyboardEvent("keydown", { key: "ArrowDown" }));
      expect(result.highlightedIndex.value).toBe(initial + 1);
    });

    it("ArrowUp opens dropdown when closed", () => {
      const { result } = createSelect(null);
      result.handleKeydown(new KeyboardEvent("keydown", { key: "ArrowUp" }));
      expect(result.isOpen.value).toBe(true);
    });

    it("ArrowUp moves highlight up when open", () => {
      const { result } = createSelect(null);
      result.openDropdown();
      result.highlightedIndex.value = 2;
      result.handleKeydown(new KeyboardEvent("keydown", { key: "ArrowUp" }));
      expect(result.highlightedIndex.value).toBe(1);
    });

    it("ArrowDown wraps around to first option", () => {
      const { result } = createSelect(null);
      result.openDropdown();
      result.highlightedIndex.value = 2;
      result.handleKeydown(new KeyboardEvent("keydown", { key: "ArrowDown" }));
      expect(result.highlightedIndex.value).toBe(0);
    });

    it("ArrowUp wraps around to last option", () => {
      const { result } = createSelect(null);
      result.openDropdown();
      result.highlightedIndex.value = 0;
      result.handleKeydown(new KeyboardEvent("keydown", { key: "ArrowUp" }));
      expect(result.highlightedIndex.value).toBe(2);
    });

    it("skips disabled options when navigating", () => {
      const { result } = createSelect(null, {
        options: [
          { value: "a", label: "A" },
          { value: "b", label: "B", disabled: true },
          { value: "c", label: "C" },
        ],
      });
      result.openDropdown();
      result.highlightedIndex.value = 0;
      result.handleKeydown(new KeyboardEvent("keydown", { key: "ArrowDown" }));
      expect(result.highlightedIndex.value).toBe(2);
    });

    it("Enter opens dropdown when closed", () => {
      const { result } = createSelect(null);
      result.handleKeydown(new KeyboardEvent("keydown", { key: "Enter" }));
      expect(result.isOpen.value).toBe(true);
    });

    it("Enter selects highlighted option when open", () => {
      const { result, model } = createSelect(null);
      result.openDropdown();
      result.highlightedIndex.value = 1;
      result.handleKeydown(new KeyboardEvent("keydown", { key: "Enter" }));
      expect(model.value).toBe("b");
    });

    it("Space opens dropdown when closed", () => {
      const { result } = createSelect(null);
      result.handleKeydown(new KeyboardEvent("keydown", { key: " " }));
      expect(result.isOpen.value).toBe(true);
    });

    it("Escape closes dropdown", () => {
      const { result } = createSelect(null);
      result.openDropdown();
      result.handleKeydown(new KeyboardEvent("keydown", { key: "Escape" }));
      expect(result.isOpen.value).toBe(false);
    });

    it("Tab closes dropdown", () => {
      const { result } = createSelect(null);
      result.openDropdown();
      result.handleKeydown(new KeyboardEvent("keydown", { key: "Tab" }));
      expect(result.isOpen.value).toBe(false);
    });

    it("Home moves to first enabled option", () => {
      const { result } = createSelect(null, {
        options: [
          { value: "a", label: "A", disabled: true },
          { value: "b", label: "B" },
          { value: "c", label: "C" },
        ],
      });
      result.openDropdown();
      result.highlightedIndex.value = 2;
      result.handleKeydown(new KeyboardEvent("keydown", { key: "Home" }));
      expect(result.highlightedIndex.value).toBe(1);
    });

    it("End moves to last enabled option", () => {
      const { result } = createSelect(null, {
        options: [
          { value: "a", label: "A" },
          { value: "b", label: "B" },
          { value: "c", label: "C", disabled: true },
        ],
      });
      result.openDropdown();
      result.handleKeydown(new KeyboardEvent("keydown", { key: "End" }));
      expect(result.highlightedIndex.value).toBe(1);
    });

    it("End returns -1 when all options are disabled", () => {
      const { result } = createSelect(null, {
        options: [
          { value: "a", label: "A", disabled: true },
          { value: "b", label: "B", disabled: true },
        ],
      });
      result.openDropdown();
      result.handleKeydown(new KeyboardEvent("keydown", { key: "End" }));
      expect(result.highlightedIndex.value).toBe(-1);
    });

    it("Home and End do nothing when dropdown is closed", () => {
      const { result } = createSelect(null);
      result.handleKeydown(new KeyboardEvent("keydown", { key: "Home" }));
      expect(result.isOpen.value).toBe(false);
      result.handleKeydown(new KeyboardEvent("keydown", { key: "End" }));
      expect(result.isOpen.value).toBe(false);
    });

    it("does nothing for unhandled keys", () => {
      const { result } = createSelect(null);
      result.handleKeydown(new KeyboardEvent("keydown", { key: "a" }));
      expect(result.isOpen.value).toBe(false);
    });

    it("does not move highlight when options list is empty", () => {
      const { result } = createSelect(null, { options: [] });
      result.isOpen.value = true;
      result.handleKeydown(new KeyboardEvent("keydown", { key: "ArrowDown" }));
      expect(result.highlightedIndex.value).toBe(-1);
    });

    it("does not change highlight when all options are disabled (ArrowDown)", () => {
      const { result } = createSelect(null, {
        options: [
          { value: "a", label: "A", disabled: true },
          { value: "b", label: "B", disabled: true },
        ],
      });
      result.openDropdown();
      const initialIndex = result.highlightedIndex.value;
      result.handleKeydown(new KeyboardEvent("keydown", { key: "ArrowDown" }));
      expect(result.highlightedIndex.value).toBe(initialIndex);
    });

    it("calls scrollIntoView on highlighted option", () => {
      const { result } = createSelect(null);
      result.openDropdown();
      const mockEl = document.createElement("div");
      mockEl.scrollIntoView = vi.fn();
      const optionId = `${result.selectId}-option-1`;
      mockEl.id = optionId;
      document.body.appendChild(mockEl);
      result.handleKeydown(new KeyboardEvent("keydown", { key: "ArrowDown" }));
      // scrollHighlightedIntoView is async via nextTick
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockEl.scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
          mockEl.remove();
          resolve();
        }, 10);
      });
    });

    it("Enter does nothing when no option is highlighted", () => {
      const { result, model } = createSelect(null);
      result.openDropdown();
      result.highlightedIndex.value = -1;
      result.handleKeydown(new KeyboardEvent("keydown", { key: "Enter" }));
      expect(model.value).toBeNull();
    });
  });

  describe("Clear", () => {
    it("clears single value to null", () => {
      const { result, model, emits } = createSelect("a");
      result.handleClear();
      expect(model.value).toBeNull();
      expect(emits.clear).toHaveBeenCalled();
    });

    it("clears multi value to empty array", () => {
      const { result, model, emits } = createSelect(["a", "b"], { multiple: true });
      result.handleClear();
      expect(model.value).toEqual([]);
      expect(emits.clear).toHaveBeenCalled();
    });
  });

  describe("Creatable", () => {
    it("shows create option when filter has no exact match", () => {
      const { result } = createSelect(null, { creatable: true });
      result.filterText.value = "New Item";
      expect(result.showCreateOption.value).toBe(true);
    });

    it("hides create option when filter matches existing label", () => {
      const { result } = createSelect(null, { creatable: true });
      result.filterText.value = "Alpha";
      expect(result.showCreateOption.value).toBe(false);
    });

    it("hides create option when filter is empty", () => {
      const { result } = createSelect(null, { creatable: true });
      result.filterText.value = "";
      expect(result.showCreateOption.value).toBe(false);
    });

    it("hides create option when filter is whitespace-only", () => {
      const { result } = createSelect(null, { creatable: true });
      result.filterText.value = "   ";
      expect(result.showCreateOption.value).toBe(false);
    });

    it("hides create option when creatable is false", () => {
      const { result } = createSelect(null, { creatable: false });
      result.filterText.value = "New Item";
      expect(result.showCreateOption.value).toBe(false);
    });

    it("emits create event with trimmed text", () => {
      const { result, emits } = createSelect(null, { creatable: true });
      result.filterText.value = "  New Item  ";
      result.handleCreate();
      expect(emits.create).toHaveBeenCalledWith("New Item");
      expect(result.filterText.value).toBe("");
    });

    it("does not emit create when filter is empty/whitespace", () => {
      const { result, emits } = createSelect(null, { creatable: true });
      result.filterText.value = "   ";
      result.handleCreate();
      expect(emits.create).not.toHaveBeenCalled();
    });

    it("Enter selects create option when highlighted beyond options", () => {
      const { result, emits } = createSelect(null, { creatable: true });
      result.openDropdown();
      result.filterText.value = "New";
      result.highlightedIndex.value = result.filteredOptions.value.length;
      result.handleKeydown(new KeyboardEvent("keydown", { key: "Enter" }));
      expect(emits.create).toHaveBeenCalledWith("New");
    });
  });

  describe("ARIA Attributes", () => {
    it("provides combobox role on trigger", () => {
      const { result } = createSelect(null);
      expect(result.triggerAriaAttrs.value.role).toBe("combobox");
    });

    it("provides aria-expanded false when closed", () => {
      const { result } = createSelect(null);
      expect(result.triggerAriaAttrs.value["aria-expanded"]).toBe("false");
    });

    it("provides aria-expanded true when open", () => {
      const { result } = createSelect(null);
      result.openDropdown();
      expect(result.triggerAriaAttrs.value["aria-expanded"]).toBe("true");
    });

    it("provides aria-haspopup listbox", () => {
      const { result } = createSelect(null);
      expect(result.triggerAriaAttrs.value["aria-haspopup"]).toBe("listbox");
    });

    it("provides aria-controls when open", () => {
      const { result } = createSelect(null);
      result.openDropdown();
      expect(result.triggerAriaAttrs.value["aria-controls"]).toContain("listbox");
    });

    it("does not provide aria-controls when closed", () => {
      const { result } = createSelect(null);
      expect(result.triggerAriaAttrs.value["aria-controls"]).toBeUndefined();
    });

    it("provides aria-activedescendant when highlighted", () => {
      const { result } = createSelect(null);
      result.openDropdown();
      result.highlightedIndex.value = 1;
      expect(result.triggerAriaAttrs.value["aria-activedescendant"]).toContain("option-1");
    });

    it("does not provide aria-activedescendant when no highlight", () => {
      const { result } = createSelect(null);
      result.openDropdown();
      result.highlightedIndex.value = -1;
      expect(result.triggerAriaAttrs.value["aria-activedescendant"]).toBeUndefined();
    });

    it("provides option ARIA attrs", () => {
      const { result } = createSelect("a");
      const opt = { value: "a", label: "Alpha" };
      const attrs = result.optionAriaAttrs(opt, 0);
      expect(attrs.role).toBe("option");
      expect(attrs["aria-selected"]).toBe("true");
      expect(attrs.id).toContain("option-0");
    });

    it("provides aria-disabled on disabled options", () => {
      const { result } = createSelect(null);
      const opt = { value: "a", label: "Alpha", disabled: true };
      const attrs = result.optionAriaAttrs(opt, 0);
      expect(attrs["aria-disabled"]).toBe("true");
    });

    it("does not set aria-disabled on enabled options", () => {
      const { result } = createSelect(null);
      const opt = { value: "a", label: "Alpha" };
      const attrs = result.optionAriaAttrs(opt, 0);
      expect(attrs["aria-disabled"]).toBeUndefined();
    });
  });

  describe("Width Sync", () => {
    let OriginalResizeObserver: typeof ResizeObserver;

    beforeEach(() => {
      OriginalResizeObserver = globalThis.ResizeObserver;
    });

    afterEach(() => {
      globalThis.ResizeObserver = OriginalResizeObserver;
    });

    it("updates panelMinWidth via ResizeObserver callback", () => {
      let observerCallback!: ResizeObserverCallback;
      const mockObserve = vi.fn();

      globalThis.ResizeObserver = class {
        constructor(cb: ResizeObserverCallback) {
          observerCallback = cb;
        }
        observe = mockObserve;
        unobserve = vi.fn();
        disconnect = vi.fn();
      } as unknown as typeof ResizeObserver;

      const { result } = createSelect(null);
      const mockEl = document.createElement("div");
      result.observeTriggerWidth(mockEl);

      expect(mockObserve).toHaveBeenCalledWith(mockEl);

      // Simulate resize callback
      observerCallback(
        [{ contentRect: { width: 250 } } as unknown as ResizeObserverEntry],
        {} as ResizeObserver
      );
      expect(result.panelMinWidth.value).toBe("250px");
    });

    it("cleans up observer when new element is observed", () => {
      const mockUnobserve = vi.fn();
      const mockDisconnect = vi.fn();

      globalThis.ResizeObserver = class {
        constructor() {}
        observe = vi.fn();
        unobserve = mockUnobserve;
        disconnect = mockDisconnect;
      } as unknown as typeof ResizeObserver;

      const { result } = createSelect(null);
      const el1 = document.createElement("div");
      const el2 = document.createElement("div");

      result.observeTriggerWidth(el1);
      result.observeTriggerWidth(el2);

      expect(mockUnobserve).toHaveBeenCalledWith(el1);
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it("handles null element gracefully", () => {
      const { result } = createSelect(null);
      result.observeTriggerWidth(null);
      expect(result.panelMinWidth.value).toBe("0px");
    });

    it("cleans up observer on component unmount", () => {
      const mockDisconnect = vi.fn();
      const mockUnobserve = vi.fn();

      globalThis.ResizeObserver = class {
        constructor() {}
        observe = vi.fn();
        unobserve = mockUnobserve;
        disconnect = mockDisconnect;
      } as unknown as typeof ResizeObserver;

      // createSelect mounts a wrapper — store it to unmount manually
      const { result } = createSelect(null);
      const el = document.createElement("div");
      result.observeTriggerWidth(el);

      // Unmount the wrapper (triggers onBeforeUnmount -> cleanupObserver)
      const wrapper = mountedWrappers[mountedWrappers.length - 1]!;
      wrapper.unmount();

      expect(mockUnobserve).toHaveBeenCalledWith(el);
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });
});
