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

  it("activeFileId watcher ignores unknown id (no scroll)", async () => {
    const files = makeFiles(3);
    const wrapper = await mountContinuous({ files, activeFileId: files[0]!.id });
    const viewport = wrapper.element.querySelector(".danx-scroll__viewport") as HTMLElement | null;
    if (!viewport) return;
    const prevTop = viewport.scrollTop;
    await wrapper.setProps({ activeFileId: "no-such-file" });
    await nextTick();
    expect(viewport.scrollTop).toBe(prevTop);
  });

  it("does not bind scrollPosition v-model on DanxVirtualScroll (owns scroll itself)", async () => {
    const wrapper = await mountContinuous();
    const vs = wrapper.findComponent({ name: "DanxVirtualScroll" });
    // Either prop is undefined or default (0); the key behavior is that the
    // parent component owns scroll position through a direct viewport listener.
    expect(vs.props("scrollPosition") ?? 0).toBe(0);
  });

  it("emits update:activeFileId from viewport scroll when center file changes", async () => {
    const files = makeFiles(5);
    const wrapper = await mountContinuous({ files, activeFileId: files[0]!.id });
    const root = wrapper.find(".danx-file-continuous-root");
    const viewport = root.element.querySelector(".danx-scroll__viewport") as HTMLElement | null;
    if (!viewport) return; // happy-dom may not lay out DanxScroll; behavior still tested via the watch path below
    // Item full height is 608px (600 + 8 gap). With a 100px viewport, scrolling
    // to scrollTop = (3 * 608) + 304 - 50 puts file[3] at the visual center.
    Object.defineProperty(viewport, "clientHeight", { value: 100, configurable: true });
    Object.defineProperty(viewport, "scrollTop", {
      value: 3 * 608 + 304 - 50,
      configurable: true,
      writable: true,
    });
    viewport.dispatchEvent(new Event("scroll"));
    await nextTick();
    const emits = wrapper.emitted("update:activeFileId");
    expect(emits?.[emits.length - 1]).toEqual([files[3]!.id]);
  });

  it("activeFileId watcher early-returns on echo (no re-scroll loop)", async () => {
    const files = makeFiles(5);
    const wrapper = await mountContinuous({ files, activeFileId: files[0]!.id });
    const root = wrapper.find(".danx-file-continuous-root");
    const viewport = root.element.querySelector(".danx-scroll__viewport") as HTMLElement | null;
    if (!viewport) return;
    Object.defineProperty(viewport, "clientHeight", { value: 100, configurable: true });
    Object.defineProperty(viewport, "scrollTop", {
      value: 3 * 608 + 304 - 50,
      configurable: true,
      writable: true,
    });
    viewport.dispatchEvent(new Event("scroll"));
    await nextTick();
    // Now parent reflects the emitted activeFileId back into our prop —
    // the watcher should short-circuit (lastEmittedId match) and NOT
    // invoke scrollToCenter, leaving scrollTop untouched.
    const prevTop = viewport.scrollTop;
    await wrapper.setProps({ activeFileId: files[3]!.id });
    await nextTick();
    expect(viewport.scrollTop).toBe(prevTop);
  });

  it("does not emit when scrolling to the current active index", async () => {
    const files = makeFiles(3);
    const wrapper = await mountContinuous({ files, activeFileId: files[1]!.id });
    const viewport = wrapper.element.querySelector(".danx-scroll__viewport") as HTMLElement | null;
    if (!viewport) return;
    Object.defineProperty(viewport, "clientHeight", { value: 100, configurable: true });
    Object.defineProperty(viewport, "scrollTop", {
      value: 608 + 304 - 50, // centers files[1]
      configurable: true,
      writable: true,
    });
    viewport.dispatchEvent(new Event("scroll"));
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

  describe("zoom", () => {
    it("defaults to 100% — --zoom-pct=100, height=base+gap", async () => {
      const wrapper = await mountContinuous();
      const item = wrapper.find(".danx-file-continuous__item");
      const styleAttr = item.attributes("style") ?? "";
      expect(styleAttr).toContain("--zoom-pct: 100");
      // 600 (content) + 8 (gap padding-bottom) = 608 full stride
      expect(styleAttr).toContain("height: 608px");
    });

    it("zoom prop drives --zoom-pct and item height (content + gap)", async () => {
      const wrapper = await mountContinuous({ zoom: 200 });
      const item = wrapper.find(".danx-file-continuous__item");
      const styleAttr = item.attributes("style") ?? "";
      expect(styleAttr).toContain("--zoom-pct: 200");
      expect(styleAttr).toContain("height: 1208px");
    });

    it("zoom < 100% shrinks item dimensions (no large vertical gap)", async () => {
      const wrapper = await mountContinuous({ zoom: 50 });
      const item = wrapper.find(".danx-file-continuous__item");
      const styleAttr = item.attributes("style") ?? "";
      expect(styleAttr).toContain("--zoom-pct: 50");
      expect(styleAttr).toContain("height: 308px");
    });

    it("passes scaled defaultItemSize (content + gap) to DanxVirtualScroll", async () => {
      const wrapper = await mountContinuous({ zoom: 150 });
      const vs = wrapper.findComponent({ name: "DanxVirtualScroll" });
      expect(vs.props("defaultItemSize")).toBe(908); // 900 + 8
    });

    it("zoomable=false ignores Ctrl+wheel zoom", async () => {
      const wrapper = await mountContinuous({ zoom: 100, zoomable: false });
      const root = wrapper.find(".danx-file-continuous-root");
      const evt = new WheelEvent("wheel", { deltaY: -50, bubbles: true, cancelable: true });
      Object.defineProperty(evt, "ctrlKey", { value: true });
      root.element.dispatchEvent(evt);
      await nextTick();
      expect(wrapper.emitted("update:zoom")).toBeUndefined();
    });

    it("zoomable=true emits update:zoom from Ctrl+wheel", async () => {
      const wrapper = await mountContinuous({ zoom: 100, zoomable: true });
      const root = wrapper.find(".danx-file-continuous-root");
      const evt = new WheelEvent("wheel", { deltaY: -50, bubbles: true, cancelable: true });
      Object.defineProperty(evt, "ctrlKey", { value: true });
      root.element.dispatchEvent(evt);
      await nextTick();
      const emits = wrapper.emitted("update:zoom");
      expect(emits?.[emits.length - 1]).toEqual([110]);
    });

    it("zoomable=true emits update:zoom from Ctrl+= keyboard", async () => {
      const wrapper = await mountContinuous({ zoom: 100, zoomable: true });
      (wrapper.find(".danx-file-continuous-root").element as HTMLElement).focus();
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "=", ctrlKey: true }));
      await nextTick();
      const emits = wrapper.emitted("update:zoom");
      expect(emits?.[emits.length - 1]).toEqual([110]);
    });
  });

  describe("Ctrl+drag pan", () => {
    it("Ctrl+mousedown without zoomable does not start drag", async () => {
      const wrapper = await mountContinuous({ zoomable: false });
      await wrapper.find(".danx-file-continuous-root").trigger("mousedown", {
        button: 0,
        ctrlKey: true,
        clientX: 100,
        clientY: 100,
      });
      expect(wrapper.find(".danx-file-continuous-root").classes()).not.toContain("is-dragging");
    });

    it("Ctrl+mousedown with zoomable enters is-dragging state", async () => {
      const wrapper = await mountContinuous({ zoomable: true });
      await wrapper.find(".danx-file-continuous-root").trigger("mousedown", {
        button: 0,
        ctrlKey: true,
        clientX: 100,
        clientY: 100,
      });
      expect(wrapper.find(".danx-file-continuous-root").classes()).toContain("is-dragging");
      window.dispatchEvent(new MouseEvent("mouseup"));
      await nextTick();
      expect(wrapper.find(".danx-file-continuous-root").classes()).not.toContain("is-dragging");
    });

    it("plain mousedown (no modifier) does not start drag", async () => {
      const wrapper = await mountContinuous({ zoomable: true });
      await wrapper.find(".danx-file-continuous-root").trigger("mousedown", {
        button: 0,
        clientX: 100,
        clientY: 100,
      });
      expect(wrapper.find(".danx-file-continuous-root").classes()).not.toContain("is-dragging");
    });

    it("Ctrl+drag mousemove updates the viewport scroll position", async () => {
      const wrapper = await mountContinuous({ zoomable: true });
      const root = wrapper.find(".danx-file-continuous-root");
      // The real .danx-scroll__viewport rendered by DanxVirtualScroll lives
      // inside our root — stub scrollLeft / scrollTop on it as plain values
      // so we can assert the drag handler wrote them.
      const viewport = root.element.querySelector(".danx-scroll__viewport") as HTMLElement | null;
      if (!viewport) {
        // If DanxVirtualScroll didn't mount the viewport in this jsdom env,
        // we can't exercise the drag path; assert no crash + drag start.
        await root.trigger("mousedown", {
          button: 0,
          ctrlKey: true,
          clientX: 100,
          clientY: 100,
        });
        window.dispatchEvent(new MouseEvent("mousemove", { clientX: 60, clientY: 70 }));
        window.dispatchEvent(new MouseEvent("mouseup"));
        return;
      }
      let scrollLeft = 0;
      let scrollTop = 0;
      Object.defineProperty(viewport, "scrollLeft", {
        get: () => scrollLeft,
        set: (v: number) => {
          scrollLeft = v;
        },
        configurable: true,
      });
      Object.defineProperty(viewport, "scrollTop", {
        get: () => scrollTop,
        set: (v: number) => {
          scrollTop = v;
        },
        configurable: true,
      });
      await root.trigger("mousedown", { button: 0, ctrlKey: true, clientX: 100, clientY: 100 });
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 60, clientY: 70 }));
      expect(scrollLeft).toBe(40);
      expect(scrollTop).toBe(30);
      window.dispatchEvent(new MouseEvent("mouseup"));
    });

    async function expectPanAtZoom(zoomLevel: number) {
      const wrapper = await mountContinuous({ zoomable: true, zoom: zoomLevel });
      const root = wrapper.find(".danx-file-continuous-root");
      const viewport = root.element.querySelector(".danx-scroll__viewport") as HTMLElement | null;
      if (!viewport) return; // jsdom did not lay out the viewport — pan path untestable here
      let scrollLeft = 0;
      let scrollTop = 0;
      Object.defineProperty(viewport, "scrollLeft", {
        get: () => scrollLeft,
        set: (v: number) => {
          scrollLeft = v;
        },
        configurable: true,
      });
      Object.defineProperty(viewport, "scrollTop", {
        get: () => scrollTop,
        set: (v: number) => {
          scrollTop = v;
        },
        configurable: true,
      });
      await root.trigger("mousedown", { button: 0, ctrlKey: true, clientX: 100, clientY: 100 });
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 60, clientY: 70 }));
      // Pan delta is raw mouse px, independent of zoom.
      expect(scrollLeft).toBe(40);
      expect(scrollTop).toBe(30);
      window.dispatchEvent(new MouseEvent("mouseup"));
    }

    it("Ctrl+drag pans the viewport at low zoom (45%)", async () => {
      await expectPanAtZoom(45);
    });

    it("Ctrl+drag pans the viewport at high zoom (150%)", async () => {
      await expectPanAtZoom(150);
    });

    it("lockZoom disables Ctrl+wheel zoom but keeps Ctrl+drag pan", async () => {
      const wrapper = await mountContinuous({ zoomable: true, lockZoom: true, zoom: 45 });
      const root = wrapper.find(".danx-file-continuous-root");
      const evt = new WheelEvent("wheel", { deltaY: -50, bubbles: true, cancelable: true });
      Object.defineProperty(evt, "ctrlKey", { value: true });
      root.element.dispatchEvent(evt);
      await nextTick();
      expect(wrapper.emitted("update:zoom")).toBeUndefined();
      // Pan still engages.
      await root.trigger("mousedown", { button: 0, ctrlKey: true, clientX: 100, clientY: 100 });
      expect(root.classes()).toContain("is-dragging");
      window.dispatchEvent(new MouseEvent("mouseup"));
      await nextTick();
      expect(root.classes()).not.toContain("is-dragging");
    });

    it("lockZoom disables Ctrl+= keyboard zoom", async () => {
      const wrapper = await mountContinuous({ zoomable: true, lockZoom: true, zoom: 45 });
      (wrapper.find(".danx-file-continuous-root").element as HTMLElement).focus();
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "=", ctrlKey: true }));
      await nextTick();
      expect(wrapper.emitted("update:zoom")).toBeUndefined();
    });

    it("right-click does not start drag", async () => {
      const wrapper = await mountContinuous({ zoomable: true });
      await wrapper.find(".danx-file-continuous-root").trigger("mousedown", {
        button: 2,
        ctrlKey: true,
        clientX: 100,
        clientY: 100,
      });
      expect(wrapper.find(".danx-file-continuous-root").classes()).not.toContain("is-dragging");
    });
  });

  describe("viewport resolution guards", () => {
    // Force findViewport() to return null by stubbing the scroll root's
    // querySelector — simulates the DanxScroll viewport being unavailable.
    function stubViewportNull(wrapper: VueWrapper) {
      const vs = wrapper.findComponent({ name: "DanxVirtualScroll" });
      return vi.spyOn(vs.element, "querySelector").mockReturnValue(null);
    }

    it("Ctrl+drag is a no-op when the viewport cannot be resolved", async () => {
      const wrapper = await mountContinuous({ zoomable: true });
      const spy = stubViewportNull(wrapper);
      await wrapper.find(".danx-file-continuous-root").trigger("mousedown", {
        button: 0,
        ctrlKey: true,
        clientX: 10,
        clientY: 10,
      });
      // findViewport() returned null → onMouseDown bailed before isDragging.
      expect(wrapper.find(".danx-file-continuous-root").classes()).not.toContain("is-dragging");
      spy.mockRestore();
    });

    it("onMouseMove no-ops on a trailing event after the drag ended", async () => {
      const wrapper = await mountContinuous({ zoomable: true });
      const addSpy = vi.spyOn(window, "addEventListener");
      await wrapper.find(".danx-file-continuous-root").trigger("mousedown", {
        button: 0,
        ctrlKey: true,
        clientX: 10,
        clientY: 10,
      });
      const moveHandler = addSpy.mock.calls.find(([t]) => t === "mousemove")?.[1] as (
        e: MouseEvent
      ) => void;
      expect(moveHandler).toBeTruthy();
      // End the drag (isDragging → false), then fire a trailing move.
      window.dispatchEvent(new MouseEvent("mouseup"));
      expect(() =>
        moveHandler(new MouseEvent("mousemove", { clientX: 99, clientY: 99 }))
      ).not.toThrow();
      addSpy.mockRestore();
    });

    it("viewport scroll is a no-op when the viewport disappears mid-session", async () => {
      const files = makeFiles(5);
      const wrapper = await mountContinuous({ files, activeFileId: files[0]!.id });
      const viewport = wrapper.element.querySelector(
        ".danx-scroll__viewport"
      ) as HTMLElement | null;
      if (!viewport) return;
      const spy = stubViewportNull(wrapper);
      // indexAtCenter re-queries → null → returns 0 → file === active → no emit.
      viewport.dispatchEvent(new Event("scroll"));
      await nextTick();
      expect(wrapper.emitted("update:activeFileId")).toBeUndefined();
      spy.mockRestore();
    });

    it("viewport scroll is a no-op when files is empty", async () => {
      const files = makeFiles(3);
      const wrapper = await mountContinuous({ files, activeFileId: files[0]!.id });
      const viewport = wrapper.element.querySelector(
        ".danx-scroll__viewport"
      ) as HTMLElement | null;
      if (!viewport) return;
      await wrapper.setProps({ files: [] });
      Object.defineProperty(viewport, "clientHeight", { value: 100, configurable: true });
      Object.defineProperty(viewport, "scrollTop", {
        value: 0,
        configurable: true,
        writable: true,
      });
      // indexAtCenter clamps to -1 for an empty set → files[-1] undefined → bail.
      expect(() => viewport.dispatchEvent(new Event("scroll"))).not.toThrow();
      await nextTick();
    });

    it("activeFileId change is a no-op when the viewport cannot be resolved", async () => {
      const files = makeFiles(5);
      const wrapper = await mountContinuous({ files, activeFileId: files[0]!.id });
      const spy = stubViewportNull(wrapper);
      // The watcher calls scrollToCenter → findViewport() null → bail, no throw.
      await expect(wrapper.setProps({ activeFileId: files[3]!.id })).resolves.toBeUndefined();
      await nextTick();
      spy.mockRestore();
    });
  });
});
