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

/** Idle window (ms) after which the type-ahead character buffer resets */
const TYPEAHEAD_RESET_MS = 500;

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

  /** Whether the search input is shown - when true, letter-key type-ahead is disabled */
  filterable: ComputedRef<boolean>;

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
  filterable,
  openDropdown,
  closeDropdown,
  toggleOption,
  handleCreate,
}: UseSelectKeyboardOptions): UseSelectKeyboardReturn {
  let typeaheadBuffer = "";
  let typeaheadTimer: ReturnType<typeof setTimeout> | undefined;

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

  function resetTypeahead(): void {
    typeaheadBuffer = "";
    if (typeaheadTimer !== undefined) {
      clearTimeout(typeaheadTimer);
      typeaheadTimer = undefined;
    }
  }

  function handleTypeahead(char: string): void {
    if (typeaheadTimer !== undefined) clearTimeout(typeaheadTimer);

    const lower = char.toLowerCase();
    // Repeating the same character cycles through matches instead of
    // growing the prefix (e.g. "c", "c", "c" cycles California/Colorado/...
    // rather than searching for "ccc").
    const isRepeatOfSameChar =
      typeaheadBuffer.length > 0 && [...typeaheadBuffer].every((c) => c === lower);
    typeaheadBuffer = isRepeatOfSameChar ? lower : typeaheadBuffer + lower;
    typeaheadTimer = setTimeout(resetTypeahead, TYPEAHEAD_RESET_MS);

    const opts = filteredOptions.value;
    if (opts.length === 0) return;

    const startIdx = isOpen.value ? highlightedIndex.value : -1;
    const matchesBuffer = (opt: SelectOption): boolean =>
      !opt.disabled && opt.label.toLowerCase().startsWith(typeaheadBuffer);

    // Search forward from just after the current highlight, wrapping around,
    // so repeated presses of the same letter cycle through all matches.
    for (let offset = 1; offset <= opts.length; offset++) {
      const idx = (startIdx + offset) % opts.length;
      const opt = opts[idx];
      if (opt && matchesBuffer(opt)) {
        if (!isOpen.value) openDropdown();
        highlightedIndex.value = idx;
        scrollHighlightedIntoView();
        return;
      }
    }
  }

  function isPrintableSingleChar(event: KeyboardEvent): boolean {
    return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
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

      default:
        // DXUI-183: letter-key type-ahead only makes sense when there's no
        // search input already doing this job.
        if (!filterable.value && isPrintableSingleChar(event)) {
          event.preventDefault();
          handleTypeahead(event.key);
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
