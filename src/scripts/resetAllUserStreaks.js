const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// 1. Manually parse .env.local to load credentials
const envPath = path.join(__dirname, '../../.env.local');
if (!fs.existsSync(envPath)) {
  console.error('.env.local not found at:', envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value;
  }
});

const projectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = env.FIREBASE_CLIENT_EMAIL;
let privateKey = env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing Firebase credentials in .env.local');
  process.exit(1);
}

privateKey = privateKey.replace(/\\n/g, '\n');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey,
  }),
});

const db = admin.firestore();

async function resetAllUserStreaks() {
  console.log('Fetching all users from Firestore to reset Streak and Daily Quest data...');
  const usersSnap = await db.collection('users').get();
  
  console.log(`Total users found: ${usersSnap.size}`);
  let updatedCount = 0;
  
  // Batch size max 500
  let batch = db.batch();
  let countInBatch = 0;

  for (const docSnap of usersSnap.docs) {
    const userRef = db.collection('users').doc(docSnap.id);
    batch.update(userRef, {
      streakCount: 0,
      lastQuestDate: "",
      completedQuestIds: [],
      wheelPlanDay: 1,
      wheelPlanTarget: 7,
      wheelCompletions: 0,
      weeklySavings: 0,
      perfectWeeks: 0,
      skillTrackCompletedDays: [],
      skillTrackCurrentDay: 1,
      completedSkillBadges: [],
      trackCompletionCounts: {}
    });
    updatedCount++;
    countInBatch++;

    if (countInBatch === 400) {
      await batch.commit();
      batch = db.batch();
      countInBatch = 0;
    }
  }

  if (countInBatch > 0) {
    await batch.commit();
  }
  
  console.log(`✅ Successfully reset Streak and Quest data for all ${updatedCount} users in Firestore DB!`);
  process.exit(0);
}

resetAllUserStreaks().catch(err => {
  console.error('Failed to reset User Streak data:', err);
  process.exit(1);
});
