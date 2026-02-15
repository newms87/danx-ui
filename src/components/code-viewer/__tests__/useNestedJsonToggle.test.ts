import { describe, expect, it } from "vitest";
import { useNestedJsonToggle } from "../useNestedJsonToggle";

describe("useNestedJsonToggle", () => {
  it("defaults to expanded (true) for unknown IDs", () => {
    const { isExpanded } = useNestedJsonToggle();
    expect(isExpanded("any-id")).toBe(true);
  });

  it("toggle flips expanded state", () => {
    const { isExpanded, toggle } = useNestedJsonToggle();
    expect(isExpanded("id1")).toBe(true);
    toggle("id1");
    expect(isExpanded("id1")).toBe(false);
    toggle("id1");
    expect(isExpanded("id1")).toBe(true);
  });

  it("toggleVersion increments on each toggle", () => {
    const { toggle, toggleVersion } = useNestedJsonToggle();
    expect(toggleVersion.value).toBe(0);
    toggle("id1");
    expect(toggleVersion.value).toBe(1);
    toggle("id2");
    expect(toggleVersion.value).toBe(2);
  });

  it("reset clears all states and increments toggleVersion", () => {
    const { isExpanded, toggle, reset, toggleVersion } = useNestedJsonToggle();
    toggle("id1"); // id1 = false
    toggle("id2"); // id2 = false
    expect(isExpanded("id1")).toBe(false);
    expect(isExpanded("id2")).toBe(false);

    reset();
    expect(isExpanded("id1")).toBe(true);
    expect(isExpanded("id2")).toBe(true);
    expect(toggleVersion.value).toBe(3); // 2 toggles + 1 reset
  });

  it("handleClick finds data-nested-json-toggle on clicked element", () => {
    const { isExpanded, handleClick } = useNestedJsonToggle();

    const el = document.createElement("span");
    el.setAttribute("data-nested-json-toggle", "test-id");
    document.body.appendChild(el);

    handleClick({ target: el } as unknown as MouseEvent);
    expect(isExpanded("test-id")).toBe(false);

    document.body.removeChild(el);
  });

  it("handleClick finds data-nested-json-toggle on ancestor", () => {
    const { isExpanded, handleClick } = useNestedJsonToggle();

    const parent = document.createElement("span");
    parent.setAttribute("data-nested-json-toggle", "ancestor-id");
    const child = document.createElement("span");
    parent.appendChild(child);
    document.body.appendChild(parent);

    handleClick({ target: child } as unknown as MouseEvent);
    expect(isExpanded("ancestor-id")).toBe(false);

    document.body.removeChild(parent);
  });

  it("handleClick does nothing without toggle attribute", () => {
    const { toggleVersion, handleClick } = useNestedJsonToggle();

    const el = document.createElement("span");
    document.body.appendChild(el);

    handleClick({ target: el } as unknown as MouseEvent);
    expect(toggleVersion.value).toBe(0);

    document.body.removeChild(el);
  });

  it("handleClick does nothing when toggle attribute is empty string", () => {
    const { toggleVersion, handleClick } = useNestedJsonToggle();

    const el = document.createElement("span");
    el.setAttribute("data-nested-json-toggle", "");
    document.body.appendChild(el);

    handleClick({ target: el } as unknown as MouseEvent);
    expect(toggleVersion.value).toBe(0);

    document.body.removeChild(el);
  });

  it("handleClick does nothing with null target", () => {
    const { toggleVersion, handleClick } = useNestedJsonToggle();
    handleClick({ target: null } as unknown as MouseEvent);
    expect(toggleVersion.value).toBe(0);
  });
});
