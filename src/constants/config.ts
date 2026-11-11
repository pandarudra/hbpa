// All environment variables consumed by the client.
// EXPO_PUBLIC_* values are inlined at build time — never put secrets here.

const config = {
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
  googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',

  firebase: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  },

  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:4000',

  allowedDomains: process.env.EXPO_PUBLIC_ALLOWED_DOMAINS
    ? process.env.EXPO_PUBLIC_ALLOWED_DOMAINS.split(',').map((d: string) => d.trim().toLowerCase()).filter(Boolean)
    : ['hbplus.fit', 'outr.ac.in'],
} as const;

export default config;
