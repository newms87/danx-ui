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

describe("nested-array traversal", () => {
  const provider = [{ bill: [{ amount: 100 }, { amount: 50 }] }, { bill: [{ amount: 25 }] }];

  it("arraySum traverses nested arrays at every path boundary", () => {
    expect(arraySum(provider, "bill.amount")).toBe(175);
  });

  it("arrayAvg averages all leaves across nested arrays", () => {
    expect(arrayAvg(provider, "bill.amount")).toBeCloseTo(58.3333333, 4);
  });

  it("arrayMin finds minimum across nested arrays", () => {
    expect(arrayMin(provider, "bill.amount")).toBe(25);
  });

  it("arrayMax finds maximum across nested arrays", () => {
    expect(arrayMax(provider, "bill.amount")).toBe(100);
  });

  it("arrayFirst returns first leaf across nested arrays", () => {
    expect(arrayFirst(provider, "bill.amount")).toBe(100);
  });

  it("arrayLast returns last leaf across nested arrays", () => {
    expect(arrayLast(provider, "bill.amount")).toBe(25);
  });

  it("arraySum handles empty inner arrays", () => {
    const data = [{ bill: [] }, { bill: [{ amount: 10 }] }];
    expect(arraySum(data, "bill.amount")).toBe(10);
  });

  it("arrayAvg handles empty inner arrays without including them in count", () => {
    const data = [{ bill: [] }, { bill: [{ amount: 10 }, { amount: 20 }] }];
    expect(arrayAvg(data, "bill.amount")).toBe(15);
  });

  it("arrayMin returns Infinity when all inner arrays are empty", () => {
    const data = [{ bill: [] }, { bill: [] }];
    expect(arrayMin(data, "bill.amount")).toBe(Infinity);
  });

  it("arrayMax returns -Infinity when all inner arrays are empty", () => {
    const data = [{ bill: [] }, { bill: [] }];
    expect(arrayMax(data, "bill.amount")).toBe(-Infinity);
  });

  it("arrayFirst returns undefined when inner arrays are empty", () => {
    const data = [{ bill: [] }, { bill: [] }];
    expect(arrayFirst(data, "bill.amount")).toBeUndefined();
  });

  it("arrayLast returns undefined when inner arrays are empty", () => {
    const data = [{ bill: [] }, { bill: [] }];
    expect(arrayLast(data, "bill.amount")).toBeUndefined();
  });

  it("arraySum skips entries with missing intermediate field", () => {
    const data = [{ bill: [{ amount: 10 }] }, { other: "x" }, { bill: [{ amount: 5 }] }];
    expect(arraySum(data, "bill.amount")).toBe(15);
  });

  it("arrayAvg skips entries with missing intermediate field in the count", () => {
    const data = [{ bill: [{ amount: 10 }] }, { other: "x" }, { bill: [{ amount: 20 }] }];
    expect(arrayAvg(data, "bill.amount")).toBe(15);
  });

  it("arrayFirst skips null leaves and returns first non-null", () => {
    const data = [{ bill: [{ amount: null }, { amount: 42 }] }, { bill: [{ amount: 99 }] }];
    expect(arrayFirst(data, "bill.amount")).toBe(42);
  });

  it("arrayLast skips null leaves and returns last non-null", () => {
    const data = [{ bill: [{ amount: 42 }] }, { bill: [{ amount: 99 }, { amount: null }] }];
    expect(arrayLast(data, "bill.amount")).toBe(99);
  });

  it("arraySum filters non-numeric leaves in mixed-type results", () => {
    const data = [
      { bill: [{ amount: 10 }, { amount: "abc" }] },
      { bill: [{ amount: 5 }, { amount: null }] },
    ];
    expect(arraySum(data, "bill.amount")).toBe(15);
  });

  it("arrayAvg averages only non-NaN leaves in mixed-type results", () => {
    const data = [{ bill: [{ amount: 10 }, { amount: "abc" }] }, { bill: [{ amount: 20 }] }];
    expect(arrayAvg(data, "bill.amount")).toBe(15);
  });

  it("arrayMin filters non-numeric leaves in mixed-type results", () => {
    const data = [{ bill: [{ amount: 10 }, { amount: "abc" }] }, { bill: [{ amount: 5 }] }];
    expect(arrayMin(data, "bill.amount")).toBe(5);
  });

  it("arrayMax filters non-numeric leaves in mixed-type results", () => {
    const data = [{ bill: [{ amount: 10 }, { amount: "abc" }] }, { bill: [{ amount: 50 }] }];
    expect(arrayMax(data, "bill.amount")).toBe(50);
  });
});

describe("arrayFirst null/undefined handling", () => {
  it("skips null/undefined array entries when walking a fieldPath", () => {
    expect(arrayFirst([null], "name")).toBeUndefined();
    expect(arrayFirst([undefined], "name")).toBeUndefined();
  });

  it("returns item itself when path is empty", () => {
    expect(arrayFirst([{ name: "test" }])).toEqual({ name: "test" });
  });
});
