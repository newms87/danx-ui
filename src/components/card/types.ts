/**
 * DanxCard Type Definitions
 */

/**
 * Visual treatment of the card surface.
 * - "elevated": surface color + shadow, no border
 * - "outlined": surface color + border, no shadow (default)
 * - "flat": no border, no shadow — just background + radius
 */
export type CardVariant = "elevated" | "outlined" | "flat";

/**
 * Padding density applied to the header/body/footer slots.
 */
export type CardPadding = "compact" | "comfortable" | "spacious";

export interface DanxCardProps {
  /**
   * Visual treatment of the card surface.
   * @default "outlined"
   */
  variant?: CardVariant;

  /**
   * Padding density applied to the header/body/footer slots.
   * @default "comfortable"
   */
  padding?: CardPadding;

  /**
   * Convenience heading rendered in the header slot when no `header` slot
   * content is provided. Ignored if the `header` slot is used.
   */
  title?: string;

  /**
   * Convenience subheading rendered below the title when no `header` slot
   * content is provided. Ignored if the `header` slot is used.
   */
  subtitle?: string;
}

export interface DanxCardSlots {
  /** Header region. Falls back to the title/subtitle props when omitted. */
  header?(): unknown;
  /** Main body content. */
  default?(): unknown;
  /** Footer region (e.g. actions). */
  footer?(): unknown;
}
