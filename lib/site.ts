/**
 * Canonical Site URL configuration & helpers.
 * Primary canonical base URL: https://www.bargainstore.uk.com
 * Configurable via NEXT_PUBLIC_SITE_URL environment variable.
 */

export const SITE_URL: string = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.bargainstore.uk.com"
).replace(/\/+$/, "");

export const canonicalBase: URL = new URL(SITE_URL);

/**
 * Returns an absolute canonical URL for a given relative or absolute path.
 * Strips duplicate slashes and preserves already-absolute URLs.
 */
export function getAbsoluteUrl(path: string = ""): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath === "/" ? "" : cleanPath}`;
}
