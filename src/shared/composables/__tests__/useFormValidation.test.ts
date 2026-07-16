import { describe, it, expect, vi } from "vitest";
import { reactive, nextTick } from "vue";
import {
  useFormValidation,
  required,
  min,
  max,
  minLength,
  maxLength,
  pattern,
  email,
  custom,
} from "../useFormValidation";

describe("useFormValidation", () => {
  describe("required", () => {
    it("flags null, undefined, and empty string", () => {
      const rule = required();
      expect(rule(null, {})).toBe("This field is required");
      expect(rule(undefined, {})).toBe("This field is required");
      expect(rule("", {})).toBe("This field is required");
    });

    it("flags empty arrays", () => {
      expect(required()([], {})).toBe("This field is required");
    });

    it("passes non-empty values", () => {
      expect(required()("hi", {})).toBeNull();
      expect(required()(0, {})).toBeNull();
      expect(required()(false, {})).toBeNull();
      expect(required()(["a"], {})).toBeNull();
    });

    it("supports a custom message", () => {
      expect(required("Required!")(null, {})).toBe("Required!");
    });
  });

  describe("min / max", () => {
    it("min flags values below the limit", () => {
      expect(min(5)(3, {})).toBe("Must be at least 5");
      expect(min(5)(5, {})).toBeNull();
      expect(min(5)(9, {})).toBeNull();
    });

    it("max flags values above the limit", () => {
      expect(max(5)(9, {})).toBe("Must be at most 5");
      expect(max(5)(5, {})).toBeNull();
      expect(max(5)(3, {})).toBeNull();
    });

    it("min/max skip empty values (delegated to required)", () => {
      expect(min(5)(null, {})).toBeNull();
      expect(max(5)(undefined, {})).toBeNull();
    });

    it("supports custom messages", () => {
      expect(min(5, "too small")(1, {})).toBe("too small");
      expect(max(5, "too big")(9, {})).toBe("too big");
    });
  });

  describe("minLength / maxLength", () => {
    it("minLength flags short strings and arrays", () => {
      expect(minLength(3)("ab", {})).toBe("Must be at least 3 characters");
      expect(minLength(3)("abc", {})).toBeNull();
      expect(minLength(3)(["a", "b"], {})).toBe("Must be at least 3 characters");
    });

    it("maxLength flags long strings and arrays", () => {
      expect(maxLength(3)("abcd", {})).toBe("Must be at most 3 characters");
      expect(maxLength(3)("abc", {})).toBeNull();
      expect(maxLength(3)(["a", "b", "c", "d"], {})).toBe("Must be at most 3 characters");
    });

    it("skip empty values", () => {
      expect(minLength(3)(null, {})).toBeNull();
      expect(maxLength(3)(undefined, {})).toBeNull();
    });

    it("supports custom messages", () => {
      expect(minLength(3, "short")("a", {})).toBe("short");
      expect(maxLength(3, "long")("abcd", {})).toBe("long");
    });
  });

  describe("pattern / email", () => {
    it("pattern flags non-matching strings", () => {
      const digitsOnly = pattern(/^\d+$/);
      expect(digitsOnly("abc", {})).toBe("Invalid format");
      expect(digitsOnly("123", {})).toBeNull();
    });

    it("pattern skips empty values", () => {
      expect(pattern(/^\d+$/)("", {})).toBeNull();
    });

    it("pattern supports custom messages", () => {
      expect(pattern(/^\d+$/, "digits only")("abc", {})).toBe("digits only");
    });

    it("email flags malformed addresses", () => {
      expect(email()("not-an-email", {})).toBe("Must be a valid email address");
      expect(email()("user@example.com", {})).toBeNull();
    });

    it("email skips empty values", () => {
      expect(email()("", {})).toBeNull();
    });

    it("email supports a custom message", () => {
      expect(email("bad email")("nope", {})).toBe("bad email");
    });
  });

  describe("custom", () => {
    it("wraps an arbitrary validator unchanged", () => {
      const rule = custom<string>((value, model) =>
        value !== model.confirm ? "Must match" : null
      );
      expect(rule("a", { confirm: "b" })).toBe("Must match");
      expect(rule("a", { confirm: "a" })).toBeNull();
    });
  });

  describe("useFormValidation", () => {
    it("starts with no errors and isValid true", () => {
      const model = reactive({ name: "" });
      const { errors, isValid, isValidating } = useFormValidation(model, {
        name: [required()],
      });

      expect(errors.name).toBeNull();
      expect(isValid.value).toBe(true);
      expect(isValidating.value).toBe(false);
    });

    it("validateField runs each rule in order and stops at the first error", () => {
      const model = reactive({ name: "" });
      const secondRule = vi.fn(() => "second");
      const { errors, validateField } = useFormValidation(model, {
        name: [required(), secondRule],
      });

      return validateField("name").then((valid) => {
        expect(valid).toBe(false);
        expect(errors.name).toBe("This field is required");
        expect(secondRule).not.toHaveBeenCalled();
      });
    });

    it("validateField clears the error once the value becomes valid", async () => {
      const model = reactive({ name: "" });
      const { errors, validateField } = useFormValidation(model, {
        name: [required()],
      });

      await validateField("name");
      expect(errors.name).toBe("This field is required");

      model.name = "Ada";
      const valid = await validateField("name");
      expect(valid).toBe(true);
      expect(errors.name).toBeNull();
    });

    it("validateField on an unknown field is a no-op success", async () => {
      const model = reactive({ name: "" });
      const { validateField } = useFormValidation(model, { name: [required()] });

      const valid = await validateField("unknown");
      expect(valid).toBe(true);
    });

    it("validate() checks every field and reflects overall validity", async () => {
      const model = reactive({ name: "", email: "user@example.com" });
      const { errors, isValid, validate } = useFormValidation(model, {
        name: [required()],
        email: [required(), email()],
      });

      const valid = await validate();
      expect(valid).toBe(false);
      expect(errors.name).toBe("This field is required");
      expect(errors.email).toBeNull();
      expect(isValid.value).toBe(false);

      model.name = "Ada";
      const revalidated = await validate();
      expect(revalidated).toBe(true);
      expect(isValid.value).toBe(true);
    });

    it("supports async validators and reflects isValidating while pending", async () => {
      const model = reactive({ username: "taken" });
      let resolvePending!: (value: string | null) => void;
      const asyncRule = vi.fn(
        () =>
          new Promise<string | null>((resolve) => {
            resolvePending = resolve;
          })
      );

      const { errors, isValidating, validateField } = useFormValidation(model, {
        username: [asyncRule],
      });

      const pendingCall = validateField("username");
      await nextTick();
      expect(isValidating.value).toBe(true);

      resolvePending("Username is taken");
      const valid = await pendingCall;

      expect(valid).toBe(false);
      expect(errors.username).toBe("Username is taken");
      expect(isValidating.value).toBe(false);
    });

    it("supports cross-field custom validators", async () => {
      const model = reactive({ password: "secret", confirm: "nope" });
      const { errors, validate } = useFormValidation(model, {
        confirm: [custom((value, m) => (value !== m.password ? "Passwords must match" : null))],
      });

      await validate();
      expect(errors.confirm).toBe("Passwords must match");

      model.confirm = "secret";
      await validate();
      expect(errors.confirm).toBeNull();
    });

    it("reset() clears errors and pending state without touching the model", async () => {
      const model = reactive({ name: "" });
      const { errors, isValid, validate, reset } = useFormValidation(model, {
        name: [required()],
      });

      await validate();
      expect(isValid.value).toBe(false);

      reset();
      expect(errors.name).toBeNull();
      expect(isValid.value).toBe(true);
      expect(model.name).toBe("");
    });

    it("defaults validateOn to submit-only (no auto-validation on model change)", async () => {
      const model = reactive({ name: "" });
      const { errors } = useFormValidation(model, { name: [required()] });

      model.name = "";
      await nextTick();
      expect(errors.name).toBeNull();
    });

    it("auto-validates on input when validateOn includes 'input'", async () => {
      const model = reactive({ name: "" });
      const { errors } = useFormValidation(
        model,
        { name: [required()] },
        { validateOn: ["input"] }
      );

      model.name = "x";
      await nextTick();
      model.name = "";
      await nextTick();
      expect(errors.name).toBe("This field is required");

      model.name = "Ada";
      await nextTick();
      expect(errors.name).toBeNull();
    });
  });
});
