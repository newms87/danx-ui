/**
 * Number Formatting Utilities
 *
 * Functions for formatting numbers as currency, percentages,
 * short-hand notation, file sizes, and booleans.
 */

import type { FPercentOptions, ShortNumberOptions } from "./types";

/** Formats an amount into USD currency format (e.g., "$1,234.56") */
export function fCurrency(amount: number, options?: Intl.NumberFormatOptions): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "$-";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    ...options,
  }).format(amount);
}

/** Formats an amount into USD currency format without cents (e.g., "$1,235") */
export function fCurrencyNoCents(amount: number, options?: Intl.NumberFormatOptions): string {
  return fCurrency(amount, {
    maximumFractionDigits: 0,
    ...options,
  });
}

/** Formats a number with locale-aware separators (e.g., "1,234") */
export function fNumber(number: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat("en-US", options).format(number);
}

/** Formats a currency in shorthand (e.g., "$1.2M", "$5K") */
export function fShortCurrency(value: string | number, options?: ShortNumberOptions): string {
  return "$" + fShortNumber(value, options);
}

/** Formats a number in shorthand (e.g., "1.2M", "5K") */
export function fShortNumber(value: string | number, options?: ShortNumberOptions): string {
  if (value === "" || value === null || value === undefined) {
    return "-";
  }

  const shorts = [
    { pow: 3, unit: "K" },
    { pow: 6, unit: "M" },
    { pow: 9, unit: "B" },
    { pow: 12, unit: "T" },
    { pow: 15, unit: "Q" },
  ];

  const n = Math.round(+value);
  const short =
    shorts.find(({ pow }) => Math.pow(10, pow) < n && Math.pow(10, pow + 3) > n) || null;

  if (short) {
    const scaled = n / Math.pow(10, short.pow);
    return options?.round ? scaled + short.unit : scaled.toFixed(scaled > 100 ? 0 : 1) + short.unit;
  }

  return String(n);
}

/** Formats a byte count into human-readable size (e.g., "1 KB", "5 MB") */
export function fShortSize(value: string | number): string {
  const powers = [
    { pow: 0, unit: "B" },
    { pow: 10, unit: "KB" },
    { pow: 20, unit: "MB" },
    { pow: 30, unit: "GB" },
    { pow: 40, unit: "TB" },
    { pow: 50, unit: "PB" },
    { pow: 60, unit: "EB" },
    { pow: 70, unit: "ZB" },
    { pow: 80, unit: "YB" },
  ];

  const n = Math.round(+value);
  const power =
    powers.find((_p, i) => {
      const nextPower = powers[i + 1];
      return !nextPower || n < Math.pow(2, nextPower.pow + 10);
    }) ?? powers[powers.length - 1]!;

  const div = Math.pow(2, power.pow);
  return Math.round(n / div) + " " + power.unit;
}

/** Formats a boolean-like value as "Yes", "No", or "-" */
export function fBoolean(value?: boolean | string | null): string {
  if (value === "Yes" || value === "No") {
    return value;
  }
  return value === undefined || value === null ? "-" : value ? "Yes" : "No";
}

/** Formats a number as a percentage (e.g., "45.2%") */
export function fPercent(num: string | number, options: FPercentOptions = {}): string {
  const opts = {
    multiplier: 100,
    maximumFractionDigits: 1,
    NaN: "N/A",
    ...options,
  };

  const parsed = parseFloat("" + num);

  if (isNaN(parsed)) {
    return opts.NaN;
  }

  return fNumber(parsed * opts.multiplier, opts) + "%";
}
