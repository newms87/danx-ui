/**
 * Lightweight unique ID generator.
 *
 * Uses a monotonic counter + random suffix to guarantee uniqueness within a page session.
 * Does NOT depend on crypto.randomUUID(), which requires a secure context (HTTPS)
 * and is unavailable in headless browsers loaded over HTTP.
 */
let counter = 0;

export function uid(): string {
  return `${++counter}-${Math.random().toString(36).slice(2, 8)}`;
}
