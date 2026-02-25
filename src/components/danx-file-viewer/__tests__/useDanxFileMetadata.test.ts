import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { nextTick, defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import { useDanxFileMetadata } from "../useDanxFileMetadata";

describe("useDanxFileMetadata", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("mode", () => {
    it("defaults to overlay", () => {
      const { mode } = useDanxFileMetadata();
      expect(mode.value).toBe("overlay");
    });

    it("reads stored mode from localStorage", () => {
      localStorage.setItem("danx-file-metadata-mode", "docked");
      const { mode } = useDanxFileMetadata();
      expect(mode.value).toBe("docked");
    });

    it("ignores invalid stored values", () => {
      localStorage.setItem("danx-file-metadata-mode", "invalid");
      const { mode } = useDanxFileMetadata();
      expect(mode.value).toBe("overlay");
    });
  });

  describe("mode watch persistence", () => {
    const mountedWrappers: ReturnType<typeof mount>[] = [];

    afterEach(() => {
      for (const w of mountedWrappers) w.unmount();
      mountedWrappers.length = 0;
    });

    it("auto-persists mode changes to localStorage via watch", async () => {
      let result!: ReturnType<typeof useDanxFileMetadata>;
      const wrapper = mount(
        defineComponent({
          setup() {
            result = useDanxFileMetadata();
            return {};
          },
          template: "<div />",
        })
      );
      mountedWrappers.push(wrapper);

      result.mode.value = "docked";
      await nextTick();
      expect(localStorage.getItem("danx-file-metadata-mode")).toBe("docked");

      result.mode.value = "overlay";
      await nextTick();
      expect(localStorage.getItem("danx-file-metadata-mode")).toBe("overlay");
    });
  });

  describe("localStorage error handling", () => {
    it("defaults to overlay when localStorage.getItem throws", () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("localStorage unavailable");
      });
      const { mode } = useDanxFileMetadata();
      expect(mode.value).toBe("overlay");
      vi.restoreAllMocks();
    });

    it("does not throw when localStorage.setItem throws", async () => {
      let result!: ReturnType<typeof useDanxFileMetadata>;
      const wrapper = mount(
        defineComponent({
          setup() {
            result = useDanxFileMetadata();
            return {};
          },
          template: "<div />",
        })
      );

      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("localStorage unavailable");
      });
      result.mode.value = "docked";
      await nextTick();
      // Should not throw — error is caught internally
      expect(result.mode.value).toBe("docked");
      vi.restoreAllMocks();
      wrapper.unmount();
    });
  });
});
