import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref, nextTick, Ref } from "vue";
import { useDomObserver } from "../useDomObserver";

// Mock Vue lifecycle hooks
vi.mock("vue", async () => {
  const actual = await vi.importActual<typeof import("vue")>("vue");
  return {
    ...actual,
    onUnmounted: vi.fn((cb) => cb),
  };
});

describe("useDomObserver", () => {
  let contentEl: HTMLDivElement;
  let contentRef: ReturnType<typeof ref<HTMLElement | null>>;
  let onNodeAdded: ReturnType<typeof vi.fn>;
  let onNodeRemoved: ReturnType<typeof vi.fn>;
  let onCleanup: ReturnType<typeof vi.fn>;
  let onInitialMount: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    contentEl = document.createElement("div");
    document.body.appendChild(contentEl);
    contentRef = ref<HTMLElement | null>(null);
    onNodeAdded = vi.fn();
    onNodeRemoved = vi.fn();
    onCleanup = vi.fn();
    onInitialMount = vi.fn();
  });

  afterEach(() => {
    contentEl.remove();
  });

  function setup(opts?: { skipInitialMount?: boolean }): void {
    useDomObserver({
      contentRef: contentRef as unknown as Ref<HTMLElement | null>,
      dataAttribute: "data-test-id",
      onNodeAdded: onNodeAdded as unknown as (el: HTMLElement) => void,
      onNodeRemoved: onNodeRemoved as unknown as (el: HTMLElement) => void,
      onCleanup: onCleanup as unknown as () => void,
      onInitialMount: opts?.skipInitialMount
        ? undefined
        : (onInitialMount as unknown as () => void),
    });
  }

  it("calls onInitialMount when contentRef becomes available", async () => {
    setup();
    expect(onInitialMount).not.toHaveBeenCalled();

    contentRef.value = contentEl;
    await nextTick();
    await nextTick();

    expect(onInitialMount).toHaveBeenCalledOnce();
  });

  it("does not call onInitialMount when not provided", async () => {
    setup({ skipInitialMount: true });
    contentRef.value = contentEl;
    await nextTick();
    await nextTick();

    // No error should be thrown
    expect(onInitialMount).not.toHaveBeenCalled();
  });

  it("calls onNodeAdded when a matching element is added", async () => {
    setup();
    contentRef.value = contentEl;
    await nextTick();

    const child = document.createElement("div");
    child.setAttribute("data-test-id", "abc");
    contentEl.appendChild(child);

    // MutationObserver fires async, then nextTick inside handler
    await nextTick();
    await nextTick();
    await nextTick();

    expect(onNodeAdded).toHaveBeenCalledWith(child);
  });

  it("calls onNodeAdded for matching children of an added parent", async () => {
    setup();
    contentRef.value = contentEl;
    await nextTick();

    const parent = document.createElement("div");
    const child = document.createElement("span");
    child.setAttribute("data-test-id", "child1");
    parent.appendChild(child);
    contentEl.appendChild(parent);

    await nextTick();
    await nextTick();
    await nextTick();

    expect(onNodeAdded).toHaveBeenCalledWith(child);
  });

  it("calls onNodeRemoved when a matching element is removed", async () => {
    setup();
    contentRef.value = contentEl;
    await nextTick();

    const child = document.createElement("div");
    child.setAttribute("data-test-id", "abc");
    contentEl.appendChild(child);

    await nextTick();
    await nextTick();

    contentEl.removeChild(child);

    await nextTick();
    await nextTick();

    expect(onNodeRemoved).toHaveBeenCalledWith(child);
  });

  it("calls onNodeRemoved for matching children of a removed parent", async () => {
    setup();
    contentRef.value = contentEl;
    await nextTick();

    const parent = document.createElement("div");
    const child = document.createElement("span");
    child.setAttribute("data-test-id", "nested");
    parent.appendChild(child);
    contentEl.appendChild(parent);

    await nextTick();
    await nextTick();

    contentEl.removeChild(parent);

    await nextTick();
    await nextTick();

    expect(onNodeRemoved).toHaveBeenCalledWith(child);
  });

  it("calls onCleanup when contentRef is set to null", async () => {
    setup();
    contentRef.value = contentEl;
    await nextTick();

    contentRef.value = null;
    await nextTick();

    expect(onCleanup).toHaveBeenCalled();
  });

  it("does not call onNodeAdded for non-matching elements", async () => {
    setup();
    contentRef.value = contentEl;
    await nextTick();

    const child = document.createElement("div");
    child.setAttribute("data-other-attr", "xyz");
    contentEl.appendChild(child);

    await nextTick();
    await nextTick();
    await nextTick();

    expect(onNodeAdded).not.toHaveBeenCalled();
  });

  it("ignores text nodes in mutations", async () => {
    setup();
    contentRef.value = contentEl;
    await nextTick();

    contentEl.appendChild(document.createTextNode("hello"));

    await nextTick();
    await nextTick();

    expect(onNodeAdded).not.toHaveBeenCalled();
  });

  it("calls onNodeRemoved for parent element with attribute AND matching children", async () => {
    setup();
    contentRef.value = contentEl;
    await nextTick();

    // Create parent that has the attribute AND contains a child with the attribute
    const parent = document.createElement("div");
    parent.setAttribute("data-test-id", "parent-id");
    const child = document.createElement("span");
    child.setAttribute("data-test-id", "child-id");
    parent.appendChild(child);
    contentEl.appendChild(parent);

    await nextTick();
    await nextTick();

    // Clear add calls
    onNodeRemoved.mockClear();
    onNodeAdded.mockClear();

    // Remove parent - should call onNodeRemoved for both parent AND child
    contentEl.removeChild(parent);

    await nextTick();
    await nextTick();

    // onNodeRemoved should be called for both the parent and the child
    expect(onNodeRemoved).toHaveBeenCalledWith(parent);
    expect(onNodeRemoved).toHaveBeenCalledWith(child);
  });

  it("handles removed element with no matching children (empty querySelectorAll)", async () => {
    setup();
    contentRef.value = contentEl;
    await nextTick();

    // Add element that HAS the data attribute but no children with it
    const el = document.createElement("div");
    el.setAttribute("data-test-id", "solo");
    el.innerHTML = "<span>no matching children</span>";
    contentEl.appendChild(el);

    await nextTick();
    await nextTick();
    onNodeRemoved.mockClear();

    contentEl.removeChild(el);

    await nextTick();
    await nextTick();

    expect(onNodeRemoved).toHaveBeenCalledWith(el);
    // Only called once (for the element itself, not for non-matching children)
    expect(onNodeRemoved).toHaveBeenCalledTimes(1);
  });

  it("calls onNodeRemoved for matching children when parent has no attribute", async () => {
    // Parent element does NOT have data-test-id, but its child does.
    // When the parent is removed, the handler should still find and report
    // the matching child via querySelectorAll (exercises lines 72-75).
    setup();
    contentRef.value = contentEl;
    await nextTick();

    const parent = document.createElement("div");
    // Parent does NOT have data-test-id
    const child = document.createElement("span");
    child.setAttribute("data-test-id", "orphan-child");
    parent.appendChild(child);
    contentEl.appendChild(parent);

    await nextTick();
    await nextTick();
    await nextTick();

    onNodeRemoved.mockClear();
    onNodeAdded.mockClear();

    contentEl.removeChild(parent);

    await nextTick();
    await nextTick();
    await nextTick();

    // onNodeRemoved should be called for the child (found via querySelectorAll)
    expect(onNodeRemoved).toHaveBeenCalledWith(child);
  });

  it("handles added element with no matching children (empty querySelectorAll)", async () => {
    // Added element has the attribute but no matching children.
    // The querySelectorAll returns empty, so forEach is not called for children.
    setup();
    contentRef.value = contentEl;
    await nextTick();

    onNodeAdded.mockClear();

    const el = document.createElement("div");
    el.setAttribute("data-test-id", "solo-add");
    el.innerHTML = "<span>no matching children</span>";
    contentEl.appendChild(el);

    await nextTick();
    await nextTick();
    await nextTick();

    // Only the parent element itself should trigger onNodeAdded, not non-matching children
    expect(onNodeAdded).toHaveBeenCalledWith(el);
    expect(onNodeAdded).toHaveBeenCalledTimes(1);
  });

  it("does not start duplicate observers", async () => {
    setup();
    contentRef.value = contentEl;
    await nextTick();

    // Setting to same value should not create a second observer
    // (watch only fires on change, so trigger a removal and re-add)
    contentRef.value = null;
    await nextTick();
    contentRef.value = contentEl;
    await nextTick();

    const child = document.createElement("div");
    child.setAttribute("data-test-id", "abc");
    contentEl.appendChild(child);

    await nextTick();
    await nextTick();
    await nextTick();

    // Should only be called once per add (not duplicated)
    const addCalls = onNodeAdded.mock.calls.filter((c) => c[0] === child);
    expect(addCalls.length).toBe(1);
  });
});
