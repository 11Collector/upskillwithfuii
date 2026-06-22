/**
 * Revert overly-aggressive duplicate Thai word fixes in articles 13, 38, 45, 46.
 *
 * The DuplicateThai regex /([ก-๙เแโใไ่้๊๋็์ํ]{3,})\1+/g collapsed:
 *   "ที่ที่" → "ที่"     — broke relative clause "สถานที่ที่..." / "พื้นที่ที่..."
 *   "รู้รู้" → "รู้"     — broke emphasis form "รู้รู้ว่า" (knowing full well that)
 *   "ล้านล้าน" → "ล้าน"  — broke trillion yen figure (2.3 ล้านล้านเยน)
 *
 * Specific fixes identified by reading full article content:
 *   Article 13: "ในที่เอื้อต่อการเติบโต" → "ในที่ที่เอื้อต่อการเติบโต"
 *   Article 38: "รู้ว่ากำลัง หลีกเลี่ยงข้อมูล" → "รู้รู้ว่ากำลัง หลีกเลี่ยงข้อมูล"
 *   Article 45: "2.3 ล้านเยน" → "2.3 ล้านล้านเยน" (×2 — both the body text and references)
 *   Article 46: "ในพื้นที่ตัวเองช่วยได้จริง" → "ในพื้นที่ที่ตัวเองช่วยได้จริง"
 */
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

// ── Targeted fixes ────────────────────────────────────────────────────────────

const FIXES = [
  {
    numId: '13',
    label: 'Suddenly Talented — ที่ที่เอื้อต่อการเติบโต',
    pairs: [
      ['ในที่เอื้อต่อการเติบโต', 'ในที่ที่เอื้อต่อการเติบโต'],
    ],
  },
  {
    numId: '38',
    label: 'Ostrich Effect — รู้รู้ว่ากำลังหลีกเลี่ยง',
    pairs: [
      ['รู้ว่ากำลัง หลีกเลี่ยงข้อมูล', 'รู้รู้ว่ากำลัง หลีกเลี่ยงข้อมูล'],
    ],
  },
  {
    numId: '45',
    label: 'Nintendo — 2.3 ล้านล้านเยน (×2)',
    pairs: [
      // Body text and references both say "2.3 ล้านเยน" — restore to trillion
      ['2.3 ล้านเยน', '2.3 ล้านล้านเยน'],
    ],
  },
  {
    numId: '46',
    label: 'Give & Take — พื้นที่ที่ตัวเองช่วยได้จริง',
    pairs: [
      ['ในพื้นที่ตัวเองช่วยได้จริง', 'ในพื้นที่ที่ตัวเองช่วยได้จริง'],
    ],
  },
];

async function main() {
  const DRY_RUN = !process.argv.includes('--apply');
  if (DRY_RUN) console.log('🔍 DRY RUN — add --apply to write to Firestore\n');
  else console.log('✏️  APPLY mode — writing to Firestore\n');

  const map = await buildMap();

  for (const { numId, label, pairs } of FIXES) {
    const entry = map[numId];
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`Article ${numId} — ${label}`);

    if (!entry) {
      console.log(`  ❌ NOT FOUND`);
      continue;
    }

    let content = entry.data.content || '';
    let changed = false;

    for (const [from, to] of pairs) {
      const count = content.split(from).length - 1;
      if (count > 0) {
        content = content.replaceAll(from, to);
        console.log(`  ✏️  "${from}" → "${to}"  (${count}×)`);
        changed = true;
      } else {
        console.log(`  ⚠️  NOT FOUND: "${from}"`);
      }
    }

    if (changed && !DRY_RUN) {
      await db.collection('articles').doc(entry.docId).update({ content });
      console.log(`  ✅ Saved to Firestore (docId: ${entry.docId})`);
    } else if (changed) {
      console.log(`  (dry run — not saved)`);
    } else {
      console.log(`  ℹ️  No changes needed`);
    }
  }

  console.log('\n✅ Done.');
  process.exit(0);
}

main().catch(console.error);
