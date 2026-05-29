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
}

function createExplorer(opts: CreateOptions = {}) {
  const nodes = ref(opts.nodes ?? TREE);
  const expanded = ref<string[]>(opts.expanded ?? []);
  const selected = ref<string | null>(opts.selected ?? null);
  const foldersOnly = ref(opts.foldersOnly ?? false);
  const selectable = ref(opts.selectable ?? true);

  let result!: ReturnType<typeof useFileExplorer>;
  const wrapper = mount(
    defineComponent({
      setup() {
        result = useFileExplorer(nodes, expanded, selected, {
          storageKey: opts.storageKey,
          defaultExpanded: opts.defaultExpanded,
          foldersOnly,
          selectable,
        });
        return {};
      },
      template: "<div />",
    })
  );
  mountedWrappers.push(wrapper);
  return { ...result, nodes, expanded, selected, foldersOnly, selectable };
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
