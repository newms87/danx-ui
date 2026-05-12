import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useRangeSlider } from "../useRangeSlider";
import type { RangeSliderModel } from "../types";

function makeApi(
  initial: RangeSliderModel,
  opts: { min?: number; max?: number; step?: number } = {}
) {
  const model = ref<RangeSliderModel>(initial);
  const api = useRangeSlider(model, {
    min: opts.min ?? 0,
    max: opts.max ?? 100,
    step: opts.step ?? 1,
  });
  return { model, api };
}

describe("useRangeSlider", () => {
  describe("mode detection (isDual)", () => {
    it("is false when initial model is a number", () => {
      const { api } = makeApi(42);
      expect(api.isDual.value).toBe(false);
    });

    it("is true when initial model is a [number, number] tuple", () => {
      const { api } = makeApi([10, 90]);
      expect(api.isDual.value).toBe(true);
    });

    it("flips when the model shape changes at runtime", () => {
      const { model, api } = makeApi(42);
      expect(api.isDual.value).toBe(false);
      model.value = [10, 90];
      expect(api.isDual.value).toBe(true);
    });
  });

  describe("clamp", () => {
    it("clamps below min to the min boundary", () => {
      const { api } = makeApi(0, { min: 0, max: 100 });
      expect(api.clamp(-5)).toBe(0);
    });

    it("clamps above max to the max boundary", () => {
      const { api } = makeApi(0, { min: 0, max: 100 });
      expect(api.clamp(150)).toBe(100);
    });

    it("passes in-range values through", () => {
      const { api } = makeApi(0, { min: 0, max: 100 });
      expect(api.clamp(42)).toBe(42);
    });

    it("respects non-zero min boundaries", () => {
      const { api } = makeApi(540, { min: 0, max: 1440, step: 15 });
      expect(api.clamp(-1)).toBe(0);
      expect(api.clamp(1441)).toBe(1440);
      expect(api.clamp(540)).toBe(540);
    });
  });

  describe("roundToStep", () => {
    it("rounds to the nearest min + n*step value", () => {
      const { api } = makeApi(0, { min: 0, max: 100, step: 5 });
      expect(api.roundToStep(7)).toBe(5);
      expect(api.roundToStep(12)).toBe(10);
      expect(api.roundToStep(2.49)).toBe(0);
      expect(api.roundToStep(2.5)).toBe(5);
    });

    it("rounds within bounds (does not produce values outside [min, max])", () => {
      const { api } = makeApi(0, { min: 0, max: 100, step: 5 });
      expect(api.roundToStep(98)).toBe(100);
      expect(api.roundToStep(-1)).toBe(0);
    });

    it("clamps when math rounds below min (raw rounds to -5, clamps to 0)", () => {
      const { api } = makeApi(0, { min: 0, max: 100, step: 5 });
      // (-3 - 0) / 5 = -0.6 → Math.round = -1 → stepped = -5 → guard clamps to 0
      expect(api.roundToStep(-3)).toBe(0);
    });

    it("clamps when math rounds above max (raw rounds to 105, clamps to 100)", () => {
      const { api } = makeApi(0, { min: 0, max: 100, step: 5 });
      // (103 - 0) / 5 = 20.6 → Math.round = 21 → stepped = 105 → guard clamps to 100
      expect(api.roundToStep(103)).toBe(100);
    });

    it("handles non-zero min anchoring (HH:MM 15-min step)", () => {
      const { api } = makeApi(0, { min: 0, max: 1440, step: 15 });
      expect(api.roundToStep(7)).toBe(0);
      expect(api.roundToStep(8)).toBe(15);
      expect(api.roundToStep(540)).toBe(540); // 9:00
      expect(api.roundToStep(547)).toBe(540); // round down to 9:00
      expect(api.roundToStep(548)).toBe(555); // round up to 9:15
    });

    it("falls back to clamp when step is 0 (degenerate)", () => {
      const { api } = makeApi(0, { min: 0, max: 100, step: 0 });
      expect(api.roundToStep(7.3)).toBe(7.3);
      expect(api.roundToStep(-5)).toBe(0);
      expect(api.roundToStep(150)).toBe(100);
    });
  });

  describe("valueAtPercent", () => {
    it("returns min at 0%", () => {
      const { api } = makeApi(0, { min: 0, max: 100, step: 1 });
      expect(api.valueAtPercent(0)).toBe(0);
    });

    it("returns max at 100%", () => {
      const { api } = makeApi(0, { min: 0, max: 100, step: 1 });
      expect(api.valueAtPercent(100)).toBe(100);
    });

    it("returns mid at 50%", () => {
      const { api } = makeApi(0, { min: 0, max: 100, step: 1 });
      expect(api.valueAtPercent(50)).toBe(50);
    });

    it("clamps percent below 0", () => {
      const { api } = makeApi(0, { min: 0, max: 100, step: 1 });
      expect(api.valueAtPercent(-25)).toBe(0);
    });

    it("clamps percent above 100", () => {
      const { api } = makeApi(0, { min: 0, max: 100, step: 1 });
      expect(api.valueAtPercent(125)).toBe(100);
    });

    it("rounds to step", () => {
      const { api } = makeApi(0, { min: 0, max: 100, step: 25 });
      expect(api.valueAtPercent(40)).toBe(50); // 40% of 100 = 40 → round to 50
      expect(api.valueAtPercent(10)).toBe(0); // 10% of 100 = 10 → round to 0
    });

    it("respects non-zero min anchoring (HH:MM)", () => {
      const { api } = makeApi(0, { min: 0, max: 1440, step: 15 });
      // 540 / 1440 ≈ 37.5%
      expect(api.valueAtPercent(37.5)).toBe(540); // 9:00 AM
    });
  });

  describe("singleValue / setSingle (single mode)", () => {
    it("singleValue mirrors a numeric model", () => {
      const { api } = makeApi(42);
      expect(api.singleValue.value).toBe(42);
    });

    it("setSingle clamps + rounds + writes back to the model", () => {
      const { model, api } = makeApi(0, { min: 0, max: 100, step: 10 });
      api.setSingle(37);
      expect(model.value).toBe(40);
    });

    it("setSingle clamps below min", () => {
      const { model, api } = makeApi(50, { min: 0, max: 100, step: 1 });
      api.setSingle(-10);
      expect(model.value).toBe(0);
    });

    it("setSingle clamps above max", () => {
      const { model, api } = makeApi(50, { min: 0, max: 100, step: 1 });
      api.setSingle(150);
      expect(model.value).toBe(100);
    });

    it("setSingle is a no-op when model is in dual mode", () => {
      const { model, api } = makeApi([10, 90]);
      api.setSingle(50);
      expect(model.value).toEqual([10, 90]);
    });
  });

  describe("minValue / maxValue / setMin / setMax (dual mode)", () => {
    it("minValue + maxValue mirror the tuple", () => {
      const { api } = makeApi([20, 80]);
      expect(api.minValue.value).toBe(20);
      expect(api.maxValue.value).toBe(80);
    });

    it("setMin updates the min handle and preserves max", () => {
      const { model, api } = makeApi([20, 80], { min: 0, max: 100, step: 5 });
      api.setMin(33);
      expect(model.value).toEqual([35, 80]);
    });

    it("setMax updates the max handle and preserves min", () => {
      const { model, api } = makeApi([20, 80], { min: 0, max: 100, step: 5 });
      api.setMax(63);
      expect(model.value).toEqual([20, 65]);
    });

    it("setMin cross-prevention: clamps to maxValue - step when crossing max", () => {
      const { model, api } = makeApi([20, 50], { min: 0, max: 100, step: 5 });
      api.setMin(80);
      // 80 > maxValue (50); clamp to maxValue - step = 45
      expect(model.value).toEqual([45, 50]);
    });

    it("setMax cross-prevention: clamps to minValue + step when crossing min", () => {
      const { model, api } = makeApi([50, 80], { min: 0, max: 100, step: 5 });
      api.setMax(20);
      // 20 < minValue (50); clamp to minValue + step = 55
      expect(model.value).toEqual([50, 55]);
    });

    it("setMin allows touching max exactly (no cross)", () => {
      const { model, api } = makeApi([20, 50], { min: 0, max: 100, step: 5 });
      api.setMin(50);
      // Equal-to-max is touching, not crossing — accept.
      expect(model.value).toEqual([50, 50]);
    });

    it("setMax allows touching min exactly (no cross)", () => {
      const { model, api } = makeApi([50, 80], { min: 0, max: 100, step: 5 });
      api.setMax(50);
      expect(model.value).toEqual([50, 50]);
    });

    it("setMin is a no-op when model is in single mode", () => {
      const { model, api } = makeApi(42);
      api.setMin(10);
      expect(model.value).toBe(42);
    });

    it("setMax is a no-op when model is in single mode", () => {
      const { model, api } = makeApi(42);
      api.setMax(10);
      expect(model.value).toBe(42);
    });

    it("setSingle is a no-op in dual mode (does not collapse the tuple)", () => {
      const { model, api } = makeApi([10, 90]);
      api.setSingle(50);
      expect(model.value).toEqual([10, 90]);
    });
  });

  describe("percent / percentMin / percentMax", () => {
    it("percent in single mode is (value - min) / (max - min) * 100", () => {
      const { api } = makeApi(25, { min: 0, max: 100, step: 1 });
      expect(api.percent.value).toBe(25);
    });

    it("percent respects non-zero min", () => {
      const { api } = makeApi(540, { min: 0, max: 1440, step: 15 });
      expect(api.percent.value).toBeCloseTo(37.5, 5);
    });

    it("percent is 0 when max equals min (degenerate range)", () => {
      const { api } = makeApi(0, { min: 5, max: 5, step: 1 });
      expect(api.percent.value).toBe(0);
    });

    it("percentMin + percentMax track the tuple in dual mode", () => {
      const { api } = makeApi([25, 75], { min: 0, max: 100, step: 1 });
      expect(api.percentMin.value).toBe(25);
      expect(api.percentMax.value).toBe(75);
    });

    it("percentMin + percentMax are 0 when range is degenerate", () => {
      const { api } = makeApi([10, 10], { min: 10, max: 10, step: 1 });
      expect(api.percentMin.value).toBe(0);
      expect(api.percentMax.value).toBe(0);
    });
  });

  describe("reactive option getters", () => {
    it("recomputes when min/max/step are passed as reactive getters and the bounds change", () => {
      const model = ref<RangeSliderModel>(50);
      const currentMax = ref(100);
      const api = useRangeSlider(model, {
        min: 0,
        max: () => currentMax.value,
        step: 1,
      });
      expect(api.percent.value).toBe(50);
      currentMax.value = 200;
      expect(api.percent.value).toBe(25);
    });
  });

  describe("array fallback when minValue / maxValue accessed in single mode", () => {
    it("minValue defaults to the global min when not in dual mode", () => {
      const { api } = makeApi(42, { min: 0, max: 100, step: 1 });
      expect(api.minValue.value).toBe(0);
    });

    it("maxValue defaults to the global max when not in dual mode", () => {
      const { api } = makeApi(42, { min: 0, max: 100, step: 1 });
      expect(api.maxValue.value).toBe(100);
    });

    it("singleValue defaults to global min when not in single mode", () => {
      const { api } = makeApi([10, 90], { min: 0, max: 100, step: 1 });
      expect(api.singleValue.value).toBe(0);
    });
  });
});
