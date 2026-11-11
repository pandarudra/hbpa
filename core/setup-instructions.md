# Setup Instructions

## Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9 or higher
- **Git**
- A **Google Cloud Platform** account (with billing enabled if required)
- A **Firebase Console** account

---

## Step 1: Install Dependencies

```bash
# 1. Install frontend dependencies
npm install

# 2. Install backend dependencies
cd backend && npm install && cd ..
```

---

## Step 2: Google Cloud Console Setup

1. Open the [Google Cloud Console](https://console.cloud.google.com).
2. Create a new project (e.g. `hbplus-portal`). Note your **Project ID**.

### Configure OAuth Consent Screen

1. Go to **APIs & Services → OAuth consent screen**.
2. Select User Type:
   - **Internal**: If your Google Cloud project is within your Google Workspace organization (recommended; auto-restricts access to workspace members).
   - **External**: If using a personal account for testing. (Add all test email addresses under _Test users_).
3. Fill in the App Name (`Horizon Portal`), User Support Email, and Developer Email.
4. Add the following scopes:
   - `openid`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
5. Save and continue.

### Create OAuth 2.0 Credentials

Navigate to **APIs & Services → Credentials → + Create Credentials → OAuth client ID**.

You will create **three client IDs**:

#### A. Web Application Client

- **Application type**: `Web application`
- **Name**: `Horizon Web Portal`
- **Authorized JavaScript origins**:
  - `http://localhost:8081`
  - `http://localhost:19006`
- **Authorized redirect URIs**:
  - `http://localhost:8081/auth/callback`
  - `https://<YOUR-FIREBASE-PROJECT-ID>.firebaseapp.com/__/auth/handler`
- Save and record the generated **Client ID**.

#### B. Android Client

- **Application type**: `Android`
- **Name**: `Horizon Android`
- **Package name**: `com.hbplus.app`
- **SHA-1 certificate fingerprint**:
  Run this command locally to get your debug keystore SHA-1:
  ```bash
  keytool -list -v \
    -keystore ~/.android/debug.keystore \
    -alias androiddebugkey \
    -storepass android \
    -keypass android | grep SHA1
  ```
- Save and record the Android Client ID.

#### C. iOS Client

- **Application type**: `iOS`
- **Name**: `Horizon iOS`
- **Bundle ID**: `com.hbplus.app`
- Save and record the iOS Client ID, as well as the **iOS URL scheme** (the reversed client ID).
- In `app.json`, paste the reversed client ID into:
  ```json
  "plugins": [
    [
      "@react-native-google-signin/google-signin",
      {
        "iosUrlScheme": "com.googleusercontent.apps.YOUR-REVERSED-CLIENT-ID"
      }
    ]
  ]
  ```

---

## Step 3: Firebase Console Setup

1. Open the [Firebase Console](https://console.firebase.google.com).
2. Click **Add project** and choose the existing Google Cloud project created in Step 2 (`hbplus-portal`).

### Enable Google Authentication

1. Go to **Build → Authentication → Sign-in method**.
2. Click **Add new provider** → select **Google** → click **Enable**.
3. Choose your project support email and click **Save**.

### Register Web App

1. Go to **Project Settings (Gear Icon) → General**.
2. Under _Your apps_, click the **Web (`</>`)** icon.
3. Register the app as `Horizon Web`.
4. Note the provided `apiKey`, `authDomain`, and `projectId`.

### Initialize Cloud Firestore

1. Go to **Build → Firestore Database → Create database**.
2. Choose **Production mode** and choose a server region closest to your users.
3. Once created, click on the **Rules** tab, paste the contents of `firestore.rules`, and click **Publish**:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{uid} {
         allow read: if request.auth != null && request.auth.uid == uid;
         allow write: if false; // All writes must go through the Node.js Admin SDK
       }
       match /{document=**} {
         allow read, write: if false;
       }
     }
   }
   ```

### Generate Service Account Private Key

1. Go to **Project Settings → Service Accounts**.
2. Click **Generate new private key** and download the resulting JSON file.
3. Store this file securely on your machine (e.g. `/home/user/service-account.json`).
   > ⚠️ **Security Warning**: Never commit this file or include it in git history.

---

## Step 4: Environment Variables

### Frontend Environment (`.env` in repo root)

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Populate the values:

```env
# Google OAuth Client IDs (from Step 2)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID.apps.googleusercontent.com

# Firebase Web Config (from Step 3)
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=hbplus-portal.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=hbplus-portal

# Backend API URL (Use http://10.0.2.2:4000 for Android emulator)
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000

# Optional domain hint displayed on login page (comma-separated)
EXPO_PUBLIC_ALLOWED_DOMAINS=hbplus.fit
```

### Backend Environment (`backend/.env`)

Copy `backend/.env.example` to `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

Populate the values:

```env
# Domain restriction allowlist (comma-separated, exact match)
ALLOWED_EMAIL_DOMAINS=hbplus.fit

# Session secret (min 32 random characters)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET=a_very_long_cryptographically_secure_random_string_32_chars_min
SESSION_MAX_AGE=28800

# Firebase project ID and Web Client ID (matches frontend)
FIREBASE_PROJECT_ID=hbplus-portal
GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com

# Absolute path to the downloaded service account JSON
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json

# Server configuration
PORT=4000
NODE_ENV=development
CORS_ORIGINS=http://localhost:8081,http://localhost:19006
```

---

## Step 5: Run the Application

### Terminal 1 — Start the Backend Server

```bash
cd backend
npm run dev
```

The server will boot on `http://localhost:4000`. You can verify it via `curl http://localhost:4000/health` (returns `{"status":"ok"}`).

### Terminal 2 — Start the Client Portal

```bash
# Run web portal in browser (default: http://localhost:8081)
npm run web

# Or launch on Android emulator
npm run android

# Or launch on iOS simulator (macOS required)
npm run ios
```
