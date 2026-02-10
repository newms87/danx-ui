import { describe, it, expect, vi, afterEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import TablePopover from "../TablePopover.vue";

describe("TablePopover", () => {
  let wrapper: VueWrapper;

  afterEach(() => {
    wrapper?.unmount();
  });

  function mountPopover(props: Record<string, unknown> = {}) {
    wrapper = mount(TablePopover, {
      props: {
        position: { x: 400, y: 300 },
        ...props,
      },
      attachTo: document.body,
    });
    return wrapper;
  }

  describe("rendering", () => {
    it("renders overlay", () => {
      mountPopover();
      expect(wrapper.find(".dx-popover-overlay").exists()).toBe(true);
    });

    it("shows Insert Table heading", () => {
      mountPopover();
      expect(wrapper.find(".popover-header h3").text()).toBe("Insert Table");
    });

    it("renders 5x5 grid", () => {
      mountPopover();
      const rows = wrapper.findAll(".grid-row");
      expect(rows.length).toBe(5);
      for (const row of rows) {
        expect(row.findAll(".grid-cell").length).toBe(5);
      }
    });

    it("shows default dimension label as 3 x 3", () => {
      mountPopover();
      expect(wrapper.find(".dimension-label").text()).toBe("3 x 3");
    });

    it("renders rows and cols manual inputs", () => {
      mountPopover();
      expect(wrapper.find("#table-rows").exists()).toBe(true);
      expect(wrapper.find("#table-cols").exists()).toBe(true);
    });

    it("has default manual values of 3", () => {
      mountPopover();
      const rows = wrapper.find("#table-rows").element as HTMLInputElement;
      const cols = wrapper.find("#table-cols").element as HTMLInputElement;
      expect(rows.value).toBe("3");
      expect(cols.value).toBe("3");
    });
  });

  describe("grid interaction", () => {
    it("updates hover state on cell mouseenter", async () => {
      mountPopover();
      // Hover over cell at row 2, col 4
      const rows = wrapper.findAll(".grid-row");
      const cell = rows[1]!.findAll(".grid-cell")[3]!;
      await cell.trigger("mouseenter");

      expect(wrapper.find(".dimension-label").text()).toBe("2 x 4");
    });

    it("marks cells as selected based on hover state", async () => {
      mountPopover();
      const rows = wrapper.findAll(".grid-row");
      const cell = rows[1]!.findAll(".grid-cell")[1]!;
      await cell.trigger("mouseenter");

      // 2x2 cells should be selected
      const selected = wrapper.findAll(".grid-cell.selected");
      expect(selected.length).toBe(4); // 2 rows x 2 cols
    });

    it("emits submit on cell click", async () => {
      mountPopover();
      const rows = wrapper.findAll(".grid-row");
      const cell = rows[2]!.findAll(".grid-cell")[3]!;
      await cell.trigger("click");

      expect(wrapper.emitted("submit")).toHaveLength(1);
      expect(wrapper.emitted("submit")![0]).toEqual([3, 4]);
    });

    it("updates manual inputs when hovering grid", async () => {
      mountPopover();
      const rows = wrapper.findAll(".grid-row");
      const cell = rows[3]!.findAll(".grid-cell")[4]!;
      await cell.trigger("mouseenter");

      const rowsInput = wrapper.find("#table-rows").element as HTMLInputElement;
      const colsInput = wrapper.find("#table-cols").element as HTMLInputElement;
      expect(rowsInput.value).toBe("4");
      expect(colsInput.value).toBe("5");
    });
  });

  describe("manual input", () => {
    it("emits submit with manual values on Insert click", async () => {
      mountPopover();
      await wrapper.find("#table-rows").setValue(7);
      await wrapper.find("#table-cols").setValue(4);
      await wrapper.find(".btn-insert").trigger("click");

      expect(wrapper.emitted("submit")).toHaveLength(1);
      expect(wrapper.emitted("submit")![0]).toEqual([7, 4]);
    });

    it("clamps rows to max 20", async () => {
      mountPopover();
      await wrapper.find("#table-rows").setValue(25);
      await wrapper.find("#table-cols").setValue(3);
      await wrapper.find(".btn-insert").trigger("click");

      expect(wrapper.emitted("submit")![0]).toEqual([20, 3]);
    });

    it("clamps cols to max 10", async () => {
      mountPopover();
      await wrapper.find("#table-rows").setValue(3);
      await wrapper.find("#table-cols").setValue(15);
      await wrapper.find(".btn-insert").trigger("click");

      expect(wrapper.emitted("submit")![0]).toEqual([3, 10]);
    });

    it("clamps minimum to 1", async () => {
      mountPopover();
      await wrapper.find("#table-rows").setValue(0);
      await wrapper.find("#table-cols").setValue(-1);
      await wrapper.find(".btn-insert").trigger("click");

      expect(wrapper.emitted("submit")![0]).toEqual([1, 1]);
    });

    it("emits submit on Enter in rows input", async () => {
      mountPopover();
      await wrapper.find("#table-rows").trigger("keydown.enter");
      expect(wrapper.emitted("submit")).toHaveLength(1);
    });

    it("emits submit on Enter in cols input", async () => {
      mountPopover();
      await wrapper.find("#table-cols").trigger("keydown.enter");
      expect(wrapper.emitted("submit")).toHaveLength(1);
    });
  });

  describe("popover positioning", () => {
    it("positions below cursor", () => {
      mountPopover({ position: { x: 400, y: 200 } });
      const style = wrapper.find(".dx-table-popover").attributes("style");
      expect(style).toContain("top: 210px");
    });

    it("positions above cursor when near bottom of viewport", () => {
      mountPopover({ position: { x: 400, y: 700 } });
      const style = wrapper.find(".dx-table-popover").attributes("style");
      // y - popoverHeight(340) - padding(10) = 350
      expect(style).toContain("top: 350px");
    });

    it("constrains left edge", () => {
      mountPopover({ position: { x: 0, y: 200 } });
      const style = wrapper.find(".dx-table-popover").attributes("style");
      expect(style).toContain("left: 10px");
    });
  });

  describe("events", () => {
    it("emits cancel on Cancel button click", async () => {
      mountPopover();
      await wrapper.find(".btn-cancel").trigger("click");
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });

    it("emits cancel on overlay click", async () => {
      mountPopover();
      await wrapper.find(".dx-popover-overlay").trigger("click");
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });

    it("emits cancel on Escape key", async () => {
      mountPopover();
      const event = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(event);
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });

    it("emits cancel on close button click", async () => {
      mountPopover();
      await wrapper.find(".close-btn").trigger("click");
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });
  });

  describe("cleanup", () => {
    it("removes document keydown listener on unmount", () => {
      const removeSpy = vi.spyOn(document, "removeEventListener");
      mountPopover();
      wrapper.unmount();

      const keydownCalls = removeSpy.mock.calls.filter((c) => c[0] === "keydown");
      expect(keydownCalls.length).toBeGreaterThan(0);
      removeSpy.mockRestore();
    });
  });
});
