import { describe, it, expect } from "vitest";
import { keyboardIcon, pencilIcon, searchIcon, saveIcon, trashIcon, buttonIcons } from "../icons";

describe("icons", () => {
  it("exports keyboardIcon as an SVG string", () => {
    expect(keyboardIcon).toContain("<svg");
    expect(keyboardIcon).toContain("</svg>");
    expect(keyboardIcon).toContain("viewBox");
  });

  it("exports pencilIcon as an SVG string", () => {
    expect(pencilIcon).toContain("<svg");
    expect(pencilIcon).toContain("</svg>");
  });

  it("exports searchIcon as an SVG string", () => {
    expect(searchIcon).toContain("<svg");
    expect(searchIcon).toContain("</svg>");
  });

  it("exports all named icons as SVG strings", () => {
    for (const [name, svg] of Object.entries(buttonIcons)) {
      expect(svg, `icon "${name}" should be an SVG string`).toContain("<svg");
    }
  });

  it("provides individual icon exports matching registry entries", () => {
    expect(saveIcon).toBe(buttonIcons.save);
    expect(trashIcon).toBe(buttonIcons.trash);
    expect(pencilIcon).toBe(buttonIcons.pencil);
    expect(keyboardIcon).toBe(buttonIcons.keyboard);
    expect(searchIcon).toBe(buttonIcons.search);
  });
});
