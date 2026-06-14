/**
 * sleep — await a fixed delay.
 *
 * @param delay - milliseconds to wait
 * @example
 *   await sleep(500);
 */
export function sleep(delay: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delay));
}
