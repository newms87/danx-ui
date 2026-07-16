import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DanxTreeView from "../DanxTreeView.vue";
import type { TreeNode } from "../types";

/**
 * Tests for DanxTreeView + TreeViewNode (exercised together by mounting the
 * root, since the node is driven entirely by injected context).
 */

const TREE: TreeNode[] = [
  {
    id: "eng",
    label: "Engineering",
    children: [
      {
        id: "frontend",
        label: "Frontend",
        children: [{ id: "alice", label: "Alice" }],
      },
      { id: "bob", label: "Bob" },
      { id: "disabled", label: "Disabled Node", disabled: true },
    ],
  },
  { id: "empty-team", label: "Empty Team", children: [] },
  { id: "carol", label: "Carol" },
];

function mountTree(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
  return mount(DanxTreeView, {
    props: { nodes: TREE, ...props },
    ...options,
  });
}

describe("DanxTreeView rendering", () => {
  it("renders root nodes", () => {
    const wrapper = mountTree();
    const labels = wrapper.findAll(".danx-tree-view-node__name").map((n) => n.text());
    expect(labels).toContain("Engineering");
    expect(labels).toContain("Carol");
  });

  it("does not render children of a collapsed branch", () => {
    const wrapper = mountTree();
    expect(wrapper.text()).not.toContain("Bob");
  });

  it("renders children when a branch is expanded via v-model", () => {
    const wrapper = mountTree({ expanded: ["eng"] });
    expect(wrapper.text()).toContain("Bob");
  });

  it("renders the whole tree when defaultExpanded is set", () => {
    const wrapper = mountTree({ defaultExpanded: true });
    expect(wrapper.text()).toContain("Alice");
  });

  it("shows default empty state when there are no nodes", () => {
    const wrapper = mountTree({ nodes: [] });
    expect(wrapper.find(".danx-tree-view__empty").exists()).toBe(true);
    expect(wrapper.text()).toContain("No items to display");
  });

  it("renders a custom empty slot", () => {
    const wrapper = mountTree({ nodes: [] }, { slots: { empty: "<span>Nothing here</span>" } });
    expect(wrapper.text()).toContain("Nothing here");
  });
});

describe("DanxTreeView icons + chevrons", () => {
  it("shows a chevron for branches with children and a spacer otherwise", () => {
    const wrapper = mountTree({ expanded: ["eng"] });
    // eng + frontend have chevrons; leaves + empty-team use spacers
    expect(wrapper.findAll(".danx-tree-view-node__chevron").length).toBe(2);
    expect(wrapper.findAll(".danx-tree-view-node__chevron-spacer").length).toBeGreaterThan(0);
  });

  it("rotates the chevron when the branch is expanded", () => {
    const wrapper = mountTree({ expanded: ["eng"] });
    expect(wrapper.find(".danx-tree-view-node__chevron").classes()).toContain("is-open");
  });

  it("swaps the branch icon between closed and open on expansion", () => {
    const collapsedIcon = mountTree().find(".danx-tree-view-node__icon").html();
    const expandedIcon = mountTree({ expanded: ["eng"] })
      .find(".danx-tree-view-node__icon")
      .html();
    expect(collapsedIcon).not.toBe(expandedIcon);
  });

  it("respects a custom per-node icon", () => {
    const wrapper = mount(DanxTreeView, {
      props: { nodes: [{ id: "x", label: "x", icon: "database" }] },
    });
    expect(wrapper.find(".danx-tree-view-node__icon").exists()).toBe(true);
  });
});

describe("DanxTreeView interaction (single select)", () => {
  it("expands a branch when its row is clicked and emits toggle", async () => {
    const wrapper = mountTree();
    await wrapper.find(".danx-tree-view-node__row").trigger("click");
    expect(wrapper.text()).toContain("Bob");
    const toggle = wrapper.emitted("toggle");
    expect(toggle).toBeTruthy();
    expect((toggle![0]![0] as TreeNode).id).toBe("eng");
    expect(toggle![0]![1]).toBe(true);
  });

  it("toggles a branch via the chevron without bubbling to row select", async () => {
    const wrapper = mountTree();
    await wrapper.find(".danx-tree-view-node__chevron").trigger("click");
    expect(wrapper.emitted("update:expanded")).toBeTruthy();
    expect(wrapper.emitted("update:selected")).toBeFalsy();
  });

  it("selects a leaf row and emits select + update:selected", async () => {
    const wrapper = mountTree({ expanded: ["eng"] });
    const rows = wrapper.findAll(".danx-tree-view-node__row");
    const leafRow = rows.find((r) => r.text().includes("Bob"))!;
    await leafRow.trigger("click");
    expect(wrapper.emitted("select")).toBeTruthy();
    expect((wrapper.emitted("select")![0]![0] as TreeNode).id).toBe("bob");
    expect(wrapper.emitted("update:selected")![0]).toEqual(["bob"]);
  });

  it("marks the selected row with is-selected", () => {
    const wrapper = mountTree({ selected: "carol" });
    const selectedRow = wrapper
      .findAll(".danx-tree-view-node__row")
      .find((r) => r.text().includes("Carol"))!;
    expect(selectedRow.classes()).toContain("is-selected");
  });

  it("replaces the prior selection when a different row is selected (single mode)", async () => {
    const wrapper = mountTree({ selected: "carol", expanded: ["eng"] });
    const bobRow = wrapper
      .findAll(".danx-tree-view-node__row")
      .find((r) => r.text().includes("Bob"))!;
    await bobRow.trigger("click");
    const emitted1 = wrapper.emitted("update:selected")!;
    expect(emitted1[emitted1.length - 1]).toEqual(["bob"]);
  });

  it("activates a row via the Enter key", async () => {
    const wrapper = mountTree();
    await wrapper.find(".danx-tree-view-node__row").trigger("keydown.enter");
    expect(wrapper.emitted("toggle")).toBeTruthy();
  });

  it("activates a row via the Space key", async () => {
    const wrapper = mountTree();
    await wrapper.find(".danx-tree-view-node__row").trigger("keydown.space");
    expect(wrapper.emitted("toggle")).toBeTruthy();
  });

  it("does not select or toggle a disabled node", async () => {
    const wrapper = mountTree({ expanded: ["eng"] });
    const disabledRow = wrapper
      .findAll(".danx-tree-view-node__row")
      .find((r) => r.text().includes("Disabled Node"))!;
    expect(disabledRow.classes()).toContain("is-disabled");
    await disabledRow.trigger("click");
    expect(wrapper.emitted("select")).toBeFalsy();
  });

  it("does not toggle a disabled branch via its chevron", async () => {
    const tree: TreeNode[] = [
      { id: "f", label: "f", disabled: true, children: [{ id: "c", label: "c" }] },
    ];
    const wrapper = mount(DanxTreeView, { props: { nodes: tree } });
    const before = wrapper.emitted("update:expanded")?.length ?? 0;
    await wrapper.find(".danx-tree-view-node__chevron").trigger("click");
    expect(wrapper.emitted("update:expanded")?.length ?? 0).toBe(before);
    expect(wrapper.find(".danx-tree-view-node__children").exists()).toBe(false);
  });
});

describe("DanxTreeView multi-select", () => {
  it("accumulates selections as an array", async () => {
    const wrapper = mountTree({ multiple: true, expanded: ["eng"] });
    const rows = wrapper.findAll(".danx-tree-view-node__row");
    await rows.find((r) => r.text().includes("Bob"))!.trigger("click");
    const emitted2 = wrapper.emitted("update:selected")!;
    expect(emitted2[emitted2.length - 1]).toEqual([["bob"]]);
  });

  it("toggles a node off when clicked again", async () => {
    const wrapper = mountTree({ multiple: true, selected: ["bob"], expanded: ["eng"] });
    const rows = wrapper.findAll(".danx-tree-view-node__row");
    await rows.find((r) => r.text().includes("Bob"))!.trigger("click");
    const emitted3 = wrapper.emitted("update:selected")!;
    expect(emitted3[emitted3.length - 1]).toEqual([[]]);
  });

  it("marks every selected row with is-selected", () => {
    const wrapper = mountTree({ multiple: true, selected: ["bob", "carol"], expanded: ["eng"] });
    const rows = wrapper.findAll(".danx-tree-view-node__row");
    expect(rows.find((r) => r.text().includes("Bob"))!.classes()).toContain("is-selected");
    expect(rows.find((r) => r.text().includes("Carol"))!.classes()).toContain("is-selected");
  });

  it("sets aria-multiselectable on the tree root", () => {
    const wrapper = mountTree({ multiple: true });
    expect(wrapper.find('[role="tree"]').attributes("aria-multiselectable")).toBe("true");
  });
});

describe("DanxTreeView selectable", () => {
  it("does not emit select when selectable is false", async () => {
    const wrapper = mountTree({ selectable: false, expanded: ["eng"] });
    const leafRow = wrapper
      .findAll(".danx-tree-view-node__row")
      .find((r) => r.text().includes("Bob"))!;
    await leafRow.trigger("click");
    expect(wrapper.emitted("select")).toBeFalsy();
    expect(leafRow.classes()).not.toContain("is-clickable");
  });

  it("renders no children list for an expanded branch that has none", () => {
    const wrapper = mountTree({ expanded: ["empty-team"] });
    const emptyRow = wrapper
      .findAll(".danx-tree-view-node")
      .find((n) => n.text().includes("Empty Team"))!;
    expect(emptyRow.find(".danx-tree-view-node__children").exists()).toBe(false);
  });
});

describe("DanxTreeView slots", () => {
  it("renders a custom #node slot", () => {
    const wrapper = mount(DanxTreeView, {
      props: { nodes: TREE },
      slots: {
        node: `<template #node="{ node }"><span class="custom">{{ node.label }}!</span></template>`,
      },
    });
    expect(wrapper.find(".custom").text()).toBe("Engineering!");
  });

  it("renders a custom #actions slot wrapper", () => {
    const wrapper = mount(DanxTreeView, {
      props: { nodes: TREE },
      slots: {
        actions: `<template #actions="{ node }"><button class="act">{{ node.id }}</button></template>`,
      },
    });
    expect(wrapper.find(".danx-tree-view-node__actions").exists()).toBe(true);
    expect(wrapper.find(".act").exists()).toBe(true);
  });

  it("omits the actions wrapper when no actions slot is provided", () => {
    const wrapper = mountTree();
    expect(wrapper.find(".danx-tree-view-node__actions").exists()).toBe(false);
  });
});

describe("DanxTreeView keyboard navigation", () => {
  function rowsByName(wrapper: ReturnType<typeof mountTree>) {
    return wrapper.findAll(".danx-tree-view-node__row");
  }

  function rowFor(wrapper: ReturnType<typeof mountTree>, text: string) {
    return rowsByName(wrapper).find((r) => r.text().includes(text))!;
  }

  it("only one row has tabindex 0 at a time (roving tabindex)", () => {
    const wrapper = mountTree({ expanded: ["eng"] });
    const rows = rowsByName(wrapper);
    const tabStops = rows.filter((r) => r.attributes("tabindex") === "0");
    expect(tabStops.length).toBe(1);
    expect(tabStops[0]!.text()).toContain("Engineering");
  });

  it("ArrowDown moves the tab stop to the next visible row", async () => {
    const wrapper = mountTree({ expanded: ["eng"] });
    await rowFor(wrapper, "Engineering").trigger("keydown", { key: "ArrowDown" });
    expect(rowFor(wrapper, "Frontend").attributes("tabindex")).toBe("0");
    expect(rowFor(wrapper, "Engineering").attributes("tabindex")).toBe("-1");
  });

  it("ArrowDown does not descend into a collapsed branch's children", async () => {
    const wrapper = mountTree();
    await rowFor(wrapper, "Engineering").trigger("keydown", { key: "ArrowDown" });
    expect(rowFor(wrapper, "Empty Team").attributes("tabindex")).toBe("0");
  });

  it("ArrowUp moves the tab stop to the previous visible row", async () => {
    const wrapper = mountTree({ expanded: ["eng", "frontend"] });
    await rowFor(wrapper, "Frontend").trigger("keydown", { key: "ArrowDown" });
    await rowFor(wrapper, "Alice").trigger("keydown", { key: "ArrowUp" });
    expect(rowFor(wrapper, "Frontend").attributes("tabindex")).toBe("0");
  });

  it("ArrowUp on the first row is a no-op", async () => {
    const wrapper = mountTree({ expanded: ["eng"] });
    await rowFor(wrapper, "Engineering").trigger("keydown", { key: "ArrowUp" });
    expect(rowFor(wrapper, "Engineering").attributes("tabindex")).toBe("0");
  });

  it("Home jumps to the first visible row", async () => {
    const wrapper = mountTree({ expanded: ["eng"] });
    await rowFor(wrapper, "Carol").trigger("keydown", { key: "End" });
    await rowFor(wrapper, "Carol").trigger("keydown", { key: "Home" });
    expect(rowFor(wrapper, "Engineering").attributes("tabindex")).toBe("0");
  });

  it("End jumps to the last visible row", async () => {
    const wrapper = mountTree({ expanded: ["eng"] });
    await rowFor(wrapper, "Engineering").trigger("keydown", { key: "End" });
    expect(rowFor(wrapper, "Carol").attributes("tabindex")).toBe("0");
  });

  it("ArrowRight expands a collapsed branch without moving focus", async () => {
    const wrapper = mountTree();
    await rowFor(wrapper, "Engineering").trigger("keydown", { key: "ArrowRight" });
    expect(wrapper.text()).toContain("Bob");
    expect(rowFor(wrapper, "Engineering").attributes("tabindex")).toBe("0");
    const toggle = wrapper.emitted("toggle");
    expect(toggle).toBeTruthy();
    expect(toggle![0]).toEqual([TREE[0], true]);
  });

  it("ArrowRight on an already-expanded branch moves focus to its first child", async () => {
    const wrapper = mountTree({ expanded: ["eng"] });
    await rowFor(wrapper, "Engineering").trigger("keydown", { key: "ArrowRight" });
    expect(rowFor(wrapper, "Frontend").attributes("tabindex")).toBe("0");
  });

  it("ArrowRight on a leaf node does nothing", async () => {
    const wrapper = mountTree({ expanded: ["eng"] });
    await rowFor(wrapper, "Frontend").trigger("keydown", { key: "ArrowDown" });
    await rowFor(wrapper, "Bob").trigger("keydown", { key: "ArrowRight" });
    expect(rowFor(wrapper, "Bob").attributes("tabindex")).toBe("0");
  });

  it("ArrowLeft collapses an expanded branch without moving focus", async () => {
    const wrapper = mountTree({ expanded: ["eng"] });
    await rowFor(wrapper, "Engineering").trigger("keydown", { key: "ArrowLeft" });
    expect(wrapper.text()).not.toContain("Bob");
    expect(rowFor(wrapper, "Engineering").attributes("tabindex")).toBe("0");
    const toggle = wrapper.emitted("toggle");
    expect(toggle).toBeTruthy();
    expect(toggle![0]).toEqual([TREE[0], false]);
  });

  it("ArrowLeft on a collapsed branch or leaf moves focus to the parent", async () => {
    const wrapper = mountTree({ expanded: ["eng"] });
    await rowFor(wrapper, "Bob").trigger("keydown", { key: "ArrowLeft" });
    expect(rowFor(wrapper, "Engineering").attributes("tabindex")).toBe("0");
  });

  it("ArrowLeft on a nested collapsed branch moves focus to its parent, not the root", async () => {
    const wrapper = mountTree({ expanded: ["eng", "frontend"] });
    await rowFor(wrapper, "Alice").trigger("keydown", { key: "ArrowLeft" });
    expect(rowFor(wrapper, "Frontend").attributes("tabindex")).toBe("0");
  });

  it("ArrowLeft on a root-level leaf/collapsed node is a no-op", async () => {
    const wrapper = mountTree();
    await rowFor(wrapper, "Engineering").trigger("keydown", { key: "ArrowLeft" });
    expect(rowFor(wrapper, "Engineering").attributes("tabindex")).toBe("0");
  });

  it("preserves Enter/Space activation alongside arrow navigation", async () => {
    const wrapper = mountTree({ expanded: ["eng"] });
    await rowFor(wrapper, "Bob").trigger("keydown.enter");
    expect(wrapper.emitted("select")).toBeTruthy();
  });

  it("ignores arrow keys on a disabled node", async () => {
    const wrapper = mountTree({ expanded: ["eng"] });
    await rowFor(wrapper, "Disabled Node").trigger("keydown", { key: "ArrowRight" });
    expect(wrapper.emitted("toggle")).toBeFalsy();
  });
});
