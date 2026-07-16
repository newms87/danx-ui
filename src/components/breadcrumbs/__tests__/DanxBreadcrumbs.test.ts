import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import DanxBreadcrumbs from "../DanxBreadcrumbs.vue";
import type { DanxBreadcrumbItem } from "../types";

describe("DanxBreadcrumbs", () => {
  it("renders a nav element with aria-label", () => {
    const wrapper = mount(DanxBreadcrumbs, { props: { items: [] } });
    expect(wrapper.find("nav.breadcrumbs").exists()).toBe(true);
    expect(wrapper.find("nav").attributes("aria-label")).toBe("Breadcrumb");
  });

  it("renders nothing when items is empty", () => {
    const wrapper = mount(DanxBreadcrumbs, { props: { items: [] } });
    expect(wrapper.findAll(".breadcrumbs__item")).toHaveLength(0);
  });

  it("renders one item per entry", () => {
    const items: DanxBreadcrumbItem[] = [
      { label: "Home", href: "/" },
      { label: "Settings", href: "/settings" },
      { label: "Profile" },
    ];
    const wrapper = mount(DanxBreadcrumbs, { props: { items } });
    const rendered = wrapper.findAll(".breadcrumbs__item");
    expect(rendered).toHaveLength(3);
    expect(rendered.map((i) => i.text())).toEqual(["Home", "Settings", "Profile"]);
  });

  it("renders an href item as an anchor", () => {
    const items: DanxBreadcrumbItem[] = [{ label: "Home", href: "/" }, { label: "Current" }];
    const wrapper = mount(DanxBreadcrumbs, { props: { items } });
    const link = wrapper.find("a.breadcrumbs__item");
    expect(link.exists()).toBe(true);
    expect(link.attributes("href")).toBe("/");
  });

  it("renders an onClick item as a button", () => {
    const onClick = vi.fn();
    const items: DanxBreadcrumbItem[] = [{ label: "Step 1", onClick }, { label: "Current" }];
    const wrapper = mount(DanxBreadcrumbs, { props: { items } });
    const button = wrapper.find("button.breadcrumbs__item");
    expect(button.exists()).toBe(true);
  });

  it("calls onClick when an interactive button item is clicked", async () => {
    const onClick = vi.fn();
    const items: DanxBreadcrumbItem[] = [{ label: "Step 1", onClick }, { label: "Current" }];
    const wrapper = mount(DanxBreadcrumbs, { props: { items } });
    await wrapper.find("button.breadcrumbs__item").trigger("click");
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("calls onClick when an interactive anchor item is clicked", async () => {
    const onClick = vi.fn();
    const items: DanxBreadcrumbItem[] = [
      { label: "Home", href: "/", onClick },
      { label: "Current" },
    ];
    const wrapper = mount(DanxBreadcrumbs, { props: { items } });
    await wrapper.find("a.breadcrumbs__item").trigger("click");
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders the last item as inert text with aria-current=page", () => {
    const items: DanxBreadcrumbItem[] = [{ label: "Home", href: "/" }, { label: "Current" }];
    const wrapper = mount(DanxBreadcrumbs, { props: { items } });
    const current = wrapper.find(".breadcrumbs__item--current");
    expect(current.exists()).toBe(true);
    expect(current.element.tagName).toBe("SPAN");
    expect(current.attributes("aria-current")).toBe("page");
    expect(current.text()).toBe("Current");
  });

  it("does not render href/onClick for the current item even when provided", () => {
    const onClick = vi.fn();
    const items: DanxBreadcrumbItem[] = [
      { label: "Home", href: "/" },
      { label: "Current", href: "/current", onClick },
    ];
    const wrapper = mount(DanxBreadcrumbs, { props: { items } });
    expect(wrapper.find("a.breadcrumbs__item[href='/current']").exists()).toBe(false);
    expect(wrapper.findAll("button.breadcrumbs__item")).toHaveLength(0);
  });

  it("honors an explicit current:true override instead of the last item", () => {
    const items: DanxBreadcrumbItem[] = [
      { label: "Home", href: "/", current: true },
      { label: "Settings", href: "/settings" },
    ];
    const wrapper = mount(DanxBreadcrumbs, { props: { items } });
    const current = wrapper.find(".breadcrumbs__item--current");
    expect(current.text()).toBe("Home");
    expect(wrapper.find("a.breadcrumbs__item").attributes("href")).toBe("/settings");
  });

  it("renders a disabled item as inert text with aria-disabled", () => {
    const onClick = vi.fn();
    const items: DanxBreadcrumbItem[] = [
      { label: "Disabled", href: "/x", onClick, disabled: true },
      { label: "Current" },
    ];
    const wrapper = mount(DanxBreadcrumbs, { props: { items } });
    const disabled = wrapper.find(".breadcrumbs__item--disabled");
    expect(disabled.exists()).toBe(true);
    expect(disabled.element.tagName).toBe("SPAN");
    expect(disabled.attributes("aria-disabled")).toBe("true");
  });

  it("renders separators between items using the default separator", () => {
    const items: DanxBreadcrumbItem[] = [
      { label: "Home", href: "/" },
      { label: "Settings", href: "/settings" },
      { label: "Current" },
    ];
    const wrapper = mount(DanxBreadcrumbs, { props: { items } });
    const separators = wrapper.findAll(".breadcrumbs__separator");
    expect(separators).toHaveLength(2);
    expect(separators[0]!.text()).toBe("/");
    expect(separators[0]!.attributes("aria-hidden")).toBe("true");
  });

  it("does not render a separator before the first item", () => {
    const items: DanxBreadcrumbItem[] = [{ label: "Home", href: "/" }, { label: "Current" }];
    const wrapper = mount(DanxBreadcrumbs, { props: { items } });
    const firstChild = wrapper.find("nav > :first-child");
    expect(firstChild.classes()).toContain("breadcrumbs__item");
  });

  it("supports a custom separator via prop", () => {
    const items: DanxBreadcrumbItem[] = [{ label: "Home", href: "/" }, { label: "Current" }];
    const wrapper = mount(DanxBreadcrumbs, { props: { items, separator: ">" } });
    expect(wrapper.find(".breadcrumbs__separator").text()).toBe(">");
  });

  it("supports a custom separator via the separator slot", () => {
    const items: DanxBreadcrumbItem[] = [{ label: "Home", href: "/" }, { label: "Current" }];
    const wrapper = mount(DanxBreadcrumbs, {
      props: { items },
      slots: { separator: '<span class="custom-sep">→</span>' },
    });
    expect(wrapper.find(".custom-sep").exists()).toBe(true);
    expect(wrapper.find(".breadcrumbs__separator").text()).toBe("→");
  });

  it("renders an icon when provided", () => {
    const items: DanxBreadcrumbItem[] = [
      { label: "Home", href: "/", icon: "list" },
      { label: "Current" },
    ];
    const wrapper = mount(DanxBreadcrumbs, { props: { items } });
    expect(wrapper.find(".breadcrumbs__icon").exists()).toBe(true);
  });

  it("renders no icon when not provided", () => {
    const items: DanxBreadcrumbItem[] = [{ label: "Home", href: "/" }, { label: "Current" }];
    const wrapper = mount(DanxBreadcrumbs, { props: { items } });
    expect(wrapper.find(".breadcrumbs__icon").exists()).toBe(false);
  });

  it("does not collapse when items.length is within maxItems", () => {
    const items: DanxBreadcrumbItem[] = [
      { label: "A", href: "/a" },
      { label: "B", href: "/b" },
      { label: "C" },
    ];
    const wrapper = mount(DanxBreadcrumbs, { props: { items, maxItems: 3 } });
    expect(wrapper.findAll(".breadcrumbs__item")).toHaveLength(3);
    expect(wrapper.find(".breadcrumbs__ellipsis").exists()).toBe(false);
  });

  it("collapses the middle of the trail behind an ellipsis when exceeding maxItems", () => {
    const items: DanxBreadcrumbItem[] = [
      { label: "A", href: "/a" },
      { label: "B", href: "/b" },
      { label: "C", href: "/c" },
      { label: "D", href: "/d" },
      { label: "E" },
    ];
    const wrapper = mount(DanxBreadcrumbs, { props: { items, maxItems: 3 } });
    const rendered = wrapper.findAll(".breadcrumbs__item");
    // first item + last (maxItems - 1 = 2) items
    expect(rendered.map((i) => i.text())).toEqual(["A", "D", "E"]);
    expect(wrapper.find(".breadcrumbs__ellipsis").exists()).toBe(true);
  });

  it("renders separators around the ellipsis when collapsed", () => {
    const items: DanxBreadcrumbItem[] = [
      { label: "A", href: "/a" },
      { label: "B", href: "/b" },
      { label: "C", href: "/c" },
      { label: "D" },
    ];
    const wrapper = mount(DanxBreadcrumbs, { props: { items, maxItems: 2 } });
    const separators = wrapper.findAll(".breadcrumbs__separator");
    // A, ellipsis, D -> 2 separators
    expect(separators).toHaveLength(2);
  });
});
