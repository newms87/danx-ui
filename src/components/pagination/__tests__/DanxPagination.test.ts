import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DanxPagination from "../DanxPagination.vue";
import { expectNoA11yViolations } from "../../../shared/testing/expectNoA11yViolations";

/** Mount with v-model props that update in place via setProps, tracked by ref-like closures. */
function mountWithModel(props: Record<string, unknown> = {}) {
  let currentPage = (props.page as number) ?? 1;
  let currentPerPage = (props.perPage as number) ?? 10;
  const wrapper = mount(DanxPagination, {
    props: {
      total: 100,
      ...props,
      page: currentPage,
      perPage: currentPerPage,
      "onUpdate:page": (value: number) => {
        currentPage = value;
        wrapper.setProps({ page: value });
      },
      "onUpdate:perPage": (value: number) => {
        currentPerPage = value;
        wrapper.setProps({ perPage: value });
      },
    },
  });
  return wrapper;
}

describe("DanxPagination", () => {
  describe("Rendering", () => {
    it("renders a nav container with danx-pagination class", () => {
      const wrapper = mountWithModel({ total: 100, page: 1, perPage: 10 });
      expect(wrapper.find(".danx-pagination").exists()).toBe(true);
      expect(wrapper.find("nav").attributes("aria-label")).toBe("Pagination");
    });

    it("renders prev and next nav buttons", () => {
      const wrapper = mountWithModel({ total: 100, page: 1, perPage: 10 });
      expect(wrapper.find("[aria-label='Previous page']").exists()).toBe(true);
      expect(wrapper.find("[aria-label='Next page']").exists()).toBe(true);
    });

    it("renders numbered page buttons for all pages when total pages fit the window", () => {
      const wrapper = mountWithModel({ total: 30, page: 1, perPage: 10 });
      const pageButtons = wrapper.findAll(".danx-pagination__page");
      expect(pageButtons.map((b) => b.text())).toEqual(["1", "2", "3"]);
    });

    it("renders ellipsis markers for large page counts", () => {
      const wrapper = mountWithModel({ total: 200, page: 10, perPage: 10 });
      const ellipses = wrapper.findAll(".danx-pagination__ellipsis");
      expect(ellipses.length).toBe(2);
    });

    it("renders no page buttons when total is 0", () => {
      const wrapper = mountWithModel({ total: 0, page: 1, perPage: 10 });
      expect(wrapper.findAll(".danx-pagination__page")).toHaveLength(0);
    });

    it("renders a single page button when total pages is 1", () => {
      const wrapper = mountWithModel({ total: 5, page: 1, perPage: 10 });
      const pageButtons = wrapper.findAll(".danx-pagination__page");
      expect(pageButtons).toHaveLength(1);
      expect(pageButtons[0]!.text()).toBe("1");
    });

    it("marks the current page button as active with aria-current", () => {
      const wrapper = mountWithModel({ total: 30, page: 2, perPage: 10 });
      const buttons = wrapper.findAll(".danx-pagination__page");
      expect(buttons[1]!.classes()).toContain("is-active");
      expect(buttons[1]!.attributes("aria-current")).toBe("page");
      expect(buttons[0]!.attributes("aria-current")).toBeUndefined();
    });
  });

  describe("Prev/Next navigation", () => {
    it("disables prev button on the first page", () => {
      const wrapper = mountWithModel({ total: 100, page: 1, perPage: 10 });
      expect(wrapper.find("[aria-label='Previous page']").attributes("disabled")).toBeDefined();
    });

    it("disables next button on the last page", () => {
      const wrapper = mountWithModel({ total: 100, page: 10, perPage: 10 });
      expect(wrapper.find("[aria-label='Next page']").attributes("disabled")).toBeDefined();
    });

    it("disables both nav buttons when there are 0 pages", () => {
      const wrapper = mountWithModel({ total: 0, page: 1, perPage: 10 });
      expect(wrapper.find("[aria-label='Previous page']").attributes("disabled")).toBeDefined();
      expect(wrapper.find("[aria-label='Next page']").attributes("disabled")).toBeDefined();
    });

    it("emits update:page when next is clicked", async () => {
      const wrapper = mountWithModel({ total: 100, page: 1, perPage: 10 });
      await wrapper.find("[aria-label='Next page']").trigger("click");
      expect(wrapper.emitted("update:page")).toBeTruthy();
      expect(wrapper.emitted("update:page")![0]).toEqual([2]);
    });

    it("emits update:page when prev is clicked", async () => {
      const wrapper = mountWithModel({ total: 100, page: 5, perPage: 10 });
      await wrapper.find("[aria-label='Previous page']").trigger("click");
      expect(wrapper.emitted("update:page")).toBeTruthy();
      expect(wrapper.emitted("update:page")![0]).toEqual([4]);
    });

    it("does not emit update:page when clicking prev while disabled at first page", async () => {
      const wrapper = mountWithModel({ total: 100, page: 1, perPage: 10 });
      await wrapper.find("[aria-label='Previous page']").trigger("click");
      expect(wrapper.emitted("update:page")).toBeUndefined();
    });

    it("does not emit update:page when clicking next while disabled at last page", async () => {
      const wrapper = mountWithModel({ total: 100, page: 10, perPage: 10 });
      await wrapper.find("[aria-label='Next page']").trigger("click");
      expect(wrapper.emitted("update:page")).toBeUndefined();
    });
  });

  describe("Page button clicks", () => {
    it("emits update:page with the clicked page number", async () => {
      const wrapper = mountWithModel({ total: 30, page: 1, perPage: 10 });
      const buttons = wrapper.findAll(".danx-pagination__page");
      await buttons[2]!.trigger("click");
      expect(wrapper.emitted("update:page")![0]).toEqual([3]);
    });

    it("does not emit when clicking the already-active page", async () => {
      const wrapper = mountWithModel({ total: 30, page: 2, perPage: 10 });
      const buttons = wrapper.findAll(".danx-pagination__page");
      await buttons[1]!.trigger("click");
      expect(wrapper.emitted("update:page")).toBeUndefined();
    });
  });

  describe("Disabled prop", () => {
    it("disables all page and nav buttons when disabled is true", () => {
      const wrapper = mountWithModel({ total: 30, page: 2, perPage: 10, disabled: true });
      const buttons = wrapper.findAll("button");
      for (const button of buttons) {
        expect(button.attributes("disabled")).toBeDefined();
      }
    });

    it("applies is-disabled class to the container", () => {
      const wrapper = mountWithModel({ total: 30, page: 2, perPage: 10, disabled: true });
      expect(wrapper.find(".danx-pagination").classes()).toContain("is-disabled");
    });

    it("does not emit update:page from a page button click while disabled", async () => {
      const wrapper = mountWithModel({ total: 30, page: 2, perPage: 10, disabled: true });
      const buttons = wrapper.findAll(".danx-pagination__page");
      await buttons[0]!.trigger("click");
      expect(wrapper.emitted("update:page")).toBeUndefined();
    });
  });

  describe("Per-page selector", () => {
    it("does not render the per-page selector by default", () => {
      const wrapper = mountWithModel({ total: 100, page: 1, perPage: 10 });
      expect(wrapper.find(".danx-pagination__select").exists()).toBe(false);
    });

    it("renders the per-page selector when showPerPageSelector is true", () => {
      const wrapper = mountWithModel({
        total: 100,
        page: 1,
        perPage: 10,
        showPerPageSelector: true,
      });
      expect(wrapper.find(".danx-pagination__select").exists()).toBe(true);
    });

    it("renders an option for each perPageOption", () => {
      const wrapper = mountWithModel({
        total: 100,
        page: 1,
        perPage: 10,
        showPerPageSelector: true,
        perPageOptions: [5, 15, 30],
      });
      const options = wrapper.findAll(".danx-pagination__select option");
      expect(options.map((o) => o.text())).toEqual(["5", "15", "30"]);
    });

    it("emits update:perPage and resets page to 1 when the selector changes", async () => {
      const wrapper = mountWithModel({
        total: 100,
        page: 3,
        perPage: 10,
        showPerPageSelector: true,
      });
      const select = wrapper.find(".danx-pagination__select");
      await select.setValue("25");
      expect(wrapper.emitted("update:perPage")).toBeTruthy();
      expect(wrapper.emitted("update:perPage")![0]).toEqual([25]);
      expect(wrapper.emitted("update:page")).toBeTruthy();
      expect(wrapper.emitted("update:page")![0]).toEqual([1]);
    });

    it("does not emit when the selected value is unchanged", async () => {
      const wrapper = mountWithModel({
        total: 100,
        page: 1,
        perPage: 10,
        showPerPageSelector: true,
      });
      const select = wrapper.find(".danx-pagination__select");
      await select.setValue("10");
      expect(wrapper.emitted("update:perPage")).toBeUndefined();
    });

    it("disables the selector when disabled is true", () => {
      const wrapper = mountWithModel({
        total: 100,
        page: 1,
        perPage: 10,
        showPerPageSelector: true,
        disabled: true,
      });
      expect(wrapper.find(".danx-pagination__select").attributes("disabled")).toBeDefined();
    });
  });

  describe("Go-to-page input", () => {
    it("does not render the go-to-page form by default", () => {
      const wrapper = mountWithModel({ total: 100, page: 1, perPage: 10 });
      expect(wrapper.find(".danx-pagination__go-to-page").exists()).toBe(false);
    });

    it("renders the go-to-page form when showGoToPage is true", () => {
      const wrapper = mountWithModel({ total: 100, page: 1, perPage: 10, showGoToPage: true });
      expect(wrapper.find(".danx-pagination__go-to-page").exists()).toBe(true);
    });

    it("initializes the input with the current page", () => {
      const wrapper = mountWithModel({ total: 100, page: 4, perPage: 10, showGoToPage: true });
      const input = wrapper.find(".danx-pagination__go-to-page-input");
      expect((input.element as HTMLInputElement).value).toBe("4");
    });

    it("navigates to the entered page on submit", async () => {
      const wrapper = mountWithModel({ total: 100, page: 1, perPage: 10, showGoToPage: true });
      const input = wrapper.find(".danx-pagination__go-to-page-input");
      await input.setValue("7");
      await wrapper.find(".danx-pagination__go-to-page").trigger("submit");
      expect(wrapper.emitted("update:page")).toBeTruthy();
      expect(wrapper.emitted("update:page")![0]).toEqual([7]);
    });

    it("clamps a value above totalPages down to the last page", async () => {
      const wrapper = mountWithModel({ total: 100, page: 1, perPage: 10, showGoToPage: true });
      const input = wrapper.find(".danx-pagination__go-to-page-input");
      await input.setValue("999");
      await wrapper.find(".danx-pagination__go-to-page").trigger("submit");
      expect(wrapper.emitted("update:page")![0]).toEqual([10]);
    });

    it("clamps a value below 1 up to the first page", async () => {
      const wrapper = mountWithModel({ total: 100, page: 5, perPage: 10, showGoToPage: true });
      const input = wrapper.find(".danx-pagination__go-to-page-input");
      await input.setValue("-3");
      await wrapper.find(".danx-pagination__go-to-page").trigger("submit");
      expect(wrapper.emitted("update:page")![0]).toEqual([1]);
    });

    it("resets to the current page and does not emit for a non-numeric value", async () => {
      const wrapper = mountWithModel({ total: 100, page: 3, perPage: 10, showGoToPage: true });
      const input = wrapper.find(".danx-pagination__go-to-page-input");
      await input.setValue("abc");
      await wrapper.find(".danx-pagination__go-to-page").trigger("submit");
      expect(wrapper.emitted("update:page")).toBeUndefined();
      expect((input.element as HTMLInputElement).value).toBe("3");
    });

    it("clamps to 1 when there are 0 total pages", async () => {
      const wrapper = mountWithModel({ total: 0, page: 1, perPage: 10, showGoToPage: true });
      const input = wrapper.find(".danx-pagination__go-to-page-input");
      await input.setValue("5");
      await wrapper.find(".danx-pagination__go-to-page").trigger("submit");
      // 0 total pages means goToPage is a no-op, but the input still clamps for display
      expect(wrapper.emitted("update:page")).toBeUndefined();
      expect((input.element as HTMLInputElement).value).toBe("1");
    });

    it("disables the input and submit button when disabled is true", () => {
      const wrapper = mountWithModel({
        total: 100,
        page: 1,
        perPage: 10,
        showGoToPage: true,
        disabled: true,
      });
      expect(
        wrapper.find(".danx-pagination__go-to-page-input").attributes("disabled")
      ).toBeDefined();
      expect(
        wrapper.find(".danx-pagination__go-to-page-submit").attributes("disabled")
      ).toBeDefined();
    });

    it("does not navigate on submit while disabled, even bypassing disabled form controls", async () => {
      const wrapper = mountWithModel({
        total: 100,
        page: 3,
        perPage: 10,
        showGoToPage: true,
        disabled: true,
      });
      // Submit the form directly (disabled inputs still allow a bypassed submit trigger)
      await wrapper.find(".danx-pagination__go-to-page").trigger("submit");
      expect(wrapper.emitted("update:page")).toBeUndefined();
    });

    it("keeps the input in sync when the current page changes externally", async () => {
      const wrapper = mountWithModel({ total: 100, page: 1, perPage: 10, showGoToPage: true });
      await wrapper.setProps({ page: 6 });
      const input = wrapper.find(".danx-pagination__go-to-page-input");
      expect((input.element as HTMLInputElement).value).toBe("6");
    });
  });

  describe("maxVisiblePages", () => {
    it("respects a custom maxVisiblePages value", () => {
      const wrapper = mountWithModel({ total: 200, page: 10, perPage: 10, maxVisiblePages: 5 });
      const buttons = wrapper.findAll(".danx-pagination__page");
      // 1, ellipsis, 9, 10, 11, ellipsis, 20 -> 5 numbered buttons
      expect(buttons.length).toBeLessThanOrEqual(6);
    });
  });

  describe("Accessibility", () => {
    it("has no axe violations", async () => {
      const wrapper = mountWithModel({
        total: 200,
        page: 10,
        perPage: 10,
        showPerPageSelector: true,
        showGoToPage: true,
      });
      document.body.appendChild(wrapper.element);
      await expectNoA11yViolations(wrapper.element);
      wrapper.unmount();
    });
  });
});
