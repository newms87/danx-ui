import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import DanxFileMetadata from "../DanxFileMetadata.vue";
import type { PreviewFile } from "../../danx-file/types";

function makeFile(overrides: Partial<PreviewFile> = {}): PreviewFile {
  return {
    id: "1",
    name: "test.jpg",
    size: 1024,
    type: "image/jpeg",
    url: "https://example.com/test.jpg",
    ...overrides,
  };
}

describe("DanxFileMetadata", () => {
  describe("Rendering", () => {
    it("renders metadata panel when file has meta", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: {
          file: makeFile({ meta: { width: 800 } }),
          mode: "overlay",
        },
      });
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(true);
    });

    it("does not render when file has no meta", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: {
          file: makeFile(),
          mode: "overlay",
        },
      });
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(false);
    });

    it("does not render when file has empty meta", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: {
          file: makeFile({ meta: {} }),
          mode: "overlay",
        },
      });
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(false);
    });

    it("renders when file has only exif", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: {
          file: makeFile({ exif: { camera: "Canon" } }),
          mode: "overlay",
        },
      });
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(true);
    });

    it("displays Info title in header", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: {
          file: makeFile({ meta: { width: 800 } }),
          mode: "overlay",
        },
      });
      expect(wrapper.find(".danx-file-metadata__title").text()).toBe("Info");
    });

    it("renders CodeViewer in content area", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: {
          file: makeFile({ meta: { width: 800 } }),
          mode: "overlay",
        },
      });
      expect(wrapper.find(".danx-file-metadata__content").exists()).toBe(true);
      expect(wrapper.find(".dx-code-viewer").exists()).toBe(true);
    });
  });

  describe("Mode classes", () => {
    it("applies overlay class when mode is overlay", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: {
          file: makeFile({ meta: { width: 800 } }),
          mode: "overlay",
        },
      });
      expect(wrapper.find(".danx-file-metadata--overlay").exists()).toBe(true);
    });

    it("applies docked class when mode is docked", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: {
          file: makeFile({ meta: { width: 800 } }),
          mode: "docked",
        },
      });
      expect(wrapper.find(".danx-file-metadata--docked").exists()).toBe(true);
    });
  });

  describe("Close button", () => {
    it("shows close button in overlay mode", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: {
          file: makeFile({ meta: { width: 800 } }),
          mode: "overlay",
        },
      });
      const buttons = wrapper.findAll(".danx-file-metadata__header-actions .danx-button");
      // Should have gear + close buttons
      expect(buttons.length).toBe(2);
    });

    it("hides close button in docked mode", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: {
          file: makeFile({ meta: { width: 800 } }),
          mode: "docked",
        },
      });
      const buttons = wrapper.findAll(".danx-file-metadata__header-actions .danx-button");
      // Should have only gear button
      expect(buttons.length).toBe(1);
    });

    it("emits close when close button clicked", async () => {
      const wrapper = mount(DanxFileMetadata, {
        props: {
          file: makeFile({ meta: { width: 800 } }),
          mode: "overlay",
        },
      });
      const buttons = wrapper.findAll(".danx-file-metadata__header-actions .danx-button");
      await buttons[1]!.trigger("click");
      expect(wrapper.emitted("close")).toHaveLength(1);
    });
  });

  describe("Toggle mode", () => {
    it("emits update:mode when gear button clicked in overlay mode", async () => {
      const wrapper = mount(DanxFileMetadata, {
        props: {
          file: makeFile({ meta: { width: 800 } }),
          mode: "overlay",
        },
      });
      const gearBtn = wrapper.findAll(".danx-file-metadata__header-actions .danx-button")[0]!;
      await gearBtn.trigger("click");
      expect(wrapper.emitted("update:mode")).toEqual([["docked"]]);
    });

    it("emits update:mode when gear button clicked in docked mode", async () => {
      const wrapper = mount(DanxFileMetadata, {
        props: {
          file: makeFile({ meta: { width: 800 } }),
          mode: "docked",
        },
      });
      const gearBtn = wrapper.find(".danx-file-metadata__header-actions .danx-button");
      await gearBtn.trigger("click");
      expect(wrapper.emitted("update:mode")).toEqual([["overlay"]]);
    });
  });

  describe("Dual sections", () => {
    it("shows only Metadata section when file has meta but no exif", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: {
          file: makeFile({ meta: { width: 800 } }),
          mode: "overlay",
        },
      });
      const sections = wrapper.findAll(".danx-file-metadata__section");
      expect(sections.length).toBe(1);
      expect(sections[0]!.find(".danx-file-metadata__section-title").text()).toBe("Metadata");
    });

    it("shows only EXIF section when file has exif but no meta", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: {
          file: makeFile({ exif: { camera: "Canon" } }),
          mode: "overlay",
        },
      });
      const sections = wrapper.findAll(".danx-file-metadata__section");
      expect(sections.length).toBe(1);
      expect(sections[0]!.find(".danx-file-metadata__section-title").text()).toBe("EXIF");
    });

    it("shows both sections with separator when file has meta and exif", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: {
          file: makeFile({ meta: { width: 800 }, exif: { camera: "Canon" } }),
          mode: "overlay",
        },
      });
      const sections = wrapper.findAll(".danx-file-metadata__section");
      expect(sections.length).toBe(2);
      expect(sections[0]!.find(".danx-file-metadata__section-title").text()).toBe("Metadata");
      expect(sections[1]!.find(".danx-file-metadata__section-title").text()).toBe("EXIF");
      expect(wrapper.find(".danx-file-metadata__separator").exists()).toBe(true);
    });

    it("does not show separator when only one section exists", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: {
          file: makeFile({ meta: { width: 800 } }),
          mode: "overlay",
        },
      });
      expect(wrapper.find(".danx-file-metadata__separator").exists()).toBe(false);
    });

    it("renders two CodeViewers when both sections present", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: {
          file: makeFile({ meta: { width: 800 }, exif: { camera: "Canon" } }),
          mode: "overlay",
        },
      });
      expect(wrapper.findAll(".dx-code-viewer").length).toBe(2);
    });
  });

  describe("Metadata filtering", () => {
    it("filters out children key from meta", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: {
          file: makeFile({ meta: { width: 800, children: [{ id: "c1" }] } }),
          mode: "overlay",
        },
      });
      // Panel should render because width exists
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(true);
    });

    it("does not render when only meta key is children", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: {
          file: makeFile({ meta: { children: [{ id: "c1" }] } }),
          mode: "overlay",
        },
      });
      // No displayable metadata after filtering
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(false);
    });
  });
});
