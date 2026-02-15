/**
 * Nested JSON Toggle Composable
 *
 * Manages toggle state for nested JSON strings detected during syntax highlighting.
 * Each nested JSON instance is identified by a deterministic ID and can be toggled
 * between expanded (pretty-printed) and raw (escaped string) views.
 *
 * Provides event delegation via handleClick for use with v-html content where
 * Vue event bindings are unavailable. Toggle indicators in the highlighted HTML
 * use data-nested-json-toggle attributes that this composable listens for.
 *
 * @returns
 *   isExpanded(id) - Whether a nested JSON instance shows parsed view (default: true)
 *   toggle(id) - Flip the expanded/raw state for an instance
 *   handleClick(event) - Event delegation handler for click events on toggle indicators
 *   toggleVersion - Reactive counter that increments on toggle, used as computed dependency
 *   reset() - Clear all toggle states (call when content changes)
 */

import { ref } from "vue";

export function useNestedJsonToggle() {
  const state = new Map<string, boolean>();
  const toggleVersion = ref(0);

  function isExpanded(id: string): boolean {
    return state.get(id) ?? true;
  }

  function toggle(id: string): void {
    state.set(id, !isExpanded(id));
    toggleVersion.value++;
  }

  function handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    // Walk up from clicked element to find toggle attribute
    const toggleEl = target.closest("[data-nested-json-toggle]") as HTMLElement | null;
    if (toggleEl) {
      const id = toggleEl.dataset.nestedJsonToggle;
      if (id) {
        toggle(id);
      }
    }
  }

  function reset(): void {
    state.clear();
    toggleVersion.value++;
  }

  return { isExpanded, toggle, handleClick, toggleVersion, reset };
}
