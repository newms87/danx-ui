/**
 * useSelect - Composable for DanxSelect dropdown state management
 *
 * Manages selection, filtering, option normalization, dropdown state,
 * ARIA attributes, and trigger width syncing. Keyboard navigation is
 * delegated to useSelectKeyboard.
 *
 * @param model - The v-model ref for selected value(s)
 * @param props - Reactive DanxSelectProps from defineProps
 * @param emit - Emit function from defineEmits
 * @returns All reactive state and handlers needed by the template
 */

import { computed, type ComputedRef, onBeforeUnmount, type Ref, ref, watch } from "vue";
import type { DanxSelectEmits, DanxSelectProps, SelectModelValue, SelectOption } from "./types";
import { useSelectKeyboard } from "./useSelectKeyboard";

let selectIdCounter = 0;

export interface UseSelectOptions {
  model: Ref<SelectModelValue | undefined>;
  props: DanxSelectProps;
  emit: DanxSelectEmits;
}

export interface UseSelectReturn {
  /** Unique ID for ARIA relationships */
  selectId: string;

  /** Whether the dropdown is open */
  isOpen: Ref<boolean>;

  /** Current filter text */
  filterText: Ref<string>;

  /** Index of keyboard-highlighted option in filteredOptions */
  highlightedIndex: Ref<number>;

  /** Options normalized via optionLabel/optionValue keys */
  normalizedOptions: ComputedRef<SelectOption[]>;

  /** Options filtered by search text */
  filteredOptions: ComputedRef<SelectOption[]>;

  /** Options organized by group (null key = ungrouped) */
  groupedOptions: ComputedRef<Map<string | null, SelectOption[]>>;

  /** Full option objects for the current model value */
  selectedOptions: ComputedRef<SelectOption[]>;

  /** Display label for single-select trigger */
  displayLabel: ComputedRef<string>;

  /** Whether the creatable "Create X" option should appear */
  showCreateOption: ComputedRef<boolean>;

  /** Minimum width for the dropdown panel (matches trigger) */
  panelMinWidth: Ref<string>;

  /** Check if an option is currently selected */
  isSelected: (option: SelectOption) => boolean;

  /** Toggle an option's selection state */
  toggleOption: (option: SelectOption) => void;

  /** Open the dropdown */
  openDropdown: () => void;

  /** Close the dropdown */
  closeDropdown: () => void;

  /** Clear the current selection */
  handleClear: () => void;

  /** Handle keyboard events on the trigger/listbox */
  handleKeydown: (event: KeyboardEvent) => void;

  /** Handle filter input changes */
  handleFilterInput: (event: Event) => void;

  /** Select the creatable option */
  handleCreate: () => void;

  /** Set up ResizeObserver on trigger element */
  observeTriggerWidth: (el: HTMLElement | null) => void;

  /** ARIA attributes for the trigger element */
  triggerAriaAttrs: ComputedRef<Record<string, string | undefined>>;

  /** Generate ARIA attributes for an option element */
  optionAriaAttrs: (option: SelectOption, index: number) => Record<string, string | undefined>;
}

export function useSelect({ model, props, emit }: UseSelectOptions): UseSelectReturn {
  const selectId = `danx-select-${++selectIdCounter}`;
  const listboxId = `${selectId}-listbox`;

  const isOpen = ref(false);
  const filterText = ref("");
  const highlightedIndex = ref(-1);
  const panelMinWidth = ref("0px");

  let resizeObserver: ResizeObserver | null = null;
  let observedElement: HTMLElement | null = null;

  // ---------------------------------------------------------------------------
  // Option Normalization
  // ---------------------------------------------------------------------------

  const normalizedOptions = computed<SelectOption[]>(() => {
    const labelKey = props.optionLabel || "label";
    const valueKey = props.optionValue || "value";

    return props.options.map((opt) => {
      const raw = opt as unknown as Record<string, unknown>;
      return {
        value: raw[valueKey] as string | number,
        label: String(raw[labelKey] ?? raw[valueKey] ?? ""),
        icon: opt.icon,
        description: opt.description,
        disabled: opt.disabled,
        group: opt.group,
      };
    });
  });

  // ---------------------------------------------------------------------------
  // Model Coercion
  // ---------------------------------------------------------------------------

  /** Ensure model matches the multiple mode */
  function coerceModel(): void {
    const val = model.value;
    if (props.multiple && !Array.isArray(val) && val != null) {
      model.value = [val as string | number];
    } else if (!props.multiple && Array.isArray(val)) {
      model.value = val.length > 0 ? val[0] : null;
    }
  }

  // Coerce on init and when multiple changes
  watch(() => props.multiple, coerceModel, { immediate: true });

  // ---------------------------------------------------------------------------
  // Selection
  // ---------------------------------------------------------------------------

  const selectedOptions = computed<SelectOption[]>(() => {
    if (model.value == null) return [];
    const values = Array.isArray(model.value) ? model.value : [model.value];
    return values
      .map((v) => normalizedOptions.value.find((opt) => opt.value === v))
      .filter((opt): opt is SelectOption => opt != null);
  });

  const displayLabel = computed(() => {
    if (selectedOptions.value.length === 0) return "";
    return selectedOptions.value[0]!.label;
  });

  function isSelected(option: SelectOption): boolean {
    if (model.value == null) return false;
    if (Array.isArray(model.value)) {
      return model.value.includes(option.value);
    }
    return model.value === option.value;
  }

  function toggleOption(option: SelectOption): void {
    if (option.disabled) return;

    if (props.multiple) {
      const current = Array.isArray(model.value) ? [...model.value] : [];
      const idx = current.indexOf(option.value);
      if (idx >= 0) {
        current.splice(idx, 1);
      } else {
        current.push(option.value);
      }
      model.value = current;
    } else {
      model.value = option.value;
      closeDropdown();
    }
  }

  // ---------------------------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------------------------

  const filteredOptions = computed<SelectOption[]>(() => {
    if (!filterText.value) return normalizedOptions.value;
    const query = filterText.value.toLowerCase();
    return normalizedOptions.value.filter((opt) => opt.label.toLowerCase().includes(query));
  });

  const groupedOptions = computed<Map<string | null, SelectOption[]>>(() => {
    const groups = new Map<string | null, SelectOption[]>();
    for (const opt of filteredOptions.value) {
      const key = opt.group ?? null;
      const list = groups.get(key);
      if (list) {
        list.push(opt);
      } else {
        groups.set(key, [opt]);
      }
    }
    return groups;
  });

  const showCreateOption = computed(() => {
    if (!props.creatable || !filterText.value.trim()) return false;
    const query = filterText.value.trim().toLowerCase();
    return !normalizedOptions.value.some((opt) => opt.label.toLowerCase() === query);
  });

  function handleFilterInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    filterText.value = target.value;
    highlightedIndex.value = 0;
    emit("filter", filterText.value);
  }

  function handleCreate(): void {
    const text = filterText.value.trim();
    if (text) {
      emit("create", text);
      filterText.value = "";
    }
  }

  // ---------------------------------------------------------------------------
  // Dropdown State
  // ---------------------------------------------------------------------------

  function openDropdown(): void {
    if (props.disabled || props.readonly) return;
    isOpen.value = true;
    filterText.value = "";
    highlightedIndex.value = findFirstEnabledIndex();
  }

  function closeDropdown(): void {
    isOpen.value = false;
    highlightedIndex.value = -1;
  }

  // ---------------------------------------------------------------------------
  // Keyboard Navigation (delegated to useSelectKeyboard)
  // ---------------------------------------------------------------------------

  const { handleKeydown, findFirstEnabledIndex } = useSelectKeyboard({
    selectId,
    filteredOptions,
    highlightedIndex,
    isOpen,
    showCreateOption,
    openDropdown,
    closeDropdown,
    toggleOption,
    handleCreate,
  });

  // ---------------------------------------------------------------------------
  // Clear
  // ---------------------------------------------------------------------------

  function handleClear(): void {
    model.value = props.multiple ? [] : null;
    emit("clear");
  }

  // ---------------------------------------------------------------------------
  // Width Sync
  // ---------------------------------------------------------------------------

  function observeTriggerWidth(el: HTMLElement | null): void {
    cleanupObserver();

    if (!el) return;

    observedElement = el;
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        panelMinWidth.value = `${entry.contentRect.width}px`;
      }
    });
    resizeObserver.observe(el);
  }

  function cleanupObserver(): void {
    if (resizeObserver && observedElement) {
      resizeObserver.unobserve(observedElement);
      resizeObserver.disconnect();
      resizeObserver = null;
      observedElement = null;
    }
  }

  onBeforeUnmount(cleanupObserver);

  // ---------------------------------------------------------------------------
  // ARIA
  // ---------------------------------------------------------------------------

  const triggerAriaAttrs = computed<Record<string, string | undefined>>(() => ({
    role: "combobox",
    "aria-expanded": String(isOpen.value),
    "aria-haspopup": "listbox",
    "aria-controls": isOpen.value ? listboxId : undefined,
    "aria-activedescendant":
      isOpen.value && highlightedIndex.value >= 0
        ? `${selectId}-option-${highlightedIndex.value}`
        : undefined,
  }));

  function optionAriaAttrs(
    option: SelectOption,
    index: number
  ): Record<string, string | undefined> {
    return {
      id: `${selectId}-option-${index}`,
      role: "option",
      "aria-selected": String(isSelected(option)),
      "aria-disabled": option.disabled ? "true" : undefined,
    };
  }

  return {
    selectId,
    isOpen,
    filterText,
    highlightedIndex,
    normalizedOptions,
    filteredOptions,
    groupedOptions,
    selectedOptions,
    displayLabel,
    showCreateOption,
    panelMinWidth,
    isSelected,
    toggleOption,
    openDropdown,
    closeDropdown,
    handleClear,
    handleKeydown,
    handleFilterInput,
    handleCreate,
    observeTriggerWidth,
    triggerAriaAttrs,
    optionAriaAttrs,
  };
}
