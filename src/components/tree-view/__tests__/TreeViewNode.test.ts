import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import TreeViewNode from "../TreeViewNode.vue";
import DanxTreeView from "../DanxTreeView.vue";
import type { TreeNode } from "../types";

/**
 * Tests targeting TreeViewNode branches not naturally hit through the root:
 * the inject guard, and the aria/tabindex attributes on rows.
 */

describe("TreeViewNode guard", () => {
  it("throws when used without a DanxTreeView provider", () => {
    expect(() =>
      mount(TreeViewNode, { props: { node: { id: "x", label: "x" }, depth: 0 } })
    ).toThrow("TreeViewNode must be used within a DanxTreeView");
  });
});

describe("TreeViewNode aria attributes", () => {
  const TREE: TreeNode[] = [
    { id: "branch", label: "branch", children: [{ id: "child", label: "child" }] },
    { id: "empty", label: "empty", children: [] },
    { id: "leaf", label: "leaf" },
  ];

  it("sets aria-expanded on a branch with children", () => {
    const wrapper = mount(DanxTreeView, { props: { nodes: TREE, expanded: ["branch"] } });
    const row = wrapper.findAll(".danx-tree-view-node__row")[0]!;
    expect(row.attributes("aria-expanded")).toBe("true");
  });

  it("omits aria-expanded on a branch without children", () => {
    const wrapper = mount(DanxTreeView, { props: { nodes: TREE } });
    const emptyRow = wrapper
      .findAll(".danx-tree-view-node__row")
      .find((r) => r.text().includes("empty"))!;
    expect(emptyRow.attributes("aria-expanded")).toBeUndefined();
  });

  it("sets tabindex -1 and aria-disabled on disabled nodes", () => {
    const wrapper = mount(DanxTreeView, {
      props: { nodes: [{ id: "d", label: "d", disabled: true }] },
    });
    const row = wrapper.find(".danx-tree-view-node__row");
    expect(row.attributes("tabindex")).toBe("-1");
    expect(row.attributes("aria-disabled")).toBe("true");
  });

  it("sets tabindex 0 on enabled nodes", () => {
    const wrapper = mount(DanxTreeView, { props: { nodes: TREE } });
    expect(wrapper.find(".danx-tree-view-node__row").attributes("tabindex")).toBe("0");
  });
});
