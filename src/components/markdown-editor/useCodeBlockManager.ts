import { Ref } from "vue";
import { CodeBlockState } from "./useCodeBlocks";
import {
  mountCodeViewer as mountCodeViewerFn,
  MountedInstance,
  MountCodeViewerDeps,
} from "./codeViewerMount";
import { useDomObserver } from "./useDomObserver";

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
  /** When true, CodeViewers are non-editable with hidden footers */
  readonly?: boolean;
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
    readonly,
  } = options;

  const mountedInstances = new Map<string, MountedInstance>();
  const mountedWatchers = new Map<string, () => void>();

  const mountDeps: MountCodeViewerDeps = {
    codeBlocks,
    mountedInstances,
    mountedWatchers,
    updateCodeBlockContent,
    updateCodeBlockLanguage,
    onCodeBlockExit,
    onCodeBlockDelete,
    onCodeBlockMounted,
    readonly,
  };

  function mountCodeViewer(wrapper: HTMLElement): void {
    mountCodeViewerFn(wrapper, mountDeps);
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

  // Set up DOM observer for code block wrappers
  useDomObserver({
    contentRef,
    dataAttribute: "data-code-block-id",
    onNodeAdded: (el) => mountCodeViewer(el),
    onNodeRemoved: (el) => {
      const id = el.getAttribute("data-code-block-id");
      if (id) {
        unmountCodeViewer(id);
      }
    },
    onCleanup: () => unmountAllCodeViewers(),
    onInitialMount: () => mountCodeViewers(),
  });

  return {
    mountCodeViewers,
    unmountCodeViewer,
    unmountAllCodeViewers,
    getMountedCount,
  };
}
