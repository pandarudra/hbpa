import { firebaseAuth, firestore } from "../../config/firebase";
import { OAuth2Client, type TokenPayload } from "google-auth-library";

import { FieldValue } from "firebase-admin/firestore";
import { env } from "../../config/env";
import { Errors } from "../../utils/errors";
import { assertAllowedDomain } from "../../utils/domain";

export type UserRole = "USER" | "ADMIN";
export type UserStatus = "ACTIVE" | "DISABLED";

export interface AppUser {
  uid: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: FirebaseFirestore.Timestamp;
  lastLoginAt?: FirebaseFirestore.Timestamp;
}

type VerifiedToken = {
  uid: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

const googleClient = new OAuth2Client();

/** Verify the Google ID token, enforce domain, upsert user, return profile. */
export async function verifyAndLogin(idToken: string): Promise<AppUser> {
  // Firebase Auth ID tokens are accepted for native Firebase clients.
  // The web client uses expo-auth-session and sends Google's OIDC ID token,
  // which must be verified against the Google OAuth web client ID instead.
  let decoded: VerifiedToken;
  try {
    const firebaseToken = await firebaseAuth.verifyIdToken(idToken, true);
    decoded = firebaseToken;
  } catch (firebaseError: unknown) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: env.GOOGLE_WEB_CLIENT_ID,
      });
      const googleToken = ticket.getPayload() as TokenPayload | undefined;
      if (!googleToken?.sub || !googleToken.email) {
        throw new Error("Google token is missing its subject or email");
      }
      decoded = {
        uid: googleToken.sub,
        email: googleToken.email,
        email_verified: googleToken.email_verified,
        name: googleToken.name,
        picture: googleToken.picture,
      };
    } catch {
      const e = firebaseError as { code?: string };
      throw Errors.invalidToken(
        e.code === "auth/id-token-revoked" ? "Token revoked" : undefined,
      );
    }
  }

  // 1. Email must be verified by Google
  if (!decoded.email || !decoded.email_verified) throw Errors.emailNotVerified();

  // 2. Domain allowlist (throws DOMAIN_NOT_ALLOWED if not allowed)
  assertAllowedDomain(decoded.email);

  // 3. Upsert user in Firestore; this also creates first-time users.
  return upsertUser(decoded);
}

async function upsertUser(
  decoded: VerifiedToken,
): Promise<AppUser> {
  const ref = firestore.collection("users").doc(decoded.uid);
  const snap = await ref.get();
  const now = FieldValue.serverTimestamp();

  const updateData = {
    uid: decoded.uid,
    provider: "google",
    email: decoded.email!.toLowerCase().trim(),
    emailVerified: true,
    name: decoded.name ?? "",
    avatarUrl: decoded.picture ?? "",
    updatedAt: now,
    lastLoginAt: now,
  };

  if (!snap.exists) {
    // First login — set defaults that must never be overwritten by merge
    await ref.set({
      ...updateData,
      role: "USER",
      status: "ACTIVE",
      createdAt: now,
    });
  } else {
    // Subsequent logins — merge: does NOT touch role or status
    await ref.set(updateData, { merge: true });
  }

  // Check if the account has been disabled since last login
  const fresh = await ref.get();
  const data = fresh.data() as AppUser;
  if (data.status === "DISABLED") throw Errors.accountDisabled();

  return data;
}

/** Fetch current user, throwing if disabled. */
export async function getUserById(uid: string): Promise<AppUser> {
  const snap = await firestore.collection("users").doc(uid).get();
  if (!snap.exists) throw Errors.unauthenticated();
  const data = snap.data() as AppUser;
  if (data.status === "DISABLED") throw Errors.accountDisabled();
  return data;
}
