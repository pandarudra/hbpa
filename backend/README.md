# Horizon Backend API

The authoritative backend service for the **Horizon Portal**. It validates Google OAuth ID tokens, strictly enforces email domain allowlists, manages encrypted cookie sessions, and handles role-based access control (RBAC).

---

## Key Responsibilities

1. **Cryptographic Token Verification**: Validates incoming Google/Firebase ID tokens against Google JWKS and project audience.
2. **Domain Restriction Enforcement**: Strict allowlist check ensuring only `@hbplus.fit` (or other configured domains) can authenticate.
3. **Session Management**: Issues and validates encrypted, `HttpOnly`, `SameSite=strict` session cookies using `iron-session`.
4. **User Store & RBAC**: Persists and manages user profiles and roles in Cloud Firestore using the Firebase Admin SDK.

---

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create `backend/.env` from `backend/.env.example`:

```bash
cp .env.example .env
```

| Variable | Description | Example |
|---|---|---|
| `ALLOWED_EMAIL_DOMAINS` | Comma-separated list of allowed domains (exact match) | `hbplus.fit` or `hbplus.fit,acme.com` |
| `SESSION_SECRET` | 32+ character random string for sealing cookies | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `SESSION_MAX_AGE` | Cookie lifetime in seconds (default: 8 hours) | `28800` |
| `FIREBASE_PROJECT_ID` | Your Firebase / GCP project ID | `hbplus-portal` |
| `GOOGLE_WEB_CLIENT_ID` | Google OAuth 2.0 Web Client ID | `xxx.apps.googleusercontent.com` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Absolute path to Firebase service account JSON | `/path/to/service-account.json` |
| `PORT` | HTTP port to listen on | `4000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins | `http://localhost:8081,http://localhost:19006` |

### 3. Run Development Server

```bash
npm run dev
```

Server runs at `http://localhost:4000`. Test health:
```bash
curl http://localhost:4000/health
# {"status":"ok"}
```

---

## Authentication Flow

```
POST /api/auth/google { idToken }
   │
   ├── 1. verifyIdToken(idToken) via Firebase Admin or Google OAuth2Client
   │      - Validates signature against Google's public keys
   │      - Validates audience matches GOOGLE_WEB_CLIENT_ID / FIREBASE_PROJECT_ID
   │      - Validates expiration and email_verified === true
   │
   ├── 2. assertAllowedDomain(email)
   │      - Normalises email to lowercase and extracts domain
   │      - Checks domain against ALLOWED_EMAIL_DOMAINS
   │      - Throws 403 DOMAIN_NOT_ALLOWED if unauthorised
   │
   ├── 3. upsertUser() in Firestore
   │      - New user: creates doc with role: "USER", status: "ACTIVE"
   │      - Returning user: merges lastLoginAt (preserves role & status)
   │
   └── 4. Seal iron-session cookie
          - Attaches encrypted hbp_session cookie (HttpOnly, SameSite=strict)
          - Returns { success: true, user }
```

---

## How Domain Restriction Works

Domain restriction is handled in `src/utils/domain.ts`:

1. **Extraction**:
   ```typescript
   export function extractDomain(email: string): string {
     const parts = email.trim().toLowerCase().split('@');
     if (parts.length !== 2 || !parts[1]) {
       throw Errors.invalidToken('Malformed email address in token');
     }
     return parts[1];
   }
   ```
2. **Exact Matching**:
   ```typescript
   export function isAllowedDomain(domain: string): boolean {
     return env.ALLOWED_EMAIL_DOMAINS.includes(domain);
   }
   ```
3. **Enforcement**:
   ```typescript
   export function assertAllowedDomain(email: string): void {
     const domain = extractDomain(email);
     if (!isAllowedDomain(domain)) {
       throw Errors.domainNotAllowed();
     }
   }
   ```

Subdomains (e.g. `sub.hbplus.fit`) and suffix injections (e.g. `hbplus.fit.attacker.com`) are rejected because the comparison requires an exact equality match against elements in `ALLOWED_EMAIL_DOMAINS`.

---

## API Routes

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/auth/google` | Public | Authenticates via Google ID token & sets session cookie |
| `POST` | `/api/auth/logout` | Public | Destroys current session cookie |
| `GET` | `/api/auth/me` | Session | Returns profile of currently logged-in user |
| `GET` | `/api/dashboard` | Session | Returns dashboard data for authenticated user |
| `GET` | `/api/admin/users` | Admin | Lists paginated users (supports `?role=` & `?status=`) |
| `PATCH` | `/api/admin/users/:id/role` | Admin | Updates user role (`USER` or `ADMIN`) |
| `GET` | `/health` | Public | Service health probe |

---

## Testing

Run unit tests for domain restriction and edge cases:

```bash
npm test
```
