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

async function resetUserLevel() {
  const email = 'emotion.tuii@gmail.com';
  console.log(`🔍 Looking for user with email: ${email}...`);
  
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', email).get();

  if (snapshot.empty) {
    console.log(`❌ No user found with email: ${email}`);
    return;
  }

  const userDoc = snapshot.docs[0];
  console.log(`✅ Found user! UID: ${userDoc.id}. Resetting totalXP to 1100 (Level 12)...`);

  await userDoc.ref.update({
    totalXP: 1100,
    potXP: 0
  });

  console.log(`🎉 Successfully reset level for ${email} to Level 12!`);
}

resetUserLevel().catch((err) => {
  console.error('❌ Error resetting user level:', err);
  process.exit(1);
});
