/**
 * useDanxScroll - Composable for custom overlay scrollbar behavior
 *
 * Manages thumb geometry, auto-hide state, drag support, and overflow detection
 * for custom scrollbar tracks rendered as overlay elements.
 *
 * The composable tracks the container's scroll position via scroll events and
 * computes thumb size/position as percentages of the track. Scrollbar visibility
 * uses auto-hide logic: visible while scrolling or hovering the track, hidden
 * after ~1.2s of idle.
 *
 * @param containerEl - Ref to the scroll container element
 * @param options - Configuration for persistent mode
 * @returns Reactive state and event handlers for scrollbar tracks/thumbs
 */
import { type CSSProperties, onUnmounted, type Ref, ref, watch } from "vue";
import type { UseDanxScrollOptions, UseDanxScrollReturn } from "./types";
export type { UseDanxScrollOptions, UseDanxScrollReturn } from "./types";

const AUTO_HIDE_DELAY = 1200;
const MIN_THUMB_PX = 24;

/**
 * Compute thumb size and position for one axis.
 * Clamps thumb to MIN_THUMB_PX minimum and uses scroll-ratio positioning
 * so the thumb stays within track bounds even when clamped.
 */
function computeThumbStyle(
  clientSize: number,
  scrollSize: number,
  scrollPos: number,
  axis: "X" | "Y"
): CSSProperties {
  let thumbPct = (clientSize / scrollSize) * 100;

  if ((thumbPct / 100) * clientSize < MIN_THUMB_PX) {
    thumbPct = (MIN_THUMB_PX / clientSize) * 100;
  }

  const scrollRatio = scrollPos / (scrollSize - clientSize);
  const maxTranslatePct = ((100 - thumbPct) / thumbPct) * 100;
  const sizeProp = axis === "Y" ? "height" : "width";
  const transformFn = axis === "Y" ? "translateY" : "translateX";

  return {
    [sizeProp]: `${thumbPct}%`,
    transform: `${transformFn}(${scrollRatio * maxTranslatePct}%)`,
  };
}

export function useDanxScroll(
  containerEl: Ref<HTMLElement | null>,
  options: UseDanxScrollOptions = {}
): UseDanxScrollReturn {
  const { persistent = false } = options;

  // Overflow detection
  const hasVerticalOverflow = ref(false);
  const hasHorizontalOverflow = ref(false);

  // Thumb geometry
  const verticalThumbStyle = ref<CSSProperties>({});
  const horizontalThumbStyle = ref<CSSProperties>({});

  // Visibility state
  const isScrolling = ref(false);
  const isHoveringTrack = ref(false);
  const isVerticalVisible = ref(persistent);
  const isHorizontalVisible = ref(persistent);

  let hideTimeout: ReturnType<typeof setTimeout> | null = null;
  let isDragging = false;

  function updateVisibility() {
    const visible = persistent || isScrolling.value || isHoveringTrack.value || isDragging;
    isVerticalVisible.value = visible;
    isHorizontalVisible.value = visible;
  }

  function scheduleHide() {
    if (hideTimeout) clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      isScrolling.value = false;
      updateVisibility();
    }, AUTO_HIDE_DELAY);
  }

  function updateGeometry() {
    const el = containerEl.value;
    if (!el) return;

    const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = el;

    // Overflow detection
    hasVerticalOverflow.value = scrollHeight > clientHeight;
    hasHorizontalOverflow.value = scrollWidth > clientWidth;

    // Vertical thumb
    if (hasVerticalOverflow.value) {
      verticalThumbStyle.value = computeThumbStyle(clientHeight, scrollHeight, scrollTop, "Y");
    }

    // Horizontal thumb
    if (hasHorizontalOverflow.value) {
      horizontalThumbStyle.value = computeThumbStyle(clientWidth, scrollWidth, scrollLeft, "X");
    }
  }

  function onScroll() {
    isScrolling.value = true;
    updateVisibility();
    updateGeometry();
    scheduleHide();
  }

  // Drag support
  let dragAxis: "vertical" | "horizontal" = "vertical";
  let dragStartPos = 0;
  let dragStartScroll = 0;

  /**
   * Start a thumb drag using pointer capture. Pointer capture routes all
   * subsequent pointer events to the thumb element itself, so the drag works
   * even inside containers that stop event propagation (e.g. DanxDialog).
   */
  function startDrag(axis: "vertical" | "horizontal", e: PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    isDragging = true;
    dragAxis = axis;
    dragStartPos = axis === "vertical" ? e.clientY : e.clientX;
    dragStartScroll =
      axis === "vertical"
        ? (containerEl.value?.scrollTop ?? 0)
        : (containerEl.value?.scrollLeft ?? 0);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    updateVisibility();
  }

  function onVerticalThumbPointerDown(e: PointerEvent) {
    startDrag("vertical", e);
  }

  function onHorizontalThumbPointerDown(e: PointerEvent) {
    startDrag("horizontal", e);
  }

  function onDragMove(e: PointerEvent) {
    if (!isDragging) return;
    const el = containerEl.value;
    if (!el) return;

    // delta * ratio maps the full track length to the full scroll range,
    // so the thumb covers all content even when the cursor goes beyond bounds.
    if (dragAxis === "vertical") {
      const delta = e.clientY - dragStartPos;
      const ratio = el.scrollHeight / el.clientHeight;
      el.scrollTop = dragStartScroll + delta * ratio;
    } else {
      const delta = e.clientX - dragStartPos;
      const ratio = el.scrollWidth / el.clientWidth;
      el.scrollLeft = dragStartScroll + delta * ratio;
    }
  }

  function onDragEnd(e: PointerEvent) {
    isDragging = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    scheduleHide();
  }

  // Track click — jump-scroll to position
  function onTrackClick(axis: "vertical" | "horizontal", e: MouseEvent) {
    const el = containerEl.value;
    if (!el) return;
    const track = e.currentTarget as HTMLElement;
    const rect = track.getBoundingClientRect();
    if (axis === "vertical") {
      const clickRatio = (e.clientY - rect.top) / rect.height;
      el.scrollTop = clickRatio * el.scrollHeight - el.clientHeight / 2;
    } else {
      const clickRatio = (e.clientX - rect.left) / rect.width;
      el.scrollLeft = clickRatio * el.scrollWidth - el.clientWidth / 2;
    }
  }

  // Track hover
  function onTrackMouseEnter() {
    isHoveringTrack.value = true;
    updateVisibility();
  }

  function onTrackMouseLeave() {
    isHoveringTrack.value = false;
    updateVisibility();
  }

  // ResizeObserver for content changes
  let resizeObserver: ResizeObserver | null = null;

  function setupObserver() {
    const el = containerEl.value;
    if (!el) return;

    el.addEventListener("scroll", onScroll, { passive: true });
    updateGeometry();

    resizeObserver = new ResizeObserver(() => {
      updateGeometry();
    });
    resizeObserver.observe(el);

    // Also observe the first child (content) for size changes
    if (el.firstElementChild) {
      resizeObserver.observe(el.firstElementChild);
    }
  }

  function cleanup(el?: HTMLElement | null) {
    const target = el ?? containerEl.value;
    if (target) {
      target.removeEventListener("scroll", onScroll);
    }
    resizeObserver?.disconnect();
    resizeObserver = null;
    if (hideTimeout) clearTimeout(hideTimeout);
  }

  // Watch for container element becoming available (immediate handles onMounted case)
  watch(
    containerEl,
    (_newEl, oldEl) => {
      if (oldEl) cleanup(oldEl);
      setupObserver();
    },
    { immediate: true }
  );

  onUnmounted(() => {
    cleanup();
  });

  return {
    verticalThumbStyle,
    horizontalThumbStyle,
    isVerticalVisible,
    isHorizontalVisible,
    hasVerticalOverflow,
    hasHorizontalOverflow,
    onVerticalThumbPointerDown,
    onVerticalThumbPointerMove: onDragMove,
    onVerticalThumbPointerUp: onDragEnd,
    onHorizontalThumbPointerDown,
    onHorizontalThumbPointerMove: onDragMove,
    onHorizontalThumbPointerUp: onDragEnd,
    onVerticalTrackClick: (e: MouseEvent) => onTrackClick("vertical", e),
    onHorizontalTrackClick: (e: MouseEvent) => onTrackClick("horizontal", e),
    onTrackMouseEnter,
    onTrackMouseLeave,
  };
}
