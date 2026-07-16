/**
 * useEscapeKey - Closes a popover when the Escape key is pressed
 *
 * Thin wrapper around useHotkeys scoped to the "escape" combo, active only
 * while isActive is true.
 *
 * @param callback - Function to call when Escape is pressed
 * @param isActive - Ref controlling whether the listener is active
 */
import type { Ref } from "vue";
import { useHotkeys } from "../../shared/composables/useHotkeys";

export function useEscapeKey(callback: () => void, isActive: Ref<boolean>): void {
  useHotkeys("escape", callback, { enabled: isActive });
}
