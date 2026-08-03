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

async function resetUserTrackToHealthDay1() {
  console.log('🔄 Resetting user track to Day 1 Health Track...');
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();

  console.log(`Found ${snapshot.size} users to update.`);

  for (const doc of snapshot.docs) {
    await doc.ref.update({
      activeSkillTrackId: 'health',
      todaySkillTrackId: 'health',
      skillTrackCurrentDay: 1,
      todaySkillTrackDay: 1,
      skillTrackCompletedDays: [],
      currentDailyQuests: null,
      currentDailyTrackId: 'health',
      aiSkillQuests: null,
      lastQuestAnalysisDate: ''
    });
    console.log(`✅ Reset user ${doc.id} to Day 1 Health Track`);
  }

  console.log('🎉 Reset complete!');
}

resetUserTrackToHealthDay1().catch((err) => {
  console.error('❌ Error resetting user track:', err);
  process.exit(1);
});
