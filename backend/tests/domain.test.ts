/**
 * Domain utility tests — no Firebase, no network.
 * These run with ALLOWED_EMAIL_DOMAINS mocked via env.
 */

// Set env before importing the module under test
process.env.NODE_ENV = 'test';
process.env.ALLOWED_EMAIL_DOMAINS = 'hbplus.fit,acme.com';
process.env.SESSION_SECRET = 'test-secret-must-be-at-least-32-chars-long';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.GOOGLE_WEB_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_APPLICATION_CREDENTIALS = '/dev/null'; // bypass validation

import { extractDomain, isAllowedDomain, assertAllowedDomain } from '../src/utils/domain';
import { AppError } from '../src/utils/errors';

describe('extractDomain', () => {
  it('extracts domain from a normal email', () => {
    expect(extractDomain('user@hbplus.fit')).toBe('hbplus.fit');
  });
  it('normalises to lowercase', () => {
    expect(extractDomain('User@HBPLUS.FIT')).toBe('hbplus.fit');
  });
  it('trims surrounding whitespace', () => {
    expect(extractDomain('  user@hbplus.fit  ')).toBe('hbplus.fit');
  });
  it('throws on email with no @', () => {
    expect(() => extractDomain('notanemail')).toThrow(AppError);
  });
});

describe('isAllowedDomain', () => {
  it('allows hbplus.fit', () => expect(isAllowedDomain('hbplus.fit')).toBe(true));
  it('allows acme.com (second in list)', () => expect(isAllowedDomain('acme.com')).toBe(true));
  it('rejects gmail.com', () => expect(isAllowedDomain('gmail.com')).toBe(false));
  it('rejects sub.hbplus.fit', () => expect(isAllowedDomain('sub.hbplus.fit')).toBe(false));
  it('rejects not-hbplus.fit', () => expect(isAllowedDomain('not-hbplus.fit')).toBe(false));
  it('rejects hbplus.fit.attacker.com', () => expect(isAllowedDomain('hbplus.fit.attacker.com')).toBe(false));
  it('rejects empty string', () => expect(isAllowedDomain('')).toBe(false));
});

describe('assertAllowedDomain', () => {
  it('passes for allowed domain', () => {
    expect(() => assertAllowedDomain('alice@hbplus.fit')).not.toThrow();
  });
  it('throws DOMAIN_NOT_ALLOWED for gmail', () => {
    expect(() => assertAllowedDomain('alice@gmail.com')).toThrow(
      expect.objectContaining({ code: 'DOMAIN_NOT_ALLOWED', statusCode: 403 }),
    );
  });
  it('throws DOMAIN_NOT_ALLOWED for spoofed domain', () => {
    expect(() => assertAllowedDomain('alice@hbplus.fit.evil.com')).toThrow(
      expect.objectContaining({ code: 'DOMAIN_NOT_ALLOWED' }),
    );
  });
});
