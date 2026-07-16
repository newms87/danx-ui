import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { computed, ref } from "vue";
import { useSelectKeyboard } from "../useSelectKeyboard";
import type { SelectOption } from "../types";

function createHarness(overrides: { filterable?: boolean; options?: SelectOption[] } = {}) {
  const options: SelectOption[] = overrides.options ?? [
    { value: "ca", label: "California" },
    { value: "co", label: "Colorado" },
    { value: "ct", label: "Connecticut" },
    { value: "de", label: "Delaware", disabled: true },
    { value: "fl", label: "Florida" },
  ];

  const filteredOptions = computed(() => options);
  const highlightedIndex = ref(-1);
  const isOpen = ref(false);
  const showCreateOption = computed(() => false);
  const filterable = computed(() => overrides.filterable ?? false);
  const openDropdown = vi.fn(() => {
    isOpen.value = true;
  });
  const closeDropdown = vi.fn(() => {
    isOpen.value = false;
  });
  const toggleOption = vi.fn();
  const handleCreate = vi.fn();

  const keyboard = useSelectKeyboard({
    selectId: "test-select",
    filteredOptions,
    highlightedIndex,
    isOpen,
    showCreateOption,
    filterable,
    openDropdown,
    closeDropdown,
    toggleOption,
    handleCreate,
  });

  return { keyboard, options, highlightedIndex, isOpen, openDropdown };
}

function keydown(key: string): KeyboardEvent {
  return new KeyboardEvent("keydown", { key, cancelable: true });
}

describe("useSelectKeyboard - type-ahead", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens the dropdown and highlights the first option starting with the typed letter", () => {
    const { keyboard, isOpen, highlightedIndex } = createHarness();

    keyboard.handleKeydown(keydown("c"));

    expect(isOpen.value).toBe(true);
    expect(highlightedIndex.value).toBe(0); // California
  });

  it("cycles through options starting with the same repeated letter", () => {
    const { keyboard, highlightedIndex } = createHarness();

    keyboard.handleKeydown(keydown("c"));
    expect(highlightedIndex.value).toBe(0); // California

    keyboard.handleKeydown(keydown("c"));
    expect(highlightedIndex.value).toBe(1); // Colorado

    keyboard.handleKeydown(keydown("c"));
    expect(highlightedIndex.value).toBe(2); // Connecticut

    keyboard.handleKeydown(keydown("c"));
    expect(highlightedIndex.value).toBe(0); // wraps back to California
  });

  it("builds a multi-character prefix buffer when keys are typed within the idle window", () => {
    const { keyboard, highlightedIndex } = createHarness();

    keyboard.handleKeydown(keydown("c"));
    expect(highlightedIndex.value).toBe(0); // California

    vi.advanceTimersByTime(200);
    keyboard.handleKeydown(keydown("a"));

    expect(highlightedIndex.value).toBe(0); // "ca" -> California
  });

  it("resets the buffer after the idle timeout, starting a fresh match", () => {
    const { keyboard, highlightedIndex } = createHarness();

    keyboard.handleKeydown(keydown("c"));
    expect(highlightedIndex.value).toBe(0); // California

    vi.advanceTimersByTime(600);
    keyboard.handleKeydown(keydown("f"));

    expect(highlightedIndex.value).toBe(4); // Florida, not a "cf" mismatch
  });

  it("skips disabled options when cycling matches", () => {
    const { keyboard, highlightedIndex } = createHarness({
      options: [
        { value: "de1", label: "Delaware", disabled: true },
        { value: "de2", label: "Denver" },
      ],
    });

    keyboard.handleKeydown(keydown("d"));

    expect(highlightedIndex.value).toBe(1); // Denver, skipping disabled Delaware
  });

  it("is a no-op when filterable is true", () => {
    const { keyboard, isOpen, highlightedIndex } = createHarness({ filterable: true });

    keyboard.handleKeydown(keydown("c"));

    expect(isOpen.value).toBe(false);
    expect(highlightedIndex.value).toBe(-1);
  });

  it("ignores modified key presses and non-character keys", () => {
    const { keyboard, isOpen } = createHarness();

    keyboard.handleKeydown(
      new KeyboardEvent("keydown", { key: "c", ctrlKey: true, cancelable: true })
    );

    expect(isOpen.value).toBe(false);
  });
});
