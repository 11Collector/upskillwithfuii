/**
 * Standalone script to publish an article directly to Firestore.
 * Usage: node scripts/publish-article.mjs --data '{"title":"...","slug":"...",...}'
 * Or pipe JSON: echo '{"title":"..."}' | node scripts/publish-article.mjs
 *
 * Reads credentials from .env.local automatically.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// Load .env.local
function loadEnv() {
  try {
    const raw = readFileSync(resolve(ROOT, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^"(.*)"$/, "$1");
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    console.error("⚠️  Could not load .env.local");
  }
}

loadEnv();

// Read article data from --data arg or stdin
async function readPayload() {
  const dataFlag = process.argv.indexOf("--data");
  if (dataFlag !== -1 && process.argv[dataFlag + 1]) {
    return JSON.parse(process.argv[dataFlag + 1]);
  }
  // Read from stdin
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString());
}

async function main() {
  const { initializeApp, cert, getApps } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }

  const db = getFirestore();
  const article = await readPayload();

  const { title, slug, excerpt = "", summary = "", category = "พัฒนาตัวเอง", readTime = "3 นาที", date, content } = article;

  if (!title || !slug || !content) {
    console.error("❌ Missing required fields: title, slug, content");
    process.exit(1);
  }

  // Check if article with same slug already exists
  const existingQuery = await db.collection("articles").where("slug", "==", slug).limit(1).get();
  
  const thaiDate = date ?? new Date().toLocaleDateString("th-TH", {
    day: "numeric", month: "short", year: "numeric",
  });

  if (!existingQuery.empty) {
    const docSnap = existingQuery.docs[0];
    const docRef = docSnap.ref;
    const articleId = docSnap.data().id;
    await docRef.update({ title, excerpt, summary, category, readTime, date: thaiDate, content });
    console.log(`✅ Updated: "${title}"`);
    console.log(`   ID: ${articleId}`);
    console.log(`   URL: /library/${slug}`);
  } else {
    // Get next ID
    const snapshot = await db.collection("articles").orderBy("id", "desc").limit(1).get();
    const lastId = snapshot.empty ? 0 : (snapshot.docs[0].data().id ?? 0);
    const nextId = lastId + 1;

    await db.collection("articles").add({ id: nextId, title, slug, excerpt, summary, category, readTime, date: thaiDate, content });
    console.log(`✅ Published: "${title}"`);
    console.log(`   ID: ${nextId}`);
    console.log(`   URL: /library/${slug}`);
  }
}

main().catch((e) => {
  console.error("❌ Error:", e.message);
  process.exit(1);
});
