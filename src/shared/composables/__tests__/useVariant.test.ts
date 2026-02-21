import { describe, it, expect } from "vitest";
import { ref, computed, nextTick } from "vue";
import { useVariant } from "../useVariant";

describe("useVariant", () => {
  it("returns empty object when variant is empty string", () => {
    const variant = ref("");
    const variantStyle = useVariant(variant, "button", {
      "--dx-button-bg": "bg",
    });

    expect(variantStyle.value).toEqual({});
  });

  it("returns empty object when variant is undefined or null", () => {
    const variant = ref(undefined as unknown as string);
    const variantStyle = useVariant(variant, "button", {
      "--dx-button-bg": "bg",
    });

    expect(variantStyle.value).toEqual({});
  });

  it("returns inline style mapping component tokens to variant token references", () => {
    const variant = ref("danger");
    const variantStyle = useVariant(variant, "button", {
      "--dx-button-bg": "bg",
    });

    expect(variantStyle.value).toEqual({
      "--dx-button-bg": "var(--dx-variant-button-danger-bg, var(--dx-variant-danger-bg))",
    });
  });

  it("handles multiple tokens in the map", () => {
    const variant = ref("danger");
    const variantStyle = useVariant(variant, "button", {
      "--dx-button-bg": "bg",
      "--dx-button-hover-bg": "bg-hover",
      "--dx-button-text": "text",
    });

    expect(variantStyle.value).toEqual({
      "--dx-button-bg": "var(--dx-variant-button-danger-bg, var(--dx-variant-danger-bg))",
      "--dx-button-hover-bg":
        "var(--dx-variant-button-danger-bg-hover, var(--dx-variant-danger-bg-hover))",
      "--dx-button-text": "var(--dx-variant-button-danger-text, var(--dx-variant-danger-text))",
    });
  });

  it("handles custom (non-built-in) variant names", () => {
    const variant = ref("artifact-output");
    const variantStyle = useVariant(variant, "chip", {
      "--dx-chip-bg": "bg",
      "--dx-chip-border": "border",
    });

    expect(variantStyle.value).toEqual({
      "--dx-chip-bg":
        "var(--dx-variant-chip-artifact-output-bg, var(--dx-variant-artifact-output-bg))",
      "--dx-chip-border":
        "var(--dx-variant-chip-artifact-output-border, var(--dx-variant-artifact-output-border))",
    });
  });

  it("returns computed reactive value that updates when variant changes", async () => {
    const variant = ref("primary");
    const variantStyle = useVariant(variant, "button", {
      "--dx-button-bg": "bg",
    });

    expect(variantStyle.value).toEqual({
      "--dx-button-bg": "var(--dx-variant-button-primary-bg, var(--dx-variant-primary-bg))",
    });

    // Change variant
    variant.value = "secondary";
    await nextTick();

    expect(variantStyle.value).toEqual({
      "--dx-button-bg": "var(--dx-variant-button-secondary-bg, var(--dx-variant-secondary-bg))",
    });

    // Clear variant
    variant.value = "";
    await nextTick();

    expect(variantStyle.value).toEqual({});
  });

  it("works with different component names (button, chip, badge)", () => {
    const variant = ref("success");

    const buttonStyle = useVariant(variant, "button", {
      "--dx-button-bg": "bg",
    });

    const chipStyle = useVariant(variant, "chip", {
      "--dx-chip-bg": "bg",
    });

    const badgeStyle = useVariant(variant, "badge", {
      "--dx-badge-bg": "bg",
    });

    expect(buttonStyle.value).toEqual({
      "--dx-button-bg": "var(--dx-variant-button-success-bg, var(--dx-variant-success-bg))",
    });

    expect(chipStyle.value).toEqual({
      "--dx-chip-bg": "var(--dx-variant-chip-success-bg, var(--dx-variant-success-bg))",
    });

    expect(badgeStyle.value).toEqual({
      "--dx-badge-bg": "var(--dx-variant-badge-success-bg, var(--dx-variant-success-bg))",
    });
  });

  it("accepts computed variant input and remains reactive", async () => {
    const baseVariant = ref("primary");
    const variant = computed(() => baseVariant.value);

    const variantStyle = useVariant(variant, "button", {
      "--dx-button-bg": "bg",
    });

    expect(variantStyle.value).toEqual({
      "--dx-button-bg": "var(--dx-variant-button-primary-bg, var(--dx-variant-primary-bg))",
    });

    baseVariant.value = "warning";
    await nextTick();

    expect(variantStyle.value).toEqual({
      "--dx-button-bg": "var(--dx-variant-button-warning-bg, var(--dx-variant-warning-bg))",
    });
  });

  it("accepts plain string variant and returns computed value", () => {
    const variantStyle = useVariant("danger", "button", {
      "--dx-button-bg": "bg",
    });

    expect(variantStyle.value).toEqual({
      "--dx-button-bg": "var(--dx-variant-button-danger-bg, var(--dx-variant-danger-bg))",
    });
  });

  it("returns consistent results with same variant and tokens", () => {
    const variant = ref("info");
    const tokenMap = {
      "--dx-button-bg": "bg",
      "--dx-button-text": "text",
      "--dx-button-border": "border",
    };

    const style1 = useVariant(variant, "button", tokenMap);
    const style2 = useVariant(variant, "button", tokenMap);

    expect(style1.value).toEqual(style2.value);
  });

  it("handles token map with many tokens", () => {
    const variant = ref("highlight");
    const tokenMap = {
      "--dx-button-bg": "bg",
      "--dx-button-bg-hover": "bg-hover",
      "--dx-button-bg-active": "bg-active",
      "--dx-button-bg-disabled": "bg-disabled",
      "--dx-button-text": "text",
      "--dx-button-text-hover": "text-hover",
      "--dx-button-text-active": "text-active",
      "--dx-button-border": "border",
      "--dx-button-border-hover": "border-hover",
    };

    const variantStyle = useVariant(variant, "button", tokenMap);

    expect(Object.keys(variantStyle.value)).toHaveLength(9);
    expect(variantStyle.value["--dx-button-bg"]).toBe(
      "var(--dx-variant-button-highlight-bg, var(--dx-variant-highlight-bg))"
    );
    expect(variantStyle.value["--dx-button-text-active"]).toBe(
      "var(--dx-variant-button-highlight-text-active, var(--dx-variant-highlight-text-active))"
    );
  });

  it("handles variant with special characters like dashes", () => {
    const variant = ref("brand-accent");
    const variantStyle = useVariant(variant, "button", {
      "--dx-button-bg": "bg",
    });

    expect(variantStyle.value).toEqual({
      "--dx-button-bg":
        "var(--dx-variant-button-brand-accent-bg, var(--dx-variant-brand-accent-bg))",
    });
  });

  it("preserves CSS variable format in output", () => {
    const variant = ref("danger");
    const variantStyle = useVariant(variant, "button", {
      "--dx-button-bg": "bg",
      "--dx-button-text-color": "text-color",
    });

    // Verify the output uses CSS var() syntax correctly
    const styleValue = variantStyle.value["--dx-button-bg"];
    expect(styleValue).toMatch(/^var\(--dx-variant-button-danger-bg/);
    expect(styleValue).toContain("var(--dx-variant-danger-bg)");

    const textColorValue = variantStyle.value["--dx-button-text-color"];
    expect(textColorValue).toMatch(/^var\(--dx-variant-button-danger-text-color/);
  });
});
