import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuthToken, isAuthError } from '@/lib/auth-middleware';
import { adminDb } from '@/lib/firebase-admin';
import { logAiCall } from '@/lib/ai-logger';
import { ghostResults } from '@/data/ghostResults';

const QuestAnalysisSchema = z.object({
  level: z.number().int().min(1).max(1000).optional(),
  wheelQuestTitle: z.string().optional(),
  energyLevel: z.enum(['low', 'medium', 'high']).optional(),
  habitPool: z.array(z.string()).optional(),
  moneyPool: z.array(z.string()).optional(),
  challengePool: z.array(z.string()).optional(),
});

const emojiRegex = /^\p{Emoji}/u;

function normalizeQuest(raw: string, defaultEmoji: string): string | null {
  let normalized = raw.trim();
  if (!emojiRegex.test(normalized)) {
    normalized = `${defaultEmoji} ${normalized}`;
  } else {
    normalized = normalized.replace(/^(\p{Emoji})\s*/u, '$1 ');
  }
  const isValid = normalized.length >= 5 && normalized.length <= 65;
  return isValid ? normalized : null;
}

async function callDeepSeek(prompt: string, maxTokens = 60): Promise<string> {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
  });
  if (!response.ok) return '';
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

export async function POST(req: Request) {
  const authResult = await verifyAuthToken(req);
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = QuestAnalysisSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const level = parsed.data.level ?? 1;
    const wheelQuestTitle = parsed.data.wheelQuestTitle || '';
    let energyLevel = parsed.data.energyLevel;
    const habitPool = parsed.data.habitPool || [];
    const moneyPool = parsed.data.moneyPool || [];
    const challengePool = parsed.data.challengePool || [];

    // 1. ดึง chat history 30 ข้อความล่าสุด
    const historySnap = await adminDb
      .collection('users')
      .doc(authResult.uid)
      .collection('chat_history')
      .orderBy('createdAt', 'desc')
      .limit(30)
      .get();

    const messages = historySnap.docs
      .map(d => d.data())
      .filter(d => d.role === 'user' && d.content?.trim())
      .map(d => d.content as string);

    // 2. ดึง user data (questPreferences + assessments)
    const userSnap = await adminDb.collection('users').doc(authResult.uid).get();
    const userData = userSnap.data() || {};
    const todayCA = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
    const questPreferences = (userData.questPreferences && userData.questPreferences.savedAt === todayCA) ? userData.questPreferences : null;
    
    // Resolve energy level: fallback to user's saved energyLevel from Firestore for today
    energyLevel = energyLevel || 
                  ((userData.lastQuestEnergyDate === todayCA) ? userData.questEnergyLevel : null) || 
                  'medium';
    const discType = userData.lastDisc?.finalResult?.charAt(0) || userData.lastDisc?.result?.charAt(0) || null;
    const wheelGoal = userData.lastWheel?.goal || null;
    const soulType = userData.lastLibrarySoul?.type || null;
    const ghostType = userData.lastGhostResult || null;
    const moneyKey = userData.lastMoney?.resultKey || 'MID_RISK_MID_DISC';

    const currentDailyQuests = userData.currentDailyQuests || [];
    const currentChallenge = currentDailyQuests.find((q: any) => q.id === 4)?.title || userData.aiGeneratedQuestTitle || "";
    const currentPersonality = currentDailyQuests.find((q: any) => q.id === 2)?.title || userData.aiGeneratedDiscTitle || "";
    const currentFinance = currentDailyQuests.find((q: any) => q.id === 3)?.title || userData.aiGeneratedMoneyTitle || "";

    let targetSlot = "challenge"; // default target
    if (questPreferences) {
      const focusStr = (questPreferences.focus || "").toLowerCase();
      if (focusStr.includes("เงิน") || focusStr.includes("finance") || focusStr.includes("money") || focusStr.includes("ลงทุน") || focusStr.includes("finance/investment") || focusStr.includes("wealth") || focusStr.includes("เหรียญ") || focusStr.includes("coin") || focusStr.includes("token")) {
        targetSlot = "finance";
      } else if (focusStr.includes("อ่าน") || focusStr.includes("บุคลิก") || focusStr.includes("นิสัย") || focusStr.includes("personality") || focusStr.includes("disc") || focusStr.includes("mbti") || focusStr.includes("library")) {
        targetSlot = "personality";
      }
    }

    // 3. ถ้าไม่มี preferences และมีข้อความน้อยเกินไป และไม่มีผลประเมินใดๆเลย → ไม่ทำ analysis
    const hasEnoughData = questPreferences || messages.length >= 5 || discType || wheelGoal || soulType || ghostType || userData.lastMoney;
    if (!hasEnoughData) {
      return NextResponse.json({ questTitle: null, discTitle: null, moneyTitle: null });
    }

    const chatSummary = messages.slice(0, 15).join('\n');

    const currentQuestsContext = (currentChallenge || currentPersonality || currentFinance)
      ? `เควสปัจจุบันของวันนี้:
- Challenge: "${currentChallenge}"
- Personality: "${currentPersonality}"
- Finance: "${currentFinance}"\n`
      : '';

    const prefsSection = questPreferences
      ? `ความต้องการพิเศษของผู้ใช้ (ต้องการให้ปรับปรุงเฉพาะด้าน):
- ด้านที่สนใจต้องการปรับปรุง: ${questPreferences.focus || 'ไม่ระบุ'} (ตรงกับเควสข้อ: ${targetSlot === 'finance' ? 'Finance (การเงิน)' : targetSlot === 'personality' ? 'Personality (บุคลิกภาพ)' : 'Challenge (ความท้าทาย)'})
- รายละเอียดเรื่องค้างคา/เป้าหมายที่อยากทำ: ${questPreferences.challenge || 'ไม่ระบุ'}
- ระยะเวลา: ${questPreferences.duration || 'ไม่ระบุ'}

กฎเหล็กสำหรับการปรับเควส:
1. ให้คุณสร้างเควสขึ้นมาใหม่เฉพาะข้อที่ถูกเลือกปรับปรุงเท่านั้น (ข้อ ${targetSlot}) โดยให้สอดคล้องกับรายละเอียดความต้องการใหม่ของผู้ใช้
2. สำหรับอีก 2 ข้อที่เหลือ คุณห้ามเขียนใหม่หรือดัดแปลงแก้ไขเด็ดขาด! ให้ตอบกลับด้วยข้อความเดิมที่ได้รับจาก "เควสปัจจุบันของวันนี้" เป๊ะๆ ทุกอักขระและ Emoji:
   - หากไม่ได้ปรับปรุง Challenge ให้ตอบกลับฟิลด์ "challenge" ด้วยค่าเดิมนี้เท่านั้น: "${currentChallenge}"
   - หากไม่ได้ปรับปรุง Personality ให้ตอบกลับฟิลด์ "personality" ด้วยค่าเดิมนี้เท่านั้น: "${currentPersonality}"
   - หากไม่ได้ปรับปรุง Finance ให้ตอบกลับฟิลด์ "finance" ด้วยค่าเดิมนี้เท่านั้น: "${currentFinance}"
\n`
      : '';

    // ดึงรายละเอียดข้อมูล Ghost
    const ghostData = ghostType ? (ghostResults[ghostType as keyof typeof ghostResults] || null) : null;
    const ghostContext = ghostData ? `${ghostData.name} (ความกลัว: ${ghostData.fearLabel})` : '(ไม่มี)';

    const assessmentContext = [
      discType && `DISC Type: ${discType}`,
      soulType && `Soul Type: ${soulType}`,
      ghostType && `Ghost in You: ${ghostContext}`,
      moneyKey && `Money Avatar: ${moneyKey}`,
      wheelGoal && `เป้าหมาย: "${wheelGoal}"`,
    ].filter(Boolean).join(' / ');

    const wheelAvoidRule = wheelQuestTitle
      ? `\n5. เควส AI ทั้ง 3 ข้อที่สร้างขึ้นมาใหม่นี้ (Challenge, Personality, Finance) "ห้ามมีความใกล้เคียง ซ้ำซ้อน หรือทำกิจกรรมคล้ายคลึงกับเควส Wheel of Life ประจำวันนี้เด็ดขาด" (เควส Wheel ของผู้ใช้วันนี้คือ: "${wheelQuestTitle}")
6. ห้ามใช้คำหลักหรือลักษณะกิจกรรมที่มีความคล้ายกันกับเควส Wheel ของผู้ใช้วันนี้อย่างเด็ดขาด`
      : '';

    let energyInstructions = '';
    if (energyLevel === 'low') {
      energyInstructions = `
- [กฎระดับพลังงาน: LOW 🔋] วันนี้ผู้ใช้เหนื่อยล้า/มีพลังงานน้อย เควสทั้ง 3 ข้อต้องออกแบบมาในสไตล์ "Tiny Habits" (พฤติกรรมจิ๋ว) ที่ใช้เวลาไม่เกิน 2 นาทีในการทำ ลงมือทำได้ทันที มีแรงต้านต่ำที่สุด แต่ได้แก้พฤติกรรมบำบัดตรงจุด (Micro-Behavioral Hack) ห้ามสั่งงานที่ต้องใช้ความพยายามสูงหรือใช้เวลานาน
- ตัวอย่างเควส Low: "📵 คว่ำหน้าจอมือถือลงทันที 5 นาทีขณะเริ่มงาน", "ย้ายของในตระกร้าออนไลน์ออก 1 ชิ้นเพื่อลดรายจ่าย", "ถามความเห็นคนอื่น 1 ครั้งสั้นๆ ก่อนตัดสินใจ"`;
    } else if (energyLevel === 'high') {
      energyInstructions = `
- [กฎระดับพลังงาน: HIGH 🔥] วันนี้ผู้ใช้ไฟแรงมาก เควสทั้ง 3 ข้อต้องออกแบบเป็น "Deep Growth Challenge" (เควสท้าทายลึกซึ้ง) ที่ใช้เวลาปฏิบัติ 15-30 นาที เพื่อผลักดันผู้ใช้ออกจากพื้นที่ปลอดภัย (Comfort Zone) อย่างแท้จริงและเกิดความเปลี่ยนแปลงเด่นชัด`;
    } else {
      energyInstructions = `
- [กฎระดับพลังงาน: MEDIUM ⚡] วันนี้ผู้ใช้มีพลังงานปกติ เควสทั้ง 3 ข้อออกแบบเป็นระดับปานกลาง ใช้เวลาปฏิบัติ 5-10 นาที มีความท้าทายแต่ยังสามารถทำได้เสร็จในวันทำงานปกติ`;
    }

    const combinedPrompt = `คุณเป็น AI โค้ชพัฒนาตัวเองและคนเขียนเควสเกมระบบ Premium
วิเคราะห์ข้อมูลของผู้ใช้และประวัติการคุยด้านล่างนี้ เพื่อสร้าง Daily Quests จำนวน 3 ข้อที่แตกต่างกันโดยสิ้นเชิง โดยอิงจากระดับพลังงานของผู้ใช้วันนี้ด้วย:
${energyInstructions}

แนวทางการสเกลเควสตามระดับพลังงาน (ความหนักหน่วงและเวลาปฏิบัติ):
- หากพลังงานต่ำ (LOW 🔋): ออกแบบเควสเป็น "Tiny Habits" (พฤติกรรมจิ๋ว) ที่ทำได้ทันทีใน 2 นาที มีแรงต้านต่ำที่สุด เช่น:
  * "📵 คว่ำหน้าจอมือถือลงทันที 5 นาทีขณะเริ่มงาน"
  * "🛒 ย้ายของในตระกร้าออนไลน์ออก 1 ชิ้นเพื่อประหยัดเงิน"
  * "🧠 ถามความเห็นคนอื่น 1 ครั้งสั้นๆ ก่อนตัดสินใจงาน"
- หากพลังงานปานกลาง (MEDIUM ⚡): ออกแบบเควสขนาดปกติ 5-10 นาที ท้าทายกำลังดี เช่น:
  * "⏱️ นั่งสมาธิกำหนดลมหายใจนิ่งๆ 5 นาที"
  * "📝 จดสรุปรายจ่ายและงบประมาณของวันนี้ลงในโน้ต"
  * "💬 แชทขอบคุณเพื่อนร่วมงานที่ช่วยเหลือเราในสัปดาห์นี้"
- หากพลังงานสูง (HIGH 🔥): ออกแบบเควสท้าทายลึกซึ้ง (Deep Growth Challenge) 15-30 นาที ผลักดันขีดจำกัดตัวเองจริงจัง เช่น:
  * "🏋️ วางตารางเวท 3 ท่าพร้อมปฏิบัติเวทเทรนนิ่งจริง 20 นาที"
  * "📋 สรุปแก่นบทเรียน 1 เรื่องจากงานที่ยากที่สุดของวันนี้ลงโน้ต"
  * "📈 ศึกษาวิธีวิเคราะห์กองทุนรวมดัชนี 1 กองพร้อมเขียนสรุปความเสี่ยง"

1. เควสความท้าทายเฉพาะคุณ (Challenge):
- อิงตามความต้องการพิเศษ แชทล่าสุด หรือเป้าหมายชีวิตของผู้ใช้
- ต้องเป็นกิจกรรมการพัฒนาทักษะ การทำงาน หรือเป้าหมายชีวิตที่มีคุณค่าจริง ๆ
- ห้ามสร้างเควสที่ง่ายเกินไปหรือดูไร้สาระ (เช่น เดินไปเซเว่นโดยไม่เปิดแผนที่, การตื่นนอน, หรือการดื่มน้ำ)

2. เควสพัฒนาบุคลิกภาพและการทำงานร่วมกับผู้อื่น (Personality):
- อิงตาม DISC (${discType || 'ไม่มี'}), MBTI (${soulType || 'ไม่มี'}), หรือ Ghost in You (${ghostType || 'ไม่มี'}) ของผู้ใช้
- ต้องเจาะลึกไปที่จุดแข็ง/จุดอ่อนของบุคลิกภาพนั้นโดยตรงเพื่อแก้ไขพฤติกรรมสุดโต่ง:
  - หากเป็นผู้ใช้กลุ่ม D/ENTJ: ฝึกฟังเพื่อนร่วมงานจนจบห้ามขัดจังหวะ หรือถามความเห็นคนอื่นก่อนตัดสินใจสรุปงาน
  - หากเป็นผู้ใช้กลุ่ม I/ENFP: ทำงานชิ้นเดียวเดี่ยว ๆ ห้ามสลับหน้าจอ (Single-tasking) 20 นาที หรือพิมพ์แชทสรุปสิ่งที่คุยทันที
  - หากเป็นผู้ใช้กลุ่ม S/ISFP: ปฏิเสธงานหรือคำชวนที่ขัดกับเป้าหมายหลักวันนี้ 1 เรื่อง หรือเสนอไอเดียเห็นต่างในห้องแชท
  - หากเป็นผู้ใช้กลุ่ม C/INTJ: กดส่งงานที่เสร็จ 90% โดยห้ามปรับแต่งความสวยงาม/แก้ไขฟอนต์ หรือเริ่มตัดสินใจจากข้อมูลสั้นๆ โดยไม่อ่านวิเคราะห์วนเวียน

3. เควสฝึกวินัยการเงินและการลงทุน (Finance):
- อิงตาม Money Avatar (${moneyKey}) ของผู้ใช้ ให้เข้ากับสถานการณ์ชีวิตของเขา
- ต้องเกี่ยวกับการเงิน การลงทุน การประหยัดค่าใช้จ่ายจริง ๆ เท่านั้น
- ห้ามนำหัวข้อที่ผู้ใช้แชทถึงแต่ไม่เกี่ยวกับการเงิน (เช่น การออกกำลังกาย, ฟิตเนส, การคุมอาหาร, การนอน) ไปผสมผสานเป็นหัวข้อในเควสการเงินเด็ดขาด เพื่อป้องกันไม่ให้เกิดความหมายที่ไม่มีอยู่จริงและอ่านแล้วแปลกประหลาด เช่น "หุ้นออกกำลังกาย", "กองทุนลดไขมัน", "เช็กสเตทเม้นต์แคลอรี่"

คลังเควสต้นแบบจริงที่เป็นเป้าหมายตรงตัวตนของผู้ใช้คนนี้ (ให้ยึดหัวข้อและแนวคิดหลักในคลังเหล่านี้เป็น "แม่แบบและเกณฑ์อ้างอิงสูงสุด" ในการประยุกต์ ดัดแปลงคำ หรือย่อย/ขยายขนาดความท้าทายตามพลังงานของเขา ห้ามเขียนเควสหลุดแนวคิดหลักของคลังเหล่านี้เด็ดขาด):
- คลังเควสพัฒนาตนเองและงานท้าทาย (Challenge Pool):
${challengePool.length > 0 ? challengePool.map((q: string) => `  * "${q}"`).join('\n') : '(ไม่มี)'}

- คลังเควสพฤติกรรมพัฒนาบุคลิกภาพ (Personality Pool):
${habitPool.length > 0 ? habitPool.map((q: string) => `  * "${q}"`).join('\n') : '(ไม่มี)'}

- คลังเควสวินัยการเงินและการลงทุน (Finance Pool):
${moneyPool.length > 0 ? moneyPool.map((q: string) => `  * "${q}"`).join('\n') : '(ไม่มี)'}

${currentQuestsContext}
${prefsSection}
ข้อมูลบริบทผู้ใช้:
- Level: ${level}
- ประวัติการประเมิน: ${assessmentContext || 'ไม่มี'}
- แชทล่าสุดของ user:
${chatSummary || '(ยังไม่มีประวัติการสนทนา)'}

กติกาสำคัญที่สุด (กฎเหล็กเพื่อความพรีเมียมและเป็นธรรมชาติ):
1. คำขึ้นต้นและโครงสร้างเควสต้องขึ้นต้นด้วยคำกริยาที่เข้มแข็งและชัดเจน (Strong Active Verbs) เช่น 'วางแผน', 'บันทึก', 'จัดตาราง', 'งด', 'ปฏิบัติ', 'สรุป', 'ทบทวน' ห้ามใช้ประโยคบอกเล่าทื่อๆ หรือประโยคขอความช่วยเหลือลอยๆ ที่ไม่มีปี่ไม่มีขลุ่ย
2. Emoji ประจำเควสจะต้องตรงกับเนื้อหาภารกิจ 100% เช่น ถ้าเป็นเรื่องออกกำลังกายต้องใช้ 🏋️ หรือ 🏃, เรื่องเงินต้องใช้ 💵 หรือ 📈 หรือ 🛒, เรื่องคุยสื่อสารต้องใช้ 💬 หรือ 🧠, เรื่องคุมเวลาต้องใช้ ⏱️ หรือ 📵 ห้ามใช้ Emoji สุ่มที่ไม่เกี่ยวกับเนื้อหาเด็ดขาด (เช่น ห้ามมีแวมไพร์ หัวกะโหลก หรือปีศาจเด็ดขาด)
3. เควสทั้ง 3 ข้อต้อง "ห้ามมีความซ้ำซ้อนกันในเชิงเนื้อหา หัวข้อ แนวคิด หรือรูปแบบการปฏิบัติเด็ดขาด"
4. format แต่ละข้อ: emoji 1 ตัว + เว้นวรรค + ข้อความภาษาไทยสั้นกระชับ (ความยาวรวม 15-35 ตัวอักษร)
5. ห้ามพูดถึงการคุยกับ AI หรือการใช้แอปในตัวเควส
6. ตอบกลับในรูปแบบ JSON วัตถุ (JSON Object) ตามโครงสร้างด้านล่างนี้เท่านั้น ห้ามพิมพ์อธิบายใดๆ นอกเหนือจาก JSON:
{
  "challenge": "🎯 ข้อความเควส Challenge",
  "personality": "🧠 ข้อความเควส Personality",
  "finance": "🛒 ข้อความเควส Finance"
}
${wheelAvoidRule}

ตัวอย่างผลลัพธ์ (ห้ามลอกเลียนแบบตรงๆ):
{
  "challenge": "📵 งดโซเชียล 30 นาทีอยู่กับตัวเองเงียบๆ",
  "personality": "💬 ทักชื่นชมการทำงานของทีมงาน 1 คน",
  "finance": "🛒 ใช้กฎ 24 ชม. ก่อนซื้อของทุกชิ้น"
}`.trim();

    // Call DeepSeek once
    const rawResult = await callDeepSeek(combinedPrompt, 200);

    console.log("🤖 [API Quest Analysis] Raw DeepSeek output:", rawResult);

    let challengeRaw = '';
    let personalityRaw = '';
    let moneyRaw = '';

    try {
      const jsonMatch = rawResult.match(/\{[\s\S]*\}/);
      const parsedJson = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(rawResult);
      challengeRaw = parsedJson.challenge || '';
      personalityRaw = parsedJson.personality || '';
      moneyRaw = parsedJson.finance || parsedJson.money || '';
      console.log("🤖 [API Quest Analysis] Extracted fields:", { challengeRaw, personalityRaw, moneyRaw });
    } catch (e) {
      console.error("❌ [API Quest Analysis] Error parsing JSON from DeepSeek:", e, "Raw result was:", rawResult);
    }

    const questTitle = normalizeQuest(challengeRaw, '🎯');
    const discTitle = normalizeQuest(personalityRaw, '🧠');
    const moneyTitle = normalizeQuest(moneyRaw, '🛒');
    console.log("🤖 [API Quest Analysis] Normalized fields:", { questTitle, discTitle, moneyTitle });

    logAiCall(authResult.uid, "quest_analysis").catch(() => {});

    return NextResponse.json({
      questTitle,
      discTitle,
      moneyTitle,
    });

  } catch (err: any) {
    console.error("❌ [API Quest Analysis] Uncaught error in POST handler:", err);
    return NextResponse.json({ questTitle: null, discTitle: null, moneyTitle: null }, { status: 500 });
  }
}
