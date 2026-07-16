/**
 * DateTime Timezone Utilities
 *
 * Configurable server timezone and functions for converting between
 * server and local time zones using Luxon.
 */

import { DateTime, IANAZone } from "luxon";

let serverTz = new IANAZone("America/Chicago");

/** Returns the current server timezone as an IANAZone */
export function getServerTimezone(): IANAZone {
  return serverTz;
}

/** Sets the server timezone (e.g., "America/New_York") */
export function setServerTimezone(timezone: string): void {
  const zone = new IANAZone(timezone);
  if (!zone.isValid) {
    throw new Error(`Invalid IANA timezone identifier: "${timezone}"`);
  }
  serverTz = zone;
}

/** Converts a date string from the server's time zone to the user's local zone */
export function localizedDateTime(dateTimeString: string): DateTime | null {
  const normalized = dateTimeString?.replace("T", " ");
  const parsed = DateTime.fromSQL(normalized, { zone: serverTz }).setZone("local");
  return parsed.isValid ? parsed : null;
}

/** Converts a date string from the user's local zone to the server's time zone */
export function remoteDateTime(dateTimeString: string): DateTime | null {
  const normalized = dateTimeString?.replace("T", " ");
  const parsed = DateTime.fromSQL(normalized, { zone: "local" }).setZone(serverTz);
  return parsed.isValid ? parsed : null;
}
