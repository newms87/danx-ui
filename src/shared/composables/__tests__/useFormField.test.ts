import { describe, it, expect, beforeEach } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { defineComponent, reactive } from "vue";
import { useFormField } from "../useFormField";
import type { FormFieldBaseProps } from "../../form-types";
import type { UseFormFieldReturn } from "../useFormField";

/**
 * Helper: creates useFormField inside a mounted component to satisfy
 * any future lifecycle hooks, and returns the composable result.
 */
function createFormField(initialProps: FormFieldBaseProps = {}) {
  const props = reactive<FormFieldBaseProps>({ ...initialProps });
  let result!: UseFormFieldReturn;

  const wrapper = mount(
    defineComponent({
      setup() {
        result = useFormField(props);
        return {};
      },
      template: "<div />",
    })
  );

  return { result, props, wrapper };
}

// Track wrappers for cleanup
const wrappers: VueWrapper[] = [];

function tracked(initialProps: FormFieldBaseProps = {}) {
  const ctx = createFormField(initialProps);
  wrappers.push(ctx.wrapper);
  return ctx;
}

beforeEach(() => {
  for (const w of wrappers) w.unmount();
  wrappers.length = 0;
});

describe("useFormField", () => {
  describe("fieldId", () => {
    it("auto-generates an id when id prop is absent", () => {
      const { result } = tracked();

      expect(result.fieldId.value).toMatch(/^danx-field-\d+$/);
    });

    it("uses the provided id prop", () => {
      const { result } = tracked({ id: "my-custom-id" });

      expect(result.fieldId.value).toBe("my-custom-id");
    });

    it("generates unique ids across multiple instances", () => {
      const { result: r1 } = tracked();
      const { result: r2 } = tracked();

      expect(r1.fieldId.value).not.toBe(r2.fieldId.value);
    });
  });

  describe("fieldState", () => {
    it("returns 'default' when no error", () => {
      const { result } = tracked();

      expect(result.fieldState.value).toBe("default");
    });

    it("returns 'error' when error is a string", () => {
      const { result } = tracked({ error: "Something went wrong" });

      expect(result.fieldState.value).toBe("error");
    });

    it("returns 'error' when error is true", () => {
      const { result } = tracked({ error: true });

      expect(result.fieldState.value).toBe("error");
    });

    it("returns 'default' when error is false", () => {
      const { result } = tracked({ error: false });

      expect(result.fieldState.value).toBe("default");
    });
  });

  describe("hasError / errorMessage", () => {
    it("hasError is false when no error", () => {
      const { result } = tracked();

      expect(result.hasError.value).toBe(false);
    });

    it("hasError is true for string error", () => {
      const { result } = tracked({ error: "Required" });

      expect(result.hasError.value).toBe(true);
    });

    it("hasError is true for boolean true error", () => {
      const { result } = tracked({ error: true });

      expect(result.hasError.value).toBe(true);
    });

    it("errorMessage returns the string when error is a string", () => {
      const { result } = tracked({ error: "Invalid email" });

      expect(result.errorMessage.value).toBe("Invalid email");
    });

    it("errorMessage returns empty string when error is boolean true", () => {
      const { result } = tracked({ error: true });

      expect(result.errorMessage.value).toBe("");
    });

    it("errorMessage returns empty string when no error", () => {
      const { result } = tracked();

      expect(result.errorMessage.value).toBe("");
    });

    it("hasError is false for empty string error", () => {
      const { result } = tracked({ error: "" });

      expect(result.hasError.value).toBe(false);
    });
  });

  describe("Reactivity", () => {
    it("updates hasError when error prop changes", () => {
      const { result, props } = tracked({});

      expect(result.hasError.value).toBe(false);
      props.error = "New error";
      expect(result.hasError.value).toBe(true);
    });

    it("updates fieldState when error prop changes", () => {
      const { result, props } = tracked({});

      expect(result.fieldState.value).toBe("default");
      props.error = "Bad";
      expect(result.fieldState.value).toBe("error");
    });

    it("updates fieldClasses when size changes", () => {
      const { result, props } = tracked({ size: "sm" });

      expect(result.fieldClasses.value).toContain("danx-field--sm");
      props.size = "lg";
      expect(result.fieldClasses.value).toContain("danx-field--lg");
      expect(result.fieldClasses.value).not.toContain("danx-field--sm");
    });

    it("updates inputAriaAttrs when required changes", () => {
      const { result, props } = tracked({});

      expect(result.inputAriaAttrs.value["aria-required"]).toBeUndefined();
      props.required = true;
      expect(result.inputAriaAttrs.value["aria-required"]).toBe("true");
    });
  });

  describe("fieldClasses", () => {
    it("includes size class defaulting to md", () => {
      const { result } = tracked();

      expect(result.fieldClasses.value).toContain("danx-field--md");
    });

    it("includes the specified size class", () => {
      const { result: sm } = tracked({ size: "sm" });
      const { result: lg } = tracked({ size: "lg" });

      expect(sm.fieldClasses.value).toContain("danx-field--sm");
      expect(lg.fieldClasses.value).toContain("danx-field--lg");
    });

    it("includes error class when error is set", () => {
      const { result } = tracked({ error: "Bad" });

      expect(result.fieldClasses.value).toContain("danx-field--error");
    });

    it("does not include error class when no error", () => {
      const { result } = tracked();

      expect(result.fieldClasses.value).not.toContain("danx-field--error");
    });

    it("includes disabled class when disabled", () => {
      const { result } = tracked({ disabled: true });

      expect(result.fieldClasses.value).toContain("danx-field--disabled");
    });

    it("includes readonly class when readonly", () => {
      const { result } = tracked({ readonly: true });

      expect(result.fieldClasses.value).toContain("danx-field--readonly");
    });

    it("does not include disabled/readonly when not set", () => {
      const { result } = tracked();

      expect(result.fieldClasses.value).not.toContain("danx-field--disabled");
      expect(result.fieldClasses.value).not.toContain("danx-field--readonly");
    });
  });

  describe("inputAriaAttrs", () => {
    it("includes aria-invalid when error is set", () => {
      const { result } = tracked({ error: "Bad" });

      expect(result.inputAriaAttrs.value["aria-invalid"]).toBe("true");
    });

    it("does not include aria-invalid when no error", () => {
      const { result } = tracked();

      expect(result.inputAriaAttrs.value["aria-invalid"]).toBeUndefined();
    });

    it("includes aria-required when required", () => {
      const { result } = tracked({ required: true });

      expect(result.inputAriaAttrs.value["aria-required"]).toBe("true");
    });

    it("does not include aria-required when not required", () => {
      const { result } = tracked();

      expect(result.inputAriaAttrs.value["aria-required"]).toBeUndefined();
    });

    it("includes aria-describedby when error message exists", () => {
      const { result } = tracked({ error: "Bad", id: "test-field" });

      expect(result.inputAriaAttrs.value["aria-describedby"]).toBe("test-field-message");
    });

    it("includes aria-describedby when helperText exists", () => {
      const { result } = tracked({ helperText: "Enter your name", id: "test-field" });

      expect(result.inputAriaAttrs.value["aria-describedby"]).toBe("test-field-message");
    });

    it("does not include aria-describedby when no message or helper", () => {
      const { result } = tracked();

      expect(result.inputAriaAttrs.value["aria-describedby"]).toBeUndefined();
    });

    it("does not include aria-describedby when error is boolean true with helperText", () => {
      const { result } = tracked({ error: true, helperText: "Help text", id: "test" });

      // error=true hides helper and has no error message, so no DOM element exists
      expect(result.inputAriaAttrs.value["aria-describedby"]).toBeUndefined();
    });
  });
});
