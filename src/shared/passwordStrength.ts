/**
 * Password Strength Utility
 *
 * Rule-based password strength scoring — no external dependency (e.g.
 * zxcvbn). Scores length, character-class variety, and penalizes common
 * weak patterns (sequential runs, repeated characters, common passwords).
 */

/** Result of scoring a password's strength */
export interface PasswordStrengthResult {
  /** Strength score from 0 (weakest) to 4 (strongest) */
  score: 0 | 1 | 2 | 3 | 4;
  /** Human-readable label for the score */
  label: string;
}

/** Score labels, indexed by score (0-4) */
const STRENGTH_LABELS = ["Weak", "Weak", "Fair", "Good", "Strong"] as const;

/**
 * A small set of extremely common passwords / keyboard patterns. Not
 * exhaustive — just enough to catch the most obvious weak choices that
 * would otherwise score well on length/variety alone.
 */
const COMMON_PASSWORDS = new Set([
  "password",
  "12345678",
  "123456789",
  "1234567890",
  "qwerty",
  "qwerty123",
  "letmein",
  "admin",
  "welcome",
  "iloveyou",
  "monkey",
  "dragon",
  "football",
  "abc123",
  "password1",
  "passw0rd",
  "trustno1",
]);

/** Returns true when `value` contains a run of 3+ identical characters (e.g. "aaaa") */
function hasRepeatedRun(value: string): boolean {
  for (let i = 0; i < value.length - 2; i++) {
    if (value[i] === value[i + 1] && value[i + 1] === value[i + 2]) return true;
  }
  return false;
}

/** Returns true when `value` contains a run of 3+ sequential characters (e.g. "abc", "321") */
function hasSequentialRun(value: string): boolean {
  for (let i = 0; i < value.length - 2; i++) {
    const a = value.charCodeAt(i);
    const b = value.charCodeAt(i + 1);
    const c = value.charCodeAt(i + 2);
    if (b - a === 1 && c - b === 1) return true;
    if (a - b === 1 && b - c === 1) return true;
  }
  return false;
}

/**
 * Scores a password's strength using rule-based heuristics.
 *
 * Pure function — safe to call outside of a component (e.g. to gate a
 * submit button headlessly) as well as from the DanxInput `showStrength` UI.
 *
 * @param value - The password value to score
 * @returns The strength score (0-4) and its label
 */
export function passwordStrength(value: string): PasswordStrengthResult {
  if (!value) return { score: 0, label: STRENGTH_LABELS[0] };

  let score = 0;

  if (value.length >= 8) score++;
  if (value.length >= 12) score++;

  const hasLower = /[a-z]/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasDigit = /\d/.test(value);
  const hasSymbol = /[^a-zA-Z0-9]/.test(value);
  const classCount = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;

  if (classCount >= 3) score++;
  if (classCount === 4) score++;

  if (COMMON_PASSWORDS.has(value.toLowerCase())) score -= 2;
  if (hasSequentialRun(value.toLowerCase())) score--;
  if (hasRepeatedRun(value)) score--;

  const clamped = Math.max(0, Math.min(4, score)) as PasswordStrengthResult["score"];

  return { score: clamped, label: STRENGTH_LABELS[clamped] };
}
