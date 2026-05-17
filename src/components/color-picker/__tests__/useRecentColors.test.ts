import { describe, it, expect, beforeEach } from "vitest";
import { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import { useRecentColors } from "../useRecentColors";

const wrappers: ReturnType<typeof mount>[] = [];

function create(options: Parameters<typeof useRecentColors>[0] = {}) {
  let api!: ReturnType<typeof useRecentColors>;
  const wrapper = mount(
    defineComponent({
      setup() {
        api = useRecentColors(options);
        return {};
      },
      template: "<div />",
    })
  );
  wrappers.push(wrapper);
  return api;
}

describe("useRecentColors", () => {
  beforeEach(() => {
    window.localStorage.clear();
    for (const w of wrappers) w.unmount();
    wrappers.length = 0;
  });

  it("starts empty without a storage key", () => {
    const r = create();
    expect(r.colors.value).toEqual([]);
  });

  it("push prepends and dedupes case-insensitively", () => {
    const r = create();
    r.push("#abcdef");
    r.push("#123456");
    r.push("#ABCDEF");
    expect(r.colors.value).toEqual(["#ABCDEF", "#123456"]);
  });

  it("respects the limit", () => {
    const r = create({ limit: 3 });
    r.push("#000000");
    r.push("#111111");
    r.push("#222222");
    r.push("#333333");
    expect(r.colors.value).toEqual(["#333333", "#222222", "#111111"]);
  });

  it("persists to localStorage when storageKey supplied", () => {
    const r = create({ storageKey: "test-a" });
    r.push("#aabbcc");
    const raw = window.localStorage.getItem("danx-color-picker:recent:test-a");
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toEqual(["#aabbcc"]);
  });

  it("re-hydrates from localStorage on mount", () => {
    window.localStorage.setItem(
      "danx-color-picker:recent:test-b",
      JSON.stringify(["#111", "#222"])
    );
    const r = create({ storageKey: "test-b" });
    expect(r.colors.value).toEqual(["#111", "#222"]);
  });

  it("clear() empties + persists", () => {
    const r = create({ storageKey: "test-c" });
    r.push("#abcdef");
    r.clear();
    expect(r.colors.value).toEqual([]);
    expect(window.localStorage.getItem("danx-color-picker:recent:test-c")).toBe("[]");
  });

  it("ignores empty pushes", () => {
    const r = create();
    r.push("");
    expect(r.colors.value).toEqual([]);
  });

  it("handles malformed localStorage gracefully", () => {
    window.localStorage.setItem("danx-color-picker:recent:test-d", "{not-json");
    const r = create({ storageKey: "test-d" });
    expect(r.colors.value).toEqual([]);
  });

  it("returns empty when stored payload is a non-array JSON value", () => {
    window.localStorage.setItem("danx-color-picker:recent:test-obj", JSON.stringify({ a: 1 }));
    const r = create({ storageKey: "test-obj" });
    expect(r.colors.value).toEqual([]);
  });

  it("re-reads when storageKey changes", async () => {
    const { defineComponent: defC, ref: refOf } = await import("vue");
    let api!: ReturnType<typeof useRecentColors>;
    const keyRef = refOf<string | undefined>("first");
    window.localStorage.setItem("danx-color-picker:recent:first", JSON.stringify(["#first"]));
    window.localStorage.setItem("danx-color-picker:recent:second", JSON.stringify(["#second"]));
    const wrapper = mount(
      defC({
        setup() {
          api = useRecentColors({
            get storageKey() {
              return keyRef.value;
            },
          });
          return {};
        },
        template: "<div />",
      })
    );
    wrappers.push(wrapper);
    expect(api.colors.value).toEqual(["#first"]);
    keyRef.value = "second";
    await wrapper.vm.$nextTick();
    expect(api.colors.value).toEqual(["#second"]);
  });

  it("ignores non-string entries in stored payload", () => {
    window.localStorage.setItem(
      "danx-color-picker:recent:test-e",
      JSON.stringify(["#abc", 42, null, "#def"])
    );
    const r = create({ storageKey: "test-e" });
    expect(r.colors.value).toEqual(["#abc", "#def"]);
  });
});
