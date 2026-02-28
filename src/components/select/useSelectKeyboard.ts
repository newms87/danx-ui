/**
 * useSelectKeyboard - Keyboard navigation for DanxSelect
 *
 * Handles arrow keys, Enter/Space selection, Home/End jumps,
 * Escape/Tab close, and scroll-into-view for highlighted options.
 *
 * @param options - Refs and callbacks from the parent useSelect composable
 * @returns handleKeydown handler and navigation helpers
 */

import { type ComputedRef, nextTick, type Ref } from "vue";
import type { SelectOption } from "./types";

export interface UseSelectKeyboardOptions {
  /** Unique select ID for generating option element IDs */
  selectId: string;

  /** Filtered options list to navigate */
  filteredOptions: ComputedRef<SelectOption[]>;

  /** Currently highlighted option index */
  highlightedIndex: Ref<number>;

  /** Whether the dropdown is open */
  isOpen: Ref<boolean>;

  /** Whether the creatable "Create X" option is visible */
  showCreateOption: ComputedRef<boolean>;

  /** Open the dropdown */
  openDropdown: () => void;

  /** Close the dropdown */
  closeDropdown: () => void;

  /** Toggle an option's selection state */
  toggleOption: (option: SelectOption) => void;

  /** Select the creatable option */
  handleCreate: () => void;
}

export interface UseSelectKeyboardReturn {
  /** Handle keyboard events on the trigger/listbox */
  handleKeydown: (event: KeyboardEvent) => void;

  /** Find the first non-disabled option index */
  findFirstEnabledIndex: () => number;

  /** Scroll the highlighted option into view */
  scrollHighlightedIntoView: () => void;
}

export function useSelectKeyboard({
  selectId,
  filteredOptions,
  highlightedIndex,
  isOpen,
  showCreateOption,
  openDropdown,
  closeDropdown,
  toggleOption,
  handleCreate,
}: UseSelectKeyboardOptions): UseSelectKeyboardReturn {
  function optionId(index: number): string {
    return `${selectId}-option-${index}`;
  }

  function findFirstEnabledIndex(): number {
    return filteredOptions.value.findIndex((opt) => !opt.disabled);
  }

  function findLastEnabledIndex(): number {
    const opts = filteredOptions.value;
    for (let i = opts.length - 1; i >= 0; i--) {
      if (!opts[i]?.disabled) return i;
    }
    return -1;
  }

  function moveHighlight(direction: 1 | -1): void {
    const opts = filteredOptions.value;
    if (opts.length === 0) return;

    let idx = highlightedIndex.value;
    const len = opts.length;

    for (let i = 0; i < len; i++) {
      idx = (idx + direction + len) % len;
      if (!opts[idx]?.disabled) {
        highlightedIndex.value = idx;
        scrollHighlightedIntoView();
        return;
      }
    }
  }

  function scrollHighlightedIntoView(): void {
    nextTick(() => {
      const el = document.getElementById(optionId(highlightedIndex.value));
      el?.scrollIntoView({ block: "nearest" });
    });
  }

  function handleKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen.value) {
          openDropdown();
        } else {
          moveHighlight(1);
        }
        break;

      case "ArrowUp":
        event.preventDefault();
        if (!isOpen.value) {
          openDropdown();
        } else {
          moveHighlight(-1);
        }
        break;

      case "Enter":
      case " ":
        event.preventDefault();
        if (!isOpen.value) {
          openDropdown();
        } else if (
          showCreateOption.value &&
          highlightedIndex.value >= filteredOptions.value.length
        ) {
          handleCreate();
        } else if (
          highlightedIndex.value >= 0 &&
          highlightedIndex.value < filteredOptions.value.length
        ) {
          const opt = filteredOptions.value[highlightedIndex.value];
          if (opt) toggleOption(opt);
        }
        break;

      case "Escape":
        event.preventDefault();
        closeDropdown();
        break;

      case "Tab":
        closeDropdown();
        break;

      case "Home":
        event.preventDefault();
        if (isOpen.value) {
          highlightedIndex.value = findFirstEnabledIndex();
          scrollHighlightedIntoView();
        }
        break;

      case "End":
        event.preventDefault();
        if (isOpen.value) {
          highlightedIndex.value = findLastEnabledIndex();
          scrollHighlightedIntoView();
        }
        break;
    }
  }

  return {
    handleKeydown,
    findFirstEnabledIndex,
    scrollHighlightedIntoView,
  };
}
