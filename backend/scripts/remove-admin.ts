import { firestore } from '../src/config/firebase';
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
    console.error('Usage: npm run admin:remove -- --email <user@domain.com>');
    process.exit(1);
  }

  return email;
}

export async function removeAdmin(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();

  console.log(`🔍 Locating administrator record for "${normalizedEmail}"...`);

  const userQuery = await firestore
    .collection('users')
    .where('email', '==', normalizedEmail)
    .get();

  if (userQuery.empty) {
    console.error(`❌ Error: User "${normalizedEmail}" not found in database.`);
    process.exit(1);
  }

  const userDoc = userQuery.docs[0];
  const userData = userDoc.data();

  if (userData.role !== 'ADMIN') {
    console.log(
      `ℹ️ User "${normalizedEmail}" is not an administrator (Current role: ${userData.role || 'USER'}). No action taken.`,
    );
    return;
  }

  // CRITICAL REQUIREMENT: Prevent accidental removal of the last active administrator
  const activeAdminsQuery = await firestore
    .collection('users')
    .where('role', '==', 'ADMIN')
    .where('status', '==', 'ACTIVE')
    .get();

  const isCurrentActiveAdmin = userData.status === 'ACTIVE';

  if (isCurrentActiveAdmin && activeAdminsQuery.size <= 1) {
    console.error('\n❌ SAFETY CHECK FAILED: Cannot remove administrator.');
    console.error(
      `   "${normalizedEmail}" is the ONLY active administrator in the system.`,
    );
    console.error(
      '   Demoting this account would lock the organization out of administrative management.\n',
    );
    process.exit(1);
  }

  // Demote to USER
  await userDoc.ref.update({
    role: 'USER',
    updatedAt: FieldValue.serverTimestamp(),
  });

  console.log(`\n✅ Successfully revoked administrative privileges for "${normalizedEmail}".`);
  console.log(`   User UID: ${userDoc.id}`);
  console.log(`   New Role: USER`);
  console.log(`   Timestamp: ${new Date().toISOString()}\n`);
}

// Execute when invoked directly from CLI
if (require.main === module) {
  const email = parseEmailArg();
  removeAdmin(email)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Fatal error removing admin:', err);
      process.exit(1);
    });
}
