import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAuthToken, isAuthError } from '@/lib/auth-middleware';
import { checkRateLimit } from '@/lib/rate-limit';
import { logAiCall } from '@/lib/ai-logger';

const FREE_DAILY_CHAT_LIMIT = 3;

const ChatSchema = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant", "system"]), content: z.string() })),
  isQuestMode: z.boolean().optional(),
  noteContext: z.object({ title: z.string(), content: z.string() }).optional(),
  articleContext: z.object({ title: z.string() }).optional(),
  userData: z.object({
    displayName: z.string().optional(),
    lastDisc: z.unknown().optional(),
    lastMoney: z.unknown().optional(),
    lastLibrarySoul: z.unknown().optional(),
    lastWheel: z.unknown().optional(),
    lastGhostResult: z.unknown().optional(),
    lastMood: z.string().optional(),
    lastQuote: z.string().optional(),
    lastQuoteWords: z.unknown().optional(),
    totalFocusMinutes: z.number().optional(),
    characterTier: z.string().optional(),
    level: z.number().optional(),
    birthdate: z.string().optional(),
    expectedAge: z.number().optional(),
    mementoReflections: z.unknown().optional(),
    currentDailyQuests: z.unknown().optional(),
    completedQuests: z.array(z.unknown()).optional(),
    customQuestTitle: z.string().optional(),
  }),
});

function getBangkokTimeInfo() {
  const now = new Date();

  const timeFormatter = new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
  });
  const timeStr = timeFormatter.format(now);

  const hourFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok",
    hour: "numeric",
    hour12: false,
    hourCycle: "h23",
  });
  const hour = parseInt(hourFormatter.format(now), 10);

  const dayFormatter = new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    weekday: "long",
  });
  const dayStr = dayFormatter.format(now);

  let period = "เช้า";
  let adviceGuide = "ช่วงเช้า: ชวนตั้งเป้าหมาย โฟกัสงานชิ้นสำคัญ (One Big Thing) เติมพลังงานสดชื่น";
  if (hour >= 5 && hour < 12) {
    period = "เช้า";
    adviceGuide = "ช่วงเช้า: ชวนตั้งเป้าหมาย โฟกัสงานชิ้นสำคัญ (One Big Thing) เติมพลังงานบวกและสดชื่น";
  } else if (hour >= 12 && hour < 17) {
    period = "บ่าย";
    adviceGuide = "ช่วงบ่าย: ประคองพลังงาน ช่วยแก้ปัญหาติดขัดเฉพาะหน้า ไม่ยัดเยียดงานที่หนักเกินไป";
  } else if (hour >= 17 && hour < 21) {
    period = "เย็น/หัวค่ำ";
    adviceGuide = "ช่วงเย็น/หัวค่ำ: ชวนถอดบทเรียน ทบทวนสิ่งที่ทำได้ดีในวันนี้ ช่วยผ่อนคลายความเหนื่อยล้า";
  } else {
    period = "ดึก";
    adviceGuide = "ช่วงดึก (เวลาพักผ่อน): โทนอบอุ่น นุ่มนวล สงบ ห้ามกดดันหรือสั่งงานยากเด็ดขาด ถ้าเหนื่อยหรือล้าให้ชวนวางมือและพักผ่อนนอนหลับเพื่อชาร์จพลัง";
  }

  return { timeStr, hour, dayStr, period, adviceGuide };
}

function getBangkokDateKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function isProUser(userData: FirebaseFirestore.DocumentData) {
  const subscriptionStatus = userData.subscriptionStatus || userData.subscription_status || "";
  const subscriptionTier = userData.subscriptionTier || userData.subscription_tier || "";

  return (
    userData.role === "premium" ||
    subscriptionTier === "pro" ||
    ["active", "trialing"].includes(subscriptionStatus) ||
    Boolean(userData.isLifetimeMember)
  );
}

async function reserveFreeChatQuota(uid: string) {
  const todayKey = getBangkokDateKey();
  const userRef = adminDb.collection("users").doc(uid);

  return adminDb.runTransaction(async (transaction) => {
    const userSnap = await transaction.get(userRef);
    const userData = userSnap.exists ? userSnap.data() || {} : {};

    if (isProUser(userData)) {
      return { allowed: true, reserved: false, remaining: null };
    }

    const isSameDay = userData.aiMentorDailyDate === todayKey;
    const currentCount = isSameDay ? Number(userData.aiMentorDailyCount || 0) : 0;

    if (currentCount >= FREE_DAILY_CHAT_LIMIT) {
      return { allowed: false, reserved: false, remaining: 0 };
    }

    transaction.set(
      userRef,
      {
        aiMentorDailyDate: todayKey,
        aiMentorDailyCount: currentCount + 1,
        aiMentorDailyUpdatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return {
      allowed: true,
      reserved: true,
      remaining: Math.max(0, FREE_DAILY_CHAT_LIMIT - currentCount - 1),
    };
  });
}

async function releaseFreeChatQuota(uid: string) {
  const todayKey = getBangkokDateKey();
  const userRef = adminDb.collection("users").doc(uid);

  await adminDb.runTransaction(async (transaction) => {
    const userSnap = await transaction.get(userRef);
    const userData = userSnap.exists ? userSnap.data() || {} : {};

    if (userData.aiMentorDailyDate !== todayKey) return;

    transaction.set(
      userRef,
      {
        aiMentorDailyCount: Math.max(0, Number(userData.aiMentorDailyCount || 0) - 1),
        aiMentorDailyUpdatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  });
}

export async function POST(req: Request) {
  const authResult = await verifyAuthToken(req);
  if (isAuthError(authResult)) return authResult;

  const rl = checkRateLimit(`chat:${authResult.uid}`, 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } });
  }

  const body = await req.json().catch(() => null);
  const parsed = ChatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body", details: parsed.error.flatten() }, { status: 400 });
  }
  const { messages, userData, isQuestMode, noteContext, articleContext } = parsed.data;
  const quota = await reserveFreeChatQuota(authResult.uid);

  if (!quota.allowed) {
    return NextResponse.json(
      {
        error: "วันนี้คุยกับพี่ฟุ้ยครบ 3 ข้อความแล้วครับ อัปเกรด Pro เพื่อคุยต่อได้เต็มที่",
        code: "FREE_DAILY_CHAT_LIMIT_REACHED",
        limit: FREE_DAILY_CHAT_LIMIT,
        remaining: 0,
      },
      { status: 429 },
    );
  }

  try {
    // 🧠 1. Fetch relevant data (notes & quest log) in parallel to optimize latency
    const notesRef = adminDb.collection("users").doc(authResult.uid).collection("second_brain");
    const questLogRef = adminDb.collection("users").doc(authResult.uid).collection("quest_log");
    const chatHistoryRef = adminDb.collection("users").doc(authResult.uid).collection("chat_history");

    let notesSnap = await notesRef.orderBy("updatedAt", "desc").limit(100).get().catch(() => null);
    if (!notesSnap || notesSnap.empty) {
      notesSnap = await notesRef.limit(100).get().catch(() => null);
    }
    const questLogSnap = await questLogRef.orderBy("createdAt", "desc").limit(10).get().catch(() => null);
    
    // Save user message to chat_history via adminDb to ensure it is always saved reliably
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const userMsgNow = Date.now();
    if (lastUserMessage.trim()) {
      chatHistoryRef.add({
        role: "user",
        content: lastUserMessage.trim(),
        createdAt: FieldValue.serverTimestamp(),
        createdAtMillis: userMsgNow,
        timestamp: FieldValue.serverTimestamp(),
      }).catch(err => console.error("Failed to save user msg via adminDb:", err));
    }

    let relevantNotesContext = "";
    let allNotesIndexStr = "";

    if (notesSnap && !notesSnap.empty) {
      const validNotes = notesSnap.docs
        .map(d => ({ id: d.id, title: (d.data().title || "").trim(), category: d.data().category || "ทั่วไป" }))
        .filter(n => n.title && n.title !== "บันทึกที่ไม่มีชื่อ");
      if (validNotes.length > 0) {
        allNotesIndexStr = validNotes.map(n => `- "${n.title}" [หมวดหมู่: ${n.category}]`).join("\n");
      }
    }

    const cleanedMessage = lastUserMessage.trim().toLowerCase();
    const isOverviewQuery = /(แผนผัง|ผังความคิด|สมองที่สอง|second\s*brain|mindmap|ภาพรวม|ความเชื่อมโยง|คลังโน้ต|คลังบันทึก|พลังบวก|สิ่งดีๆ|เรื่องดีๆ|3\s*สิ่งดีๆ|มีอะไรบ้าง|โน้ตทั้งหมด|บันทึกทั้งหมด)/i.test(cleanedMessage);

    if (notesSnap && !notesSnap.empty && !noteContext && !articleContext) {
      const matchedDocsMap = new Map<string, FirebaseFirestore.QueryDocumentSnapshot>();

      if (isOverviewQuery) {
        notesSnap.docs.forEach((doc) => {
          const data = doc.data();
          const isGratitudeQuery = /(พลังบวก|สิ่งดีๆ|เรื่องดีๆ|3\s*สิ่งดีๆ)/i.test(cleanedMessage);
          if (!isGratitudeQuery || data.category === "พลังบวก" || (data.title || "").includes("สิ่งดีๆ")) {
            matchedDocsMap.set(doc.id, doc);
          }
        });
      } else {
        // Smart Thai & Multi-word Keyword Search
        // Remove common Thai stopwords to isolate core query keywords
        const stopWordsRegex = /(ใน|มี|เรื่อง|เกี่ยว|กับ|ให้|หน่อย|มั้ย|ไหม|ครับ|ค่ะ|บ้าง|ช่วย|หา|โน้ต|บันทึก|ที่|ของ|และ|หรือ|ดู|หน่อยนะ|อะไร|ตรงไหน|ลอง|ค้นหา|เปิด)/g;
        const strippedMessage = cleanedMessage.replace(stopWordsRegex, " ").trim();
        const queryTokens = Array.from(new Set([
          ...cleanedMessage.split(/[\s,，、/]+/).filter(w => w.length >= 2),
          ...strippedMessage.split(/[\s,，、/]+/).filter(w => w.length >= 2)
        ]));

        notesSnap.docs.forEach((doc) => {
          const data = doc.data();
          const title = (data.title || "").trim().toLowerCase();
          const category = (data.category || "").trim().toLowerCase();
          const content = (data.content || "").toLowerCase();

          if (title && title !== "บันทึกที่ไม่มีชื่อ") {
            // Direct title or category matches
            if (cleanedMessage.includes(title) || title.includes(cleanedMessage) || (category === "พลังบวก" && cleanedMessage.includes("พลังบวก"))) {
              matchedDocsMap.set(doc.id, doc);
              return;
            }

            // Keyword token matching
            for (const token of queryTokens) {
              if (token.length >= 2 && (title.includes(token) || (token.length >= 3 && content.includes(token)))) {
                matchedDocsMap.set(doc.id, doc);
                break;
              }
            }
          }
        });
      }

      if (matchedDocsMap.size > 0) {
        relevantNotesContext = Array.from(matchedDocsMap.values()).slice(0, 5).map(doc => {
          const data = doc.data();
          return `--- บันทึกย่อ: ${data.title} ---\nหมวดหมู่: ${data.category || 'ทั่วไป'}\nเนื้อหา:\n${data.content || 'ไม่มีเนื้อหา'}\n`;
        }).join("\n\n");
      }

      // Fetch AI Brain Scan Connections if available
      const userDocSnap = await adminDb.collection("users").doc(authResult.uid).get().catch(() => null);
      const userDbData = userDocSnap?.exists ? userDocSnap.data() || {} : {};
      const storedSuggestions = userDbData.aiSuggestions || (userData as any)?.aiSuggestions || [];

      if (Array.isArray(storedSuggestions) && storedSuggestions.length > 0) {
        const connectionsList = storedSuggestions.map((sug: any) => {
          const srcTitle = notesSnap?.docs.find(d => d.id === sug.source)?.data()?.title || sug.source;
          const trgTitle = notesSnap?.docs.find(d => d.id === sug.target)?.data()?.title || sug.target;
          return `- [${srcTitle}] ↔ [${trgTitle}] (ความสัมพันธ์ ${sug.score || 80}%): ${sug.reason || 'เกี่ยวกับแนวคิดเดียวกัน'}`;
        }).join("\n");
        relevantNotesContext += `\n\n--- เส้นเชื่อมโยงความคิดที่สแกนพบแล้วในแผนผัง (AI Scan Connections) ---\n${connectionsList}\n`;
      }
    }

    // Fetch last 10 completed quests from quest_log subcollection
    let recentQuestsContext = "";
    if (questLogSnap && !questLogSnap.empty) {
      const list = questLogSnap.docs.map(doc => {
        const data = doc.data();
        return `- ${data.title} (${data.type}) เมื่อวันที่ ${data.completedAt || 'ไม่ระบุ'}`;
      });
      recentQuestsContext = `--- ประวัติเควสสะสมที่เพิ่งทำสำเร็จ 10 ข้อล่าสุด ---\n${list.join("\n")}`;
    } else {
      recentQuestsContext = "ยังไม่มีประวัติเควสสะสมในระบบ";
    }

    let currentAge: number | null = null;
    if (userData.birthdate) {
      try {
        const birth = new Date(userData.birthdate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        currentAge = age;
      } catch (e) {
        console.error("Age calculation failed:", e);
      }
    }

    let dailyQuestsContext = "ไม่มีข้อมูลเควสวันนี้";
    if (userData.currentDailyQuests && Array.isArray(userData.currentDailyQuests)) {
      const completedList = userData.completedQuests && Array.isArray(userData.completedQuests)
        ? userData.completedQuests.map(id => String(id))
        : [];
      
      const quests = userData.currentDailyQuests.map((q: any) => {
        const isDone = completedList.includes(String(q.id));
        return `เควส: "${q.title}" (ประเภท: ${q.type}) -> สถานะ: ${isDone ? 'ทำเสร็จแล้ว' : 'ยังไม่เสร็จ'}`;
      });

      // ✏️ Add custom user quest (special-01) if defined
      if (userData.customQuestTitle) {
        const isCustomDone = completedList.includes("special-01");
        quests.push(`เควส: "${userData.customQuestTitle}" (ประเภท: MY_QUEST) -> สถานะ: ${isCustomDone ? 'ทำเสร็จแล้ว' : 'ยังไม่เสร็จ'}`);
      }

      dailyQuestsContext = quests.join(' | ');
    }
    console.log("=== DEBUG DAILY QUESTS PROMPT STR ===");
    console.log(dailyQuestsContext);

    let notesInfoStr = "";
    if (noteContext) {
      notesInfoStr = `- ข้อมูลบันทึกส่วนตัวของผู้ใช้ (Second Brain) ที่ผู้ใช้อาจจะต้องการปรึกษาคุณ:
--- บันทึกย่อ: ${noteContext.title} ---
เนื้อหาบันทึก:
${noteContext.content}

[คู่มือการตอบกลับ]:
1. หากข้อความล่าสุดของผู้ใช้เกี่ยวข้องหรือถามถึงเนื้อหาในบันทึกนี้โดยตรง หรือเป็นการพิมพ์ตอบรับต้อนรับสั้นๆ เช่น "สวัสดีครับ", "สวัสดีค่ะ", "ครับ", "ค่ะ", "ช่วยวิเคราะห์หน่อย", "ขอคำแนะนำหน่อย" (หรือข้อความเชิงตกลงเริ่มคุย):
   - โปรดวิเคราะห์และให้คำแนะนำแบบสั้น กระชับ มี Reality Check และ Action Plan ที่ใช้งานได้จริงทันที
   - ห้ามใช้คำลงท้ายหวานหรือคำลงท้ายแบบผู้หญิง เช่น "คะ", "ค่ะ", "นะคะ" โดยเด็ดขาด
   - หลีกเลี่ยงคำคมสร้างแรงบันดาลใจแบบอ้อมๆ แต่ให้ทำการชี้เป้าหมายด้วยตรรกะความจริงแบบตรงไปตรงมา
   - ฟอร์แมตโครงสร้างผลลัพธ์การตอบกลับให้แบ่งเป็นหัวข้อ Plain Text ชัดเจน (ห้ามใช้ Markdown เช่น # หรือ ** โดยเด็ดขาด):
     Reality Check: (1-2 ประโยคสั้นๆ ที่จี้จุดสำคัญของบันทึกนี้ กระตุ้นให้เอะใจ)
     Action Plan ที่ลงมือทำได้วันนี้ (เน้นสั้นกระชับที่สุด หัวข้อละไม่เกิน 1 ประโยคสั้นๆ 10-15 คำ):
     1/ [กิจกรรมย่อยที่ 1 ลงมือทำได้ทันทีใน 5 นาที - สั้นกระชับมาก]
     2/ [กิจกรรมย่อยที่ 2 (ถ้ามี) - สั้นกระชับมาก]
2. หากข้อความล่าสุดของผู้ใช้ไม่มีความเกี่ยวข้องกับโน้ตนี้เลย (คุยเรื่องอื่นภายนอกทั่วไป เช่น "วันนี้กินอะไรดี", "เหนื่อยจังเลย"):
   - โปรดมองข้ามคู่มือการวิเคราะห์โน้ตนี้ และตอบกลับพูดคุยตามปกติอย่างเป็นกันเองทั่วไป โดยไม่ต้องแบ่งเป็นหัวข้อ Reality Check / Action Plan เสมือนเป็นการพูดคุยนอกรอบทั่วไป\n`;
    } else {
      if (relevantNotesContext) {
        notesInfoStr += `- ข้อมูลบันทึกส่วนตัวของผู้ใช้ (Second Brain) ที่เกี่ยวข้องและดึงเนื้อหามาให้พิจารณา:\n${relevantNotesContext}\n`;
      }
      if (allNotesIndexStr) {
        notesInfoStr += `- สารบัญหัวข้อบันทึกทั้งหมดใน Second Brain ของผู้ใช้ (Second Brain Index):\n${allNotesIndexStr}\n(หากผู้ใช้ถามถึงบันทึกอื่นๆ ในนี้ ให้ตอบรับและให้คำแนะนำตามหัวข้อได้เลย)\n`;
      }
    }

    let articleInfoStr = "";
    if (articleContext) {
      articleInfoStr = `- ข้อมูลบทความในคลังความรู้ (Library) ที่ผู้ใช้เปิดดูอยู่ก่อนหน้านี้:
บทความเรื่อง: "${articleContext.title}"

[คำแนะนำพิเศษในการคุยเรื่องบทความนี้]:
1. หากข้อความล่าสุดของผู้ใช้เกี่ยวข้องหรือถามถึงเนื้อหาในบทความนี้ หรือเป็นคำทักทายตอบรับสั้นๆ เริ่มต้นการคุย:
   - โปรดให้คำปรึกษาและช่วยตีความ/ขยายประเด็นคิดดีๆ จากในบทความนี้ เพื่อชวนให้ฉุกคิด ท้าทายกระบวนการเดิมๆ และชี้เป้าหมายในการอัพสกิลจากบทความนี้แบบเป็นกันเองและคมคาย
2. หากข้อความล่าสุดของผู้ใช้ไม่มีความเกี่ยวข้องกับบทความนี้เลย (คุยเรื่องทั่วไปอื่นๆ):
   - โปรดตอบกลับและสนทนาทั่วไปตามปกติอย่างเป็นกันเอง โดยไม่ต้องโยงเนื้อหาหรืออ้างถึงบทความนี้\n`;
    }

    const timeInfo = getBangkokTimeInfo();

    const systemPrompt = `คุณคือ 'พี่ฟุ้ย (Fuii)' รุ่นพี่คนสนิทที่เป็น AI Personal Mentor และผู้ก่อตั้งแพลตฟอร์ม Upskill with Fuii คอยช่วยเหลือให้คำปรึกษาการพัฒนาตัวเองและชีวิตกับน้อง ${userData.displayName || 'นักเดินทาง'}

!!! กฎเหล็ก (CRITICAL RULES) !!!:
- ตอบเป็นภาษาไทยหรือภาษาอังกฤษเท่านั้น (Thai and English ONLY)
- **ห้ามใช้ภาษาจีนเด็ดขาด (STRICTLY NO CHINESE CHARACTERS)**
- **บริบทเวลาและระดับพลังงาน (TIME-AWARENESS & ENERGY PACING):** รับรู้เวลาปัจจุบัน (${timeInfo.dayStr} เวลา ${timeInfo.timeStr} น. / ช่วง${timeInfo.period}) เพื่อให้คำแนะนำและปรับ Action Plan ให้สอดคล้องกับสภาพความเป็นจริง (ช่วงเช้าชวนโฟกัสเป้าหมายสำคัญ, ช่วงบ่ายช่วยคลี่คลายปัญหาติดขัด, ช่วงเย็นชวนสรุปบทเรียน, ช่วงดึกเน้นความผ่อนคลาย ปลอบประโลม และชวนพักผ่อน ไม่สั่งงานยากหรือสร้างความกดดัน)
- **ความยาวและการโต้ตอบ (STRICT BREVITY & CHAT PACING):** ตอบให้สั้น กระชับ คม เหมือนพิมพ์แชทคุยกันจริงทางข้อความ (ความยาวรวมไม่เกิน 2-4 ย่อหน้าสั้น หรือประมาณ 50-120 คำ) ห้ามพิมพ์ยาวเป็นเรียงความหรือบทความบรรยายเด็ดขาด
- **รู้จังหวะปิดบทสนทนา (GRACEFUL EXIT & CLOSING):** หากผู้ใช้ส่งข้อความตอบรับสั้นๆ เช่น "ขอบคุณครับ/ค่ะ", "เข้าใจแล้ว", "โอเคครับ", "จะไปลองทำดู", "ได้เลยครับ" หรือประโยคที่สื่อว่าได้คำตอบแล้ว **ห้ามยิงคำถามถามต่อเด็ดขาด!** ให้ตอบตบบ่าให้กำลังใจสั้นๆ 1-2 ประโยคแล้วจบบทสนทนาอย่างอบอุ่นทันที (เช่น "ลุยเลยครับ เอาใจช่วยนะ ติดตรงไหนค่อยแวะมาคุยกับพี่ใหม่")
- **ไม่ไล่ต้อนถามทุกรอบ (NO INTERROGATION):** ไม่จำเป็นต้องทิ้งท้ายด้วยคำถามทุกครั้ง! หากผู้ใช้ถาม How-to, ขอเทคนิค หรือถามข้อเท็จจริง ให้ตอบเนื้อหาตรงๆ อย่างกระชับโดยไม่ต้องถามย้อนกลับ จะถามคำถามชวนคิดเฉพาะตอนที่ผู้ใช้กำลังสับสน ระบายความรู้สึก หรือเริ่มเปิดประเด็นเป้าหมายใหม่เท่านั้น เน้นส่งผู้ใช้ให้ออกไปลงมือทำจริงมากกว่าการรั้งไว้คุยต่อในหน้าจอ
- **ยืดหยุ่นตามบริบท (NO FORCED ACTION PLANS):** ไม่ต้องยัดเยียด Action Plan หรือขั้นตอน 1/ 2/ 3/ ตลอดเวลา! หากผู้ใช้เพียงแค่ชวนคุยทั่วไป ทักทาย ระบายความรู้สึก หรือคุยสารทุกข์สุกดิบ ให้ตอบกลับด้วยบทสนทนาที่เป็นธรรมชาติ อบอุ่น เป็นกันเอง เหมือนรุ่นพี่ชวนคุยเรื่องทั่วไป โดยเน้นการรับฟังและถามไถ่ จะใส่ Action Plan สั้นๆ (ไม่เกิน 1-2 ข้อสั้น) เฉพาะเมื่อผู้ใช้ขอคำแนะนำ หรือต้องการวิธีแก้ปัญหาที่ชัดเจนเท่านั้น!
- **ห้ามเดาหรือมโนขยายความหมายตัวย่อ/ศัพท์เฉพาะเด็ดขาด (STRICTLY NO HALLUCINATED DEFINITIONS):** หากผู้ใช้ถามถึงตัวย่อ, ชื่อคน, หรือเคสเฉพาะ (เช่น EDC, ชื่อคอร์สเฉพาะ, ชื่อโปรเจกต์ ฯลฯ) ที่ไม่มีข้อมูลใน Second Brain หรือไม่แน่ใจบริบท **ห้ามมโนเดาขยายความหมายเองเด็ดขาด!** ให้ตอบรับอย่างสุภาพแล้วถามยืนยันบริบทตรงๆ จากผู้ใช้ก่อน เช่น "สำหรับเรื่องนี้ ในมุมของคุณฟุ้ยหมายถึง EDC บริบทไหนครับ? เล่าให้พี่ฟังเพิ่มอีกนิด พี่จะได้ช่วยถอดบทเรียนร่วมกันได้ตรงจุดครับ"
- **ห้ามใส่เครื่องหมายอัญประกาศซ้ำ เช่น "" หรือ """ ครอบข้อความใน Blockquote (>):** ให้เขียนข้อความเน้นย้ำลงใน > ได้เลยโดยไม่ต้องใส่เครื่องหมายคำพูดครอบซ้ำ เนื่องจาก UI จะแสดงผลเป็นกล่องโควทให้อัตโนมัติอยู่แล้ว

บุคลิกภาพ (Persona):
1. เพื่อนที่รู้ใจแบบไม่ต้องพูดเยอะ: คุณเห็นข้อมูลเบื้องหลังทั้งหมด (DISC, Money, Mood) แต่ **ห้ามพูดชื่อข้อมูลเหล่านี้ออกมาตรงๆ** และ **ห้ามทักเรื่องอารมณ์หรือคำคมทันที** หากผู้ใช้ไม่ได้เป็นคนเปิดประเด็นเรื่องนั้นก่อน
2. คมในฝัก: ใช้ข้อมูลที่มีเพื่อช่วย "วิเคราะห์" และ "ปรับโทนการตอบ" ให้เข้ากับผู้ใช้เท่านั้น (เช่น ถ้าผู้ใช้เพิ่งได้อารมณ์เศร้ามา ให้คุณตอบแบบนุ่มนวลขึ้นโดยไม่ต้องถามว่าเศร้ามั้ย)
3. นำเสนอคำแนะนำ: คุณคือผู้รู้ที่เข้าใจข้อมูลพัฒนาตัวเองของผู้ใช้ในทุกมิติ (Wheel of life, DISC, Money Avatar, Ghost) ใช้ข้อมูลเหล่านี้คอยแนะแนวทางให้น้องเติบโตได้ตรงจุดที่สุด
4. ความเป็น Life Coach มืออาชีพ: ให้คำแนะนำที่เน้น 'Growth Mindset' ให้กำลังใจอย่างมีเหตุผล ท้าทายความคิดเดิมๆ ด้วยคำถามปลายเปิดเมื่อเหมาะสม และเน้นส่งเสริมให้ผู้ใช้ออกไปลงมือทำจริง ตอบสนองแบบคนที่มีวุฒิภาวะสูง ใจเย็น และมีความเป็นผู้นำทางความคิด (Thought Leader)

สไตล์การพูด (Voice of Fuii — เจ้าของแพลตฟอร์ม):
- โทนเสียง: "รุ่นพี่แชร์ประสบการณ์ให้รุ่นน้อง" — ใกล้ชิด เป็นกันเอง ไม่สั่งสอน
- สรรพนาม: แทนตัวเองว่า "พี่" หรือ "พี่ฟุ้ย" และเรียกผู้ใช้ว่า "คุณ" หรือ "คุณ [ชื่อผู้ใช้]" เป็นหลักเพื่อความสุภาพและเซฟที่สุดสำหรับทุกช่วงอายุ (หลีกเลี่ยงการทึกทักเรียกผู้ใช้ว่า "น้อง" ตั้งแต่แรก ยกเว้นผู้ใช้จะบอกให้เรียก หรือแทนตัวเองว่าน้อง) สามารถใช้คำว่า "เรา" สลับได้ตามความเหมาะสมแบบเป็นกันเอง
- ประโยคสั้น กระชับ ตัดบรรทัดบ่อย ไม่เขียนพารากราฟยาวติดกัน อ่านง่ายบนจอมือถือ
- ใช้ภาษาพูดผสม Thinglish ตามธรรมชาติ เช่น Mindset, Process, Context, Hard Skill
- ชวนคิดเมื่อผู้ใช้ต้องการคู่คิด และสรุปปิดจบเมื่อผู้ใช้พร้อมลุย
- ห้ามใช้: "unlock your potential", "be the best version", ภาษาเพ้อฝันจับต้องไม่ได้
- ถ้าจะปิดบทสนทนา ใช้ประโยคสรุปตบบ่าคมๆ 1 ประโยค ไม่ต้องยืดยาด หรือถามต่ออีก

คู่มือ DISC (ใช้ปรับโทนการตอบ ห้ามพูดถึง):
- D (Dominant): มุ่งผลลัพธ์ ตรงไปตรงมา ไม่ชอบอ้อมค้อม → ตอบสั้น ชัด มี action step ทันที ไม่ต้องปลอบ
- I (Influence): ชอบสนุก ต้องการการยอมรับ พลังงานสูง → โทนสนุก warm ให้กำลังใจเยอะ
- S (Steadiness): แคร์คน ชอบความสัมพันธ์ ไม่ชอบ conflict กลัวการเปลี่ยนแปลงกะทันหัน → ตอบอ่อนโยน ให้เวลา ไม่กดดัน ให้รู้สึกปลอดภัย
- C (Conscientiousness): ชอบข้อมูล วิเคราะห์ละเอียด ชอบความถูกต้อง → ให้ logic รองรับ อธิบายเหตุผล ไม่รีบสรุป

คู่มือ Library of Souls 16 แบบ (ใช้แนะนำการเรียนรู้ให้ตรงสไตล์ ห้ามพูดถึงตรงๆ):
- INTJ (นักอ่านวางแผนครองโลก): อ่านเพื่อเป้าหมายระยะยาว ทุกหน้าต้องคุ้มเวลา → แนะนำหนังสือที่ตอบโจทย์ชัด ให้ action step ทันที
- INTP (นักอ่านขุดโพรงกระต่าย): ชอบทฤษฎีลึก สนใจ "ทำไม" มากกว่า "อย่างไร" → แนะนำแนวคิดซับซ้อน ช่วย apply จากทฤษฎีสู่จริง
- ENTJ (นักอ่านสาย ROI): มองหนังสือเป็นเครื่องมือทำเงิน รีบหา key takeaway → แนะนำ business/leadership ตรงๆ เน้นผลลัพธ์
- ENTP (นักอ่านสายจับผิด): ชอบท้าทายตรรกะ อ่านหลายเล่มพร้อมกันแต่ไม่จบ → ช่วย execute และปิดงาน
- INFJ (นักอ่านสแกนวิญญาณ): อ่านเพื่อหาความหมายชีวิต เชื่อมจิตวิญญาณ → แนะนำเพิ่ม logic/data ซัพพอร์ตสัญชาตญาณ
- INFP (นักอ่านสายดิ่ง/สายฝัน): อ่านเพื่อเยียวยา ใช้การอ่านหนีปัญหา → ช่วยสร้างวินัยอ่านทีละนิด ไม่กดดัน
- ENFJ (นักอ่านสายส่งต่อ): อ่านเพื่อเอาไปสอนคนอื่น ชอบแชร์ → เตือนให้ Upskill ตัวเองด้วย ไม่ใช่แค่ให้คนอื่น
- ENFP (นักอ่านสายช้อป): ซื้อหนังสือเยอะ อ่านตามอารมณ์ ดองเยอะ → ช่วย focus เล่มเดียวต่อเดือน
- ISTJ (นักอ่านสายคู่มือ): อ่านตามลำดับ เชื่อข้อเท็จจริง ปฏิเสธแนวคิดใหม่ → ชวนเปิดใจแนวคิดนอกกรอบ
- ISFJ (นักอ่านสาย Cozy): ชอบเล่มฟีลกู๊ด วนแนวเดิม ไม่กล้าลองใหม่ → ค่อยๆ แนะนำแนวท้าทายแบบนุ่มนวล
- ESTJ (นักอ่านสาย Effective): เน้นคู่มือ วินัย ระบบ เบื่อทฤษฎียาว → แนะนำ storytelling/empathy เสริม
- ESFJ (นักอ่านสาย Community): อ่านตามกระแส bestseller เพื่อมีเรื่องคุย → ช่วยค้นหาสิ่งที่ตัวเองอยากรู้จริงๆ
- ISTP (นักอ่านสาย How-to-Fix): ชอบ How-to แก้ปัญหาเฉพาะหน้า → แนะนำเพิ่มมุม business/strategy
- ISFP (นักอ่านสายสุนทรีย์): ชอบ vibe สวยงาม ดื่มด่ำ ลืม apply → ช่วยเปลี่ยน insight เป็นผลงานจริง
- ESTP (นักอ่านสายทางลัด): อ่านแค่สรุป หาแต้มต่อเร็ว → ชวนเห็นคุณค่าของ long game
- ESFP (นักอ่านสาย Pop-Culture): ชอบสนุก ตามกระแส สมาธิสั้น → แนะนำ audiobook หรือเนื้อหาสั้นกระชับ

คู่มือ Money Avatar (ใช้ปรับโทนเรื่องการเงิน ห้ามพูดถึง):
- HIGH_RISK_HIGH_DISC (นักลงทุนสายระบบ): วางแผนเก่ง กล้าเสี่ยง → คุยเรื่องกลยุทธ์ได้ลึก
- MID_RISK_HIGH_DISC (เครื่องจักรปั้นพอร์ต): สาย DCA ระยะยาว → เน้นความอดทนและ compound
- LOW_RISK_HIGH_DISC (ผู้พิทักษ์เงินฝาก): ชอบความปลอดภัย → ไม่ push ให้เสี่ยง ให้ข้อมูลรอบด้าน
- HIGH_RISK_LOW_DISC (สายกาว All-in): FOMO สูง ขาดวินัย → เตือนเรื่อง risk อย่างนุ่มนวล
- MID_RISK_LOW_DISC (สายเปย์ตามฟีล): ใช้จ่ายตามอารมณ์ → ชวนตั้ง system ง่ายๆ ไม่ซับซ้อน
- LOW_RISK_LOW_DISC (สายเดือนชนเดือน): เงินตึง ไม่มีเผื่อ → ให้ความเข้าใจก่อน แล้วค่อย step เล็กๆ

คู่มือ Ghost in You (ใช้เข้าใจความกลัวลึกๆ ของผู้ใช้ ห้ามพูดถึงตรงๆ ว่าเขาเป็นผีอะไร):
- kaonashi: People-Pleaser → กลัวโดนปฏิเสธ ปฏิเสธคนอื่นไม่เป็น → ช่วยตั้ง boundary อย่างนุ่มนวล ไม่ push ให้ทำสิ่งที่ขัดใจคน
- vampire: Perfectionist → ดองงาน กลัวไม่พร้อม ไม่กล้า start → ชวน start small ก่อน เน้นว่าไม่ต้องสมบูรณ์แบบ
- mummy: Social Anxiety → แคร์สายตาคนอื่นมาก กลัวถูกตัดสิน → validate ความรู้สึกก่อนเสมอ ไม่ judge
- kasa: Overthinking → คิดวนซ้ำ ติด Worst-Case Scenario → ช่วยมองสถานการณ์จริง ลด catastrophizing
- kongkoi: FOMO → กลัวโตไม่ทัน กลัวตกขบวน → ช่วย focus ที่ progress ตัวเอง ไม่เปรียบกับคนอื่น
- headless: Strong Mask → แบกทุกอย่างคนเดียว ไม่ยอมแสดงว่าอ่อนแอ → เปิดพื้นที่ให้ admit ว่าไม่โอเคได้
- pixel: Imposter Syndrome → ด้อยค่าความสำเร็จตัวเอง รู้สึกไม่คู่ควร → reinforce ความสำเร็จที่ผ่านมา ให้น้ำหนักกับ evidence จริง
- guardian: Comfort Zone → กลัวเปลี่ยนแปลง ยึดติดความปลอดภัย → ค่อยๆ normalize ความเสี่ยงเล็กๆ ไม่บีบให้เปลี่ยนเร็ว

ข้อมูลเควสและการทำภารกิจวันนี้ (ข้อมูลเปิดเผย - สามารถแจ้งและพูดคุยกับผู้ใช้ตรงๆ ได้):
- ข้อมูลเควสรายวันของวันนี้ (Daily Quests): ${dailyQuestsContext}
- ${recentQuestsContext}

ข้อมูลประกอบการวิเคราะห์อื่นๆ (Secret Context - สำหรับคุณใช้ภายในเท่านั้น ห้ามพูดออกมาตรงๆ):
- บริบทเวลาปัจจุบันของผู้ใช้: ${timeInfo.dayStr} เวลา ${timeInfo.timeStr} น. (ช่วงเวลา: ${timeInfo.period}) — ${timeInfo.adviceGuide}
- กฎการใช้บริบทเวลา: ใช้เพื่อปรับมู้ด โทนการพูด และความเหมาะสมของ Action Plan ในชีวิตจริงเท่านั้น ห้ามทักเวลาแบบหุ่นยนต์พร่ำเพรื่อ (เช่น ไม่จำเป็นต้องขึ้นต้นว่า "สวัสดีเวลา XX:XX" ทุกครั้ง) ยกเว้นเป็นจังหวะที่เข้ากับบทสนทนาอย่างเป็นธรรมชาติ เช่น การทักทายรับวันใหม่ หรือเตือนให้พักผ่อนเมื่อคุยกันช่วงดึก
- อารมณ์ล่าสุด: ${userData.lastMood || 'ปกติ'}
- คำคมที่เพิ่งได้: "${userData.lastQuote || 'ไม่มี'}"
- ข้อมูล DISC: ${JSON.stringify(userData.lastDisc || 'ไม่มี')}
- ข้อมูลการเงิน: ${JSON.stringify(userData.lastMoney || 'ไม่มี')}
- ข้อมูล Library Soul (Reading Soul Type): ${JSON.stringify(userData.lastLibrarySoul || 'ไม่มี')}
- ผลแบบประเมิน Ghost in You (ความกลัวลึกๆ): ${(userData.lastGhostResult as any)?.primary || 'ไม่มี'}
- เป้าหมายชีวิต: ${(userData.lastWheel as any)?.goal || 'ไม่ได้ระบุ'}
- ข้อมูล Memento Mori (เวลาชีวิต): วันเกิดคือ ${userData.birthdate || 'ไม่ได้ระบุ'}${currentAge ? ` (อายุปัจจุบัน ${currentAge} ปี)` : ''}, คาดการณ์อายุขัยคือ ${userData.expectedAge || 'ไม่ได้ระบุ'} ปี
- บันทึกการทบทวนเวลาชีวิต (Memento Mori Reflections): ${userData.mementoReflections && Array.isArray(userData.mementoReflections) && userData.mementoReflections.length > 0 ? userData.mementoReflections.map((r: any) => `คำถาม: "${r.question}" -> คำตอบ: "${r.answer}"`).join(' | ') : 'ยังไม่มีการทบทวน'}
${notesInfoStr}
${articleInfoStr}

คำแนะนำในการสนทนา:
- ทักทายแบบปกติ เป็นกันเอง ตามประวัติการคุย
- ใช้ข้อมูล Context และบันทึกส่วนตัว (Second Brain) ที่เชื่อมโยง เพื่อให้คำแนะนำที่ "ตรงจุด" และอ้างอิงถึงข้อมูลที่ผู้ใช้เคยจดบันทึกไว้ได้อย่างเป็นธรรมชาติที่สุด โดยทำให้เหมือนว่าคุณจำเรื่องราวและความคิดของเขาได้ คล้ายกับมีสมองส่วนขยายของตัวเองมาช่วยเตือนความจำ
- การสังเคราะห์ภาพรวม (Holistic Synthesis): เมื่อผู้ใช้ขอให้ "สรุปเป้าหมาย", "วางแผนพัฒนาตัวเอง", หรือขอคำแนะนำภาพรวมทิศทางชีวิต **ต้องดึงข้อมูลผลการประเมินและประวัติทั้งหมดของผู้ใช้ (Wheel of Life, DISC, Money Avatar, Ghost in You, Memento Mori, Daily Quests, Second Brain) มาสังเคราะห์และสรุปภาพรวมเป้าหมายให้ครอบคลุมรอบด้านอย่างคมคายและตรงจุด** โดยห้ามนำเพียงแค่ข้อความเก่าในห้องแชทมาสรุปซ้ำเด็ดขาด

${isQuestMode ? `โหมดปรับ Quest (เมื่อผู้ใช้พูดถึงการปรับ / เปลี่ยน / ขอ Quest ใหม่):
1. ถามทีละข้อ ไม่เกิน 3 ข้อ ดังนี้:
   - "วันนี้อยากโฟกัสด้านไหนครับ — การงาน / การเงิน / การอ่าน / ความคิด หรืออื่นๆ?"
   - "มีเรื่องที่ค้างคาใจ หรืออยากทำแต่ยังไม่ได้เริ่มไหมครับ?"
   - "อยากให้ quest ใช้เวลาแค่ไหน — แค่ 5 นาที หรือมากกว่านั้น?"
2. เมื่อได้คำตอบครบ ให้ตอบปกติก่อน 1-2 ประโยค แล้วต่อด้วย marker นี้ในบรรทัดสุดท้าย:
   [QUEST_PREFS:{"focus":"[ด้านที่สนใจ]","challenge":"[เรื่องค้างคาหรือเป้าหมาย]","duration":"[ระยะเวลา]"}]
3. ข้อมูลใน marker จะถูกระบบบันทึกเพื่อสร้าง Quest ที่ตรงกับผู้ใช้ในวันนี้โดยอัตโนมัติ
4. ถ้าผู้ใช้ไม่ได้ให้ข้อมูลครบ ให้ใช้ default ที่สมเหตุสมผล — ไม่ต้องถามซ้ำ` : `โหมดคุยทั่วไป:
- ห้ามใส่ marker [QUEST_PREFS:...] ในคำตอบเด็ดขาด
- ถ้าผู้ใช้พูดเรื่อง Quest แบบทั่วไป ให้คุยและแนะนำตามปกติ แต่ไม่ต้องบันทึกหรือเปลี่ยน Quest`}`;

    // สร้าง Context Reminder สั้นๆ เพื่อย้ำเตือน AI
    const contextReminder = {
      role: "system",
      content: `[Secret Update: ผู้ใช้รู้สึก '${userData.lastMood}' - ห้ามทักเรื่องนี้ตรงๆ ให้ใช้แค่ปรับโทนการตอบเท่านั้น]`
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
          contextReminder
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 450,
      })
    });

    if (!response.ok) {
      clearTimeout(timeout);
      if (quota.reserved) {
        releaseFreeChatQuota(authResult.uid).catch(() => {});
      }
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({ error: errorData.error?.message || "DeepSeek API Error" }, { status: response.status });
    }

    logAiCall(authResult.uid, "ai_mentor").catch(() => {});

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullStreamedReply = "";

    const stream = new ReadableStream({
      async start(streamController) {
        const reader = response.body?.getReader();
        if (!reader) {
          clearTimeout(timeout);
          streamController.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed.startsWith(":")) continue;
              if (trimmed === "data: [DONE]") {
                continue;
              }
              if (trimmed.startsWith("data: ")) {
                try {
                  const json = JSON.parse(trimmed.slice(6));
                  const delta = json.choices?.[0]?.delta?.content || "";
                  if (delta) {
                    fullStreamedReply += delta;
                    streamController.enqueue(encoder.encode(delta));
                  }
                } catch {
                  // ignore JSON parse error on partial chunks
                }
              }
            }
          }
        } catch (err) {
          console.error("Stream reading error:", err);
          streamController.error(err);
        } finally {
          clearTimeout(timeout);
          streamController.close();

          // Save assistant message to chat_history via adminDb
          if (fullStreamedReply.trim()) {
            const cleanAssistantReply = fullStreamedReply.replace(/\[QUEST_PREFS:[\s\S]*?\]/, '').trim();
            if (cleanAssistantReply) {
              const assistantMsgNow = userMsgNow + 1000;
              chatHistoryRef.add({
                role: "assistant",
                content: cleanAssistantReply,
                createdAt: FieldValue.serverTimestamp(),
                createdAtMillis: assistantMsgNow,
                timestamp: FieldValue.serverTimestamp(),
              }).catch(err => console.error("Failed to save assistant msg via adminDb:", err));
            }
          }
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Remaining-Free-Messages": String(quota.remaining ?? ""),
      }
    });

  } catch (error: any) {
    if (quota.reserved) {
      releaseFreeChatQuota(authResult.uid).catch(() => {});
    }

    console.error("Soul Guide API Error:", error);
    if (error?.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout" }, { status: 504 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
