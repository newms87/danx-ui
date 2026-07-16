/**
 * Derives up to two initials from a display name.
 *
 * Takes the first letter of the first two whitespace-separated words,
 * uppercased. A single word yields just its first letter. Blank/whitespace
 * input yields an empty string.
 */
export function getInitials(name: string | undefined): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return "";
  }
  const first = words[0]!.charAt(0);
  const second = words.length > 1 ? words[1]!.charAt(0) : "";
  return (first + second).toUpperCase();
}
