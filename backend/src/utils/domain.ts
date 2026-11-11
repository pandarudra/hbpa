import { env } from '../config/env';
import { Errors } from './errors';

/** Extract the domain portion of an email, normalised to lowercase. */
export function extractDomain(email: string): string {
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2 || !parts[1]) {
    throw Errors.invalidToken('Malformed email address in token');
  }
  return parts[1];
}

/** Return true if domain is in the ALLOWED_EMAIL_DOMAINS list (exact match). */
export function isAllowedDomain(domain: string): boolean {
  return env.ALLOWED_EMAIL_DOMAINS.includes(domain);
}

/** Throw DOMAIN_NOT_ALLOWED if the email's domain is not in the allowlist. */
export function assertAllowedDomain(email: string): void {
  const domain = extractDomain(email);
  if (!isAllowedDomain(domain)) {
    throw Errors.domainNotAllowed();
  }
}
