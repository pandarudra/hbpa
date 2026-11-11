import admin from 'firebase-admin';
import { env } from './env';

function initFirebase(): admin.app.App {
  if (admin.apps.length > 0) return admin.apps[0]!;

  let credential: admin.credential.Credential;

  if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    // Base64-encoded service account JSON (ideal for containers / cloud deployments)
    const json = Buffer.from(env.FIREBASE_SERVICE_ACCOUNT_JSON, 'base64').toString('utf-8');
    const serviceAccount = JSON.parse(json) as admin.ServiceAccount;
    credential = admin.credential.cert(serviceAccount);
  } else {
    // GOOGLE_APPLICATION_CREDENTIALS env var points to the JSON file
    credential = admin.credential.applicationDefault();
  }

  return admin.initializeApp({ credential, projectId: env.FIREBASE_PROJECT_ID });
}

export const firebaseApp = initFirebase();
export const firebaseAuth = firebaseApp.auth();
export const firestore = firebaseApp.firestore();
