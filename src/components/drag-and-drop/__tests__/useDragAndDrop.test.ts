import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { mount, type VueWrapper } from "@vue/test-utils";
import { useDragAndDrop } from "../useDragAndDrop";

// jsdom doesn't implement pointer capture — stub globally
HTMLElement.prototype.setPointerCapture = vi.fn();
HTMLElement.prototype.releasePointerCapture = vi.fn();

const mountedWrappers: VueWrapper[] = [];

function createDragAndDrop(initial: string[] = ["a", "b", "c"], options = {}) {
  const items = ref([...initial]);

  let result!: ReturnType<typeof useDragAndDrop<string>>;
  const wrapper = mount(
    defineComponent({
      setup() {
        result = useDragAndDrop(items, options);
        return {};
      },
      template: "<div />",
    })
  );
  mountedWrappers.push(wrapper);

  return { ...result, items };
}

/** Builds a fake row element with a stubbed bounding rect at the given top offset. */
function fakeRow(top: number): HTMLElement {
  const el = document.createElement("div");
  el.getBoundingClientRect = vi.fn(
    () =>
      ({
        top,
        left: 0,
        bottom: top + 40,
        right: 100,
        width: 100,
        height: 40,
        x: 0,
        y: top,
        toJSON: () => ({}),
      }) as DOMRect
  );
  return el;
}

function makePointerEvent(type: string, extra: Partial<PointerEvent> = {}): PointerEvent {
  const { target, ...rest } = extra;
  const event = new Event(type) as PointerEvent;
  Object.assign(event, { pointerId: 1, clientX: 0, clientY: 0, ...rest });
  Object.defineProperty(event, "target", {
    value: target ?? document.createElement("div"),
    configurable: true,
  });
  return event;
}

afterEach(() => {
  for (const w of mountedWrappers) w.unmount();
  mountedWrappers.length = 0;
});

describe("useDragAndDrop", () => {
  describe("Initial State", () => {
    it("starts with no dragging or drop target index", () => {
      const { draggingIndex, dropTargetIndex } = createDragAndDrop();
      expect(draggingIndex.value).toBeNull();
      expect(dropTargetIndex.value).toBeNull();
    });

    it("starts with an empty announcement", () => {
      const { announcement } = createDragAndDrop();
      expect(announcement.value).toBe("");
    });

    it("isDragging/isDropTarget report false for all indices when idle", () => {
      const { isDragging, isDropTarget } = createDragAndDrop();
      expect(isDragging(0)).toBe(false);
      expect(isDropTarget(0)).toBe(false);
    });
  });

  describe("Keyboard reordering", () => {
    it("grabs an item on Space and sets dragging/announcement state", () => {
      const { onHandleKeydown, draggingIndex, announcement, isDragging } = createDragAndDrop();
      const event = new KeyboardEvent("keydown", { key: " ", cancelable: true });

      onHandleKeydown(0, event);

      expect(draggingIndex.value).toBe(0);
      expect(isDragging(0)).toBe(true);
      expect(announcement.value).toContain("Grabbed item 1");
      expect(event.defaultPrevented).toBe(true);
    });

    it("moves a grabbed item down with ArrowDown, mutating the array", () => {
      const { onHandleKeydown, items, draggingIndex } = createDragAndDrop(["a", "b", "c"]);

      onHandleKeydown(0, new KeyboardEvent("keydown", { key: " " }));
      onHandleKeydown(0, new KeyboardEvent("keydown", { key: "ArrowDown", cancelable: true }));

      expect(items.value).toEqual(["b", "a", "c"]);
      expect(draggingIndex.value).toBe(1);
    });

    it("moves a grabbed item up with ArrowUp", () => {
      const { onHandleKeydown, items } = createDragAndDrop(["a", "b", "c"]);

      onHandleKeydown(2, new KeyboardEvent("keydown", { key: " " }));
      onHandleKeydown(2, new KeyboardEvent("keydown", { key: "ArrowUp" }));

      expect(items.value).toEqual(["a", "c", "b"]);
    });

    it("does not move past the start or end of the array", () => {
      const { onHandleKeydown, items } = createDragAndDrop(["a", "b", "c"]);

      onHandleKeydown(0, new KeyboardEvent("keydown", { key: " " }));
      onHandleKeydown(0, new KeyboardEvent("keydown", { key: "ArrowUp" }));
      expect(items.value).toEqual(["a", "b", "c"]);

      onHandleKeydown(0, new KeyboardEvent("keydown", { key: "Enter" }));
      onHandleKeydown(2, new KeyboardEvent("keydown", { key: " " }));
      onHandleKeydown(2, new KeyboardEvent("keydown", { key: "ArrowDown" }));
      expect(items.value).toEqual(["a", "b", "c"]);
    });

    it("drops the item on a second Enter/Space, clearing state", () => {
      const { onHandleKeydown, draggingIndex, announcement } = createDragAndDrop();

      onHandleKeydown(1, new KeyboardEvent("keydown", { key: "Enter" }));
      onHandleKeydown(1, new KeyboardEvent("keydown", { key: "Enter" }));

      expect(draggingIndex.value).toBeNull();
      expect(announcement.value).toContain("Dropped item at position 2");
    });

    it("cancels the grab on Escape without mutating the array", () => {
      const { onHandleKeydown, items, draggingIndex, announcement } = createDragAndDrop([
        "a",
        "b",
        "c",
      ]);

      onHandleKeydown(0, new KeyboardEvent("keydown", { key: " " }));
      onHandleKeydown(0, new KeyboardEvent("keydown", { key: "ArrowDown" }));
      onHandleKeydown(1, new KeyboardEvent("keydown", { key: "Escape", cancelable: true }));

      expect(draggingIndex.value).toBeNull();
      expect(announcement.value).toBe("Reordering cancelled.");
      expect(items.value).toEqual(["b", "a", "c"]);
    });

    it("ignores arrow keys when nothing is grabbed", () => {
      const { onHandleKeydown, items } = createDragAndDrop(["a", "b", "c"]);

      onHandleKeydown(0, new KeyboardEvent("keydown", { key: "ArrowDown" }));

      expect(items.value).toEqual(["a", "b", "c"]);
    });

    it("uses Left/Right arrows in horizontal orientation instead of Up/Down", () => {
      const { onHandleKeydown, items } = createDragAndDrop(["a", "b", "c"], {
        orientation: "horizontal",
      });

      onHandleKeydown(0, new KeyboardEvent("keydown", { key: " " }));
      onHandleKeydown(0, new KeyboardEvent("keydown", { key: "ArrowDown" }));
      expect(items.value).toEqual(["a", "b", "c"]);

      onHandleKeydown(0, new KeyboardEvent("keydown", { key: "ArrowRight" }));
      expect(items.value).toEqual(["b", "a", "c"]);
    });
  });

  describe("Pointer dragging", () => {
    it("registers item refs and moves an item on drop over another row", () => {
      const { registerItemRef, startDrag, items, announcement } = createDragAndDrop([
        "a",
        "b",
        "c",
      ]);

      registerItemRef(0, fakeRow(0));
      registerItemRef(1, fakeRow(40));
      registerItemRef(2, fakeRow(80));

      const target = document.createElement("div");
      const downEvent = makePointerEvent("pointerdown", { target });
      startDrag(0, downEvent);

      const moveEvent = makePointerEvent("pointermove", { clientY: 90 });
      target.dispatchEvent(moveEvent);

      const upEvent = makePointerEvent("pointerup");
      target.dispatchEvent(upEvent);

      expect(items.value).toEqual(["b", "c", "a"]);
      expect(announcement.value).toContain("Moved item from position 1 to position 3");
    });

    it("falls back to the last index when dropped below every row", () => {
      const { registerItemRef, startDrag, items, announcement } = createDragAndDrop([
        "a",
        "b",
        "c",
      ]);

      registerItemRef(0, fakeRow(0));
      registerItemRef(1, fakeRow(40));
      registerItemRef(2, fakeRow(80));

      const target = document.createElement("div");
      startDrag(0, makePointerEvent("pointerdown", { target }));
      target.dispatchEvent(makePointerEvent("pointermove", { clientY: 500 }));
      target.dispatchEvent(makePointerEvent("pointerup"));

      expect(items.value).toEqual(["b", "c", "a"]);
      expect(announcement.value).toContain("position 3");
    });

    it("does not mutate the array when dropped back on the same index", () => {
      const { registerItemRef, startDrag, items } = createDragAndDrop(["a", "b", "c"]);

      registerItemRef(0, fakeRow(0));
      registerItemRef(1, fakeRow(40));
      registerItemRef(2, fakeRow(80));

      const target = document.createElement("div");
      startDrag(0, makePointerEvent("pointerdown", { target }));
      target.dispatchEvent(makePointerEvent("pointerup"));

      expect(items.value).toEqual(["a", "b", "c"]);
    });

    it("clears dragging state on pointercancel", () => {
      const { registerItemRef, startDrag, draggingIndex } = createDragAndDrop(["a", "b", "c"]);
      registerItemRef(0, fakeRow(0));

      const target = document.createElement("div");
      startDrag(0, makePointerEvent("pointerdown", { target }));
      expect(draggingIndex.value).toBe(0);

      target.dispatchEvent(makePointerEvent("pointercancel"));
      expect(draggingIndex.value).toBeNull();
    });
  });

  describe("FLIP transition", () => {
    it("briefly applies an inline transform/transition when a row's position changes", async () => {
      const { onHandleKeydown, registerItemRef } = createDragAndDrop(["a", "b", "c"]);

      // Simulate the element having moved 40px up between capture and re-read.
      const movedRow = document.createElement("div");
      let call = 0;
      movedRow.getBoundingClientRect = vi.fn(() => {
        call += 1;
        const top = call === 1 ? 40 : 0;
        return {
          top,
          left: 0,
          bottom: top + 40,
          right: 100,
          width: 100,
          height: 40,
          x: 0,
          y: top,
          toJSON: () => ({}),
        } as DOMRect;
      });

      registerItemRef(0, fakeRow(0));
      registerItemRef(1, movedRow);
      registerItemRef(2, fakeRow(80));

      const transitionSpy = vi.fn();
      Object.defineProperty(movedRow.style, "transition", {
        get: transitionSpy.mockReturnValue(""),
        set: transitionSpy,
        configurable: true,
      });

      onHandleKeydown(0, new KeyboardEvent("keydown", { key: " " }));
      onHandleKeydown(0, new KeyboardEvent("keydown", { key: "ArrowDown" }));

      await nextTick();
      await nextTick();

      // Setter is invoked at least twice: once to disable, once to apply the
      // token-driven transition for the FLIP animation.
      expect(transitionSpy).toHaveBeenCalled();

      // Firing transitionend runs the cleanup that clears the inline styles.
      movedRow.dispatchEvent(new Event("transitionend"));
      expect(movedRow.style.transform).toBe("");
    });
  });
});
