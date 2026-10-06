/**
 * UK Postcode & Checkout Form Validation Utilities
 * BargainStore.uk Launch Readiness
 */

export const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates a UK postcode against the standard Royal Mail format regex.
 * Accepts formats such as: SW1A 1AA, M1 1AE, B33 8TH, CR2 6XH, DN55 1PT, W1A 0AX, EC1A 1BB
 * Case-insensitive and tolerates varying space counts or no spaces.
 */
export function isValidUKPostcode(postcode: string | null | undefined): boolean {
  if (!postcode || typeof postcode !== "string") {
    return false;
  }
  const trimmed = postcode.trim();
  if (trimmed.length < 5 || trimmed.length > 8) {
    // Standard UK postcodes are 5 to 7 characters without spaces, up to 8 with space
    const noSpace = trimmed.replace(/\s+/g, "");
    if (noSpace.length < 5 || noSpace.length > 7) {
      return false;
    }
  }
  return UK_POSTCODE_REGEX.test(trimmed);
}

// Case alias for flexibility
export const validateUkPostcode = isValidUKPostcode;

/**
 * Normalizes a valid UK postcode to standard Royal Mail spacing (e.g., 'sw1a1aa' -> 'SW1A 1AA').
 */
export function formatUKPostcode(postcode: string | null | undefined): string {
  if (!postcode || typeof postcode !== "string") {
    return "";
  }
  const clean = postcode.trim().toUpperCase().replace(/\s+/g, "");
  if (clean.length < 5) {
    return postcode.trim().toUpperCase();
  }
  const outward = clean.slice(0, -3);
  const inward = clean.slice(-3);
  return `${outward} ${inward}`;
}

export const formatUkPostcode = formatUKPostcode;

export interface PostcodeValidationResult {
  isValid: boolean;
  error?: string;
  formatted?: string;
}

/**
 * Validates and provides descriptive user-facing error messages for UK postcode inputs.
 */
export function validateUKPostcode(postcode: string | null | undefined): PostcodeValidationResult {
  if (!postcode || typeof postcode !== "string" || !postcode.trim()) {
    return {
      isValid: false,
      error: "UK postcode is required (e.g. SW1A 1AA or M1 1AE).",
    };
  }

  const trimmed = postcode.trim();
  if (!isValidUKPostcode(trimmed)) {
    return {
      isValid: false,
      error: "Please enter a valid UK postcode format (e.g. SW1A 1AA or M1 1AE).",
    };
  }

  return {
    isValid: true,
    formatted: formatUKPostcode(trimmed),
  };
}

/**
 * Validates standard email address syntax.
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Basic sanitization utility for trimming strings.
 */
export function sanitizeInput(value: string | null | undefined): string {
  if (!value || typeof value !== "string") {
    return "";
  }
  return value.trim();
}
