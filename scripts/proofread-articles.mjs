import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Load env vars from .env.local
const envContent = readFileSync(join(projectRoot, '.env.local'), 'utf8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  process.env[key] = val;
}

const require = createRequire(import.meta.url);
const admin = require(join(projectRoot, 'node_modules/firebase-admin'));

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

const ARTICLE_IDS = [
  '3','2','11','20','5','9','18','17','36','39','35','37','38',
  '25','27','4','8','16','14','7','19','34','45','43','6','24',
  '30','40','1','12','13','10','32','33','48','41','42','44','46','26','15'
];

// ---- Fix functions ----

function fixPhayayam(text) {
  // พยาม → พยายาม
  // Avoid replacing what's already part of พยายาม
  return text.replace(/พยาม/g, (match, offset) => {
    const preceding = text.slice(Math.max(0, offset - 3), offset);
    if (preceding.endsWith('พยา')) return match; // already พยายาม → skip
    return 'พยายาม';
  });
}

function fixRayayao(text) {
  return text.replace(/ระยาว/g, 'ระยะยาว');
}

function fixDuplicateThaiChars(text) {
  return text.replace(/([ก-๙เแโใไ่้๊๋็์ํ]{3,})\1+/g, '$1');
}

function fixLoginSpelling(text) {
  return text.replace(/ล็อคอิน|ล๊อกอิน/g, 'ล็อกอิน');
}

function fixDiscTypeLabels(text) {
  return text
    .replace(/\bType D\b/g, 'ไทป์ D')
    .replace(/\bType I\b/g, 'ไทป์ I')
    .replace(/\bType S\b/g, 'ไทป์ S')
    .replace(/\bType C\b/g, 'ไทป์ C');
}

// ---- Change tracker ----
const allChanges = []; // { id, field, type, from, to }[]

function recordChange(id, field, type, from, to) {
  allChanges.push({ id, field, type, from, to });
  console.log(`  [id=${id}][${field}] ${type}: "${from}" → "${to}"`);
}

function applyFixes(articleNumId, original, field) {
  let text = original;

  // 1. พยาม → พยายาม
  {
    const re = /พยาม/g;
    const matches = [];
    let m;
    while ((m = re.exec(text)) !== null) {
      const preceding = text.slice(Math.max(0, m.index - 3), m.index);
      if (!preceding.endsWith('พยา')) matches.push({ index: m.index, match: m[0] });
    }
    if (matches.length > 0) {
      for (const { match } of matches) recordChange(articleNumId, field, 'พยาม→พยายาม', match, 'พยายาม');
      text = fixPhayayam(text);
    }
  }

  // 2. ระยาว → ระยะยาว
  {
    const re = /ระยาว/g;
    let m;
    const found = [];
    while ((m = re.exec(text)) !== null) found.push(m[0]);
    if (found.length > 0) {
      for (const f of found) recordChange(articleNumId, field, 'ระยาว→ระยะยาว', f, 'ระยะยาว');
      text = fixRayayao(text);
    }
  }

  // 3. Duplicate Thai chars
  {
    const re = /([ก-๙เแโใไ่้๊๋็์ํ]{3,})\1+/g;
    let m;
    const found = [];
    while ((m = re.exec(text)) !== null) found.push({ full: m[0], base: m[1] });
    if (found.length > 0) {
      for (const { full, base } of found) recordChange(articleNumId, field, 'DuplicateThai', full, base);
      text = fixDuplicateThaiChars(text);
    }
  }

  // 4. Login spelling
  {
    const re = /ล็อคอิน|ล๊อกอิน/g;
    let m;
    const found = [];
    while ((m = re.exec(text)) !== null) found.push(m[0]);
    if (found.length > 0) {
      for (const f of found) recordChange(articleNumId, field, 'Login spelling', f, 'ล็อกอิน');
      text = fixLoginSpelling(text);
    }
  }

  // 5 & 6. Article 5 and 7: DISC type labels
  if (articleNumId === '5' || articleNumId === '7') {
    for (const type of ['D', 'I', 'S', 'C']) {
      const re = new RegExp(`\\bType ${type}\\b`, 'g');
      let m;
      const found = [];
      while ((m = re.exec(text)) !== null) found.push(m[0]);
      if (found.length > 0) {
        for (const f of found) recordChange(articleNumId, field, `Type→ไทป์`, f, `ไทป์ ${type}`);
      }
    }
    const fixed = fixDiscTypeLabels(text);
    if (fixed !== text) text = fixed;
  }

  return text;
}

// ---- Main ----

async function main() {
  console.log('=== Thai Proofreader — Starting ===\n');
  console.log(`Fetching ${ARTICLE_IDS.length} articles by 'id' field...\n`);

  // Fetch all articles in the target set
  // Firestore 'in' queries support up to 30 values; split into chunks
  const numericIds = ARTICLE_IDS.map(id => parseInt(id, 10));
  const chunkSize = 30;
  const docsByNumId = {}; // numericId (number) → { docRef, data }

  for (let i = 0; i < numericIds.length; i += chunkSize) {
    const chunk = numericIds.slice(i, i + chunkSize);
    const snap = await db.collection('articles').where('id', 'in', chunk).get();
    for (const doc of snap.docs) {
      const data = doc.data();
      docsByNumId[data.id] = { docRef: doc.ref, data };
    }
  }

  console.log(`Found ${Object.keys(docsByNumId).length} documents in Firestore.\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  // Process in batches of 20
  const batchSize = 20;
  const idChunks = [];
  for (let i = 0; i < ARTICLE_IDS.length; i += batchSize) {
    idChunks.push(ARTICLE_IDS.slice(i, i + batchSize));
  }

  for (let ci = 0; ci < idChunks.length; ci++) {
    const chunk = idChunks[ci];
    const batch = db.batch();
    let batchHasUpdates = false;

    for (const id of chunk) {
      const numId = parseInt(id, 10);
      if (!docsByNumId[numId]) {
        console.log(`  [id=${id}] NOT FOUND — skipping`);
        skippedCount++;
        continue;
      }

      const { docRef, data } = docsByNumId[numId];
      const updates = {};

      const textFields = ['content', 'title', 'excerpt', 'summary', 'description'];
      for (const field of textFields) {
        if (typeof data[field] === 'string') {
          const fixed = applyFixes(id, data[field], field);
          if (fixed !== data[field]) {
            updates[field] = fixed;
          }
        }
      }

      if (Object.keys(updates).length > 0) {
        batch.update(docRef, updates);
        batchHasUpdates = true;
        updatedCount++;
        console.log(`  [id=${id}] WILL UPDATE fields: ${Object.keys(updates).join(', ')}`);
      } else {
        skippedCount++;
      }
    }

    if (batchHasUpdates) {
      await batch.commit();
      console.log(`  Batch ${ci + 1} committed.\n`);
    }
  }

  // ---- Summary Table ----
  console.log('\n=== CHANGE LOG SUMMARY ===\n');

  if (allChanges.length === 0) {
    console.log('No changes were needed — all articles are already correct.');
  } else {
    // Group by id
    const byId = {};
    for (const c of allChanges) {
      if (!byId[c.id]) byId[c.id] = [];
      byId[c.id].push(c);
    }

    console.log('ID   | Field    | Fix Type               | From (excerpt)               | To (excerpt)');
    console.log('-----|----------|------------------------|------------------------------|------------------------------');

    for (const id of ARTICLE_IDS) {
      if (!byId[id]) continue;
      for (const c of byId[id]) {
        const fromShort = c.from.length > 29 ? c.from.slice(0, 26) + '...' : c.from;
        const toShort = c.to.length > 29 ? c.to.slice(0, 26) + '...' : c.to;
        console.log(
          `${String(id).padEnd(4)} | ${c.field.padEnd(8)} | ${c.type.padEnd(22)} | ${fromShort.padEnd(28)} | ${toShort}`
        );
      }
    }
  }

  console.log('\n============================');
  console.log(`Articles updated:           ${updatedCount}`);
  console.log(`Articles unchanged/missing: ${skippedCount}`);
  console.log(`Total individual fixes:     ${allChanges.length}`);
  console.log('============================\n');

  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
