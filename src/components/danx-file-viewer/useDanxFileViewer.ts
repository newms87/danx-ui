/**
 * useDanxFileViewer - Navigation state composable for DanxFileViewer
 *
 * Manages the current file, navigation between related files, child stack
 * (for diving into children like transcodes or PDF pages), and slide labels.
 *
 * @param options.file - Reactive ref of the primary/anchor file
 * @param options.relatedFiles - Reactive ref of related files for carousel
 * @param options.onNavigate - Optional callback when navigation occurs
 *
 * @returns Navigation state and methods
 */

import { computed, ref, type Ref, watch } from "vue";
import { hasChildren } from "../danx-file/file-helpers";
import type { PreviewFile } from "../danx-file/types";

export interface UseDanxFileViewerOptions {
  file: Ref<PreviewFile>;
  relatedFiles: Ref<PreviewFile[]>;
  onNavigate?: (file: PreviewFile) => void;
}

export interface UseDanxFileViewerReturn {
  /** The currently displayed file */
  currentFile: Ref<PreviewFile>;
  /** Index of current file in the active file list */
  currentIndex: Ref<number>;
  /** Whether there is a next file to navigate to */
  hasNext: Ref<boolean>;
  /** Whether there is a previous file to navigate to */
  hasPrev: Ref<boolean>;
  /** Slide label like "3 / 10" */
  slideLabel: Ref<string>;
  /** Navigate to the next file */
  next: () => void;
  /** Navigate to the previous file */
  prev: () => void;
  /** Navigate to a specific file (stays in current level) */
  goTo: (file: PreviewFile) => void;
  /** Stack of parent files when diving into children */
  childStack: Ref<PreviewFile[]>;
  /** Dive into children of the current file (navigate to first child) */
  diveIntoChildren: () => void;
  /** Return from a child to the parent file */
  backFromChild: () => void;
  /** Navigate to a specific ancestor in the child stack by file ID */
  navigateToAncestor: (fileId: string) => void;
  /** Breadcrumb entries: [...ancestors, currentFile]. Empty at root level. */
  breadcrumbs: Ref<{ id: string; name: string }[]>;
  /** Whether we are currently viewing a child (stack is non-empty) */
  hasParent: Ref<boolean>;
  /** Whether the current file has children to dive into */
  hasChildFiles: Ref<boolean>;
  /** All root-level files (anchor + related, deduped) */
  allFiles: Ref<PreviewFile[]>;
  /** The files currently being navigated (root files or children depending on level) */
  activeFiles: Ref<PreviewFile[]>;
  /** Reset navigation to the anchor file */
  reset: () => void;
}

export function useDanxFileViewer(options: UseDanxFileViewerOptions): UseDanxFileViewerReturn {
  const { file, relatedFiles, onNavigate } = options;

  // Build the full list: anchor file + related files (deduped by id)
  const allFiles = computed(() => {
    const files = [file.value, ...relatedFiles.value];
    const seen = new Set<string>();
    return files.filter((f) => {
      if (seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });
  });

  const currentFile = ref<PreviewFile>(file.value) as Ref<PreviewFile>;
  const childStack = ref<PreviewFile[]>([]);
  const childFiles = ref<PreviewFile[]>([]);

  // Active files: children when in child mode, root files otherwise
  const activeFiles = computed(() => {
    if (childStack.value.length > 0) return childFiles.value;
    return allFiles.value;
  });

  const currentIndex = computed(() => {
    return activeFiles.value.findIndex((f) => f.id === currentFile.value.id);
  });

  const hasNext = computed(() => {
    return currentIndex.value < activeFiles.value.length - 1;
  });

  const hasPrev = computed(() => {
    return currentIndex.value > 0;
  });

  const slideLabel = computed(() => {
    if (activeFiles.value.length <= 1) return "";
    const idx = currentIndex.value;
    if (idx < 0) return "";
    return `${idx + 1} / ${activeFiles.value.length}`;
  });

  const hasParent = computed(() => childStack.value.length > 0);
  const hasChildFiles = computed(() => hasChildren(currentFile.value));

  function setCurrentFile(f: PreviewFile) {
    currentFile.value = f;
    onNavigate?.(f);
  }

  function next() {
    if (!hasNext.value) return;
    setCurrentFile(activeFiles.value[currentIndex.value + 1]!);
  }

  function prev() {
    if (!hasPrev.value) return;
    setCurrentFile(activeFiles.value[currentIndex.value - 1]!);
  }

  function goTo(f: PreviewFile) {
    if (childStack.value.length === 0) {
      setCurrentFile(f);
    } else {
      // Stay in child mode — navigate within children
      setCurrentFile(f);
    }
  }

  function diveIntoChildren() {
    const children = currentFile.value.children;
    if (!children || children.length === 0) return;
    childStack.value = [...childStack.value, currentFile.value];
    childFiles.value = children;
    setCurrentFile(children[0]!);
  }

  function backFromChild() {
    if (childStack.value.length === 0) return;
    const parent = childStack.value[childStack.value.length - 1]!;
    childStack.value = childStack.value.slice(0, -1);
    // Restore childFiles: if still in child mode, use the new top-of-stack's children
    if (childStack.value.length > 0) {
      const newParent = childStack.value[childStack.value.length - 1]!;
      childFiles.value = newParent.children ?? [];
    } else {
      childFiles.value = [];
    }
    setCurrentFile(parent);
  }

  function navigateToAncestor(fileId: string) {
    // Find the ancestor in the stack
    const ancestorIndex = childStack.value.findIndex((f) => f.id === fileId);
    if (ancestorIndex === -1) return;
    // The ancestor becomes the current file; slice stack to before it
    const ancestor = childStack.value[ancestorIndex]!;
    childStack.value = childStack.value.slice(0, ancestorIndex);
    // Restore childFiles for the new level
    if (childStack.value.length > 0) {
      const newParent = childStack.value[childStack.value.length - 1]!;
      childFiles.value = newParent.children ?? [];
    } else {
      childFiles.value = [];
    }
    setCurrentFile(ancestor);
  }

  const breadcrumbs = computed(() => {
    if (childStack.value.length === 0) return [];
    return [
      ...childStack.value.map((f) => ({ id: f.id, name: f.name })),
      { id: currentFile.value.id, name: currentFile.value.name },
    ];
  });

  function reset() {
    childStack.value = [];
    childFiles.value = [];
    setCurrentFile(file.value);
  }

  // Reset when the anchor file changes
  watch(file, () => reset());

  return {
    currentFile,
    currentIndex,
    hasNext,
    hasPrev,
    slideLabel,
    next,
    prev,
    goTo,
    childStack,
    diveIntoChildren,
    backFromChild,
    navigateToAncestor,
    breadcrumbs,
    hasParent,
    hasChildFiles,
    allFiles,
    activeFiles,
    reset,
  };
}
