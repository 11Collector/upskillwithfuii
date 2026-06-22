import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const envContent = readFileSync(join(projectRoot, '.env.local'), 'utf8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
  process.env[key] = val;
}

const require = createRequire(import.meta.url);
const admin = require(join(projectRoot, 'node_modules/firebase-admin'));
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

async function buildMap() {
  const snap = await db.collection('articles').get();
  const map = {};
  snap.docs.forEach(d => {
    const data = d.data();
    if (data.id !== undefined) map[String(data.id)] = { docId: d.id, data };
    if (/^\d+$/.test(d.id)) map[d.id] = { docId: d.id, data };
  });
  return map;
}

async function main() {
  const map = await buildMap();
  for (const numId of ['13', '38', '45', '46']) {
    const entry = map[numId];
    if (!entry) { console.log(`Article ${numId} NOT FOUND`); continue; }
    console.log(`\n${'='.repeat(70)}`);
    console.log(`ARTICLE ${numId} — ${entry.data.title}`);
    console.log(`docId: ${entry.docId}`);
    console.log('='.repeat(70));
    console.log(entry.data.content);
  }
  process.exit(0);
}
main().catch(console.error);
