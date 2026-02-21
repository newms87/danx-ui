import { ref, onMounted, onUnmounted } from "vue";

/**
 * Reactive dark mode detection.
 *
 * Watches the `<html>` element for the `.dark` class and returns a ref
 * that stays in sync with the current theme. Cleans up the MutationObserver
 * on component unmount.
 */
export function useIsDark() {
  const isDark = ref(document.documentElement.classList.contains("dark"));
  let observer: MutationObserver | null = null;

  onMounted(() => {
    observer = new MutationObserver(() => {
      isDark.value = document.documentElement.classList.contains("dark");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
  });

  onUnmounted(() => {
    observer?.disconnect();
  });

  return { isDark };
}
