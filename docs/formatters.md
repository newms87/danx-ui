# Formatters

Utility functions for formatting numbers, strings, and dates. Date/time functions use [Luxon](https://moment.github.io/luxon/) as an optional peer dependency.

## Installation

Luxon is only required if you use the date/time formatters:

```bash
npm install luxon
# or
yarn add luxon
```

## Number Formatters

### fCurrency(amount, options?)

Formats a number as USD currency.

```ts
fCurrency(1234.56)        // "$1,234.56"
fCurrency(NaN)            // "$-"
```

### fCurrencyNoCents(amount, options?)

Currency without decimal places.

```ts
fCurrencyNoCents(1234.56) // "$1,235"
```

### fNumber(number, options?)

Locale-aware number formatting.

```ts
fNumber(1234567)           // "1,234,567"
fNumber(3.14, { maximumFractionDigits: 1 }) // "3.1"
```

### fShortNumber(value, options?)

Shorthand notation (K, M, B, T, Q).

```ts
fShortNumber(5000)         // "5.0K"
fShortNumber(1200000)      // "1.2M"
fShortNumber(150000)       // "150K"
fShortNumber(500)          // "500"
```

### fShortCurrency(value, options?)

Currency in shorthand notation.

```ts
fShortCurrency(5000)       // "$5.0K"
fShortCurrency(1200000)    // "$1.2M"
```

### fShortSize(value)

Byte count as human-readable file size.

```ts
fShortSize(500)            // "500 B"
fShortSize(5242880)        // "5120 KB"
```

### fBoolean(value?)

Formats boolean-like values as "Yes", "No", or "-".

```ts
fBoolean(true)   // "Yes"
fBoolean(false)  // "No"
fBoolean(null)   // "-"
fBoolean("Yes")  // "Yes" (pass-through)
```

### fPercent(num, options?)

Formats a decimal as a percentage.

```ts
fPercent(0.452)            // "45.2%"
fPercent(0.85)             // "85%"
fPercent("abc")            // "N/A"
fPercent(45, { multiplier: 1 }) // "45%"
```

## String Formatters

### centerTruncate(str, maxLength)

Truncates from the middle, preserving start and end.

```ts
centerTruncate("A very long filename.pdf", 15) // "A very...me.pdf"
centerTruncate("short.txt", 15)                // "short.txt"
```

### fPhone(value)

Formats a phone number string.

```ts
fPhone("5551234567")   // "(555) 123-4567"
fPhone("15551234567")  // "+1 (555) 123-4567"
```

### fNameOrCount(items, label)

Returns a name for a single item, or a count for arrays.

```ts
fNameOrCount([{ name: "A" }, { name: "B" }], "items")  // "2 items"
fNameOrCount({ title: "Report" }, "reports")             // "Report"
```

## Date/Time Formatters

All date/time functions require Luxon as a peer dependency.

### Parsing

#### parseDateTime(dateTime)

Universal parser — accepts strings, numbers (milliseconds), or Luxon DateTime objects.

```ts
parseDateTime("2024-01-15")           // DateTime
parseDateTime(1700000000000)          // DateTime from millis
parseDateTime(existingDateTime)       // pass-through
```

#### parseGenericDateTime(dateTimeString, defaultZone?)

Tries 12 common formats (US before European), then ISO and SQL fallbacks.

```ts
parseGenericDateTime("01/15/2024")    // Jan 15 (US-style)
parseGenericDateTime("25/01/2024")    // Jan 25 (European, day > 12)
parseGenericDateTime("2024-01-15T10:30:00Z") // ISO with timezone
```

#### parseSqlDateTime(dateTime)

Parses SQL-formatted strings (handles T separator and slash separators).

#### parseSlashDate(date, format?) / parseSlashDateTime(date, format?)

Parses slash-delimited dates. Default format: `yyyy/MM/dd`.

### Timezone

#### getServerTimezone() / setServerTimezone(timezone)

Configurable server timezone (default: "America/Chicago").

```ts
setServerTimezone("America/New_York");
getServerTimezone().name // "America/New_York"
```

#### localizedDateTime(dateTimeString)

Converts a server-timezone string to the user's local timezone.

#### remoteDateTime(dateTimeString)

Converts a local-timezone string to the server's timezone.

### Formatting

#### fDate(dateTime, options?)

Short date format. Default: `M/d/yy`.

```ts
fDate("2024-01-15")              // "1/15/24"
fDate("2024-01-15", { format: "yyyy-MM-dd" }) // "2024-01-15"
fDate(null)                      // "--"
```

#### fDateTime(dateTime, options?)

Date and time format. Default: `M/d/yy h:mma`.

```ts
fDateTime("2024-01-15 14:30:00") // "1/15/24 2:30pm"
```

#### fSlashDate(date)

Formats as `yyyy/MM/dd`.

#### fLocalizedDateTime(dateTimeString, options?)

Converts from server timezone then formats.

#### dbDateTime(dateTime)

Formats as `yyyy-MM-dd HH:mm:ss` for database storage.

#### fDateTimeMs(dateTime, options?)

Includes millisecond precision: `M/d/yy H:mm:ss.SSS`.

### Durations

#### fSecondsToTime(seconds)

Clock format: `mm:ss` or `H:mm:ss`.

```ts
fSecondsToTime(3661) // "1:01:01"
fSecondsToTime(125)  // "02:05"
```

#### fSecondsToDuration(seconds)

Human-readable duration.

```ts
fSecondsToDuration(3661) // "1h 1m 1s"
```

#### fMillisecondsToDuration(ms)

Includes millisecond precision.

```ts
fMillisecondsToDuration(3661500) // "1h 1m 1s 500ms"
```

#### fDuration(start, end?)

Duration between two date/time values. If `end` is omitted, uses now.

```ts
fDuration("2024-01-15 10:00:00", "2024-01-15 11:30:45") // "1h 30m 45s"
```

#### fTimeAgo(dateTime)

Relative time string.

```ts
fTimeAgo(fiveSecondsAgo) // "a few seconds ago"
fTimeAgo(twoMinutesAgo)  // "2 minutes ago"
fTimeAgo(yesterday)       // "yesterday"
fTimeAgo(lastMonth)       // "Apr 15, 2024"
```

## Types

```ts
interface FormatDateOptions {
  format?: string;
  empty?: string;
}

interface FPercentOptions {
  multiplier?: number;
  maximumFractionDigits?: number;
  NaN?: string;
}

interface ShortNumberOptions {
  round?: boolean;
}

interface NamedItem {
  id?: string | number;
  name?: string;
  title?: string;
}
```
