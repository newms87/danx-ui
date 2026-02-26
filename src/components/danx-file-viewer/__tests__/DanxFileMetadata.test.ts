import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import DanxFileMetadata from "../DanxFileMetadata.vue";
import { makeFile } from "../../danx-file/__tests__/test-helpers";

describe("DanxFileMetadata", () => {
  describe("Rendering", () => {
    it("renders metadata panel when file has meta", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: { file: makeFile({ meta: { width: 800 } }) },
      });
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(true);
    });

    it("does not render when file has no meta", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: { file: makeFile() },
      });
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(false);
    });

    it("does not render when file has empty meta", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: { file: makeFile({ meta: {} }) },
      });
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(false);
    });

    it("renders when file has only exif", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: { file: makeFile({ exif: { camera: "Canon" } }) },
      });
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(true);
    });

    it("displays Info title in header", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: { file: makeFile({ meta: { width: 800 } }) },
      });
      expect(wrapper.find(".danx-file-metadata__title").text()).toBe("Info");
    });

    it("renders CodeViewer in content area", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: { file: makeFile({ meta: { width: 800 } }) },
      });
      expect(wrapper.find(".danx-file-metadata__content").exists()).toBe(true);
      expect(wrapper.find(".dx-code-viewer").exists()).toBe(true);
    });

    it("has no action buttons in header", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: { file: makeFile({ meta: { width: 800 } }) },
      });
      expect(wrapper.findAll(".danx-button").length).toBe(0);
    });
  });

  describe("Dual sections", () => {
    it("shows only Metadata section when file has meta but no exif", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: { file: makeFile({ meta: { width: 800 } }) },
      });
      const sections = wrapper.findAll(".danx-file-metadata__section");
      expect(sections.length).toBe(1);
      expect(sections[0]!.find(".danx-file-metadata__section-title").text()).toBe("Metadata");
    });

    it("shows only EXIF section when file has exif but no meta", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: { file: makeFile({ exif: { camera: "Canon" } }) },
      });
      const sections = wrapper.findAll(".danx-file-metadata__section");
      expect(sections.length).toBe(1);
      expect(sections[0]!.find(".danx-file-metadata__section-title").text()).toBe("EXIF");
    });

    it("shows both sections with separator when file has meta and exif", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: { file: makeFile({ meta: { width: 800 }, exif: { camera: "Canon" } }) },
      });
      const sections = wrapper.findAll(".danx-file-metadata__section");
      expect(sections.length).toBe(2);
      expect(sections[0]!.find(".danx-file-metadata__section-title").text()).toBe("Metadata");
      expect(sections[1]!.find(".danx-file-metadata__section-title").text()).toBe("EXIF");
      expect(wrapper.find(".danx-file-metadata__separator").exists()).toBe(true);
    });

    it("does not show separator when only one section exists", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: { file: makeFile({ meta: { width: 800 } }) },
      });
      expect(wrapper.find(".danx-file-metadata__separator").exists()).toBe(false);
    });

    it("renders two CodeViewers when both sections present", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: { file: makeFile({ meta: { width: 800 }, exif: { camera: "Canon" } }) },
      });
      expect(wrapper.findAll(".dx-code-viewer").length).toBe(2);
    });
  });

  describe("Metadata filtering", () => {
    it("filters out children key from meta", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: { file: makeFile({ meta: { width: 800, children: [{ id: "c1" }] } }) },
      });
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(true);
    });

    it("does not render when only meta key is children", () => {
      const wrapper = mount(DanxFileMetadata, {
        props: { file: makeFile({ meta: { children: [{ id: "c1" }] } }) },
      });
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(false);
    });
  });
});
