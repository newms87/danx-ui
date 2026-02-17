import { describe, it, expect } from "vitest";
import { useAnnotationTooltip } from "../useAnnotationTooltip";

/**
 * Helper to create an element tree simulating annotated code inside a .code-content container.
 */
function createAnnotationElement(
  msg: string,
  type: "error" | "warning" | "info" = "error"
): { container: HTMLElement; annotation: HTMLElement; child: HTMLElement } {
  const container = document.createElement("div");
  container.classList.add("code-content");

  const annotation = document.createElement("span");
  annotation.className = `dx-annotation dx-annotation--${type}`;
  annotation.dataset.annotationMsg = msg;

  const child = document.createElement("span");
  child.textContent = "inner text";
  annotation.appendChild(child);

  container.appendChild(annotation);
  document.body.appendChild(container);

  // Mock getBoundingClientRect since jsdom doesn't compute layout
  annotation.getBoundingClientRect = () => ({
    top: 100,
    bottom: 120,
    left: 50,
    right: 200,
    width: 150,
    height: 20,
    x: 50,
    y: 100,
    toJSON: () => ({}),
  });
  container.getBoundingClientRect = () => ({
    top: 0,
    bottom: 500,
    left: 0,
    right: 400,
    width: 400,
    height: 500,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });

  return { container, annotation, child };
}

function createMouseEvent(
  type: string,
  target: EventTarget,
  relatedTarget: EventTarget | null = null
): MouseEvent {
  const event = new MouseEvent(type, { bubbles: true, relatedTarget });
  Object.defineProperty(event, "target", { value: target });
  return event;
}

describe("useAnnotationTooltip", () => {
  it("starts with tooltip not visible and empty message", () => {
    const tooltip = useAnnotationTooltip();
    expect(tooltip.tooltipVisible.value).toBe(false);
    expect(tooltip.tooltipMessage.value).toBe("");
    expect(tooltip.tooltipType.value).toBe("error");
  });

  it("shows tooltip when hovering over element with data-annotation-msg", () => {
    const tooltip = useAnnotationTooltip();
    const { annotation, container } = createAnnotationElement("Field required");

    const event = createMouseEvent("mouseover", annotation);
    tooltip.onCodeMouseOver(event);

    expect(tooltip.tooltipVisible.value).toBe(true);
    expect(tooltip.tooltipMessage.value).toBe("Field required");
    expect(tooltip.tooltipType.value).toBe("error");
    // Verify positioning math (annotation rect: top=100, bottom=120, left=50; container rect: top=0, left=0)
    expect(tooltip.tooltipStyle.value.position).toBe("absolute");
    expect(tooltip.tooltipStyle.value.left).toBe("66px"); // 50 - 0 + 16
    expect(tooltip.tooltipStyle.value.top).toBe("124px"); // 120 - 0 + 4

    container.remove();
  });

  it("shows tooltip when hovering over child of annotation element", () => {
    const tooltip = useAnnotationTooltip();
    const { child, container } = createAnnotationElement("Nested hover");

    const event = createMouseEvent("mouseover", child);
    tooltip.onCodeMouseOver(event);

    expect(tooltip.tooltipVisible.value).toBe(true);
    expect(tooltip.tooltipMessage.value).toBe("Nested hover");

    container.remove();
  });

  it("ignores elements without annotation data", () => {
    const tooltip = useAnnotationTooltip();
    const plain = document.createElement("span");
    plain.textContent = "no annotation";
    document.body.appendChild(plain);

    const event = createMouseEvent("mouseover", plain);
    tooltip.onCodeMouseOver(event);

    expect(tooltip.tooltipVisible.value).toBe(false);

    plain.remove();
  });

  it("hides tooltip when leaving annotation area", () => {
    const tooltip = useAnnotationTooltip();
    const { annotation, container } = createAnnotationElement("msg");

    // Show it
    tooltip.onCodeMouseOver(createMouseEvent("mouseover", annotation));
    expect(tooltip.tooltipVisible.value).toBe(true);

    // Leave to a non-annotation element
    const outside = document.createElement("div");
    document.body.appendChild(outside);
    const leaveEvent = createMouseEvent("mouseout", annotation, outside);
    tooltip.onCodeMouseOut(leaveEvent);

    expect(tooltip.tooltipVisible.value).toBe(false);

    container.remove();
    outside.remove();
  });

  it("keeps tooltip visible when moving to another annotation element", () => {
    const tooltip = useAnnotationTooltip();
    const els1 = createAnnotationElement("msg1");
    const els2 = createAnnotationElement("msg2");

    // Show on first
    tooltip.onCodeMouseOver(createMouseEvent("mouseover", els1.annotation));
    expect(tooltip.tooltipVisible.value).toBe(true);

    // Move to second annotation
    const leaveEvent = createMouseEvent("mouseout", els1.annotation, els2.annotation);
    tooltip.onCodeMouseOut(leaveEvent);

    expect(tooltip.tooltipVisible.value).toBe(true);

    els1.container.remove();
    els2.container.remove();
  });

  it("extracts warning type from class list", () => {
    const tooltip = useAnnotationTooltip();
    const { annotation, container } = createAnnotationElement("warn msg", "warning");

    tooltip.onCodeMouseOver(createMouseEvent("mouseover", annotation));
    expect(tooltip.tooltipType.value).toBe("warning");

    container.remove();
  });

  it("extracts info type from class list", () => {
    const tooltip = useAnnotationTooltip();
    const { annotation, container } = createAnnotationElement("info msg", "info");

    tooltip.onCodeMouseOver(createMouseEvent("mouseover", annotation));
    expect(tooltip.tooltipType.value).toBe("info");

    container.remove();
  });

  it("stops walking up DOM at code-content boundary", () => {
    const tooltip = useAnnotationTooltip();

    // Create a code-content container with a non-annotation child
    const container = document.createElement("div");
    container.classList.add("code-content");
    const child = document.createElement("span");
    child.textContent = "plain text";
    container.appendChild(child);
    document.body.appendChild(container);

    const event = createMouseEvent("mouseover", child);
    tooltip.onCodeMouseOver(event);

    // Should not show tooltip — walked up to code-content without finding annotation
    expect(tooltip.tooltipVisible.value).toBe(false);

    container.remove();
  });

  it("ignores annotation element with empty message", () => {
    const tooltip = useAnnotationTooltip();

    const container = document.createElement("div");
    container.classList.add("code-content");
    const annotation = document.createElement("span");
    annotation.className = "dx-annotation dx-annotation--error";
    annotation.dataset.annotationMsg = "";
    container.appendChild(annotation);
    document.body.appendChild(container);

    const event = createMouseEvent("mouseover", annotation);
    tooltip.onCodeMouseOver(event);

    // Should not show tooltip because message is empty
    expect(tooltip.tooltipVisible.value).toBe(false);

    container.remove();
  });

  it("hides tooltip when relatedTarget is null (mouse leaves window)", () => {
    const tooltip = useAnnotationTooltip();
    const { annotation, container } = createAnnotationElement("msg");

    tooltip.onCodeMouseOver(createMouseEvent("mouseover", annotation));
    expect(tooltip.tooltipVisible.value).toBe(true);

    const leaveEvent = createMouseEvent("mouseout", annotation, null);
    tooltip.onCodeMouseOut(leaveEvent);

    expect(tooltip.tooltipVisible.value).toBe(false);

    container.remove();
  });
});
