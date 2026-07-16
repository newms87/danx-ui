<!--
/**
 * CollapseTransition - Reusable height-based expand/collapse animation
 *
 * Wraps a single, conditionally-rendered (v-if) child and animates its
 * height between 0 and its natural content height on enter/leave, using
 * the classic Vue JS-hooks + CSS-transition pattern:
 * - The height is measured via `scrollHeight` and set explicitly so the
 *   CSS `height` transition has concrete start/end values to animate
 *   between (height cannot transition to/from `auto` directly).
 * - After entering, height is cleared to `auto` so the content can resize
 *   naturally (e.g. window resize, dynamic content) without re-animating.
 * - `prefers-reduced-motion` is handled automatically: the CSS transition
 *   duration is neutralized library-wide by the shared reduced-motion
 *   token override, so no bespoke JS branching is needed here.
 *
 * Intentionally generic — used by DanxAccordion today and reusable for
 * any future component needing an auto-height collapse (e.g. DanxDrawer,
 * DanxSidebar).
 *
 * ## Usage
 *   <CollapseTransition>
 *     <div v-if="isOpen">Panel content</div>
 *   </CollapseTransition>
 *
 * ## CSS Tokens
 *   --dx-collapse-duration - Transition duration (default: --duration-200)
 *   --dx-collapse-ease     - Transition easing (default: --ease-out)
 */
-->

<script setup lang="ts">
/**
 * Waits for the `height` property transition to finish on `el`, then calls
 * `done`. Falls back to calling `done` immediately if the element has no
 * transition duration (e.g. `transition: none`).
 */
function onceHeightTransitionEnds(el: HTMLElement, done: () => void) {
  function handler(event: TransitionEvent) {
    if (event.target !== el || event.propertyName !== "height") return;
    el.removeEventListener("transitionend", handler);
    done();
  }

  el.addEventListener("transitionend", handler);
}

function onEnter(element: Element, done: () => void) {
  const el = element as HTMLElement;
  el.style.height = "0px";

  requestAnimationFrame(() => {
    el.style.height = `${el.scrollHeight}px`;
  });

  onceHeightTransitionEnds(el, done);
}

function onAfterEnter(element: Element) {
  const el = element as HTMLElement;
  el.style.height = "auto";
}

function onEnterCancelled(element: Element) {
  const el = element as HTMLElement;
  el.style.height = "";
}

function onLeave(element: Element, done: () => void) {
  const el = element as HTMLElement;
  el.style.height = `${el.scrollHeight}px`;
  // Force a reflow so the browser registers the explicit start height
  // before it's changed below, otherwise the transition won't run.
  void el.offsetHeight;

  requestAnimationFrame(() => {
    el.style.height = "0px";
  });

  onceHeightTransitionEnds(el, done);
}

function onAfterLeave(element: Element) {
  const el = element as HTMLElement;
  el.style.height = "";
}
</script>

<template>
  <Transition
    name="dx-collapse"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @enter-cancelled="onEnterCancelled"
    @leave="onLeave"
    @after-leave="onAfterLeave"
    @leave-cancelled="onEnterCancelled"
  >
    <slot />
  </Transition>
</template>
