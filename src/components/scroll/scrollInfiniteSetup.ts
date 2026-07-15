/**
 * setupScrollInfinite - wires DanxScroll/DanxVirtualScroll's `infiniteScroll`
 * prop to the useScrollInfinite composable, without statically importing the
 * `@vueuse/core`-dependent module.
 *
 * DXUI-35: DanxScroll/DanxVirtualScroll are used internally by DanxFileViewer
 * (main-barrel component) with `infiniteScroll` unset. A top-level
 * `import ... from "./useScrollInfinite"` here would pull `@vueuse/core` into
 * every consumer of DanxScroll, including ones that never opt into infinite
 * scroll. The dynamic `import()` below only resolves that module — and thus
 * the optional peer — when `infiniteScroll` is actually true.
 */
import { onMounted, toRef, type Ref } from "vue";
import type { DanxScrollProps } from "./types";

export function setupScrollInfinite(
  viewportEl: Ref<HTMLElement | null>,
  props: DanxScrollProps,
  emit: (event: "loadMore") => void
) {
  if (!props.infiniteScroll) return;

  onMounted(async () => {
    const { useScrollInfinite } = await import("./useScrollInfinite");
    useScrollInfinite(viewportEl, {
      distance: props.distance,
      direction: props.infiniteDirection,
      canLoadMore: toRef(props, "canLoadMore") as Ref<boolean>,
      loading: toRef(props, "loading") as Ref<boolean>,
      onLoadMore: () => emit("loadMore"),
    });
  });
}
