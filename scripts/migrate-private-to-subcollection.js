/**
 * Script to migrate existing `private` fields from root documents in
 * `aulaMovilBookings` into a subcollection `aulaMovilBookings/{id}/private/private`.
 *
 * Usage: set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON and run:
 *   node scripts/migrate-private-to-subcollection.js
 */

const admin = require('firebase-admin');
const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!serviceAccount) {
  console.error('Please set GOOGLE_APPLICATION_CREDENTIALS env var pointing to a service account JSON.');
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();

async function migrate() {
  const snapshot = await db.collection('aulaMovilBookings').get();
  console.log(`Found ${snapshot.size} bookings.`);
  let moved = 0;
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (data.private) {
      const privateRef = db.doc(`aulaMovilBookings/${docSnap.id}/private/private`);
      await privateRef.set(data.private);
      // remove private from root
      await docSnap.ref.update({ private: admin.firestore.FieldValue.delete() });
      moved++;
      console.log(`Migrated private for ${docSnap.id}`);
    }
  }
  console.log(`Migration complete. Moved ${moved} documents.`);
}

migrate().catch(err => { console.error(err); process.exit(2); });
