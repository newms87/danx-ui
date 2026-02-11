/**
 * String Formatting Utilities
 *
 * Functions for formatting strings: truncation, phone numbers, and name/count display.
 */

import type { NamedItem } from "./types";

/** Truncates a string by removing characters from the middle */
export function centerTruncate(str: string, maxLength: number): string {
  if (str.length > maxLength) {
    const frontCharCount = Math.floor((maxLength - 3) / 2);
    const backCharCount = maxLength - frontCharCount - 3;
    return str.substring(0, frontCharCount) + "..." + str.substring(str.length - backCharCount);
  }
  return str;
}

/** Formats a phone number string into readable format (e.g., "(555) 123-4567") */
export function fPhone(value: string | number): string {
  if (!value || typeof value !== "string") {
    return (value as string) || "";
  }

  const input = value.replace(/\D/g, "").split("");
  let phone = "";

  const startsWithOne = input.length > 0 && input[0] === "1";
  const shift = startsWithOne ? 1 : 0;

  input.forEach((digit, index) => {
    switch (index) {
      case shift:
        phone += "(";
        break;
      case shift + 3:
        phone += ") ";
        break;
      case shift + 6:
        phone += "-";
        break;
      case shift + 10:
        phone += " x";
        break;
    }
    if (index === 0 && digit === "1") {
      phone += "+1 ";
    } else {
      phone += digit;
    }
  });

  if (value === "+1 (") {
    return "";
  }

  return phone;
}

/** Returns an item's name or a count label for arrays */
export function fNameOrCount(items: NamedItem[] | NamedItem, label: string): string {
  return Array.isArray(items)
    ? `${items.length} ${label}`
    : `${items ? items.title || items.name || items.id : ""}`;
}
