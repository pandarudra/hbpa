import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),

  // ── Domain allowlist ──────────────────────────────────────────────────────
  // Comma-separated exact domain names, e.g. "hbplus.fit,acme.com"
  ALLOWED_EMAIL_DOMAINS: z
    .string()
    .min(1, 'ALLOWED_EMAIL_DOMAINS must not be empty')
    .transform((val) =>
      val
        .split(',')
        .map((d) => d.trim().toLowerCase())
        .filter(Boolean),
    ),

  // ── Session ───────────────────────────────────────────────────────────────
  SESSION_SECRET: z
    .string()
    .min(32, 'SESSION_SECRET must be at least 32 characters'),
  SESSION_MAX_AGE: z.coerce.number().default(28800),

  // ── Firebase ──────────────────────────────────────────────────────────────
  FIREBASE_PROJECT_ID: z.string().min(1, 'FIREBASE_PROJECT_ID is required'),
  GOOGLE_WEB_CLIENT_ID: z.string().min(1, 'GOOGLE_WEB_CLIENT_ID is required'),
  // One of these two must be set
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  FIREBASE_SERVICE_ACCOUNT_JSON: z.string().optional(),

  // ── CORS ──────────────────────────────────────────────────────────────────
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:8081')
    .transform((val) => val.split(',').map((o) => o.trim())),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌  Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

// Validate that at least one Firebase credential option is provided
if (!env.GOOGLE_APPLICATION_CREDENTIALS && !env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  console.error(
    '❌  Provide GOOGLE_APPLICATION_CREDENTIALS (file path) OR FIREBASE_SERVICE_ACCOUNT_JSON (base64) in .env',
  );
  process.exit(1);
}
