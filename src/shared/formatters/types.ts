/**
 * Shared Formatter Types
 *
 * Type definitions used across number, string, and date/time formatters.
 */

/** Options for date/time formatting functions */
export interface FormatDateOptions {
  format?: string;
  empty?: string;
}

/** Options for fPercent */
export interface FPercentOptions {
  multiplier?: number;
  maximumFractionDigits?: number;
  NaN?: string;
}

/** Options for fShortNumber / fShortCurrency */
export interface ShortNumberOptions {
  round?: boolean;
}

/** A generic named item for fNameOrCount */
export interface NamedItem {
  id?: string | number;
  name?: string;
  title?: string;
}
