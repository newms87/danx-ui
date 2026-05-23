import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import DanxFileViewerContinuous from "../DanxFileViewerContinuous.vue";
import { makeFile, makeFiles } from "../../danx-file/__tests__/test-helpers";

const wrappers: VueWrapper[] = [];
let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  const vueWarns = warnSpy.mock.calls.filter((args: unknown[]) =>
    args.some((a: unknown) => typeof a === "string" && a.startsWith("[Vue warn]"))
  );
  expect(vueWarns, "expected zero [Vue warn] in test").toEqual([]);
  while (wrappers.length > 0) wrappers.pop()?.unmount();
  warnSpy.mockRestore();
});

async function mountContinuous(props: Record<string, unknown> = {}) {
  const files = (props.files as ReturnType<typeof makeFiles>) ?? makeFiles(3);
  const wrapper = mount(DanxFileViewerContinuous, {
    props: {
      files,
      activeFileId: files[0]!.id,
      ...props,
    },
    attachTo: document.body,
  });
  wrappers.push(wrapper);
  await nextTick();
  await nextTick();
  return wrapper;
}

describe("DanxFileViewerContinuous", () => {
  it("renders a DanxVirtualScroll wrapper", async () => {
    const wrapper = await mountContinuous();
    const vs = wrapper.findComponent({ name: "DanxVirtualScroll" });
    expect(vs.exists()).toBe(true);
    expect(vs.props("direction")).toBe("vertical");
  });

  it("renders an item per visible file", async () => {
    const wrapper = await mountContinuous();
    expect(wrapper.findAll(".danx-file-continuous__item").length).toBeGreaterThan(0);
  });

  it("scrollPosition derives from activeFileId", async () => {
    const files = makeFiles(5);
    const wrapper = await mountContinuous({ files, activeFileId: files[2]!.id });
    const vs = wrapper.findComponent({ name: "DanxVirtualScroll" });
    expect(vs.props("scrollPosition")).toBe(2);
  });

  it("scrollPosition falls back to 0 when activeFileId is unknown", async () => {
    const files = makeFiles(3);
    const wrapper = await mountContinuous({ files, activeFileId: "missing" });
    const vs = wrapper.findComponent({ name: "DanxVirtualScroll" });
    expect(vs.props("scrollPosition")).toBe(0);
  });

  it("emits update:activeFileId when scroll position changes", async () => {
    const files = makeFiles(5);
    const wrapper = await mountContinuous({ files, activeFileId: files[0]!.id });
    const vs = wrapper.findComponent({ name: "DanxVirtualScroll" });
    vs.vm.$emit("update:scrollPosition", 3);
    await nextTick();
    const emits = wrapper.emitted("update:activeFileId");
    expect(emits?.[emits.length - 1]).toEqual([files[3]!.id]);
  });

  it("does not emit when scrolling to the current active index", async () => {
    const files = makeFiles(3);
    const wrapper = await mountContinuous({ files, activeFileId: files[1]!.id });
    const vs = wrapper.findComponent({ name: "DanxVirtualScroll" });
    vs.vm.$emit("update:scrollPosition", 1);
    await nextTick();
    expect(wrapper.emitted("update:activeFileId")).toBeUndefined();
  });

  it("does not emit when scroll position points to an out-of-range index", async () => {
    const files = makeFiles(3);
    const wrapper = await mountContinuous({ files, activeFileId: files[0]!.id });
    const vs = wrapper.findComponent({ name: "DanxVirtualScroll" });
    vs.vm.$emit("update:scrollPosition", 99);
    await nextTick();
    expect(wrapper.emitted("update:activeFileId")).toBeUndefined();
  });

  it("snaps to first file when active becomes invalid after files change", async () => {
    const files = makeFiles(3);
    const wrapper = await mountContinuous({ files, activeFileId: files[1]!.id });
    const newFiles = [makeFile("x"), makeFile("y")];
    await wrapper.setProps({ files: newFiles });
    await nextTick();
    const emits = wrapper.emitted("update:activeFileId");
    expect(emits?.[emits.length - 1]).toEqual(["x"]);
  });

  it("does not snap when active file is still present after files change", async () => {
    const files = makeFiles(3);
    const wrapper = await mountContinuous({ files, activeFileId: files[1]!.id });
    const newFiles = [files[1]!, makeFile("z")];
    await wrapper.setProps({ files: newFiles });
    await nextTick();
    expect(wrapper.emitted("update:activeFileId")).toBeUndefined();
  });

  it("does not snap when files becomes empty", async () => {
    const wrapper = await mountContinuous({
      files: makeFiles(2),
      activeFileId: "1",
    });
    await wrapper.setProps({ files: [] });
    await nextTick();
    expect(wrapper.emitted("update:activeFileId")).toBeUndefined();
  });
});
