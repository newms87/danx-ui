import { describe, it, expect, vi, beforeEach } from "vitest";
import { computed, ref } from "vue";
import { useFieldInteraction } from "../useFieldInteraction";
import type { FieldInteractionOptions } from "../useFieldInteraction";

function createOptions(overrides: Partial<FieldInteractionOptions> = {}): FieldInteractionOptions {
  return {
    model: ref<string | number | null>(""),
    props: { size: "md" },
    hasError: computed(() => false),
    emit: vi.fn() as unknown as FieldInteractionOptions["emit"],
    bemPrefix: "danx-test",
    ...overrides,
  };
}

describe("useFieldInteraction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("isFocused", () => {
    it("starts as false", () => {
      const { isFocused } = useFieldInteraction(createOptions());
      expect(isFocused.value).toBe(false);
    });
  });

  describe("showClear", () => {
    it("returns false when clearable is not set", () => {
      const opts = createOptions();
      opts.model.value = "hello";
      const { showClear } = useFieldInteraction(opts);
      expect(showClear.value).toBe(false);
    });

    it("returns true when clearable and has value", () => {
      const opts = createOptions({ props: { clearable: true, size: "md" } });
      opts.model.value = "hello";
      const { showClear } = useFieldInteraction(opts);
      expect(showClear.value).toBe(true);
    });

    it("returns false when clearable but value is empty", () => {
      const opts = createOptions({ props: { clearable: true, size: "md" } });
      opts.model.value = "";
      const { showClear } = useFieldInteraction(opts);
      expect(showClear.value).toBe(false);
    });

    it("returns false when clearable but value is null", () => {
      const opts = createOptions({ props: { clearable: true, size: "md" } });
      opts.model.value = null;
      const { showClear } = useFieldInteraction(opts);
      expect(showClear.value).toBe(false);
    });

    it("returns false when disabled", () => {
      const opts = createOptions({ props: { clearable: true, disabled: true, size: "md" } });
      opts.model.value = "hello";
      const { showClear } = useFieldInteraction(opts);
      expect(showClear.value).toBe(false);
    });

    it("returns false when readonly", () => {
      const opts = createOptions({ props: { clearable: true, readonly: true, size: "md" } });
      opts.model.value = "hello";
      const { showClear } = useFieldInteraction(opts);
      expect(showClear.value).toBe(false);
    });

    it("uses custom isClearable when provided", () => {
      const opts = createOptions({
        props: { size: "md" },
        isClearable: computed(() => true),
      });
      opts.model.value = "hello";
      const { showClear } = useFieldInteraction(opts);
      expect(showClear.value).toBe(true);
    });
  });

  describe("containerClasses", () => {
    it("includes BEM prefix and size", () => {
      const { containerClasses } = useFieldInteraction(createOptions());
      expect(containerClasses.value).toEqual(["danx-test", "danx-test--md"]);
    });

    it("defaults to md when size is not specified", () => {
      const { containerClasses } = useFieldInteraction(createOptions({ props: {} }));
      expect(containerClasses.value).toContain("danx-test--md");
    });

    it("includes focused class when focused", () => {
      const opts = createOptions();
      const { containerClasses, handleFocus } = useFieldInteraction(opts);
      handleFocus(new FocusEvent("focus"));
      expect(containerClasses.value).toContain("danx-test--focused");
    });

    it("includes error class when hasError is true", () => {
      const { containerClasses } = useFieldInteraction(
        createOptions({ hasError: computed(() => true) })
      );
      expect(containerClasses.value).toContain("danx-test--error");
    });

    it("includes disabled class when disabled", () => {
      const { containerClasses } = useFieldInteraction(
        createOptions({ props: { disabled: true, size: "md" } })
      );
      expect(containerClasses.value).toContain("danx-test--disabled");
    });

    it("includes readonly class when readonly", () => {
      const { containerClasses } = useFieldInteraction(
        createOptions({ props: { readonly: true, size: "md" } })
      );
      expect(containerClasses.value).toContain("danx-test--readonly");
    });

    it("uses the provided size", () => {
      const { containerClasses } = useFieldInteraction(createOptions({ props: { size: "lg" } }));
      expect(containerClasses.value).toContain("danx-test--lg");
    });
  });

  describe("charCountText", () => {
    it("returns string length when no maxlength", () => {
      const opts = createOptions();
      opts.model.value = "hello";
      const { charCountText } = useFieldInteraction(opts);
      expect(charCountText.value).toBe("5");
    });

    it("returns length/maxlength format when maxlength set", () => {
      const opts = createOptions({ props: { maxlength: 20, size: "md" } });
      opts.model.value = "hello";
      const { charCountText } = useFieldInteraction(opts);
      expect(charCountText.value).toBe("5/20");
    });

    it("returns 0 for null value", () => {
      const opts = createOptions();
      opts.model.value = null;
      const { charCountText } = useFieldInteraction(opts);
      expect(charCountText.value).toBe("0");
    });

    it("returns 0 for empty string", () => {
      const opts = createOptions();
      opts.model.value = "";
      const { charCountText } = useFieldInteraction(opts);
      expect(charCountText.value).toBe("0");
    });
  });

  describe("isAtCharLimit", () => {
    it("returns false when no maxlength", () => {
      const opts = createOptions();
      opts.model.value = "hello";
      const { isAtCharLimit } = useFieldInteraction(opts);
      expect(isAtCharLimit.value).toBe(false);
    });

    it("returns true when at maxlength", () => {
      const opts = createOptions({ props: { maxlength: 5, size: "md" } });
      opts.model.value = "hello";
      const { isAtCharLimit } = useFieldInteraction(opts);
      expect(isAtCharLimit.value).toBe(true);
    });

    it("returns false when under maxlength", () => {
      const opts = createOptions({ props: { maxlength: 10, size: "md" } });
      opts.model.value = "hello";
      const { isAtCharLimit } = useFieldInteraction(opts);
      expect(isAtCharLimit.value).toBe(false);
    });
  });

  describe("handleFocus", () => {
    it("sets isFocused to true", () => {
      const opts = createOptions();
      const { isFocused, handleFocus } = useFieldInteraction(opts);
      handleFocus(new FocusEvent("focus"));
      expect(isFocused.value).toBe(true);
    });

    it("emits focus event", () => {
      const opts = createOptions();
      const { handleFocus } = useFieldInteraction(opts);
      const event = new FocusEvent("focus");
      handleFocus(event);
      expect(opts.emit).toHaveBeenCalledWith("focus", event);
    });
  });

  describe("handleBlur", () => {
    it("sets isFocused to false", () => {
      const opts = createOptions();
      const { isFocused, handleFocus, handleBlur } = useFieldInteraction(opts);
      handleFocus(new FocusEvent("focus"));
      expect(isFocused.value).toBe(true);
      handleBlur(new FocusEvent("blur"));
      expect(isFocused.value).toBe(false);
    });

    it("emits blur event", () => {
      const opts = createOptions();
      const { handleBlur } = useFieldInteraction(opts);
      const event = new FocusEvent("blur");
      handleBlur(event);
      expect(opts.emit).toHaveBeenCalledWith("blur", event);
    });
  });

  describe("handleClear", () => {
    it("sets model to empty string by default", () => {
      const opts = createOptions();
      opts.model.value = "hello";
      const { handleClear } = useFieldInteraction(opts);
      handleClear();
      expect(opts.model.value).toBe("");
    });

    it("emits clear event", () => {
      const opts = createOptions();
      const { handleClear } = useFieldInteraction(opts);
      handleClear();
      expect(opts.emit).toHaveBeenCalledWith("clear");
    });

    it("uses getClearValue when provided", () => {
      const opts = createOptions({ getClearValue: () => null });
      opts.model.value = "hello";
      const { handleClear } = useFieldInteraction(opts);
      handleClear();
      expect(opts.model.value).toBeNull();
    });

    it("getClearValue is called at clear-time (reactive)", () => {
      let clearValue: string | null = "";
      const opts = createOptions({ getClearValue: () => clearValue });
      opts.model.value = "hello";
      const { handleClear } = useFieldInteraction(opts);

      clearValue = null;
      handleClear();
      expect(opts.model.value).toBeNull();
    });
  });
});
