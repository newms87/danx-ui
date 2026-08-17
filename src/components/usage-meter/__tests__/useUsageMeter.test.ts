import { describe, expect, it } from "vitest";
import { ref } from "vue";
import type { UsageMeterSegment } from "../types";
import { formatUsageValue, useUsageMeter } from "../useUsageMeter";

const storageSegments: UsageMeterSegment[] = [
  { id: "photos", label: "Photos", value: 40 },
  { id: "video", label: "Video", value: 20, variant: "warning" },
];

describe("formatUsageValue", () => {
  it("returns plain numbers below one thousand", () => {
    expect(formatUsageValue(0)).toBe("0");
    expect(formatUsageValue(999)).toBe("999");
  });

  it("keeps at most one fraction digit for small numbers", () => {
    expect(formatUsageValue(42.5)).toBe("42.5");
    expect(formatUsageValue(42.04)).toBe("42");
  });

  it("abbreviates thousands with a lowercase k", () => {
    expect(formatUsageValue(1000)).toBe("1k");
    expect(formatUsageValue(1234)).toBe("1.2k");
    expect(formatUsageValue(355400)).toBe("355.4k");
  });

  it("abbreviates millions, billions, and trillions", () => {
    expect(formatUsageValue(1_000_000)).toBe("1M");
    expect(formatUsageValue(1_234_567)).toBe("1.2M");
    expect(formatUsageValue(2_500_000_000)).toBe("2.5B");
    expect(formatUsageValue(3_000_000_000_000)).toBe("3T");
  });

  it("keeps the sign for negative values", () => {
    expect(formatUsageValue(-1500)).toBe("-1.5k");
    expect(formatUsageValue(-12)).toBe("-12");
  });

  it("returns 0 for non-finite input", () => {
    expect(formatUsageValue(Number.NaN)).toBe("0");
    expect(formatUsageValue(Number.POSITIVE_INFINITY)).toBe("0");
  });
});

describe("useUsageMeter", () => {
  describe("segment geometry", () => {
    it("sizes segments against the total", () => {
      const { segments } = useUsageMeter({ segments: storageSegments, total: 100 });

      expect(segments.value.map((segment) => segment.width)).toEqual(["40%", "20%"]);
      expect(segments.value.map((segment) => segment.percent)).toEqual([40, 20]);
      expect(segments.value.map((segment) => segment.percentLabel)).toEqual(["40%", "20%"]);
    });

    it("formats each segment value", () => {
      const { segments } = useUsageMeter({
        segments: [{ id: "a", label: "A", value: 355400 }],
        total: 1_000_000,
      });

      expect(segments.value[0]!.formattedValue).toBe("355.4k");
    });

    it("preserves segment identity fields", () => {
      const { segments } = useUsageMeter({ segments: storageSegments, total: 100 });

      expect(segments.value[0]!.id).toBe("photos");
      expect(segments.value[0]!.label).toBe("Photos");
    });

    it("clamps negative, NaN, and infinite values to zero", () => {
      const { segments, summary } = useUsageMeter({
        segments: [
          { id: "neg", label: "Negative", value: -50 },
          { id: "nan", label: "Not a number", value: Number.NaN },
          { id: "inf", label: "Infinite", value: Number.POSITIVE_INFINITY },
          { id: "ok", label: "Valid", value: 25 },
        ],
        total: 100,
      });

      expect(segments.value.map((segment) => segment.value)).toEqual([0, 0, 0, 25]);
      expect(segments.value.map((segment) => segment.width)).toEqual(["0%", "0%", "0%", "25%"]);
      expect(summary.value.used).toBe(25);
    });

    it("returns an empty geometry list for no segments", () => {
      const { segments, remainingWidth } = useUsageMeter({ segments: [], total: 100 });

      expect(segments.value).toEqual([]);
      expect(remainingWidth.value).toBe("100%");
    });
  });

  describe("variant resolution", () => {
    it("falls back to the meter variant when a segment declares none", () => {
      const { segments } = useUsageMeter({
        segments: storageSegments,
        total: 100,
        variant: "info",
      });

      expect(segments.value[0]!.variant).toBe("info");
    });

    it("lets a segment variant win over the meter variant", () => {
      const { segments } = useUsageMeter({
        segments: storageSegments,
        total: 100,
        variant: "info",
      });

      expect(segments.value[1]!.variant).toBe("warning");
    });

    it("resolves to an empty variant when neither is set", () => {
      const { segments } = useUsageMeter({ segments: storageSegments, total: 100 });

      expect(segments.value[0]!.variant).toBe("");
    });
  });

  describe("remaining space", () => {
    it("reports the unused portion of the track", () => {
      const { remainingWidth, summary } = useUsageMeter({ segments: storageSegments, total: 100 });

      expect(remainingWidth.value).toBe("40%");
      expect(summary.value.remaining).toBe(40);
      expect(summary.value.formattedRemaining).toBe("40");
    });

    it("never reports negative remaining space", () => {
      const { remainingWidth, summary } = useUsageMeter({
        segments: [{ id: "a", label: "A", value: 150 }],
        total: 100,
      });

      expect(remainingWidth.value).toBe("0%");
      expect(summary.value.remaining).toBe(0);
    });
  });

  describe("summary", () => {
    it("computes used, total, percent, and readout", () => {
      const { summary } = useUsageMeter({ segments: storageSegments, total: 100 });

      expect(summary.value.used).toBe(60);
      expect(summary.value.total).toBe(100);
      expect(summary.value.percent).toBe(60);
      expect(summary.value.percentLabel).toBe("60%");
      expect(summary.value.formattedUsed).toBe("60");
      expect(summary.value.formattedTotal).toBe("100");
      expect(summary.value.readout).toBe("60 / 100 (60%)");
      expect(summary.value.isOverCapacity).toBe(false);
    });

    it("rounds the percent label for display", () => {
      const { summary } = useUsageMeter({
        segments: [{ id: "a", label: "A", value: 1 }],
        total: 3,
      });

      expect(summary.value.percentLabel).toBe("33%");
    });
  });

  describe("zero and invalid totals", () => {
    it("reports 0% instead of NaN% when the total is zero", () => {
      const { segments, summary, remainingWidth } = useUsageMeter({ segments: [], total: 0 });

      expect(segments.value).toEqual([]);
      expect(remainingWidth.value).toBe("100%");
      expect(summary.value.percent).toBe(0);
      expect(summary.value.readout).toBe("0 / 0 (0%)");
      expect(summary.value.isOverCapacity).toBe(false);
    });

    it("clamps a negative total to zero", () => {
      const { summary } = useUsageMeter({ segments: [], total: -100 });

      expect(summary.value.total).toBe(0);
      expect(summary.value.percent).toBe(0);
    });

    // Nothing to divide by AND nothing consumed — the width has to resolve to
    // 0% rather than dividing by zero into NaN.
    it("gives a zero-value segment no width when the total is also zero", () => {
      const { segments, summary } = useUsageMeter({
        segments: [{ id: "a", label: "A", value: 0 }],
        total: 0,
      });

      expect(segments.value[0]!.width).toBe("0%");
      expect(segments.value[0]!.percent).toBe(0);
      expect(summary.value.readout).toBe("0 / 0 (0%)");
    });

    it("still fills the track when there is usage but no total", () => {
      const { segments, summary } = useUsageMeter({
        segments: [{ id: "a", label: "A", value: 10 }],
        total: 0,
      });

      expect(segments.value[0]!.width).toBe("100%");
      expect(summary.value.percent).toBe(0);
      expect(summary.value.isOverCapacity).toBe(true);
    });
  });

  describe("over capacity", () => {
    it("keeps segments proportional against the consumed amount", () => {
      const { segments, summary } = useUsageMeter({
        segments: [
          { id: "a", label: "A", value: 60 },
          { id: "b", label: "B", value: 20 },
        ],
        total: 40,
      });

      expect(segments.value.map((segment) => segment.width)).toEqual(["75%", "25%"]);
      expect(summary.value.percent).toBe(200);
      expect(summary.value.percentLabel).toBe("200%");
      expect(summary.value.isOverCapacity).toBe(true);
    });
  });

  describe("custom formatter", () => {
    it("formats segment values, readout, and remaining with the override", () => {
      const { segments, summary } = useUsageMeter({
        segments: [{ id: "a", label: "A", value: 2 }],
        total: 8,
        formatValue: (value: number) => `${value} GB`,
      });

      expect(segments.value[0]!.formattedValue).toBe("2 GB");
      expect(summary.value.readout).toBe("2 GB / 8 GB (25%)");
      expect(summary.value.formattedRemaining).toBe("6 GB");
    });

    it("falls back to the default formatter when the override is undefined", () => {
      const { summary } = useUsageMeter({
        segments: [{ id: "a", label: "A", value: 1500 }],
        total: 3000,
        formatValue: undefined,
      });

      expect(summary.value.readout).toBe("1.5k / 3k (50%)");
    });
  });

  describe("reactivity", () => {
    it("recomputes when the reactive sources change", () => {
      const segmentsRef = ref<UsageMeterSegment[]>([{ id: "a", label: "A", value: 10 }]);
      const totalRef = ref(100);
      const { segments, summary } = useUsageMeter({ segments: segmentsRef, total: totalRef });

      expect(segments.value[0]!.width).toBe("10%");

      segmentsRef.value = [{ id: "a", label: "A", value: 30 }];
      totalRef.value = 60;

      expect(segments.value[0]!.width).toBe("50%");
      expect(summary.value.readout).toBe("30 / 60 (50%)");
    });
  });
});
