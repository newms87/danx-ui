import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { mount, type VueWrapper } from "@vue/test-utils";
import { isFolderNode, useFileExplorer } from "../useFileExplorer";
import type { FileNode } from "../types";

/**
 * Tests for the useFileExplorer composable.
 *
 * The composable uses `watch`, so it must be created inside a mounted
 * component's setup to have an active effect scope (zero-warning policy).
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
    ],
  },
  { id: "empty-folder", name: "empty", type: "folder" },
  { id: "readme", name: "README.md" },
];

const mountedWrappers: VueWrapper[] = [];

interface CreateOptions {
  nodes?: FileNode[];
  expanded?: string[];
  selected?: string | null;
  storageKey?: string;
  defaultExpanded?: boolean;
  foldersOnly?: boolean;
  selectable?: boolean;
  filterQuery?: string;
}

function createExplorer(opts: CreateOptions = {}) {
  const nodes = ref(opts.nodes ?? TREE);
  const expanded = ref<string[]>(opts.expanded ?? []);
  const selected = ref<string | null>(opts.selected ?? null);
  const foldersOnly = ref(opts.foldersOnly ?? false);
  const selectable = ref(opts.selectable ?? true);
  const filterQuery = ref(opts.filterQuery ?? "");

  let result!: ReturnType<typeof useFileExplorer>;
  const wrapper = mount(
    defineComponent({
      setup() {
        result = useFileExplorer(nodes, expanded, selected, {
          storageKey: opts.storageKey,
          defaultExpanded: opts.defaultExpanded,
          foldersOnly,
          selectable,
          filterQuery,
        });
        return {};
      },
      template: "<div />",
    })
  );
  mountedWrappers.push(wrapper);
  return { ...result, nodes, expanded, selected, foldersOnly, selectable, filterQuery };
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  for (const w of mountedWrappers) w.unmount();
  mountedWrappers.length = 0;
  vi.restoreAllMocks();
});

describe("isFolderNode", () => {
  it("treats explicit type folder as a folder", () => {
    expect(isFolderNode({ id: "a", name: "a", type: "folder" })).toBe(true);
  });

  it("treats explicit type file as a file even with children", () => {
    expect(isFolderNode({ id: "a", name: "a", type: "file", children: [] })).toBe(false);
  });

  it("infers folder from presence of a children array", () => {
    expect(isFolderNode({ id: "a", name: "a", children: [] })).toBe(true);
  });

  it("infers file when no type and no children", () => {
    expect(isFolderNode({ id: "a", name: "a" })).toBe(false);
  });
});

describe("useFileExplorer initialization", () => {
  it("starts with nothing expanded by default", () => {
    const { isExpanded } = createExplorer();
    expect(isExpanded("src")).toBe(false);
  });

  it("expands all folders when defaultExpanded is true", () => {
    const { isExpanded, expanded } = createExplorer({ defaultExpanded: true });
    expect(isExpanded("src")).toBe(true);
    expect(isExpanded("components")).toBe(true);
    expect(isExpanded("empty-folder")).toBe(true);
    expect(expanded.value).not.toContain("index.ts");
    expect(expanded.value).not.toContain("readme");
  });

  it("initializes from a provided expanded v-model array", () => {
    const { isExpanded } = createExplorer({ expanded: ["src"] });
    expect(isExpanded("src")).toBe(true);
    expect(isExpanded("components")).toBe(false);
  });

  it("syncs the expanded v-model out on init", () => {
    const { expanded } = createExplorer({ expanded: ["src"] });
    expect(expanded.value).toEqual(["src"]);
  });
});

describe("useFileExplorer persistence", () => {
  it("persists expanded IDs to localStorage on toggle", () => {
    const { toggle } = createExplorer({ storageKey: "fe-test" });
    toggle({ id: "src", name: "src", children: [] });
    expect(JSON.parse(localStorage.getItem("fe-test")!)).toEqual({ expandedIds: ["src"] });
  });

  it("restores expanded IDs from localStorage over the v-model", () => {
    localStorage.setItem("fe-test", JSON.stringify({ expandedIds: ["components"] }));
    const { isExpanded } = createExplorer({ storageKey: "fe-test", expanded: ["src"] });
    expect(isExpanded("components")).toBe(true);
    expect(isExpanded("src")).toBe(false);
  });

  it("restore takes precedence over defaultExpanded", () => {
    localStorage.setItem("fe-test", JSON.stringify({ expandedIds: [] }));
    const { isExpanded } = createExplorer({ storageKey: "fe-test", defaultExpanded: true });
    expect(isExpanded("src")).toBe(false);
  });

  it("ignores invalid JSON in storage", () => {
    localStorage.setItem("fe-test", "{not json");
    const { isExpanded } = createExplorer({ storageKey: "fe-test", expanded: ["src"] });
    expect(isExpanded("src")).toBe(true);
  });

  it("ignores a non-array expandedIds value", () => {
    localStorage.setItem("fe-test", JSON.stringify({ expandedIds: "nope" }));
    const { isExpanded } = createExplorer({ storageKey: "fe-test", expanded: ["src"] });
    expect(isExpanded("src")).toBe(true);
  });

  it("filters out non-string IDs from stored state", () => {
    localStorage.setItem("fe-test", JSON.stringify({ expandedIds: ["src", 42, null] }));
    const { isExpanded, expanded } = createExplorer({ storageKey: "fe-test" });
    expect(isExpanded("src")).toBe(true);
    expect(expanded.value).toEqual(["src"]);
  });

  it("does not throw when localStorage.setItem fails", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(() => {
      const { toggle } = createExplorer({ storageKey: "fe-test" });
      toggle({ id: "src", name: "src", children: [] });
    }).not.toThrow();
    spy.mockRestore();
  });

  it("does nothing with storage when no storageKey is given", () => {
    const { toggle } = createExplorer();
    toggle({ id: "src", name: "src", children: [] });
    expect(localStorage.length).toBe(0);
  });
});

describe("useFileExplorer external control", () => {
  it("reacts to external expanded v-model updates", async () => {
    const { isExpanded, expanded } = createExplorer();
    expanded.value = ["src"];
    await nextTick();
    expect(isExpanded("src")).toBe(true);
  });

  it("ignores an external update equal to current state", async () => {
    const { expanded, isExpanded } = createExplorer({ expanded: ["src"] });
    expanded.value = ["src"];
    await nextTick();
    expect(isExpanded("src")).toBe(true);
  });

  it("persists when external update differs", async () => {
    const { expanded } = createExplorer({ storageKey: "fe-test" });
    expanded.value = ["src"];
    await nextTick();
    expect(JSON.parse(localStorage.getItem("fe-test")!).expandedIds).toEqual(["src"]);
  });
});

describe("useFileExplorer toggle + selection", () => {
  it("toggle expands and returns true", () => {
    const { toggle, isExpanded } = createExplorer();
    expect(toggle({ id: "src", name: "src", children: [] })).toBe(true);
    expect(isExpanded("src")).toBe(true);
  });

  it("toggle collapses an expanded folder and returns false", () => {
    const { toggle, isExpanded } = createExplorer({ expanded: ["src"] });
    expect(toggle({ id: "src", name: "src", children: [] })).toBe(false);
    expect(isExpanded("src")).toBe(false);
  });

  it("select sets the selected id", () => {
    const { select, isSelected, selected } = createExplorer();
    select({ id: "readme", name: "README.md" });
    expect(isSelected("readme")).toBe(true);
    expect(selected.value).toBe("readme");
  });

  it("select is a no-op when not selectable", () => {
    const { select, selected } = createExplorer({ selectable: false });
    select({ id: "readme", name: "README.md" });
    expect(selected.value).toBeNull();
  });

  it("select is a no-op for disabled nodes", () => {
    const { select, selected } = createExplorer();
    select({ id: "readme", name: "README.md", disabled: true });
    expect(selected.value).toBeNull();
  });
});

describe("useFileExplorer visibility filtering", () => {
  it("returns all children when not folders-only", () => {
    const { visibleChildren } = createExplorer();
    expect(visibleChildren(TREE[0]!).map((n) => n.id)).toEqual(["components", "index.ts"]);
  });

  it("returns an empty array for a node without children", () => {
    const { visibleChildren } = createExplorer();
    expect(visibleChildren({ id: "x", name: "x" })).toEqual([]);
  });

  it("filters files from children in folders-only mode", () => {
    const { visibleChildren } = createExplorer({ foldersOnly: true });
    expect(visibleChildren(TREE[0]!).map((n) => n.id)).toEqual(["components"]);
  });

  it("returns all root nodes when not folders-only", () => {
    const { visibleNodes } = createExplorer();
    expect(visibleNodes.value.map((n) => n.id)).toEqual(["src", "empty-folder", "readme"]);
  });

  it("filters file root nodes in folders-only mode", () => {
    const { visibleNodes } = createExplorer({ foldersOnly: true });
    expect(visibleNodes.value.map((n) => n.id)).toEqual(["src", "empty-folder"]);
  });
});

describe("useFileExplorer setExpanded", () => {
  it("expands and reports a change", () => {
    const { setExpanded, isExpanded } = createExplorer();
    expect(setExpanded({ id: "src", name: "src", children: [] }, true)).toBe(true);
    expect(isExpanded("src")).toBe(true);
  });

  it("is a no-op and reports no change when already in the target state", () => {
    const { setExpanded } = createExplorer({ expanded: ["src"] });
    expect(setExpanded({ id: "src", name: "src", children: [] }, true)).toBe(false);
  });

  it("collapses and reports a change", () => {
    const { setExpanded, isExpanded } = createExplorer({ expanded: ["src"] });
    expect(setExpanded({ id: "src", name: "src", children: [] }, false)).toBe(true);
    expect(isExpanded("src")).toBe(false);
  });
});

describe("useFileExplorer flatRows + roving focus", () => {
  it("flattens only visible rows, excluding collapsed children", () => {
    const { flatRows } = createExplorer();
    expect(flatRows.value.map((r) => r.id)).toEqual(["src", "empty-folder", "readme"]);
  });

  it("includes children of an expanded folder, in-order, with depth and parentId", () => {
    const { flatRows } = createExplorer({ expanded: ["src"] });
    expect(flatRows.value.map((r) => ({ id: r.id, depth: r.depth, parentId: r.parentId }))).toEqual(
      [
        { id: "src", depth: 0, parentId: null },
        { id: "components", depth: 1, parentId: "src" },
        { id: "index.ts", depth: 1, parentId: "src" },
        { id: "empty-folder", depth: 0, parentId: null },
        { id: "readme", depth: 0, parentId: null },
      ]
    );
  });

  it("recurses into nested expanded folders", () => {
    const { flatRows } = createExplorer({ expanded: ["src", "components"] });
    expect(flatRows.value.map((r) => r.id)).toEqual([
      "src",
      "components",
      "Button.vue",
      "index.ts",
      "empty-folder",
      "readme",
    ]);
  });

  it("respects folders-only filtering in the flattened list", () => {
    const { flatRows } = createExplorer({ expanded: ["src"], foldersOnly: true });
    expect(flatRows.value.map((r) => r.id)).toEqual(["src", "components", "empty-folder"]);
  });

  it("defaults focus to the first visible row", () => {
    const { isFocused } = createExplorer();
    expect(isFocused("src")).toBe(true);
    expect(isFocused("readme")).toBe(false);
  });

  it("setFocused moves the focus target", () => {
    const { setFocused, isFocused } = createExplorer();
    setFocused("readme");
    expect(isFocused("readme")).toBe(true);
    expect(isFocused("src")).toBe(false);
  });

  it("falls back to the first row when the focused id is no longer visible", async () => {
    const { setFocused, isFocused, expanded } = createExplorer({ expanded: ["src"] });
    setFocused("index.ts");
    expanded.value = [];
    await nextTick();
    expect(isFocused("index.ts")).toBe(false);
    expect(isFocused("src")).toBe(true);
  });
});

describe("useFileExplorer name filtering", () => {
  it("keeps every node when the query is empty", () => {
    const { visibleNodes } = createExplorer();
    expect(visibleNodes.value.map((n) => n.id)).toEqual(["src", "empty-folder", "readme"]);
  });

  it("filters root nodes to only matching branches, case-insensitively", async () => {
    const { visibleNodes, filterQuery } = createExplorer();
    filterQuery.value = "BUTTON";
    await nextTick();
    expect(visibleNodes.value.map((n) => n.id)).toEqual(["src"]);
  });

  it("keeps a folder's full children when the folder itself matches", async () => {
    const { visibleNodes, filterQuery } = createExplorer();
    filterQuery.value = "src";
    await nextTick();
    const src = visibleNodes.value.find((n) => n.id === "src")!;
    expect(src.children?.map((c) => c.id)).toEqual(["components", "index.ts"]);
  });

  it("prunes a matched folder's children to only matching descendants", async () => {
    const { visibleNodes, filterQuery } = createExplorer();
    filterQuery.value = "button";
    await nextTick();
    const src = visibleNodes.value.find((n) => n.id === "src")!;
    expect(src.children?.map((c) => c.id)).toEqual(["components"]);
    const components = src.children!.find((n) => n.id === "components")!;
    expect(components.children?.map((c) => c.id)).toEqual(["Button.vue"]);
  });

  it("auto-expands ancestor folders of every match", async () => {
    const { isExpanded, filterQuery } = createExplorer();
    filterQuery.value = "button";
    await nextTick();
    expect(isExpanded("src")).toBe(true);
    expect(isExpanded("components")).toBe(true);
  });

  it("restores the pre-filter expansion state when the query is cleared", async () => {
    const { isExpanded, filterQuery } = createExplorer({ expanded: ["src"] });
    expect(isExpanded("src")).toBe(true);
    expect(isExpanded("components")).toBe(false);

    filterQuery.value = "button";
    await nextTick();
    expect(isExpanded("components")).toBe(true);

    filterQuery.value = "";
    await nextTick();
    expect(isExpanded("src")).toBe(true);
    expect(isExpanded("components")).toBe(false);
  });

  it("does not restore expansion for folders manually toggled while filtering", async () => {
    const { isExpanded, toggle, filterQuery } = createExplorer();
    filterQuery.value = "button";
    await nextTick();
    toggle({ id: "empty-folder", name: "empty", type: "folder" });
    filterQuery.value = "";
    await nextTick();
    expect(isExpanded("empty-folder")).toBe(false);
  });

  it("matchRange returns the matched substring range for a matching node", async () => {
    const { matchRange, filterQuery } = createExplorer();
    filterQuery.value = "utto";
    await nextTick();
    expect(matchRange({ id: "Button.vue", name: "Button.vue" })).toEqual({ start: 1, end: 5 });
  });

  it("matchRange returns null when there is no active query or no match", async () => {
    const { matchRange, filterQuery } = createExplorer();
    expect(matchRange({ id: "readme", name: "README.md" })).toBeNull();
    filterQuery.value = "zzz";
    await nextTick();
    expect(matchRange({ id: "readme", name: "README.md" })).toBeNull();
  });
});
