import { describe, it, expect, afterEach } from "vitest";
import { defineComponent, ref } from "vue";
import { mount, type VueWrapper } from "@vue/test-utils";
import { useTreeView } from "../useTreeView";
import { isBranchNode, type TreeNode } from "../types";

/**
 * Tests for the useTreeView composable.
 *
 * The composable uses `watch`, so it must be created inside a mounted
 * component's setup to have an active effect scope (zero-warning policy).
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
    ],
  },
  { id: "empty-team", label: "Empty Team", children: [] },
  { id: "carol", label: "Carol" },
];

const mountedWrappers: VueWrapper[] = [];

interface CreateOptions {
  nodes?: TreeNode[];
  expanded?: string[];
  selected?: string | string[] | null;
  defaultExpanded?: boolean;
  selectable?: boolean;
  multiple?: boolean;
}

function createTreeView(opts: CreateOptions = {}) {
  const nodes = ref(opts.nodes ?? TREE);
  const expanded = ref<string[]>(opts.expanded ?? []);
  const selected = ref<string | string[] | null>(opts.selected ?? (opts.multiple ? [] : null));
  const selectable = ref(opts.selectable ?? true);
  const multiple = ref(opts.multiple ?? false);

  let result!: ReturnType<typeof useTreeView>;
  const wrapper = mount(
    defineComponent({
      setup() {
        result = useTreeView(nodes, expanded, selected, {
          defaultExpanded: opts.defaultExpanded,
          selectable,
          multiple,
        });
        return {};
      },
      template: "<div />",
    })
  );
  mountedWrappers.push(wrapper);
  return { ...result, nodes, expanded, selected, selectable, multiple };
}

afterEach(() => {
  for (const w of mountedWrappers) w.unmount();
  mountedWrappers.length = 0;
});

describe("isBranchNode", () => {
  it("treats presence of a children array as a branch", () => {
    expect(isBranchNode({ id: "a", label: "a", children: [] })).toBe(true);
  });

  it("treats absence of children as a leaf", () => {
    expect(isBranchNode({ id: "a", label: "a" })).toBe(false);
  });
});

describe("useTreeView initialization", () => {
  it("starts with nothing expanded by default", () => {
    const { isExpanded } = createTreeView();
    expect(isExpanded("eng")).toBe(false);
  });

  it("expands all branches when defaultExpanded is true", () => {
    const { isExpanded, expanded } = createTreeView({ defaultExpanded: true });
    expect(isExpanded("eng")).toBe(true);
    expect(isExpanded("frontend")).toBe(true);
    expect(isExpanded("empty-team")).toBe(true);
    expect(expanded.value).not.toContain("alice");
    expect(expanded.value).not.toContain("carol");
  });

  it("initializes from a provided expanded v-model array", () => {
    const { isExpanded } = createTreeView({ expanded: ["eng"] });
    expect(isExpanded("eng")).toBe(true);
    expect(isExpanded("frontend")).toBe(false);
  });

  it("syncs the expanded v-model out on init", () => {
    const { expanded } = createTreeView({ expanded: ["eng"] });
    expect(expanded.value).toEqual(["eng"]);
  });

  it("honors external v-model:expanded updates", async () => {
    const { isExpanded, expanded } = createTreeView();
    expanded.value = ["eng"];
    await Promise.resolve();
    expect(isExpanded("eng")).toBe(true);
  });
});

describe("useTreeView single-select", () => {
  it("selects a node id, replacing any prior selection", () => {
    const { select, isSelected, selected } = createTreeView();
    select({ id: "bob", label: "Bob" });
    expect(isSelected("bob")).toBe(true);
    expect(selected.value).toBe("bob");
    select({ id: "carol", label: "Carol" });
    expect(isSelected("bob")).toBe(false);
    expect(selected.value).toBe("carol");
  });

  it("does not select a disabled node", () => {
    const { select, isSelected } = createTreeView();
    select({ id: "bob", label: "Bob", disabled: true });
    expect(isSelected("bob")).toBe(false);
  });

  it("does not select when selectable is false", () => {
    const { select, isSelected } = createTreeView({ selectable: false });
    select({ id: "bob", label: "Bob" });
    expect(isSelected("bob")).toBe(false);
  });

  it("honors external v-model:selected updates", async () => {
    const { isSelected, selected } = createTreeView();
    selected.value = "carol";
    await Promise.resolve();
    expect(isSelected("carol")).toBe(true);
  });
});

describe("useTreeView multi-select", () => {
  it("accumulates selections as an array", () => {
    const { select, isSelected, selected } = createTreeView({ multiple: true });
    select({ id: "bob", label: "Bob" });
    select({ id: "carol", label: "Carol" });
    expect(isSelected("bob")).toBe(true);
    expect(isSelected("carol")).toBe(true);
    expect(selected.value).toEqual(["bob", "carol"]);
  });

  it("toggles a node off when selected again", () => {
    const { select, isSelected } = createTreeView({ multiple: true, selected: ["bob"] });
    select({ id: "bob", label: "Bob" });
    expect(isSelected("bob")).toBe(false);
  });
});

describe("useTreeView toggle/setExpanded", () => {
  it("toggle flips expansion state and returns the new value", () => {
    const { toggle, isExpanded } = createTreeView();
    const result = toggle(TREE[0]!);
    expect(result).toBe(true);
    expect(isExpanded("eng")).toBe(true);
  });

  it("setExpanded returns false when the state does not change", () => {
    const { setExpanded } = createTreeView();
    expect(setExpanded(TREE[0]!, false)).toBe(false);
  });
});

describe("useTreeView flatRows", () => {
  it("only includes visible (expanded ancestor chain) rows", () => {
    const { flatRows } = createTreeView({ expanded: ["eng"] });
    const ids = flatRows.value.map((r) => r.id);
    expect(ids).toEqual(["eng", "frontend", "bob", "empty-team", "carol"]);
  });

  it("descends further when nested branches are expanded", () => {
    const { flatRows } = createTreeView({ expanded: ["eng", "frontend"] });
    const ids = flatRows.value.map((r) => r.id);
    expect(ids).toContain("alice");
  });

  it("tracks depth and parentId per row", () => {
    const { flatRows } = createTreeView({ expanded: ["eng", "frontend"] });
    const alice = flatRows.value.find((r) => r.id === "alice")!;
    expect(alice.depth).toBe(2);
    expect(alice.parentId).toBe("frontend");
  });
});

describe("useTreeView focus", () => {
  it("defaults focus to the first row", () => {
    const { isFocused } = createTreeView();
    expect(isFocused("eng")).toBe(true);
  });

  it("moves focus via setFocused", () => {
    const { setFocused, isFocused } = createTreeView();
    setFocused("empty-team");
    expect(isFocused("empty-team")).toBe(true);
    expect(isFocused("eng")).toBe(false);
  });

  it("has no focus target when there are no rows", () => {
    const { isFocused } = createTreeView({ nodes: [] });
    expect(isFocused("anything")).toBe(false);
  });
});
