/**
 * DanxLoadingOverlay Type Definitions
 */

export interface DanxLoadingOverlayProps {
  /**
   * Controls visibility of the overlay. Use with v-model:show.
   * @default false
   */
  show?: boolean;

  /**
   * Optional message displayed beneath the spinner.
   * Ignored when the `message` slot is used.
   */
  message?: string;

  /**
   * Screen reader label for the overlay's busy status.
   * @default "Loading..."
   */
  ariaLabel?: string;
}

export interface DanxLoadingOverlaySlots {
  /**
   * Overrides the default spinner markup.
   */
  spinner?: () => unknown;

  /**
   * Overrides the default message text. Falls back to the `message` prop.
   */
  message?: () => unknown;
}
