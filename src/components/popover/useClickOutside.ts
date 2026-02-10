/**
 * useClickOutside - Detects clicks outside specified elements
 *
 * Adds a mousedown listener on document that fires a callback when the click
 * target is outside both the trigger and panel elements. Automatically cleans
 * up the listener when the scope is disposed.
 *
 * @param trigger - Ref to the trigger element
 * @param panel - Ref to the panel element
 * @param callback - Function to call when a click outside is detected
 * @param isActive - Ref controlling whether detection is active
 */
import { onScopeDispose, type Ref, watch } from "vue";

export function useClickOutside(
  trigger: Ref<HTMLElement | null>,
  panel: Ref<HTMLElement | null>,
  callback: () => void,
  isActive: Ref<boolean>
): void {
  function onMousedown(event: MouseEvent): void {
    const target = event.target as Node;
    if (trigger.value?.contains(target)) return;
    if (panel.value?.contains(target)) return;
    callback();
  }

  let listening = false;

  function addListener(): void {
    if (!listening) {
      document.addEventListener("mousedown", onMousedown);
      listening = true;
    }
  }

  function removeListener(): void {
    if (listening) {
      document.removeEventListener("mousedown", onMousedown);
      listening = false;
    }
  }

  watch(
    isActive,
    (active) => {
      if (active) {
        addListener();
      } else {
        removeListener();
      }
    },
    { immediate: true, flush: "sync" }
  );

  onScopeDispose(() => {
    removeListener();
  });
}
