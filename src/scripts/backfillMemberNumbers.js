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
    // remove quotes
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

// Replace literal newlines
privateKey = privateKey.replace(/\\n/g, '\n');

// 2. Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey,
  }),
});

const db = admin.firestore();

async function runMigration() {
  console.log('Fetching users from Firestore...');
  const usersSnap = await db.collection('users').get();
  
  const allUsers = [];
  usersSnap.forEach(doc => {
    allUsers.push({ id: doc.id, ...doc.data() });
  });
  
  console.log(`Total users found: ${allUsers.length}`);

  // 3. Filter PRO/Premium users
  const proUsers = allUsers.filter(user => {
    const subscriptionStatus = user.subscriptionStatus || user.subscription_status || '';
    const subscriptionTier = user.subscriptionTier || user.subscription_tier || '';
    const isPremium =
      user.role === 'premium' ||
      subscriptionTier === 'pro' ||
      ['active', 'trialing'].includes(subscriptionStatus) ||
      Boolean(user.isLifetimeMember) ||
      Boolean(user.isFoundingMember);
    return isPremium;
  });

  console.log(`Found ${proUsers.length} PRO/Premium users.`);

  // 4. Sort PRO users by createdAt (ascending)
  proUsers.sort((a, b) => {
    const timeA = a.createdAt ? (a.createdAt.seconds || a.createdAt._seconds || 0) : 0;
    const timeB = b.createdAt ? (b.createdAt.seconds || b.createdAt._seconds || 0) : 0;
    if (timeA !== timeB) return timeA - timeB;
    return a.id.localeCompare(b.id);
  });

  console.log('\n--- Assigning Member Numbers ---');
  const batch = db.batch();
  
  proUsers.forEach((user, index) => {
    const memberNum = index + 1;
    const ref = db.collection('users').doc(user.id);
    const plan = user.subscriptionPlan || '';
    const shouldBeFounder = plan.startsWith('founding') || plan === 'yearly' || plan === 'lifetime' || Boolean(user.isLifetimeMember) || Boolean(user.isFoundingMember);

    batch.update(ref, { 
      memberNumber: memberNum,
      isFoundingMember: shouldBeFounder
    });
    
    console.log(`[PRO #${String(memberNum).padStart(3, '0')}] Name: ${user.displayName || 'N/A'} | Email: ${user.email || 'N/A'} | Created: ${user.createdAt ? new Date((user.createdAt.seconds || user.createdAt._seconds) * 1000).toISOString() : 'N/A'}`);
  });

  if (proUsers.length > 0) {
    console.log('\nWriting updates to Firestore...');
    await batch.commit();
    console.log('Migration completed successfully!');
  } else {
    console.log('No PRO users to update.');
  }
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
