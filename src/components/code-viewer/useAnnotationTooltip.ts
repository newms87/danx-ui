/**
 * Annotation Tooltip Composable
 *
 * Provides hover tooltip behavior for code annotations. When the mouse enters
 * an element with a data-annotation-msg attribute, the tooltip appears positioned
 * near the cursor. When the mouse leaves the annotation area, the tooltip hides.
 */

import { type CSSProperties, type Ref, ref } from "vue";

export interface UseAnnotationTooltipReturn {
  tooltipVisible: Ref<boolean>;
  tooltipMessage: Ref<string>;
  tooltipType: Ref<string>;
  tooltipStyle: Ref<CSSProperties>;
  onCodeMouseOver: (event: MouseEvent) => void;
  onCodeMouseOut: (event: MouseEvent) => void;
}

export function useAnnotationTooltip(): UseAnnotationTooltipReturn {
  const tooltipVisible = ref(false);
  const tooltipMessage = ref("");
  const tooltipType = ref("error");
  const tooltipStyle = ref<CSSProperties>({});

  /**
   * Find the closest ancestor (or self) with a data-annotation-msg attribute.
   */
  function findAnnotationElement(target: HTMLElement): HTMLElement | null {
    let el: HTMLElement | null = target;
    while (el) {
      if (el.dataset?.annotationMsg) return el;
      if (el.classList?.contains("code-content")) return null;
      el = el.parentElement;
    }
    return null;
  }

  function onCodeMouseOver(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const annotationEl = findAnnotationElement(target);

    if (!annotationEl) {
      return;
    }

    const message = annotationEl.dataset.annotationMsg!;

    // Extract type from class list
    let type = "error";
    if (annotationEl.classList.contains("dx-annotation--warning")) type = "warning";
    else if (annotationEl.classList.contains("dx-annotation--info")) type = "info";

    tooltipMessage.value = message;
    tooltipType.value = type;

    // Position the tooltip below the annotation element
    const rect = annotationEl.getBoundingClientRect();
    const codeContent = annotationEl.closest(".code-content");
    const containerRect = codeContent?.getBoundingClientRect();

    if (containerRect) {
      tooltipStyle.value = {
        position: "absolute",
        left: `${rect.left - containerRect.left + 16}px`,
        top: `${rect.bottom - containerRect.top + 4}px`,
        zIndex: 100,
      };
    }

    tooltipVisible.value = true;
  }

  function onCodeMouseOut(event: MouseEvent): void {
    const relatedTarget = event.relatedTarget as HTMLElement | null;

    // If moving to another annotation element, don't hide
    if (relatedTarget) {
      const annotationEl = findAnnotationElement(relatedTarget);
      if (annotationEl) return;
    }

    tooltipVisible.value = false;
  }

  return {
    tooltipVisible,
    tooltipMessage,
    tooltipType,
    tooltipStyle,
    onCodeMouseOver,
    onCodeMouseOut,
  };
}
