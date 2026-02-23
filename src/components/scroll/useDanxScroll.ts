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
import { type CSSProperties, onMounted, onUnmounted, type Ref, ref, watch } from "vue";

export interface UseDanxScrollOptions {
  /** Keep scrollbar always visible (no auto-hide). */
  persistent?: boolean;
}

export interface UseDanxScrollReturn {
  /** Inline styles for the vertical thumb (height + translateY). */
  verticalThumbStyle: Ref<CSSProperties>;
  /** Inline styles for the horizontal thumb (width + translateX). */
  horizontalThumbStyle: Ref<CSSProperties>;
  /** Whether the vertical scrollbar should be visible. */
  isVerticalVisible: Ref<boolean>;
  /** Whether the horizontal scrollbar should be visible. */
  isHorizontalVisible: Ref<boolean>;
  /** Whether content overflows vertically. */
  hasVerticalOverflow: Ref<boolean>;
  /** Whether content overflows horizontally. */
  hasHorizontalOverflow: Ref<boolean>;
  /** Mousedown handler for vertical thumb drag. */
  onVerticalThumbMouseDown: (e: MouseEvent) => void;
  /** Mousedown handler for horizontal thumb drag. */
  onHorizontalThumbMouseDown: (e: MouseEvent) => void;
  /** Click handler for vertical track (jump-scroll). */
  onVerticalTrackClick: (e: MouseEvent) => void;
  /** Click handler for horizontal track (jump-scroll). */
  onHorizontalTrackClick: (e: MouseEvent) => void;
  /** Mouseenter handler for track (keeps scrollbar visible). */
  onTrackMouseEnter: () => void;
  /** Mouseleave handler for track (allows auto-hide). */
  onTrackMouseLeave: () => void;
}

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

  function startDrag(axis: "vertical" | "horizontal", e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    isDragging = true;
    dragAxis = axis;
    dragStartPos = axis === "vertical" ? e.clientY : e.clientX;
    dragStartScroll =
      axis === "vertical"
        ? (containerEl.value?.scrollTop ?? 0)
        : (containerEl.value?.scrollLeft ?? 0);
    document.addEventListener("mousemove", onDragMove);
    document.addEventListener("mouseup", onDragEnd);
    updateVisibility();
  }

  function onVerticalThumbMouseDown(e: MouseEvent) {
    startDrag("vertical", e);
  }

  function onHorizontalThumbMouseDown(e: MouseEvent) {
    startDrag("horizontal", e);
  }

  function onDragMove(e: MouseEvent) {
    const el = containerEl.value;
    if (!el) return;

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

  function onDragEnd() {
    isDragging = false;
    document.removeEventListener("mousemove", onDragMove);
    document.removeEventListener("mouseup", onDragEnd);
    scheduleHide();
  }

  // Track click — jump-scroll to position
  function onVerticalTrackClick(e: MouseEvent) {
    const el = containerEl.value;
    if (!el) return;
    const track = e.currentTarget as HTMLElement;
    const rect = track.getBoundingClientRect();
    const clickRatio = (e.clientY - rect.top) / rect.height;
    el.scrollTop = clickRatio * el.scrollHeight - el.clientHeight / 2;
  }

  function onHorizontalTrackClick(e: MouseEvent) {
    const el = containerEl.value;
    if (!el) return;
    const track = e.currentTarget as HTMLElement;
    const rect = track.getBoundingClientRect();
    const clickRatio = (e.clientX - rect.left) / rect.width;
    el.scrollLeft = clickRatio * el.scrollWidth - el.clientWidth / 2;
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
    document.removeEventListener("mousemove", onDragMove);
    document.removeEventListener("mouseup", onDragEnd);
  }

  // Watch for container element becoming available
  watch(containerEl, (newEl, oldEl) => {
    if (oldEl) cleanup(oldEl);
    if (newEl) setupObserver();
  });

  onMounted(() => {
    if (containerEl.value) setupObserver();
  });

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
    onVerticalThumbMouseDown,
    onHorizontalThumbMouseDown,
    onVerticalTrackClick,
    onHorizontalTrackClick,
    onTrackMouseEnter,
    onTrackMouseLeave,
  };
}
