/**
 * useDanxFileNavigator - Navigation state composable for DanxFileNavigator
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
import type { PreviewFile } from "../danx-file/types";

export interface UseDanxFileNavigatorOptions {
  file: Ref<PreviewFile>;
  relatedFiles: Ref<PreviewFile[]>;
  onNavigate?: (file: PreviewFile) => void;
}

export interface UseDanxFileNavigatorReturn {
  /** The currently displayed file */
  currentFile: Ref<PreviewFile>;
  /** Index of current file in the root file list */
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
  /** Navigate to a specific file */
  goTo: (file: PreviewFile) => void;
  /** Stack of parent files when diving into children */
  childStack: Ref<PreviewFile[]>;
  /** Dive into a child file, pushing the current file onto the stack */
  diveIntoChild: (child: PreviewFile) => void;
  /** Return from a child to the parent file */
  backFromChild: () => void;
  /** Whether we are currently viewing a child (stack is non-empty) */
  hasParent: Ref<boolean>;
  /** All files (anchor + related, deduped) */
  allFiles: Ref<PreviewFile[]>;
  /** Reset navigation to the anchor file */
  reset: () => void;
}

export function useDanxFileNavigator(
  options: UseDanxFileNavigatorOptions
): UseDanxFileNavigatorReturn {
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

  const currentIndex = computed(() => {
    if (childStack.value.length > 0) return -1;
    return allFiles.value.findIndex((f) => f.id === currentFile.value.id);
  });

  const hasNext = computed(() => {
    if (childStack.value.length > 0) return false;
    return currentIndex.value < allFiles.value.length - 1;
  });

  const hasPrev = computed(() => {
    if (childStack.value.length > 0) return false;
    return currentIndex.value > 0;
  });

  const slideLabel = computed(() => {
    if (childStack.value.length > 0) return "";
    if (allFiles.value.length <= 1) return "";
    const idx = currentIndex.value;
    if (idx < 0) return "";
    return `${idx + 1} / ${allFiles.value.length}`;
  });

  const hasParent = computed(() => childStack.value.length > 0);

  function setCurrentFile(f: PreviewFile) {
    currentFile.value = f;
    onNavigate?.(f);
  }

  function next() {
    if (!hasNext.value) return;
    setCurrentFile(allFiles.value[currentIndex.value + 1]!);
  }

  function prev() {
    if (!hasPrev.value) return;
    setCurrentFile(allFiles.value[currentIndex.value - 1]!);
  }

  function goTo(f: PreviewFile) {
    childStack.value = [];
    setCurrentFile(f);
  }

  function diveIntoChild(child: PreviewFile) {
    childStack.value = [...childStack.value, currentFile.value];
    setCurrentFile(child);
  }

  function backFromChild() {
    if (childStack.value.length === 0) return;
    const parent = childStack.value[childStack.value.length - 1]!;
    childStack.value = childStack.value.slice(0, -1);
    setCurrentFile(parent);
  }

  function reset() {
    childStack.value = [];
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
    diveIntoChild,
    backFromChild,
    hasParent,
    allFiles,
    reset,
  };
}
