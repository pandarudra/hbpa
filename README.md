# HB Plus — Domain-Restricted Google Auth Platform

Cross-platform (Android · iOS · Web) authentication app.  
Only Google accounts whose email domain is listed in `ALLOWED_EMAIL_DOMAINS` are granted access.

---

## What You Need to Provide

Before the app can run, complete **two external setups** (Google Cloud + Firebase).  
Everything else is already built.

---

## Step 1 — Google Cloud Console

> **URL:** https://console.cloud.google.com

### 1-A  Create a project
1. Click the project dropdown → **New Project**.
2. Name it anything (e.g. `hbplus-auth`). Note the **Project ID**.

### 1-B  OAuth Consent Screen
1. Left menu → **APIs & Services → OAuth consent screen**.
2. **User type:**
   - If your domain is a Google Workspace org → choose **Internal** ✅ (easiest; auto-restricts to your org).
   - Otherwise → choose **External**.
3. Fill in:
   - App name: `HB Plus`
   - User support email: your email
   - Developer contact email: your email
4. Scopes: add `openid`, `email`, `profile`.
5. If **External**: add test users (everyone who needs to log in during dev).
6. Save.

### 1-C  Create OAuth Client IDs (you need three)

Go to **APIs & Services → Credentials → + Create Credentials → OAuth 2.0 Client ID**.

#### Web client
| Field | Value |
|-------|-------|
| Application type | Web application |
| Name | HB Plus Web |
| Authorised JavaScript origins | `http://localhost:8081`  `http://localhost:19006` |
| Authorised redirect URIs | `http://localhost:8081/auth/callback`  `https://<YOUR-FIREBASE-PROJECT-ID>.firebaseapp.com/__/auth/handler` |

Copy the **Client ID** → paste into `.env` as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

#### Android client
| Field | Value |
|-------|-------|
| Application type | Android |
| Package name | `com.hbplus.app` |
| SHA-1 fingerprint | Run the command below ↓ |

```bash
# Debug fingerprint (for local dev / emulator)
keytool -list -v \
  -keystore ~/.android/debug.keystore \
  -alias androiddebugkey \
  -storepass android \
  -keypass android | grep SHA1
```

Copy the **Client ID** → paste into `.env` as `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

#### iOS client
| Field | Value |
|-------|-------|
| Application type | iOS |
| Bundle ID | `com.hbplus.app` |

Copy the **Client ID** → paste into `.env` as `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

Also copy the **reversed client ID** (looks like `com.googleusercontent.apps.XXXXX`) and paste it into `app.json` → `plugins["@react-native-google-signin/google-signin"].iosUrlScheme`.

---

## Step 2 — Firebase Console

> **URL:** https://console.firebase.google.com

### 2-A  Create / link project
1. Click **Add project** → select the same GCP project you created above (`hbplus-auth`).

### 2-B  Enable Google Sign-In
1. Left menu → **Authentication → Sign-in method → Google → Enable**.
2. Set the support email.
3. Save.

### 2-C  Copy web config
1. **Project Settings (gear icon) → General → Your apps → Add app → Web (</> icon)**.
2. Register the app. Firebase shows a config object like:
   ```js
   const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
   };
   ```
3. Copy these three values into `.env`:
   - `EXPO_PUBLIC_FIREBASE_API_KEY`
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`

### 2-D  Service account key (for the backend)
1. **Project Settings → Service Accounts → Generate new private key**.
2. Download the JSON file. **Keep it secret — never commit it.**
3. Set in `backend/.env`:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/downloaded-key.json
   FIREBASE_PROJECT_ID=<same as above>
   ```

### 2-E  Firestore database
1. Left menu → **Firestore Database → Create database**.
2. Choose **Production mode**.
3. Select a region close to you.
4. After creation, go to **Rules** tab and paste the contents of `firestore.rules`.

---

## Step 3 — Fill in .env Files

### `.env` (repo root — for the Expo app)
```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=         ← from Step 1-C (web)
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=     ← from Step 1-C (android)
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=         ← from Step 1-C (ios)
EXPO_PUBLIC_FIREBASE_API_KEY=             ← from Step 2-C
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=         ← from Step 2-C
EXPO_PUBLIC_FIREBASE_PROJECT_ID=          ← from Step 2-C
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000
```

### `backend/.env`
```env
ALLOWED_EMAIL_DOMAINS=hbplus.fit          ← comma-separated, e.g. hbplus.fit,acme.com
SESSION_SECRET=                           ← run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
FIREBASE_PROJECT_ID=                      ← same as above
GOOGLE_WEB_CLIENT_ID=                     ← same web OAuth client ID used by the Expo web app
GOOGLE_APPLICATION_CREDENTIALS=          ← absolute path to service-account JSON
PORT=4000
NODE_ENV=development
CORS_ORIGINS=http://localhost:8081,http://localhost:19006
```

---

## Step 4 — Install & Run

```bash
# Install frontend deps
npm install

# Install backend deps
cd backend && npm install && cd ..

# Run backend (terminal 1)
cd backend && npm run dev

# Run Expo (terminal 2)
npx expo start --web          # web browser
npx expo start --android      # Android emulator
npx expo start --ios          # iOS simulator (macOS only)
```

---

## Allowed Domains — How to Change

Edit `backend/.env`:
```env
# Single domain
ALLOWED_EMAIL_DOMAINS=hbplus.fit

# Multiple domains
ALLOWED_EMAIL_DOMAINS=hbplus.fit,acme.com,partner.org
```

Restart the backend. No code changes needed. Exact match only — `sub.hbplus.fit` is **not** automatically allowed.

---

## Project Structure

```
hbp/
├── app/              Expo Router screens (login, dashboard)
├── src/              Shared React Native source
│   ├── features/     auth + dashboard feature modules
│   ├── providers/    AuthProvider (React Context)
│   ├── components/   Shared UI components
│   └── constants/    Environment config
├── backend/          Node.js Express API
│   ├── src/
│   │   ├── config/   Firebase + env validation
│   │   ├── middleware/ authenticate, requireRole, errorHandler
│   │   ├── modules/  auth, admin
│   │   └── utils/    domain check, errors
│   └── tests/        Backend unit tests
├── plan/             Architecture & planning docs
├── .env              Client env (fill in — never commit)
├── backend/.env      Server env (fill in — never commit)
└── firestore.rules   Firestore security rules
```
