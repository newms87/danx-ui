/**
 * useVirtualCarousel - Virtual slide buffer for smooth carousel transitions
 *
 * Computes a buffer window of current ±2 slides (clamped to valid range)
 * so the DOM only ever contains up to 5 slide elements. Each slide gets
 * an opacity transition; only the active slide receives pointer events.
 *
 * @param files - Reactive ref of all files in the carousel
 * @param currentIndex - Reactive ref of the current slide index
 *
 * @returns visibleSlides - Computed array of VirtualSlide descriptors
 */

import { computed, type Ref } from "vue";
import type { PreviewFile } from "../danx-file";
import type { VirtualSlide } from "./types";

const BUFFER_SIZE = 2;

export function useVirtualCarousel(files: Ref<PreviewFile[]>, currentIndex: Ref<number>) {
  const visibleSlides = computed<VirtualSlide[]>(() => {
    const list = files.value;
    const idx = currentIndex.value;
    if (list.length === 0 || idx < 0 || idx >= list.length) return [];

    const start = Math.max(0, idx - BUFFER_SIZE);
    const end = Math.min(list.length - 1, idx + BUFFER_SIZE);
    const slides: VirtualSlide[] = [];

    for (let i = start; i <= end; i++) {
      slides.push({
        file: list[i]!,
        index: i,
        isActive: i === idx,
      });
    }

    return slides;
  });

  return { visibleSlides };
}
