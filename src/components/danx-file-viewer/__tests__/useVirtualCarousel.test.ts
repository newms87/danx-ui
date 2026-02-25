import { ref } from "vue";
import { describe, it, expect } from "vitest";
import { useVirtualCarousel } from "../useVirtualCarousel";
import type { PreviewFile } from "../../danx-file/types";
import { makeFiles } from "../../danx-file/__tests__/test-helpers";

describe("useVirtualCarousel", () => {
  describe("visible slides", () => {
    it("returns empty array when files is empty", () => {
      const files = ref<PreviewFile[]>([]);
      const currentIndex = ref(0);
      const { visibleSlides } = useVirtualCarousel(files, currentIndex);
      expect(visibleSlides.value).toEqual([]);
    });

    it("returns empty array when index is negative", () => {
      const files = ref(makeFiles(5));
      const currentIndex = ref(-1);
      const { visibleSlides } = useVirtualCarousel(files, currentIndex);
      expect(visibleSlides.value).toEqual([]);
    });

    it("returns single slide for single file", () => {
      const files = ref(makeFiles(1));
      const currentIndex = ref(0);
      const { visibleSlides } = useVirtualCarousel(files, currentIndex);
      expect(visibleSlides.value).toHaveLength(1);
      expect(visibleSlides.value[0]!.file.id).toBe("1");
      expect(visibleSlides.value[0]!.index).toBe(0);
      expect(visibleSlides.value[0]!.isActive).toBe(true);
    });

    it("renders indices 0-2 when at index 0 with 5 files", () => {
      const files = ref(makeFiles(5));
      const currentIndex = ref(0);
      const { visibleSlides } = useVirtualCarousel(files, currentIndex);
      expect(visibleSlides.value).toHaveLength(3);
      expect(visibleSlides.value.map((s) => s.index)).toEqual([0, 1, 2]);
    });

    it("renders current ±2 for middle index", () => {
      const files = ref(makeFiles(10));
      const currentIndex = ref(5);
      const { visibleSlides } = useVirtualCarousel(files, currentIndex);
      expect(visibleSlides.value).toHaveLength(5);
      expect(visibleSlides.value.map((s) => s.index)).toEqual([3, 4, 5, 6, 7]);
    });

    it("only marks active index as isActive", () => {
      const files = ref(makeFiles(5));
      const currentIndex = ref(2);
      const { visibleSlides } = useVirtualCarousel(files, currentIndex);
      for (const slide of visibleSlides.value) {
        expect(slide.isActive).toBe(slide.index === 2);
      }
    });

    it("clamps start to 0 (no negative indices)", () => {
      const files = ref(makeFiles(5));
      const currentIndex = ref(1);
      const { visibleSlides } = useVirtualCarousel(files, currentIndex);
      expect(visibleSlides.value[0]!.index).toBe(0);
      expect(visibleSlides.value.every((s) => s.index >= 0)).toBe(true);
    });

    it("clamps end to last index (no past end)", () => {
      const files = ref(makeFiles(5));
      const currentIndex = ref(4);
      const { visibleSlides } = useVirtualCarousel(files, currentIndex);
      const lastSlide = visibleSlides.value[visibleSlides.value.length - 1]!;
      expect(lastSlide.index).toBe(4);
      expect(visibleSlides.value.map((s) => s.index)).toEqual([2, 3, 4]);
    });
  });

  describe("reactivity", () => {
    it("updates when currentIndex changes", () => {
      const files = ref(makeFiles(5));
      const currentIndex = ref(0);
      const { visibleSlides } = useVirtualCarousel(files, currentIndex);

      expect(visibleSlides.value.find((s) => s.isActive)!.index).toBe(0);

      currentIndex.value = 3;
      expect(visibleSlides.value.find((s) => s.isActive)!.index).toBe(3);
      expect(visibleSlides.value.map((s) => s.index)).toEqual([1, 2, 3, 4]);
    });

    it("updates when files change", () => {
      const files = ref(makeFiles(3));
      const currentIndex = ref(0);
      const { visibleSlides } = useVirtualCarousel(files, currentIndex);
      expect(visibleSlides.value).toHaveLength(3);

      files.value = makeFiles(1);
      expect(visibleSlides.value).toHaveLength(1);
    });
  });

  describe("edge cases", () => {
    it("returns empty array when index exceeds file count", () => {
      const files = ref(makeFiles(5));
      const currentIndex = ref(10);
      const { visibleSlides } = useVirtualCarousel(files, currentIndex);
      expect(visibleSlides.value).toEqual([]);
    });

    it("includes file reference on each slide", () => {
      const files = ref(makeFiles(3));
      const currentIndex = ref(1);
      const { visibleSlides } = useVirtualCarousel(files, currentIndex);
      for (const slide of visibleSlides.value) {
        expect(slide.file).toBeDefined();
        expect(slide.file.url).toBe(`https://example.com/${slide.file.id}.jpg`);
      }
    });
  });
});
