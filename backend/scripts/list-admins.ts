import { firestore } from '../src/config/firebase';

export async function listAdmins(): Promise<void> {
  console.log('📋 Fetching registered Horizon administrators...\n');

  const snap = await firestore
    .collection('users')
    .where('role', '==', 'ADMIN')
    .orderBy('createdAt', 'desc')
    .get();

  if (snap.empty) {
    console.log('ℹ️ No administrators found in the database.');
    console.log('   Use `npm run admin:create -- --email <email>` to promote an administrator.');
    return;
  }

  console.log('────────────────────────────────────────────────────────────────────────────────────────');
  console.log(
    'NAME'.padEnd(26) +
    'EMAIL'.padEnd(30) +
    'ROLE'.padEnd(10) +
    'STATUS'.padEnd(12) +
    'CREATED AT'
  );
  console.log('────────────────────────────────────────────────────────────────────────────────────────');

  let activeCount = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const name = (data.name || '—').slice(0, 24);
    const email = (data.email || '—').slice(0, 28);
    const role = data.role || 'ADMIN';
    const status = data.status || 'ACTIVE';

    if (status === 'ACTIVE') activeCount++;

    let createdAtStr = '—';
    if (data.createdAt) {
      if (typeof data.createdAt.toDate === 'function') {
        createdAtStr = data.createdAt.toDate().toISOString().split('T')[0];
      } else {
        createdAtStr = String(data.createdAt).split('T')[0];
      }
    }

    console.log(
      name.padEnd(26) +
      email.padEnd(30) +
      role.padEnd(10) +
      status.padEnd(12) +
      createdAtStr
    );
  }

  console.log('────────────────────────────────────────────────────────────────────────────────────────');
  console.log(`Total: ${snap.size} administrator(s) registered (${activeCount} active).\n`);
}

// Execute when invoked directly from CLI
if (require.main === module) {
  listAdmins()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Fatal error listing admins:', err);
      process.exit(1);
    });
}
