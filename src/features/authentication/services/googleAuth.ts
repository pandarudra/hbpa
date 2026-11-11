import { Platform } from "react-native";
import config from "@/constants/config";

/**
 * Returns a Google ID token using the platform-appropriate method.
 *
 * Web  → expo-auth-session (PKCE OAuth popup)
 * Native (Android/iOS) → @react-native-google-signin/google-signin
 *
 * Returns null if the user cancelled.
 * Throws on network or configuration errors.
 */
export async function getGoogleIdToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return getGoogleIdTokenWeb();
  }
  return getGoogleIdTokenNative();
}

// ─── Web ──────────────────────────────────────────────────────────────────────

async function getGoogleIdTokenWeb(): Promise<string | null> {
  // Dynamically import to avoid bundling in native builds
  const { loadAsync, makeRedirectUri, ResponseType } =
    await import("expo-auth-session");

  const redirectUri = makeRedirectUri({
    scheme: "com.hbplus.app",
    path: "auth/callback",
  });

  const request = await loadAsync(
    {
      clientId: config.googleWebClientId,
      redirectUri,
      responseType: ResponseType.IdToken,
      scopes: ["openid", "email", "profile"],
      extraParams: { nonce: Math.random().toString(36).slice(2) },
      usePKCE: false,
    },
    { authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth" },
  );

  const result = await request.promptAsync({
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  });

  if (result.type !== "success") return null;

  const idToken = result.params?.id_token;
  if (!idToken)
    throw { code: "UNKNOWN", message: "No id_token in OAuth response" };
  return idToken;
}

// ─── Native ───────────────────────────────────────────────────────────────────

async function getGoogleIdTokenNative(): Promise<string | null> {
  // Dynamically import so web bundle never includes the native SDK
  const { GoogleSignin, statusCodes } =
    await import("@react-native-google-signin/google-signin");

  GoogleSignin.configure({
    webClientId: config.googleWebClientId,
    iosClientId: config.googleIosClientId,
    offlineAccess: false,
  });

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();

    // SDK v13+ returns { data: { idToken, ... } }
    const idToken = response.data?.idToken ?? null;
    return idToken;
  } catch (error: unknown) {
    const e = error as { code?: string };
    if (e.code === statusCodes.SIGN_IN_CANCELLED) return null;
    if (e.code === statusCodes.IN_PROGRESS) return null;
    throw {
      code: "NETWORK_ERROR",
      message: "Google Sign-In failed. Please try again.",
    };
  }
}

/** Sign out from Google on the device (native only; web session ends via cookie). */
export async function googleSignOut(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const { GoogleSignin } =
      await import("@react-native-google-signin/google-signin");
    await GoogleSignin.signOut();
  } catch {
    // Best-effort; don't block app logout
  }
}
