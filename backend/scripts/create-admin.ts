import { firestore, firebaseAuth } from '../src/config/firebase';
import { extractDomain, isAllowedDomain } from '../src/utils/domain';
import { FieldValue } from 'firebase-admin/firestore';

function parseEmailArg(): string {
  const args = process.argv.slice(2);
  let email = '';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--email' || arg === '-e') {
      email = args[i + 1] ?? '';
      i++;
    } else if (arg.startsWith('--email=')) {
      email = arg.split('=')[1] ?? '';
    } else if (!arg.startsWith('-') && !email) {
      email = arg;
    }
  }

  email = email.trim().toLowerCase();

  if (!email) {
    console.error('❌ Error: Email is required.');
    console.error('Usage: npm run admin:create -- --email <user@domain.com>');
    process.exit(1);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error(`❌ Error: Invalid email format: "${email}"`);
    process.exit(1);
  }

  return email;
}

export async function createAdmin(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Verify organization domain allowlist
  try {
    const domain = extractDomain(normalizedEmail);
    if (!isAllowedDomain(domain)) {
      console.error(
        `❌ Error: Domain "${domain}" is not in the ALLOWED_EMAIL_DOMAINS allowlist.`,
      );
      process.exit(1);
    }
  } catch (err: unknown) {
    const e = err as Error;
    console.error(`❌ Error verifying domain: ${e.message}`);
    process.exit(1);
  }

  console.log(`🔍 Locating user record for "${normalizedEmail}"...`);

  // 2. Query user in Firestore database
  const userQuery = await firestore
    .collection('users')
    .where('email', '==', normalizedEmail)
    .get();

  if (userQuery.empty) {
    // Check if user exists in Firebase Auth
    try {
      const authUser = await firebaseAuth.getUserByEmail(normalizedEmail);
      if (!authUser.emailVerified) {
        console.error(
          `❌ Error: Account "${normalizedEmail}" exists in Auth but email is not verified.`,
        );
        process.exit(1);
      }

      // User exists in Firebase Auth but hasn't created a Firestore record yet
      console.log(
        `ℹ️ User found in Identity Provider (UID: ${authUser.uid}). Initializing admin record...`,
      );
      const now = FieldValue.serverTimestamp();
      await firestore.collection('users').doc(authUser.uid).set({
        id: authUser.uid,
        uid: authUser.uid,
        provider: 'google',
        providerUserId: authUser.uid,
        email: normalizedEmail,
        normalizedEmail,
        emailVerified: true,
        name: authUser.displayName ?? normalizedEmail.split('@')[0],
        avatarUrl: authUser.photoURL ?? null,
        role: 'ADMIN',
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      });

      console.log(
        `✅ Successfully provisioned and promoted "${normalizedEmail}" to ADMIN.`,
      );
      console.log(`   User UID: ${authUser.uid}`);
      console.log(`   Timestamp: ${new Date().toISOString()}`);
      return;
    } catch {
      console.error(
        `\n❌ User "${normalizedEmail}" has not signed in to the application yet.`,
      );
      console.error(
        '   Policy requirement: Please ask the user to authenticate once using their',
      );
      console.error(
        '   authorized organization Google account before assigning administrative privileges.\n',
      );
      process.exit(1);
    }
  }

  // 3. User document located in database
  const userDoc = userQuery.docs[0];
  const userData = userDoc.data();

  if (userData.role === 'ADMIN' && userData.status === 'ACTIVE') {
    console.log(
      `ℹ️ User "${normalizedEmail}" is already an active ADMIN (UID: ${userDoc.id}). No changes needed.`,
    );
    return;
  }

  // 4. Update role to ADMIN
  await userDoc.ref.update({
    role: 'ADMIN',
    status: 'ACTIVE',
    updatedAt: FieldValue.serverTimestamp(),
  });

  console.log(`\n✅ Successfully promoted "${normalizedEmail}" to ADMIN.`);
  console.log(`   Name:     ${userData.name || '—'}`);
  console.log(`   User UID: ${userDoc.id}`);
  console.log(`   Previous Role: ${userData.role || 'USER'} → ADMIN`);
  console.log(`   Timestamp: ${new Date().toISOString()}\n`);
}

// Execute when invoked directly from CLI
if (require.main === module) {
  const email = parseEmailArg();
  createAdmin(email)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Fatal error promoting admin:', err);
      process.exit(1);
    });
}
