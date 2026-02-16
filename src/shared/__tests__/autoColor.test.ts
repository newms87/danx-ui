import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ref } from "vue";
import { hashStringToIndex, useAutoColor, AUTO_COLOR_PALETTE } from "../autoColor";

describe("hashStringToIndex", () => {
  it("returns consistent index for same input", () => {
    const a = hashStringToIndex("Pending", 14);
    const b = hashStringToIndex("Pending", 14);
    expect(a).toBe(b);
  });

  it("returns index in range [0, count)", () => {
    for (const str of [
      "Pending",
      "Approved",
      "Rejected",
      "",
      "x",
      "A very long string value here",
    ]) {
      const idx = hashStringToIndex(str, 14);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(14);
    }
  });

  it("returns 0 for empty string", () => {
    // 0 % count = 0
    expect(hashStringToIndex("", 14)).toBe(0);
  });

  it("produces different indices for different strings", () => {
    const strings = [
      "Pending",
      "Approved",
      "Rejected",
      "Draft",
      "Published",
      "Archived",
      "In Review",
    ];
    const indices = strings.map((s) => hashStringToIndex(s, 14));
    const unique = new Set(indices);
    // With 7 strings and 14 buckets, we expect at least 3 distinct values
    expect(unique.size).toBeGreaterThanOrEqual(3);
  });

  it("works with count of 1", () => {
    expect(hashStringToIndex("anything", 1)).toBe(0);
  });
});

describe("AUTO_COLOR_PALETTE", () => {
  it("has 14 entries", () => {
    expect(AUTO_COLOR_PALETTE).toHaveLength(14);
  });

  it("each entry has bg, text, darkBg, darkText", () => {
    for (const entry of AUTO_COLOR_PALETTE) {
      expect(entry.bg).toMatch(/^#[0-9a-f]{6}$/i);
      expect(entry.text).toMatch(/^#[0-9a-f]{6}$/i);
      expect(entry.darkBg).toMatch(/^#[0-9a-f]{6}$/i);
      expect(entry.darkText).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe("useAutoColor", () => {
  beforeEach(() => {
    // Ensure light mode for consistent tests
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("returns style with --dx-chip-bg and --dx-chip-text keys", () => {
    const { style } = useAutoColor("Pending");
    expect(style.value).toHaveProperty("--dx-chip-bg");
    expect(style.value).toHaveProperty("--dx-chip-text");
  });

  it("returns only CSS custom properties (no direct background/color)", () => {
    const { style } = useAutoColor("Pending");
    expect(style.value).not.toHaveProperty("background");
    expect(style.value).not.toHaveProperty("color");
  });

  it("same value always produces same style", () => {
    const a = useAutoColor("Approved");
    const b = useAutoColor("Approved");
    expect(a.style.value).toEqual(b.style.value);
  });

  it("different values produce different styles", () => {
    const a = useAutoColor("Pending");
    const b = useAutoColor("Rejected");
    // These hash to different indices, so styles differ
    expect(a.colorIndex.value).not.toBe(b.colorIndex.value);
    expect(a.style.value).not.toEqual(b.style.value);
  });

  it("colorIndex is in range 0..13", () => {
    for (const label of ["Pending", "Approved", "Rejected", "Draft", ""]) {
      const { colorIndex } = useAutoColor(label);
      expect(colorIndex.value).toBeGreaterThanOrEqual(0);
      expect(colorIndex.value).toBeLessThanOrEqual(13);
    }
  });

  it("uses light-mode colors when dark class is absent", () => {
    const { style, colorIndex } = useAutoColor("Test");
    const entry = AUTO_COLOR_PALETTE[colorIndex.value]!;
    expect(style.value["--dx-chip-bg" as keyof typeof style.value]).toBe(entry.bg);
    expect(style.value["--dx-chip-text" as keyof typeof style.value]).toBe(entry.text);
  });

  it("uses dark-mode colors when dark class is present", () => {
    document.documentElement.classList.add("dark");
    const { style, colorIndex } = useAutoColor("Test");
    const entry = AUTO_COLOR_PALETTE[colorIndex.value]!;
    expect(style.value["--dx-chip-bg" as keyof typeof style.value]).toBe(entry.darkBg);
    expect(style.value["--dx-chip-text" as keyof typeof style.value]).toBe(entry.darkText);
  });

  it("accepts a getter function", () => {
    const { colorIndex, style } = useAutoColor(() => "Pending");
    expect(colorIndex.value).toBe(hashStringToIndex("Pending", AUTO_COLOR_PALETTE.length));
    expect(style.value).toHaveProperty("--dx-chip-bg");
  });

  it("reacts to ref changes", () => {
    const label = ref("Pending");
    const { colorIndex: idxA } = useAutoColor(label);
    const firstIndex = idxA.value;

    label.value = "Rejected";
    // After changing the ref, colorIndex should update
    expect(idxA.value).toBe(hashStringToIndex("Rejected", AUTO_COLOR_PALETTE.length));
    // Ensure it actually changed (these strings hash differently)
    expect(idxA.value).not.toBe(firstIndex);
  });
});
