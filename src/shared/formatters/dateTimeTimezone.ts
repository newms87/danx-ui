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
  serverTz = new IANAZone(timezone);
}

/** Converts a date string from the server's time zone to the user's local zone */
export function localizedDateTime(dateTimeString: string): DateTime {
  const normalized = dateTimeString?.replace("T", " ");
  return DateTime.fromSQL(normalized, { zone: serverTz }).setZone("local");
}

/** Converts a date string from the user's local zone to the server's time zone */
export function remoteDateTime(dateTimeString: string): DateTime {
  const normalized = dateTimeString?.replace("T", " ");
  return DateTime.fromSQL(normalized, { zone: "local" }).setZone(serverTz);
}
