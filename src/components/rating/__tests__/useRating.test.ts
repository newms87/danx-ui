import { describe, it, expect } from "vitest";
import { useRating } from "../useRating";

describe("useRating", () => {
  describe("step", () => {
    it("is 1 when allowHalf is false", () => {
      const rating = useRating({ max: 5, allowHalf: false });
      expect(rating.step.value).toBe(1);
    });

    it("is 0.5 when allowHalf is true", () => {
      const rating = useRating({ max: 5, allowHalf: true });
      expect(rating.step.value).toBe(0.5);
    });
  });

  describe("clamp", () => {
    it("clamps below 0 to 0", () => {
      const rating = useRating({ max: 5, allowHalf: false });
      expect(rating.clamp(-3)).toBe(0);
    });

    it("clamps above max to max", () => {
      const rating = useRating({ max: 5, allowHalf: false });
      expect(rating.clamp(9)).toBe(5);
    });

    it("passes through in-range values unchanged", () => {
      const rating = useRating({ max: 5, allowHalf: false });
      expect(rating.clamp(3)).toBe(3);
    });
  });

  describe("roundToStep", () => {
    it("rounds to the nearest whole number when allowHalf is false", () => {
      const rating = useRating({ max: 5, allowHalf: false });
      expect(rating.roundToStep(2.3)).toBe(2);
      expect(rating.roundToStep(2.7)).toBe(3);
    });

    it("rounds to the nearest half when allowHalf is true", () => {
      const rating = useRating({ max: 5, allowHalf: true });
      expect(rating.roundToStep(2.2)).toBe(2);
      expect(rating.roundToStep(2.3)).toBe(2.5);
      expect(rating.roundToStep(2.6)).toBe(2.5);
      expect(rating.roundToStep(2.8)).toBe(3);
    });

    it("clamps the rounded result to [0, max]", () => {
      const rating = useRating({ max: 5, allowHalf: false });
      expect(rating.roundToStep(100)).toBe(5);
      expect(rating.roundToStep(-100)).toBe(0);
    });
  });

  describe("valueAtStarPosition", () => {
    it("always returns the whole star index when allowHalf is false", () => {
      const rating = useRating({ max: 5, allowHalf: false });
      expect(rating.valueAtStarPosition(3, 0.1)).toBe(3);
      expect(rating.valueAtStarPosition(3, 0.9)).toBe(3);
    });

    it("returns starIndex - 0.5 for the left half when allowHalf is true", () => {
      const rating = useRating({ max: 5, allowHalf: true });
      expect(rating.valueAtStarPosition(3, 0.0)).toBe(2.5);
      expect(rating.valueAtStarPosition(3, 0.49)).toBe(2.5);
    });

    it("returns starIndex for the right half when allowHalf is true", () => {
      const rating = useRating({ max: 5, allowHalf: true });
      expect(rating.valueAtStarPosition(3, 0.5)).toBe(3);
      expect(rating.valueAtStarPosition(3, 1.0)).toBe(3);
    });

    it("clamps out-of-range fractions to [0, 1] before deciding the half", () => {
      const rating = useRating({ max: 5, allowHalf: true });
      expect(rating.valueAtStarPosition(3, -1)).toBe(2.5);
      expect(rating.valueAtStarPosition(3, 5)).toBe(3);
    });

    it("clamps the result to max at the last star", () => {
      const rating = useRating({ max: 5, allowHalf: false });
      expect(rating.valueAtStarPosition(5, 0.9)).toBe(5);
    });
  });

  describe("fillPercent", () => {
    const rating = useRating({ max: 5, allowHalf: true });

    it("is 100 for a star fully below the value", () => {
      expect(rating.fillPercent(3, 1)).toBe(100);
      expect(rating.fillPercent(3, 2)).toBe(100);
      expect(rating.fillPercent(3, 3)).toBe(100);
    });

    it("is 0 for a star fully above the value", () => {
      expect(rating.fillPercent(3, 4)).toBe(0);
      expect(rating.fillPercent(0, 1)).toBe(0);
    });

    it("is 50 for a half-filled star", () => {
      expect(rating.fillPercent(2.5, 3)).toBe(50);
    });

    it("is proportional for a fractional value within the star's slot", () => {
      expect(rating.fillPercent(2.25, 3)).toBe(25);
      expect(rating.fillPercent(2.75, 3)).toBe(75);
    });
  });
});
