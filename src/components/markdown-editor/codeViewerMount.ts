/**
 * Code Viewer Mounting
 *
 * Extracted from useCodeBlockManager. Handles creating and mounting a Vue app
 * with a CodeViewer component inside a code block wrapper element. Manages
 * reactive state (content, language) via watchers on the code block state map.
 */

import { App, computed, createApp, h, nextTick, ref, watch } from "vue";
import CodeViewer from "../code-viewer/CodeViewer.vue";
import { CodeBlockState } from "./useCodeBlocks";

/**
 * Mounted CodeViewer instance tracking
 */
export interface MountedInstance {
  app: App;
  mountPoint: HTMLElement;
}

/**
 * Dependencies for mounting a code viewer
 */
export interface MountCodeViewerDeps {
  codeBlocks: Map<string, CodeBlockState>;
  mountedInstances: Map<string, MountedInstance>;
  mountedWatchers: Map<string, () => void>;
  updateCodeBlockContent: (id: string, content: string) => void;
  updateCodeBlockLanguage: (id: string, language: string) => void;
  onCodeBlockExit?: (id: string) => void;
  onCodeBlockDelete?: (id: string) => void;
  onCodeBlockMounted?: (id: string, wrapper: HTMLElement) => void;
  /** When true, CodeViewers are non-editable with hidden footers */
  readonly?: boolean;
}

/**
 * Map language aliases to CodeViewer format
 */
export function mapLanguageToFormat(language: string): string {
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
 * Create and mount a CodeViewer instance for a code block wrapper element.
 * Skips if already mounted or if the wrapper has no valid ID/mount point.
 */
export function mountCodeViewer(wrapper: HTMLElement, deps: MountCodeViewerDeps): void {
  const {
    codeBlocks,
    mountedInstances,
    mountedWatchers,
    updateCodeBlockContent,
    updateCodeBlockLanguage,
    onCodeBlockExit,
    onCodeBlockDelete,
    onCodeBlockMounted,
    readonly: isReadonly,
  } = deps;

  const id = wrapper.getAttribute("data-code-block-id");
  if (!id) return;

  if (mountedInstances.has(id)) return;

  const mountPoint = wrapper.querySelector(".code-viewer-mount-point") as HTMLElement;
  if (!mountPoint) return;

  const state = codeBlocks.get(id);
  const initialContent = state?.content ?? mountPoint.getAttribute("data-content") ?? "";
  const initialLanguage = state?.language ?? mountPoint.getAttribute("data-language") ?? "";

  if (!state) {
    codeBlocks.set(id, { id, content: initialContent, language: initialLanguage });
  }

  const reactiveContent = ref(initialContent);
  const reactiveLanguage = ref(initialLanguage);

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

  mountedWatchers.set(id, () => {
    stopContentWatcher();
    stopLanguageWatcher();
  });

  const app = createApp({
    setup() {
      const onUpdateModelValue = (value: object | string | null) => {
        const content = typeof value === "string" ? value : JSON.stringify(value);
        updateCodeBlockContent(id, content);
      };

      const onUpdateFormat = (format: string) => {
        updateCodeBlockLanguage(id, format);
      };

      const onExit = () => {
        if (onCodeBlockExit) onCodeBlockExit(id);
      };

      const onDelete = () => {
        if (onCodeBlockDelete) onCodeBlockDelete(id);
      };

      const computedFormat = computed(
        () =>
          mapLanguageToFormat(reactiveLanguage.value) as import("../code-viewer/types").CodeFormat
      );

      return () =>
        h(CodeViewer, {
          modelValue: reactiveContent.value,
          format: computedFormat.value,
          canEdit: !isReadonly,
          editable: !isReadonly,
          allowAnyLanguage: !isReadonly,
          hideFooter: !!isReadonly,
          class: "code-block-island",
          "onUpdate:modelValue": onUpdateModelValue,
          "onUpdate:format": onUpdateFormat,
          onExit,
          onDelete,
        });
    },
  });

  mountPoint.innerHTML = "";
  app.mount(mountPoint);
  mountedInstances.set(id, { app, mountPoint });

  if (onCodeBlockMounted) {
    nextTick(() => {
      onCodeBlockMounted(id, wrapper);
    });
  }
}
