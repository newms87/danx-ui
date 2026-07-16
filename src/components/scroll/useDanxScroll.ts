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
import type { UseDanxScrollOptions, UseDanxScrollReturn } from "./types";
export type { UseDanxScrollOptions, UseDanxScrollReturn } from "./types";

const AUTO_HIDE_DELAY = 1200;
const MIN_THUMB_PX = 24;
const KEY_SCROLL_STEP = 40;

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

  // Scroll position as a percentage of the scrollable range, for aria-valuenow
  const verticalScrollPercent = ref(0);
  const horizontalScrollPercent = ref(0);

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
      verticalScrollPercent.value = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
    }

    // Horizontal thumb
    if (hasHorizontalOverflow.value) {
      horizontalThumbStyle.value = computeThumbStyle(clientWidth, scrollWidth, scrollLeft, "X");
      horizontalScrollPercent.value = Math.round((scrollLeft / (scrollWidth - clientWidth)) * 100);
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

  // Keyboard scroll — viewport (Arrow/PageUp/PageDown/Home/End)
  function onViewportKeydown(e: KeyboardEvent) {
    const el = containerEl.value;
    if (!el) return;
    let handled = true;

    switch (e.key) {
      case "ArrowDown":
        if (hasVerticalOverflow.value) el.scrollTop += KEY_SCROLL_STEP;
        else handled = false;
        break;
      case "ArrowUp":
        if (hasVerticalOverflow.value) el.scrollTop -= KEY_SCROLL_STEP;
        else handled = false;
        break;
      case "ArrowRight":
        if (hasHorizontalOverflow.value) el.scrollLeft += KEY_SCROLL_STEP;
        else handled = false;
        break;
      case "ArrowLeft":
        if (hasHorizontalOverflow.value) el.scrollLeft -= KEY_SCROLL_STEP;
        else handled = false;
        break;
      case "PageDown":
        if (hasVerticalOverflow.value) el.scrollTop += el.clientHeight;
        else handled = false;
        break;
      case "PageUp":
        if (hasVerticalOverflow.value) el.scrollTop -= el.clientHeight;
        else handled = false;
        break;
      case "Home":
        if (hasVerticalOverflow.value) el.scrollTop = 0;
        else if (hasHorizontalOverflow.value) el.scrollLeft = 0;
        else handled = false;
        break;
      case "End":
        if (hasVerticalOverflow.value) el.scrollTop = el.scrollHeight;
        else if (hasHorizontalOverflow.value) el.scrollLeft = el.scrollWidth;
        else handled = false;
        break;
      default:
        handled = false;
    }

    if (handled) e.preventDefault();
  }

  // Keyboard scroll — thumb (arrow keys along the thumb's own axis, plus Home/End)
  function onThumbKeydown(axis: "vertical" | "horizontal", e: KeyboardEvent) {
    const el = containerEl.value;
    if (!el) return;
    let handled = true;

    if (axis === "vertical") {
      switch (e.key) {
        case "ArrowUp":
          el.scrollTop -= KEY_SCROLL_STEP;
          break;
        case "ArrowDown":
          el.scrollTop += KEY_SCROLL_STEP;
          break;
        case "PageUp":
          el.scrollTop -= el.clientHeight;
          break;
        case "PageDown":
          el.scrollTop += el.clientHeight;
          break;
        case "Home":
          el.scrollTop = 0;
          break;
        case "End":
          el.scrollTop = el.scrollHeight;
          break;
        default:
          handled = false;
      }
    } else {
      switch (e.key) {
        case "ArrowLeft":
          el.scrollLeft -= KEY_SCROLL_STEP;
          break;
        case "ArrowRight":
          el.scrollLeft += KEY_SCROLL_STEP;
          break;
        case "PageUp":
          el.scrollLeft -= el.clientWidth;
          break;
        case "PageDown":
          el.scrollLeft += el.clientWidth;
          break;
        case "Home":
          el.scrollLeft = 0;
          break;
        case "End":
          el.scrollLeft = el.scrollWidth;
          break;
        default:
          handled = false;
      }
    }

    if (handled) e.preventDefault();
  }

  // ResizeObserver for content changes — reactively re-observes as containerEl/firstChildEl change.
  // DXUI-156: DanxScroll.vue (this composable's caller) is statically imported by
  // DanxSelect.vue, which ships from the main barrel — so a static "@vueuse/core"
  // import here would leak into the eager module graph despite this file living
  // outside the barrel's own export list. Resolved via dynamic import() inside
  // onMounted, matching scrollInfiniteSetup.ts's technique.
  const firstChildEl = ref<HTMLElement | null>(null);
  let stopResizeObserver: (() => void) | undefined;

  onMounted(async () => {
    const { useElementResize } = await import("../../shared/composables/useElementResize");
    const { stop } = useElementResize([containerEl, firstChildEl], () => {
      updateGeometry();
    });
    stopResizeObserver = stop;
  });

  function setupObserver() {
    const el = containerEl.value;
    if (!el) return;

    el.addEventListener("scroll", onScroll, { passive: true });
    updateGeometry();

    // Also observe the first child (content) for size changes
    firstChildEl.value = el.firstElementChild as HTMLElement | null;
  }

  function cleanup(el?: HTMLElement | null) {
    const target = el ?? containerEl.value;
    if (target) {
      target.removeEventListener("scroll", onScroll);
    }
    if (hideTimeout) clearTimeout(hideTimeout);
  }

  // Watch for container element becoming available (immediate handles onMounted case)
  watch(
    containerEl,
    (newEl, oldEl) => {
      if (oldEl) cleanup(oldEl);
      if (!newEl) firstChildEl.value = null;
      setupObserver();
    },
    { immediate: true }
  );

  onUnmounted(() => {
    cleanup();
    stopResizeObserver?.();
  });

  return {
    verticalThumbStyle,
    horizontalThumbStyle,
    isVerticalVisible,
    isHorizontalVisible,
    hasVerticalOverflow,
    hasHorizontalOverflow,
    verticalScrollPercent,
    horizontalScrollPercent,
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
    onViewportKeydown,
    onVerticalThumbKeydown: (e: KeyboardEvent) => onThumbKeydown("vertical", e),
    onHorizontalThumbKeydown: (e: KeyboardEvent) => onThumbKeydown("horizontal", e),
  };
}
