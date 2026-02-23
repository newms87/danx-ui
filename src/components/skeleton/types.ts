/**
 * DanxSkeleton Type Definitions
 */

/**
 * Skeleton shape variants.
 * - rectangle: Sharp-cornered block (images, banners, generic areas)
 * - circle: Perfect circle (avatars, profile images)
 * - text: Multiple pill-shaped rows with gap, last line shortened (paragraphs)
 * - rounded: Block with configurable border-radius (cards, buttons)
 */
export type SkeletonShape = "rectangle" | "circle" | "text" | "rounded";

/**
 * Skeleton animation styles.
 * - pulse: Opacity oscillation (simple, lightweight)
 * - wave: Gradient sweep left-to-right (more visually engaging)
 */
export type SkeletonAnimation = "pulse" | "wave";

export interface DanxSkeletonProps {
  /**
   * Geometry of the placeholder.
   * @default "rectangle"
   */
  shape?: SkeletonShape;

  /**
   * Animation style.
   * @default "pulse"
   */
  animation?: SkeletonAnimation;

  /**
   * Number of text lines (only used when shape="text").
   * @default 3
   */
  lines?: number;

  /**
   * Screen reader label.
   * @default "Loading..."
   */
  ariaLabel?: string;
}
