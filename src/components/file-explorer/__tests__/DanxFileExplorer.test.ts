import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import DanxFileExplorer from "../DanxFileExplorer.vue";
import type { FileNode } from "../types";

/**
 * Tests for DanxFileExplorer + FileExplorerNode (exercised together by mounting
 * the root, since the node is driven entirely by injected context).
 */

const TREE: FileNode[] = [
  {
    id: "src",
    name: "src",
    children: [
      {
        id: "components",
        name: "components",
        children: [{ id: "Button.vue", name: "Button.vue" }],
      },
      { id: "index.ts", name: "index.ts" },
      { id: "disabled.ts", name: "disabled.ts", disabled: true },
    ],
  },
  { id: "empty-folder", name: "empty", type: "folder" },
  { id: "readme", name: "README.md" },
];

function mountExplorer(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
  return mount(DanxFileExplorer, {
    props: { nodes: TREE, ...props },
    ...options,
  });
}

beforeEach(() => {
  localStorage.clear();
});

describe("DanxFileExplorer rendering", () => {
  it("renders root nodes", () => {
    const wrapper = mountExplorer();
    const names = wrapper.findAll(".danx-file-explorer-node__name").map((n) => n.text());
    expect(names).toContain("src");
    expect(names).toContain("README.md");
  });

  it("does not render children of a collapsed folder", () => {
    const wrapper = mountExplorer();
    expect(wrapper.text()).not.toContain("index.ts");
  });

  it("renders children when a folder is expanded via v-model", () => {
    const wrapper = mountExplorer({ expanded: ["src"] });
    expect(wrapper.text()).toContain("index.ts");
  });

  it("renders the whole tree when defaultExpanded is set", () => {
    const wrapper = mountExplorer({ defaultExpanded: true });
    expect(wrapper.text()).toContain("Button.vue");
  });

  it("shows default empty state when there are no nodes", () => {
    const wrapper = mountExplorer({ nodes: [] });
    expect(wrapper.find(".danx-file-explorer__empty").exists()).toBe(true);
    expect(wrapper.text()).toContain("No items to display");
  });

  it("renders a custom empty slot", () => {
    const wrapper = mountExplorer({ nodes: [] }, { slots: { empty: "<span>Nothing here</span>" } });
    expect(wrapper.text()).toContain("Nothing here");
  });
});

describe("DanxFileExplorer icons + chevrons", () => {
  it("shows a chevron for folders with children and a spacer otherwise", () => {
    const wrapper = mountExplorer({ expanded: ["src"] });
    // src + components have chevrons; files + empty-folder use spacers
    expect(wrapper.findAll(".danx-file-explorer-node__chevron").length).toBe(2);
    expect(wrapper.findAll(".danx-file-explorer-node__chevron-spacer").length).toBeGreaterThan(0);
  });

  it("rotates the chevron when the folder is expanded", () => {
    const wrapper = mountExplorer({ expanded: ["src"] });
    expect(wrapper.find(".danx-file-explorer-node__chevron").classes()).toContain("is-open");
  });

  it("swaps the folder icon between closed and open on expansion", () => {
    const collapsedIcon = mountExplorer().find(".danx-file-explorer-node__icon").html();
    const expandedIcon = mountExplorer({ expanded: ["src"] })
      .find(".danx-file-explorer-node__icon")
      .html();
    // The closed and open folder glyphs render different SVG markup.
    expect(collapsedIcon).not.toBe(expandedIcon);
  });

  it("respects a custom per-node icon", () => {
    const wrapper = mount(DanxFileExplorer, {
      props: { nodes: [{ id: "x", name: "x", icon: "database" }] },
    });
    expect(wrapper.find(".danx-file-explorer-node__icon").exists()).toBe(true);
  });
});

describe("DanxFileExplorer interaction", () => {
  it("expands a folder when its row is clicked and emits toggle", async () => {
    const wrapper = mountExplorer();
    await wrapper.find(".danx-file-explorer-node__row").trigger("click");
    expect(wrapper.text()).toContain("index.ts");
    const toggle = wrapper.emitted("toggle");
    expect(toggle).toBeTruthy();
    expect((toggle![0]![0] as FileNode).id).toBe("src");
    expect(toggle![0]![1]).toBe(true);
  });

  it("toggles a folder via the chevron without bubbling to row select", async () => {
    const wrapper = mountExplorer();
    await wrapper.find(".danx-file-explorer-node__chevron").trigger("click");
    expect(wrapper.emitted("update:expanded")).toBeTruthy();
    expect(wrapper.emitted("update:selected")).toBeFalsy();
  });

  it("selects a file row and emits select + update:selected", async () => {
    const wrapper = mountExplorer({ expanded: ["src"] });
    const rows = wrapper.findAll(".danx-file-explorer-node__row");
    const fileRow = rows.find((r) => r.text().includes("index.ts"))!;
    await fileRow.trigger("click");
    expect(wrapper.emitted("select")).toBeTruthy();
    expect((wrapper.emitted("select")![0]![0] as FileNode).id).toBe("index.ts");
    expect(wrapper.emitted("update:selected")![0]).toEqual(["index.ts"]);
  });

  it("marks the selected row with is-selected", () => {
    const wrapper = mountExplorer({ selected: "readme" });
    const selectedRow = wrapper
      .findAll(".danx-file-explorer-node__row")
      .find((r) => r.text().includes("README.md"))!;
    expect(selectedRow.classes()).toContain("is-selected");
  });

  it("activates a row via the Enter key", async () => {
    const wrapper = mountExplorer();
    await wrapper.find(".danx-file-explorer-node__row").trigger("keydown.enter");
    expect(wrapper.emitted("toggle")).toBeTruthy();
  });

  it("activates a row via the Space key", async () => {
    const wrapper = mountExplorer();
    await wrapper.find(".danx-file-explorer-node__row").trigger("keydown.space");
    expect(wrapper.emitted("toggle")).toBeTruthy();
  });

  it("does not select or toggle a disabled node", async () => {
    const wrapper = mountExplorer({ expanded: ["src"] });
    const disabledRow = wrapper
      .findAll(".danx-file-explorer-node__row")
      .find((r) => r.text().includes("disabled.ts"))!;
    expect(disabledRow.classes()).toContain("is-disabled");
    await disabledRow.trigger("click");
    expect(wrapper.emitted("select")).toBeFalsy();
  });

  it("does not toggle a disabled folder via its chevron", async () => {
    const tree: FileNode[] = [
      { id: "f", name: "f", disabled: true, children: [{ id: "c", name: "c" }] },
    ];
    const wrapper = mount(DanxFileExplorer, { props: { nodes: tree } });
    const before = wrapper.emitted("update:expanded")?.length ?? 0;
    await wrapper.find(".danx-file-explorer-node__chevron").trigger("click");
    // No new expansion emit, and the child stays hidden.
    expect(wrapper.emitted("update:expanded")?.length ?? 0).toBe(before);
    expect(wrapper.find(".danx-file-explorer-node__children").exists()).toBe(false);
  });
});

describe("DanxFileExplorer selectable + foldersOnly", () => {
  it("does not emit select when selectable is false", async () => {
    const wrapper = mountExplorer({ selectable: false, expanded: ["src"] });
    const fileRow = wrapper
      .findAll(".danx-file-explorer-node__row")
      .find((r) => r.text().includes("index.ts"))!;
    await fileRow.trigger("click");
    expect(wrapper.emitted("select")).toBeFalsy();
    expect(fileRow.classes()).not.toContain("is-clickable");
  });

  it("hides files in folders-only mode", () => {
    const wrapper = mountExplorer({ foldersOnly: true, expanded: ["src"] });
    expect(wrapper.text()).not.toContain("index.ts");
    expect(wrapper.text()).toContain("components");
  });

  it("renders no children list for an expanded folder that has none", () => {
    // empty-folder is a folder with no children — expanding it yields no <ul>.
    const wrapper = mountExplorer({ expanded: ["empty-folder"] });
    const emptyRow = wrapper
      .findAll(".danx-file-explorer-node")
      .find((n) => n.text().includes("empty"))!;
    expect(emptyRow.find(".danx-file-explorer-node__children").exists()).toBe(false);
  });
});

describe("DanxFileExplorer slots", () => {
  it("renders a custom #node slot", () => {
    const wrapper = mount(DanxFileExplorer, {
      props: { nodes: TREE },
      slots: {
        node: `<template #node="{ node }"><span class="custom">{{ node.name }}!</span></template>`,
      },
    });
    expect(wrapper.find(".custom").text()).toBe("src!");
  });

  it("renders a custom #actions slot wrapper", () => {
    const wrapper = mount(DanxFileExplorer, {
      props: { nodes: TREE },
      slots: {
        actions: `<template #actions="{ node }"><button class="act">{{ node.id }}</button></template>`,
      },
    });
    expect(wrapper.find(".danx-file-explorer-node__actions").exists()).toBe(true);
    expect(wrapper.find(".act").exists()).toBe(true);
  });

  it("omits the actions wrapper when no actions slot is provided", () => {
    const wrapper = mountExplorer();
    expect(wrapper.find(".danx-file-explorer-node__actions").exists()).toBe(false);
  });
});

describe("DanxFileExplorer persistence", () => {
  it("persists expanded folders when a storageKey is given", async () => {
    const wrapper = mountExplorer({ storageKey: "fe-comp" });
    await wrapper.find(".danx-file-explorer-node__row").trigger("click");
    expect(JSON.parse(localStorage.getItem("fe-comp")!).expandedIds).toContain("src");
  });
});
