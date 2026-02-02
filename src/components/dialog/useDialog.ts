import { ref, type Ref } from "vue";

/**
 * useDialog Composable
 *
 * Manages dialog open/close state independently of any component.
 * Can be used with DanxDialog component or native <dialog> element.
 *
 * Usage with DanxDialog:
 * ```typescript
 * const { isOpen, open, close } = useDialog();
 * // <DanxDialog v-model="isOpen" />
 * ```
 *
 * Usage with native dialog:
 * ```typescript
 * const dialogRef = ref<HTMLDialogElement>();
 * const { isOpen, open, close } = useDialog();
 *
 * watch(isOpen, (open) => {
 *   if (open) dialogRef.value?.showModal();
 *   else dialogRef.value?.close();
 * });
 * ```
 *
 * @returns Object with isOpen ref and control methods
 */
export interface UseDialogReturn {
  /** Ref indicating if dialog is open - works with v-model */
  isOpen: Ref<boolean>;
  /** Open the dialog */
  open: () => void;
  /** Close the dialog */
  close: () => void;
  /** Toggle dialog open/close state */
  toggle: () => void;
}

export function useDialog(initialOpen = false): UseDialogReturn {
  const isOpen = ref(initialOpen);

  function open() {
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
  }

  function toggle() {
    isOpen.value = !isOpen.value;
  }

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
