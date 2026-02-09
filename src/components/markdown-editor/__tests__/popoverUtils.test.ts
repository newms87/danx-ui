import { describe, it, expect, beforeEach, vi } from "vitest";
import { calculatePopoverPosition } from "../popoverUtils";

describe("calculatePopoverPosition", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      innerWidth: 1024,
      innerHeight: 768,
    });
  });

  it("positions centered below anchor when centerOnAnchor is true", () => {
    const result = calculatePopoverPosition({
      anchorX: 500,
      anchorY: 300,
      popoverWidth: 320,
      popoverHeight: 200,
      centerOnAnchor: true,
    });

    expect(result.top).toBe("310px"); // 300 + 10 padding
    expect(result.left).toBe("340px"); // 500 - 320/2
    expect(result.nearRightEdge).toBe(false);
  });

  it("positions directly at anchor when centerOnAnchor is false", () => {
    const result = calculatePopoverPosition({
      anchorX: 500,
      anchorY: 300,
      popoverWidth: 320,
      popoverHeight: 400,
    });

    expect(result.top).toBe("300px");
    expect(result.left).toBe("500px");
  });

  it("flips above anchor when overflowing bottom (centered mode)", () => {
    const result = calculatePopoverPosition({
      anchorX: 500,
      anchorY: 600,
      popoverWidth: 320,
      popoverHeight: 200,
      centerOnAnchor: true,
    });

    // 600 + 10 + 200 = 810 > 768 - 10 = 758, so flip above
    expect(result.top).toBe("390px"); // 600 - 200 - 10
  });

  it("flips above anchor when overflowing bottom (non-centered mode)", () => {
    const result = calculatePopoverPosition({
      anchorX: 100,
      anchorY: 600,
      popoverWidth: 320,
      popoverHeight: 400,
    });

    // 600 + 400 = 1000 > 758, so flip: Math.max(10, 600 - 400) = 200
    expect(result.top).toBe("200px");
  });

  it("clamps non-centered flip to minimum padding", () => {
    const result = calculatePopoverPosition({
      anchorX: 100,
      anchorY: 600,
      popoverWidth: 320,
      popoverHeight: 700,
    });

    // 600 + 700 > 758, flip: Math.max(10, 600 - 700) = Math.max(10, -100) = 10
    expect(result.top).toBe("10px");
  });

  it("clamps to left edge", () => {
    const result = calculatePopoverPosition({
      anchorX: 100,
      anchorY: 300,
      popoverWidth: 320,
      popoverHeight: 200,
      centerOnAnchor: true,
    });

    // left = 100 - 160 = -60 < 10, so clamp to 10
    expect(result.left).toBe("10px");
  });

  it("clamps to right edge", () => {
    const result = calculatePopoverPosition({
      anchorX: 900,
      anchorY: 300,
      popoverWidth: 320,
      popoverHeight: 200,
      centerOnAnchor: true,
    });

    // left = 900 - 160 = 740; 740 + 320 = 1060 > 1014, so clamp
    expect(result.left).toBe("694px"); // 1024 - 320 - 10
  });

  it("reports nearRightEdge when menu + submenu would overflow", () => {
    const result = calculatePopoverPosition({
      anchorX: 500,
      anchorY: 300,
      popoverWidth: 320,
      popoverHeight: 400,
    });

    // left=500; 500 + 320 + 320 = 1140 > 1014 → nearRightEdge
    expect(result.nearRightEdge).toBe(true);
  });

  it("reports nearRightEdge false when there is room for submenu", () => {
    const result = calculatePopoverPosition({
      anchorX: 100,
      anchorY: 300,
      popoverWidth: 200,
      popoverHeight: 400,
    });

    // left=100; 100 + 200 + 200 = 500 < 1014
    expect(result.nearRightEdge).toBe(false);
  });

  it("uses custom padding value", () => {
    const result = calculatePopoverPosition({
      anchorX: 500,
      anchorY: 300,
      popoverWidth: 320,
      popoverHeight: 200,
      padding: 20,
      centerOnAnchor: true,
    });

    expect(result.top).toBe("320px"); // 300 + 20
    expect(result.left).toBe("340px"); // 500 - 160
  });

  it("clamps to left edge with custom padding", () => {
    const result = calculatePopoverPosition({
      anchorX: 5,
      anchorY: 300,
      popoverWidth: 320,
      popoverHeight: 200,
      padding: 20,
    });

    // left = 5 < 20, clamp
    expect(result.left).toBe("20px");
  });

  it("clamps to right edge with custom padding", () => {
    const result = calculatePopoverPosition({
      anchorX: 900,
      anchorY: 300,
      popoverWidth: 320,
      popoverHeight: 200,
      padding: 20,
    });

    // left=900; 900+320=1220 > 1004, clamp to 1024-320-20=684
    expect(result.left).toBe("684px");
  });
});
