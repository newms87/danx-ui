/**
 * Validates that a URL is safe to use in href/src attributes.
 * Blocks executable schemes (javascript:, data:, vbscript:) to prevent XSS.
 * Allows: http, https, mailto, tel, relative paths, fragments, no-scheme URLs.
 */
export function isSafeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  const trimmed = url.trim();

  // Empty string is not safe
  if (!trimmed) {
    return false;
  }

  // Extract the scheme (everything before the first colon)
  const colonIndex = trimmed.indexOf(':');
  if (colonIndex === -1) {
    // No scheme found - relative URL, fragment, or no-scheme URL
    // These are safe as long as they don't contain suspicious patterns
    return true;
  }

  const scheme = trimmed.substring(0, colonIndex).toLowerCase();

  // Blocklist of dangerous schemes
  const dangerousSchemes = ['javascript', 'data', 'vbscript'];
  if (dangerousSchemes.includes(scheme)) {
    return false;
  }

  // Allowlist of safe schemes
  const safeSchemes = ['http', 'https', 'mailto', 'tel', 'ftp', 'ftps'];
  if (safeSchemes.includes(scheme)) {
    return true;
  }

  // Fragment-only URLs (start with #)
  if (trimmed.startsWith('#')) {
    return true;
  }

  // Default to false for unknown schemes
  return false;
}

/**
 * Neutralizes a URL by replacing it with an empty string if it's not safe.
 * Used as a replacement strategy in link/image parsing.
 */
export function neutralizeUnsafeUrl(url: string): string {
  return isSafeUrl(url) ? url : '';
}
