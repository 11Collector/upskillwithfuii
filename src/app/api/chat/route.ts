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
  const { messages, userData, isQuestMode } = parsed.data;
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
    // 🧠 1. Fetch and Retrieve relevant notes using LLM-based RAG
    const notesRef = adminDb.collection("users").doc(authResult.uid).collection("second_brain");
    const notesSnap = await notesRef.orderBy("updatedAt", "desc").limit(30).get();
    
    let relevantNotesContext = "";

    if (!notesSnap.empty) {
      const noteSummaries = notesSnap.docs.map((doc, index) => ({
        index,
        title: doc.data().title || "บันทึกที่ไม่มีชื่อ",
        excerpt: (doc.data().content || "").substring(0, 150)
      }));

      const lastUserMessage = messages[messages.length - 1]?.content || "";

      try {
        const retrievalResponse = await fetch("https://api.deepseek.com/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              {
                role: "system",
                content: `คุณคือระบบวิเคราะห์ความเกี่ยวข้องของข้อมูล (Strict Context Router)
หน้าที่ของคุณคือวิเคราะห์ข้อความล่าสุดของผู้ใช้ และเลือกโน้ตที่ "มีความจำเป็นในการตอบคำถามนี้โดยตรงเท่านั้น" จากรายการโน้ตที่กำหนดให้

กฎเกณฑ์ในการตัดสินใจ:
1. เลือกโน้ตเฉพาะเมื่อผู้ใช้ถามถึงเนื้อหาในโน้ตนั้นๆ หรือต้องการให้ประมวลผล/อ้างอิงข้อมูลส่วนตัวที่ระบุในโน้ตนั้นโดยตรง
2. ห้ามเลือกโน้ตหากผู้ใช้เพียงแค่คุยทักทายทั่วไป ถามสารทุกข์สุกดิบ หรือคุยประเด็นที่ไม่ได้มีความเกี่ยวข้องโดยตรงกับตัวบันทึก (แม้จะมีคำศัพท์คล้ายกันในชื่อโน้ตก็ตาม)
3. หากเกี่ยวเพียงเล็กน้อย หรือไม่มั่นใจ ให้ปัดตกเป็นไม่เกี่ยวข้องทันที
4. ห้ามทึกทักเอาเองว่าผู้ใช้พูดถึงโน้ตถ้าผู้ใช้คุยประเด็นกว้างๆ

การตอบกลับ:
- ตอบกลับด้วย JSON Array ของรหัสดัชนี (index) เช่น [0, 2]
- หากไม่มีโน้ตใดเกี่ยวข้องเลย หรือผู้ใช้คุยเรื่องทั่วไป ให้ตอบกลับด้วย [] เท่านั้น
- ห้ามตอบข้อความพูดคุย วิเคราะห์ หรือข้อความอธิบายใดๆ นอกเหนือจากตัว JSON Array เด็ดขาด (Strict JSON Output)`
              },
              {
                role: "user",
                content: `ข้อความล่าสุดของผู้ใช้: "${lastUserMessage}"\n\nรายการโน้ตส่วนตัวที่มี:\n${JSON.stringify(noteSummaries)}`
              }
            ],
            stream: false,
            temperature: 0.1,
            max_tokens: 50
          })
        });

        if (retrievalResponse.ok) {
          const retrievalData = await retrievalResponse.json();
          const retrievalText = retrievalData.choices[0].message.content.trim();
          const matchedIndexes = JSON.parse(retrievalText.match(/\[.*\]/)?.[0] || "[]");
          
          if (Array.isArray(matchedIndexes) && matchedIndexes.length > 0) {
            const matchedDocs = matchedIndexes
              .map(idx => notesSnap.docs[idx])
              .filter(Boolean);

            relevantNotesContext = matchedDocs.map(doc => {
              const data = doc.data();
              return `--- บันทึกย่อ: ${data.title} ---\nหมวดหมู่: ${data.category || 'ทั่วไป'}\nเนื้อหา:\n${data.content || 'ไม่มีเนื้อหา'}\n`;
            }).join("\n\n");
          }
        }
      } catch (err) {
        console.error("RAG Retrieval Failed:", err);
      }
    }

    // Fetch last 10 completed quests from quest_log subcollection
    let recentQuestsContext = "";
    try {
      const questLogRef = adminDb.collection("users").doc(authResult.uid).collection("quest_log");
      const questLogSnap = await questLogRef.orderBy("createdAt", "desc").limit(10).get();
      if (!questLogSnap.empty) {
        const list = questLogSnap.docs.map(doc => {
          const data = doc.data();
          return `- ${data.title} (${data.type}) เมื่อวันที่ ${data.completedAt || 'ไม่ระบุ'}`;
        });
        recentQuestsContext = `--- ประวัติเควสสะสมที่เพิ่งทำสำเร็จ 10 ข้อล่าสุด ---\n${list.join("\n")}`;
      } else {
        recentQuestsContext = "ยังไม่มีประวัติเควสสะสมในระบบ";
      }
    } catch (questErr) {
      console.error("Error fetching quest log:", questErr);
      recentQuestsContext = "ไม่สามารถโหลดข้อมูลประวัติเควสได้";
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

    const systemPrompt = `คุณคือ 'พี่ฟุ้ย (Fuii)' รุ่นพี่คนสนิทที่เป็น AI Personal Mentor และผู้ก่อตั้งแพลตฟอร์ม Upskill with Fuii คอยช่วยเหลือให้คำปรึกษาการพัฒนาตัวเองและชีวิตกับน้อง ${userData.displayName || 'นักเดินทาง'}

!!! กฎเหล็ก (CRITICAL RULES) !!!:
- ตอบเป็นภาษาไทยหรือภาษาอังกฤษเท่านั้น (Thai and English ONLY)
- **ห้ามใช้ภาษาจีนเด็ดขาด (STRICTLY NO CHINESE CHARACTERS)**

บุคลิกภาพ (Persona):
1. เพื่อนที่รู้ใจแบบไม่ต้องพูดเยอะ: คุณเห็นข้อมูลเบื้องหลังทั้งหมด (DISC, Money, Mood) แต่ **ห้ามพูดชื่อข้อมูลเหล่านี้ออกมาตรงๆ** และ **ห้ามทักเรื่องอารมณ์หรือคำคมทันที** หากผู้ใช้ไม่ได้เป็นคนเปิดประเด็นเรื่องนั้นก่อน
2. คมในฝัก: ใช้ข้อมูลที่มีเพื่อช่วย "วิเคราะห์" และ "ปรับโทนการตอบ" ให้เข้ากับผู้ใช้เท่านั้น (เช่น ถ้าผู้ใช้เพิ่งได้อารมณ์เศร้ามา ให้คุณตอบแบบนุ่มนวลขึ้นโดยไม่ต้องถามว่าเศร้ามั้ย)
3. นำเสนอคำแนะนำ: คุณคือผู้รู้ที่เข้าใจข้อมูลพัฒนาตัวเองของผู้ใช้ในทุกมิติ (Wheel of life, DISC, Money Avatar, Ghost) ใช้ข้อมูลเหล่านี้คอยแนะแนวทางให้น้องเติบโตได้ตรงจุดที่สุด
4. ความเป็น Life Coach มืออาชีพ: ให้คำแนะนำที่เน้น 'Growth Mindset' ให้กำลังใจอย่างมีเหตุผล ท้าทายความคิดเดิมๆ ด้วยคำถามปลายเปิดเพื่อให้ผู้ใช้ค้นพบทางออกด้วยตัวเอง และเน้นความเป็นไปได้ในอนาคตมากกว่าการจมอยู่กับปัญหาในอดีต ตอบสนองแบบคนที่มีวุฒิภาวะสูง ใจเย็น และมีความเป็นผู้นำทางความคิด (Thought Leader)

สไตล์การพูด (Voice of Fuii — เจ้าของแพลตฟอร์ม):
- โทนเสียง: "รุ่นพี่แชร์ประสบการณ์ให้รุ่นน้อง" — ใกล้ชิด เป็นกันเอง ไม่สั่งสอน
- สรรพนาม: แทนตัวเองว่า "พี่" หรือ "พี่ฟุ้ย" และเรียกผู้ใช้ว่า "คุณ" หรือ "คุณ [ชื่อผู้ใช้]" เป็นหลักเพื่อความสุภาพและเซฟที่สุดสำหรับทุกช่วงอายุ (หลีกเลี่ยงการทึกทักเรียกผู้ใช้ว่า "น้อง" ตั้งแต่แรก ยกเว้นผู้ใช้จะบอกให้เรียก หรือแทนตัวเองว่าน้อง) สามารถใช้คำว่า "เรา" สลับได้ตามความเหมาะสมแบบเป็นกันเอง
- ประโยคสั้น กระชับ ตัดบรรทัดบ่อย ไม่เขียนพารากราฟยาวติดกัน
- ใช้ภาษาพูดผสม Thinglish ตามธรรมชาติ เช่น Mindset, Process, Context, Hard Skill
- ใช้ 1/ 2/ 3/ เมื่อต้องการแสดงลำดับ และ > เมื่อแสดงผลลัพธ์หรือขั้นตอน
- ชวนคิดด้วยคำถามปลายเปิด แทนการชี้นิ้วสั่ง เช่น "ลองหยุดถามตัวเองดูว่า..." แทน "คุณต้องทำ..."
- ห้ามใช้: "unlock your potential", "be the best version", ภาษาเพ้อฝันจับต้องไม่ได้
- ถ้าจะปิดบทสนทนา ใช้ประโยคสรุปคมๆ 1 ประโยค ไม่ต้องยืดยาด

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
- อารมณ์ล่าสุด: ${userData.lastMood || 'ปกติ'}
- คำคมที่เพิ่งได้: "${userData.lastQuote || 'ไม่มี'}"
- ข้อมูล DISC: ${JSON.stringify(userData.lastDisc || 'ไม่มี')}
- ข้อมูลการเงิน: ${JSON.stringify(userData.lastMoney || 'ไม่มี')}
- ข้อมูล Library Soul (Reading Soul Type): ${JSON.stringify(userData.lastLibrarySoul || 'ไม่มี')}
- ผลแบบประเมิน Ghost in You (ความกลัวลึกๆ): ${(userData.lastGhostResult as any)?.primary || 'ไม่มี'}
- เป้าหมายชีวิต: ${(userData.lastWheel as any)?.goal || 'ไม่ได้ระบุ'}
- ข้อมูล Memento Mori (เวลาชีวิต): วันเกิดคือ ${userData.birthdate || 'ไม่ได้ระบุ'}${currentAge ? ` (อายุปัจจุบัน ${currentAge} ปี)` : ''}, คาดการณ์อายุขัยคือ ${userData.expectedAge || 'ไม่ได้ระบุ'} ปี
- บันทึกการทบทวนเวลาชีวิต (Memento Mori Reflections): ${userData.mementoReflections && Array.isArray(userData.mementoReflections) && userData.mementoReflections.length > 0 ? userData.mementoReflections.map((r: any) => `คำถาม: "${r.question}" -> คำตอบ: "${r.answer}"`).join(' | ') : 'ยังไม่มีการทบทวน'}
${relevantNotesContext ? `- ข้อมูลบันทึกส่วนตัวของผู้ใช้ (Second Brain) ที่เกี่ยวข้องกับบทสนทนา:\n${relevantNotesContext}\n` : ''}

คำแนะนำในการสนทนา:
- ทักทายแบบปกติ เป็นกันเอง ตามประวัติการคุย
- ใช้ข้อมูล Context และบันทึกส่วนตัว (Second Brain) ที่เชื่อมโยง เพื่อให้คำแนะนำที่ "ตรงจุด" และอ้างอิงถึงข้อมูลที่ผู้ใช้เคยจดบันทึกไว้ได้อย่างเป็นธรรมชาติที่สุด โดยทำให้เหมือนว่าคุณจำเรื่องราวและความคิดของเขาได้ คล้ายกับมีสมองส่วนขยายของตัวเองมาช่วยเตือนความจำ

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
    const timeout = setTimeout(() => controller.abort(), 20000);

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
          contextReminder
        ],
        stream: false,
        temperature: 0.8,
      })
    });

    clearTimeout(timeout);

    if (!response.ok) {
      if (quota.reserved) {
        releaseFreeChatQuota(authResult.uid).catch(() => {});
      }
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.error?.message || "DeepSeek API Error" }, { status: response.status });
    }

    const data = await response.json();
    const reply = data.choices[0].message.content.trim();

    logAiCall(authResult.uid, "ai_mentor").catch(() => {});

    return NextResponse.json({ success: true, reply, remainingFreeMessages: quota.remaining });

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
