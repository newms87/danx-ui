/**
 * Reference-counted body scroll lock.
 *
 * Module-scoped (not per-component) so multiple simultaneously-open
 * DanxDrawer instances share one lock: the body only unlocks once every
 * lock holder has released it.
 */

let lockCount = 0;

export function lockBodyScroll() {
  lockCount++;
  if (lockCount === 1) {
    document.body.style.overflow = "hidden";
  }
}

export function unlockBodyScroll() {
  if (lockCount === 0) return;
  lockCount--;
  if (lockCount === 0) {
    document.body.style.overflow = "";
  }
}
