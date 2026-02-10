import { describe, it, expect } from "vitest";
import { KeyboardIcon } from "../icons";

describe("icons", () => {
  it("exports KeyboardIcon as an SVG string", () => {
    expect(KeyboardIcon).toContain("<svg");
    expect(KeyboardIcon).toContain("</svg>");
    expect(KeyboardIcon).toContain("viewBox");
  });
});
