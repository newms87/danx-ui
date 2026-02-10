import { describe, it, expect, beforeEach, vi } from "vitest";
import { calculateContextMenuPosition } from "../useContextMenuPosition";

describe("calculateContextMenuPosition", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      innerWidth: 1024,
      innerHeight: 768,
    });
  });

  it("places menu at given coordinates when space is available", () => {
    const result = calculateContextMenuPosition(200, 300, 320, 400);
    expect(result.top).toBe("300px");
    expect(result.left).toBe("200px");
  });

  it("flips above anchor when overflowing bottom", () => {
    // y=600 + height=400 > 768 - 10 → flip
    const result = calculateContextMenuPosition(200, 600, 320, 400);
    expect(result.top).toBe("200px"); // max(10, 600-400)
  });

  it("clamps top to edge padding when flipping would go negative", () => {
    // y=50 + height=400 > 758 → flip, but 50-400=-350, so clamp to 10
    const result = calculateContextMenuPosition(200, 50, 320, 800);
    expect(result.top).toBe("10px");
  });

  it("clamps left edge", () => {
    const result = calculateContextMenuPosition(-20, 300, 320, 400);
    expect(result.left).toBe("10px");
  });

  it("clamps right edge", () => {
    // x=900 + width=320 > 1024 - 10 → clamp
    const result = calculateContextMenuPosition(900, 300, 320, 400);
    expect(result.left).toBe("694px"); // 1024 - 320 - 10
  });

  it("reports nearRightEdge when submenu would not fit", () => {
    // left=694 + 320 + 320 > 1014 → near right edge
    const result = calculateContextMenuPosition(900, 300, 320, 400);
    expect(result.nearRightEdge).toBe(true);
  });

  it("reports not nearRightEdge when submenu fits", () => {
    const result = calculateContextMenuPosition(100, 300, 200, 400);
    expect(result.nearRightEdge).toBe(false);
  });
});
