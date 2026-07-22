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

async function resetEmotionUser() {
  const email = 'emotion.tuii@gmail.com';
  console.log(`🔍 Finding user ${email}...`);
  const snapshot = await db.collection('users').where('email', '==', email).get();

  if (snapshot.empty) {
    console.log(`❌ User not found`);
    return;
  }

  for (const doc of snapshot.docs) {
    console.log(`Clearing track and wheel data for ${doc.id}...`);
    await doc.ref.update({
      activeSkillTrackId: null,
      todaySkillTrackId: null,
      skillTrackCurrentDay: 1,
      todaySkillTrackDay: 1,
      skillTrackCompletedDays: [],
      completedSkillBadges: [],
      trackCompletionCounts: {},
      hasSeenSkillTrackPopup: false,
      wheelPlanDay: 1,
      wheelCompletions: 0,
      completedQuestIds: [],
      lastWheel: null
    });
  }

  console.log(`✅ Successfully reset user ${email}!`);
}

resetEmotionUser().catch(console.error);
