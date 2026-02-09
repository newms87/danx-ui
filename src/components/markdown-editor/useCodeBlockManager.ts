import { App, computed, createApp, h, nextTick, onUnmounted, ref, Ref, watch } from "vue";
import CodeViewer from "../code-viewer/CodeViewer.vue";
import { CodeBlockState } from "./useCodeBlocks";

/**
 * Options for useCodeBlockManager composable
 */
export interface UseCodeBlockManagerOptions {
  /** Reference to the contenteditable container */
  contentRef: Ref<HTMLElement | null>;
  /** Reactive map of code block states */
  codeBlocks: Map<string, CodeBlockState>;
  /** Callback to update code block content */
  updateCodeBlockContent: (id: string, content: string) => void;
  /** Callback to update code block language */
  updateCodeBlockLanguage: (id: string, language: string) => void;
  /** Callback when a code block requests to exit (e.g., double-Enter at end) */
  onCodeBlockExit?: (id: string) => void;
  /** Callback when a code block requests to be deleted (e.g., Backspace/Delete on empty) */
  onCodeBlockDelete?: (id: string) => void;
  /** Callback when a code block is mounted */
  onCodeBlockMounted?: (id: string, wrapper: HTMLElement) => void;
  /** Optional callback to configure the dynamically created app */
  configureApp?: (app: App) => void;
}

/**
 * Return type for useCodeBlockManager composable
 */
export interface UseCodeBlockManagerReturn {
  /** Mount CodeViewer instances for all unmounted code blocks */
  mountCodeViewers: () => void;
  /** Unmount a specific CodeViewer instance */
  unmountCodeViewer: (id: string) => void;
  /** Unmount all CodeViewer instances */
  unmountAllCodeViewers: () => void;
  /** Get mounted instance count */
  getMountedCount: () => number;
}

/**
 * Mounted CodeViewer instance tracking
 */
interface MountedInstance {
  app: App;
  mountPoint: HTMLElement;
}

/**
 * Map language aliases to CodeViewer format
 */
function mapLanguageToFormat(language: string): string {
  const formatMap: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    py: "python",
    rb: "ruby",
    yml: "yaml",
    md: "markdown",
    sh: "bash",
    shell: "bash",
  };

  return formatMap[language] || language || "text";
}

/**
 * Composable for managing CodeViewer instances within the markdown editor.
 * Handles mounting/unmounting Vue apps for code block "islands".
 */
export function useCodeBlockManager(
  options: UseCodeBlockManagerOptions
): UseCodeBlockManagerReturn {
  const {
    contentRef,
    codeBlocks,
    updateCodeBlockContent,
    updateCodeBlockLanguage,
    onCodeBlockExit,
    onCodeBlockDelete,
    onCodeBlockMounted,
    configureApp,
  } = options;

  // Track mounted instances by code block ID
  const mountedInstances = new Map<string, MountedInstance>();

  // Track watchers for cleanup
  const mountedWatchers = new Map<string, () => void>();

  // MutationObserver to watch for new code block wrappers
  let observer: MutationObserver | null = null;

  /**
   * Create and mount a CodeViewer instance for a code block
   */
  function mountCodeViewer(wrapper: HTMLElement): void {
    const id = wrapper.getAttribute("data-code-block-id");
    if (!id) return;

    // Skip if already mounted
    if (mountedInstances.has(id)) return;

    const mountPoint = wrapper.querySelector(".code-viewer-mount-point") as HTMLElement;
    if (!mountPoint) return;

    // Get state from the codeBlocks map
    const state = codeBlocks.get(id);

    // If no state in map, try to get from data attributes (initial load)
    const initialContent = state?.content ?? mountPoint.getAttribute("data-content") ?? "";
    const initialLanguage = state?.language ?? mountPoint.getAttribute("data-language") ?? "";

    // Ensure state exists in the map
    if (!state) {
      codeBlocks.set(id, {
        id,
        content: initialContent,
        language: initialLanguage,
      });
    }

    // Create reactive refs for the CodeViewer props
    // These will be updated by watchers when the codeBlocks map changes
    const reactiveContent = ref(initialContent);
    const reactiveLanguage = ref(initialLanguage);

    // Set up watchers to track changes to this code block's state
    // We need separate watchers for content and language to ensure Vue properly
    // tracks the reactive properties accessed within each getter function
    const stopContentWatcher = watch(
      () => codeBlocks.get(id)?.content,
      (newContent) => {
        if (newContent !== undefined) {
          reactiveContent.value = newContent;
        }
      }
    );

    const stopLanguageWatcher = watch(
      () => codeBlocks.get(id)?.language,
      (newLanguage) => {
        if (newLanguage !== undefined) {
          reactiveLanguage.value = newLanguage;
        }
      }
    );

    // Combined cleanup function for both watchers
    const stopWatcher = () => {
      stopContentWatcher();
      stopLanguageWatcher();
    };

    // Store the watcher cleanup function
    mountedWatchers.set(id, stopWatcher);

    // Create Vue app for CodeViewer
    const app = createApp({
      setup() {
        // Handle model value updates
        const onUpdateModelValue = (value: object | string | null) => {
          const content = typeof value === "string" ? value : JSON.stringify(value);
          updateCodeBlockContent(id, content);
        };

        // Handle format/language updates
        const onUpdateFormat = (format: string) => {
          updateCodeBlockLanguage(id, format);
        };

        // Handle exit (double-Enter at end of code block)
        const onExit = () => {
          if (onCodeBlockExit) {
            onCodeBlockExit(id);
          }
        };

        // Handle delete (Backspace/Delete on empty code block)
        const onDelete = () => {
          if (onCodeBlockDelete) {
            onCodeBlockDelete(id);
          }
        };

        // Create a computed for the format to ensure proper reactivity tracking
        // The render function needs a computed that Vue can track for re-renders
        const computedFormat = computed(
          () =>
            mapLanguageToFormat(reactiveLanguage.value) as import("../code-viewer/types").CodeFormat
        );

        return () =>
          h(CodeViewer, {
            modelValue: reactiveContent.value,
            format: computedFormat.value,
            canEdit: true,
            editable: true,
            allowAnyLanguage: true,
            class: "code-block-island",
            "onUpdate:modelValue": onUpdateModelValue,
            "onUpdate:format": onUpdateFormat,
            onExit,
            onDelete,
          });
      },
    });

    // Configure the app if a callback is provided
    configureApp?.(app);

    // Clear mount point content (remove data attributes div structure)
    mountPoint.innerHTML = "";

    // Mount the app
    app.mount(mountPoint);

    // Track the instance
    mountedInstances.set(id, { app, mountPoint });

    // Notify that the code block was mounted (after nextTick to ensure DOM is ready)
    if (onCodeBlockMounted) {
      nextTick(() => {
        onCodeBlockMounted(id, wrapper);
      });
    }
  }

  /**
   * Unmount a specific CodeViewer instance
   */
  function unmountCodeViewer(id: string): void {
    // Clean up watcher
    const stopWatcher = mountedWatchers.get(id);
    if (stopWatcher) {
      stopWatcher();
      mountedWatchers.delete(id);
    }

    // Unmount Vue app
    const instance = mountedInstances.get(id);
    if (instance) {
      instance.app.unmount();
      mountedInstances.delete(id);
    }
  }

  /**
   * Unmount all CodeViewer instances
   */
  function unmountAllCodeViewers(): void {
    // Clean up all watchers
    for (const [id, stopWatcher] of mountedWatchers) {
      stopWatcher();
      mountedWatchers.delete(id);
    }

    // Unmount all Vue apps
    for (const [id, instance] of mountedInstances) {
      instance.app.unmount();
      mountedInstances.delete(id);
    }
  }

  /**
   * Mount CodeViewer instances for all unmounted code blocks
   */
  function mountCodeViewers(): void {
    if (!contentRef.value) return;

    const wrappers = contentRef.value.querySelectorAll("[data-code-block-id]");
    wrappers.forEach((wrapper) => {
      mountCodeViewer(wrapper as HTMLElement);
    });
  }

  /**
   * Get mounted instance count
   */
  function getMountedCount(): number {
    return mountedInstances.size;
  }

  /**
   * Handle mutations to the content element
   */
  function handleMutations(mutations: MutationRecord[]): void {
    for (const mutation of mutations) {
      // Check for added nodes that are code block wrappers
      for (const node of Array.from(mutation.addedNodes)) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;

          // Check if the added node is a code block wrapper
          if (element.hasAttribute && element.hasAttribute("data-code-block-id")) {
            nextTick(() => mountCodeViewer(element));
          }

          // Check children for code block wrappers
          const childWrappers = element.querySelectorAll?.("[data-code-block-id]");
          if (childWrappers && childWrappers.length > 0) {
            childWrappers.forEach((wrapper) => {
              nextTick(() => mountCodeViewer(wrapper as HTMLElement));
            });
          }
        }
      }

      // Check for removed nodes that were code block wrappers
      for (const node of Array.from(mutation.removedNodes)) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;

          // Check if the removed node is a code block wrapper
          const id = element.getAttribute?.("data-code-block-id");
          if (id) {
            unmountCodeViewer(id);
          }

          // Check children for code block wrappers
          const childWrappers = element.querySelectorAll?.("[data-code-block-id]");
          if (childWrappers) {
            childWrappers.forEach((wrapper) => {
              const childId = wrapper.getAttribute("data-code-block-id");
              if (childId) {
                unmountCodeViewer(childId);
              }
            });
          }
        }
      }
    }
  }

  /**
   * Start observing for DOM changes
   */
  function startObserver(): void {
    if (!contentRef.value || observer) return;

    observer = new MutationObserver(handleMutations);
    observer.observe(contentRef.value, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Stop observing DOM changes
   */
  function stopObserver(): void {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  // Watch for contentRef changes to set up/tear down observer
  watch(
    contentRef,
    (newRef, oldRef) => {
      if (oldRef && !newRef) {
        // Content ref was removed - clean up
        stopObserver();
        unmountAllCodeViewers();
      } else if (newRef && !oldRef) {
        // Content ref was added - set up
        startObserver();
        // Mount any existing code blocks
        nextTick(() => mountCodeViewers());
      }
    },
    { immediate: true }
  );

  // Clean up on unmount
  onUnmounted(() => {
    stopObserver();
    unmountAllCodeViewers();
  });

  return {
    mountCodeViewers,
    unmountCodeViewer,
    unmountAllCodeViewers,
    getMountedCount,
  };
}
