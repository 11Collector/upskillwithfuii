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
    const energyLevel = parsed.data.energyLevel || 'medium';

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
    const discType = userData.lastDisc?.finalResult?.charAt(0) || userData.lastDisc?.result?.charAt(0) || null;
    const wheelGoal = userData.lastWheel?.goal || null;
    const soulType = userData.lastLibrarySoul?.type || null;
    const ghostType = userData.lastGhostResult || null;
    const moneyKey = userData.lastMoney?.resultKey || 'MID_RISK_MID_DISC';

    // 3. ถ้าไม่มี preferences และมีข้อความน้อยเกินไป และไม่มีผลประเมินใดๆเลย → ไม่ทำ analysis
    const hasEnoughData = questPreferences || messages.length >= 5 || discType || wheelGoal || soulType || ghostType || userData.lastMoney;
    if (!hasEnoughData) {
      return NextResponse.json({ questTitle: null, discTitle: null, moneyTitle: null });
    }

    const chatSummary = messages.slice(0, 15).join('\n');

    const prefsSection = questPreferences
      ? `ความต้องการพิเศษของ user (ให้ความสำคัญสูงสุด):
- ด้านที่สนใจ: ${questPreferences.focus || 'ไม่ระบุ'}
- เรื่องค้างคา/เป้าหมาย: ${questPreferences.challenge || 'ไม่ระบุ'}
- ระยะเวลาที่ยอมรับ: ${questPreferences.duration || 'ไม่ระบุ'}
สร้าง Quest ให้ตรงกับความต้องการนี้โดยตรง\n`
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

1. เควสความท้าทายเฉพาะคุณ (Challenge):
- อิงตามความต้องการพิเศษ แชทล่าสุด หรือเป้าหมายของยูสเซอร์
- ต้องเป็นกิจกรรมการพัฒนาทักษะ การทำงาน หรือเป้าหมายชีวิตที่มีคุณค่าจริง ๆ
- ห้ามสร้างเควสที่ง่ายเกินไปหรือดูไร้สาระ (เช่น เดินไปเซเว่นโดยไม่เปิดแผนที่, การตื่นนอน, หรือการดื่มน้ำ)
- ใช้แนวทางระดับความยากและน้ำหนักจากคลังเควสต้นแบบ เช่น:
  * "📵 งดโซเชียล 30 นาทีแล้วอยู่กับตัวเองเงียบๆ"
  * "👹 จดเตรียมรับมืองานที่ยากที่สุดของพรุ่งนี้"
  * "⏱️ หาวิธีทำงานเดิมให้เร็วขึ้น 5 นาที"
  * "📋 สรุปบทเรียน 1 ข้อที่ได้จากวันนี้"

2. เควสพัฒนาบุคลิกภาพและการทำงานร่วมกับผู้อื่น (Personality):
- อิงตาม DISC (${discType || 'ไม่มี'}), MBTI (${soulType || 'ไม่มี'}), หรือ Ghost in You (${ghostType || 'ไม่มี'}) ของผู้ใช้
- ต้องเจาะลึกไปที่จุดแข็ง/จุดอ่อนของบุคลิกภาพนั้นโดยตรงเพื่อแก้ไขพฤติกรรมสุดโต่ง:
  - หากเป็นผู้ใช้กลุ่ม D/ENTJ: ฝึกฟังเพื่อนร่วมงานจนจบห้ามขัดจังหวะ หรือถามความเห็นคนอื่นก่อนตัดสินใจสรุปงาน
  - หากเป็นผู้ใช้กลุ่ม I/ENFP: ทำงานชิ้นเดียวเดี่ยว ๆ ห้ามสลับหน้าจอ (Single-tasking) 20 นาที หรือพิมพ์แชทสรุปสิ่งที่คุยทันที
  - หากเป็นผู้ใช้กลุ่ม S/ISFP: ปฏิเสธงานหรือคำชวนที่ขัดกับเป้าหมายหลักวันนี้ 1 เรื่อง หรือเสนอไอเดียเห็นต่างในห้องแชท
  - หากเป็นผู้ใช้กลุ่ม C/INTJ: กดส่งงานที่เสร็จ 90% โดยห้ามปรับแต่งความสวยงาม/แก้ไขฟอนต์ หรือเริ่มตัดสินใจจากข้อมูลสั้นๆ โดยไม่อ่านวิเคราะห์วนเวียน
- หลีกเลี่ยงเควสแนวอาสาสมัครทั่วไปที่ไม่ได้สะท้อนจุดอ่อนพฤติกรรมของผู้ใช้ (เช่น ช่วยคนแปลกหน้าถือของ)

3. เควสฝึกวินัยการเงินและการลงทุน (Finance):
- อิงตาม Money Avatar (${moneyKey}) ของผู้ใช้ ให้เข้ากับสถานการณ์ชีวิตของเขา
- ต้องเกี่ยวกับการเงิน การลงทุน การประหยัดค่าใช้จ่ายจริง ๆ เท่านั้น
- ห้ามนำหัวข้อที่ผู้ใช้แชทถึงแต่ไม่เกี่ยวกับการเงิน (เช่น การออกกำลังกาย, ฟิตเนส, การคุมอาหาร, การนอน) ไปผสมผสานเป็นหัวข้อในเควสการเงินเด็ดขาด เพื่อป้องกันไม่ให้เกิดความหมายที่ไม่มีอยู่จริงและอ่านแล้วแปลกประหลาด เช่น "หุ้นออกกำลังกาย", "กองทุนลดไขมัน", "เช็กสเตทเม้นต์แคลอรี่"
- ต้องเน้นการสร้างพฤติกรรมทางการเงินที่ดีและมีสาระตามคลังเควสต้นแบบ เช่น:
  * "🚫 เช็กประวัติการตัดเงินอัตโนมัติ 1 รายการว่ายังจำเป็นไหม"
  * "📝 ตั้งงบใช้จ่ายรายวันของวันนี้ และจดใส่ Note ไว้เตือนตัวเอง"
  * "📈 จดชื่อหุ้นหรือกองทุนที่สนใจมา 1 ชื่อเพื่อเปิดดูข้อมูลสั้นๆ"
  * "🛒 ย้ายของในรถเข็นช้อปปิ้งออนไลน์ออก 1 อย่าง (ชะลอการซื้อ)"
- หลีกเลี่ยงเควสที่ง่ายเกินไปและไม่มีนัยสำคัญ เช่น "โอนเงิน 50 บาทเข้าบัญชีออมทรัพย์" หรือ "มองเงิน 10 วินาที"

${prefsSection}
ข้อมูลบริบทผู้ใช้:
- Level: ${level}
- ประวัติการประเมิน: ${assessmentContext || 'ไม่มี'}
- แชทล่าสุดของ user:
${chatSummary || '(ยังไม่มีประวัติการสนทนา)'}

กติกาสำคัญที่สุด (กฎเหล็กป้องกันการซ้ำซ้อนและเพื่อความพรีเมียม):
1. ข้อความภาษาไทยของเควสทุกข้อต้องอ่านแล้วเป็นธรรมชาติ ดูเท่ มีพลังเหมือนในเกมระดับพรีเมียม ไม่อ่านแล้วรู้สึกฝืนหรือแปลกประหลาด
2. เควสทั้ง 3 ข้อต้อง "ห้ามมีความซ้ำซ้อนกันในเชิงเนื้อหา หัวข้อ แนวคิด หรือรูปแบบการปฏิบัติเด็ดขาด" ต้องแบ่งแยกมิติการเติบโตอย่างชัดเจน
3. ห้ามมีกิจกรรมประเภทเดียวกันซ้ำกันใน 4 เควสของวันนี้ (รวมเควส Wheel of Life ด้วย):
   - ห้ามมีเควสที่เกี่ยวกับการ "เขียน", "จดบันทึก", "ไดอารี่", "Note" เกิน 1 ข้อ
   - ห้ามมีเควสที่เกี่ยวกับการ "เช็กมือถือ", "งดหน้าจอ", "ปิดการแจ้งเตือน" เกิน 1 ข้อ
   - ห้ามมีเควสที่เกี่ยวกับการ "ขอบคุณ", "พูดดี", "ทักทาย" เกิน 1 ข้อ
   - ห้ามมีเควสที่เกี่ยวกับการ "วางแผน", "จัดโต๊ะ", "ทำความสะอาด" เกิน 1 ข้อ
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
  "personality": "🧛 ตั้งเวลาคุย 5 นาที ตัดบทให้จบแล้วสรุป",
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
