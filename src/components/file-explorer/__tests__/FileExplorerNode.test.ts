import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import FileExplorerNode from "../FileExplorerNode.vue";
import DanxFileExplorer from "../DanxFileExplorer.vue";
import type { FileNode } from "../types";

/**
 * Tests targeting FileExplorerNode branches not naturally hit through the root:
 * the inject guard, and the aria/tabindex attributes on rows.
 */

describe("FileExplorerNode guard", () => {
  it("throws when used without a DanxFileExplorer provider", () => {
    expect(() =>
      mount(FileExplorerNode, { props: { node: { id: "x", name: "x" }, depth: 0 } })
    ).toThrow("FileExplorerNode must be used within a DanxFileExplorer");
  });
});

describe("FileExplorerNode aria attributes", () => {
  const TREE: FileNode[] = [
    { id: "folder", name: "folder", children: [{ id: "child", name: "child" }] },
    { id: "empty", name: "empty", type: "folder" },
    { id: "file", name: "file" },
  ];

  it("sets aria-expanded on a folder with children", () => {
    const wrapper = mount(DanxFileExplorer, { props: { nodes: TREE, expanded: ["folder"] } });
    const row = wrapper.findAll(".danx-file-explorer-node__row")[0]!;
    expect(row.attributes("aria-expanded")).toBe("true");
  });

  it("omits aria-expanded on a folder without children", () => {
    const wrapper = mount(DanxFileExplorer, { props: { nodes: TREE } });
    const emptyRow = wrapper
      .findAll(".danx-file-explorer-node__row")
      .find((r) => r.text().includes("empty"))!;
    expect(emptyRow.attributes("aria-expanded")).toBeUndefined();
  });

  it("sets tabindex -1 and aria-disabled on disabled nodes", () => {
    const wrapper = mount(DanxFileExplorer, {
      props: { nodes: [{ id: "d", name: "d", disabled: true }] },
    });
    const row = wrapper.find(".danx-file-explorer-node__row");
    expect(row.attributes("tabindex")).toBe("-1");
    expect(row.attributes("aria-disabled")).toBe("true");
  });

  it("sets tabindex 0 on enabled nodes", () => {
    const wrapper = mount(DanxFileExplorer, { props: { nodes: TREE } });
    expect(wrapper.find(".danx-file-explorer-node__row").attributes("tabindex")).toBe("0");
  });
});
