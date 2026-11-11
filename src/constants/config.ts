// All environment variables consumed by the client.
// EXPO_PUBLIC_* values are inlined at build time — never put secrets here.

const config = {
  googleWebClientId:
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    '900025146927-86shkecin7qgq3aekngbc28jtat6c6tc.apps.googleusercontent.com',
  googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',

  firebase: {
    apiKey:
      process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
      'AIzaSyCsGZl022G1iD1UolzyFNJx6nOLUtnEUek',
    authDomain:
      process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
      'project-65ef0413-3058-4d6f-9cf.firebaseapp.com',
    projectId:
      process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
      'project-65ef0413-3058-4d6f-9cf',
  },

  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:4000',

  allowedDomains: process.env.EXPO_PUBLIC_ALLOWED_DOMAINS
    ? process.env.EXPO_PUBLIC_ALLOWED_DOMAINS.split(',').map((d: string) => d.trim().toLowerCase()).filter(Boolean)
    : ['hbplus.fit', 'outr.ac.in'],
} as const;

export default config;
