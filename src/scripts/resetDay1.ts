import fs from 'fs';
import path from 'path';

// Read .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
      process.env[key] = val;
    }
  });
}

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

async function resetAllUsersToDay1() {
  console.log('🔄 Starting reset to Day 1 for all users...');
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();

  console.log(`Found ${snapshot.size} users to reset.`);

  let batch = db.batch();
  let count = 0;
  let totalReset = 0;

  for (const doc of snapshot.docs) {
    batch.update(doc.ref, {
      skillTrackCurrentDay: 1,
      skillTrackCompletedDays: [],
      todaySkillTrackDay: 1,
      todaySkillTrackId: null,
      completedSkillBadges: [],
      trackCompletionCounts: {},
      completedQuestIds: []
    });

    count++;
    totalReset++;

    if (count === 450) {
      await batch.commit();
      console.log(`Committed batch of ${count} users.`);
      batch = db.batch();
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
    console.log(`Committed final batch of ${count} users.`);
  }

  console.log(`✅ Successfully reset ${totalReset} users to Day 1 clean state!`);
}

resetAllUsersToDay1().catch((err) => {
  console.error('❌ Error resetting users to Day 1:', err);
  process.exit(1);
});
