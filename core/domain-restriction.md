# How Domain Restriction Works

Domain restriction in the Horizon Portal is implemented as a strict, defense-in-depth gate.

## Zero-Trust Server-Side Boundary

Frontend checks are purely for UX guidance (such as rendering the authorized domains hint `@hbplus.fit`). The **security boundary lives exclusively in the backend service** (`backend/src/utils/domain.ts`). Even if an attacker uses Postman, cURL, or a modified web client to submit a token, the backend enforces the check independently.

## Domain Extraction & Normalisation

Domain parsing is implemented in `backend/src/utils/domain.ts`:

```typescript
export function extractDomain(email: string): string {
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2 || !parts[1]) {
    throw Errors.invalidToken("Malformed email address in token");
  }
  return parts[1];
}
```

- **Trimming & Lowercasing**: Eliminates whitespace and guarantees case-insensitive evaluation (`User@HBPlus.FIT` becomes `hbplus.fit`).
- **Delimiter Check**: Verifies that exactly one `@` symbol is present, preventing email header injection or malformed strings.

## Exact Match Validation

```typescript
export function isAllowedDomain(domain: string): boolean {
  return env.ALLOWED_EMAIL_DOMAINS.includes(domain);
}
```

The domain must match an entry in `ALLOWED_EMAIL_DOMAINS` **exactly**. Substring matches, prefix matches, and wildcard matches are rejected by design.

## Attack Vector Prevention

| Attack Vector                 | Example Email                  | Evaluated Domain          | Result      | Why It Fails                                                                   |
| ------------------------------ | ------------------------------- | -------------------------- | ----------- | -------------------------------------------------------------------------------- |
| **Standard Unauthorised**     | `user@gmail.com`               | `gmail.com`               | ❌ REJECTED | `gmail.com` is not in the allowlist.                                           |
| **Subdomain Hijack**          | `user@sub.hbplus.fit`          | `sub.hbplus.fit`          | ❌ REJECTED | Exact match required. Subdomains are not allowed unless explicitly listed.     |
| **Suffix / Domain Shadowing** | `user@hbplus.fit.attacker.com` | `hbplus.fit.attacker.com` | ❌ REJECTED | Full domain is evaluated; cannot fool with prefix.                             |
| **Hyphen Spoofing**           | `user@hbplus-fit.com`          | `hbplus-fit.com`          | ❌ REJECTED | Exact string equality check fails.                                             |
| **Unverified Email Claim**    | `spoofed@hbplus.fit`           | `hbplus.fit`              | ❌ REJECTED | Backend checks `decoded.email_verified === true` from Google's crypto payload. |
| **Case Variation**            | `user@HBPlus.FIT`              | `hbplus.fit`              | ✅ ALLOWED  | Normalised to lowercase prior to comparison.                                   |
| **Legitimate User**           | `alex@hbplus.fit`              | `hbplus.fit`              | ✅ ALLOWED  | Exact match against `ALLOWED_EMAIL_DOMAINS`.                                   |

## Configuring Allowed Domains

Allowed domains are configured via environment variables in `backend/.env`.

### Single Domain

```env
ALLOWED_EMAIL_DOMAINS=hbplus.fit
```

### Multiple Domains

```env
ALLOWED_EMAIL_DOMAINS=hbplus.fit,partner.org,acme.com
```

Any modification to `backend/.env` takes effect immediately upon restarting the backend service—no recompilation or code change required.
