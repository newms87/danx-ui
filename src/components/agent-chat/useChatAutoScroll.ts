import { nextTick, onBeforeUnmount, ref, watch, type Ref } from "vue";

/**
 * Distance from the bottom (px) within which the view is considered "pinned".
 * Beyond it the user has deliberately scrolled up to read, and auto-scroll
 * must stop fighting them.
 */
const STICK_THRESHOLD_PX = 100;

export interface UseChatAutoScrollOptions {
  /** The scrollable element. */
  container: Ref<HTMLElement | null>;
  /** Reactive source whose change means "new content arrived". */
  trigger: () => unknown;
}

export interface UseChatAutoScrollReturn {
  /** True while the view is pinned to the newest message. */
  isPinned: Ref<boolean>;
  /** True when there is new content below the current viewport. */
  hasUnread: Ref<boolean>;
  /** Handler to bind to the container's `scroll` event. */
  onScroll: () => void;
  /** Scroll to the newest message and re-pin. */
  scrollToBottom: (behavior?: ScrollBehavior) => void;
}

/**
 * useChatAutoScroll Composable
 *
 * Keeps a chat transcript pinned to the newest message WITHOUT ever overriding
 * a user who has scrolled up. Scrolls the container itself (never
 * `scrollIntoView`, which walks up and can scroll the whole page).
 */
export function useChatAutoScroll(options: UseChatAutoScrollOptions): UseChatAutoScrollReturn {
  const { container, trigger } = options;

  const isPinned = ref(true);
  const hasUnread = ref(false);

  function distanceFromBottom(el: HTMLElement): number {
    return el.scrollHeight - el.scrollTop - el.clientHeight;
  }

  function scrollToBottom(behavior: ScrollBehavior = "smooth") {
    const el = container.value;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
    isPinned.value = true;
    hasUnread.value = false;
  }

  function onScroll() {
    const el = container.value;
    if (!el) return;
    isPinned.value = distanceFromBottom(el) <= STICK_THRESHOLD_PX;
    if (isPinned.value) hasUnread.value = false;
  }

  watch(trigger, async () => {
    await nextTick();
    const el = container.value;
    if (!el) return;
    if (isPinned.value) {
      // "auto" — an instant jump. Smooth-scrolling every token during a stream
      // produces visible chase-lag.
      el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
    } else {
      hasUnread.value = true;
    }
  });

  onBeforeUnmount(() => {
    hasUnread.value = false;
  });

  return { isPinned, hasUnread, onScroll, scrollToBottom };
}
