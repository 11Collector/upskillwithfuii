<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Upskill with Fuii — Agent Handbook

Platform: **upskillwithfuii.com** / Content brand: **upskilleveryday.com**
Stack: Next.js App Router · Firebase (Client + Admin) · Stripe · DeepSeek AI · Framer Motion · Tailwind CSS

---

## System Map

| System | Route | Key Files |
|--------|-------|-----------|
| Landing & Onboarding | `/` | `src/app/page.tsx` |
| Dashboard & XP | `/dashboard` | `src/app/dashboard/page.tsx`, `src/services/dashboardService.ts` |
| AI Mentor Chat | `/tools/soul-guide` | `src/app/tools/soul-guide/page.tsx`, `src/app/api/chat/route.ts` |
| Assessment — DISC | `/tools/disc` | `src/app/tools/disc/page.tsx`, `src/data/discScenarios.ts`, `src/data/discResult.ts` |
| Assessment — Money Avatar | `/tools/money-avatar` | `src/app/tools/money-avatar/page.tsx`, `src/data/moneyScenarios.ts` |
| Assessment — Wheel of Life | `/tools/wheel-of-life` | `src/app/tools/wheel-of-life/page.tsx` |
| Assessment — Library of Souls | `/tools/library-of-souls` | `src/app/tools/library-of-souls/page.tsx`, `src/data/librarySoulsQuestions.ts` |
| Assessment — Khom Sat Sat | `/tools/khomsatsat` | `src/app/tools/khomsatsat/page.tsx` |
| Focus Room | `/tools/focus-room` | `src/app/tools/focus-room/page.tsx` |
| Deep Work | `/tools/deep-work` | `src/app/tools/deep-work/page.tsx` |
| Library (Articles) | `/library` | `src/app/library/`, `src/constants/article.ts` |
| Gallery | `/gallery` | `src/app/gallery/page.tsx` |
| Report Review | `/report-review` | `src/app/report-review/page.tsx`, `src/app/api/generate-report/route.ts` |
| Admin | `/admin` | `src/app/admin/page.tsx`, `src/services/adminService.ts` |
| Checkout | — | `src/app/api/checkout/route.ts` |

---

## Agent Roles

Each agent below has a defined domain. When working on a task, identify which agent owns it and follow its rules.

---

### 🧠 Agent: Dashboard & Gamification

**Owns:** XP system, Level calculation, Weekly quests, Avatar/Character tier, Weekly stats, Floating XP UI

**Rules:**
- XP formula: `level = Math.floor(totalXP / 100) + 1` — never change this without updating all derived UI
- Weekly stats live at `users/{uid}/weekly_stats/{weekId}` — weekId format is relative (week-1, week-2...) based on user join date, not calendar week
- Quest pool is defined in `src/data/quests.ts` — WHEEL, DISC, MONEY, LIBRARY, WILDCARD, CHALLENGE types
- Character tier must stay in sync with `DISC_DATA`, `MONEY_DATA` in `src/data/constants.ts`
- Never write XP directly — always use Firestore `increment()` to avoid race conditions
- `totalXP === 0 && !lastWheel && !lastDisc` = new user → show onboarding banner

---

### 🤖 Agent: AI Mentor

**Owns:** `/tools/soul-guide`, `/tools/ai-mentor`, `src/app/api/chat/route.ts`

**Rules:**
- Model: DeepSeek `deepseek-chat` via `https://api.deepseek.com/chat/completions`
- Daily quota: ไม่จำกัด (Infinity) — ทุก level ใช้ได้เต็มที่
- System prompt must include Secret Context (lastMood, lastDisc, lastWheel, lastMoney, lastLibrarySoul) — never expose these labels to the user in responses
- Language rule: Thai or English ONLY — strictly no Chinese characters
- Context reminder injected as last message before sending to API (not shown in chat history)
- Auth: every request must pass `verifyAuthToken` from `src/lib/auth-middleware.ts`
- Rate limit: 20 requests/60s per user via `src/lib/rate-limit.ts`
- Always validate request body with `ChatSchema` (Zod) before processing

---

### 📊 Agent: Assessments

**Owns:** DISC · Money Avatar · Wheel of Life · Library of Souls · Khom Sat Sat

**Rules:**
- Each assessment stores result in its own Firestore collection (`discResults`, `quiz_results`, `users/{uid}/assessments`, `users/{uid}/library_souls`, `quotes`)
- Completing an assessment for the first time grants 50 XP (flagged by `hasDiscXP`, `hasWheelXP`, etc. on user doc to prevent double-grant)
- Assessment results feed into AI Mentor context — changes to result data structures must be reflected in `src/app/api/chat/route.ts` system prompt
- Wheel of Life is the recommended first assessment for new users (linked from onboarding banner)
- `src/data/librarySoulsScoring.ts` handles scoring logic — do not inline scoring in the page component

---

### 🎯 Agent: Focus & Deep Work

**Owns:** `/tools/focus-room`, `/tools/deep-work`

**Rules:**
- Focus Room tracks `totalFocusMinutes` — written to `users/{uid}` on session end, not on every tick
- Sound (pink noise / lo-fi) must stop immediately when timer is paused — no fade delay
- Timer state is local only — never persist intermediate timer state to Firestore
- Deep Work sessions may trigger weekly stat updates (`weeklyData.wildcard`, `weeklyData.challenge`)

---

### 📚 Agent: Library & Content

**Owns:** `/library`, article data, content schema

**Rules:**
- Article metadata lives in `src/constants/article.ts`
- Library of Souls result type maps to curated reading lists — keep `librarySoulsResults.ts` in sync with available library content
- Article slugs must match the `[slug]` dynamic route in `src/app/library/[slug]/page.tsx`
- Library admin (`/library/admin`) is restricted — check auth before rendering any write UI

---

### 💳 Agent: Commerce & Reports

**Owns:** Stripe checkout, `/report-review`, `generate-report` API

**Rules:**
- Stripe secret key is server-side only (`STRIPE_SECRET_KEY`) — never expose to client
- Publishable key uses `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Price IDs: `STRIPE_REPORT_PRICE_ID` (one-time), `STRIPE_MONTHLY_PRICE_ID` (subscription)
- Report generation calls DeepSeek AI — same auth middleware pattern as chat
- After successful checkout, redirect URL uses `NEXT_PUBLIC_BASE_URL`

---

### 🔐 Agent: Auth & Security

**Owns:** `src/lib/auth-middleware.ts`, `src/lib/firebase-admin.ts`, `src/lib/rate-limit.ts`

**Rules:**
- All API routes must call `verifyAuthToken` first — no exceptions
- If `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` are missing, middleware falls back to JWT decode (dev mode only)
- Rate limit is in-memory — resets on server restart; this is acceptable for the current scale
- Admin-only routes must additionally check `NEXT_PUBLIC_ADMIN_EMAILS` against `decoded.email`
- Never log tokens, private keys, or user PII to console

---

### 🎨 Agent: UI & Design System

**Owns:** All visual components, Tailwind classes, Framer Motion animations, Bottom Navigation

**Rules:**
- Dark background: `bg-slate-900` / `bg-slate-800` for cards
- Brand gradient: `from-violet-600 via-purple-600 to-indigo-600`
- Rounded corners: `rounded-[2.5rem]` for major cards, `rounded-2xl` for inner elements, `rounded-full` for pills
- Animation: prefer fade (`opacity 0→1`) over translate for content transitions inside modals — no x-axis shift
- Bottom nav has two modes: standard (5 items) and dashboard (5 tabs) — defined in `src/app/components/BottomNavigation.tsx`
- Touch targets minimum 44px height on mobile
- No emojis in production UI unless the feature explicitly uses them (quest items, XP toasts)
- Font: default Thai support via system font stack; do not add a Thai font CDN without testing render performance

---

### 🛠️ Agent: Admin & Data

**Owns:** `/admin`, `src/services/adminService.ts`, Firestore schema

**Rules:**
- Admin page checks email against `NEXT_PUBLIC_ADMIN_EMAILS` env var (comma-separated)
- Firestore collections: `users`, `discResults`, `quiz_results`, `quotes`, `library_souls` (subcollection)
- Sub-collections per user: `assessments`, `weekly_stats`, `library_souls`, `chat_history`
- Never run unbounded queries — always apply `limit()` and `orderBy()`
- Batch writes for multi-document updates to maintain consistency

---

## 📣 Agent: Daily Content — upskilleveryday.com

**Purpose:** Generate and publish one self-development content piece per day aligned with the Upskill with Fuii brand.

**Brand Voice Reference:** `src/data/brand-voice.md` — อ่านไฟล์นี้ก่อนทุกครั้งที่ generate content เพื่อให้โทนตรงกับเจ้าของแบรนด์

**Second Brain Reference:** `src/data/second-brain.md` — แหล่งข้อมูล Mindset & Books (NotebookLM) ใช้เป็น source of truth สำหรับแนวคิด หนังสือ และประโยคคมที่อ้างอิงในคอนเทนต์

**Content Pillars** (rotate daily):

| Day | Pillar | Theme |
|-----|--------|-------|
| Mon | 🧠 Mindset | Growth mindset, resilience, limiting beliefs |
| Tue | 🤖 AI | AI tools, prompt engineering, working with AI, future of work |
| Wed | 💰 Money | Financial habits, money mindset, wealth building |
| Thu | 🧬 Self-awareness | DISC, personality, emotional intelligence |
| Fri | 🎯 Focus | Deep work, focus room habits, elimination |
| Sat | 📚 Learning | Reading, Library of Souls insight, knowledge systems |
| Sun | 🌱 Reflection | Weekly review, Wheel of Life check-in, intention setting |

> 💼 Career สลับกับ 🤖 AI ทุกสองสัปดาห์ในวันอังคาร

**Content Format per post:**

```
HOOK (1 sentence — curiosity or challenge)

INSIGHT (2-3 sentences — the core idea, grounded in real behavior)

ACTION (1 concrete thing to do today — under 5 minutes)

REFLECTION PROMPT (1 question — open-ended, personal)

#upskilleveryday #พัฒนาตัวเอง #[pillar hashtag]
```

**Rules:**
- Write in Thai — natural, peer-to-peer tone (ภาษาเพื่อน ไม่ใช่ครู)
- No generic motivational quotes — every post must have one specific, actionable idea
- Connect to a tool or assessment on the platform at least 3×/week (e.g. "ลองทำ Wheel of Life แล้วดูว่า...")
- Avoid overused phrases: "unlock your potential", "be the best version", "hustle"
- Length: 80–120 words for social (IG/Facebook), 300–500 words for article (library)
- Every article version needs a `slug`, `title`, `category`, and `readTime` for `src/constants/article.ts`
- สำหรับบทความที่ผู้ใช้นำมาให้จัด Format (ไม่ใช่บทความที่ AI คิดคำโฆษณา/โปรโมตให้) ห้ามใส่ลิงก์ชวนเล่นเครื่องมือหรือการโปรโมตท้ายบทความเด็ดขาด เพื่อให้รักษาโทนงานเขียนของจริงไว้

**Weekly Content Schedule Template:**

```
Mon: Short post (IG/Facebook) — Mindset insight
Tue: Short post — AI tool / working with AI (สลับกับ Career ทุกสองสัปดาห์)
Wed: Short post — Money habit
Thu: Long article — Self-awareness deep dive (links to DISC/Wheel assessment)
Fri: Short post — Focus technique
Sat: Long article — Book/learning system (links to Library of Souls)
Sun: Short post — Weekly reflection prompt
```

**AI Pillar — แนวทางเขียน:**
- เน้น practical: "ใช้ AI ทำอะไรได้จริงในชีวิตประจำวัน" ไม่ใช่ hype
- ตัวอย่างหัวข้อ: วิธี prompt ที่ได้ผลจริง / AI ช่วย self-reflection ได้ยังไง / งานไหนที่ AI ทำแทนไม่ได้
- Tone: พี่ที่ลองมาก่อนแล้วมาเล่าให้ฟัง ไม่ใช่ expert บรรยาย

**To generate a daily post, provide:**
1. Today's pillar (or let agent pick by day of week)
2. Target platform: `social` (short) or `article` (long)
3. Optional: tie-in to a specific platform tool

---

## Development Conventions

- **Imports:** Lucide icons from `lucide-react`, Framer Motion from `framer-motion`, Firebase from `@/lib/firebase`
- **Type casts:** Use `as unknown as TargetType` for Firestore snapshot stubs in strict TS mode
- **Zod:** All API routes validate with Zod before processing — unknown fields use `z.unknown()`
- **`any` casts:** Only acceptable for `userData.lastWheel` and similar deeply-typed Firestore blobs where Zod uses `z.unknown()`
- **Comments:** Only write a comment when the WHY is non-obvious — no inline narration
- **New pages:** Must export a default React component, use `"use client"` if using hooks/state
- **Environment vars:** Server-only vars have no `NEXT_PUBLIC_` prefix; never reference them in client components
