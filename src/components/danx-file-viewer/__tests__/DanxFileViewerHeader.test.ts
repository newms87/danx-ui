import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";
import DanxFileViewerHeader from "../DanxFileViewerHeader.vue";

/** Minimal stub that renders a span with the icon name */
const DanxButtonStub = defineComponent({
  props: ["variant", "size", "icon", "tooltip", "label"],
  emits: ["click"],
  template: "<button @click=\"$emit('click')\"><slot /></button>",
});

function mountHeader(overrides: Record<string, unknown> = {}) {
  return mount(DanxFileViewerHeader, {
    props: {
      fileName: "test.jpg",
      hasParent: false,
      hasChildFiles: false,
      childCount: 0,
      childrenLabel: "Children",
      slideLabel: "",
      hasMetadata: false,
      infoCount: 0,
      downloadable: false,
      breadcrumbs: [],
      ...overrides,
    },
    global: {
      stubs: {
        DanxButton: DanxButtonStub,
      },
    },
  });
}

describe("DanxFileViewerHeader", () => {
  it("renders the file name", () => {
    const wrapper = mountHeader({ fileName: "photo.png" });
    expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("photo.png");
  });

  it("renders slide label when provided", () => {
    const wrapper = mountHeader({ slideLabel: "2 / 5" });
    expect(wrapper.find(".danx-file-viewer__counter").text()).toBe("2 / 5");
  });

  it("does not render slide label when empty", () => {
    const wrapper = mountHeader({ slideLabel: "" });
    expect(wrapper.find(".danx-file-viewer__counter").exists()).toBe(false);
  });

  it("shows back button when hasParent is true", () => {
    const wrapper = mountHeader({ hasParent: true });
    expect(wrapper.find(".danx-file-viewer__nav-buttons").exists()).toBe(true);
  });

  it("hides nav buttons when neither hasParent nor hasChildFiles", () => {
    const wrapper = mountHeader({ hasParent: false, hasChildFiles: false });
    expect(wrapper.find(".danx-file-viewer__nav-buttons").exists()).toBe(false);
  });

  it("shows children button with count and label", () => {
    const wrapper = mountHeader({
      hasChildFiles: true,
      childCount: 3,
      childrenLabel: "Pages",
    });
    const buttons = wrapper.findAll(".danx-file-viewer__nav-buttons button");
    expect(buttons.length).toBe(1);
  });

  it("renders both back and children buttons when both hasParent and hasChildFiles", () => {
    const wrapper = mountHeader({
      hasParent: true,
      hasChildFiles: true,
      childCount: 2,
    });
    const buttons = wrapper.findAll(".danx-file-viewer__nav-buttons button");
    expect(buttons.length).toBe(2);
  });

  it("emits backFromChild when back button is clicked", async () => {
    const wrapper = mountHeader({ hasParent: true });
    const buttons = wrapper.findAll(".danx-file-viewer__nav-buttons button");
    await buttons[0]!.trigger("click");
    expect(wrapper.emitted("backFromChild")).toBeTruthy();
  });

  it("emits diveIntoChildren when children button is clicked", async () => {
    const wrapper = mountHeader({ hasChildFiles: true, childCount: 2 });
    const buttons = wrapper.findAll(".danx-file-viewer__nav-buttons button");
    await buttons[0]!.trigger("click");
    expect(wrapper.emitted("diveIntoChildren")).toBeTruthy();
  });

  it("shows metadata button when hasMetadata is true", () => {
    const wrapper = mountHeader({ hasMetadata: true, infoCount: 5 });
    const badge = wrapper.find(".danx-file-viewer__meta-badge");
    expect(badge.exists()).toBe(true);
    expect(badge.text()).toBe("5");
  });

  it("hides metadata badge when infoCount is 0", () => {
    const wrapper = mountHeader({ hasMetadata: true, infoCount: 0 });
    expect(wrapper.find(".danx-file-viewer__meta-badge").exists()).toBe(false);
  });

  it("emits toggleMetadata when metadata button is clicked", async () => {
    const wrapper = mountHeader({ hasMetadata: true });
    const actionButtons = wrapper.findAll(".danx-file-viewer__header-actions button");
    // First button in actions is metadata
    await actionButtons[0]!.trigger("click");
    expect(wrapper.emitted("toggleMetadata")).toBeTruthy();
  });

  it("emits download when download button is clicked", async () => {
    const wrapper = mountHeader({ downloadable: true });
    const actionButtons = wrapper.findAll(".danx-file-viewer__header-actions button");
    await actionButtons[0]!.trigger("click");
    expect(wrapper.emitted("download")).toBeTruthy();
  });

  it("renders breadcrumbs when hasParent is true", () => {
    const wrapper = mountHeader({
      hasParent: true,
      breadcrumbs: [
        { id: "root", name: "Root" },
        { id: "child", name: "Child" },
      ],
    });
    const nav = wrapper.find(".danx-file-viewer__breadcrumbs");
    expect(nav.exists()).toBe(true);
    const items = wrapper.findAll(".danx-file-viewer__breadcrumb-item");
    expect(items).toHaveLength(2);
  });

  it("emits navigateToAncestor when a breadcrumb button is clicked", async () => {
    const wrapper = mountHeader({
      hasParent: true,
      breadcrumbs: [
        { id: "root", name: "Root" },
        { id: "child", name: "Child" },
      ],
    });
    // First breadcrumb is a button (not active), second is active span
    const breadcrumbButtons = wrapper.findAll(".danx-file-viewer__breadcrumb-item");
    await breadcrumbButtons[0]!.trigger("click");
    expect(wrapper.emitted("navigateToAncestor")).toEqual([["root"]]);
  });

  it("does not render breadcrumbs when hasParent is false", () => {
    const wrapper = mountHeader({ hasParent: false });
    expect(wrapper.find(".danx-file-viewer__breadcrumbs").exists()).toBe(false);
  });

  it("passes through header-actions slot", () => {
    const wrapper = mount(DanxFileViewerHeader, {
      props: {
        fileName: "test.jpg",
        hasParent: false,
        hasChildFiles: false,
        childCount: 0,
        childrenLabel: "Children",
        slideLabel: "",
        hasMetadata: false,
        infoCount: 0,
        downloadable: false,
        breadcrumbs: [],
      },
      slots: {
        "header-actions": "<span class='custom-action'>Custom</span>",
      },
      global: {
        stubs: {
          DanxButton: DanxButtonStub,
        },
      },
    });
    expect(wrapper.find(".custom-action").exists()).toBe(true);
  });
});
