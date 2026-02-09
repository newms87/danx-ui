import { describe, it, expect } from "vitest";
import { KeyboardIcon, XmarkIcon } from "../icons";

describe("icons", () => {
  it("exports KeyboardIcon as an SVG string", () => {
    expect(KeyboardIcon).toContain("<svg");
    expect(KeyboardIcon).toContain("</svg>");
    expect(KeyboardIcon).toContain("viewBox");
  });

  it("exports XmarkIcon as an SVG string", () => {
    expect(XmarkIcon).toContain("<svg");
    expect(XmarkIcon).toContain("</svg>");
    expect(XmarkIcon).toContain("viewBox");
  });
});
