import { describe, expect, it } from "vitest";
import {
  arrayAvg,
  arrayCount,
  arrayFirst,
  arrayJoin,
  arrayLast,
  arrayMax,
  arrayMin,
  arraySum,
} from "../arrayUtils";

describe("arrayCount", () => {
  it("returns 0 for non-array input", () => {
    expect(arrayCount("hello")).toBe(0);
    expect(arrayCount(null)).toBe(0);
    expect(arrayCount(undefined)).toBe(0);
    expect(arrayCount(42)).toBe(0);
  });

  it("returns 0 for empty array", () => {
    expect(arrayCount([])).toBe(0);
  });

  it("returns length for populated array", () => {
    expect(arrayCount([1, 2, 3])).toBe(3);
  });
});

describe("arraySum", () => {
  it("returns 0 for non-array input", () => {
    expect(arraySum("hello")).toBe(0);
    expect(arraySum(null)).toBe(0);
  });

  it("sums flat numbers", () => {
    expect(arraySum([1, 2, 3])).toBe(6);
  });

  it("sums using fieldPath", () => {
    expect(arraySum([{ val: 10 }, { val: 20 }], "val")).toBe(30);
  });

  it("sums using nested dot-path", () => {
    expect(arraySum([{ a: { b: 5 } }, { a: { b: 15 } }], "a.b")).toBe(20);
  });

  it("treats NaN values as 0", () => {
    expect(arraySum([1, "abc", 3])).toBe(4);
  });
});

describe("arrayAvg", () => {
  it("returns 0 for non-array input", () => {
    expect(arrayAvg("hello")).toBe(0);
  });

  it("returns 0 for empty array", () => {
    expect(arrayAvg([])).toBe(0);
  });

  it("averages flat numbers", () => {
    expect(arrayAvg([10, 20, 30])).toBe(20);
  });

  it("averages using fieldPath", () => {
    expect(arrayAvg([{ val: 10 }, { val: 30 }], "val")).toBe(20);
  });
});

describe("arrayMin", () => {
  it("returns Infinity for non-array input", () => {
    expect(arrayMin("hello")).toBe(Infinity);
  });

  it("returns Infinity for empty array", () => {
    expect(arrayMin([])).toBe(Infinity);
  });

  it("finds minimum of flat numbers", () => {
    expect(arrayMin([3, 1, 2])).toBe(1);
  });

  it("finds minimum using fieldPath", () => {
    expect(arrayMin([{ val: 30 }, { val: 10 }, { val: 20 }], "val")).toBe(10);
  });

  it("returns Infinity when all values are NaN", () => {
    expect(arrayMin(["abc", "def"])).toBe(Infinity);
  });
});

describe("arrayMax", () => {
  it("returns -Infinity for non-array input", () => {
    expect(arrayMax("hello")).toBe(-Infinity);
  });

  it("returns -Infinity for empty array", () => {
    expect(arrayMax([])).toBe(-Infinity);
  });

  it("finds maximum of flat numbers", () => {
    expect(arrayMax([3, 1, 2])).toBe(3);
  });

  it("finds maximum using fieldPath", () => {
    expect(arrayMax([{ val: 30 }, { val: 10 }, { val: 20 }], "val")).toBe(30);
  });

  it("returns -Infinity when all values are NaN", () => {
    expect(arrayMax(["abc", "def"])).toBe(-Infinity);
  });
});

describe("arrayFirst", () => {
  it("returns undefined for non-array input", () => {
    expect(arrayFirst("hello")).toBeUndefined();
  });

  it("returns undefined for empty array", () => {
    expect(arrayFirst([])).toBeUndefined();
  });

  it("returns first element of flat array", () => {
    expect(arrayFirst([10, 20, 30])).toBe(10);
  });

  it("returns field value from first element", () => {
    expect(arrayFirst([{ name: "Alice" }, { name: "Bob" }], "name")).toBe("Alice");
  });

  it("returns nested value from first element", () => {
    expect(arrayFirst([{ a: { b: "deep" } }], "a.b")).toBe("deep");
  });

  it("returns undefined for missing nested path", () => {
    expect(arrayFirst([{ a: 1 }], "x.y.z")).toBeUndefined();
  });
});

describe("arrayLast", () => {
  it("returns undefined for non-array input", () => {
    expect(arrayLast("hello")).toBeUndefined();
  });

  it("returns undefined for empty array", () => {
    expect(arrayLast([])).toBeUndefined();
  });

  it("returns last element of flat array", () => {
    expect(arrayLast([10, 20, 30])).toBe(30);
  });

  it("returns field value from last element", () => {
    expect(arrayLast([{ name: "Alice" }, { name: "Bob" }], "name")).toBe("Bob");
  });

  it("returns nested value from last element", () => {
    expect(arrayLast([{ a: { b: "deep" } }], "a.b")).toBe("deep");
  });
});

describe("arrayJoin", () => {
  it("returns empty string for non-array input", () => {
    expect(arrayJoin("hello")).toBe("");
    expect(arrayJoin(null)).toBe("");
  });

  it("joins with default separator", () => {
    expect(arrayJoin(["a", "b", "c"])).toBe("a, b, c");
  });

  it("joins with custom separator", () => {
    expect(arrayJoin(["a", "b", "c"], " | ")).toBe("a | b | c");
  });
});

describe("getNestedValue (indirect)", () => {
  it("returns null/undefined obj as-is via arrayFirst", () => {
    expect(arrayFirst([null], "name")).toBeNull();
    expect(arrayFirst([undefined], "name")).toBeUndefined();
  });

  it("returns item itself when path is empty via arrayFirst", () => {
    expect(arrayFirst([{ name: "test" }])).toEqual({ name: "test" });
  });
});
