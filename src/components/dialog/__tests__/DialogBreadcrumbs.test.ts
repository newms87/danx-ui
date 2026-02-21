import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import DialogBreadcrumbs from "../DialogBreadcrumbs.vue";
import { useDialogStack } from "../useDialogStack";

describe("DialogBreadcrumbs", () => {
  beforeEach(() => {
    const { reset } = useDialogStack();
    reset();
  });

  it("renders a nav element", () => {
    const wrapper = mount(DialogBreadcrumbs);
    expect(wrapper.find("nav.dialog-breadcrumbs").exists()).toBe(true);
  });

  it("renders nothing when stack is empty", () => {
    const wrapper = mount(DialogBreadcrumbs);
    expect(wrapper.findAll(".dialog-breadcrumbs__item")).toHaveLength(0);
  });

  it("renders one item for a single stack entry", () => {
    const { register } = useDialogStack();
    register("Only Dialog", () => {});

    const wrapper = mount(DialogBreadcrumbs);
    const items = wrapper.findAll(".dialog-breadcrumbs__item");
    expect(items).toHaveLength(1);
    expect(items[0]!.text()).toBe("Only Dialog");
  });

  it("renders all stack entries as breadcrumb items", () => {
    const { register } = useDialogStack();
    register("First", () => {});
    register("Second", () => {});
    register("Third", () => {});

    const wrapper = mount(DialogBreadcrumbs);
    const items = wrapper.findAll(".dialog-breadcrumbs__item");
    expect(items).toHaveLength(3);
    expect(items.map((i) => i.text())).toEqual(["First", "Second", "Third"]);
  });

  it("renders previous entries as buttons", () => {
    const { register } = useDialogStack();
    register("First", () => {});
    register("Second", () => {});

    const wrapper = mount(DialogBreadcrumbs);
    const buttons = wrapper.findAll("button.dialog-breadcrumbs__item");
    expect(buttons).toHaveLength(1);
    expect(buttons[0]!.text()).toBe("First");
  });

  it("renders the last entry as a span (not clickable)", () => {
    const { register } = useDialogStack();
    register("First", () => {});
    register("Second", () => {});

    const wrapper = mount(DialogBreadcrumbs);
    const active = wrapper.find(".dialog-breadcrumbs__item--active");
    expect(active.exists()).toBe(true);
    expect(active.element.tagName).toBe("SPAN");
    expect(active.text()).toBe("Second");
  });

  it("renders separators between items", () => {
    const { register } = useDialogStack();
    register("First", () => {});
    register("Second", () => {});
    register("Third", () => {});

    const wrapper = mount(DialogBreadcrumbs);
    const separators = wrapper.findAll(".dialog-breadcrumbs__separator");
    expect(separators).toHaveLength(2);
    expect(separators[0]!.text()).toBe("/");
  });

  it("does not render a separator before the first item", () => {
    const { register } = useDialogStack();
    register("First", () => {});
    register("Second", () => {});

    const wrapper = mount(DialogBreadcrumbs);
    // First child of nav should be a breadcrumb item, not a separator
    const firstChild = wrapper.find("nav > :first-child");
    expect(firstChild.classes()).toContain("dialog-breadcrumbs__item");
  });

  it("calls navigateTo when clicking a previous entry", async () => {
    const { register, stack } = useDialogStack();
    const closeFnB = () => {};
    register("First", () => {});
    register("Second", closeFnB);

    const wrapper = mount(DialogBreadcrumbs);
    const button = wrapper.find("button.dialog-breadcrumbs__item");
    await button.trigger("click");

    // After navigating to "First", "Second" should be removed
    expect(stack.value).toHaveLength(1);
    expect(stack.value[0]!.title()).toBe("First");
  });

  it("has aria-label on nav element", () => {
    const wrapper = mount(DialogBreadcrumbs);
    expect(wrapper.find("nav").attributes("aria-label")).toBe("Dialog navigation");
  });

  it("has aria-hidden on separators", () => {
    const { register } = useDialogStack();
    register("First", () => {});
    register("Second", () => {});

    const wrapper = mount(DialogBreadcrumbs);
    const separator = wrapper.find(".dialog-breadcrumbs__separator");
    expect(separator.attributes("aria-hidden")).toBe("true");
  });

  it("has aria-current=step on active breadcrumb", () => {
    const { register } = useDialogStack();
    register("First", () => {});
    register("Second", () => {});

    const wrapper = mount(DialogBreadcrumbs);
    const active = wrapper.find(".dialog-breadcrumbs__item--active");
    expect(active.attributes("aria-current")).toBe("step");
  });

  it("reflects reactive title changes when stack updates", async () => {
    const { register } = useDialogStack();
    let title = "Initial";
    register(
      () => title,
      () => {}
    );

    const wrapper = mount(DialogBreadcrumbs);
    expect(wrapper.find(".dialog-breadcrumbs__item").text()).toBe("Initial");

    // Change the title and register a new entry to trigger a stack update
    title = "Updated";
    register("New Entry", () => {});
    await nextTick();

    // The first breadcrumb should reflect the updated title
    const items = wrapper.findAll(".dialog-breadcrumbs__item");
    expect(items[0]!.text()).toBe("Updated");
  });
});
