/**
 * Shared MutationObserver lifecycle composable for the markdown editor.
 *
 * Encapsulates the common pattern of watching a contenteditable element for
 * nodes that carry a specific data attribute (e.g., data-code-block-id,
 * data-token-id). Used by useCodeBlockManager and useTokenManager.
 */

import { nextTick, onUnmounted, Ref, watch } from "vue";

/**
 * Options for useDomObserver composable
 */
export interface UseDomObserverOptions {
  /** Reference to the contenteditable container */
  contentRef: Ref<HTMLElement | null>;
  /** The data attribute to match (e.g., "data-code-block-id") */
  dataAttribute: string;
  /** Called for each element with the data attribute that is added to the DOM */
  onNodeAdded: (el: HTMLElement) => void;
  /** Called for each element with the data attribute that is removed from the DOM */
  onNodeRemoved: (el: HTMLElement) => void;
  /** Called when the contentRef is removed or on unmount for teardown */
  onCleanup: () => void;
  /** Called when contentRef first becomes available to mount existing elements */
  onInitialMount?: () => void;
}

/**
 * Composable that manages a MutationObserver lifecycle for tracking elements
 * with a specific data attribute inside a contenteditable container.
 *
 * Handles: observer creation, contentRef watch with immediate, mutation
 * handling for both added and removed nodes (including children), and
 * cleanup on unmount or contentRef removal.
 */
export function useDomObserver(options: UseDomObserverOptions): void {
  const { contentRef, dataAttribute, onNodeAdded, onNodeRemoved, onCleanup, onInitialMount } =
    options;

  const selector = `[${dataAttribute}]`;
  let observer: MutationObserver | null = null;

  function handleMutations(mutations: MutationRecord[]): void {
    for (const mutation of mutations) {
      for (const node of Array.from(mutation.addedNodes)) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;

          if (element.hasAttribute && element.hasAttribute(dataAttribute)) {
            nextTick(() => onNodeAdded(element));
          }

          element.querySelectorAll(selector).forEach((child) => {
            nextTick(() => onNodeAdded(child as HTMLElement));
          });
        }
      }

      for (const node of Array.from(mutation.removedNodes)) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;

          if (element.hasAttribute && element.hasAttribute(dataAttribute)) {
            onNodeRemoved(element);
          }

          element.querySelectorAll(selector).forEach((child) => {
            onNodeRemoved(child as HTMLElement);
          });
        }
      }
    }
  }

  function startObserver(): void {
    // startObserver is only called when contentRef transitions to truthy (watch handler)
    observer = new MutationObserver(handleMutations);
    observer.observe(contentRef.value!, {
      childList: true,
      subtree: true,
    });
  }

  function stopObserver(): void {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  watch(
    contentRef,
    (newRef, oldRef) => {
      if (oldRef && !newRef) {
        stopObserver();
        onCleanup();
      } else if (newRef && !oldRef) {
        startObserver();
        if (onInitialMount) {
          nextTick(() => onInitialMount());
        }
      }
    },
    { immediate: true }
  );

  onUnmounted(() => {
    stopObserver();
    onCleanup();
  });
}
